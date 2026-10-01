'use strict';

var node_fs = require('fs');
var path = require('path');
var node_child_process = require('child_process');

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

const DEFAULT_MAX_FRAME_BYTES = 16 * 1024 * 1024;
const MAX_HEADER_BYTES = 8 * 1024;
/** tsserver framing、消息结构或进程生命周期异常。 */
class TsServerProtocolError extends Error {
    /** 创建一个有界、可识别的 tsserver 协议错误。 */
    constructor(message) {
        super(message);
        this.name = "TsServerProtocolError";
    }
}
/**
 * 处理 tsserver 的 newline JSON 请求与 Content-Length 响应 framing。
 */
class TsServerProtocolClient {
    child;
    options;
    pending = new Map();
    notifications = new Map();
    maxFrameBytes;
    nextSeq = 1;
    stdoutBuffer = Buffer.alloc(0);
    expectedBodyLength = null;
    pendingTrailingLineFeed = false;
    closed = false;
    /** 绑定目标 tsserver 子进程的 stdout、error 与 exit 事件。 */
    constructor(child, options = {}) {
        this.child = child;
        this.options = options;
        this.maxFrameBytes = options.maxFrameBytes ?? DEFAULT_MAX_FRAME_BYTES;
        child.stdout.on("data", this.handleStdout);
        child.once("error", this.handleProcessError);
        child.once("exit", this.handleProcessExit);
    }
    /** 发送需要 response 的 tsserver 请求。 */
    request(command, args) {
        if (this.closed) {
            return Promise.reject(new TsServerProtocolError("tsserver 协议连接已关闭。"));
        }
        const seq = this.nextSeq++;
        const message = this.encodeRequest(seq, command, args);
        const promise = new Promise((resolve, reject) => {
            this.pending.set(seq, {
                command,
                resolve: resolve,
                reject,
            });
        });
        this.write(message);
        return promise;
    }
    /** 发送不产生 response 的 tsserver 通知。 */
    notify(command, args) {
        if (this.closed) {
            throw new TsServerProtocolError("tsserver 协议连接已关闭。");
        }
        const seq = this.nextSeq++;
        this.notifications.set(seq, command);
        this.write(this.encodeRequest(seq, command, args));
    }
    /** 拒绝全部 pending 请求并释放协议监听器。 */
    close(error = new TsServerProtocolError("tsserver 协议连接已关闭。")) {
        if (this.closed)
            return;
        this.closed = true;
        this.child.stdout.off("data", this.handleStdout);
        this.child.off("error", this.handleProcessError);
        this.child.off("exit", this.handleProcessExit);
        for (const pending of this.pending.values()) {
            pending.reject(error);
        }
        this.pending.clear();
        this.notifications.clear();
        this.stdoutBuffer = Buffer.alloc(0);
        this.expectedBodyLength = null;
        this.pendingTrailingLineFeed = false;
    }
    /** 将请求编码为 tsserver 标准的一行 JSON。 */
    encodeRequest(seq, command, args) {
        return `${JSON.stringify({
            seq,
            type: "request",
            command,
            ...(args === undefined ? {} : { arguments: args }),
        })}\n`;
    }
    /** 向 tsserver stdin 写入消息，并将写入错误升级为协议 fatal。 */
    write(message) {
        try {
            this.child.stdin.write(message, "utf8", (error) => {
                if (!error)
                    return;
                this.fail(new TsServerProtocolError(`写入 tsserver stdin 失败：${error.message}`));
            });
        }
        catch (error) {
            this.fail(new TsServerProtocolError(`写入 tsserver stdin 失败：${error instanceof Error ? error.message : String(error)}`));
        }
    }
    /** 累积 stdout 字节并持续解析完整 Content-Length 帧。 */
    handleStdout = (chunk) => {
        if (this.closed)
            return;
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf8");
        this.stdoutBuffer = Buffer.concat([this.stdoutBuffer, bytes]);
        this.drainFrames();
    };
    /** 解析当前缓冲区中的全部完整帧。 */
    drainFrames() {
        while (!this.closed) {
            if (this.expectedBodyLength === null) {
                // TypeScript counts one newline byte but emits CRLF on Windows.
                if (this.pendingTrailingLineFeed) {
                    if (this.stdoutBuffer.length === 0)
                        return;
                    if (this.stdoutBuffer[0] === 0x0a)
                        this.stdoutBuffer = this.stdoutBuffer.subarray(1);
                    this.pendingTrailingLineFeed = false;
                }
                const headerEnd = this.stdoutBuffer.indexOf("\r\n\r\n");
                if (headerEnd < 0) {
                    if (this.stdoutBuffer.length > MAX_HEADER_BYTES) {
                        this.fail(new TsServerProtocolError("tsserver 响应 header 超过限制。"));
                    }
                    return;
                }
                const header = this.stdoutBuffer.subarray(0, headerEnd).toString("ascii");
                const contentLength = /(?:^|\r\n)Content-Length:\s*(\d+)\s*(?:\r\n|$)/i.exec(header);
                if (!contentLength) {
                    this.fail(new TsServerProtocolError("tsserver 响应缺少合法 Content-Length。"));
                    return;
                }
                const length = Number(contentLength[1]);
                if (!Number.isSafeInteger(length) || length <= 0 || length > this.maxFrameBytes) {
                    this.fail(new TsServerProtocolError("tsserver 响应 Content-Length 超出限制。"));
                    return;
                }
                this.expectedBodyLength = length;
                this.stdoutBuffer = this.stdoutBuffer.subarray(headerEnd + 4);
            }
            if (this.stdoutBuffer.length < this.expectedBodyLength)
                return;
            const body = this.stdoutBuffer.subarray(0, this.expectedBodyLength);
            this.stdoutBuffer = this.stdoutBuffer.subarray(this.expectedBodyLength);
            this.expectedBodyLength = null;
            this.pendingTrailingLineFeed = body[body.length - 1] === 0x0d;
            this.handleFrameBody(body);
        }
    }
    /** 校验并分派单个完整 response/event body。 */
    handleFrameBody(body) {
        let message;
        try {
            message = JSON.parse(body.toString("utf8").trim());
        }
        catch {
            this.fail(new TsServerProtocolError("tsserver 响应 body 不是合法 JSON。"));
            return;
        }
        if (!message || typeof message !== "object" || typeof message.type !== "string") {
            this.fail(new TsServerProtocolError("tsserver 响应消息结构无效。"));
            return;
        }
        if (message.type === "event") {
            const event = message;
            if (typeof event.event !== "string") {
                this.fail(new TsServerProtocolError("tsserver event 缺少事件名。"));
                return;
            }
            this.options.onEvent?.(event);
            return;
        }
        if (message.type !== "response") {
            this.fail(new TsServerProtocolError("tsserver 返回了未知消息类型。"));
            return;
        }
        const response = message;
        if (typeof response.request_seq !== "number" || typeof response.success !== "boolean") {
            this.fail(new TsServerProtocolError("tsserver response 缺少 request_seq 或 success。"));
            return;
        }
        const pending = this.pending.get(response.request_seq);
        if (!pending) {
            const notificationCommand = this.notifications.get(response.request_seq);
            if (notificationCommand !== undefined) {
                if (response.command !== notificationCommand) {
                    this.fail(new TsServerProtocolError(`tsserver notification response command 与请求不匹配：${String(response.command)}。`));
                    return;
                }
                this.notifications.delete(response.request_seq);
                if (!response.success) {
                    this.fail(new TsServerProtocolError(`tsserver notification ${notificationCommand} 失败：${response.message ?? "unknown error"}。`));
                    return;
                }
                return;
            }
            this.fail(new TsServerProtocolError(`tsserver 返回未知 request_seq ${response.request_seq}。`));
            return;
        }
        if (typeof response.command !== "string" || response.command !== pending.command) {
            this.fail(new TsServerProtocolError(`tsserver response command 与请求不匹配：${String(response.command)}。`));
            return;
        }
        this.pending.delete(response.request_seq);
        pending.resolve(response);
    }
    /** 将子进程错误升级为协议 fatal。 */
    handleProcessError = (error) => {
        this.fail(new TsServerProtocolError(`tsserver 进程错误：${error.message}`));
    };
    /** 在 tsserver 提前退出时拒绝全部 pending 请求。 */
    handleProcessExit = (code, signal) => {
        this.fail(new TsServerProtocolError(`tsserver 进程已退出（code=${code ?? "null"}, signal=${signal ?? "null"}）。`));
    };
    /** 关闭协议并通知 session 当前连接不可继续复用。 */
    fail(error) {
        if (this.closed)
            return;
        this.close(error);
        this.options.onFatal?.(error);
    }
}

