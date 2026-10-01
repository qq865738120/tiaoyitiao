#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const common = require("./_asset_common.cjs");
const { PROJECT_DATA_LAYOUT, ensureProjectDataLayout } = require("./_project_storage.cjs");

const MAX_INPUT_BYTES = 32 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 64 * 1024 * 1024;

function required(args, key) {
    const value = args[key];
    if (typeof value !== "string" || value.length === 0) common.fail(`ARG_${key.toUpperCase().replace(/-/g, "_")}_REQUIRED`);
    return value;
}

function output(value) { process.stdout.write(common.jsonText(value)); }

function submitPublishedPackage(runId, packageDigest) {
    const node = process.env.GAME_AGENT_PACKAGE_INTAKE_NODE;
    const cli = process.env.GAME_AGENT_PACKAGE_INTAKE_CLI;
    if (!node || !cli) return { ok: false, packageStatus: "published", projectionStatus: "pending", code: "PACKAGE_PROJECTION_UNAVAILABLE", retryIdentity: `${common.SKILL_NAME}:${runId}:${packageDigest}` };
    try {
        const text = childProcess.execFileSync(node, [cli, "--skill", common.SKILL_NAME, "--run-id", runId, "--package-digest", packageDigest], {
            encoding: "utf8",
            env: process.env,
            timeout: 35000,
            maxBuffer: 32768,
        });
        const result = JSON.parse(text);
        if (!result || !["complete", "pending", "failed"].includes(result.projectionStatus)) throw new Error("PACKAGE_INTAKE_RESULT_INVALID");
        return result;
    } catch (error) {
        return { ok: false, packageStatus: "published", projectionStatus: "failed", code: "PACKAGE_PROJECTION_UNAVAILABLE", retryIdentity: `${common.SKILL_NAME}:${runId}:${packageDigest}` };
    }
}

function prepareState(args, runId, owner) {
    const root = common.projectRoot(args);
    const rootPath = common.runRoot(root, runId);
    if (fs.existsSync(rootPath)) common.fail("RUN_ALREADY_EXISTS");
    const specFile = common.assertRegularFile(required(args, "spec"), 1024 * 1024).absolute;
    const spec = common.readJson(specFile, "SPEC_INVALID");
    if (!spec || spec.schema !== `game-agent.cocos-${common.SKILL_NAME}-spec/v1`) common.fail("SPEC_SCHEMA_INVALID");
    if (common.SKILL_NAME === "2dmap" && spec.spritePackages !== undefined && !Array.isArray(spec.spritePackages)) common.fail("SPRITE_PACKAGES_INVALID");
    common.registerRunOwner(root, { runId, owner, spec });
    if (common.SKILL_NAME === "2dmap" && spec.spritePackages !== undefined) {
        if (!Array.isArray(spec.spritePackages)) common.fail("SPRITE_PACKAGES_INVALID");
        spec.spritePackages.forEach(function (reference) {
            const spriteRunId = common.validateRunId(reference && reference.runId);
            const spriteRunRoot = common.assertStoragePath(root, path.join(root, PROJECT_DATA_LAYOUT.cocos2dAssets, "2dsprite", "runs", spriteRunId));
            const spriteState = common.readJson(path.join(spriteRunRoot, "run.json"), "SPRITE_PACKAGE_NOT_FOUND");
            const packageIndex = common.readJson(path.join(spriteRunRoot, "package", "package-index.json"), "SPRITE_PACKAGE_NOT_FOUND");
            if (spriteState.status !== "published" || !spriteState.visualApproval || spriteState.visualApproval.approved !== true) common.fail("SPRITE_PACKAGE_NOT_APPROVED");
            if (!reference.packageDigest || reference.packageDigest !== packageIndex.packageDigest || reference.packageDigest !== spriteState.package.digest) common.fail("SPRITE_PACKAGE_DIGEST_MISMATCH");
            if (spriteState.profileDigest !== common.digestJson(common.readJson(path.resolve(__dirname, "..", "references", "cocos-asset-profile.json")))) common.fail("SPRITE_PROFILE_MISMATCH");
        });
    }
    ensureProjectDataLayout(root);
    fs.mkdirSync(path.join(rootPath, "inputs"), { recursive: true });
    const profileFile = path.resolve(__dirname, "..", "references", "cocos-asset-profile.json");
    const profile = common.readJson(profileFile, "PROFILE_INVALID");
    const state = {
        schema: common.RUN_SCHEMA,
        skill: common.SKILL_NAME,
        runId,
        owner,
        status: "prepared",
        revision: 1,
        createdAt: new Date().toISOString(),
        spec,
        specDigest: common.digestJson(spec),
        profile,
        profileDigest: common.digestJson(profile),
        creatorVerified: false,
        playbackVerified: false,
    };
    common.saveState(root, state);
    return { rootPath, state };
}

