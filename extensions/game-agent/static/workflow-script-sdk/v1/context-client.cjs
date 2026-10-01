'use strict';

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function digest(value) {
    return crypto.createHash('sha256').update(JSON.stringify(stable(value)), 'utf8').digest('hex');
}

class WorkflowScriptContextClient {
    constructor(descriptor, cwd) {
        this.descriptor = descriptor;
        this.cwd = path.resolve(cwd);
        this.sequence = 0;
    }

    call(method, params, timeoutMs = 30000, options = {}) {
        const durableWait = options.waitPolicy === 'durable';
        const unsigned = {
            version: 1,
            requestId: `sdk_${Date.now()}_${this.sequence + 1}`,
            sequence: ++this.sequence,
            deadlineAt: durableWait ? 0 : Date.now() + Math.min(Math.max(timeoutMs, 1), 60000),
            identity: this.descriptor.identity,
            method,
            ...(durableWait ? { waitPolicy: 'durable' } : {}),
            ...(params === undefined ? {} : { params }),
        };
        const body = Buffer.from(JSON.stringify({ ...unsigned, requestDigest: digest(unsigned) }), 'utf8');
        return new Promise((resolve, reject) => {
            const request = http.request({
                socketPath: this.descriptor.socketPath,
                path: this.descriptor.requestPath,
                method: 'POST',
                ...(durableWait ? {} : { timeout: timeoutMs }),
                headers: {
                    authorization: `Bearer ${this.descriptor.token}`,
                    'content-type': 'application/json',
                    'content-length': body.byteLength,
                },
            }, (response) => {
                const chunks = [];
                let bytes = 0;
                response.on('data', (chunk) => {
                    bytes += chunk.byteLength;
                    if (bytes > 1024 * 1024) response.destroy(new Error('WORKFLOW_CONTEXT_RESPONSE_LIMIT'));
                    else chunks.push(Buffer.from(chunk));
                });
                response.on('end', () => {
                    let payload;
                    try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
                    catch { return reject(new Error('WORKFLOW_CONTEXT_RESPONSE_INVALID')); }
                    if (response.statusCode !== 200 || !payload.ok) {
                        return reject(new Error(typeof payload.code === 'string' ? payload.code : 'WORKFLOW_CONTEXT_CALL_FAILED'));
                    }
                    resolve(payload.result);
                });
            });
            if (!durableWait) {
                request.once('timeout', () => request.destroy(new Error('WORKFLOW_CONTEXT_DEADLINE_EXCEEDED')));
            }
            request.once('error', reject);
            request.end(body);
        });
    }

    callDurable(method, params) {
        return this.call(method, params, 0, { waitPolicy: 'durable' });
    }

    /** 调用公共图片处理；计算受普通期限限制。 */
    processImage(request) { return this.call('processImage', request, 60000); }

    invokeAgent(agentId, request, outputName) {
        return this.callDurable('invokeAgent', { agentId, request, outputName });
    }

    publishProjectAsset(artifact, targetDbUrl, expectedImporter, expectedType) {
        return this.callDurable('publishProjectAsset', { artifact, targetDbUrl, expectedImporter, expectedType });
    }

    resolveAttemptPath(relativePath) {
        if (typeof relativePath !== 'string' || path.isAbsolute(relativePath)) throw new Error('WORKFLOW_CONTEXT_PATH_INVALID');
        const resolved = path.resolve(this.cwd, relativePath);
        const relative = path.relative(this.cwd, resolved);
        if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
            throw new Error('WORKFLOW_CONTEXT_PATH_INVALID');
        }
        return resolved;
    }
}

function createWorkflowScriptContextClient(cwd = process.cwd()) {
    const resolvedCwd = path.resolve(cwd);
    const descriptor = JSON.parse(fs.readFileSync(path.join(resolvedCwd, '.workflow-context.json'), 'utf8'));
    if (!descriptor || descriptor.version !== 1 || typeof descriptor.socketPath !== 'string'
        || descriptor.requestPath !== '/v1/call' || typeof descriptor.token !== 'string') {
        throw new Error('WORKFLOW_CONTEXT_DESCRIPTOR_INVALID');
    }
    return new WorkflowScriptContextClient(descriptor, resolvedCwd);
}

module.exports = { WorkflowScriptContextClient, createWorkflowScriptContextClient };
