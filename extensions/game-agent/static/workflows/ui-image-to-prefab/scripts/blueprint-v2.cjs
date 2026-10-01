'use strict';

const { contextClient, digestJson, publishJson, readStdinJson, safeId } = require('./lib/runtime.cjs');
const { effectSourceRecoveredKeys } = require('./lib/audit-contract.cjs');

function color(value) {
    const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(value || ''));
    if (!match) return { r: 255, g: 255, b: 255, a: 255 };
    return {
        r: parseInt(match[1].slice(0, 2), 16), g: parseInt(match[1].slice(2, 4), 16),
        b: parseInt(match[1].slice(4, 6), 16), a: match[2] ? parseInt(match[2], 16) : 255,
    };
}

/** 将左上像素框转换为节点锚点的画布位置，父子必须使用各自锚点。 */
function anchorPosition(box, anchor, canvas) {
    return {
        x: box.x + box.width * anchor.x - canvas.width / 2,
        y: canvas.height / 2 - box.y - box.height * (1 - anchor.y),
    };
}

function widgetProperties(node, parentBox, canvas) {
    const box = node.box;
    const pins = node.pins || {};
    const origin = parentBox || { x: 0, y: 0, width: canvas.width, height: canvas.height };
    const localX = box.x - origin.x;
    const localY = box.y - origin.y;
    return {
        isAlignLeft: Boolean(pins.left), left: localX, isAbsoluteLeft: true,
        isAlignRight: Boolean(pins.right), right: origin.width - localX - box.width, isAbsoluteRight: true,
        isAlignTop: Boolean(pins.top), top: localY, isAbsoluteTop: true,
        isAlignBottom: Boolean(pins.bottom), bottom: origin.height - localY - box.height, isAbsoluteBottom: true,
        isAlignHorizontalCenter: Boolean(pins.centerX), horizontalCenter: localX + box.width / 2 - origin.width / 2,
        isAbsoluteHorizontalCenter: true,
        isAlignVerticalCenter: Boolean(pins.centerY), verticalCenter: origin.height / 2 - localY - box.height / 2,
        isAbsoluteVerticalCenter: true,
        alignMode: 'ON_WINDOW_RESIZE',
    };
}

function finiteBox(value, fallback) {
    if (!value || ['x', 'y', 'width', 'height'].some((key) => !Number.isFinite(Number(value[key])))) {
        return fallback;
    }
    const box = { x: Number(value.x), y: Number(value.y), width: Number(value.width), height: Number(value.height) };
    return box.width > 0 && box.height > 0 ? box : fallback;
}

function aggregateResultStatus({ fatalErrors = [], errors = [], warnings = [] }) {
    if (fatalErrors.length > 0) return 'fatal';
    if (errors.length > 0) return 'review_only';
    if (warnings.length > 0) return 'ready_with_warnings';
    return 'ready';
}

/**
 * 右上象限已作为唯一权威背景材质进入蓝图；Observation 再声明的静态背景 Sprite
 * 不能从左下 UI 象限重复裁切，否则会把整张 UI sheet 覆盖到真实背景之上。
 */
function backgroundAuthorityNodeIds(observation, canvas) {
    return new Set(observation.nodes.filter((node) => node.role === 'sprite'
        && node.sourceLayer === 'background' && node.visualStatus === 'visible').map((node) => node.id));
}

/**
 * requiredElements 表达的是验收语义，不是额外的整组位图。Observation 若把它再次
 * 生成为覆盖 HUD/菜单/导航的 ROI，必须保留其层级容器但移除重复 Sprite/Button；
 * 真实视觉仍由同层已拆分的可编辑子节点负责。
 */
function semanticRequirementRegionNodeIds(intent, observation) {
    const requiredNames = new Set((intent.requiredElements || [])
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean));
    const childCount = new Map();
    for (const node of observation.nodes) {
        if (!node.parentId) continue;
        childCount.set(node.parentId, (childCount.get(node.parentId) || 0) + 1);
    }
    return new Set(observation.nodes
        .filter((node) => requiredNames.has(String(node.name || '').trim()))
        .filter((node) => /^required(?:[-_]|$)/i.test(`${node.id} ${node.semanticKey}`)
            || /requiredElements/i.test(String(node.evidence || ''))
            || (node.extraction && node.extraction.groupPolicy === 'group'
                && (childCount.get(node.id) || 0) > 0))
        .map((node) => node.id));
}