function prepare(args) {
    const runId = common.validateRunId(required(args, "run-id"));
    const prepared = prepareState(args, runId, common.createRunOwner(runId, null));
    const state = prepared.state;
    const rootPath = prepared.rootPath;
    output({ ok: true, runId, revision: state.revision, status: state.status, runRoot: rootPath, profileDigest: state.profileDigest });
}

function parsePngDimensions(file) {
    const sourceInfo = common.assertRegularFile(file, MAX_INPUT_BYTES);
    const header = Buffer.alloc(24);
    const descriptor = fs.openSync(sourceInfo.absolute, "r");
    let bytesRead;
    try {
        bytesRead = fs.readSync(descriptor, header, 0, header.length, 0);
    } finally {
        fs.closeSync(descriptor);
    }
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (bytesRead !== header.length || !header.subarray(0, 8).equals(pngSignature) || header.toString("ascii", 12, 16) !== "IHDR") {
        common.fail("SOURCE_MEDIA_INVALID");
    }
    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);
    if (width < 1 || height < 1) common.fail("SOURCE_DIMENSIONS_INVALID");
    return { width, height, sourceInfo };
}

function registerReceipt(args, receipt) {
    const root = common.projectRoot(args);
    const runId = common.validateRunId(required(args, "run-id"));
    const state = common.loadState(root, runId);
    const replacing = state.status === "materialized";
    if (state.status !== "prepared" && !replacing) common.fail("RUN_STATUS_INVALID");
    if (replacing && (state.pythonReport || state.visualApproval || state.package)) common.fail("SOURCE_REPLACEMENT_TOO_LATE");
    const runPath = common.runRoot(root, runId);
    const outputsPath = path.join(runPath, "outputs");
    if (replacing && fs.existsSync(outputsPath)) {
        const outputEntries = fs.readdirSync(outputsPath);
        if (outputEntries.length > 0) common.fail("SOURCE_REPLACEMENT_OUTPUTS_PRESENT");
        fs.rmdirSync(outputsPath);
    }
    if (receipt.schema !== "game-agent.image-materialization-receipt/v1") common.fail("RECEIPT_SCHEMA_INVALID");
    if (receipt.sessionId !== state.owner.sessionId) common.fail("RUN_SCOPE_MISMATCH");
    if (state.owner.imageId !== null && !replacing && receipt.imageId !== state.owner.imageId) common.fail("RUN_SCOPE_MISMATCH");
    if (receipt.requestedModel !== "image:auto") common.fail("REQUESTED_MODEL_INVALID");
    if (typeof receipt.resolvedModel !== "string" || receipt.resolvedModel.length < 3 || receipt.resolvedModel === "image:auto") common.fail("RESOLVED_MODEL_REQUIRED");
    if (typeof receipt.providerId !== "string" || receipt.providerId.length < 2) common.fail("PROVIDER_ID_REQUIRED");
    if (typeof receipt.providerModelId !== "string" || receipt.providerModelId.length < 2) common.fail("PROVIDER_MODEL_ID_REQUIRED");
    if (typeof receipt.capabilityVersion !== "string" || receipt.capabilityVersion.length < 3) common.fail("CAPABILITY_VERSION_REQUIRED");
    if (!/^[a-f0-9]{64}$/.test(String(receipt.catalogDigest || ""))) common.fail("CATALOG_DIGEST_INVALID");
    if (typeof receipt.checkpointId !== "string" || receipt.checkpointId.length < 3) common.fail("CHECKPOINT_ID_REQUIRED");
    if (typeof receipt.imageId !== "string" || receipt.imageId !== receipt.checkpointId) common.fail("IMAGE_ID_INVALID");
    if (typeof receipt.sessionId !== "string" || receipt.sessionId.length < 3) common.fail("SESSION_ID_REQUIRED");
    if (receipt.mediaType !== "image/png") common.fail("MEDIA_TYPE_INVALID");
    if (!Number.isInteger(receipt.width) || receipt.width < 1 || !Number.isInteger(receipt.height) || receipt.height < 1) common.fail("SOURCE_DIMENSIONS_INVALID");
    if (!/^[a-f0-9]{64}$/.test(String(receipt.sourceSha256 || ""))) common.fail("SOURCE_DIGEST_REQUIRED");
    const sourceInfo = common.assertRegularFile(required(args, "source"), MAX_INPUT_BYTES);
    if (receipt.sourceKind !== "game-asset-v1"
        || !/^ga_[A-Za-z0-9_-]{16,96}$/.test(String(receipt.assetId || ""))
        || !/^gm_[a-f0-9]{24,64}$/.test(String(receipt.memberId || ""))
        || !Number.isInteger(receipt.contentRevision) || receipt.contentRevision < 1
        || !/^[a-f0-9]{64}$/.test(String(receipt.contentDigest || ""))) common.fail("GAME_ASSET_REFERENCE_INVALID");
    const assetRoot = common.assertStoragePath(root, path.join(root, PROJECT_DATA_LAYOUT.gameAssets, "assets", receipt.assetId));
    const manifest = common.readJson(path.join(assetRoot, "asset.json"), "GAME_ASSET_MANIFEST_INVALID");
    const member = Array.isArray(manifest.members) && manifest.members.find(function (entry) { return entry && entry.memberId === receipt.memberId; });
    if (manifest.schema !== "game-agent.asset/v1" || manifest.assetId !== receipt.assetId
        || manifest.contentRevision !== receipt.contentRevision || manifest.contentDigest !== receipt.contentDigest
        || !member || member.digest !== receipt.sourceSha256) common.fail("GAME_ASSET_REFERENCE_STALE");
    const filesRoot = common.assertPlainDirectory(path.join(assetRoot, "files"), false);
    common.assertInside(filesRoot, sourceInfo.absolute, "SOURCE_OUTSIDE_GAME_ASSET");
    const expectedSource = path.join(filesRoot, ...String(member.logicalPath).split("/"));
    if (fs.realpathSync(expectedSource) !== sourceInfo.absolute) common.fail("GAME_ASSET_MEMBER_MISMATCH");
    const sourceDigest = common.digestFile(sourceInfo.absolute);
    if (receipt.sourceSha256 !== sourceDigest) common.fail("SOURCE_DIGEST_MISMATCH");
    const destination = path.join(runPath, "inputs", `source${path.extname(sourceInfo.absolute).toLowerCase() || ".png"}`);
    if (replacing) {
        const replacement = `${destination}.replacement-${process.pid}-${Date.now()}`;
        try {
            common.copyVerified(sourceInfo.absolute, replacement, sourceDigest);
            fs.renameSync(replacement, destination);
        } finally {
            if (fs.existsSync(replacement)) fs.rmSync(replacement, { force: true });
        }
        state.sourceReplacements = (state.sourceReplacements || []).concat([{
            revision: state.revision,
            receiptDigest: state.receiptDigest,
            sourceSha256: state.source.sha256,
            replacedAt: new Date().toISOString(),
        }]);
    } else {
        common.copyVerified(sourceInfo.absolute, destination, sourceDigest);
    }
    state.receipt = Object.assign({}, receipt, {
        sourcePath: undefined,
        sourceSha256: sourceDigest,
        sourceBytes: sourceInfo.size,
    });
    state.receiptDigest = common.digestJson(state.receipt);
    state.source = { relativePath: path.relative(common.runRoot(root, runId), destination).split(path.sep).join("/"), sha256: sourceDigest, bytes: sourceInfo.size };
    state.status = "materialized";
    state.revision += 1;
    common.saveState(root, state);
    output({ ok: true, runId, runRoot: runPath, revision: state.revision, status: state.status, source: state.source, receiptDigest: state.receiptDigest, replaced: replacing });
}

