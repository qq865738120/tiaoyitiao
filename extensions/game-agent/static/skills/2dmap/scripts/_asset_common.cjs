"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PROJECT_DATA_LAYOUT, ensureProjectDataLayout } = require("./_project_storage.cjs");

const SKILL_NAME = path.basename(path.resolve(__dirname, ".."));
const RUN_SCHEMA = "game-agent.cocos-2d-asset-run/v1";
const RUN_OWNER_SCHEMA = "game-agent.cocos-2d-run-owner/v1";
const SAFE_SCOPE_ID = /^[A-Za-z0-9_-]{3,160}$/;

function fail(code, details) {
    const error = new Error(code);
    error.code = code;
    if (details !== undefined) error.details = details;
    throw error;
}

function parseArgs(argv) {
    const result = { _: [] };
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith("--")) { result._.push(token); continue; }
        const key = token.slice(2);
        const value = argv[index + 1];
        if (!value || value.startsWith("--")) result[key] = true;
        else { result[key] = value; index += 1; }
    }
    return result;
}

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === "object") {
        const output = {};
        Object.keys(value).sort().forEach(function (key) { output[key] = stable(value[key]); });
        return output;
    }
    return value;
}

function jsonText(value) { return JSON.stringify(stable(value), null, 2) + "\n"; }
function digestBuffer(buffer) { return crypto.createHash("sha256").update(buffer).digest("hex"); }
function digestFile(file) { return digestBuffer(fs.readFileSync(file)); }
function digestJson(value) { return digestBuffer(Buffer.from(jsonText(value), "utf8")); }

function readJson(file, code) {
    try { return JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (error) { fail(code || "JSON_INVALID", { file: path.basename(file), reason: error.message }); }
}

function writeJsonAtomic(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(temporary, jsonText(value), { flag: "wx" });
    fs.renameSync(temporary, file);
}

function assertPlainDirectory(root, create) {
    const absolute = path.resolve(root);
    if (create) fs.mkdirSync(absolute, { recursive: true });
    const stat = fs.lstatSync(absolute);
    if (!stat.isDirectory() || stat.isSymbolicLink()) fail("UNSAFE_DIRECTORY", { path: absolute });
    return fs.realpathSync(absolute);
}

function assertRegularFile(file, maxBytes) {
    const absolute = path.resolve(file);
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink()) fail("UNSAFE_FILE", { file: path.basename(file) });
    if (stat.size <= 0 || stat.size > maxBytes) fail("FILE_BUDGET_EXCEEDED", { size: stat.size, maxBytes });
    return { absolute: fs.realpathSync(absolute), size: stat.size };
}

function assertInside(root, target, code) {
    const base = path.resolve(root);
    const absolute = path.resolve(target);
    const relative = path.relative(base, absolute);
    if (!relative || relative === "") return absolute;
    if (relative.startsWith(".." + path.sep) || relative === ".." || path.isAbsolute(relative)) fail(code || "PATH_OUTSIDE_ROOT");
    return absolute;
}

function projectRoot(args) {
    const candidate = args["project-root"] || process.env.GAME_AGENT_PROJECT_ROOT;
    if (!candidate) fail("PROJECT_ROOT_REQUIRED");
    return assertPlainDirectory(candidate, false);
}

function validateRunId(value) {
    if (!/^[a-z0-9][a-z0-9_-]{7,63}$/.test(String(value || ""))) fail("RUN_ID_INVALID");
    return String(value);
}

function validateRunLabel(value) {
    if (!/^[a-z0-9][a-z0-9_-]{2,39}$/.test(String(value || ""))) fail("RUN_LABEL_INVALID");
    return String(value);
}

/** 读取由 Bash runtime 注入、模型输入之外的当前 Session/消息范围。 */
function currentRunScope() {
    const sessionId = process.env.GAME_AGENT_ASSET_SCOPE_SESSION_ID;
    const userMessageId = process.env.GAME_AGENT_ASSET_SCOPE_MESSAGE_ID;
    if (!SAFE_SCOPE_ID.test(String(sessionId || "")) || !SAFE_SCOPE_ID.test(String(userMessageId || ""))) {
        fail("RUN_SCOPE_UNAVAILABLE");
    }
    return { sessionId: String(sessionId), userMessageId: String(userMessageId) };
}

function ownerDigest(owner) {
    return digestBuffer(Buffer.from([
        owner.sessionId,
        owner.userMessageId,
        owner.imageId || "",
        owner.runLabel,
    ].join("\0"), "utf8"));
}

function createRunOwner(runLabel, imageId) {
    const scope = currentRunScope();
    const label = imageId === null ? validateRunId(runLabel) : validateRunLabel(runLabel);
    if (imageId !== null && !SAFE_SCOPE_ID.test(String(imageId || ""))) fail("RUN_IMAGE_ID_INVALID");
    const owner = {
        schema: RUN_OWNER_SCHEMA,
        sessionId: scope.sessionId,
        userMessageId: scope.userMessageId,
        imageId: imageId === null ? null : String(imageId),
        runLabel: label,
    };
    owner.scopeDigest = ownerDigest(owner);
    return owner;
}

function deriveRunId(owner) {
    const suffix = owner.scopeDigest.slice(0, 16);
    return validateRunId(`${owner.runLabel}-${suffix}`);
}

