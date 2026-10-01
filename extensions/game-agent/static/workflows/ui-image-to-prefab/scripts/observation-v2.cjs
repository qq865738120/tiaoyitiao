'use strict';

const { contextClient, publishJson, readStdinJson, safeId } = require('./lib/runtime.cjs');
const { isUserRequiredSemantic, validateLayerAudit } = require('./lib/audit-contract.cjs');

/** 使用有限数值或确定性回退。 */
function finite(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

/** 只读取正式坐标的自有属性，附加字段不参与计算。 */
function ownBoxValue(box, key) {
    return box && Object.prototype.hasOwnProperty.call(box, key) ? box[key] : undefined;
}

/** 将已通过草稿 Schema 的坐标限制到画布范围。 */
function clampBox(box, canvas) {
    const x = Math.max(0, Math.min(canvas.width - 1, finite(ownBoxValue(box, 'x'), 0)));
    const y = Math.max(0, Math.min(canvas.height - 1, finite(ownBoxValue(box, 'y'), 0)));
    const width = Math.max(1, Math.min(canvas.width - x, finite(ownBoxValue(box, 'width'), canvas.width)));
    const height = Math.max(1, Math.min(canvas.height - y, finite(ownBoxValue(box, 'height'), canvas.height)));
    return { x, y, width, height };
}

/** 验证视觉框，不用钳制后的合法形状掩盖损坏或占位坐标。 */
function validVisualBox(box, canvas) {
    return box && ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(ownBoxValue(box, key)))
        && box.x >= 0 && box.y >= 0 && box.width > 0 && box.height > 0
        && box.x + box.width <= canvas.width && box.y + box.height <= canvas.height
        && !(box.width <= 1 && box.height <= 1);
}

/** 源 ROI 可包含少量画布外空白；保留真实交集，不能把远离图像的框变成占位裁片。 */
function boundedSourceBox(box, canvas) {
    if (validVisualBox(box, canvas)) return box;
    if (!box || !['x', 'y', 'width', 'height'].every((key) => Number.isFinite(ownBoxValue(box, key)))
        || box.width <= 0 || box.height <= 0) return null;
    const x = Math.max(0, box.x);
    const y = Math.max(0, box.y);
    const width = Math.min(canvas.width, box.x + box.width) - x;
    const height = Math.min(canvas.height, box.y + box.height) - y;
    const clipped = { x, y, width, height };
    return validVisualBox(clipped, canvas)
        && width >= box.width * 0.8 && height >= box.height * 0.8
        && box.width - width <= canvas.width * 0.05
        && box.height - height <= canvas.height * 0.05 ? clipped : null;
}

/** Only closed structural reasons may request another observation; never copy model values. */
function recoveryVerdict(errors) {
    const reasons = {
        UI_OBSERVATION_DUPLICATE_ID: 'duplicate-id',
        UI_OBSERVATION_ROOT_INVALID: 'root-invalid',
        UI_OBSERVATION_PARENT_INVALID: 'parent-invalid',
        UI_OBSERVATION_CYCLE: 'cycle',
        UI_OBSERVATION_BOX_INVALID: 'box-invalid',
        UI_OBSERVATION_AUDIT_INVALID: 'schema-invalid',
        UI_OBSERVATION_SOURCE_LAYER_INVALID: 'schema-invalid',
        UI_OBSERVATION_UNDECLARED_NODE_UNRESOLVED: 'schema-invalid',
    };
    const codes = errors.map((error) => String(error).split(':', 1)[0]);
    const retry = codes.length > 0 && codes.every((code) => Object.prototype.hasOwnProperty.call(reasons, code));
    return { version: '1', verdict: codes.length === 0 ? 'accept' : retry ? 'retry' : 'reject',
        issues: retry ? [...new Set(codes.map((code) => reasons[code]))].slice(0, 8) : [] };
}