function register(args) {
    const receiptFile = common.assertRegularFile(required(args, "receipt"), 1024 * 1024).absolute;
    registerReceipt(args, common.readJson(receiptFile, "RECEIPT_INVALID"));
}

/** 从统一 Game Asset authority 注册已复验的图片成员。 */
function registerGameAsset(args) {
    const source = required(args, "source");
    const memberId = required(args, "member-id");
    const dimensions = parsePngDimensions(source);
    registerReceipt(args, {
        schema: "game-agent.image-materialization-receipt/v1",
        sourceKind: "game-asset-v1",
        assetId: required(args, "asset-id"),
        memberId,
        contentRevision: Number(required(args, "content-revision")),
        contentDigest: required(args, "content-digest"),
        requestedModel: "image:auto",
        resolvedModel: required(args, "resolved-model"),
        providerId: required(args, "provider-id"),
        providerModelId: required(args, "provider-model-id"),
        capabilityVersion: required(args, "capability-version"),
        catalogDigest: required(args, "catalog-digest"),
        checkpointId: memberId,
        imageId: memberId,
        sessionId: common.currentRunScope().sessionId,
        mediaType: "image/png",
        width: dimensions.width,
        height: dimensions.height,
        sourceSha256: common.digestFile(dimensions.sourceInfo.absolute),
    });
}

