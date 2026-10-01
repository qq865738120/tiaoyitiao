'use strict';

const { contextClient, publishJson, readStdinJson } = require('./lib/runtime.cjs');

function text(value, code) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(code);
    return value.trim();
}

function list(value, code) {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
        throw new Error(code);
    }
    return value.map((item) => item.trim());
}

function positiveInteger(value, code) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error(code);
    return number;
}

function buildBrief(parameters) {
    const width = positiveInteger(parameters.canvasWidth, 'UI_V2_CANVAS_WIDTH_INVALID');
    const height = positiveInteger(parameters.canvasHeight, 'UI_V2_CANVAS_HEIGHT_INVALID');
    const outputDirectory = text(parameters.outputDirectory, 'UI_V2_OUTPUT_DIRECTORY_REQUIRED').replace(/\/$/, '');
    const prefabName = text(parameters.prefabName, 'UI_V2_PREFAB_NAME_REQUIRED');
    const requiredElements = list(parameters.requiredElements || [], 'UI_V2_REQUIRED_ELEMENTS_INVALID');
    const exactTexts = list(parameters.exactTexts || [], 'UI_V2_EXACT_TEXTS_INVALID');
    return {
        schema: 'game-agent.ui-generation-brief/v2',
        schemaVersion: 2,
        canvas: {
            width,
            height,
            orientation: width === height ? 'square' : width > height ? 'landscape' : 'portrait',
        },
        request: {
            description: text(parameters.description, 'UI_V2_DESCRIPTION_REQUIRED'),
            genre: text(parameters.genre, 'UI_V2_GENRE_REQUIRED'),
            references: list(parameters.references || [], 'UI_V2_REFERENCES_INVALID'),
            requiredElements,
            exactTexts,
            referenceUiImageAttached: Boolean(parameters.referenceUiImage),
        },
        authority: {
            semantic: 'user-input',
            visualLayout: 'composite-top-left-effect',
            ordinaryText: 'editable-cc-label',
            artisticText: 'sprite-crop',
        },
        composite: {
            regions: ['effect', 'background', 'ui-elements', 'ordinary-text'],
            separator: 'approximately-2px-dark-center-cross',
            sameLayoutRequired: true,
        },
        publication: {
            outputDirectory,
            prefabName,
            retentionDays: 7,
        },
    };
}

async function main() {
    const input = await readStdinJson();
    const brief = buildBrief(input.parameters || {});
    const briefArtifact = await publishJson(
        contextClient(),
        brief,
        'game-agent.ui-generation-brief/v2',
        input.parameters && input.parameters.referenceUiImage ? [input.parameters.referenceUiImage] : [],
        brief.publication.retentionDays,
    );
    process.stdout.write(JSON.stringify({
        brief,
        briefArtifact,
        referenceUiImageAttached: brief.request.referenceUiImageAttached,
    }));
}

if (require.main === module) main().catch((error) => {
    process.stderr.write(String(error && error.message || error));
    process.exitCode = 1;
});

module.exports = { buildBrief };
