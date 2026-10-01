'use strict';

const { contextClient, publishJson, readStdinJson } = require('./lib/runtime.cjs');
const { isUserRequiredSemantic, validateLayerAudit, effectSourceRecoveredKeys } = require('./lib/audit-contract.cjs');

const ALPHA_REASONS = new Set(['BACKGROUND_MULTIMODAL', 'BACKGROUND_PATTERNED', 'SUSPICIOUS_SOURCE_ALPHA',
    'INSUFFICIENT_BACKGROUND_SAMPLES', 'BACKGROUND_NOT_STABLE', 'KEY_COLOR_USAGE_UNCONFIRMED', 'EMPTY_NOT_ALLOWED']);

/** 提取器的恢复框必须仍接近效果图的已确认几何，不能用任意新位置宣称已修复。 */
function recoveredBoxMatches(box, target, canvas) {
    const valid = (value) => value && ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(value[key]))
        && value.x >= 0 && value.y >= 0 && value.width > 1 && value.height > 1
        && value.x + value.width <= canvas.width && value.y + value.height <= canvas.height;
    return valid(box) && valid(target) && [['x', 'width'], ['y', 'height']].every(([position, size]) =>
        box[size] >= target[size] * 0.8 && box[size] <= target[size] * 1.25
        && Math.abs(box[position] + box[size] / 2 - target[position] - target[size] / 2)
            <= Math.max(canvas[size] * 0.02, target[size] * 0.1));
}

/** 校验已登记提取器的实际消费计划；普通 Label 不依赖辅助文字层的栅格像素。 */
function reconstructionEvidence(intent, observation, manifest) {
    const effectSources = effectSourceRecoveredKeys(intent, observation, manifest);
    const empty = { native: new Set(), isolated: new Set(), unused: new Set(), effectSources };
    const plan = manifest.reconstruction;
    if (plan?.version !== 1
        || !Array.isArray(plan.nativeLabels) || !Array.isArray(plan.isolatedText) || !Array.isArray(plan.rasterLayers)) return empty;
    const rasterLayers = [...new Set(observation.nodes.filter((node) => ['sprite', 'button', 'artistic-text'].includes(node.role)
        && ['ui', 'text'].includes(node.sourceLayer) && !effectSources.has(node.semanticKey)).map((node) => node.sourceLayer))].sort();
    if (JSON.stringify(rasterLayers) !== JSON.stringify(plan.rasterLayers)) return empty;
    const unused = new Set(['ui', 'text'].filter((name) => !rasterLayers.includes(name)));
    const native = new Set();
    for (const item of plan.nativeLabels) {
        const node = observation.nodes.find((node) => node.id === item.nodeId && node.semanticKey === item.semanticKey);
        const semantic = intent.elements.find((semantic) => semantic.semanticKey === item.semanticKey);
        const layout = manifest.nodeLayouts?.[item.nodeId];
        if (item.method !== 'native-label-from-effect' || !node || node.role !== 'label' || semantic?.role !== 'label'
            || node.visualStatus !== 'visible' || !node.text || node.text !== semantic.text
            || !observation.layerAudit?.effectVisibleLabels?.includes(item.semanticKey)
            || !recoveredBoxMatches(item.targetBox, node.box, intent.canvas)
            || !['x', 'y', 'width', 'height'].every((key) => layout?.targetBox?.[key] === item.targetBox[key])
            || native.has(item.semanticKey)) return { ...empty, unused };
        native.add(item.semanticKey);
    }
    const isolated = new Set(plan.isolatedText.filter((item) => native.has(item.semanticKey)
        && item.method === 'isolated-ordinary-text-components' && Number.isInteger(item.componentCount) && item.componentCount > 0
        && Number.isInteger(item.removedPixels) && item.removedPixels > 0
        && observation.layerAudit?.issues?.some((issue) => issue.code === 'ordinary-in-ui' && issue.quadrant === 'ui'
            && issue.semanticKey === item.semanticKey
            && ['x', 'y', 'width', 'height'].every((key) => issue.region?.[key] === item.sourceRegion?.[key])))
        .map((item) => item.semanticKey));
    return { native, isolated, unused, effectSources };
}