function buildBlueprint(input) {
    const { intent, observation, extraction, prefabName } = input;
    const canvas = intent.canvas;
    const generationWarnings = input.generation && Array.isArray(input.generation.warnings)
        ? input.generation.warnings.filter((item) => typeof item === 'string').slice(0, 128)
        : [];
    const warnings = [...(observation.warnings || []), ...(extraction.warnings || []), ...generationWarnings];
    const recoveredSources = effectSourceRecoveredKeys(intent, observation, extraction);
    const errors = [...(observation.errors || []), ...(extraction.errors || [])]
        .filter((error) => !error.startsWith('UI_OBSERVATION_SOURCE_UNRESOLVED:') || !recoveredSources.has(error.split(':')[1]));
    const backgroundAuthorityNodes = backgroundAuthorityNodeIds(observation, canvas);
    const semanticRequirementRegions = semanticRequirementRegionNodeIds(intent, observation);
    const suppressedRasterKeys = new Set(observation.nodes
        .filter((item) => backgroundAuthorityNodes.has(item.id) || semanticRequirementRegions.has(item.id))
        .flatMap((item) => [item.id, item.semanticKey]));
    const usableCrops = extraction.crops.filter((item) => !suppressedRasterKeys.has(item.semanticKey));
    const crops = new Map(usableCrops.map((item) => [item.semanticKey, item]));
    const rasterGroups = usableCrops.filter((item) => Array.isArray(item.groupMembers));
    const groupedKeys = new Set(rasterGroups.flatMap((item) => item.groupMembers));
    const observedById = new Map(observation.nodes.map((item) => [item.id, item]));
    const layoutBoxById = new Map(observation.nodes.map((item) => {
        const crop = crops.get(item.semanticKey);
        const refined = extraction.nodeLayouts && extraction.nodeLayouts[item.id];
        if (refined) return [item.id, finiteBox(refined.targetBox, item.box)];
        const visual = ['sprite', 'button', 'artistic-text'].includes(item.role);
        return [item.id, visual ? finiteBox(crop && crop.targetBox, item.box) : item.box];
    }));
    const materials = [{
        logicalId: 'background', logicalPath: 'images/background.png',
        artifact: extraction.quadrants.background.artifact,
    }];
    for (const crop of usableCrops) {
        materials.push({
            logicalId: `element-${crop.semanticKey}`,
            logicalPath: `images/${safeId(crop.semanticKey, 'element')}.png`,
            artifact: crop.artifact,
        });
    }
    const nodes = [{
        id: 'ui-root', name: prefabName, parentId: null, siblingIndex: 0,
        transform: { x: 0, y: 0, width: canvas.width, height: canvas.height, scaleX: 1, scaleY: 1, rotation: 0 },
        anchor: { x: 0.5, y: 0.5 }, components: [], semanticKey: 'ui-root',
    }, {
        id: 'ui-background', name: 'Background', parentId: 'ui-root', siblingIndex: 0,
        transform: { x: 0, y: 0, width: canvas.width, height: canvas.height, scaleX: 1, scaleY: 1, rotation: 0 },
        anchor: { x: 0.5, y: 0.5 },
        components: [{ kind: 'sprite', properties: { materialLogicalId: 'background', spriteType: 'SIMPLE', trimMode: false } }],
        semanticKey: 'background',
    }];
    // Physical groups precede semantic content so editable Labels render above
    // their complete control artwork; contained icons never render twice.
    for (let index = 0; index < rasterGroups.length; index += 1) {
        const group = rasterGroups[index];
        const box = group.targetBox;
        const chains = group.groupMembers.map((key) => {
            const chain = [];
            let member = observation.nodes.find((item) => item.semanticKey === key);
            while (member && !chain.includes(member.id)) {
                chain.push(member.id);
                member = observedById.get(member.parentId);
            }
            return chain;
        });
        const parentId = chains.length ? chains[0].find((id) => chains.every((chain) => chain.includes(id))) || 'ui-root' : 'ui-root';
        const parent = observedById.get(parentId);
        const parentPosition = parent && parentId !== 'ui-root'
            ? anchorPosition(layoutBoxById.get(parentId), parent.anchor, canvas) : { x: 0, y: 0 };
        const world = anchorPosition(box, { x: 0.5, y: 0.5 }, canvas);
        const position = { x: world.x - parentPosition.x, y: world.y - parentPosition.y };
        nodes.push({
            id: `ui-${group.semanticKey}`, name: group.semanticKey, parentId, siblingIndex: parentId === 'ui-root' ? index + 1 : 0,
            transform: { ...position, width: box.width, height: box.height, scaleX: 1, scaleY: 1, rotation: 0 },
            anchor: { x: 0.5, y: 0.5 }, semanticKey: group.semanticKey,
            components: [{ kind: 'sprite', properties: { materialLogicalId: `element-${group.semanticKey}`, spriteType: 'SIMPLE', trimMode: false } }],
        });
    }
    for (const observed of observation.nodes) {
        if (observed.id === 'ui-root') continue;
        // 背景节点保留布局容器身份，其动态后代仍有合法 parent。
        const backgroundOnly = backgroundAuthorityNodes.has(observed.id);
        const semanticRequirementRegion = semanticRequirementRegions.has(observed.id);
        const parent = observedById.get(observed.parentId) || observedById.get('ui-root');
        const layoutBox = layoutBoxById.get(observed.id) || observed.box;
        const parentBox = parent && (layoutBoxById.get(parent.id) || parent.box);
        const world = anchorPosition(layoutBox, observed.anchor, canvas);
        const parentWorld = parent && parent.id !== 'ui-root'
            ? anchorPosition(parentBox, parent.anchor, canvas) : { x: 0, y: 0 };
        const components = [];
        const refined = extraction.nodeLayouts && extraction.nodeLayouts[observed.id];
        if (observed.role === 'label' && !semanticRequirementRegion) {
            components.push({ kind: 'label', properties: {
                text: observed.text,
                fontSize: refined && refined.fontSize || observed.labelStyle.fontSize,
                lineHeight: refined && refined.fontSize ? refined.fontSize * 1.15 : observed.labelStyle.lineHeight,
                color: color(observed.labelStyle.color),
                enableWrapText: observed.text.includes('\n'),
            } });
        } else if (observed.role !== 'container' && !semanticRequirementRegion && !backgroundOnly) {
            const crop = crops.get(observed.semanticKey);
            if (!crop && !groupedKeys.has(observed.semanticKey)) errors.push(`UI_BLUEPRINT_CROP_MISSING:${observed.semanticKey}`);
            else if (crop) components.push({ kind: 'sprite', properties: {
                materialLogicalId: `element-${observed.semanticKey}`,
                spriteType: 'SIMPLE', trimMode: false,
            } });
            if (observed.role === 'button') components.push({ kind: 'button', properties: {
                transition: 'COLOR', interactable: true,
            } });
        }
        if (Object.values(observed.pins || {}).some(Boolean)) {
            components.push({
                kind: 'widget',
                properties: widgetProperties({ ...observed, box: layoutBox }, parent && parent.id !== 'ui-root' ? parentBox : null, canvas),
            });
        }
        nodes.push({
            id: observed.id, name: observed.name, parentId: observed.parentId || 'ui-root',
            siblingIndex: Math.max(1, observed.siblingIndex + 1) + (observed.parentId === 'ui-root' ? rasterGroups.length : 0),
            transform: {
                x: world.x - parentWorld.x, y: world.y - parentWorld.y,
                width: layoutBox.width, height: layoutBox.height,
                scaleX: 1, scaleY: 1, rotation: 0,
            },
            anchor: observed.anchor, components, semanticKey: observed.semanticKey,
        });
    }
    const childrenByParent = new Map();
    for (const node of nodes) {
        if (node.parentId === null) continue;
        const children = childrenByParent.get(node.parentId) || [];
        children.push(node);
        childrenByParent.set(node.parentId, children);
    }
    for (const children of childrenByParent.values()) {
        children.sort((left, right) => left.siblingIndex - right.siblingIndex || left.id.localeCompare(right.id));
        children.forEach((node, index) => { node.siblingIndex = index; });
    }
    const dedupedErrors = [...new Set(errors)];
    const dedupedWarnings = [...new Set(warnings)];
    const fatalErrors = [...new Set(Array.isArray(extraction.fatalErrors) ? extraction.fatalErrors : [])];
    const statusErrors = input.extractionStatus === 'review_only'
        ? [...new Set(dedupedErrors.concat('UI_EXTRACTION_REVIEW_ONLY'))]
        : dedupedErrors;
    const status = aggregateResultStatus({
        fatalErrors,
        errors: statusErrors,
        warnings: dedupedWarnings,
    });
    const blueprint = {
        schema: 'game-agent.ui-prefab-blueprint/v2', schemaVersion: 2,
        compilerProfile: 'creator-3.8-prefab-json-v2', rootId: 'ui-root', canvas,
        materials, nodes,
        sources: {
            intentDigest: input.intentArtifact.digest,
            observationDigest: input.observationArtifact.digest,
            extractionDigest: input.manifestArtifact.digest,
        },
    };
    const quality = {
        schema: 'game-agent.ui-publication-facts/v2', schemaVersion: 2, status,
        passed: status === 'ready' || status === 'ready_with_warnings',
        facts: {
            semanticNodeCount: observation.nodes.length,
            blueprintNodeCount: nodes.length,
            cropCount: usableCrops.length,
            labelCount: observation.nodes.filter((item) => item.role === 'label').length,
            buttonCount: observation.nodes.filter((item) => item.role === 'button').length,
        },
        warnings: dedupedWarnings, errors: fatalErrors.concat(statusErrors),
        warningDigest: digestJson(dedupedWarnings),
        generation: extraction.generation || {
            providerId: String(input.generation && input.generation.providerId || '').slice(0, 128),
            modelId: String(input.generation && input.generation.modelId || '').slice(0, 160),
            capabilityVersion: String(input.generation && input.generation.capabilityVersion || '').slice(0, 160),
            requestedCount: Number(input.generation && input.generation.requestedCount || 0),
            actualCount: Number(input.generation && input.generation.actualCount || 0),
            completionStatus: String(input.generation && input.generation.completionStatus || '').slice(0, 32),
            requestProfile: input.generation && input.generation.requestProfile || { referenceMode: 'none' },
            referenceRequested: Boolean(input.referenceUiImageAttached),
            warnings: generationWarnings,
        },
    };
    return { blueprint, blueprintDigest: digestJson(blueprint), quality, status, publicationAllowed: quality.passed };
}