/** 将合法 Intent 文字的可见证据补回草稿状态，不推断缺失文字。 */
function isVisibleIntentLabel(intent, draft, item, semanticKey, semantic) {
    return semantic && semantic.role === 'label' && semantic.text
            && draft.layerAudit && draft.layerAudit.effectVisibleLabels.includes(semanticKey)
            && validVisualBox(item.box, intent.canvas) && item.labelStyle
            && Number.isFinite(item.labelStyle.fontSize) && item.labelStyle.fontSize > 0
            && Number.isFinite(item.labelStyle.lineHeight) && item.labelStyle.lineHeight > 0
            && /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(item.labelStyle.color);
}

/** 只有具备可见性、源像素及证据的额外节点可以进入正式树。 */
function isAddedVisibleNode(intent, item, semantic, visualStatus, sourceLayer) {
    return !semantic && visualStatus === 'visible'
            && ['container', 'sprite', 'button'].includes(item.role)
            && (item.role === 'container' || boundedSourceBox(item.sourceBox, intent.canvas)
                && (sourceLayer === 'ui' || item.role === 'sprite' && sourceLayer === 'background'))
            && typeof item.evidence === 'string' && item.evidence.trim().length > 0;
}

/** 复核正式节点的源层、源框与可见几何，并按原顺序记录问题。 */
function validateObservedNodeSource(state, item, semanticKey, role, visualStatus, sourceLayer, authoritativeText) {
    const { intent, warnings, errors } = state;
    const raster = ['sprite', 'button', 'artistic-text'].includes(role);
    if (visualStatus !== 'visible') errors.push(`UI_OBSERVATION_VISUAL_UNRESOLVED:${semanticKey}`);
    // 不可见内容无可测框；VISUAL_UNRESOLVED 已阻止发布，不能把真实缺失错归为坏几何。
    if (visualStatus === 'visible' && !validVisualBox(item.box, intent.canvas)) errors.push(`UI_OBSERVATION_BOX_INVALID:${semanticKey}`);
    const misplacedArtText = role === 'artistic-text' && sourceLayer === 'text';
    const sourceBox = boundedSourceBox(item.sourceBox, intent.canvas);
    if (sourceBox && sourceBox !== item.sourceBox) warnings.push(`UI_OBSERVATION_SOURCE_EDGE_CLIPPED:${semanticKey}`);
    if (misplacedArtText) warnings.push(`UI_ART_TEXT_SOURCE_LAYER_RECOVERED:${semanticKey}`);
    if (raster && sourceLayer !== 'background' && ((!misplacedArtText && sourceLayer !== 'ui') || !sourceBox)) {
        errors.push(`${visualStatus === 'visible' && sourceBox && sourceLayer === 'text'
            ? 'UI_OBSERVATION_SOURCE_LAYER_INVALID' : 'UI_OBSERVATION_SOURCE_UNRESOLVED'}:${semanticKey}`);
    }
    if (role === 'label' && sourceLayer !== 'text') warnings.push(`UI_LABEL_SOURCE_LAYER_RECOVERED:${semanticKey}`);
    if (role === 'container' && sourceLayer !== 'none') warnings.push(`UI_CONTAINER_SOURCE_LAYER_NORMALIZED:${semanticKey}`);
    if ((role === 'button' || role === 'artistic-text') && sourceLayer === 'background') {
        errors.push(`UI_OBSERVATION_LAYER_CONFLICT:${semanticKey}`);
    }
    if (role === 'label' && !authoritativeText.trim()) {
        errors.push(`UI_OBSERVATION_LABEL_TEXT_MISSING:${semanticKey}`);
    }
    return sourceBox;
}