/** 组合图片的恢复范围对应成员整体，按钮自身的交互框仍由蓝图独立保留。 */
function cropTargetAuthority(crop, member, observation, canvas) {
    if (!Array.isArray(crop.groupMembers) || crop.groupMembers.length <= 1) return member.box;
    if (new Set(crop.groupMembers).size !== crop.groupMembers.length) return null;
    const members = crop.groupMembers.map((key) => observation.nodes.filter((node) => node.semanticKey === key));
    if (members.some((matches) => matches.length !== 1)) return null;
    const nodes = members.map((matches) => matches[0]);
    if (nodes.some((node) => node.visualStatus !== 'visible' || node.sourceLayer !== member.sourceLayer
        || !['sprite', 'button', 'artistic-text'].includes(node.role) || !node.sourceBox
        || !recoveredBoxMatches(node.box, node.box, canvas))) return null;
    const x = Math.min(...nodes.map((node) => node.box.x));
    const y = Math.min(...nodes.map((node) => node.box.y));
    return { x, y, width: Math.max(...nodes.map((node) => node.box.x + node.box.width)) - x,
        height: Math.max(...nodes.map((node) => node.box.y + node.box.height)) - y };
}

/** 只消解已排除或由原生组件重建的像素问题；原图违约继续留在审计中。 */
function reconstructedIssue(issue, evidence) {
    if (issue.code === 'source-missing') return evidence.effectSources.has(issue.semanticKey);
    if (evidence.unused.has(issue.quadrant) && ['alpha-invalid', 'graphics-in-text', 'art-in-text', 'unplanned-text'].includes(issue.code)) return true;
    if (issue.quadrant === 'text' && ['ordinary-missing', 'layer-misaligned'].includes(issue.code)) return evidence.native.has(issue.semanticKey);
    return issue.quadrant === 'ui' && ['ordinary-in-ui', 'layer-misaligned'].includes(issue.code) && evidence.isolated.has(issue.semanticKey);
}

/** 只有已登记提取器的唯一像素映射可消解原图层偏移，保留原图和审计作为告警证据。 */
function hasRecoveredAlignment(issue, intent, observation, extraction) {
    if (issue.code !== 'layer-misaligned' || !['ready', 'ready_with_warnings'].includes(extraction.status)
        || extraction.manifest.errors?.length || extraction.manifest.integrity?.errors?.length) return false;
    const node = observation.nodes.find((item) => item.semanticKey === issue.semanticKey);
    if (!node || node.visualStatus !== 'visible') return false;
    const manifest = extraction.manifest;
    const cropFor = (member) => {
        const crops = (manifest.crops || []).filter((crop) => crop.semanticKey === member.semanticKey
            || crop.groupMembers?.includes(member.semanticKey));
        const crop = crops.length === 1 ? crops[0] : null;
        return crop && crop.alignment?.method === 'local-alpha-template'
            && Number.isFinite(crop.alignment.meanClippedColorError) && crop.alignment.meanClippedColorError >= 0
            && crop.alignment.meanClippedColorError <= 20
            && recoveredBoxMatches(crop.targetBox, cropTargetAuthority(crop, member, observation, intent.canvas), intent.canvas) ? crop : null;
    };
    if (issue.quadrant === 'ui') return node.sourceLayer === 'ui' && !!node.sourceBox && !!cropFor(node);
    if (node.role !== 'label' || node.sourceLayer !== 'text' || !node.sourceBox) return false;
    const layout = manifest.nodeLayouts?.[node.id];
    if (!layout || !recoveredBoxMatches(layout.targetBox, node.box, intent.canvas)) return false;
    if (layout.method === 'local-glyph-template') return Number.isFinite(layout.correlation) && layout.correlation >= 0.8 && layout.correlation <= 1;
    if (layout.method !== 'button-relative-caption') return false;
    const parent = observation.nodes.find((item) => item.id === node.parentId && item.role === 'button');
    const crop = parent && cropFor(parent);
    const parentLayout = parent && manifest.nodeLayouts?.[parent.id];
    return !!crop && parentLayout?.method === 'caption-parent-region' && parentLayout.groupSemanticKey === crop.semanticKey
        && ['x', 'y', 'width', 'height'].every((key) => parentLayout.targetBox?.[key] === crop.targetBox[key])
        && layout.targetBox.x >= crop.targetBox.x && layout.targetBox.y >= crop.targetBox.y
        && layout.targetBox.x + layout.targetBox.width <= crop.targetBox.x + crop.targetBox.width
        && layout.targetBox.y + layout.targetBox.height <= crop.targetBox.y + crop.targetBox.height;
}