/** 默认按当前消息隔离；published-session 仅为同 Session intake 重试放宽消息边界。 */
function assertRunOwner(state, mode) {
    const scope = currentRunScope();
    const owner = state && state.owner;
    if (!owner || owner.schema !== RUN_OWNER_SCHEMA) {
        fail("RUN_SCOPE_MISMATCH");
    }
    const ownerLabelValid = owner.imageId === null
        ? /^[a-z0-9][a-z0-9_-]{7,63}$/.test(String(owner.runLabel || "")) && owner.runLabel === state.runId
        : /^[a-z0-9][a-z0-9_-]{2,39}$/.test(String(owner.runLabel || ""));
    if (!SAFE_SCOPE_ID.test(String(owner.sessionId || ""))
        || !SAFE_SCOPE_ID.test(String(owner.userMessageId || ""))
        || (owner.imageId !== null && !SAFE_SCOPE_ID.test(String(owner.imageId || "")))
        || !ownerLabelValid
        || owner.scopeDigest !== ownerDigest(owner)
        || owner.sessionId !== scope.sessionId
        || (mode !== "published-session" && owner.userMessageId !== scope.userMessageId)) fail("RUN_SCOPE_MISMATCH");
    if (owner.imageId !== null && deriveRunId(owner) !== state.runId) fail("RUN_SCOPE_MISMATCH");
}

function assertStoragePath(root, target) {
    const base = assertPlainDirectory(root, false);
    const absolute = assertInside(base, target, "PATH_OUTSIDE_ROOT");
    let current = base;
    for (const segment of path.relative(base, absolute).split(path.sep)) {
        current = path.join(current, segment);
        if (!fs.existsSync(current)) {
            try { fs.lstatSync(current); } catch (error) { if (error.code === "ENOENT") return absolute; throw error; }
        }
        const stat = fs.lstatSync(current);
        if (stat.isSymbolicLink() || (!stat.isDirectory() && current !== absolute)) fail("UNSAFE_DIRECTORY");
        assertInside(base, fs.realpathSync(current), "PATH_OUTSIDE_ROOT");
    }
    return absolute;
}

function assertRunAvailable(root, skill, runId) {
    const marker = assertStoragePath(root, path.join(root, PROJECT_DATA_LAYOUT.cocos2dAssets, "deleting", skill, `${validateRunId(runId)}.json`));
    if (fs.existsSync(marker)) fail("RUN_DELETING");
}

function runRoot(root, runId) {
    assertRunAvailable(root, SKILL_NAME, runId);
    return assertStoragePath(root, path.join(root, PROJECT_DATA_LAYOUT.cocos2dAssets, SKILL_NAME, "runs", validateRunId(runId)));
}

function statePath(root, runId) { return path.join(runRoot(root, runId), "run.json"); }

function loadState(root, runId, ownerMode) {
    ensureProjectDataLayout(root);
    const state = readJson(statePath(root, runId), "RUN_NOT_FOUND");
    if (state.schema !== RUN_SCHEMA || state.skill !== SKILL_NAME || state.runId !== runId) fail("RUN_STATE_INVALID");
    assertRunOwner(state, ownerMode);
    return state;
}

function registerRunOwner(root, state) {
    ensureProjectDataLayout(root);
    if (!state.owner || !SAFE_SCOPE_ID.test(String(state.owner.sessionId || ""))) fail("RUN_SCOPE_MISMATCH");
    // Explicit Session ownership index: deletion never discovers owners by scanning arbitrary runs.
    const ownerPath = path.join(root, PROJECT_DATA_LAYOUT.cocos2dAssets, "owners", state.owner.sessionId, SKILL_NAME, `${validateRunId(state.runId)}.json`);
    assertStoragePath(root, ownerPath);
    const references = SKILL_NAME === "2dmap" && Array.isArray(state.spec && state.spec.spritePackages)
        ? state.spec.spritePackages.map(function (reference) {
            if (!reference || !/^[a-f0-9]{64}$/.test(String(reference.packageDigest || ""))) fail("SPRITE_PACKAGE_DIGEST_MISMATCH");
            return { skill: "2dsprite", runId: validateRunId(reference.runId), packageDigest: reference.packageDigest };
        }) : [];
    const checkAvailable = function () {
        assertRunAvailable(root, SKILL_NAME, state.runId);
        references.forEach(function (ref) { assertRunAvailable(root, ref.skill, ref.runId); });
    };
    checkAvailable();
    writeJsonAtomic(ownerPath, {
        schema: "game-agent.cocos-2d-run-reference/v1",
        sessionId: state.owner.sessionId,
        skill: SKILL_NAME,
        runId: state.runId,
        references,
    });
    // A deleter first publishes its marker then scans references. A registration that
    // misses that scan must observe the marker here before reading any source bytes.
    checkAvailable();
}

function saveState(root, state) {
    registerRunOwner(root, state);
    state.updatedAt = new Date().toISOString();
    state.stateDigest = digestJson(Object.assign({}, state, { stateDigest: undefined }));
    writeJsonAtomic(statePath(root, state.runId), state);
}

function requireRevision(state, raw) {
    const expected = Number(raw);
    if (!Number.isInteger(expected) || expected !== state.revision) fail("STALE_REVISION", { expected, actual: state.revision });
}

function copyVerified(source, destination, expectedDigest) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
    const actual = digestFile(destination);
    if (actual !== expectedDigest) fail("COPY_DIGEST_MISMATCH");
}

module.exports = {
    assertStoragePath,
    SKILL_NAME,
    RUN_SCHEMA,
    RUN_OWNER_SCHEMA,
    assertInside,
    assertPlainDirectory,
    assertRegularFile,
    copyVerified,
    createRunOwner,
    currentRunScope,
    deriveRunId,
    digestFile,
    digestJson,
    fail,
    jsonText,
    loadState,
    parseArgs,
    projectRoot,
    readJson,
    requireRevision,
    registerRunOwner,
    runRoot,
    saveState,
    statePath,
    validateRunId,
    validateRunLabel,
    writeJsonAtomic,
};