const EXPECTED_TYPESCRIPT_VERSION = "5.9.3";
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 1_000;
const MAX_STDERR_BYTES = 8 * 1024;
const MAX_ERROR_MESSAGE_LENGTH = 2 * 1024;
const MAX_COCOS_TSCONFIG_BYTES = 512 * 1024;
/** helper RPC 统一识别的稳定错误。 */
class ScriptLspHelperError extends Error {
    errorCode;
    /** 创建一个可跨 helper RPC 传播的稳定错误。 */
    constructor(errorCode, message) {
        super(message);
        this.errorCode = errorCode;
        this.name = "ScriptLspHelperError";
    }
}
/**
 * 管理单个 vendored tsserver 进程，并串行执行 open/reload、projectInfo 和查询。
 */
class TsServerSession {
    vendorDir;
    expectedVersion;
    shutdownTimeoutMs;
    spawnProcess;
    protocolFactory;
    openedFiles = new Map();
    cocosExternalProjectFiles = new Map();
    cocosExternalProjectDisplayPaths = new Map();
    child = null;
    protocol = null;
    version = null;
    startPromise = null;
    queryTail = Promise.resolve();
    disposed = false;
    stderrText = "";
    /** 创建 vendored tsserver session，并允许测试注入进程与协议替身。 */
    constructor(options = {}) {
        this.vendorDir = options.vendorDir ?? path__namespace.join(__dirname, "vendor", "typescript");
        this.expectedVersion = options.expectedVersion ?? EXPECTED_TYPESCRIPT_VERSION;
        this.shutdownTimeoutMs = options.shutdownTimeoutMs ?? DEFAULT_SHUTDOWN_TIMEOUT_MS;
        this.spawnProcess = options.spawnProcess ?? node_child_process.spawn;
        this.protocolFactory = options.protocolFactory
            ?? ((child, onFatal) => new TsServerProtocolClient(child, { onFatal }));
    }
    /** 启动并验证 vendored tsserver，返回私有 health 数据。 */
    async health() {
        await this.ensureStarted();
        return {
            ok: true,
            nodeVersion: process.versions.node,
            pid: process.pid,
            tsserverVersion: this.version,
            tsserverPid: this.child?.pid ?? null,
        };
    }
    /** 将查询加入唯一 Promise 队列，保证每个查询事务完整串行。 */
    query(params) {
        const result = this.queryTail.then(() => this.performQuery(params));
        this.queryTail = result.then(() => undefined, () => undefined);
        return result;
    }
    /** 终止 tsserver 并使当前 session 永久不可复用。 */
    async shutdown() {
        if (this.disposed)
            return { ok: true };
        this.disposed = true;
        await this.startPromise?.catch(() => undefined);
        const child = this.child;
        const protocol = this.protocol;
        this.clearRuntime();
        if (!child || !protocol)
            return { ok: true };
        try {
            protocol.notify("exit");
        }
        catch {
            // Process termination below is authoritative.
        }
        if (!await this.waitForExit(child, this.shutdownTimeoutMs)) {
            child.kill("SIGTERM");
        }
        if (!await this.waitForExit(child, this.shutdownTimeoutMs)) {
            child.kill("SIGKILL");
            await this.waitForExit(child, this.shutdownTimeoutMs);
        }
        protocol.close(new ScriptLspHelperError("SCRIPT_LSP_DISPOSED", "Script LSP helper 已关闭。"));
        return { ok: true };
    }
    /** 确保 runtime 已完成 status/configure 握手。 */
    async ensureStarted() {
        if (this.disposed) {
            throw new ScriptLspHelperError("SCRIPT_LSP_DISPOSED", "Script LSP helper 已关闭。");
        }
        if (this.child && this.protocol && this.version)
            return;
        if (this.startPromise)
            return this.startPromise;
        const startPromise = this.startRuntime();
        this.startPromise = startPromise;
        try {
            await startPromise;
        }
        finally {
            if (this.startPromise === startPromise)
                this.startPromise = null;
        }
    }
    /** 校验 vendor，启动 tsserver 并锁定协议版本。 */
    async startRuntime() {
        const tsserverPath = this.validateVendor();
        let child;
        try {
            child = this.spawnProcess(process.execPath, [
                tsserverPath,
                "--disableAutomaticTypingAcquisition",
            ], {
                cwd: path__namespace.dirname(tsserverPath),
                env: process.env,
                shell: false,
                windowsHide: true,
                stdio: ["pipe", "pipe", "pipe"],
            });
        }
        catch (error) {
            throw new ScriptLspHelperError("SCRIPT_LSP_HELPER_UNAVAILABLE", `无法启动 vendored tsserver：${this.errorMessage(error)}`);
        }
        this.stderrText = "";
        child.stderr.on("data", (chunk) => this.captureStderr(chunk));
        this.child = child;
        let protocol;
        try {
            protocol = this.protocolFactory(child, (error) => this.handleProtocolFatal(child, error));
            this.protocol = protocol;
        }
        catch (error) {
            this.invalidateRuntime(child, error);
            throw this.normalizeError(error);
        }
        try {
            const status = await protocol.request("status");
            const statusBody = this.requireSuccess(status, "status");
            const version = statusBody?.version;
            if (version !== this.expectedVersion) {
                throw new ScriptLspHelperError("SCRIPT_LSP_VENDOR_UNAVAILABLE", `vendored tsserver 版本应为 ${this.expectedVersion}，实际为 ${version ?? "unknown"}。`);
            }
            const configured = await protocol.request("configure", {
                hostInfo: "game-agent-tsserver-helper",
                preferences: {
                    disableLineTextInReferences: true,
                    displayPartsForJSDoc: true,
                },
            });
            this.requireSuccess(configured, "configure");
            this.version = version;
        }
        catch (error) {
            this.invalidateRuntime(child, error);
            throw this.normalizeError(error);
        }
    }
    /** 校验安装态 TypeScript 版本、入口和许可证文件。 */
    validateVendor() {
        const packageFile = path__namespace.join(this.vendorDir, "package.json");
        const tsserverPath = path__namespace.join(this.vendorDir, "lib", "tsserver.js");
        const licenseFile = path__namespace.join(this.vendorDir, "LICENSE.txt");
        if (!node_fs.existsSync(packageFile) || !node_fs.existsSync(tsserverPath) || !node_fs.existsSync(licenseFile)) {
            throw new ScriptLspHelperError("SCRIPT_LSP_VENDOR_UNAVAILABLE", "安装态 TypeScript runtime、tsserver 入口或许可证缺失。");
        }
        try {
            const manifest = JSON.parse(node_fs.readFileSync(packageFile, "utf8"));
            if (manifest.version !== this.expectedVersion) {
                throw new ScriptLspHelperError("SCRIPT_LSP_VENDOR_UNAVAILABLE", `安装态 TypeScript 版本应为 ${this.expectedVersion}。`);
            }
        }
        catch (error) {
            if (error instanceof ScriptLspHelperError)
                throw error;
            throw new ScriptLspHelperError("SCRIPT_LSP_VENDOR_UNAVAILABLE", "安装态 TypeScript package.json 无法读取。");
        }
        return tsserverPath;
    }
    /** 执行单个完整 open/reload -> projectInfo -> query 事务。 */
    async performQuery(params) {
        this.validateQueryParams(params);
        await this.ensureStarted();
        const runtime = this.requireRuntime();
        try {
            await this.synchronizeFile(runtime.protocol, params.projectRoot, params.file);
            const configPath = await this.resolveConfiguredProject(runtime.protocol, params.projectRoot, params.file);
            switch (params.action) {
                case "diagnose":
                    return this.queryDiagnostics(runtime, params, configPath);
                case "hover":
                    return this.queryHover(runtime, params, configPath);
                case "definition":
                    return this.queryDefinitions(runtime, params, configPath);
                case "references":
                    return this.queryReferences(runtime, params, configPath);
            }
        }
        catch (error) {
            throw this.normalizeError(error);
        }
    }
    /** 校验可信绝对路径、目标文件与 1-based 位置。 */
    validateQueryParams(params) {
        const actions = ["diagnose", "hover", "definition", "references"];
        if (!actions.includes(params.action)) {
            throw new ScriptLspHelperError("SCRIPT_LSP_HELPER_UNAVAILABLE", "未知 Script LSP action。");
        }
        if (!path__namespace.isAbsolute(params.projectRoot) || !path__namespace.isAbsolute(params.file)) {
            throw new ScriptLspHelperError("SCRIPT_LSP_PATH_NOT_ALLOWED", "Script LSP helper 只接受可信绝对路径。");
        }
        const projectRoot = path__namespace.resolve(params.projectRoot);
        const assetsRoot = path__namespace.resolve(projectRoot, "assets");
        const file = path__namespace.resolve(params.file);
        if (!this.isPathInside(assetsRoot, file) || !file.toLowerCase().endsWith(".ts")) {
            throw new ScriptLspHelperError("SCRIPT_LSP_PATH_NOT_ALLOWED", "目标脚本不属于可信 assets 根或不是 TypeScript 文件。");
        }
        try {
            if (!node_fs.statSync(projectRoot).isDirectory()
                || !node_fs.statSync(assetsRoot).isDirectory()
                || !node_fs.statSync(file).isFile()) {
                throw new Error("invalid path");
            }
            const realProjectRoot = node_fs.realpathSync.native(projectRoot);
            const realAssetsRoot = node_fs.realpathSync.native(assetsRoot);
            const realFile = node_fs.realpathSync.native(file);
            if (!this.isPathStrictlyInside(realProjectRoot, realAssetsRoot)
                || !this.isPathStrictlyInside(realAssetsRoot, realFile)) {
                throw new Error("symlink escape");
            }
        }
        catch {
            throw new ScriptLspHelperError("SCRIPT_LSP_PATH_NOT_ALLOWED", "可信项目根、assets 根或目标脚本不存在，或目标脚本越过物理 assets 边界。");
        }
        if (params.action === "diagnose")
            return;
        if (!Number.isInteger(params.line) || !Number.isInteger(params.column)
            || params.line < 1 || params.column < 1) {
            throw new ScriptLspHelperError("SCRIPT_LSP_POSITION_INVALID", "line 与 column 必须是正整数且使用 1-based 语义。");
        }
        const lines = node_fs.readFileSync(file, "utf8").split(/\r?\n/);
        const line = params.line;
        const column = params.column;
        if (line > lines.length || column > lines[line - 1].length + 1) {
            throw new ScriptLspHelperError("SCRIPT_LSP_POSITION_INVALID", "line 或 column 超出目标文件范围。");
        }
    }
    /** 首次查询发送 open，后续查询前从磁盘 reload。 */
    async synchronizeFile(protocol, projectRoot, file) {
        const normalizedRoot = path__namespace.resolve(projectRoot);
        const existingRoot = this.openedFiles.get(file);
        if (!existingRoot || existingRoot !== normalizedRoot) {
            if (existingRoot)
                protocol.notify("close", { file });
            protocol.notify("open", { file, projectRootPath: normalizedRoot });
            this.openedFiles.set(file, normalizedRoot);
            return;
        }
        const reloaded = await protocol.request("reload", { file, tmpfile: file });
        this.requireSuccess(reloaded, "reload");
    }
    /** 通过 projectInfo 证明目标归属 configured project，必要时注册受控 Cocos external project。 */
    async resolveConfiguredProject(protocol, projectRoot, file) {
        const configPath = await this.projectInfoConfigPath(protocol, projectRoot, file);
        if (configPath)
            return configPath;
        const cocosProject = this.readCocosExternalProject(projectRoot);
        if (!cocosProject) {
            throw new ScriptLspHelperError("SCRIPT_LSP_PROJECT_NOT_CONFIGURED", "目标脚本未归属可用的 configured TypeScript project，且没有可用的 Cocos 配置。");
        }
        await this.openCocosExternalProject(protocol, cocosProject, file);
        const activatedConfigPath = await this.projectInfoConfigPath(protocol, projectRoot, file);
        if (activatedConfigPath)
            return activatedConfigPath;
        throw new ScriptLspHelperError("SCRIPT_LSP_PROJECT_NOT_CONFIGURED", "Cocos TypeScript 配置未能将目标脚本注册为 configured project。");
    }
    /** 返回项目内已配置的 tsserver 项目路径；inferred project 和无效返回均视为未配置。 */
    async projectInfoConfigPath(protocol, projectRoot, file) {
        const response = await protocol.request("projectInfo", {
            file,
            needFileNameList: false,
        });
        if (!response.success || !response.body?.configFileName || response.body.languageServiceDisabled)
            return undefined;
        const configPath = path__namespace.resolve(response.body.configFileName);
        let configIsInsideProject = false;
        try {
            configIsInsideProject = this.isPathInside(node_fs.realpathSync.native(path__namespace.resolve(projectRoot)), node_fs.realpathSync.native(configPath));
        }
        catch {
            configIsInsideProject = false;
        }
        if (!configPath.toLowerCase().endsWith(".json") || !configIsInsideProject)
            return undefined;
        const realConfigPath = node_fs.realpathSync.native(configPath);
        return this.cocosExternalProjectDisplayPaths.get(realConfigPath) ?? configPath;
    }
    /**
     * 读取 Cocos 生成的唯一项目配置，绝不搜索任意用户 JSON 或创建项目文件。
     *
     * @param projectRoot 已通过物理 assets 边界校验的项目根。
     * @returns 可用于 tsserver external project 的配置；缺失或无效时返回 `undefined`。
     */
    readCocosExternalProject(projectRoot) {
        const displayConfigPath = path__namespace.resolve(projectRoot, "temp", "tsconfig.cocos.json");
        try {
            const realProjectRoot = node_fs.realpathSync.native(path__namespace.resolve(projectRoot));
            const realConfigPath = node_fs.realpathSync.native(displayConfigPath);
            if (!this.isPathInside(realProjectRoot, realConfigPath)
                || !node_fs.statSync(realConfigPath).isFile()
                || node_fs.statSync(realConfigPath).size > MAX_COCOS_TSCONFIG_BYTES) {
                return undefined;
            }
            const parsed = JSON.parse(node_fs.readFileSync(realConfigPath, "utf8"));
            if (!this.isJsonRecord(parsed))
                return undefined;
            const compilerOptions = parsed.compilerOptions;
            if (compilerOptions !== undefined && !this.isJsonRecord(compilerOptions))
                return undefined;
            return {
                configPath: realConfigPath,
                displayConfigPath,
                compilerOptions: this.normalizeCocosCompilerOptions(compilerOptions && this.isJsonRecord(compilerOptions) ? compilerOptions : {}, realProjectRoot),
            };
        }
        catch {
            return undefined;
        }
    }
    /** 注册仅含已查询 assets 脚本的 Cocos external configured project。 */
    async openCocosExternalProject(protocol, project, file) {
        const files = this.cocosExternalProjectFiles.get(project.configPath) ?? new Set();
        files.add(path__namespace.resolve(file));
        this.cocosExternalProjectFiles.set(project.configPath, files);
        this.cocosExternalProjectDisplayPaths.set(project.configPath, project.displayConfigPath);
        const response = await protocol.request("openExternalProject", {
            projectFileName: project.configPath,
            rootFiles: [...files].sort().map((fileName) => ({ fileName })),
            options: project.compilerOptions,
        });
        this.requireSuccess(response, "openExternalProject");
    }
    /** 将 Cocos 根相对 type declaration 路径转为 external project 可解析的绝对路径。 */
    normalizeCocosCompilerOptions(compilerOptions, projectRoot) {
        const normalized = { ...compilerOptions };
        const types = compilerOptions.types;
        if (!Array.isArray(types) || !types.every((value) => typeof value === "string"))
            return normalized;
        normalized.types = types.map((typeName) => typeName.startsWith(".")
            ? path__namespace.resolve(projectRoot, typeName)
            : typeName);
        return normalized;
    }
    /** 判断解析出的 JSON 是否可安全作为 tsserver 协议参数。 */
    isJsonRecord(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        return Object.values(value).every((entry) => this.isJsonValue(entry));
    }
    /** 判断解析出的 JSON 值是否仅含 protocol 可序列化基础类型。 */
    isJsonValue(value) {
        if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string")
            return true;
        if (Array.isArray(value))
            return value.every((entry) => this.isJsonValue(entry));
        return this.isJsonRecord(value);
    }
    /** 查询三类同步诊断并去重、过滤、稳定排序。 */
    async queryDiagnostics(runtime, params, configPath) {
        const requests = [
            { command: "syntacticDiagnosticsSync", source: "syntactic" },
            { command: "semanticDiagnosticsSync", source: "semantic" },
            { command: "suggestionDiagnosticsSync", source: "suggestion" },
        ];
        const diagnostics = [];
        for (const request of requests) {
            const response = await runtime.protocol.request(request.command, {
                file: params.file,
                includeLinePosition: true,
            });
            const body = this.requireSuccess(response, request.command) ?? [];
            for (const item of body) {
                const normalized = this.normalizeDiagnostic(item, request.source, params.file);
                if (!normalized)
                    continue;
                if (!params.includeWarnings && normalized.category !== "error")
                    continue;
                if (params.includeWarnings && normalized.category === "message")
                    continue;
                diagnostics.push(normalized);
            }
        }
        const unique = new Map();
        for (const diagnostic of diagnostics) {
            const key = [
                diagnostic.file,
                diagnostic.start.line,
                diagnostic.start.column,
                diagnostic.end.line,
                diagnostic.end.column,
                diagnostic.code,
                diagnostic.message,
            ].join("\0");
            if (!unique.has(key))
                unique.set(key, diagnostic);
        }
        return {
            action: "diagnose",
            tsserverVersion: runtime.version,
            configPath,
            diagnostics: [...unique.values()].sort((left, right) => this.compareDiagnostics(left, right)),
        };
    }
    /** 查询并规范化 quickinfo。 */
    async queryHover(runtime, params, configPath) {
        const response = await runtime.protocol.request("quickinfo", this.locationArgs(params));
        const body = response.success ? response.body : undefined;
        let hover = null;
        if (body?.start && body.end) {
            hover = {
                kind: body.kind ?? "unknown",
                kindModifiers: body.kindModifiers ?? "",
                displayString: body.displayString ?? "",
                documentation: this.displayText(body.documentation),
                tags: (body.tags ?? [])
                    .filter((tag) => typeof tag.name === "string")
                    .map((tag) => ({
                    name: tag.name,
                    ...(tag.text === undefined ? {} : { text: this.displayText(tag.text) }),
                })),
                span: {
                    start: this.position(body.start),
                    end: this.position(body.end),
                },
            };
        }
        else if (!response.success && !this.isEmptyQueryResponse(response)) {
            this.requireSuccess(response, "quickinfo");
        }
        return {
            action: "hover",
            tsserverVersion: runtime.version,
            configPath,
            hover,
        };
    }
    /** 查询并规范化定义位置。 */
    async queryDefinitions(runtime, params, configPath) {
        const response = await runtime.protocol.request("definition", this.locationArgs(params));
        if (!response.success && !this.isEmptyQueryResponse(response))
            this.requireSuccess(response, "definition");
        const locations = (response.body ?? [])
            .map((item) => this.normalizeLocation(item, params.projectRoot))
            .filter((item) => !!item)
            .sort((left, right) => this.compareLocations(left, right));
        return {
            action: "definition",
            tsserverVersion: runtime.version,
            configPath,
            locations,
        };
    }
    /** 查询并规范化引用位置，主动丢弃 lineText。 */
    async queryReferences(runtime, params, configPath) {
        const response = await runtime.protocol.request("references", this.locationArgs(params));
        if (!response.success && !this.isEmptyQueryResponse(response))
            this.requireSuccess(response, "references");
        const locations = (response.body?.refs ?? [])
            .map((item) => this.normalizeLocation(item, params.projectRoot))
            .filter((item) => !!item)
            .sort((left, right) => this.compareLocations(left, right));
        return {
            action: "references",
            tsserverVersion: runtime.version,
            configPath,
            locations,
        };
    }
    /** 构造 1-based tsserver 位置参数。 */
    locationArgs(params) {
        return {
            file: params.file,
            line: params.line,
            offset: params.column,
        };
    }
    /** 将协议诊断转换为公共 JSON-safe 结构。 */
    normalizeDiagnostic(diagnostic, source, file) {
        const start = diagnostic.startLocation
            ?? (typeof diagnostic.start === "object" ? diagnostic.start : undefined);
        const end = diagnostic.endLocation ?? diagnostic.end;
        if (!start || !end)
            return null;
        const category = this.diagnosticCategory(diagnostic.category);
        return {
            file,
            source,
            category,
            code: typeof diagnostic.code === "number" ? diagnostic.code : 0,
            message: String(diagnostic.message ?? diagnostic.text ?? ""),
            start: this.position(start),
            end: this.position(end),
        };
    }
    /** 将协议文件跨度转换为公共 location。 */
    normalizeLocation(span, projectRoot) {
        if (typeof span.file !== "string" || !span.start || !span.end)
            return null;
        return {
            file: this.projectDisplayPath(projectRoot, span.file),
            start: this.position(span.start),
            end: this.position(span.end),
            ...(typeof span.isWriteAccess === "boolean" ? { isWriteAccess: span.isWriteAccess } : {}),
            ...(typeof span.isDefinition === "boolean" ? { isDefinition: span.isDefinition } : {}),
        };
    }
    /** 将 tsserver 可能返回的项目内真实路径映射回调用方提供的可信项目路径。 */
    projectDisplayPath(projectRoot, candidate) {
        const resolvedCandidate = path__namespace.resolve(candidate);
        try {
            const realProjectRoot = node_fs.realpathSync.native(path__namespace.resolve(projectRoot));
            const realCandidate = node_fs.realpathSync.native(resolvedCandidate);
            if (this.isPathInside(realProjectRoot, realCandidate)) {
                return path__namespace.resolve(projectRoot, path__namespace.relative(realProjectRoot, realCandidate));
            }
        }
        catch {
            // Nonexistent or external paths remain subject to tool-layer visibility filtering.
        }
        return resolvedCandidate;
    }
    /** 将 tsserver offset 字段改名为公共 column。 */
    position(location) {
        return { line: location.line, column: location.offset };
    }
    /** 规范化 TypeScript diagnostic category。 */
    diagnosticCategory(value) {
        const normalized = value?.toLowerCase();
        if (normalized === "error" || normalized === "warning"
            || normalized === "suggestion" || normalized === "message") {
            return normalized;
        }
        return "message";
    }
    /** 将 JSDoc display parts 稳定拼接为纯文本。 */
    displayText(value) {
        if (typeof value === "string")
            return value;
        return (value ?? []).map((part) => part.text ?? "").join("");
    }
    /** 稳定排序诊断。 */
    compareDiagnostics(left, right) {
        return this.compareStrings(left.file, right.file)
            || left.start.line - right.start.line
            || left.start.column - right.start.column
            || left.end.line - right.end.line
            || left.end.column - right.end.column
            || left.code - right.code
            || this.compareStrings(left.message, right.message)
            || this.compareStrings(left.source, right.source);
    }
    /** 稳定排序定义与引用位置。 */
    compareLocations(left, right) {
        return this.compareStrings(left.file, right.file)
            || left.start.line - right.start.line
            || left.start.column - right.start.column
            || left.end.line - right.end.line
            || left.end.column - right.end.column;
    }
    /** 使用 locale-independent 字符串顺序。 */
    compareStrings(left, right) {
        return left < right ? -1 : left > right ? 1 : 0;
    }
    /** 判断 query 失败是否只是目标位置没有内容。 */
    isEmptyQueryResponse(response) {
        return /no content available|no references found|no definition found/i.test(response.message ?? "");
    }
    /** 校验 tsserver 成功响应并返回 body。 */
    requireSuccess(response, command) {
        if (response.success)
            return response.body;
        throw new ScriptLspHelperError("SCRIPT_LSP_PROTOCOL_ERROR", `tsserver ${command} 失败：${this.limitText(response.message ?? "unknown error")}`);
    }
    /** 读取当前已通过握手的 runtime。 */
    requireRuntime() {
        if (!this.child || !this.protocol || !this.version) {
            throw new ScriptLspHelperError("SCRIPT_LSP_HELPER_UNAVAILABLE", "tsserver runtime 不可用。");
        }
        return { protocol: this.protocol, version: this.version };
    }
    /** 处理协议 fatal，清理当前 tsserver 进程并允许下一次调用重建。 */
    handleProtocolFatal(child, error) {
        if (this.child !== child)
            return;
        this.invalidateRuntime(child, error);
    }
    /** 使当前 runtime 失效并终止直接子进程。 */
    invalidateRuntime(child, error) {
        const protocol = this.protocol;
        if (this.child === child)
            this.clearRuntime();
        protocol?.close(error instanceof Error ? error : new Error(String(error)));
        if (child.exitCode === null && child.signalCode === null) {
            try {
                child.kill("SIGTERM");
            }
            catch {
                // The process may already have exited.
            }
        }
    }
    /** 清空进程引用、版本和 open 文件状态。 */
    clearRuntime() {
        this.child = null;
        this.protocol = null;
        this.version = null;
        this.openedFiles.clear();
        this.cocosExternalProjectFiles.clear();
        this.cocosExternalProjectDisplayPaths.clear();
    }
    /** 将底层异常转换为稳定 helper error。 */
    normalizeError(error) {
        if (error instanceof ScriptLspHelperError)
            return error;
        const details = this.limitText(this.errorMessage(error));
        if (error instanceof TsServerProtocolError) {
            return new ScriptLspHelperError("SCRIPT_LSP_PROTOCOL_ERROR", `tsserver 协议错误：${details}${this.stderrSuffix()}`);
        }
        return new ScriptLspHelperError("SCRIPT_LSP_HELPER_UNAVAILABLE", `Script LSP helper 内部错误：${details}${this.stderrSuffix()}`);
    }
    /** 有界捕获 tsserver stderr，避免泄漏无限输出。 */
    captureStderr(chunk) {
        const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : chunk;
        this.stderrText = this.limitText(`${this.stderrText}${text}`, MAX_STDERR_BYTES);
    }
    /** 生成可选的有界 stderr 后缀。 */
    stderrSuffix() {
        const stderr = this.stderrText.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
        return stderr ? ` stderr: ${this.limitText(stderr)}` : "";
    }
    /** 提取未知异常消息。 */
    errorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
    /** 按字符预算截断内部错误文本。 */
    limitText(value, maxLength = MAX_ERROR_MESSAGE_LENGTH) {
        return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
    }
    /** 判断目标路径是否位于可信根目录内。 */
    isPathInside(root, target) {
        const relative = path__namespace.relative(root, target);
        return relative === "" || (!relative.startsWith("..") && !path__namespace.isAbsolute(relative));
    }
    /** 判断目标是否为可信根的严格子路径，不允许目标与根目录本身相等。 */
    isPathStrictlyInside(root, target) {
        const relative = path__namespace.relative(root, target);
        return relative !== ""
            && relative !== ".."
            && !relative.startsWith(`..${path__namespace.sep}`)
            && !path__namespace.isAbsolute(relative);
    }
    /** 等待子进程退出或超时。 */
    waitForExit(child, timeoutMs) {
        if (child.exitCode !== null || child.signalCode !== null)
            return Promise.resolve(true);
        return new Promise((resolve) => {
            let settled = false;
            /** 完成退出等待并释放监听器。 */
            const finish = (didExit) => {
                if (settled)
                    return;
                settled = true;
                clearTimeout(timer);
                child.off("exit", onExit);
                resolve(didExit);
            };
            /** 处理子进程 exit 事件。 */
            const onExit = () => finish(true);
            const timer = setTimeout(() => finish(false), timeoutMs);
            child.once("exit", onExit);
        });
    }
}