/** 只投影已准入的节点字段，丢弃草稿额外字段并钳制几何。 */
function projectObservedNode({ intent, item, index, semanticKey, semantic, role, visualStatus, sourceLayer, sourceBox, authoritativeText }) {
    return {
        id: semanticKey,
        semanticKey,
        name: String(semantic && semantic.name || item.name || semanticKey).slice(0, 120),
        parentId: item.parentId === null ? 'ui-root' : typeof item.parentId === 'string' ? item.parentId : '',
        siblingIndex: Number.isSafeInteger(item.siblingIndex) && item.siblingIndex >= 0 ? item.siblingIndex : index,
        role,
        visualStatus,
        sourceLayer: role === 'container' ? 'none' : sourceLayer,
        sourceBox: role === 'container' ? null : sourceBox || (item.sourceBox ? clampBox(item.sourceBox, intent.canvas) : null),
        box: clampBox(item.box, intent.canvas),
        anchor: {
            x: Math.max(0, Math.min(1, finite(item.anchor && item.anchor.x, 0.5))),
            y: Math.max(0, Math.min(1, finite(item.anchor && item.anchor.y, 0.5))),
        },
        pins: {
            left: Boolean(item.pins && item.pins.left), right: Boolean(item.pins && item.pins.right),
            top: Boolean(item.pins && item.pins.top), bottom: Boolean(item.pins && item.pins.bottom),
            centerX: Boolean(item.pins && item.pins.centerX), centerY: Boolean(item.pins && item.pins.centerY),
        },
        text: authoritativeText,
        labelStyle: {
            fontSize: Math.max(1, Math.min(512, finite(item.labelStyle && item.labelStyle.fontSize, 32))),
            lineHeight: Math.max(1, Math.min(768, finite(item.labelStyle && item.labelStyle.lineHeight, 38))),
            color: String(item.labelStyle && item.labelStyle.color || '#FFFFFF').slice(0, 16),
        },
        extraction: { padding: 1, groupPolicy: item.groupPolicy === 'group' ? 'group' : 'semantic-roi' },
        evidence: String(item.evidence || 'top-left-effect').slice(0, 240),
    };
}

/** 根据 Intent 权威、必需性及视觉证据决定单个草稿节点是否保留。 */
function normalizeObservedNode(state, item, index, semanticKey) {
    const { intent, draft, intentByKey, requiredIntentKeys, unresolvedOptionalKeys, ids, warnings, errors } = state;
    const semantic = intentByKey.get(semanticKey);
    const visibleLabel = isVisibleIntentLabel(intent, draft, item, semanticKey, semantic);
    const visualStatus = item.visualStatus === 'visible' || visibleLabel ? 'visible' : 'unresolved';
    const sourceLayer = ['ui', 'text', 'background', 'none'].includes(item.sourceLayer) ? item.sourceLayer : 'none';
    const addedVisible = isAddedVisibleNode(intent, item, semantic, visualStatus, sourceLayer);
    if (!semantic && visualStatus !== 'visible') {
        // 观察新增建议与 Intent 建议拥有相同的非权威地位，不以未确认建议阻断已有像素。
        warnings.push(`UI_OBSERVATION_SUGGESTED_NODE_UNRESOLVED:${semanticKey}`);
        unresolvedOptionalKeys.add(semanticKey);
        ids.delete(semanticKey);
        return null;
    }
    if (!semantic && !addedVisible) {
        errors.push(`UI_OBSERVATION_UNDECLARED_NODE_UNRESOLVED:${semanticKey}`);
        ids.delete(semanticKey);
        return null;
    }
    if (addedVisible) warnings.push(`UI_OBSERVATION_ADDED_VISIBLE_NODE:${semanticKey}`);
    if (semantic && visualStatus !== 'visible' && !requiredIntentKeys.has(semanticKey)) {
        warnings.push(`UI_OBSERVATION_SUGGESTED_NODE_UNRESOLVED:${semanticKey}`);
        unresolvedOptionalKeys.add(semanticKey);
        ids.delete(semanticKey);
        return null;
    }
    const role = semantic && semantic.role || (['container', 'sprite', 'button', 'label', 'artistic-text'].includes(item.role) ? item.role : 'sprite');
    const authoritativeText = role === 'label' ? String(semantic && semantic.text || '')
        : role === 'artistic-text' ? String(semantic && semantic.text || item.text || '') : '';
    if (role === 'label' && !authoritativeText.trim() && !requiredIntentKeys.has(semanticKey)) {
        warnings.push(`UI_OBSERVATION_SUGGESTED_LABEL_TEXT_MISSING:${semanticKey}`);
        unresolvedOptionalKeys.add(semanticKey);
        ids.delete(semanticKey);
        return null;
    }
    const sourceBox = validateObservedNodeSource(state, item, semanticKey, role, visualStatus, sourceLayer, authoritativeText);
    return projectObservedNode({ intent, item, index, semanticKey, semantic, role, visualStatus, sourceLayer, sourceBox, authoritativeText });
}

