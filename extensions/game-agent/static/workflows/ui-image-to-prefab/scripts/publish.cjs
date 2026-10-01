'use strict';

const { contextClient, digestJson, publishJson, readStdinJson, safeId } = require('./lib/runtime.cjs');
const { compileCreatorPrefab, selectDocumentRoot } = require('./lib/prefab-compiler.cjs');

const NINE_SLICE_FIELDS = ['borderLeft', 'borderRight', 'borderTop', 'borderBottom'];
let failureStage = 'INITIALIZE';

function enterStage(stage) {
    failureStage = String(stage || 'UNKNOWN').replace(/[^A-Z0-9_]/g, '_').slice(0, 80) || 'UNKNOWN';
}

function stableFailureCode(error) {
    for (const candidate of [error && error.code, error && error.message, String(error || '')]) {
        if (typeof candidate !== 'string') continue;
        const match = candidate.match(/\b(?:UI|WORKFLOW|ASSET|EDITOR|DOCUMENT|NODE|CREATOR)_[A-Z0-9_]{1,120}\b/);
        if (match) return match[0];
    }
    return 'WORKFLOW_CONTEXT_CALL_FAILED';
}

function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function findNineSliceGroups(value, pathParts, groups, depth) {
    const record = asRecord(value);
    if (!record || depth > 12) return groups;
    if (NINE_SLICE_FIELDS.every((field) => typeof record[field] === 'number' && Number.isFinite(record[field]))) {
        groups.push(pathParts);
    }
    for (const [key, child] of Object.entries(record)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) continue;
        findNineSliceGroups(child, pathParts.concat(key), groups, depth + 1);
    }
    return groups;
}

function canonicalizeNineSliceInsets(group, insets) {
    const result = {
        left: Math.max(0, Math.round(Number(insets.left))),
        right: Math.max(0, Math.round(Number(insets.right))),
        top: Math.max(0, Math.round(Number(insets.top))),
        bottom: Math.max(0, Math.round(Number(insets.bottom))),
    };
    const widths = [group && group.rawWidth, group && group.width]
        .map(Number).filter((value) => Number.isFinite(value) && value > 0);
    const heights = [group && group.rawHeight, group && group.height]
        .map(Number).filter((value) => Number.isFinite(value) && value > 0);
    const width = widths.length ? Math.min(...widths) : Number.NaN;
    const height = heights.length ? Math.min(...heights) : Number.NaN;
    if (Number.isFinite(width) && width > 0) {
        if (width < 3) throw new Error('UI_PREFAB_NINE_SLICE_META_DIMENSIONS_INVALID');
        result.left = Math.min(result.left, Math.max(1, Math.floor((width - 1) / 2)));
        result.right = Math.min(result.right, Math.max(1, width - result.left - 1));
    }
    if (Number.isFinite(height) && height > 0) {
        if (height < 3) throw new Error('UI_PREFAB_NINE_SLICE_META_DIMENSIONS_INVALID');
        result.top = Math.min(result.top, Math.max(1, Math.floor((height - 1) / 2)));
        result.bottom = Math.min(result.bottom, Math.max(1, height - result.top - 1));
    }
    return result;
}

function createNineSliceMetaPatch(meta, insets) {
    const groups = findNineSliceGroups(meta, [], [], 0);
    if (!groups.length) throw new Error('UI_PREFAB_NINE_SLICE_META_FIELDS_MISSING');
    const score = (parts) => parts.reduce((sum, part) => sum
        + (/sprite.?frame/i.test(part) ? 4 : 0) + (/sub.?meta/i.test(part) ? 2 : 0), 0);
    groups.sort((left, right) => score(right) - score(left)
        || right.length - left.length || left.join('.').localeCompare(right.join('.')));
    const selected = groups[0];
    if (groups.filter((parts) => score(parts) === score(selected)).length > 1) {
        throw new Error('UI_PREFAB_NINE_SLICE_META_FIELDS_AMBIGUOUS');
    }
    const group = selected.reduce((value, part) => asRecord(value)?.[part], meta);
    const canonical = canonicalizeNineSliceInsets(group, insets);
    const patch = {};
    for (const field of NINE_SLICE_FIELDS) {
        patch[selected.concat(field).join('.')] = canonical[field.slice(6).toLowerCase()];
    }
    return patch;
}

function readMetaPath(meta, path) {
    return path.split('.').reduce((value, part) => asRecord(value)?.[part], meta);
}

