'use strict';

const { safeId } = require('./runtime.cjs');

/** 用户输入是必需项的唯一权威，模型建议不能自行升级。 */
function isUserRequiredSemantic(intent, semantic) {
    return intent.requiredElements.some((value) => value === semantic.name
        || safeId(value, 'required') === semantic.semanticKey)
        || semantic.role === 'label' && intent.exactTexts.includes(semantic.text);
}

/** 观察阶段与质量阶段共享审计语义校验；不修补或丢弃非法证据来取得通过。 */
function validateLayerAudit(intent, observation) {
    const audit = observation.layerAudit;
    if (!audit) return { issues: [], invalid: false };
    const elements = new Map(intent.elements.map((item) => [item.semanticKey, item]));
    const nodes = new Map(observation.nodes.map((item) => [item.semanticKey, item]));
    const visible = audit.effectVisibleLabels || [];
    let invalid = visible.some((key) => elements.get(key)?.role !== 'label' || !nodes.has(key))
        || new Set(visible).size !== visible.length;
    const issues = [];
    for (const issue of audit.issues || []) {
        const semantic = elements.get(issue.semanticKey);
        const region = issue.region;
        const regionValid = region && ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(region[key]))
            && region.x >= 0 && region.y >= 0 && region.width > 1 && region.height > 1
            && region.x + region.width <= intent.canvas.width && region.y + region.height <= intent.canvas.height;
        const label = semantic && semantic.role === 'label';
        const node = nodes.get(issue.semanticKey);
        const missingSource = semantic && ['sprite', 'button', 'artistic-text'].includes(semantic.role)
            && node && node.visualStatus === 'visible' && node.sourceLayer === 'ui' && node.sourceBox === null
            && node.box && ['x', 'y', 'width', 'height'].every((key) => node.box[key] === region?.[key]);
        const valid = regionValid && (
            issue.code === 'art-in-text' && issue.quadrant === 'text' && semantic && semantic.role === 'artistic-text'
            || issue.code === 'graphics-in-text' && issue.quadrant === 'text'
            || issue.code === 'ordinary-in-ui' && issue.quadrant === 'ui' && label
            || issue.code === 'ordinary-missing' && issue.quadrant === 'text' && label && nodes.get(issue.semanticKey)?.visualStatus === 'visible'
            || issue.code === 'required-missing' && issue.quadrant === 'effect' && semantic
                && isUserRequiredSemantic(intent, semantic) && nodes.get(issue.semanticKey)?.visualStatus !== 'visible'
            || issue.code === 'layer-misaligned' && ['ui', 'text'].includes(issue.quadrant) && semantic
            || issue.code === 'unplanned-text' && ['effect', 'background', 'ui', 'text'].includes(issue.quadrant) && issue.semanticKey === ''
            || issue.code === 'source-missing' && issue.quadrant === 'ui' && missingSource
        );
        if (!valid || issue.semanticKey && !semantic) { invalid = true; continue; }
        issues.push({ code: issue.code, quadrant: issue.quadrant, ...(semantic ? { semanticKey: issue.semanticKey } : {}) });
    }
    return { issues, invalid };
}

/** 消费真实效果图裁片只补非交互 Sprite 的已确认缺源，不改写原观察。 */
function effectSourceRecoveredKeys(intent, observation, manifest) {
    const result = new Set();
    if (manifest.reconstruction?.publicationPolicy !== 'prefab-usability-v1') return result;
    for (const proof of manifest.reconstruction.effectSources || []) {
        const node = observation.nodes.find((node) => node.semanticKey === proof.semanticKey);
        const semantic = intent.elements.find((item) => item.semanticKey === proof.semanticKey);
        const crops = (manifest.crops || []).filter((crop) => crop.semanticKey === proof.semanticKey);
        if (!node || node.role !== 'sprite' || node.visualStatus !== 'visible' || node.sourceLayer !== 'ui' || node.sourceBox
            || semantic?.interactive !== false || crops.length !== 1
            || proof.method !== 'effect-region-with-component-exclusions'
            || !/^[a-f0-9]{64}$/.test(proof.effectDigest) || proof.effectDigest !== manifest.quadrants?.effect?.artifact?.digest
            || !/^[a-f0-9]{64}$/.test(proof.cropDigest) || proof.cropDigest !== crops[0].artifact?.digest
            || crops[0].artifact?.mediaType !== 'image/png'
            || !['x', 'y', 'width', 'height'].every((key) => proof.targetBox?.[key] === node.box[key] && crops[0].targetBox?.[key] === node.box[key])
            || !observation.layerAudit?.issues?.some((issue) => issue.code === 'source-missing' && issue.semanticKey === node.semanticKey)) continue;
        result.add(node.semanticKey);
    }
    return result;
}

module.exports = { isUserRequiredSemantic, validateLayerAudit, effectSourceRecoveredKeys };