/** 有序接纳草稿身份；去重及确定性结构根检查先于节点准入。 */
function appendObservationDraftNodes(state) {
    const { draft, intentByKey, ids, warnings, errors, nodes } = state;
    const source = Array.isArray(draft && draft.nodes) ? draft.nodes : [];
    for (let index = 0; index < source.length; index += 1) {
        const item = source[index] || {};
        const semanticKey = safeId(item.semanticKey || item.id || `observed-${index + 1}`, 'observed');
        if (ids.has(semanticKey)) {
            errors.push(`UI_OBSERVATION_DUPLICATE_ID:${semanticKey}`);
            continue;
        }
        ids.add(semanticKey);
        const extraFields = Object.keys(item.box || {}).filter((key) => !['x', 'y', 'width', 'height'].includes(key)).length;
        if (extraFields) warnings.push(`UI_OBSERVATION_BOX_EXTRA_FIELDS_IGNORED:${index}:${extraFields}`);
        if (semanticKey === 'ui-root') {
            if (item.role !== 'container' || item.parentId !== null || intentByKey.has('ui-root')) {
                errors.push('UI_OBSERVATION_ROOT_INVALID');
            } else warnings.push('UI_OBSERVATION_ROOT_NORMALIZED');
            continue;
        }
        const node = normalizeObservedNode(state, item, index, semanticKey);
        if (node) nodes.push(node);
    }
}

/** 修复可恢复的父节点并报告非法父节点与环，不改变稳定节点顺序。 */
function normalizeObservationParents({ nodes, ids, optionalIntentKeys, warnings, errors }) {
    for (const node of nodes) {
        if (node.id === 'ui-root') node.parentId = null;
        else if (node.parentId === node.id) {
            errors.push(`UI_OBSERVATION_PARENT_INVALID:${node.id}`);
            node.parentId = 'ui-root';
        } else if (!node.parentId || !ids.has(node.parentId)) {
            if (optionalIntentKeys.has(node.parentId)) {
                warnings.push(`UI_OBSERVATION_PARENT_REPARENTED:${node.id}`);
            } else {
                errors.push(`UI_OBSERVATION_PARENT_INVALID:${node.id}`);
            }
            node.parentId = 'ui-root';
        }
    }
    const byId = new Map(nodes.map((node) => [node.id, node]));
    for (const node of nodes) {
        if (node.id === 'ui-root') continue;
        const visited = new Set();
        let current = node;
        while (current && current.parentId !== null) {
            if (visited.has(current.id)) {
                errors.push(`UI_OBSERVATION_CYCLE:${node.id}`);
                node.parentId = 'ui-root';
                break;
            }
            visited.add(current.id);
            current = byId.get(current.parentId);
        }
    }
}

/** 按 Intent 元素和精确文字顺序核验完整语义覆盖。 */
function validateObservationCoverage({ intent, nodes, requiredIntentKeys, unresolvedOptionalKeys, warnings, errors }) {
    for (const semantic of intent.elements) {
        if (!nodes.some((node) => node.semanticKey === semantic.semanticKey)) {
            if (requiredIntentKeys.has(semantic.semanticKey)) {
                errors.push(`UI_OBSERVATION_REQUIRED_NODE_MISSING:${semantic.semanticKey}`);
            } else if (!unresolvedOptionalKeys.has(semantic.semanticKey)) {
                warnings.push(`UI_OBSERVATION_SUGGESTED_NODE_MISSING:${semantic.semanticKey}`);
            }
        }
    }
    const seenText = new Set(nodes.filter((node) => node.role === 'label').map((node) => node.text));
    for (const exact of intent.exactTexts) if (!seenText.has(exact)) errors.push(`UI_OBSERVATION_EXACT_TEXT_MISSING:${exact}`);
}