function spriteFrameUuid(inspected) {
    if (!inspected || inspected.ok !== true) return null;
    const exact = (inspected.sub_assets || []).find((asset) => asset.cc_type === 'cc.SpriteFrame');
    return exact && exact.asset_uuid || null;
}

function authoritativeSpriteFrame(binding, logicalId) {
    if (!binding || binding.logicalPath === undefined || !Array.isArray(binding.subAssets)) {
        throw new Error(`UI_PREFAB_CREATOR_BINDING_MISSING:${logicalId}`);
    }
    const matches = binding.subAssets.filter((entry) => entry
        && (entry.type === 'cc.SpriteFrame' || entry.importer === 'sprite-frame')
        && typeof entry.uuid === 'string' && entry.uuid.length > 0);
    if (matches.length !== 1) throw new Error(`UI_PREFAB_SPRITE_FRAME_AMBIGUOUS:${logicalId}`);
    return matches[0].uuid;
}

function uniqueLineage(handles) {
    const seen = new Set();
    return handles.filter((handle) => {
        const key = `${handle.artifactId}:${handle.digest}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/** 两阶段发布：先绑定素材，再确定性编译完整 Creator 3.8 Prefab 对象表。 */
async function executePublication(input, client) {
    enterStage('VALIDATE_INPUT');
    if (!input.quality || input.quality.passed !== true) throw new Error('UI_PUBLICATION_QC_NOT_PASSED');
    if (digestJson(input.blueprint) !== input.blueprintDigest) throw new Error('UI_PUBLICATION_BLUEPRINT_DIGEST_MISMATCH');
    selectDocumentRoot(input.blueprint, input.prefabName);
    const identity = await client.call('identity');
    const members = input.blueprint.materials.map((material) => ({
        logicalPath: material.logicalPath,
        role: material.logicalId === 'background' ? 'ui-background' : 'ui-element',
        artifact: material.artifact,
    }));
    members.push({ logicalPath: 'metadata/blueprint.json', role: 'ui-prefab-blueprint', artifact: input.blueprintArtifact });
    members.push({ logicalPath: 'metadata/quality.json', role: 'ui-publication-facts', artifact: input.qualityArtifact });
    const plan = {
        schema: 'game-agent.workflow-publication-plan/v1', schemaVersion: 1,
        planId: `ui-${input.blueprintArtifact.digest.slice(0, 16)}-${safeId(identity.attemptId, 'attempt')}`,
        workflowRunId: identity.workflowRunId, nodeId: identity.nodeId, attemptId: identity.attemptId,
        assetType: 'ui-prefab-bundle', displayName: input.prefabName, members,
        preview: {
            kind: 'gallery', primaryLogicalPath: 'images/background.png',
            memberLogicalPaths: input.blueprint.materials.map((material) => material.logicalPath),
        },
        creatorTarget: {
            directory: input.outputDirectory, baseName: input.prefabName,
            prefabPath: `${input.outputDirectory}/${input.prefabName}.prefab`,
        },
        evidence: { quality: input.qualityArtifact, review: input.reviewArtifact, blueprint: input.blueprintArtifact },
        qcDigest: input.qualityArtifact.digest,
        reviewDigest: input.reviewArtifact.digest,
        blueprintDigest: input.blueprintArtifact.digest,
        allowedTools: ['AssetInspect', 'AssetManage'],
        allowedCapabilities: ['promoteArtifactBundle', 'publishProjectAsset'],
    };
    enterStage('PROMOTE_ARTIFACT_BUNDLE');
    const promoted = await client.callDurable('promoteArtifactBundle', { plan });
    if (!promoted || promoted.status !== 'partial' || !promoted.creator || promoted.creator.ok !== true
        || !Array.isArray(promoted.creator.bindings)) {
        throw new Error('UI_PUBLICATION_ASSET_IMPORT_PARTIAL');
    }
    const bindingsByPath = new Map(promoted.creator.bindings.map((binding) => [binding.logicalPath, binding]));
    const materialBindings = {};
    const transactionIds = [];
    for (let index = 0; index < input.blueprint.materials.length; index += 1) {
        const material = input.blueprint.materials[index];
        const binding = bindingsByPath.get(material.logicalPath);
        if (!binding || binding.projectAssetDbUrl !== `${input.outputDirectory}/${input.prefabName}/${material.logicalPath}`) {
            throw new Error(`UI_PREFAB_CREATOR_BINDING_MISSING:${material.logicalId}`);
        }
        let uuid = authoritativeSpriteFrame(binding, material.logicalId);
        if (material.nineSlice !== undefined) {
            enterStage(`VERIFY_NINE_SLICE_${safeId(material.logicalId, 'MATERIAL').toUpperCase()}`);
            let inspected = await client.call('invokeTool', {
                toolName: 'AssetInspect', input: { ref: binding.projectAssetDbUrl, include_meta: true },
            });
            if (!inspected || inspected.ok !== true || inspected.meta_truncated === true || !inspected.meta) {
                throw new Error(`UI_PREFAB_NINE_SLICE_META_UNAVAILABLE:${material.logicalId}`);
            }
            const patch = createNineSliceMetaPatch(inspected.meta, material.nineSlice);
            const updated = await client.call('invokeTool', {
                toolName: 'AssetManage', input: { operation: 'update_meta', ref: binding.projectAssetDbUrl, patch },
            }, 60000);
            if (!updated || updated.ok !== true || updated.verification?.meta_matches !== true) {
                throw new Error(`UI_PREFAB_NINE_SLICE_META_UPDATE_FAILED:${material.logicalId}`);
            }
            if (typeof updated.transactionId === 'string') transactionIds.push(updated.transactionId);
            inspected = await client.call('invokeTool', {
                toolName: 'AssetInspect', input: { ref: binding.projectAssetDbUrl, include_meta: true },
            });
            if (!inspected || inspected.ok !== true || inspected.meta_truncated === true
                || Object.entries(patch).some(([path, expected]) => readMetaPath(inspected.meta, path) !== expected)) {
                throw new Error(`UI_PREFAB_NINE_SLICE_META_VERIFY_FAILED:${material.logicalId}`);
            }
            uuid = spriteFrameUuid(inspected);
            if (!uuid) throw new Error(`UI_PREFAB_SPRITE_FRAME_MISSING:${material.logicalId}`);
        }
        materialBindings[material.logicalId] = { uuid, dbUrl: binding.projectAssetDbUrl };
        await client.call('reportProgress', {
            progress: 0.15 + 0.25 * (index + 1) / input.blueprint.materials.length,
            message: `已绑定 ${index + 1}/${input.blueprint.materials.length} 个 Creator 素材。`,
        });
    }
    enterStage('COMPILE_PREFAB_OBJECT_TABLE');
    const compiled = compileCreatorPrefab(input.blueprint, { prefabName: input.prefabName, materialBindings });
    const lineage = uniqueLineage([input.blueprintArtifact, ...members.map((member) => member.artifact)]);
    const prefabArtifact = await publishJson(client, compiled.objects, 'game-agent.cocos-prefab-json/v1', lineage, input.retentionDays);
    await client.call('reportProgress', { progress: 0.75, message: `已确定性编译 ${compiled.nodeCount} 个节点。` });
    enterStage('PUBLISH_PREFAB_PROJECT_ASSET');
    const publication = await client.callDurable('publishProjectAsset', {
        artifact: prefabArtifact, targetDbUrl: plan.creatorTarget.prefabPath,
        expectedImporter: 'prefab', expectedType: 'cc.Prefab',
    });
    if (!publication || publication.status !== 'committed' || !publication.projectAsset
        || publication.projectAsset.dbUrl !== plan.creatorTarget.prefabPath) {
        throw new Error('UI_PREFAB_PROJECT_ASSET_PUBLISH_FAILED');
    }
    await client.call('reportProgress', { progress: 1, message: `Prefab ${input.prefabName} 已发布并由 AssetDB 复验。` });
    return {
        publication,
        prefab: {
            dbUrl: publication.projectAsset.dbUrl,
            assetUuid: publication.projectAsset.uuid,
            digest: publication.projectAsset.digest,
        },
        prefabArtifact,
        compilerProfile: compiled.profile,
        objectCount: compiled.objectCount,
        nodeCount: compiled.nodeCount,
        transactionIds,
        verified: true,
    };
}

async function main() {
    const input = await readStdinJson();
    process.stdout.write(JSON.stringify(await executePublication(input, contextClient())));
}

if (require.main === module) main().catch((error) => {
    process.stderr.write(`UI_PREFAB_FAILURE_STAGE_${failureStage}:${stableFailureCode(error)}`);
    process.exitCode = 1;
});

module.exports = {
    canonicalizeNineSliceInsets,
    createNineSliceMetaPatch,
    executePublication,
    findNineSliceGroups,
    readMetaPath,
    stableFailureCode,
};