/** 仅对有真实几何证据的可选装饰小偏移降级，不按模型自由文本猜测严重性。 */
function minorAlignmentArea(issue, intent, observation) {
    if (issue.code !== 'layer-misaligned' || issue.quadrant !== 'ui') return 0;
    const semantic = intent.elements.find((item) => item.semanticKey === issue.semanticKey);
    const node = observation.nodes.find((item) => item.semanticKey === issue.semanticKey);
    if (!semantic || semantic.role !== 'sprite' || semantic.interactive === true || isUserRequiredSemantic(intent, semantic)
        || !node || node.interactive === true || node.visualStatus !== 'visible' || node.sourceLayer !== 'ui') return 0;
    const valid = (box) => box && ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(box[key]))
        && box.x >= 0 && box.y >= 0 && box.width > 1 && box.height > 1
        && box.x + box.width <= intent.canvas.width && box.y + box.height <= intent.canvas.height;
    const target = node.box;
    const source = node.sourceBox;
    if (!valid(target) || !valid(source)) return 0;
    const positionLimit = Math.min(Math.min(intent.canvas.width, intent.canvas.height) * 0.01,
        Math.min(target.width, target.height) * 0.05);
    return Math.abs(source.x - target.x) <= positionLimit && Math.abs(source.y - target.y) <= positionLimit
        && Math.abs(source.width - target.width) <= target.width * 0.05
        && Math.abs(source.height - target.height) <= target.height * 0.05 ? target.width * target.height : 0;
}

/** 公共候选仍保留 review_required；这里只验证已登记提取器的实际像素消费证据。 */
function usableCandidateLayer(manifest, quadrant) {
    if (manifest.reconstruction?.publicationPolicy !== 'prefab-usability-v1') return false;
    const proof = manifest.reconstruction.candidateLayers?.[quadrant];
    const processing = manifest.imageProcessing?.[quadrant];
    if (!proof || processing?.status !== 'review_required'
        || JSON.stringify(processing.summary?.reasons) !== JSON.stringify(['FOREGROUND_ESTIMATE_UNCERTAIN'])
        || proof.method !== 'retained-solid-background-candidate'
        || !/^[a-f0-9]{64}$/.test(proof.candidateDigest) || !/^[a-f0-9]{64}$/.test(proof.reportDigest)
        || proof.candidateDigest !== processing.candidateImage?.digest || proof.reportDigest !== processing.report?.digest
        || !['sourceBodyPixels', 'retainedBodyPixels', 'corePixels', 'backgroundPixels', 'clearBackgroundPixels']
            .every((key) => Number.isSafeInteger(proof[key]) && proof[key] >= 0)) return false;
    return proof.sourceBodyPixels >= 32 && proof.backgroundPixels >= 32
        && proof.retainedBodyPixels >= proof.sourceBodyPixels * .95 && proof.retainedBodyPixels <= proof.sourceBodyPixels
        && proof.corePixels >= proof.sourceBodyPixels * .5 && proof.corePixels <= proof.retainedBodyPixels
        && proof.clearBackgroundPixels >= proof.backgroundPixels * .95 && proof.clearBackgroundPixels <= proof.backgroundPixels;
}