/** 原子创建 Game Asset 成员专属 run，并立即绑定权威引用。 */
function beginGameAsset(args) {
    const memberId = required(args, "member-id");
    const owner = common.createRunOwner(required(args, "run-label"), memberId);
    const runId = common.deriveRunId(owner);
    const prepared = prepareState(args, runId, owner);
    try {
        registerGameAsset(Object.assign({}, args, { "run-id": runId }));
    } catch (error) {
        if (fs.existsSync(prepared.rootPath)) fs.rmSync(prepared.rootPath, { recursive: true, force: true });
        throw error;
    }
}

function validateSpriteLayout(report, runPath) {
    const layout = report.layout;
    const reasons = ["explicit-user", "ui-tight", "icon-safe", "animation-safe", "default-safe"];
    if (!layout || !["tight", "safe"].includes(layout.marginMode) || !reasons.includes(layout.marginReason)
        || layout.passed !== true || layout.uniformScale !== true || layout.marginsSatisfied !== true || layout.tightMarginsMinimal !== true
        || !Array.isArray(layout.requestedTarget) || layout.requestedTarget.length !== 2
        || !Array.isArray(layout.actualSize) || layout.actualSize.length !== 2
        || !Array.isArray(layout.configuredMargins) || layout.configuredMargins.length !== 4
        || !Array.isArray(layout.frames) || layout.frames.length !== report.delivery.frameCount) common.fail("REPORT_LAYOUT_INVALID");
    const validSize = function (values) {
        return values.every(function (value) { return Number.isSafeInteger(value) && value > 0; });
    };
    if (!validSize(layout.requestedTarget) || !validSize(layout.actualSize)
        || !layout.configuredMargins.every(function (value) { return Number.isSafeInteger(value) && value >= 1; })) common.fail("REPORT_LAYOUT_INVALID");
    if (layout.marginMode === "safe" && (layout.actualSize[0] !== layout.requestedTarget[0] || layout.actualSize[1] !== layout.requestedTarget[1])) common.fail("REPORT_LAYOUT_INVALID");
    if (layout.marginMode === "tight" && (layout.actualSize[0] > layout.requestedTarget[0] || layout.actualSize[1] > layout.requestedTarget[1])) common.fail("REPORT_LAYOUT_INVALID");
    if (!Number.isFinite(layout.maximumAspectRatioRelativeDelta) || layout.maximumAspectRatioRelativeDelta < 0
        || (report.renderMode === "raster" && layout.maximumAspectRatioRelativeDelta > 0.05)) common.fail("REPORT_LAYOUT_INVALID");
    layout.frames.forEach(function (frame, index) {
        if (!frame || frame.index !== index || !Array.isArray(frame.scale) || frame.scale.length !== 2
            || !frame.scale.every(function (value) { return Number.isFinite(value) && value > 0; })
            || Math.abs(frame.scale[0] - frame.scale[1]) > 1e-9
            || !Array.isArray(frame.actualMargins) || frame.actualMargins.length !== 4
            || !frame.actualMargins.every(function (value, marginIndex) {
                return Number.isSafeInteger(value) && value >= layout.configuredMargins[marginIndex];
            })
            || !Number.isFinite(frame.aspectRatioRelativeDelta) || frame.aspectRatioRelativeDelta < 0
            || (report.renderMode === "raster" && frame.aspectRatioRelativeDelta > 0.05)) common.fail("REPORT_LAYOUT_INVALID");
        if (layout.marginMode === "tight" && layout.frames.length === 1 && frame.actualMargins.some(function (value, marginIndex) {
            return value > layout.configuredMargins[marginIndex] + 1;
        })) common.fail("REPORT_LAYOUT_INVALID");
    });
    const frameOutputs = report.outputs.filter(function (entry) { return /^frames\/frame-\d{4}\.png$/.test(String(entry.packagePath || "")); });
    if (frameOutputs.length !== report.delivery.frameCount) common.fail("REPORT_LAYOUT_INVALID");
    frameOutputs.forEach(function (entry) {
        const dimensions = parsePngDimensions(path.join(runPath, entry.relativePath));
        if (dimensions.width !== layout.actualSize[0] || dimensions.height !== layout.actualSize[1]) common.fail("REPORT_LAYOUT_INVALID");
    });
    if (!report.qc || !report.qc.checks || common.digestJson(report.qc.checks.layout) !== common.digestJson(layout)) common.fail("REPORT_LAYOUT_INVALID");
}