function buildReviewManifest(input, result, blueprintArtifact, qualityArtifact) {
    const extraction = input.extraction;
    const quadrants = extraction.quadrants || {};
    const quadrantItems = [extraction.source
        ? { id: 'composite', label: 'original composite', role: 'ui-four-quadrant-composite', artifact: extraction.source }
        : null].concat(['effect', 'background', 'ui', 'text'].flatMap((name) =>
        quadrants[name] && quadrants[name].artifact
            ? [{ id: name, label: name, role: `ui-${name}`, artifact: quadrants[name].artifact }]
            : [])).filter(Boolean);
    const diagnosticItems = [
        extraction.separatorOverlayArtifact
            ? { id: 'separator', label: 'separator overlay', role: 'ui-separator-overlay', artifact: extraction.separatorOverlayArtifact }
            : null,
        extraction.previewArtifact
            ? { id: 'preview', label: 'layer alignment preview', role: 'ui-deterministic-preview', artifact: extraction.previewArtifact }
            : null,
    ].filter(Boolean);
    const cropItems = (extraction.crops || []).map((item) => ({
        id: item.semanticKey, label: item.semanticKey, role: item.role, artifact: item.artifact,
    }));
    return {
        schema: 'game-agent.workflow-artifact-review-manifest/v1', schemaVersion: 1,
        title: 'UI 四象限、结构树与 Prefab 发布事实',
        pages: [
            { id: 'quadrants', title: '四象限', kind: 'image', items: quadrantItems },
            { id: 'diagnostics', title: '分隔线与重建', kind: 'overlay', items: diagnosticItems },
            { id: 'crops', title: 'UI 元素切图', kind: 'alpha', items: cropItems },
            { id: 'structure', title: 'UI 树与发布事实', kind: 'hierarchy', items: [
                { id: 'blueprint', label: 'Prefab Blueprint V2', role: 'ui-prefab-blueprint', artifact: blueprintArtifact },
                { id: 'publication-facts', label: '结构发布事实', role: 'ui-publication-facts', artifact: qualityArtifact },
                { id: 'observation', label: 'UI Observation Tree V2', role: 'ui-observation-tree', artifact: input.observationArtifact },
            ] },
        ],
        metrics: Object.entries(result.quality.facts).map(([name, value]) => ({ name, value, passed: true })),
        hardFailures: result.quality.errors.map((code) => ({ code: code.split(':', 1)[0], message: code })),
    };
}