const session = new TsServerSession();
let shuttingDown = false;
/** 判断未知 IPC 消息是否为 helper JSON-RPC 请求。 */
function isHelperRpcRequest(value) {
    return !!value
        && typeof value === "object"
        && value.jsonrpc === "2.0"
        && typeof value.id === "number"
        && typeof value.method === "string";
}
/** 构造稳定 JSON-RPC 失败响应。 */
function failure(id, code, errorCode, message) {
    return {
        jsonrpc: "2.0",
        id,
        error: {
            code,
            message,
            data: { errorCode },
        },
    };
}
/** 校验 query RPC 的可信内部参数形状。 */
function queryParams(value) {
    if (!value || typeof value !== "object") {
        throw new ScriptLspHelperError("SCRIPT_LSP_HELPER_UNAVAILABLE", "query params 必须是对象。");
    }
    const params = value;
    if (typeof params.action !== "string"
        || typeof params.projectRoot !== "string"
        || typeof params.file !== "string") {
        throw new ScriptLspHelperError("SCRIPT_LSP_HELPER_UNAVAILABLE", "query params 缺少 action、projectRoot 或 file。");
    }
    return params;
}
/** 路由单条 helper RPC，并将异常收敛为稳定错误。 */
async function handleRequest(request) {
    try {
        let result;
        switch (request.method) {
            case "health":
                result = await session.health();
                break;
            case "query":
                result = await session.query(queryParams(request.params));
                break;
            case "shutdown":
                shuttingDown = true;
                result = await session.shutdown();
                break;
            default:
                return failure(request.id, -32601, "SCRIPT_LSP_METHOD_NOT_FOUND", "未知 Script LSP helper method。");
        }
        return { jsonrpc: "2.0", id: request.id, result };
    }
    catch (error) {
        if (error instanceof ScriptLspHelperError) {
            return failure(request.id, -32020, error.errorCode, error.message);
        }
        return failure(request.id, -32603, "SCRIPT_LSP_HELPER_UNAVAILABLE", "Script LSP helper 内部错误。");
    }
}
/** 通过 Node 子进程 IPC 发送响应，并在 flush 后执行回调。 */
function send(message, onSent) {
    if (typeof process.send !== "function" || !process.connected) {
        onSent?.();
        return;
    }
    process.send(message, () => onSent?.());
}
process.on("message", (message) => {
    if (!isHelperRpcRequest(message))
        return;
    void handleRequest(message).then((response) => {
        const shouldExit = message.method === "shutdown" && "result" in response;
        send(response, shouldExit ? () => process.exit(0) : undefined);
    });
});
process.on("disconnect", () => {
    shuttingDown = true;
    void session.shutdown().finally(() => process.exit(0));
});
/** 在系统信号到达时尽力清理 tsserver 直接子进程。 */
function handleTerminationSignal() {
    if (shuttingDown)
        return;
    shuttingDown = true;
    void session.shutdown().finally(() => process.exit(0));
}
process.once("SIGTERM", handleTerminationSignal);
process.once("SIGINT", handleTerminationSignal);