/** 复验不透明背景的完整画布布局与独立 QC discriminator。 */
function validateOpaqueBackground(report, runPath) {
    const layout = report.layout;
    const checks = report.qc && report.qc.checks;
    const opaque = checks && checks.opaqueBackground;
    if (report.assetKind !== "background" || report.renderMode !== "raster" || report.transparencyMode !== "opaque"
        || report.delivery.kind !== "static-single-frame" || report.delivery.frameCount !== 1
        || report.delivery.manifestIncluded !== false
        || !layout || layout.mode !== "full-canvas" || layout.passed !== true
        || layout.uniformScale !== true || layout.fullCanvasPreserved !== true
        || !Array.isArray(layout.requestedTarget) || layout.requestedTarget.length !== 2
        || !Array.isArray(layout.actualSize) || layout.actualSize.length !== 2
        || !layout.requestedTarget.every(function (value) { return Number.isSafeInteger(value) && value > 0; })
        || layout.actualSize[0] !== layout.requestedTarget[0] || layout.actualSize[1] !== layout.requestedTarget[1]
        || layout.maximumAspectRatioRelativeDelta !== 0
        || !Array.isArray(layout.frames) || layout.frames.length !== 1) common.fail("REPORT_OPAQUE_BACKGROUND_INVALID");
    const frame = layout.frames[0];
    if (!frame || frame.index !== 0 || frame.resample !== "lanczos"
        || !Array.isArray(frame.sourceRect) || frame.sourceRect.length !== 4
        || !Array.isArray(frame.rect) || frame.rect.length !== 4
        || frame.rect[0] !== 0 || frame.rect[1] !== 0
        || frame.rect[2] !== layout.actualSize[0] || frame.rect[3] !== layout.actualSize[1]
        || !Array.isArray(frame.actualMargins) || frame.actualMargins.some(function (value) { return value !== 0; })
        || !Array.isArray(frame.scale) || frame.scale.length !== 2
        || !frame.scale.every(function (value) { return Number.isFinite(value) && value > 0; })
        || Math.abs(frame.scale[0] - frame.scale[1]) > 1e-12
        || frame.aspectRatioRelativeDelta !== 0) common.fail("REPORT_OPAQUE_BACKGROUND_INVALID");
    if (!opaque || opaque.passed !== true || opaque.method !== "full-canvas-raster-v1"
        || opaque.resample !== "lanczos" || opaque.fullyOpaque !== true
        || opaque.fullCanvasPreserved !== true || opaque.exactTarget !== true
        || opaque.transparentPixels !== 0 || opaque.semiTransparentPixels !== 0
        || opaque.quantized !== false
        || !Array.isArray(opaque.sourceSize) || opaque.sourceSize.length !== 2
        || !opaque.sourceSize.every(function (value) { return Number.isSafeInteger(value) && value > 0; })
        || opaque.sourceSize[0] !== frame.sourceRect[2] || opaque.sourceSize[1] !== frame.sourceRect[3]
        || !Array.isArray(opaque.targetSize) || opaque.targetSize.length !== 2
        || opaque.targetSize[0] !== layout.actualSize[0] || opaque.targetSize[1] !== layout.actualSize[1]
        || !Array.isArray(opaque.scale) || opaque.scale.length !== 2
        || !opaque.scale.every(function (value) { return Number.isFinite(value) && value > 0; })
        || Math.abs(opaque.scale[0] - frame.scale[0]) > 1e-12
        || Math.abs(opaque.scale[1] - frame.scale[1]) > 1e-12
        || checks.genuineTransparency !== undefined || checks.raster !== undefined
        || checks.pixelArt !== undefined || checks.pixelPerfect !== undefined
        || checks.chromaResidualPixels !== undefined
        || common.digestJson(checks.layout) !== common.digestJson(layout)) common.fail("REPORT_OPAQUE_BACKGROUND_INVALID");
    const frameOutputs = report.outputs.filter(function (entry) { return /^frames\/frame-\d{4}\.png$/.test(String(entry.packagePath || "")); });
    if (frameOutputs.length !== 1) common.fail("REPORT_OPAQUE_BACKGROUND_INVALID");
    const dimensions = parsePngDimensions(path.join(runPath, frameOutputs[0].relativePath));
    if (dimensions.width !== layout.actualSize[0] || dimensions.height !== layout.actualSize[1]) common.fail("REPORT_OPAQUE_BACKGROUND_INVALID");
}