async function main() {
    const input = await readStdinJson();
    const result = buildBlueprint(input);
    const source = [input.intentArtifact, input.observationArtifact, input.manifestArtifact, input.reviewArtifact];
    const client = contextClient();
    const blueprintArtifact = await publishJson(client, result.blueprint, 'game-agent.ui-prefab-blueprint/v2', source, input.retentionDays);
    const qualityArtifact = await publishJson(client, result.quality, 'game-agent.ui-publication-facts/v2', source.concat(blueprintArtifact), input.retentionDays);
    const reviewArtifact = await publishJson(
        client,
        buildReviewManifest(input, result, blueprintArtifact, qualityArtifact),
        'game-agent.workflow-artifact-review-manifest/v1',
        source.concat(blueprintArtifact, qualityArtifact),
        input.retentionDays,
    );
    process.stdout.write(JSON.stringify({
        ...result, blueprintArtifact, qualityArtifact, reviewArtifact,
    }));
}

if (require.main === module) main().catch((error) => {
    process.stderr.write(String(error && error.message || error));
    process.exitCode = 1;
});

module.exports = {
    aggregateResultStatus,
    backgroundAuthorityNodeIds,
    buildBlueprint,
    buildReviewManifest,
    finiteBox,
    semanticRequirementRegionNodeIds,
    widgetProperties,
};
