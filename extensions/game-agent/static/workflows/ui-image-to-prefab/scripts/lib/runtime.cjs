'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function readStdinJson() {
    return new Promise((resolve, reject) => {
        let text = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => { text += chunk; });
        process.stdin.on('end', () => {
            try { resolve(JSON.parse(text)); }
            catch (error) { reject(error); }
        });
        process.stdin.on('error', reject);
    });
}

function contextClient() {
    const sdk = require(path.join(process.cwd(), '.workflow-sdk', 'context-client.cjs'));
    return sdk.createWorkflowScriptContextClient(process.cwd());
}

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function digestJson(value) {
    return crypto.createHash('sha256').update(JSON.stringify(stable(value)), 'utf8').digest('hex');
}

function safeId(value, fallback) {
    const normalized = String(value || '').replace(/[^A-Za-z0-9_-]/g, '-').replace(/^-+/, '').slice(0, 64);
    if (/^[A-Za-z]/.test(normalized)) return normalized;
    const digest = crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex').slice(0, 12);
    return `${fallback || 'item'}-${normalized || digest}`.slice(0, 64);
}

async function publishJson(client, value, schemaId, lineage, retentionDays) {
    const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
    const retentionMs = Number(retentionDays) * 24 * 60 * 60 * 1000;
    const created = await client.call('createArtifact', {
        mediaType: 'application/json', schemaId,
        ...(Number.isSafeInteger(retentionMs) ? { retentionMs } : {}),
    });
    const outputPath = client.resolveAttemptPath(created.relativePath);
    await fs.promises.writeFile(outputPath, bytes);
    const expectedDigest = crypto.createHash('sha256').update(bytes).digest('hex');
    const finalized = await client.call('finalizeArtifact', {
        writerId: created.writerId,
        expectedDigest,
        lineage: (lineage || []).map((handle) => ({ artifactId: handle.artifactId, digest: handle.digest })),
    });
    return finalized.handle;
}

module.exports = { contextClient, digestJson, publishJson, readStdinJson, safeId };