/** 中间排版问题只要已有有效素材和成品目标，就不再触发整图重生。 */
function usableIntermediateIssue(issue, intent, observation, extraction) {
    const manifest = extraction.manifest;
    if (manifest.reconstruction?.publicationPolicy !== 'prefab-usability-v1'
        || !['ready', 'ready_with_warnings'].includes(extraction.status)
        || manifest.errors?.length || manifest.integrity?.errors?.length) return false;
    if (issue.code === 'unplanned-text') return true;
    if (issue.code === 'alpha-invalid') return usableCandidateLayer(manifest, issue.quadrant);
    if (issue.code !== 'layer-misaligned') return false;
    const node = observation.nodes.find((item) => item.semanticKey === issue.semanticKey && item.visualStatus === 'visible');
    if (!node || node.sourceLayer !== issue.quadrant || !['sprite', 'button', 'artistic-text'].includes(node.role) || !node.sourceBox) return false;
    const crops = (manifest.crops || []).filter((crop) => crop.semanticKey === node.semanticKey || crop.groupMembers?.includes(node.semanticKey));
    if (crops.length !== 1) return false;
    const crop = crops[0];
    const authority = cropTargetAuthority(crop, node, observation, intent.canvas);
    return !!authority && recoveredBoxMatches(crop.targetBox, authority, intent.canvas)
        && crop.artifact?.mediaType === 'image/png' && /^[a-f0-9]{64}$/.test(crop.artifact.digest)
        && crop.sourceBox?.width > 1 && crop.sourceBox?.height > 1;
}

/** 汇总已登记提取器的像素报告与观察审计，不根据自由文本猜测付费重试原因。 */
function validateQuality(input) {
    const extraction = input.extraction;
    const manifest = extraction.manifest;
    const observation = input.observation;
    const intent = input.intent;
    const issues = [];
    let unknown = false;
    const sourceDigest = manifest.source.digest;
    const audit = observation.layerAudit;
    const reconstructed = reconstructionEvidence(intent, observation, manifest);
    const auditIncomplete = !audit || audit.status !== 'complete';
    if (!audit) unknown = true;
    for (const quadrant of ['ui', 'text']) {
        const processing = manifest.imageProcessing && manifest.imageProcessing[quadrant];
        if (!processing || processing.status !== 'ready') {
            if (usableCandidateLayer(manifest, quadrant)) continue;
            const reasons = processing && processing.summary && processing.summary.reasons;
            if (processing?.status === 'review_required' && reconstructed.unused.has(quadrant)
                || Array.isArray(reasons) && reasons.length && reasons.every((reason) => ALPHA_REASONS.has(reason))) {
                issues.push({ code: 'alpha-invalid', quadrant });
            } else unknown = true;
        }
    }
    const elements = new Map(intent.elements.map((item) => [item.semanticKey, item]));
    const validatedAudit = validateLayerAudit(intent, observation);
    issues.push(...validatedAudit.issues);
    if (validatedAudit.invalid) unknown = true;
    // Structural/IO/crop failures cannot be cured by paying for a different image.
    const errors = [...(manifest.errors || [])];
    const confirmedMissing = new Set(issues.filter((issue) => issue.code === 'required-missing').map((issue) => issue.semanticKey));
    const confirmedSourceMissing = new Set(issues.filter((issue) => issue.code === 'source-missing').map((issue) => issue.semanticKey));
    const missingCodes = new Set(['UI_OBSERVATION_VISUAL_UNRESOLVED', 'UI_OBSERVATION_SOURCE_UNRESOLVED', 'UI_OBSERVATION_REQUIRED_NODE_MISSING', 'UI_SEMANTIC_SOURCE_UNRESOLVED']);
    if (errors.some((error) => {
        const split = error.indexOf(':');
        if (['UI_OBSERVATION_SOURCE_UNRESOLVED', 'UI_SEMANTIC_SOURCE_UNRESOLVED'].includes(error.slice(0, split))
            && confirmedSourceMissing.has(error.slice(split + 1))) return false;
        if (error.startsWith('UI_OBSERVATION_EXACT_TEXT_MISSING:')) {
            const text = error.slice(split + 1);
            return ![...confirmedMissing].some((key) => elements.get(key)?.text === text && intent.exactTexts.includes(text));
        }
        return split < 0 || !missingCodes.has(error.slice(0, split)) || !confirmedMissing.has(error.slice(split + 1));
    })) unknown = true;
    const unique = [...new Map(issues.map((issue) => [JSON.stringify(issue), issue])).values()];
    const restored = new Set(unique.filter((issue) => reconstructedIssue(issue, reconstructed)));
    const recovered = new Set(unique.filter((issue) => hasRecoveredAlignment(issue, intent, observation, extraction)));
    const minor = unique.map((issue) => ({ issue, area: minorAlignmentArea(issue, intent, observation) }))
        .filter((item) => item.area > 0);
    const tolerated = minor.length <= 2 && minor.reduce((sum, item) => sum + item.area, 0) <= intent.canvas.width * intent.canvas.height * 0.1
        ? new Set(minor.map((item) => item.issue)) : new Set();
    const usable = new Set(unique.filter((issue) => usableIntermediateIssue(issue, intent, observation, extraction)));
    const blocking = unique.filter((issue) => !recovered.has(issue) && !tolerated.has(issue) && !restored.has(issue) && !usable.has(issue));
    const warnings = [...new Set([...(extraction.warnings || []),
        ...(auditIncomplete ? ['UI_IMAGE_QUALITY_AUDIT_INCOMPLETE'] : []),
        ...[...restored].map((issue) => `UI_RECONSTRUCTION_RECOVERED:${issue.code}:${issue.quadrant}:${issue.semanticKey || 'layer'}`),
        ...[...recovered].map((issue) => `UI_IMAGE_QUALITY_ALIGNMENT_RECOVERED:${issue.semanticKey}`),
        ...[...usable].map((issue) => `UI_PREFAB_USABILITY_WARNING:${issue.code}:${issue.quadrant}:${issue.semanticKey || 'layer'}`),
        ...[...tolerated].map((issue) => `UI_IMAGE_QUALITY_MINOR_ALIGNMENT:${issue.semanticKey}`)])];
    // 审计覆盖不完整不抹掉已验证的问题；非法证据和本地故障仍不可生图重试。
    const verdict = unknown ? 'reject' : blocking.length ? 'retry'
        : extraction.status === 'review_only' ? 'reject' : 'accept';
    const qualityErrors = blocking.map((issue) => `UI_IMAGE_QUALITY:${issue.code}:${issue.quadrant}${issue.semanticKey ? ':' + issue.semanticKey : ''}`);
    if (unknown) qualityErrors.push('UI_IMAGE_QUALITY_UNCERTAIN');
    const status = verdict === 'accept' ? warnings.length ? 'ready_with_warnings' : extraction.status : 'review_only';
    return {
        ...extraction,
        manifest: { ...manifest, status, warnings: [...new Set([...(manifest.warnings || []), ...warnings])], errors: [...new Set([...errors, ...qualityErrors])],
            imageQuality: { version: '1', verdict, sourceDigest, issues: blocking } },
        status, warnings, publicationAllowed: verdict === 'accept',
        qualityRecovery: { version: '1', verdict, sourceDigest, issues: blocking },
    };
}