function attachReport(args) {
    const root = common.projectRoot(args);
    const runId = common.validateRunId(required(args, "run-id"));
    const state = common.loadState(root, runId);
    if (state.status !== "materialized") common.fail("RUN_STATUS_INVALID");
    const reportFile = common.assertRegularFile(required(args, "report"), 4 * 1024 * 1024).absolute;
    const report = common.readJson(reportFile, "REPORT_INVALID");
    if (report.schema !== `game-agent.cocos-${common.SKILL_NAME}-report/v1` || report.runId !== runId) common.fail("REPORT_SCHEMA_INVALID");
    if (report.sourceSha256 !== state.source.sha256) common.fail("REPORT_SOURCE_MISMATCH");
    if (!report.qc || report.qc.passed !== true) common.fail("QC_NOT_PASSED");
    if (!Array.isArray(report.outputs) || report.outputs.length === 0) common.fail("REPORT_OUTPUTS_MISSING");
    let totalBytes = 0;
    report.outputs.forEach(function (entry) {
        if (!entry || typeof entry.relativePath !== "string" || !/^[a-f0-9]{64}$/.test(String(entry.sha256 || ""))) common.fail("REPORT_OUTPUT_INVALID");
        const file = common.assertInside(common.runRoot(root, runId), path.join(common.runRoot(root, runId), entry.relativePath), "REPORT_OUTPUT_OUTSIDE_RUN");
        const info = common.assertRegularFile(file, MAX_OUTPUT_BYTES);
        if (common.digestFile(info.absolute) !== entry.sha256) common.fail("REPORT_OUTPUT_DIGEST_MISMATCH");
        totalBytes += info.size;
    });
    if (totalBytes > MAX_OUTPUT_BYTES) common.fail("OUTPUT_BUDGET_EXCEEDED");
    if (common.SKILL_NAME === "2dsprite") {
        const delivery = report.delivery;
        if (!delivery || !["manifest", "static-single-frame"].includes(delivery.kind)
            || !Number.isSafeInteger(delivery.frameCount) || delivery.frameCount < 1
            || typeof delivery.authorityPath !== "string"
            || !/^[a-f0-9]{64}$/.test(String(delivery.authoritySha256 || ""))) common.fail("REPORT_DELIVERY_INVALID");
        const authority = report.outputs.find(function (entry) { return entry.packagePath === delivery.authorityPath; });
        if (!authority || authority.sha256 !== delivery.authoritySha256) common.fail("REPORT_DELIVERY_INVALID");
        const manifestOutput = report.outputs.find(function (entry) { return entry.packagePath === "cocos-sprite-manifest.json"; });
        if (delivery.kind === "static-single-frame") {
            if (delivery.frameCount !== 1 || delivery.manifestIncluded !== false || manifestOutput || report.manifestSha256) common.fail("REPORT_DELIVERY_INVALID");
        } else if (delivery.manifestIncluded !== true || !manifestOutput || manifestOutput.sha256 !== report.manifestSha256) {
            common.fail("REPORT_DELIVERY_INVALID");
        }
        const transparencyMode = report.transparencyMode || "transparent";
        if (!["transparent", "opaque"].includes(transparencyMode)
            || !["raster", "pixel-art"].includes(report.renderMode)
            || report.qc.checks.renderMode !== report.renderMode
            || (report.qc.checks.transparencyMode !== undefined && report.qc.checks.transparencyMode !== transparencyMode)) common.fail("REPORT_RENDER_MODE_INVALID");
        if (transparencyMode === "opaque") {
            validateOpaqueBackground(report, common.runRoot(root, runId));
        } else {
            if (report.renderMode === "pixel-art" && (!report.qc.checks.pixelPerfect || !report.qc.checks.pixelArt || report.qc.checks.raster || report.qc.checks.opaqueBackground)) common.fail("REPORT_RENDER_MODE_INVALID");
            if (report.renderMode === "raster" && (!report.qc.checks.raster || report.qc.checks.pixelArt || report.qc.checks.opaqueBackground || report.qc.checks.pixelPerfect !== undefined)) common.fail("REPORT_RENDER_MODE_INVALID");
            validateSpriteLayout(report, common.runRoot(root, runId));
        }
    }
    const stored = path.join(common.runRoot(root, runId), "python-report.json");
    common.writeJsonAtomic(stored, report);
    state.pythonReport = { relativePath: "python-report.json", sha256: common.digestFile(stored), outputCount: report.outputs.length, totalBytes };
    state.status = "qc-passed";
    state.revision += 1;
    common.saveState(root, state);
    output({ ok: true, runId, revision: state.revision, status: state.status, report: state.pythonReport });
}

