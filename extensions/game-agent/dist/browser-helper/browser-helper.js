'use strict';

var path = require('path');
var fs = require('fs');
var node_crypto = require('crypto');
var fs$1 = require('fs/promises');
var node_child_process = require('child_process');
var os = require('os');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var fs__namespace$1 = /*#__PURE__*/_interopNamespaceDefault(fs$1);
var os__namespace = /*#__PURE__*/_interopNamespaceDefault(os);

/** 表示 browser helper 内部可投影到 JSON-RPC data.code 的业务错误。 */
class BrowserHelperError extends Error {
    code;
    details;
    /** 创建带稳定错误码和可选结构化详情的 helper 错误。 */
    constructor(code, message, details) {
        super(message);
        this.name = "BrowserHelperError";
        this.code = code;
        this.details = details;
    }
}
/** 将任意异常转换为 JSON-RPC error 对象。 */
function toRpcError(error) {
    if (error instanceof BrowserHelperError) {
        return {
            code: -32e3,
            message: error.message,
            data: {
                code: error.code,
                details: error.details,
            },
        };
    }
    return {
        code: -32e3,
        message: error instanceof Error ? error.message : String(error),
    };
}

/** 将未知数值裁剪为指定范围内的整数，非法输入时返回 fallback。 */
function boundedInteger(value, fallback, min, max) {
    if (typeof value !== "number" || !Number.isFinite(value))
        return fallback;
    return Math.min(max, Math.max(min, Math.floor(value)));
}
/** 将 Playwright console message 类型映射为 helper 统一日志级别。 */
function consoleLevel(type) {
    if (type === "error")
        return "error";
    if (type === "warning" || type === "warn")
        return "warning";
    if (type === "debug")
        return "debug";
    return "info";
}
/** 读取必需字符串参数，缺失或空白时抛出 helper 输入错误。 */
function requireString(value, name) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new BrowserHelperError("input.invalid", `${name} 必须是非空字符串。`);
    }
    return value;
}
/** 读取必需数字参数，非法时抛出 helper 输入错误。 */
function requireNumber(value, name) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new BrowserHelperError("input.invalid", `${name} 必须是有效数字。`);
    }
    return value;
}
/** 将未知鼠标按钮参数归一化为 Playwright 支持的按钮名。 */
function normalizeMouseButton(value) {
    return value === "right" || value === "middle" ? value : "left";
}
/** 从未知对象中读取坐标点并校验 x/y 均为有效数字。 */
function assertPoint(value, name) {
    const point = value;
    const x = requireNumber(point?.x, `${name}.x`);
    const y = requireNumber(point?.y, `${name}.y`);
    return { x, y };
}
/** 等待指定毫秒数，用于 runtime wait 轮询间隔。 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/** 归一化 runtime wait 的模式、超时和轮询间隔。 */
function waitBounds(params) {
    return {
        mode: params.mode === "assert" ? "assert" : "wait",
        timeoutMs: boundedInteger(params.timeoutMs, 5_000, 100, 30_000),
        pollIntervalMs: boundedInteger(params.pollIntervalMs, 250, 50, 5_000),
    };
}
/** 判断文本值是否包含指定片段；未指定期望片段时始终匹配。 */
function textContains(value, expected) {
    if (!expected)
        return true;
    return typeof value === "string" && value.includes(expected);
}
/** 计算未知 JSON 值序列化后的 UTF-8 字节数。 */
function byteSize(value) {
    return Buffer.byteLength(JSON.stringify(value), "utf8");
}
/** 将长文本裁剪到最大长度，并用省略号标识被截断。 */
function clipText(value, maxLength) {
    return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 3))}...` : value;
}
/** 判断 runtime tree 中的节点是否满足 wait 条件。 */
function nodeMatches(node, params) {
    if (!node)
        return false;
    if (params.nameIncludes && !textContains(node.name, params.nameIncludes))
        return false;
    if (params.pathIncludes && !textContains(node.path, params.pathIncludes))
        return false;
    if (typeof params.active === "boolean" && node.active !== params.active)
        return false;
    if (params.visible === true) {
        const rect = node.screenRect;
        if (!rect || typeof rect.width !== "number" || typeof rect.height !== "number" || rect.width <= 0 || rect.height <= 0)
            return false;
    }
    if (params.textIncludes) {
        const components = Array.isArray(node.components) ? node.components : [];
        if (!components.some((component) => textContains(component.text, params.textIncludes) || textContains(component.placeholder, params.textIncludes))) {
            return false;
        }
    }
    return true;
}

/** 首次按键聚焦已有游戏画布，保留用户明确选择的 DOM 控件且不制造点击副作用。 */
async function focusGameCanvasForKeyboard(page) {
    await page.evaluate(() => {
        const active = document.activeElement;
        if (active && active !== document.body && active !== document.documentElement)
            return;
        const canvas = document.getElementById("GameCanvas");
        if (canvas?.tagName === "CANVAS")
            canvas.focus({ preventScroll: true });
    });
}
/** 调用页面内 Preview Bridge operate 接口并返回结构化结果。 */
async function operateRuntimeBridge(page, params) {
    return page.evaluate((payload) => {
        const bridge = globalThis.__GAME_AGENT_PREVIEW_BRIDGE_PROBE__;
        if (!bridge || typeof bridge.operate !== "function") {
            return {
                ok: false,
                errorCode: "bridge_unavailable",
                reason: "Preview Bridge 尚未注入或未完成初始化。",
            };
        }
        return bridge.operate(payload.action, payload.params);
    }, {
        action: params.action,
        params: {
            operation: params.operation,
            nodeRef: params.nodeRef,
            targetId: params.targetId,
            seed: params.seed,
        },
    });
}
/** 将未知输入延迟归一化到 Playwright keyboard.type 支持的范围。 */
function normalizeInputDelay(value) {
    return typeof value === "number" && Number.isFinite(value)
        ? Math.max(0, Math.min(1000, Math.floor(value)))
        : undefined;
}
/** 执行语义节点指针操作，并把 Bridge 目标点转成真实页面鼠标输入。 */
async function performNodePointer(page, params, bridgeResult) {
    const point = assertPoint(bridgeResult.point, "point");
    if (params.operation === "double_click") {
        await page.mouse.dblclick(point.x, point.y);
    }
    else {
        await page.mouse.click(point.x, point.y);
    }
    return {
        ...bridgeResult,
        ok: true,
        operation: params.operation === "double_click" ? "double_click" : "click",
        point,
    };
}
/** 执行语义节点输入操作，并把 Bridge 目标点转成真实页面键盘输入。 */
async function performNodeInput(page, params, bridgeResult) {
    const point = assertPoint(bridgeResult.point, "point");
    const text = requireString(params.text, "text");
    const delay = normalizeInputDelay(params.delayMs);
    await page.mouse.click(point.x, point.y);
    if (params.clearExisting !== false) {
        await page.keyboard.press("Control+A");
        await page.keyboard.press("Backspace");
    }
    await page.keyboard.type(text, delay === undefined ? undefined : { delay });
    return {
        ...bridgeResult,
        ok: true,
        operation: "type_text",
        point,
        textLength: text.length,
        clearExisting: params.clearExisting !== false,
    };
}
/** 通过 Preview Bridge 执行游戏运行态操作，并按需补齐真实鼠标/键盘输入。 */
async function performRuntimeOperation(page, params) {
    const bridgeResult = await operateRuntimeBridge(page, params);
    if (bridgeResult.ok !== true)
        return bridgeResult;
    if (params.action === "nodePointer") {
        return performNodePointer(page, params, bridgeResult);
    }
    if (params.action === "nodeInput") {
        return performNodeInput(page, params, bridgeResult);
    }
    return bridgeResult;
}

/** 仅供一次已排他手势使用的短输入适配器，绝不接受任意 CDP 方法。 */
class GestureInput {
    page;
    cdp;
    inputId;
    device;
    button = 'left';
    mouseMayBeDown = false;
    touchMayBeDown = false;
    contacts = new Map();
    retired = new Set();
    /** 绑定当前run的鼠标和CDP触摸端口。 */
    constructor(page, cdp) {
        this.page = page;
        this.cdp = cdp;
    }
    /** 绑定调用身份并执行一帧；真实状态仅在每个原语确认后提交。 */
    async apply(params) {
        if (!params.inputId || !['mouse', 'touch'].includes(params.device)
            || !['frame', 'end', 'cancel'].includes(params.operation))
            throw new BrowserHelperError('input.invalid', 'Invalid private gesture frame');
        if (this.inputId && (this.inputId !== params.inputId || this.device !== params.device)) {
            throw new BrowserHelperError('input.owner_changed', 'Another gesture owns this input device');
        }
        if (params.operation !== 'frame') {
            if (!this.inputId)
                return { released: true };
            await this.release(params.operation);
            return { released: true };
        }
        this.inputId = params.inputId;
        this.device = params.device;
        if (params.device === 'mouse') {
            if (!Number.isFinite(params.x) || !Number.isFinite(params.y))
                throw new BrowserHelperError('input.invalid', 'Invalid mouse point');
            const button = params.button ?? 'left';
            if (!['left', 'right', 'middle'].includes(button))
                throw new BrowserHelperError('input.invalid', 'Invalid mouse button');
            if (this.mouseMayBeDown && this.button !== button)
                throw new BrowserHelperError('input.invalid', 'Mouse button changed');
            this.button = button;
            await this.page.mouse.move(params.x, params.y);
            if (!this.mouseMayBeDown) {
                this.mouseMayBeDown = true;
                await this.page.mouse.down({ button });
            }
        }
        else {
            const next = params.contacts;
            if (!Array.isArray(next) || next.length === 0 || next.length > 10 || next.some((point) => !Number.isSafeInteger(point.id) || point.id < 0 || !Number.isFinite(point.x) || !Number.isFinite(point.y)
                || this.retired.has(point.id)) || new Set(next.map((point) => point.id)).size !== next.length) {
                throw new BrowserHelperError('input.invalid', 'Invalid touch contact lifecycle');
            }
            const desired = new Map(next.map((point) => [point.id, { ...point }]));
            const removed = [...this.contacts.values()].filter((point) => !desired.has(point.id));
            const added = next.filter((point) => !this.contacts.has(point.id));
            const moved = next.filter((point) => {
                const previous = this.contacts.get(point.id);
                return previous && (previous.x !== point.x || previous.y !== point.y);
            });
            if (removed.length) {
                await this.dispatch('touchEnd', removed);
                for (const point of removed) {
                    this.contacts.delete(point.id);
                    this.retired.add(point.id);
                }
            }
            if (added.length) {
                this.touchMayBeDown = true;
                await this.dispatch('touchStart', added);
                for (const point of added)
                    this.contacts.set(point.id, { ...point });
            }
            if (moved.length) {
                await this.dispatch('touchMove', moved);
                for (const point of moved)
                    this.contacts.set(point.id, { ...point });
            }
        }
        return { released: false };
    }
    /** 清理即使原请求已取消也必须执行；失败保留不确定状态供隔离。 */
    async release(mode) {
        if (this.mouseMayBeDown) {
            await this.page.mouse.up({ button: this.button });
            this.mouseMayBeDown = false;
        }
        if (this.touchMayBeDown) {
            await this.dispatch(mode === 'cancel' ? 'touchCancel' : 'touchEnd', []);
            this.touchMayBeDown = false;
        }
        this.contacts.clear();
        this.retired.clear();
        this.inputId = undefined;
        this.device = undefined;
    }
    /** 固定私有协议映射；非空 touchEnd 是锁定 Chromium 探针验证的被移除集合。 */
    async dispatch(type, touchPoints) {
        await this.cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    }
}

/** 所有first-party入口共享的唯一项目相对存储布局。 */
const PROJECT_DATA_LAYOUT = Object.freeze({
    dataRoot: '.gameagent/.data',
    marker: '.gameagent/.data/layout.json',
    sessionRoot: '.gameagent/.data/session',
    sessionIndex: '.gameagent/.data/session/index.json',
    sessionWorkspace: '.gameagent/.data/session/workspace.json',
    sessionRecords: '.gameagent/.data/session/records',
    sessionWorkflows: '.gameagent/.data/session/workflows',
    sessionLogs: '.gameagent/.data/session/logs',
    sessionSubagentLogs: '.gameagent/.data/session/subagent-logs',
    sessionImportedLogs: '.gameagent/.data/session/imported-logs',
    sessionActiveLogSpool: '.gameagent/.data/session/active-log-spool',
    sessionImages: '.gameagent/.data/session/images',
    sessionUserImages: '.gameagent/.data/session/user-images',
    sessionRecovery: '.gameagent/.data/session/recovery',
    sessionJournals: '.gameagent/.data/session/journals',
    sessionSubagentContext: '.gameagent/.data/session/subagent-context',
    sessionLifecycle: '.gameagent/.data/session/lifecycle',
    sessionDevtools: '.gameagent/.data/session/devtools',
    imageImports: '.gameagent/.data/session/staging/image-imports',
    imageProcessing: '.gameagent/.data/session/staging/image-processing',
    userImageImports: '.gameagent/.data/session/staging/user-image-imports',
    userImageProcessing: '.gameagent/.data/session/staging/user-image-processing',
    userImageSubmissions: '.gameagent/.data/session/staging/user-image-submissions',
    memory: '.gameagent/.data/memorys',
    gameAssets: '.gameagent/.data/game-assets/v1',
    toolTransactions: '.gameagent/.data/tool-transactions',
    bash: '.gameagent/.data/bash',
    gameTests: '.gameagent/.data/game-tests',
    workflowRuntime: '.gameagent/.data/workflow-runtime',
    pythonRuntime: '.gameagent/.data/python-runtime',
    pythonSupply: '.gameagent/.data/runtime-resources/python',
    cocos2dAssets: '.gameagent/.data/cocos-2d-assets',
    packageIntakeBroker: '.gameagent/.data/package-intake-broker',
    externalCli: '.gameagent/.data/external-cli/v1',
    diagnostics: '.gameagent/.data/diagnostics',
});
/** 当前唯一受支持的磁盘布局；不兼容旧目录或无标记非空根。 */
const PROJECT_DATA_MARKER = Object.freeze({ schema: 'game-agent.project-data', version: 1 });

/** 仅接受显式绝对项目根；绝不把相对输入解析到进程cwd。 */
function resolveProjectStoragePaths(projectRoot) {
    if (typeof projectRoot !== 'string' || !projectRoot.trim() || !path__namespace.isAbsolute(projectRoot) || projectRoot.includes('\0')) {
        throw new Error('PROJECT_STORAGE_ROOT_UNAVAILABLE');
    }
    const root = path__namespace.resolve(projectRoot);
    /** 从同源布局解析当前项目绝对路径。 */ const at = (key) => path__namespace.join(root, PROJECT_DATA_LAYOUT[key]);
    return Object.freeze({
        projectRoot: root, dataRoot: at('dataRoot'), marker: at('marker'),
        session: Object.freeze({
            root: at('sessionRoot'), index: at('sessionIndex'), workspace: at('sessionWorkspace'), records: at('sessionRecords'),
            workflows: at('sessionWorkflows'), logs: at('sessionLogs'), subagentLogs: at('sessionSubagentLogs'),
            importedLogs: at('sessionImportedLogs'), activeLogSpool: at('sessionActiveLogSpool'),
            images: at('sessionImages'), userImages: at('sessionUserImages'), recovery: at('sessionRecovery'),
            journals: at('sessionJournals'), subagentContext: at('sessionSubagentContext'),
            lifecycle: at('sessionLifecycle'), devtools: at('sessionDevtools'),
            staging: Object.freeze({ imageImports: at('imageImports'), imageProcessing: at('imageProcessing'),
                userImageImports: at('userImageImports'), userImageProcessing: at('userImageProcessing'),
                userImageSubmissions: at('userImageSubmissions') }),
        }),
        memory: at('memory'), gameAssets: at('gameAssets'), toolTransactions: at('toolTransactions'),
        bash: at('bash'), gameTests: at('gameTests'), workflowRuntime: at('workflowRuntime'),
        pythonRuntime: at('pythonRuntime'), pythonSupply: at('pythonSupply'), cocos2dAssets: at('cocos2dAssets'),
        packageIntakeBroker: at('packageIntakeBroker'), externalCli: at('externalCli'), diagnostics: at('diagnostics'),
    });
}

/** 仅将 ENOENT 视为路径缺失。 */
function missing(error) { return error?.code === 'ENOENT'; }
/** 获取不跟随链接的文件事实，缺失时返回空。 */
function* stat(target) {
    try {
        return (yield { method: 'lstat', args: [target] });
    }
    catch (error) {
        if (missing(error))
            return undefined;
        throw error;
    }
}
/** 逐层拒绝链接、类型冲突和逃离项目根的真实路径。 */
function* validateStoragePath(paths, target) {
    const relative = path__namespace.relative(paths.projectRoot, path__namespace.resolve(target));
    if (relative.startsWith(`..${path__namespace.sep}`) || relative === '..' || path__namespace.isAbsolute(relative))
        throw new Error('PROJECT_STORAGE_PATH_ESCAPE');
    let cursor = paths.projectRoot;
    let realRoot;
    for (const segment of ['', ...relative.split(path__namespace.sep)]) {
        if (segment)
            cursor = path__namespace.join(cursor, segment);
        const entry = yield* stat(cursor);
        if (!entry)
            return;
        if (entry.isSymbolicLink)
            throw new Error('PROJECT_STORAGE_SYMLINK');
        if (path__namespace.relative(cursor, path__namespace.resolve(target)) !== '' && !entry.isDirectory)
            throw new Error('PROJECT_STORAGE_ANCESTOR_INVALID');
        const real = (yield { method: 'realpath', args: [cursor] });
        if (!realRoot)
            realRoot = real;
        const expectedReal = path__namespace.resolve(realRoot, path__namespace.relative(paths.projectRoot, cursor));
        if (path__namespace.relative(expectedReal, real) !== '')
            throw new Error('PROJECT_STORAGE_PATH_ESCAPE');
    }
}
/** 严格验证当前布局标记，不接受未知字段或版本。 */
function* markerValid(paths) {
    const entry = yield* stat(paths.marker);
    if (!entry)
        return false;
    if (!entry.isFile || entry.isSymbolicLink)
        throw new Error('PROJECT_STORAGE_MARKER_INVALID');
    const marker = (yield { method: 'readJson', args: [paths.marker] });
    if (!marker || marker.schema !== PROJECT_DATA_MARKER.schema || marker.version !== PROJECT_DATA_MARKER.version || Object.keys(marker).length !== 2)
        throw new Error('PROJECT_STORAGE_MARKER_INVALID');
    return true;
}
/** Shared protocol interpreted by worker-backed async IO and standalone synchronous skill IO. */
/** 向异步 I/O 和独立同步入口提供同一布局初始化协议。 */
function* projectLayoutProtocol(paths, write) {
    yield* validateStoragePath(paths, paths.marker);
    if (yield* markerValid(paths))
        return;
    const root = yield* stat(paths.dataRoot);
    if (root && !root.isDirectory)
        throw new Error('PROJECT_STORAGE_ROOT_INVALID');
    yield { method: 'mkdir', args: [paths.dataRoot, { recursive: true }] };
    const lock = path__namespace.join(paths.dataRoot, '.initializing');
    const ownerPath = path__namespace.join(lock, 'owner.json');
    const owner = { schema: 'game-agent.layout-initializer/v1', pid: process.pid, nonce: node_crypto.randomBytes(16).toString('hex') };
    let acquired = false;
    for (let attempt = 0; attempt < 100; attempt++) {
        try {
            yield { method: 'mkdir', args: [lock] };
            acquired = true;
            break;
        }
        catch (error) {
            if (error?.code !== 'EEXIST')
                throw error;
            if (yield* markerValid(paths))
                return;
            yield* validateStoragePath(paths, ownerPath);
            const ownerEntry = yield* stat(ownerPath);
            if (ownerEntry?.isFile) {
                let previous;
                try {
                    previous = (yield { method: 'readJson', args: [ownerPath] });
                }
                catch (readError) {
                    if (missing(readError))
                        continue;
                    throw readError;
                }
                if (previous?.schema === owner.schema && Number.isSafeInteger(previous.pid) && previous.pid > 0
                    && typeof previous.nonce === 'string' && /^[a-f0-9]{32}$/.test(previous.nonce)
                    && (yield { method: 'processStopped', args: [previous.pid] })) {
                    const contents = (yield { method: 'readdir', args: [lock] });
                    if (contents.length !== 1 || contents[0] !== 'owner.json')
                        throw new Error('PROJECT_STORAGE_INITIALIZER_INVALID');
                    const confirmed = (yield { method: 'readJson', args: [ownerPath] });
                    if (confirmed.nonce !== previous.nonce || confirmed.pid !== previous.pid)
                        throw new Error('PROJECT_STORAGE_INITIALIZER_CHANGED');
                    yield { method: 'rm', args: [lock, { recursive: true, force: false }] };
                    continue;
                }
            }
            yield { method: 'wait', args: [20] };
            yield* validateStoragePath(paths, paths.marker);
            if (yield* markerValid(paths))
                return;
        }
    }
    if (!acquired)
        throw new Error('PROJECT_STORAGE_INITIALIZATION_BUSY');
    try {
        yield { method: 'writeJsonAtomic', args: [ownerPath, owner] };
        yield* validateStoragePath(paths, paths.marker);
        if (yield* markerValid(paths))
            return;
        const names = (yield { method: 'readdir', args: [paths.dataRoot] });
        if (names.some(name => name !== '.initializing'))
            throw new Error('PROJECT_STORAGE_UNMARKED_DATA');
        yield { method: 'writeJsonAtomic', args: [paths.marker, PROJECT_DATA_MARKER] };
    }
    finally {
        yield* validateStoragePath(paths, lock);
        const confirmed = (yield { method: 'readJson', args: [ownerPath] });
        if (confirmed.nonce !== owner.nonce || confirmed.pid !== owner.pid)
            throw new Error('PROJECT_STORAGE_INITIALIZER_CHANGED');
        yield { method: 'rm', args: [lock, { recursive: true, force: true }] };
    }
}

/** Only ESRCH proves the recorded owner has stopped; permission/unknown errors retain it. */
/** 仅 ESRCH 证明进程已退出；权限和未知错误保留所有权。 */
function processHasStopped(pid) {
    try {
        process.kill(pid, 0);
        return false;
    }
    catch (error) {
        return error?.code === 'ESRCH';
    }
}

/** 仅独立 Node helper 与 CJS 技能使用同步文件系统解释此协议。 */
function ensureProjectDataLayout(projectRoot) {
    const protocol = projectLayoutProtocol(resolveProjectStoragePaths(projectRoot));
    let next = protocol.next();
    while (!next.done) {
        try {
            const { method, args } = next.value;
            const target = args[0];
            let value;
            switch (method) {
                case 'lstat': {
                    const s = fs__namespace.lstatSync(target);
                    value = { isFile: s.isFile(), isDirectory: s.isDirectory(), isSymbolicLink: s.isSymbolicLink() };
                    break;
                }
                case 'readJson':
                    value = JSON.parse(fs__namespace.readFileSync(target, 'utf8'));
                    break;
                case 'realpath':
                    value = fs__namespace.realpathSync(target);
                    break;
                case 'readdir':
                    value = fs__namespace.readdirSync(target);
                    break;
                case 'mkdir':
                    value = fs__namespace.mkdirSync(target, args[1]);
                    break;
                case 'rm':
                    value = fs__namespace.rmSync(target, args[1]);
                    break;
                case 'wait':
                    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, args[0]);
                    break;
                case 'processStopped':
                    value = processHasStopped(args[0]);
                    break;
                case 'writeJsonAtomic': {
                    const temporary = path__namespace.join(path__namespace.dirname(target), `.layout-${process.pid}-${node_crypto.randomBytes(8).toString('hex')}.tmp`);
                    try {
                        const fd = fs__namespace.openSync(temporary, 'wx', 0o600);
                        try {
                            fs__namespace.writeFileSync(fd, JSON.stringify(args[1]));
                            fs__namespace.fsyncSync(fd);
                        }
                        finally {
                            fs__namespace.closeSync(fd);
                        }
                        fs__namespace.renameSync(temporary, target);
                    }
                    finally {
                        if (fs__namespace.existsSync(temporary))
                            fs__namespace.unlinkSync(temporary);
                    }
                    break;
                }
            }
            next = protocol.next(value);
        }
        catch (error) {
            next = protocol.throw(error);
        }
    }
}

const DEFAULT_PER_RUN_ARTIFACT_QUOTA_BYTES = 256 * 1024 * 1024;
const DEFAULT_PER_PROJECT_ARTIFACT_QUOTA_BYTES = 1024 * 1024 * 1024;
/** 将会话或 run 标识归一化为安全的本地路径片段。 */
function safeSegment(value) {
    if (!/^[a-zA-Z0-9_-][a-zA-Z0-9._-]{0,159}$/.test(value) || value === "unknown") {
        throw new BrowserHelperError("artifact.out_of_scope", "测试产物身份不合法。");
    }
    return value;
}
/** 复验每个现存目录段和最终对象，禁止链接祖先跨越项目边界。 */
async function assertArtifactPath(projectRoot, target) {
    const root = path__namespace.resolve(projectRoot);
    const relative = path__namespace.relative(root, path__namespace.resolve(target));
    if (!relative || relative === ".." || relative.startsWith(`..${path__namespace.sep}`) || path__namespace.isAbsolute(relative)) {
        throw new BrowserHelperError("artifact.out_of_scope", "测试产物路径越界。");
    }
    const rootStat = await fs__namespace$1.lstat(root);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink())
        throw new BrowserHelperError("artifact.out_of_scope", "项目目录身份不合法。");
    const realRoot = await fs__namespace$1.realpath(root);
    let current = root;
    for (const segment of relative.split(path__namespace.sep)) {
        current = path__namespace.join(current, segment);
        let stat;
        try {
            stat = await fs__namespace$1.lstat(current);
        }
        catch (error) {
            if (error.code === "ENOENT")
                return;
            throw error;
        }
        const realRelative = path__namespace.relative(realRoot, await fs__namespace$1.realpath(current));
        if (stat.isSymbolicLink() || realRelative === ".." || realRelative.startsWith(`..${path__namespace.sep}`)
            || path__namespace.isAbsolute(realRelative) || (current !== path__namespace.resolve(target) && !stat.isDirectory())) {
            throw new BrowserHelperError("artifact.out_of_scope", "测试产物包含不安全目录或链接。");
        }
    }
}
/** 创建用于浏览器预览测试 run 的短随机标识。 */
function createRunId(now = Date.now()) {
    const suffix = Math.random().toString(36).slice(2, 10);
    return `${now.toString(36)}-${suffix}`;
}
/** 管理单个浏览器预览测试 run 的本地测试产物。 */
class ArtifactStore {
    projectRoot;
    runId;
    perRunQuotaBytes;
    rootDir;
    runDir;
    artifacts = new Map();
    /** 根据项目根、会话和 run 标识初始化产物根目录路径。 */
    constructor(projectRoot, sessionId, runId, perRunQuotaBytes = DEFAULT_PER_RUN_ARTIFACT_QUOTA_BYTES) {
        this.projectRoot = projectRoot;
        this.runId = runId;
        this.perRunQuotaBytes = perRunQuotaBytes;
        this.rootDir = path__namespace.join(projectRoot, PROJECT_DATA_LAYOUT.gameTests, safeSegment(sessionId));
        this.runDir = path__namespace.join(this.rootDir, safeSegment(runId));
    }
    /** 创建 run 目录并写入初始 run 元数据。 */
    async init(metadata) {
        ensureProjectDataLayout(this.projectRoot);
        await assertArtifactPath(this.projectRoot, this.runDir);
        await fs__namespace$1.mkdir(this.runDir, { recursive: true });
        await this.writeMetadata("run.json", metadata, { enforceQuota: false });
    }
    /** 写入 JSON 元数据产物，并按需执行单 run 配额校验。 */
    async writeMetadata(fileName, payload, options = {}) {
        ensureProjectDataLayout(this.projectRoot);
        await assertArtifactPath(this.projectRoot, this.runDir);
        await fs__namespace$1.mkdir(this.runDir, { recursive: true });
        const absolutePath = path__namespace.join(this.runDir, safeSegment(fileName));
        await assertArtifactPath(this.projectRoot, absolutePath);
        await fs__namespace$1.writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
        if (options.enforceQuota !== false) {
            await this.enforceRunQuota(absolutePath);
        }
        const stat = await fs__namespace$1.stat(absolutePath);
        return this.record({
            id: fileName,
            kind: "metadata",
            path: absolutePath,
            relativePath: path__namespace.relative(this.projectRoot, absolutePath),
            mimeType: "application/json",
            createdAt: Date.now(),
            sizeBytes: stat.size,
        });
    }
    /** 将已落盘的截图登记为可查询测试产物。 */
    async recordScreenshot(fileName) {
        const absolutePath = path__namespace.join(this.runDir, safeSegment(fileName));
        await assertArtifactPath(this.projectRoot, absolutePath);
        await this.enforceRunQuota(absolutePath);
        const stat = await fs__namespace$1.stat(absolutePath);
        return this.record({
            id: fileName,
            kind: "screenshot",
            path: absolutePath,
            relativePath: path__namespace.relative(this.projectRoot, absolutePath),
            mimeType: "image/png",
            createdAt: Date.now(),
            sizeBytes: stat.size,
        });
    }
    /** 校验单 run 产物目录大小，超额时删除当前尝试写入的文件。 */
    async enforceRunQuota(absolutePath) {
        const runBytes = await directorySize(this.runDir);
        if (runBytes > this.perRunQuotaBytes) {
            await fs__namespace$1.rm(absolutePath, { force: true });
            throw new BrowserHelperError("artifact_size_exceeded", "当前预览测试运行的产物大小已超过单 run 配额。", {
                runId: this.runId,
                quotaBytes: this.perRunQuotaBytes,
                attemptedBytes: runBytes,
            });
        }
    }
    /** 按插入顺序返回最近登记的内存产物记录。 */
    list(limit = 50) {
        return [...this.artifacts.values()].slice(-limit);
    }
    /** 从内存索引中查询指定产物记录。 */
    get(artifactId) {
        return this.artifacts.get(artifactId) ?? null;
    }
    /** 将产物记录写入单 run 内存索引。 */
    record(artifact) {
        this.artifacts.set(artifact.id, artifact);
        return artifact;
    }
}
/** 返回指定项目和会话的测试产物根目录。 */
function artifactRoot(projectRoot, sessionId) {
    return path__namespace.join(projectRoot, PROJECT_DATA_LAYOUT.gameTests, safeSegment(sessionId));
}
/** 返回指定项目下所有浏览器测试产物的根目录。 */
function gameTestsRoot(projectRoot) {
    return path__namespace.join(projectRoot, PROJECT_DATA_LAYOUT.gameTests);
}
/** 递归计算目录内普通文件的总字节数。 */
async function directorySize(dir) {
    let total = 0;
    let entries;
    try {
        entries = await fs__namespace$1.readdir(dir, { withFileTypes: true });
    }
    catch (error) {
        if (error.code === "ENOENT")
            return 0;
        throw error;
    }
    for (const entry of entries) {
        const absolutePath = path__namespace.join(dir, entry.name);
        if (entry.isDirectory()) {
            total += await directorySize(absolutePath);
            continue;
        }
        if (entry.isFile()) {
            total += (await fs__namespace$1.stat(absolutePath)).size;
        }
    }
    return total;
}
/** 找出已写入 close 元数据且不属于当前 active run 的历史 run 目录。 */
async function completedRunDirs(projectRoot, activeRunDirs) {
    const root = gameTestsRoot(projectRoot);
    await assertArtifactPath(projectRoot, root);
    const completed = [];
    let sessions;
    try {
        sessions = await fs__namespace$1.readdir(root, { withFileTypes: true });
    }
    catch (error) {
        if (error.code === "ENOENT")
            return [];
        throw error;
    }
    for (const session of sessions) {
        if (!session.isDirectory())
            continue;
        const sessionDir = path__namespace.join(root, session.name);
        const runs = await fs__namespace$1.readdir(sessionDir, { withFileTypes: true }).catch(() => []);
        for (const run of runs) {
            if (!run.isDirectory())
                continue;
            const runDir = path__namespace.resolve(sessionDir, run.name);
            if (activeRunDirs.has(runDir))
                continue;
            const closePath = path__namespace.join(runDir, "close.json");
            try {
                const stat = await fs__namespace$1.stat(closePath);
                completed.push({
                    dir: runDir,
                    mtimeMs: stat.mtimeMs,
                    sizeBytes: await directorySize(runDir),
                });
            }
            catch {
                // Runs without close metadata may still be active or incomplete; never auto-delete them.
            }
        }
    }
    return completed.sort((a, b) => a.mtimeMs - b.mtimeMs);
}
/** 删除最旧的已完成 run 目录，直到项目级产物总量回到配额内。 */
async function enforceProjectArtifactQuota(options) {
    const root = gameTestsRoot(options.projectRoot);
    await assertArtifactPath(options.projectRoot, root);
    let total = await directorySize(root);
    const deletedRunDirs = [];
    for (const run of await completedRunDirs(options.projectRoot, options.activeRunDirs)) {
        if (total <= options.quotaBytes)
            break;
        await assertArtifactPath(options.projectRoot, run.dir);
        await fs__namespace$1.rm(run.dir, { recursive: true, force: true });
        total -= run.sizeBytes;
        deletedRunDirs.push(run.dir);
    }
    return { deletedRunDirs, remainingBytes: Math.max(0, total) };
}
/** 将磁盘文件 stat 信息转换为 GameTestArtifact 记录。 */
function toArtifact(projectRoot, absolutePath, statMtime, sizeBytes) {
    const id = path__namespace.basename(absolutePath);
    const ext = path__namespace.extname(absolutePath).toLowerCase();
    return {
        id,
        kind: ext === ".png" ? "screenshot" : "metadata",
        path: absolutePath,
        relativePath: path__namespace.relative(projectRoot, absolutePath),
        mimeType: ext === ".png" ? "image/png" : "application/json",
        createdAt: statMtime,
        sizeBytes,
    };
}
/** 从磁盘扫描指定会话或 run 的测试产物记录。 */
async function listArtifactsOnDisk(options) {
    const root = options.runId
        ? path__namespace.join(artifactRoot(options.projectRoot, options.sessionId), safeSegment(options.runId))
        : artifactRoot(options.projectRoot, options.sessionId);
    const output = [];
    /** 深度优先遍历产物目录，并受 limit 控制提前停止。 */
    async function walk(dir) {
        let entries;
        try {
            entries = await fs__namespace$1.readdir(dir, { withFileTypes: true });
        }
        catch (error) {
            if (error.code === "ENOENT")
                return;
            throw error;
        }
        for (const entry of entries) {
            if (output.length >= (options.limit ?? 100))
                return;
            const absolutePath = path__namespace.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(absolutePath);
                continue;
            }
            if (!entry.isFile())
                continue;
            const stat = await fs__namespace$1.stat(absolutePath);
            output.push(toArtifact(options.projectRoot, absolutePath, stat.mtimeMs, stat.size));
        }
    }
    await assertArtifactPath(options.projectRoot, root);
    await walk(root);
    return output.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
/** 从磁盘查找单个产物，并校验结果仍位于会话产物目录内。 */
async function getArtifactOnDisk(options) {
    const root = artifactRoot(options.projectRoot, options.sessionId);
    const artifacts = await listArtifactsOnDisk({
        projectRoot: options.projectRoot,
        sessionId: options.sessionId,
        runId: options.runId,
        limit: 500,
    });
    const artifact = artifacts.find((item) => item.id === options.artifactId || item.relativePath.endsWith(options.artifactId));
    if (!artifact) {
        throw new BrowserHelperError("artifact.not_found", "未找到指定测试产物。", { artifactId: options.artifactId });
    }
    const resolved = path__namespace.resolve(artifact.path);
    const resolvedRoot = path__namespace.resolve(root);
    if (!resolved.startsWith(`${resolvedRoot}${path__namespace.sep}`)) {
        throw new BrowserHelperError("artifact.out_of_scope", "测试产物路径越界。");
    }
    return artifact;
}
/** 清理指定会话或 run 的测试产物目录，并拒绝越界路径。 */
async function cleanupArtifacts(options) {
    const sessionRoot = path__namespace.resolve(artifactRoot(options.projectRoot, options.sessionId));
    const target = options.scope === "run"
        ? path__namespace.resolve(sessionRoot, safeSegment(options.runId ?? ""))
        : sessionRoot;
    if (options.scope === "run" && (!options.runId || options.runId.trim().length === 0)) {
        throw new BrowserHelperError("artifact.missing_run_id", "清理单个 run 产物时必须提供 runId。");
    }
    if (target !== sessionRoot && !target.startsWith(`${sessionRoot}${path__namespace.sep}`)) {
        throw new BrowserHelperError("artifact.out_of_scope", "测试产物清理路径越界。");
    }
    await assertArtifactPath(options.projectRoot, target);
    await fs__namespace$1.rm(target, { recursive: true, force: true });
    return {
        deletedPath: target,
        scope: options.scope,
        runId: options.scope === "run" ? options.runId : undefined,
    };
}

const MAX_DIAGNOSTICS = 500;
const ERROR_DEDUPE_WINDOW_MS = 1_000;
const MAX_LOG_TEXT = 2_048;
const MAX_STACK_CHARACTERS = 4_096;
const MAX_STACK_FRAMES = 12;
const MAX_LOG_PAGE_BYTES = 32 * 1024;
const MAX_LOG_ENTRY_BYTES = 16 * 1024;
const MAX_LOG_CURSORS = 128;
const SECRET_KEY_PATTERN = /(?:authorization|cookie|set-cookie|x-api-key|api[-_]?key|access[-_]?token|refresh[-_]?token|token|secret|password|passwd|session|signature|sig)/i;
const SECRET_TEXT_PATTERN = /\b(authorization|cookie|set-cookie|x-api-key|api[-_]?key|access[-_]?token|refresh[-_]?token|token|secret|password|passwd|session|signature|sig)(\s*[:=]\s*)(["']?)[^"',\s&}]+/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const LOCAL_PATH_PATTERN = /(?:\/Users\/|\/private\/|\/var\/folders\/|[A-Za-z]:\\)[^\s"',)]+/g;
/** 将元素追加到固定长度数组，并裁剪掉最旧的超额元素。 */
function boundedPush(items, item) {
    items.push(item);
    if (items.length > MAX_DIAGNOSTICS) {
        items.splice(0, items.length - MAX_DIAGNOSTICS);
    }
}
/** 将 console 参数转换为可存储字符串，无法 JSON 化时退回 String。 */
function stringifyArg(value) {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
}
/** 对 URL 中的凭证和敏感 query 参数做脱敏。 */
function redactUrl(value) {
    try {
        const url = new URL(value);
        if (url.username)
            url.username = "[redacted]";
        if (url.password)
            url.password = "[redacted]";
        for (const key of [...url.searchParams.keys()]) {
            if (SECRET_KEY_PATTERN.test(key)) {
                url.searchParams.set(key, "[redacted]");
            }
        }
        return url.toString();
    }
    catch {
        return value;
    }
}
/** 对任意文本中的 URL、Bearer、键值密钥和本地路径做脱敏。 */
function redactString(value) {
    const withUrlRedaction = value.replace(/https?:\/\/[^\s"',)]+/gi, (match) => redactUrl(match));
    return withUrlRedaction
        .replace(BEARER_PATTERN, "Bearer [redacted]")
        .replace(SECRET_TEXT_PATTERN, (_match, key, separator, quote) => `${key}${separator}${quote}[redacted]`)
        .replace(LOCAL_PATH_PATTERN, "[local-path]");
}
/** 对浅层记录中的敏感字段和值做脱敏。 */
function redactRecord(value) {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
        if (SECRET_KEY_PATTERN.test(key)) {
            output[key] = "[redacted]";
        }
        else if (typeof item === "string") {
            output[key] = key.toLowerCase() === "url" ? redactUrl(item) : redactString(item);
        }
        else {
            output[key] = item;
        }
    }
    return output;
}
/** 递归脱敏数组、对象和字符串值。 */
function redactValue(value) {
    if (Array.isArray(value)) {
        return value.map(redactValue);
    }
    if (value && typeof value === "object") {
        return redactRecord(value);
    }
    if (typeof value === "string") {
        return redactString(value);
    }
    return value;
}
/** 从 CDP exception payload 中提取最可读的异常文本。 */
function extractCdpExceptionText(payload) {
    const details = payload && typeof payload === "object"
        ? payload.exceptionDetails
        : undefined;
    const description = details?.exception?.description;
    if (typeof description === "string" && description.trim().length > 0) {
        return description;
    }
    const text = details?.text;
    if (typeof text === "string" && text.trim().length > 0) {
        return text;
    }
    return stringifyArg(payload).slice(0, 2000);
}
/** 归一化错误文本，用于短时间窗口内重复错误去重。 */
function normalizeErrorSignature(text) {
    return redactString(text)
        .split(/\r?\n/, 1)[0]
        .replace(/^\s*(?:uncaught\s+)?(?:error|typeerror|referenceerror|rangeerror|syntaxerror):\s*/i, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}
/** 保留游戏调用栈的有限帧，不把大响应或宿主秘密带入诊断。 */
function boundedStack(value) {
    if (typeof value !== "string" || !value.trim())
        return undefined;
    return redactString(value).split(/\r?\n/, MAX_STACK_FRAMES + 1)
        .map((line) => line.slice(0, 600)).join("\n").slice(0, MAX_STACK_CHARACTERS);
}
/** 标记发生的截断，脱敏本身不算证据丢失。 */
function stackWasTruncated(value) {
    if (typeof value !== "string")
        return false;
    const redacted = redactString(value);
    const lines = redacted.split(/\r?\n/);
    return redacted.length > MAX_STACK_CHARACTERS || lines.length > MAX_STACK_FRAMES + 1
        || lines.some((line) => line.length > 600);
}
/** 第一个已知调用点不同的错误不能只因消息相同而合并。 */
function firstStackFrame(stack) {
    return stack?.split("\n").map((line) => line.trim()).find((line) => line.startsWith("at "));
}
/** 定位只保留有界标量，不把外部嵌套对象带入日志页。 */
function boundedLocation(location) {
    if (!location)
        return undefined;
    const result = Object.fromEntries(Object.entries(location).slice(0, 6)
        .filter(([, value]) => typeof value === "string" || typeof value === "number")
        .map(([key, value]) => [key.slice(0, 80), typeof value === "string" ? value.slice(0, 512) : value]));
    return redactRecord(result);
}
/** 早期错误不保留 console 参数；详情有独立上限，并继续计入整页预算。 */
function compactEarlyError(entry) {
    const compact = { ...entry };
    if (compact.args?.length)
        compact.truncated = true;
    delete compact.args;
    while (Buffer.byteLength(JSON.stringify(compact), "utf8") > 3 * 1024) {
        compact.truncated = true;
        if ((compact.stack?.length ?? 0) > 256)
            compact.stack = compact.stack.slice(0, Math.floor(compact.stack.length / 2));
        else if (compact.text.length > 256)
            compact.text = compact.text.slice(0, Math.floor(compact.text.length / 2));
        else {
            delete compact.location;
            break;
        }
    }
    return compact;
}
/** 缓存浏览器预览页的 console、page error、CDP 异常和网络事件。 */
class DiagnosticsBuffer {
    nextLogId = 1;
    nextNetworkId = 1;
    logs = [];
    network = [];
    recentErrorSignatures = new Map();
    logCursors = new Map();
    discardedThroughLogId = 0;
    earlyErrors = [];
    earlyErrorsTruncated = false;
    /** 首批不同错误独立于近期环形缓冲保留，已知不同调用位置不混并。 */
    retainEarlyError(entry) {
        if (entry.level !== "error")
            return;
        const signature = normalizeErrorSignature(entry.text);
        const frame = firstStackFrame(entry.stack);
        const existing = this.earlyErrors.find((item) => item.signature === signature
            && (!frame || !item.frame || item.frame === frame));
        if (existing) {
            if ((entry.stack?.length ?? 0) > (existing.entry.stack?.length ?? 0)) {
                existing.entry = compactEarlyError({ ...entry, id: existing.entry.id, timestamp: existing.entry.timestamp });
                existing.frame = frame ?? existing.frame;
            }
            return;
        }
        if (this.earlyErrors.length >= 4) {
            this.earlyErrorsTruncated = true;
            return;
        }
        this.earlyErrors.push({ signature, frame, entry: compactEarlyError(entry) });
    }
    /** 分配观察 ID；只记录环形缓冲真正淘汰的日志位置。 */
    appendLog(entry) {
        const log = { ...entry, id: this.nextLogId++ };
        log.location = boundedLocation(log.location);
        if (Buffer.byteLength(JSON.stringify(log), "utf8") > MAX_LOG_ENTRY_BYTES) {
            log.truncated = true;
            delete log.args;
            while (Buffer.byteLength(JSON.stringify(log), "utf8") > MAX_LOG_ENTRY_BYTES && (log.stack?.length ?? 0) > 256) {
                log.stack = log.stack.slice(0, Math.floor(log.stack.length / 2));
            }
            while (Buffer.byteLength(JSON.stringify(log), "utf8") > MAX_LOG_ENTRY_BYTES && log.text.length > 256) {
                log.text = log.text.slice(0, Math.floor(log.text.length / 2));
            }
        }
        this.retainEarlyError(log);
        this.logs.push(log);
        while (this.logs.length > MAX_DIAGNOSTICS) {
            this.discardedThroughLogId = Math.max(this.discardedThroughLogId, this.logs.shift().id);
        }
        return log;
    }
    /** 记录一条 console 日志，并脱敏参数与定位信息。 */
    addConsole(entry) {
        const text = redactString(entry.text);
        const args = entry.args?.slice(0, 10).map((arg) => stringifyArg(redactValue(arg)));
        this.appendLog({
            timestamp: Date.now(),
            level: entry.level,
            source: "console",
            text: text.slice(0, MAX_LOG_TEXT),
            args: args?.map((arg) => arg.slice(0, 1024)),
            ...((text.length > MAX_LOG_TEXT || (entry.args?.length ?? 0) > 10 || args?.some((arg) => arg.length > 1024))
                ? { truncated: true } : {}),
            location: entry.location ? redactRecord(entry.location) : undefined,
        });
    }
    /** 保留 pageerror 的名称和游戏调用栈，并合并同一异常的通道补充信息。 */
    addPageError(error) {
        const value = error && typeof error === "object" ? error : {};
        const text = redactString(typeof value.message === "string" ? value.message : String(error));
        this.addError({
            timestamp: Date.now(),
            level: "error",
            source: "pageerror",
            text: text.slice(0, MAX_LOG_TEXT),
            ...((text.length > MAX_LOG_TEXT || stackWasTruncated(value.stack)) ? { truncated: true } : {}),
            ...(typeof value.name === "string" ? { name: redactString(value.name).slice(0, 100) } : {}),
            ...(value.stack ? { stack: boundedStack(value.stack) } : {}),
        });
    }
    /** 记录 CDP Runtime.exceptionThrown 事件。 */
    addCdpException(payload) {
        const description = extractCdpExceptionText(payload);
        const details = payload?.exceptionDetails;
        const frames = details?.stackTrace?.callFrames?.slice(0, MAX_STACK_FRAMES);
        const first = frames?.[0] ?? details;
        const frameStack = frames?.map((frame) => `    at ${frame.functionName || "<anonymous>"} (${frame.url || "<unknown>"}:${(frame.lineNumber ?? 0) + 1}:${(frame.columnNumber ?? 0) + 1})`).join("\n");
        this.addError({
            timestamp: Date.now(),
            level: "error",
            source: "cdp",
            text: redactString(description.split(/\r?\n/, 1)[0]).slice(0, MAX_LOG_TEXT),
            ...(details?.exception?.className ? { name: redactString(details.exception.className).slice(0, 100) } : {}),
            stack: boundedStack(description.includes("\n") ? description : frameStack),
            ...((stackWasTruncated(description.includes("\n") ? description : frameStack)
                || (details?.stackTrace?.callFrames?.length ?? 0) > MAX_STACK_FRAMES) ? { truncated: true } : {}),
            ...(first?.url ? { location: redactRecord({
                    url: first.url.slice(0, 1024), lineNumber: first.lineNumber, columnNumber: first.columnNumber,
                }) } : {}),
        });
    }
    /** 记录一条网络事件，并脱敏 URL 与失败原因。 */
    addNetwork(entry) {
        boundedPush(this.network, {
            id: this.nextNetworkId++,
            timestamp: Date.now(),
            ...entry,
            url: redactUrl(entry.url),
            failureText: entry.failureText ? redactString(entry.failureText) : undefined,
        });
    }
    /** 查询最近的浏览器日志，支持按级别过滤并限制返回条数。 */
    queryLogs(options = {}) {
        const limit = Math.max(1, Math.min(options.limit ?? 100, 300));
        const items = options.level && options.level !== "all"
            ? this.logs.filter((entry) => entry.level === options.level)
            : this.logs;
        return items.slice(-limit);
    }
    /** 查询最近窗口或增量页；游标只保存在当前 run 的有界内存中。 */
    queryLogPage(options = {}) {
        const afterId = options.cursor === undefined ? undefined : this.logCursors.get(options.cursor);
        if (options.cursor !== undefined && afterId === undefined) {
            throw new BrowserHelperError("debug.cursor_invalid", "日志游标不属于当前运行或已过期，请重新查询日志基线。");
        }
        const limit = Math.max(1, Math.min(options.limit ?? 100, 300));
        const matching = this.logs.filter((entry) => (afterId === undefined || entry.id > afterId)
            && (!options.level || options.level === "all" || entry.level === options.level));
        const candidates = afterId === undefined ? [...matching].reverse() : matching;
        const logs = [];
        const includeErrors = !options.level || options.level === "all" || options.level === "error";
        const earlyErrors = includeErrors ? this.earlyErrors.map(({ entry }) => ({ ...entry })) : [];
        let bytes = 2 + Buffer.byteLength(JSON.stringify(earlyErrors), "utf8");
        for (const entry of candidates) {
            const entryBytes = Buffer.byteLength(JSON.stringify(entry), "utf8") + 1;
            if (logs.length >= limit || bytes + entryBytes > MAX_LOG_PAGE_BYTES - 256)
                break;
            logs.push(entry);
            bytes += entryBytes;
        }
        if (afterId === undefined)
            logs.reverse();
        const truncated = logs.length < matching.length;
        const position = afterId !== undefined && truncated
            ? (logs[logs.length - 1]?.id ?? afterId)
            : this.nextLogId - 1;
        const nextCursor = node_crypto.randomBytes(18).toString("hex");
        this.logCursors.set(nextCursor, position);
        while (this.logCursors.size > MAX_LOG_CURSORS)
            this.logCursors.delete(this.logCursors.keys().next().value);
        return {
            logs, nextCursor, truncated,
            logsLost: this.discardedThroughLogId > (afterId ?? 0),
            earlyErrors, earlyErrorsTruncated: includeErrors && this.earlyErrorsTruncated,
        };
    }
    /** 查询最近的网络事件并限制返回条数。 */
    queryNetwork(options = {}) {
        const limit = Math.max(1, Math.min(options.limit ?? 100, 300));
        return this.network.slice(-limit);
    }
    /** 合并短期同一异常；新增定位信息作为新观察，使增量读者不会漏掉。 */
    addError(entry) {
        const now = Date.now();
        const signature = normalizeErrorSignature(entry.text);
        for (const [key, previous] of [...this.recentErrorSignatures.entries()]) {
            if (now - previous.timestamp > ERROR_DEDUPE_WINDOW_MS) {
                this.recentErrorSignatures.delete(key);
            }
        }
        const previous = this.recentErrorSignatures.get(signature);
        const previousFrame = firstStackFrame(previous?.stack);
        const nextFrame = firstStackFrame(entry.stack);
        const sameLocation = !previousFrame || !nextFrame || previousFrame === nextFrame;
        if (previous && sameLocation && this.logs.includes(previous)) {
            const stack = (entry.stack?.length ?? 0) > (previous.stack?.length ?? 0) ? entry.stack : previous.stack;
            const location = entry.location ?? previous.location;
            const name = previous.name ?? entry.name;
            if (stack === previous.stack && name === previous.name
                && JSON.stringify(location) === JSON.stringify(previous.location))
                return;
            this.logs.splice(this.logs.indexOf(previous), 1);
            this.recentErrorSignatures.set(signature, this.appendLog({
                ...entry, text: previous.text, name, stack, location,
                ...((previous.truncated || entry.truncated) ? { truncated: true } : {}),
            }));
            return;
        }
        this.recentErrorSignatures.set(signature, this.appendLog(entry));
        while (this.recentErrorSignatures.size > MAX_DIAGNOSTICS) {
            this.recentErrorSignatures.delete(this.recentErrorSignatures.keys().next().value);
        }
    }
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
/** 校验预览 URL 只使用 http/https 且指向本机 loopback 地址。 */
function assertLoopbackPreviewUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    }
    catch {
        throw new BrowserHelperError("preview.invalid_url", "previewUrl 必须是有效 URL。", { previewUrl: rawUrl });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new BrowserHelperError("preview.unsupported_protocol", "预览 URL 只允许 http/https。", {
            protocol: parsed.protocol,
        });
    }
    if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
        throw new BrowserHelperError("preview.non_loopback_url", "预览 URL 必须指向 loopback 地址。", {
            hostname: parsed.hostname,
        });
    }
    return parsed.toString();
}

/** 从 CDP 性能响应中提取名称和值均合法的指标。 */
function normalizeCdpMetrics(metricsResult) {
    const metricsRecord = metricsResult && typeof metricsResult === "object"
        ? metricsResult
        : { metrics: [] };
    return Array.isArray(metricsRecord.metrics)
        ? (metricsRecord.metrics)
            .filter((metric) => typeof metric.name === "string" && typeof metric.value === "number")
            .map((metric) => ({ name: metric.name, value: metric.value }))
        : [];
}
/** 将页面内采样结果归一化为可计算帧率和 long task 摘要的数据。 */
function normalizePageFrameMetrics(pageMetrics) {
    const record = pageMetrics && typeof pageMetrics === "object"
        ? pageMetrics
        : {};
    const longTaskDurations = Array.isArray(record.longTaskDurations)
        ? record.longTaskDurations.filter((value) => typeof value === "number")
        : [];
    return {
        durationMs: typeof record.durationMs === "number" ? record.durationMs : 0,
        frameCount: typeof record.frameCount === "number" ? record.frameCount : 0,
        longTaskDurations,
    };
}
/** 根据采样时长和帧数计算一位小数的 FPS。 */
function calculateFps(frameCount, durationMs) {
    return durationMs > 0 ? Math.round((frameCount * 1000 / durationMs) * 10) / 10 : 0;
}
/** 在页面环境中采样 requestAnimationFrame 与 long task 指标。 */
function samplePageFrameMetrics(page) {
    return page.evaluate(async () => {
        const longTasks = typeof performance.getEntriesByType === "function"
            ? performance.getEntriesByType("longtask").map((entry) => entry.duration)
            : [];
        const started = performance.now();
        let frames = 0;
        await new Promise((resolve) => {
            /** 采样 requestAnimationFrame 次数以估算当前预览帧率。 */
            const tick = () => {
                frames += 1;
                if (performance.now() - started >= 250) {
                    resolve();
                }
                else {
                    requestAnimationFrame(tick);
                }
            };
            requestAnimationFrame(tick);
        });
        const durationMs = Math.max(1, performance.now() - started);
        return {
            durationMs,
            frameCount: frames,
            longTaskDurations: longTasks,
        };
    });
}
/** 收集 CDP 性能指标、页面帧采样和 long task 摘要。 */
async function collectBrowserPerformance(page, cdp) {
    await cdp.send("Performance.enable").catch(() => undefined);
    const metricsResult = await cdp.send("Performance.getMetrics").catch(() => ({ metrics: [] }));
    const pageMetrics = normalizePageFrameMetrics(await samplePageFrameMetrics(page));
    return {
        timestamp: Date.now(),
        cdpMetrics: normalizeCdpMetrics(metricsResult),
        frameSampling: {
            durationMs: pageMetrics.durationMs,
            frameCount: pageMetrics.frameCount,
            fps: calculateFps(pageMetrics.frameCount, pageMetrics.durationMs),
        },
        longTasks: {
            count: pageMetrics.longTaskDurations.length,
            totalDurationMs: pageMetrics.longTaskDurations.reduce((sum, value) => sum + value, 0),
            maxDurationMs: pageMetrics.longTaskDurations.reduce((max, value) => Math.max(max, value), 0),
        },
    };
}

const PLAYWRIGHT_FALLBACK_DOWNLOAD_HOST = "https://cdn.npmmirror.com/binaries/playwright";
const DEFAULT_DOWNLOAD_STALL_TIMEOUT_MS = 180_000;
const DEFAULT_TERMINATION_TIMEOUT_MS = 1_000;
const MAX_CLASSIFICATION_OUTPUT_CHARS = 64 * 1024;
/** 返回 Game Agent 专用的 Playwright 浏览器缓存目录。 */
function defaultPlaywrightBrowsersPath(homeDir = os__namespace.homedir()) {
    return path__namespace.join(homeDir, ".cache", "game-agent", "playwright-browsers");
}
/** 从扩展根目录解析 playwright-core CLI 入口并确认文件存在。 */
function resolvePlaywrightCliPath(extensionRoot) {
    const packageJsonPath = path__namespace.join(extensionRoot, "node_modules", "playwright-core", "package.json");
    if (!fs__namespace.existsSync(packageJsonPath)) {
        throw new Error(`Missing playwright-core package.json at ${packageJsonPath}`);
    }
    const packageJson = JSON.parse(fs__namespace.readFileSync(packageJsonPath, "utf8"));
    const bin = typeof packageJson.bin === "string"
        ? packageJson.bin
        : packageJson.bin?.["playwright-core"];
    if (!bin) {
        throw new Error("playwright-core package.json does not declare a CLI bin.");
    }
    const cliPath = path__namespace.join(path__namespace.dirname(packageJsonPath), bin);
    if (!fs__namespace.existsSync(cliPath)) {
        throw new Error(`Missing playwright-core CLI at ${cliPath}`);
    }
    return cliPath;
}
/** 组装受控的 Chromium Headless Shell 安装命令。 */
function createPlaywrightInstallCommand(options) {
    const browsersPath = options.browsersPath ?? defaultPlaywrightBrowsersPath();
    const cliPath = resolvePlaywrightCliPath(options.extensionRoot);
    return {
        execPath: options.nodePath,
        args: [cliPath, "install", "chromium", "--only-shell"],
        env: {
            ...(options.env ?? process.env),
            PLAYWRIGHT_BROWSERS_PATH: browsersPath,
        },
        browsersPath,
        cliPath,
    };
}
/** 按 Playwright 的 Chromium 专用优先于通用变量规则返回规范化下载 host。 */
function effectivePlaywrightChromiumDownloadHost(env) {
    return normalizeDownloadHost(env.PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST)
        ?? normalizeDownloadHost(env.PLAYWRIGHT_DOWNLOAD_HOST);
}
/**
 * 执行 Chromium Headless Shell 安装。首选轮仅在下载类失败或可观测进度停滞时串行回退一次。
 */
async function installChromiumWithPlaywrightCli(command, spawnProcess = node_child_process.spawn, options = {}) {
    const primaryHost = effectivePlaywrightChromiumDownloadHost(command.env);
    const primary = await runInstallAttempt(command, spawnProcess, {
        ...options,
        observeDownloadStall: true,
        attempt: "primary",
    });
    if (primary.kind === "success") {
        return successfulResult(command);
    }
    const fallbackEligible = primary.kind === "download_failure" || primary.kind === "download_stalled";
    if (!fallbackEligible || primaryHost === PLAYWRIGHT_FALLBACK_DOWNLOAD_HOST) {
        throw installAttemptError(primary);
    }
    const fallbackCommand = createFallbackCommand(command);
    console.info(`[Game Agent][Browser Install] fallback host=${PLAYWRIGHT_FALLBACK_DOWNLOAD_HOST} browsersPath=${command.browsersPath}`);
    const fallback = await runInstallAttempt(fallbackCommand, spawnProcess, {
        ...options,
        observeDownloadStall: false,
        attempt: "fallback",
    });
    if (fallback.kind === "success") {
        return successfulResult(command);
    }
    throw installAttemptError(fallback);
}
/** 跨平台终止 Playwright CLI 及其派生下载进程，并等待目标子进程退出。 */
async function terminatePlaywrightInstallProcessTree(child, options = {}) {
    if (hasExited(child))
        return;
    const platform = options.platform ?? process.platform;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TERMINATION_TIMEOUT_MS;
    const pid = child.pid;
    if (platform === "win32") {
        if (pid) {
            await (options.runTaskkill ?? runWindowsTaskkill)(pid);
        }
        else {
            safeChildKill(child, "SIGTERM");
        }
        if (!(await waitForExit(child, timeoutMs))) {
            safeChildKill(child, "SIGKILL");
            await waitForExit(child, timeoutMs);
        }
        return;
    }
    const descendants = pid
        ? await (options.listDescendantPids ?? listUnixDescendantPids)(pid).catch(() => [])
        : [];
    const processKill = options.processKill ?? process.kill;
    for (const descendantPid of descendants)
        safeProcessKill(descendantPid, "SIGTERM", processKill);
    if (pid)
        safeProcessKill(pid, "SIGTERM", processKill);
    else
        safeChildKill(child, "SIGTERM");
    const isAlive = options.isProcessAlive ?? isUnixProcessAlive;
    const [rootExited] = await Promise.all([
        waitForExit(child, timeoutMs),
        waitForProcessesExit(descendants, timeoutMs, isAlive),
    ]);
    const survivingDescendants = descendants.filter(isAlive);
    if (rootExited && survivingDescendants.length === 0)
        return;
    for (const descendantPid of survivingDescendants)
        safeProcessKill(descendantPid, "SIGKILL", processKill);
    if (!rootExited && pid)
        safeProcessKill(pid, "SIGKILL", processKill);
    else if (!rootExited)
        safeChildKill(child, "SIGKILL");
    const [, descendantsExited] = await Promise.all([
        waitForExit(child, timeoutMs),
        waitForProcessesExit(survivingDescendants, timeoutMs, isAlive),
    ]);
    if (!descendantsExited) {
        throw new Error("Playwright install process tree did not terminate completely.");
    }
}
/** 执行单轮 Playwright CLI 安装并归一化内部结果。 */
function runInstallAttempt(command, spawnProcess, options) {
    return new Promise((resolve) => {
        console.info(`[Game Agent][Browser Install] start attempt=${options.attempt} browsersPath=${command.browsersPath} cliPath=${command.cliPath}`);
        let child;
        try {
            child = spawnProcess(command.execPath, command.args, {
                env: command.env,
                shell: false,
                stdio: ["ignore", "pipe", "pipe"],
                // Keep descendants in the Browser helper group so Supervisor cleanup remains authoritative.
                detached: false,
                windowsHide: true,
            });
        }
        catch (error) {
            const normalized = normalizeError(error);
            logSpawnFailure(command, normalized, options.attempt);
            resolve({ kind: "non_download_failure", code: null, signal: null, error: normalized });
            return;
        }
        let settled = false;
        let capturedOutput = "";
        let terminationStarted = false;
        const terminate = options.terminateProcessTree ?? terminatePlaywrightInstallProcessTree;
        const monitor = new DownloadProgressMonitor(options.stallTimeoutMs ?? DEFAULT_DOWNLOAD_STALL_TIMEOUT_MS, options.observeDownloadStall, () => {
            if (settled || terminationStarted)
                return;
            terminationStarted = true;
            console.warn(`[Game Agent][Browser Install] stalled attempt=${options.attempt} timeoutMs=${options.stallTimeoutMs ?? DEFAULT_DOWNLOAD_STALL_TIMEOUT_MS}`);
            void terminate(child).then(() => finish({ kind: "download_stalled", code: child.exitCode, signal: child.signalCode }), (error) => finish({
                kind: "non_download_failure",
                code: child.exitCode,
                signal: child.signalCode,
                error: normalizeError(error),
            }));
        });
        /** 只结算一次单轮安装结果并释放进度计时器。 */
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            monitor.dispose();
            if (result.kind === "success") {
                console.info(`[Game Agent][Browser Install] complete attempt=${options.attempt} browsersPath=${command.browsersPath}`);
            }
            else {
                console.error(`[Game Agent][Browser Install] failed attempt=${options.attempt} browsersPath=${command.browsersPath} kind=${result.kind} code=${result.code} signal=${result.signal ?? "none"}`);
            }
            resolve(result);
        };
        /** 捕获有界分类文本、更新进度并原样转发输出块。 */
        const consume = (chunk, stream) => {
            capturedOutput = appendBounded(capturedOutput, String(chunk));
            monitor.consume(chunk, stream);
            safeForward(stream === "stdout" ? options.forwardStdout : options.forwardStderr, stream, chunk);
        };
        child.stdout?.on("data", (chunk) => consume(chunk, "stdout"));
        child.stderr?.on("data", (chunk) => consume(chunk, "stderr"));
        child.once("error", (error) => {
            if (terminationStarted)
                return;
            const normalized = normalizeError(error);
            logSpawnFailure(command, normalized, options.attempt);
            finish({ kind: "non_download_failure", code: null, signal: null, error: normalized });
        });
        child.once("close", (code, signal) => {
            if (terminationStarted)
                return;
            if (code === 0) {
                finish({ kind: "success", code: 0, signal });
                return;
            }
            finish({
                kind: isDownloadFailureOutput(capturedOutput) ? "download_failure" : "non_download_failure",
                code,
                signal,
            });
        });
    });
}
/** 从 Playwright 非 TTY 文本输出中跟踪可观测下载进展。 */
class DownloadProgressMonitor {
    timeoutMs;
    enabled;
    onStall;
    stdoutRemainder = "";
    stderrRemainder = "";
    currentDownload = null;
    lastPercentage = -1;
    timer = null;
    /** 创建仅在首选轮启用的下载停滞监视器。 */
    constructor(timeoutMs, enabled, onStall) {
        this.timeoutMs = timeoutMs;
        this.enabled = enabled;
        this.onStall = onStall;
    }
    /** 消费一个 stdout 或 stderr 数据块，并按完整行解析。 */
    consume(chunk, stream) {
        if (!this.enabled)
            return;
        const combined = (stream === "stdout" ? this.stdoutRemainder : this.stderrRemainder) + String(chunk);
        const lines = combined.split(/\r?\n/);
        const remainder = lines.pop() ?? "";
        if (stream === "stdout")
            this.stdoutRemainder = remainder;
        else
            this.stderrRemainder = remainder;
        for (const line of lines)
            this.consumeLine(line);
    }
    /** 停止当前下载阶段的停滞计时。 */
    dispose() {
        this.clearTimer();
    }
    /** 根据单行文本更新下载构件、百分比与计时器状态。 */
    consumeLine(line) {
        const downloadMatch = line.match(/^Downloading\s+(.+?)(?:\s+from\s+https?:\/\/|$)/i);
        if (downloadMatch) {
            this.currentDownload = downloadMatch[1].trim();
            this.lastPercentage = -1;
            this.resetTimer();
            return;
        }
        if (!this.currentDownload)
            return;
        const progressMatch = line.match(/\|.*\|\s+(\d{1,3})%\s+of\s+/i);
        if (progressMatch) {
            const percentage = Number(progressMatch[1]);
            if (percentage > this.lastPercentage) {
                this.lastPercentage = percentage;
                if (percentage >= 100) {
                    this.currentDownload = null;
                    this.clearTimer();
                }
                else {
                    this.resetTimer();
                }
            }
            return;
        }
        if (/\bdownloaded to\b/i.test(line)) {
            this.currentDownload = null;
            this.clearTimer();
        }
    }
    /** 从最新可观测下载进展重新开始停滞计时。 */
    resetTimer() {
        this.clearTimer();
        this.timer = setTimeout(this.onStall, this.timeoutMs);
    }
    /** 清除当前停滞计时器。 */
    clearTimer() {
        if (!this.timer)
            return;
        clearTimeout(this.timer);
        this.timer = null;
    }
}
/** 创建强制所有必需制品使用 npmmirror 的兜底命令。 */
function createFallbackCommand(command) {
    const env = { ...command.env };
    delete env.PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST;
    delete env.PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST;
    delete env.PLAYWRIGHT_WEBKIT_DOWNLOAD_HOST;
    env.PLAYWRIGHT_DOWNLOAD_HOST = PLAYWRIGHT_FALLBACK_DOWNLOAD_HOST;
    return { ...command, env };
}
/** 生成保持既有外部契约的安装成功结果。 */
function successfulResult(command) {
    return { ok: true, exitCode: 0, browsersPath: command.browsersPath };
}
/** 将单轮失败归一化为既有安装异常。 */
function installAttemptError(result) {
    if (result.error)
        return result.error;
    return new Error(`Playwright Chromium install failed (code=${result.code}, signal=${result.signal ?? "none"}).`);
}
/** 规范化下载 host，忽略空白和尾部斜杠。 */
function normalizeDownloadHost(value) {
    const normalized = value?.trim().replace(/\/+$/, "");
    return normalized ? normalized : null;
}
/** 使用保守白名单判断输出是否明确属于下载或网络失败。 */
function isDownloadFailureOutput(output) {
    return [
        /\b(?:Download failure|Failed to download|download failed)\b/i,
        /\b(?:ENOTFOUND|EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ESOCKETTIMEDOUT|EHOSTUNREACH|ENETUNREACH|ECONNABORTED)\b/i,
        /\b(?:ERR_TLS_[A-Z_]+|UNABLE_TO_VERIFY_LEAF_SIGNATURE|CERT_HAS_EXPIRED|SELF_SIGNED_CERT_IN_CHAIN)\b/i,
        /\bserver returned code\s+(?:4\d\d|5\d\d)\b/i,
        /\bHTTP(?: response)?(?: status| error)?\s*(?:4\d\d|5\d\d)\b/i,
        /\bsocket hang up\b/i,
        /\bproxy\b.*\b(?:authentication|error|failed|failure)\b/i,
        /\bcertificate\b.*\b(?:error|expired|invalid|verify|verification)\b/i,
    ].some((pattern) => pattern.test(output));
}
/** 追加分类文本并只保留固定大小的尾部窗口。 */
function appendBounded(current, addition) {
    const combined = current + addition;
    return combined.length <= MAX_CLASSIFICATION_OUTPUT_CHARS
        ? combined
        : combined.slice(combined.length - MAX_CLASSIFICATION_OUTPUT_CHARS);
}
/** 尽力把捕获的数据块转发回 Browser Helper 对应输出流。 */
function safeForward(forward, stream, chunk) {
    try {
        if (forward)
            forward(chunk);
        else if (stream === "stdout")
            process.stdout.write(chunk);
        else
            process.stderr.write(chunk);
    }
    catch {
        // Forwarding must not change installation outcome.
    }
}
/** 记录不会触发镜像回退的 CLI 启动失败。 */
function logSpawnFailure(command, error, attempt) {
    console.error(`[Game Agent][Browser Install] spawn_failed attempt=${attempt} browsersPath=${command.browsersPath} error=${error.message}`);
}
/** 把未知异常值规范为 Error。 */
function normalizeError(error) {
    return error instanceof Error ? error : new Error(String(error));
}
/** 判断子进程是否已经记录退出码或退出信号。 */
function hasExited(child) {
    return child.exitCode !== null || child.signalCode !== null;
}
/** 在有界时间内等待目标子进程退出。 */
function waitForExit(child, timeoutMs) {
    if (hasExited(child))
        return Promise.resolve(true);
    return new Promise((resolve) => {
        let settled = false;
        /** 只结算一次退出等待并移除监听器。 */
        const finish = (exited) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            child.off("exit", onExit);
            resolve(exited);
        };
        /** 将子进程退出事件映射为成功等待结果。 */
        const onExit = () => finish(true);
        const timer = setTimeout(() => finish(false), timeoutMs);
        child.once("exit", onExit);
    });
}
/** 轮询一组已知后代进程，直到全部退出或达到超时。 */
function waitForProcessesExit(pids, timeoutMs, isAlive) {
    if (pids.every((pid) => !isAlive(pid)))
        return Promise.resolve(true);
    return new Promise((resolve) => {
        const startedAt = Date.now();
        /** 执行一次后代存活状态轮询。 */
        const poll = () => {
            if (pids.every((pid) => !isAlive(pid))) {
                resolve(true);
                return;
            }
            if (Date.now() - startedAt >= timeoutMs) {
                resolve(false);
                return;
            }
            setTimeout(poll, Math.min(25, timeoutMs));
        };
        setTimeout(poll, Math.min(25, timeoutMs));
    });
}
/** 尽力向一个已知 PID 发送信号。 */
function safeProcessKill(pid, signal, processKill) {
    try {
        processKill(pid, signal);
    }
    catch {
        // The process may already have exited.
    }
}
/** 无 PID 时尽力通过 ChildProcess 句柄发送信号。 */
function safeChildKill(child, signal) {
    try {
        child.kill(signal);
    }
    catch {
        // The process may already have exited.
    }
}
/** 在 Windows 上通过 taskkill 终止目标 PID 的完整进程树。 */
function runWindowsTaskkill(pid) {
    return new Promise((resolve, reject) => {
        const killer = node_child_process.spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
            shell: false,
            windowsHide: true,
            stdio: "ignore",
        });
        killer.once("error", (error) => reject(normalizeError(error)));
        killer.once("exit", (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`taskkill failed for Playwright install process tree (code=${code}).`));
        });
    });
}
/** 从 Unix 进程表读取目标 PID 的后代，并按叶子到根排序。 */
function listUnixDescendantPids(rootPid) {
    return new Promise((resolve, reject) => {
        node_child_process.execFile("ps", ["-axo", "pid=,ppid="], { encoding: "utf8" }, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            const childrenByParent = new Map();
            for (const line of String(stdout).split(/\r?\n/)) {
                const match = line.trim().match(/^(\d+)\s+(\d+)$/);
                if (!match)
                    continue;
                const pid = Number(match[1]);
                const parentPid = Number(match[2]);
                const children = childrenByParent.get(parentPid) ?? [];
                children.push(pid);
                childrenByParent.set(parentPid, children);
            }
            const descendants = [];
            /** 深度优先收集后代，使子孙进程先于父进程终止。 */
            const visit = (parentPid) => {
                for (const childPid of childrenByParent.get(parentPid) ?? []) {
                    visit(childPid);
                    descendants.push(childPid);
                }
            };
            visit(rootPid);
            resolve(descendants);
        });
    });
}
/** 通过零信号探测 Unix 进程是否仍然存活。 */
function isUnixProcessAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (error) {
        return error.code === "EPERM";
    }
}

let playwrightPromise = null;
/** 解析 helper 运行时使用的 Playwright 浏览器目录。 */
function resolveBrowsersPath(env = process.env) {
    return env.PLAYWRIGHT_BROWSERS_PATH
        ?? path__namespace.join(os__namespace.homedir(), ".cache", "game-agent", "playwright-browsers");
}
/** 检测 playwright-core 包和 Chromium 浏览器缓存是否可用。 */
function inspectPlaywrightAvailability() {
    const browsersPath = resolveBrowsersPath();
    let playwrightAvailable = false;
    let reason;
    try {
        const runtimeRequire = eval("require");
        runtimeRequire.resolve("playwright-core");
        playwrightAvailable = true;
    }
    catch (error) {
        reason = error instanceof Error ? error.message : String(error);
    }
    let chromiumAvailable = false;
    try {
        chromiumAvailable = fs__namespace.readdirSync(browsersPath).some((entry) => entry.startsWith("chromium"));
    }
    catch {
        chromiumAvailable = false;
    }
    return {
        playwrightAvailable,
        chromiumAvailable,
        browsersPath,
        reason,
    };
}
/** 懒加载 playwright-core，并在缺省环境中设置专用浏览器缓存路径。 */
async function loadPlaywright() {
    if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
        process.env.PLAYWRIGHT_BROWSERS_PATH = defaultPlaywrightBrowsersPath();
    }
    if (!playwrightPromise) {
        playwrightPromise = Promise.resolve().then(() => {
            const runtimeRequire = eval("require");
            return runtimeRequire("playwright-core");
        });
    }
    return playwrightPromise;
}

const DEFAULT_RUNTIME_WAIT_CLOCK = {
    now: Date.now,
    sleep,
};
/** 生成 runtime wait 成功或未超时匹配结果。 */
function createRuntimeWaitMatchResult(args) {
    return {
        ok: true,
        waitFor: args.params.waitFor,
        mode: args.mode,
        matched: true,
        timedOut: false,
        elapsedMs: args.now() - args.startedAt,
        pollCount: args.pollCount,
        ...(args.observation ?? {}),
    };
}
/** 生成 runtime wait 超时结果，assert 模式返回可诊断失败。 */
function createRuntimeWaitTimeoutResult(args) {
    const base = {
        waitFor: args.params.waitFor,
        mode: args.mode,
        matched: false,
        timedOut: true,
        elapsedMs: args.now() - args.startedAt,
        pollCount: args.pollCount,
        lastObservation: args.lastObservation,
    };
    if (args.mode === "assert") {
        return {
            ok: false,
            error: { code: "assertion_failed" },
            reason: "等待条件在超时时间内没有满足。",
            recovery: [
                "调用 RuntimeInspect 查看当前运行态实际状态。",
                "根据最新状态调整选择器、延长 timeoutMs，或改用截图和日志继续诊断。",
            ],
            inferredIntent: "模型想断言当前游戏预览运行态已经达到指定条件。",
            ...base,
        };
    }
    return { ok: true, ...base };
}
/** 查询一次 runtime Bridge，并判断当前观察值是否已经满足等待条件。 */
async function observeRuntimeWaitCondition(params, queryBridge) {
    if (params.waitFor === "scene") {
        const result = await queryBridge("runtime", {});
        if (result.ok !== true)
            return { matched: false, result };
        const observation = {
            hasScene: result.hasScene === true,
            sceneName: result.sceneName,
            sceneGeneration: result.sceneGeneration,
        };
        return {
            matched: result.hasScene === true && (!params.sceneName || result.sceneName === params.sceneName),
            observation,
        };
    }
    if (params.waitFor === "checkpoint") {
        const result = await queryBridge("testState", { limit: 100 });
        if (result.ok !== true)
            return { matched: false, result };
        const checkpoints = Array.isArray(result.checkpoints) ? result.checkpoints : [];
        const checkpoint = checkpoints.find((item) => item.name === params.checkpointName);
        return {
            matched: Boolean(checkpoint),
            observation: checkpoint ? { checkpoint } : { checkpointCount: checkpoints.length, checkpoint },
        };
    }
    if (params.nodeRef) {
        const result = await queryBridge("node", { nodeRef: params.nodeRef });
        if (result.ok !== true)
            return { matched: false, result };
        const node = result.node;
        return {
            matched: nodeMatches(node, params),
            observation: { sceneGeneration: result.sceneGeneration, node },
        };
    }
    const search = params.textIncludes ?? params.nameIncludes ?? params.pathIncludes ?? "";
    const result = await queryBridge("tree", {
        operation: params.waitFor === "text" ? "tree" : search ? "search" : "tree",
        query: params.waitFor === "text" ? undefined : search,
        limit: 100,
        maxDepth: 12,
    });
    if (result.ok !== true)
        return { matched: false, result };
    const nodes = Array.isArray(result.nodes) ? result.nodes : [];
    const node = nodes.find((item) => nodeMatches(item, params));
    return {
        matched: Boolean(node),
        observation: node
            ? { sceneGeneration: result.sceneGeneration, node }
            : { sceneGeneration: result.sceneGeneration, checkedNodeCount: nodes.length },
    };
}
/** 轮询 runtime 状态直到满足节点、场景、文本或 checkpoint 条件。 */
async function waitForRuntimeCondition(params, queryBridge, clock = DEFAULT_RUNTIME_WAIT_CLOCK) {
    const bounds = waitBounds(params);
    const startedAt = clock.now();
    let pollCount = 0;
    let lastObservation;
    while (clock.now() - startedAt <= bounds.timeoutMs) {
        pollCount += 1;
        const observation = await observeRuntimeWaitCondition(params, queryBridge);
        if (observation.result)
            return observation.result;
        lastObservation = observation.observation;
        if (observation.matched) {
            return createRuntimeWaitMatchResult({
                params,
                mode: bounds.mode,
                startedAt,
                pollCount,
                observation: lastObservation,
                now: clock.now,
            });
        }
        await clock.sleep(bounds.pollIntervalMs);
    }
    return createRuntimeWaitTimeoutResult({
        params,
        mode: bounds.mode,
        startedAt,
        pollCount,
        lastObservation,
        now: clock.now,
    });
}

const DEFAULT_MAX_ACTIVE_RUNS = 3;
/** 表示单个活跃浏览器预览 run，并串行化该 run 上的所有操作。 */
class BrowserRun {
    runId;
    sessionId;
    previewUrl;
    openedAt;
    artifactStore;
    diagnostics;
    browser;
    context;
    page;
    cdp;
    gestureInput;
    closedAt;
    closePromise;
    queue = Promise.resolve();
    lastToolMetadata;
    /** 注入浏览器、页面、诊断和产物存储依赖，建立单 run 运行态。 */
    constructor(runId, sessionId, previewUrl, openedAt, artifactStore, diagnostics, browser, context, page, cdp) {
        this.runId = runId;
        this.sessionId = sessionId;
        this.previewUrl = previewUrl;
        this.openedAt = openedAt;
        this.artifactStore = artifactStore;
        this.diagnostics = diagnostics;
        this.browser = browser;
        this.context = context;
        this.page = page;
        this.cdp = cdp;
        page.once("crash", () => { void this.close("page.crash"); });
        page.once("close", () => { void this.close("page.close"); });
        context.once("close", () => { void this.close("context.close"); });
        browser.once("disconnected", () => { void this.close("browser.disconnected"); });
    }
    /** 返回运行的实际可用状态，并补偿关闭事件尚未送达的情况。 */
    get status() {
        if (this.closedAt === undefined && (this.page.isClosed() || !this.browser.isConnected())) {
            void this.close("browser.unavailable");
        }
        return this.closedAt === undefined ? "active" : "closed";
    }
    /** 生成可通过 JSON-RPC 返回给主进程的 run 摘要。 */
    summary() {
        const status = this.status;
        return {
            runId: this.runId,
            sessionId: this.sessionId,
            previewUrl: this.previewUrl,
            artifactDir: this.artifactStore.runDir,
            openedAt: this.openedAt,
            closedAt: this.closedAt,
            status,
        };
    }
    /** 将操作串入单 run 队列，避免页面输入和截图并发交错。 */
    enqueue(operation) {
        const next = this.queue.then(operation, operation);
        this.queue = next.catch(() => undefined);
        return next;
    }
    /** 截取当前页面并登记截图产物。 */
    async screenshot(params) {
        return this.enqueue(async () => {
            this.assertActive();
            const viewport = this.page.viewportSize() ?? { width: 0, height: 0 };
            const fileName = `screenshot-${Date.now().toString(36)}.png`;
            const filePath = path__namespace.join(this.artifactStore.runDir, fileName);
            await this.page.screenshot({
                path: filePath,
                fullPage: params.fullPage === true,
            });
            return {
                artifact: await this.artifactStore.recordScreenshot(fileName),
                width: viewport.width,
                height: viewport.height,
            };
        });
    }
    /** 在工具失败时尝试捕获当前页面截图作为诊断产物。 */
    async captureFailureScreenshot(operation) {
        if (this.closedAt)
            return undefined;
        try {
            const safeOperation = operation.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 48) || "operation";
            const fileName = `failure-${safeOperation}-${Date.now().toString(36)}.png`;
            const filePath = path__namespace.join(this.artifactStore.runDir, fileName);
            await this.page.screenshot({ path: filePath, fullPage: false });
            return await this.artifactStore.recordScreenshot(fileName);
        }
        catch (error) {
            this.diagnostics.addPageError(error);
            return undefined;
        }
    }
    /** 包裹高风险操作，失败时补充失败截图和 lastTool 元数据。 */
    async withFailureScreenshot(operation, task) {
        const startedAt = Date.now();
        try {
            const output = await task();
            this.lastToolMetadata = {
                operation,
                ok: !(output && typeof output === "object" && output.ok === false),
                startedAt,
                finishedAt: Date.now(),
            };
            if (output && typeof output === "object" && output.ok === false) {
                const artifact = await this.captureFailureScreenshot(operation);
                this.lastToolMetadata = {
                    ...this.lastToolMetadata,
                    errorCode: output.errorCode,
                    failureScreenshotArtifact: artifact,
                };
                if (artifact) {
                    const record = output;
                    return {
                        ...record,
                        details: {
                            ...((record.details && typeof record.details === "object") ? record.details : {}),
                            failureScreenshotArtifact: artifact,
                        },
                    };
                }
            }
            return output;
        }
        catch (error) {
            const artifact = await this.captureFailureScreenshot(operation);
            this.lastToolMetadata = {
                operation,
                ok: false,
                startedAt,
                finishedAt: Date.now(),
                errorCode: error instanceof BrowserHelperError ? error.code : "unexpected_error",
                failureScreenshotArtifact: artifact,
            };
            if (artifact && error instanceof BrowserHelperError) {
                throw new BrowserHelperError(error.code, error.message, {
                    ...(error.details ?? {}),
                    failureScreenshotArtifact: artifact,
                });
            }
            throw error;
        }
    }
    /** 读取无 Bridge 依赖的页面输入身份与坐标基线。 */
    async inputSnapshot() {
        return this.enqueue(async () => {
            this.assertActive();
            return { runId: this.runId, viewport: this.page.viewportSize() ?? { width: 0, height: 0 } };
        });
    }
    /** 只解析opaque语义端点，不执行点击或项目任意代码。 */
    async inputTargets(params) {
        return this.enqueue(async () => {
            this.assertActive();
            if (!Array.isArray(params.targets) || params.targets.length < 1 || params.targets.length > 2)
                throw new BrowserHelperError('input.invalid', 'Invalid semantic targets');
            const runtime = await this.queryRuntimeBridge('runtime', {});
            if (runtime.ok !== true || runtime.hasScene !== true)
                throw new BrowserHelperError('input.scene_unavailable', 'Semantic input requires an active scene');
            const targets = [];
            for (const target of params.targets) {
                const resolved = await operateRuntimeBridge(this.page, { sessionId: params.sessionId, action: 'nodePointer', ...target });
                if (resolved.ok !== true || resolved.sceneGeneration !== runtime.sceneGeneration)
                    throw new BrowserHelperError('input.target_stale', 'Semantic input target unavailable');
                targets.push(resolved);
            }
            return { runId: this.runId, sceneGeneration: runtime.sceneGeneration, targets, viewport: this.page.viewportSize() };
        });
    }
    /** 执行带运行/viewport复验的私有短输入原语；释放不受旧viewport阻挡。 */
    async inputFrame(params) {
        return this.enqueue(async () => {
            this.assertActive();
            if (params.runId !== this.runId)
                throw new BrowserHelperError('input.run_changed', 'Preview input run changed');
            if (params.operation === 'frame') {
                const viewport = this.page.viewportSize();
                if (!viewport || !params.viewport || viewport.width !== params.viewport.width || viewport.height !== params.viewport.height) {
                    throw new BrowserHelperError('input.viewport_changed', 'Preview input viewport changed');
                }
                if (params.semantic) {
                    const runtime = await this.queryRuntimeBridge('runtime', {});
                    if (runtime.ok !== true || runtime.hasScene !== true || runtime.sceneGeneration !== params.semantic.sceneGeneration) {
                        throw new BrowserHelperError('input.scene_changed', 'Semantic input scene changed');
                    }
                    if (!Array.isArray(params.semantic.targets) || params.semantic.targets.length < 1 || params.semantic.targets.length > 2)
                        throw new BrowserHelperError('input.invalid', 'Invalid semantic target proof');
                    for (const target of params.semantic.targets) {
                        const resolved = await operateRuntimeBridge(this.page, { sessionId: params.sessionId, action: 'nodePointer', ...target });
                        if (resolved.ok !== true || resolved.sceneGeneration !== params.semantic.sceneGeneration
                            || (target.expectedNodeRef && resolved.nodeRef !== target.expectedNodeRef))
                            throw new BrowserHelperError('input.target_stale', 'Semantic target became stale');
                    }
                }
                const points = params.device === 'mouse' ? [{ x: params.x, y: params.y }] : params.contacts ?? [];
                if (points.some((point) => typeof point.x !== 'number' || typeof point.y !== 'number'
                    || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.y < 0
                    || point.x >= viewport.width || point.y >= viewport.height))
                    throw new BrowserHelperError('input.invalid', 'Point outside viewport');
            }
            this.gestureInput ??= new GestureInput(this.page, this.cdp);
            return { ok: true, runId: this.runId, ...await this.gestureInput.apply(params) };
        });
    }
    /** 清理无法确认时立即隔离run；不排在可能阻塞的页面队列之后。 */
    async isolateInput() {
        await this.close("input.isolated");
    }
    /** 批次每次mutation都复验整次调用冻结的run和viewport；清理原语单独处理。 */
    assertInputIdentity(params) {
        const expected = params.expectedInputIdentity;
        if (!expected)
            return;
        const viewport = this.page.viewportSize();
        if (expected.runId !== this.runId || !viewport || !expected.viewport
            || expected.viewport.width !== viewport.width || expected.viewport.height !== viewport.height) {
            throw new BrowserHelperError('input.identity_changed', 'Preview input identity changed');
        }
    }
    /** 执行浏览器指针操作，支持点击、双击、拖拽和触摸点击。 */
    async pointer(params) {
        return this.enqueue(async () => {
            return this.withFailureScreenshot(`PreviewInteract.${params.operation}`, async () => {
                this.assertActive();
                this.assertInputIdentity(params);
                const x = requireNumber(params.x, "x");
                const y = requireNumber(params.y, "y");
                const viewport = this.page.viewportSize() ?? { width: 0, height: 0 };
                if (params.operation === "drag") {
                    const targetX = requireNumber(params.targetX, "targetX");
                    const targetY = requireNumber(params.targetY, "targetY");
                    await this.page.mouse.move(x, y);
                    try {
                        await this.page.mouse.down({ button: normalizeMouseButton(params.button) });
                        await this.page.mouse.move(targetX, targetY, { steps: 10 });
                    }
                    finally {
                        try {
                            await this.page.mouse.up({ button: normalizeMouseButton(params.button) });
                        }
                        catch (error) {
                            await this.isolateInput();
                            throw error;
                        }
                    }
                    return { ok: true, operation: params.operation, x, y, target: { x: targetX, y: targetY }, viewport };
                }
                if (params.operation === "double_click") {
                    await this.page.mouse.dblclick(x, y, { button: normalizeMouseButton(params.button) });
                    return { ok: true, operation: params.operation, x, y, viewport };
                }
                if (params.operation === "touch_tap") {
                    await this.page.touchscreen.tap(x, y);
                    return { ok: true, operation: params.operation, x, y, viewport };
                }
                await this.page.mouse.click(x, y, { button: normalizeMouseButton(params.button) });
                return { ok: true, operation: "click", x, y, viewport };
            });
        });
    }
    /** 执行浏览器键盘短原语，长按生命周期由工具层协调。 */
    async keyboard(params) {
        return this.enqueue(async () => {
            return this.withFailureScreenshot(`PreviewInteract.${params.operation}`, async () => {
                this.assertActive();
                if (params.operation !== "key_up")
                    this.assertInputIdentity(params);
                if (params.operation === "key_press") {
                    const key = requireString(params.key, "key");
                    await focusGameCanvasForKeyboard(this.page);
                    await this.page.keyboard.press(key);
                    return { ok: true, operation: params.operation, key };
                }
                if (params.operation === "key_down" || params.operation === "key_up") {
                    const key = requireString(params.key, "key");
                    if (params.operation === "key_down")
                        await focusGameCanvasForKeyboard(this.page);
                    await this.page.keyboard[params.operation === "key_down" ? "down" : "up"](key);
                    return { ok: true, operation: params.operation, key };
                }
                const text = requireString(params.text, "text");
                const delay = typeof params.delayMs === "number" && Number.isFinite(params.delayMs)
                    ? Math.max(0, Math.min(1000, Math.floor(params.delayMs)))
                    : undefined;
                await this.page.keyboard.type(text, delay === undefined ? undefined : { delay });
                return { ok: true, operation: "type_text", textLength: text.length };
            });
        });
    }
    /** 设置预览页面 viewport，并返回设置前后的尺寸。 */
    async setViewport(params) {
        return this.enqueue(async () => {
            return this.withFailureScreenshot("PreviewInteract.resize", async () => {
                this.assertActive();
                this.assertInputIdentity(params);
                const previousViewport = this.page.viewportSize() ?? { width: 0, height: 0 };
                const viewport = {
                    width: requireNumber(params.width, "width"),
                    height: requireNumber(params.height, "height"),
                };
                await this.page.setViewportSize(viewport);
                return { ok: true, previousViewport, viewport };
            });
        });
    }
    /** 通过注入的 Preview Bridge 查询游戏运行态。 */
    async runtimeQuery(params) {
        return this.enqueue(async () => {
            this.assertActive();
            return this.page.evaluate((payload) => {
                const bridge = globalThis.__GAME_AGENT_PREVIEW_BRIDGE_PROBE__;
                if (!bridge || typeof bridge.query !== "function") {
                    return {
                        ok: false,
                        errorCode: "bridge_unavailable",
                        reason: "Preview Bridge 尚未注入或未完成初始化。",
                    };
                }
                return bridge.query(payload.query, payload.params);
            }, {
                query: params.query,
                params: {
                    operation: params.operation,
                    nodeRef: params.nodeRef,
                    componentIndex: params.componentIndex,
                    query: params.search,
                    limit: params.limit,
                    keys: params.keys,
                    maxDepth: params.maxDepth,
                    cursor: params.cursor,
                },
            });
        });
    }
    /** 直接调用页面内 Preview Bridge query 接口并返回结构化结果。 */
    async queryRuntimeBridge(query, params) {
        return this.page.evaluate((payload) => {
            const bridge = globalThis.__GAME_AGENT_PREVIEW_BRIDGE_PROBE__;
            if (!bridge || typeof bridge.query !== "function") {
                return {
                    ok: false,
                    errorCode: "bridge_unavailable",
                    reason: "Preview Bridge 尚未注入或未完成初始化。",
                };
            }
            return bridge.query(payload.query, payload.params);
        }, { query, params });
    }
    /** 轮询 runtime 状态直到满足节点、场景、文本或 checkpoint 条件。 */
    async runtimeWait(params) {
        return this.enqueue(async () => {
            return this.withFailureScreenshot(`game_wait.${params.waitFor}`, async () => {
                this.assertActive();
                return waitForRuntimeCondition(params, (query, queryParams) => this.queryRuntimeBridge(query, queryParams));
            });
        });
    }
    /** 通过 Preview Bridge 执行游戏运行态操作，并补齐真实鼠标/键盘输入。 */
    async runtimeOperate(params) {
        return this.enqueue(async () => {
            return this.withFailureScreenshot(`game.${params.action}.${params.operation ?? "default"}`, async () => {
                this.assertActive();
                this.assertInputIdentity(params);
                return performRuntimeOperation(this.page, params);
            });
        });
    }
    /** 串行收集当前 run 的性能摘要。 */
    async performance() {
        return this.enqueue(async () => {
            this.assertActive();
            return collectBrowserPerformance(this.page, this.cdp);
        });
    }
    /** 汇总日志、网络、runtime、性能和最近工具元数据，必要时写入产物。 */
    async diagnose(params) {
        return this.enqueue(async () => {
            this.assertActive();
            const byteLimit = boundedInteger(params.byteLimit, 32 * 1024, 4 * 1024, 128 * 1024);
            const summary = {
                generatedAt: Date.now(),
                run: this.summary(),
                logs: this.diagnostics.queryLogs({ limit: params.limit ?? 50, level: params.level }),
                network: this.diagnostics.queryNetwork({ limit: params.limit ?? 50 }),
                runtime: await this.queryRuntimeBridge("runtime", {}),
                performance: await collectBrowserPerformance(this.page, this.cdp),
                lastTool: this.lastToolMetadata,
            };
            if (byteSize(summary) <= byteLimit) {
                return { summary, truncated: false };
            }
            const compact = {
                generatedAt: summary.generatedAt,
                run: this.summary(),
                counts: {
                    logs: summary.logs.length,
                    network: summary.network.length,
                },
                latestError: [...summary.logs]
                    .reverse()
                    .find((entry) => entry.level === "error")?.text,
                performance: summary.performance,
                lastTool: summary.lastTool,
                note: clipText("诊断详情超过 byteLimit，完整摘要已写入本地测试产物。", 200),
            };
            const artifact = await this.artifactStore.writeMetadata(`diagnose-${Date.now().toString(36)}.json`, summary);
            return {
                summary: compact,
                artifact,
                truncated: true,
            };
        });
    }
    /** 重载当前预览页并返回更新后的 run 摘要。 */
    async reload() {
        return this.enqueue(async () => {
            this.assertActive();
            await this.page.reload({ waitUntil: "domcontentloaded" });
            return this.summary();
        });
    }
    /** 立即失效并在页面队列外幂等清理，避免崩溃中的操作阻塞恢复。 */
    close(reason) {
        this.closedAt ??= Date.now();
        this.closePromise ??= Promise.resolve().then(async () => {
            await Promise.all([
                this.context.close().catch((error) => this.diagnostics.addPageError(error)),
                this.browser.close().catch((error) => this.diagnostics.addPageError(error)),
            ]);
            await this.artifactStore.writeMetadata("close.json", {
                runId: this.runId,
                sessionId: this.sessionId,
                reason,
                closedAt: this.closedAt,
            }).catch((error) => this.diagnostics.addPageError(error));
            return this.summary();
        });
        return this.closePromise;
    }
    /** 确保运行实际可用，否则沿既有错误契约要求重新打开预览。 */
    assertActive() {
        if (this.status !== "active") {
            throw new BrowserHelperError("preview.run_closed", "预览测试运行已关闭。", { runId: this.runId });
        }
    }
}
/** 管理所有 active preview run，并作为 browser-helper JSON-RPC 的运行态 Adapter。 */
class PreviewSessionManager {
    activeRuns = new Map();
    openQueue = Promise.resolve();
    /** 返回当前仍 active 的预览 run 数量。 */
    activeRunCount() {
        return [...this.activeRuns.values()].filter((run) => run.status === "active").length;
    }
    /** 返回 helper 健康状态和 Playwright/Chromium 可用性。 */
    async status() {
        return {
            ok: true,
            activeRuns: this.activeRunCount(),
            ...inspectPlaywrightAvailability(),
        };
    }
    /** 安装 Playwright Chromium，且只允许在没有 active run 时执行。 */
    async installChromium() {
        if (this.activeRunCount() > 0) {
            throw new BrowserHelperError("browser.active_runs", "当前存在 active preview run，不能执行浏览器运行时安装。", { activeRuns: this.activeRunCount() });
        }
        const extensionRoot = process.env.GAME_AGENT_EXTENSION_ROOT;
        if (!extensionRoot) {
            throw new BrowserHelperError("runtime.extension_root_missing", "Browser helper 缺少扩展根目录环境变量。");
        }
        const command = createPlaywrightInstallCommand({
            extensionRoot,
            nodePath: process.execPath,
        });
        const result = await installChromiumWithPlaywrightCli(command);
        return { ok: true, browsersPath: result.browsersPath };
    }
    /** 打开新的预览 run，或复用同会话同 URL 的 active run。 */
    open(raw) {
        /** 在准入队列轮到本次请求时核对并建立预览运行。 */
        const operation = () => this.openRun(raw);
        const next = this.openQueue.then(operation, operation);
        this.openQueue = next.catch(() => undefined);
        return next;
    }
    /** 串行执行运行准入和失效替换，避免并发重开启动重复浏览器。 */
    async openRun(raw) {
        const params = raw;
        const projectRoot = requireString(params.projectRoot, "projectRoot");
        const sessionId = requireString(params.sessionId, "sessionId");
        const previewUrl = assertLoopbackPreviewUrl(requireString(params.previewUrl, "previewUrl"));
        const maxActiveRuns = boundedInteger(params.maxActiveRuns, DEFAULT_MAX_ACTIVE_RUNS, 1, 10);
        const perRunQuotaBytes = boundedInteger(params.perRunArtifactQuotaBytes, DEFAULT_PER_RUN_ARTIFACT_QUOTA_BYTES, 1, Number.MAX_SAFE_INTEGER);
        const existing = this.activeRuns.get(sessionId);
        if (existing?.status === "closed") {
            await existing.close("preview.reopen");
            this.removeRun(existing);
        }
        else if (existing) {
            if (existing.previewUrl === previewUrl) {
                return { reused: true, run: existing.summary() };
            }
            throw new BrowserHelperError("preview.session_active", "当前会话已有活跃预览测试运行。", {
                sessionId,
                activeRunId: existing.runId,
            });
        }
        if (this.activeRunCount() >= maxActiveRuns) {
            throw new BrowserHelperError("preview.too_many_active_runs", "活跃预览测试运行数量已达上限。", {
                maxActiveRuns,
            });
        }
        const runId = createRunId();
        const artifactStore = new ArtifactStore(projectRoot, sessionId, runId, perRunQuotaBytes);
        const diagnostics = new DiagnosticsBuffer();
        await artifactStore.init({ runId, sessionId, previewUrl, openedAt: Date.now() });
        const playwright = await loadPlaywright();
        const browser = await playwright.chromium.launch({
            headless: true,
            args: ['--enable-gpu'],
        });
        let context;
        let run;
        let runPage = null;
        try {
            context = await browser.newContext({
                viewport: { width: 1280, height: 720 },
                hasTouch: true,
                acceptDownloads: false,
            });
            context.on("page", (page) => {
                if (runPage && page !== runPage) {
                    diagnostics.addPageError(new Error("Preview opened an unexpected popup page; popup was closed."));
                    void page.close().catch(() => undefined);
                }
            });
            if (params.bridgeSource && params.bridgeSource.trim().length > 0) {
                await context.addInitScript(`globalThis.__GAME_AGENT_PREVIEW_BRIDGE_RUN_ID__=${JSON.stringify(runId)};\n${params.bridgeSource}`);
            }
            runPage = await context.newPage();
            run = new BrowserRun(runId, sessionId, previewUrl, Date.now(), artifactStore, diagnostics, browser, context, runPage, await context.newCDPSession(runPage));
            await this.wireDiagnostics(runPage, diagnostics);
            run.assertActive();
            await runPage.goto(previewUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
            run.assertActive();
        }
        catch (error) {
            if (run) {
                await run.close("preview.open_failed");
            }
            else {
                await context?.close().catch(() => undefined);
                await browser.close().catch(() => undefined);
            }
            throw error;
        }
        this.activeRuns.set(sessionId, run);
        return { reused: false, run: run.summary() };
    }
    /** 查询、重载或关闭指定会话的 active run。 */
    async control(raw) {
        const params = raw;
        const sessionId = requireString(params.sessionId, "sessionId");
        const action = params.action ?? "status";
        const run = this.activeRuns.get(sessionId);
        if (!run) {
            if (action === "reload") {
                throw new BrowserHelperError("preview.no_active_run", "当前会话没有活跃预览测试运行。");
            }
            return { run: null };
        }
        if (action === "status")
            return { run: run.status === "active" ? run.summary() : null };
        if (action === "reload")
            return { run: await run.reload() };
        if (action === "close") {
            const summary = await run.close("PreviewInteract.close");
            this.removeRun(run);
            await this.enforceProjectQuota(params);
            return { run: summary };
        }
        throw new BrowserHelperError("input.invalid", "未知预览控制动作。", { action });
    }
    /** 按会话关闭 active run，并返回被关闭的 runId 列表。 */
    async closeSession(raw) {
        const params = raw;
        const sessionId = requireString(params.sessionId, "sessionId");
        const run = this.activeRuns.get(sessionId);
        if (!run)
            return { closedRunIds: [] };
        const summary = await run.close(typeof params.reason === "string" ? params.reason : "session.close");
        this.removeRun(run);
        await this.enforceProjectQuota(params);
        return { closedRunIds: [summary.runId] };
    }
    /** 截取指定会话 active run 的当前浏览器画面。 */
    async screenshot(raw) {
        const params = raw;
        const sessionId = requireString(params.sessionId, "sessionId");
        const run = this.activeRuns.get(sessionId);
        if (!run) {
            throw new BrowserHelperError("preview.no_active_run", "当前会话没有活跃预览测试运行。");
        }
        return run.screenshot(params);
    }
    /** 转发 runtime query 到指定会话 active run。 */
    async runtimeQuery(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.runtimeQuery(params);
    }
    /** 转发 runtime operate 到指定会话 active run。 */
    async runtimeOperate(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.runtimeOperate(params);
    }
    /** 转发 runtime wait 到指定会话 active run。 */
    async runtimeWait(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.runtimeWait(params);
    }
    /** 读取当前run身份；无Bridge场景也支持页面输入。 */
    async inputSnapshot(raw) {
        return this.requireActiveRun(raw.sessionId).inputSnapshot();
    }
    /** 为语义手势冻结端点；不在此执行输入。 */
    async inputTargets(raw) {
        const params = raw;
        return this.requireActiveRun(params.sessionId).inputTargets(params);
    }
    /** 私有手势短原语。 */
    async inputFrame(raw) {
        const params = raw;
        return this.requireActiveRun(params.sessionId).inputFrame(params);
    }
    /** 仅隔离与调用绑定的旧run，绝不关闭后来新建的run。 */
    async isolateInput(raw) {
        const params = raw;
        const run = this.activeRuns.get(requireString(params.sessionId, 'sessionId'));
        if (!run || run.runId !== params.runId)
            return { isolated: true };
        this.activeRuns.delete(params.sessionId);
        await run.isolateInput();
        return { isolated: true };
    }
    /** 转发浏览器指针操作到指定会话 active run。 */
    async pointer(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.pointer(params);
    }
    /** 转发浏览器键盘操作到指定会话 active run。 */
    async keyboard(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.keyboard(params);
    }
    /** 转发 viewport 设置到指定会话 active run。 */
    async setViewport(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.setViewport(params);
    }
    /** 查询指定会话 active run 的浏览器日志。 */
    queryLogs(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.diagnostics.queryLogPage({ limit: params.limit, level: params.level, cursor: params.cursor });
    }
    /** 查询指定会话 active run 的网络事件。 */
    queryNetwork(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return { network: run.diagnostics.queryNetwork({ limit: params.limit }) };
    }
    /** 查询指定会话 active run 的性能摘要。 */
    async queryPerformance(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return { performance: await run.performance() };
    }
    /** 生成指定会话 active run 的诊断摘要。 */
    async diagnose(raw) {
        const params = raw;
        const run = this.requireActiveRun(params.sessionId);
        return run.diagnose(params);
    }
    /** 查询会话产物列表或单个产物，支持跨已关闭 run 的磁盘扫描。 */
    async queryArtifacts(raw) {
        const params = raw;
        const projectRoot = requireString(params.projectRoot, "projectRoot");
        const sessionId = requireString(params.sessionId, "sessionId");
        if (params.artifactId) {
            return {
                artifact: await getArtifactOnDisk({
                    projectRoot,
                    sessionId,
                    runId: params.runId,
                    artifactId: params.artifactId,
                }),
            };
        }
        return {
            artifacts: await listArtifactsOnDisk({
                projectRoot,
                sessionId,
                runId: params.runId,
                limit: params.limit,
            }),
        };
    }
    /** 清理已关闭 run 或会话产物，拒绝删除 active run 产物。 */
    async cleanupArtifacts(raw) {
        const params = raw;
        const projectRoot = requireString(params.projectRoot, "projectRoot");
        const sessionId = requireString(params.sessionId, "sessionId");
        const activeRun = this.activeRuns.get(sessionId);
        if (activeRun && (params.scope === "session" || activeRun.runId === params.runId)) {
            throw new BrowserHelperError("artifact.active_run", "不能清理当前会话的 active preview run 产物。", {
                runId: activeRun.runId,
            });
        }
        return cleanupArtifacts({
            projectRoot,
            sessionId,
            scope: params.scope,
            runId: params.runId,
        });
    }
    /** 关闭全部 active run，通常用于 helper 断连或 shutdown。 */
    async closeAll(reason) {
        const closed = [];
        for (const run of [...this.activeRuns.values()]) {
            const summary = await run.close(reason);
            this.removeRun(run);
            closed.push(summary.runId);
        }
        return closed;
    }
    /** 在 run 关闭后按项目级 quota 清理历史已完成产物。 */
    async enforceProjectQuota(params) {
        if (typeof params.projectRoot !== "string" || params.projectRoot.trim().length === 0)
            return;
        const quotaBytes = boundedInteger(params.perProjectArtifactQuotaBytes, DEFAULT_PER_PROJECT_ARTIFACT_QUOTA_BYTES, 1, Number.MAX_SAFE_INTEGER);
        await enforceProjectArtifactQuota({
            projectRoot: params.projectRoot,
            quotaBytes,
            activeRunDirs: new Set([...this.activeRuns.values()].map((run) => path__namespace.resolve(run.artifactStore.runDir))),
        });
    }
    /** 查找指定会话的 active run，不存在时抛出稳定业务错误。 */
    requireActiveRun(sessionIdValue) {
        const sessionId = requireString(sessionIdValue, "sessionId");
        const run = this.activeRuns.get(sessionId);
        if (!run) {
            throw new BrowserHelperError("preview.no_active_run", "当前会话没有活跃预览测试运行。");
        }
        run.assertActive();
        return run;
    }
    /** 按对象身份移除旧记录，迟到的清理不得删除后来建立的运行。 */
    removeRun(run) {
        if (this.activeRuns.get(run.sessionId) === run) {
            this.activeRuns.delete(run.sessionId);
        }
    }
    /** 将 Playwright 页面事件接入 DiagnosticsBuffer，并阻止越界导航和下载。 */
    async wireDiagnostics(page, diagnostics) {
        page.on("console", (message) => {
            diagnostics.addConsole({
                level: consoleLevel(message.type()),
                text: message.text(),
                location: message.location(),
            });
        });
        page.on("pageerror", (error) => diagnostics.addPageError(error));
        page.on("framenavigated", (frame) => {
            if (frame !== page.mainFrame())
                return;
            const url = frame.url();
            if (!/^https?:/i.test(url))
                return;
            try {
                assertLoopbackPreviewUrl(url);
            }
            catch (error) {
                diagnostics.addPageError(error);
                void page.context().close().catch(() => undefined);
            }
        });
        page.on("download", (download) => {
            diagnostics.addPageError(new Error(`Preview attempted a download and it was cancelled: ${download.suggestedFilename()}`));
            void download.cancel().catch(() => undefined);
        });
        page.on("request", (request) => {
            diagnostics.addNetwork({
                event: "request",
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType(),
            });
        });
        page.on("response", (response) => {
            diagnostics.addNetwork({
                event: "response",
                url: response.url(),
                status: response.status(),
            });
        });
        page.on("requestfailed", (request) => {
            diagnostics.addNetwork({
                event: "failed",
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType(),
                failureText: request.failure()?.errorText,
            });
        });
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Runtime.enable").catch(() => undefined);
        cdp.on("Runtime.exceptionThrown", (event) => diagnostics.addCdpException(event));
    }
}

const sessions = new PreviewSessionManager();
/** 校验父进程消息是否符合 browser helper 私有 JSON-RPC 请求格式。 */
function isBrowserHelperRpcRequest(message) {
    return !!message
        && typeof message === "object"
        && message.jsonrpc === "2.0"
        && typeof message.id === "number"
        && typeof message.method === "string";
}
/** 通过 Node 子进程 IPC 向父进程发送 JSON-RPC 响应。 */
function send(response) {
    if (typeof process.send === "function") {
        process.send(response);
    }
}
/** 根据 JSON-RPC method 分发 browser helper 请求并统一转换错误响应。 */
async function handleRequest(request) {
    try {
        switch (request.method) {
            case "health":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: {
                        ok: true,
                        helper: "browser",
                        nodeVersion: process.versions.node,
                        pid: process.pid,
                        activeRuns: sessions.activeRunCount(),
                    },
                };
            case "runtime/status":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.status(),
                };
            case "runtime/installChromium":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.installChromium(),
                };
            case "preview/open":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.open(request.params),
                };
            case "preview/control":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.control(request.params),
                };
            case "session/close":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.closeSession(request.params),
                };
            case "browser/screenshot":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.screenshot(request.params),
                };
            case "game/inputTargets":
                return { jsonrpc: "2.0", id: request.id, result: await sessions.inputTargets(request.params) };
            case "browser/inputSnapshot":
                return { jsonrpc: "2.0", id: request.id, result: await sessions.inputSnapshot(request.params) };
            case "browser/inputFrame":
                return { jsonrpc: "2.0", id: request.id, result: await sessions.inputFrame(request.params) };
            case "browser/isolateInput":
                return { jsonrpc: "2.0", id: request.id, result: await sessions.isolateInput(request.params) };
            case "browser/pointer":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.pointer(request.params),
                };
            case "browser/keyboard":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.keyboard(request.params),
                };
            case "browser/setViewport":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.setViewport(request.params),
                };
            case "game/runtimeQuery":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.runtimeQuery(request.params),
                };
            case "game/runtimeOperate":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.runtimeOperate(request.params),
                };
            case "game/runtimeWait":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.runtimeWait(request.params),
                };
            case "debug/failureSnapshot":
                return {
                    jsonrpc: "2.0", id: request.id,
                    result: { helper: "browser", diagnostics: sessions.queryLogs({
                            sessionId: request.params?.sessionId, level: "error", limit: 8,
                        }) },
                };
            case "debug/logQuery":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: sessions.queryLogs(request.params),
                };
            case "debug/networkQuery":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: sessions.queryNetwork(request.params),
                };
            case "debug/performanceQuery":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.queryPerformance(request.params),
                };
            case "debug/diagnose":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.diagnose(request.params),
                };
            case "artifact/query":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.queryArtifacts(request.params),
                };
            case "artifact/cleanup":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: await sessions.cleanupArtifacts(request.params),
                };
            case "shutdown":
                await sessions.closeAll("helper.shutdown");
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: { ok: true },
                };
            default:
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: -32601,
                        message: `Browser helper RPC method "${request.method}" is not supported.`,
                    },
                };
        }
    }
    catch (error) {
        return {
            jsonrpc: "2.0",
            id: request.id,
            error: toRpcError(error),
        };
    }
}
process.on("message", (message) => {
    if (!isBrowserHelperRpcRequest(message)) {
        return;
    }
    void handleRequest(message).then((response) => {
        send(response);
        if (message.method === "shutdown" && !response.error) {
            setTimeout(() => process.exit(0), 0);
        }
    });
});
process.on("disconnect", () => {
    void sessions.closeAll("parent.disconnect").finally(() => process.exit(0));
});