/** 保存本轮完整质量报告，原始提取报告及图片继续保留。 */
async function main() {
    const input = await readStdinJson();
    const result = validateQuality(input);
    const client = contextClient();
    result.manifestArtifact = await publishJson(client, result.manifest, 'game-agent.ui-quadrant-extraction-manifest/v2',
        [input.extraction.manifestArtifact, input.observationArtifact], input.retentionDays);
    result.reviewArtifact = await publishJson(client, {
        schema: 'game-agent.workflow-artifact-review-manifest/v1', schemaVersion: 1, title: 'UI 图片质量校验',
        pages: [{ id: 'quality', title: '本轮原图与质量证据', kind: 'image', items: [
            { id: 'composite', label: '四象限原图', role: 'source', artifact: result.manifest.source },
            { id: 'quality-report', label: '质量报告', role: 'report', artifact: result.manifestArtifact },
            { id: 'extraction', label: '原提取报告', role: 'report', artifact: input.extraction.manifestArtifact },
        ] }], metrics: [], hardFailures: result.manifest.errors.map((code) => ({ code: code.split(':')[0], message: code })),
    }, 'game-agent.workflow-artifact-review-manifest/v1', [result.manifestArtifact, input.extraction.reviewArtifact], input.retentionDays);
    process.stdout.write(JSON.stringify(result));
}

if (require.main === module) main().catch((error) => { process.stderr.write(String(error && error.message || error)); process.exitCode = 1; });
module.exports = { validateQuality };