function approve(args) {
    const root = common.projectRoot(args);
    const runId = common.validateRunId(required(args, "run-id"));
    const state = common.loadState(root, runId);
    if (state.status !== "qc-passed") common.fail("RUN_STATUS_INVALID");
    common.requireRevision(state, required(args, "expected-revision"));
    const note = required(args, "note").trim();
    if (note.length < 20) common.fail("VISUAL_APPROVAL_NOTE_TOO_SHORT");
    state.visualApproval = { approved: true, note, boundRevision: state.revision, reportSha256: state.pythonReport.sha256, approvedAt: new Date().toISOString() };
    state.status = "approved";
    state.revision += 1;
    common.saveState(root, state);
    output({ ok: true, runId, revision: state.revision, status: state.status, visualApprovalDigest: common.digestJson(state.visualApproval) });
}

function pack(args) {
    const root = common.projectRoot(args);
    const runId = common.validateRunId(required(args, "run-id"));
    const state = common.loadState(root, runId);
    if (state.status !== "approved" || !state.visualApproval || state.visualApproval.approved !== true) common.fail("VISUAL_APPROVAL_REQUIRED");
    common.requireRevision(state, required(args, "expected-revision"));
    if (state.visualApproval.reportSha256 !== state.pythonReport.sha256) common.fail("STALE_VISUAL_APPROVAL");
    const runPath = common.runRoot(root, runId);
    const report = common.readJson(path.join(runPath, state.pythonReport.relativePath), "REPORT_INVALID");
    const packagePath = path.join(runPath, "package");
    const staging = path.join(runPath, `.package-staging-${process.pid}-${Date.now()}`);
    if (fs.existsSync(packagePath)) common.fail("PACKAGE_ALREADY_EXISTS");
    fs.mkdirSync(staging, { recursive: false });
    try {
        report.outputs.forEach(function (entry) {
            const source = common.assertInside(runPath, path.join(runPath, entry.relativePath));
            const destination = common.assertInside(staging, path.join(staging, entry.packagePath || path.basename(entry.relativePath)));
            common.copyVerified(source, destination, entry.sha256);
        });
        common.writeJsonAtomic(path.join(staging, "materialization-receipt.json"), state.receipt);
        common.writeJsonAtomic(path.join(staging, "python-qc-report.json"), report);
        common.writeJsonAtomic(path.join(staging, "visual-approval.json"), state.visualApproval);
        const files = [];
        (function walk(directory) {
            fs.readdirSync(directory, { withFileTypes: true }).sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (entry) {
                const absolute = path.join(directory, entry.name);
                if (entry.isDirectory()) walk(absolute);
                else if (entry.isFile()) files.push({ path: path.relative(staging, absolute).split(path.sep).join("/"), sha256: common.digestFile(absolute), bytes: fs.statSync(absolute).size });
                else common.fail("UNSAFE_PACKAGE_ENTRY");
            });
        }(staging));
        const staticSingleFrame = common.SKILL_NAME === "2dsprite" && report.delivery && report.delivery.kind === "static-single-frame";
        const authorityEntry = staticSingleFrame
            ? files.find(function (entry) { return entry.path === report.delivery.authorityPath; })
            : null;
        if (staticSingleFrame && (!authorityEntry || authorityEntry.sha256 !== report.delivery.authoritySha256)) common.fail("REPORT_DELIVERY_INVALID");
        const packageIndex = {
            schema: staticSingleFrame ? "game-agent.cocos-2dsprite-static-frame-package/v1" : `game-agent.cocos-${common.SKILL_NAME}-package/v1`,
            runId,
            authority: common.SKILL_NAME === "2dsprite" ? (staticSingleFrame ? "single-frame" : "loose-frames") : report.mode,
            profileDigest: state.profileDigest,
            receiptDigest: state.receiptDigest,
            creatorVerified: false,
            playbackVerified: false,
            files,
        };
        if (staticSingleFrame) packageIndex.entry = { path: authorityEntry.path, sha256: authorityEntry.sha256, bytes: authorityEntry.bytes };
        packageIndex.packageDigest = common.digestJson(packageIndex);
        common.writeJsonAtomic(path.join(staging, "package-index.json"), packageIndex);
        fs.renameSync(staging, packagePath);
        state.package = { relativePath: "package", digest: packageIndex.packageDigest, fileCount: files.length + 1 };
        state.status = "published";
        state.revision += 1;
        common.saveState(root, state);
        const projection = submitPublishedPackage(runId, state.package.digest);
        output({ ok: true, runId, revision: state.revision, status: state.status, packageStatus: "published", packagePath, packageDigest: state.package.digest, projection });
    } catch (error) {
        if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
        throw error;
    }
}