/** 将观察草稿投影为唯一结构根下的正式语义树。 */
function reconcileObservation(intent, draft) {
    const warnings = [];
    const errors = [];
    const intentByKey = new Map(intent.elements.map((item) => [item.semanticKey, item]));
    const requiredIntentKeys = new Set(intent.elements
        .filter((item) => isUserRequiredSemantic(intent, item))
        .map((item) => item.semanticKey));
    const optionalIntentKeys = new Set(intent.elements
        .filter((item) => !requiredIntentKeys.has(item.semanticKey))
        .map((item) => item.semanticKey));
    const unresolvedOptionalKeys = new Set();
    if (intentByKey.has('ui-root')) errors.push('UI_OBSERVATION_RESERVED_ROOT_ID');
    const nodes = [];
    const ids = new Set();
    const state = { intent, draft, intentByKey, requiredIntentKeys, optionalIntentKeys, unresolvedOptionalKeys, nodes, ids, warnings, errors };
    appendObservationDraftNodes(state);
    {
        nodes.unshift({
            id: 'ui-root', semanticKey: 'ui-root', name: 'UIRoot', parentId: null, siblingIndex: 0,
            role: 'container', box: { x: 0, y: 0, width: intent.canvas.width, height: intent.canvas.height },
            visualStatus: 'visible', sourceLayer: 'none', sourceBox: null,
            anchor: { x: 0.5, y: 0.5 }, pins: { left: true, right: true, top: true, bottom: true, centerX: false, centerY: false },
            text: '', labelStyle: { fontSize: 32, lineHeight: 38, color: '#FFFFFF' },
            extraction: { padding: 1, groupPolicy: 'semantic-roi' }, evidence: 'deterministic-root',
        });
        ids.add('ui-root');
    }
    normalizeObservationParents(state);
    validateObservationCoverage(state);
    const observation = {
        schema: 'game-agent.ui-observation-tree/v2', schemaVersion: 2, canvas: intent.canvas,
        nodes, warnings, errors,
        ...(draft.layerAudit ? { layerAudit: draft.layerAudit } : {}),
        authority: { geometry: 'top-left-effect', semantics: 'intent', ordinaryText: 'intent-exact-text' },
    };
    if (validateLayerAudit(intent, observation).invalid) errors.push('UI_OBSERVATION_AUDIT_INVALID');
    const recovery = recoveryVerdict(errors);
    // 整体信心不足不是已确认缺陷；语义和源检查独立，保留告警供最终视觉审查。
    if (recovery.verdict === 'accept' && draft.layerAudit && draft.layerAudit.status === 'uncertain'
        && draft.layerAudit.issues.length === 0) {
        warnings.push('UI_OBSERVATION_AUDIT_INCOMPLETE');
    }
    return { observation, recovery, status: errors.length ? 'review_only' : warnings.length ? 'ready_with_warnings' : 'ready' };
}

/** 执行已通过运行时 Schema 门禁的观察归一化脚本。 */
async function main() {
    const input = await readStdinJson();
    const result = reconcileObservation(input.intent, input.draft || {});
    const observationArtifact = await publishJson(contextClient(), result.observation, 'game-agent.ui-observation-tree/v2', [input.intentArtifact, input.compositeArtifacts[0]], input.retentionDays);
    process.stdout.write(JSON.stringify({ ...result, observationArtifact }));
}

if (require.main === module) main().catch((error) => {
    process.stderr.write(String(error && error.message || error));
    process.exitCode = 1;
});

module.exports = { recoveryVerdict, clampBox, isUserRequiredSemantic, reconcileObservation, validVisualBox };