function intake(args) {
    const root = common.projectRoot(args);
    const runId = common.validateRunId(required(args, "run-id"));
    const state = common.loadState(root, runId, "published-session");
    if (state.status !== "published" || !state.package || !/^[a-f0-9]{64}$/.test(String(state.package.digest || ""))) common.fail("PACKAGE_NOT_PUBLISHED");
    output({ ok: true, runId, status: state.status, packageStatus: "published", packageDigest: state.package.digest, projection: submitPublishedPackage(runId, state.package.digest) });
}

function help() {
    output({ commands: ["begin-game-asset", "prepare", "register-game-asset", "report", "approve", "pack", "intake"], skill: common.SKILL_NAME, node: ">=14.16.0" });
}

try {
    const args = common.parseArgs(process.argv.slice(2));
    const command = args._[0];
    if (!command || args.help || command === "help") help();
    else if (command === "begin-game-asset") beginGameAsset(args);
    else if (command === "prepare") prepare(args);
    else if (command === "register") register(args);
    else if (command === "register-game-asset") registerGameAsset(args);
    else if (command === "report") attachReport(args);
    else if (command === "approve") approve(args);
    else if (command === "pack") pack(args);
    else if (command === "intake") intake(args);
    else common.fail("COMMAND_INVALID");
} catch (error) {
    process.stderr.write(common.jsonText({ ok: false, code: error.code || "ASSET_PIPELINE_FAILED", details: error.details }));
    process.exitCode = 1;
}
