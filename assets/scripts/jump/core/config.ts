import { GameConfig, ModelKey } from './types';

const MODEL_KEYS: readonly ModelKey[] = Object.freeze([
    'block_00', 'block_01', 'block_03', 'block_04', 'block_08',
    'block_11', 'block_12', 'block_33', 'block_34', 'block_35',
] as ModelKey[]);

/** Single authoritative set of learning-version runtime values. */
export const DEFAULT_GAME_CONFIG: Readonly<GameConfig> = Object.freeze({
    configVersion: 'jump-learning-1.0', seed: 20260930,
    fixedStepSeconds: 1 / 60, maxTicksPerFrame: 5,
    minChargeSeconds: 0.08, maxChargeSeconds: 1.20,
    minJumpDistance: 4, maxJumpDistance: 22,
    verticalVelocity: 24, gravity: 80,
    platformWidth: 10, platformDepth: 10, platformHeight: 5.5,
    minPlatformScale: 0.8, maxPlatformScale: 1,
    minEdgeGap: 2, maxEdgeGap: 8,
    safeRadius: 0.30, centerRadius: 0.50, geometryEpsilon: 1e-6,
    cameraMoveSeconds: 0.25, initialTargetDistance: 14,
    platformPoolLimit: 8, normalScore: 1, centerScoreMultiplier: 2,
    maxRewardStreak: 8, modelKeys: MODEL_KEYS,
});

export function normalizeSeed(seed: number): number {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
        throw new RangeError('seed must be an unsigned 32-bit integer');
    }
    return seed === 0 ? 1 : seed;
}

/** Throws before any run starts. Does not perform stage02 ray reachability. */
export function validateGameConfig(config: GameConfig): void {
    if (typeof config.configVersion !== 'string' || !config.configVersion.trim()) {
        throw new Error('configVersion must be non-empty');
    }
    normalizeSeed(config.seed);
    const positive: (keyof GameConfig)[] = [
        'fixedStepSeconds', 'maxTicksPerFrame', 'minChargeSeconds', 'maxChargeSeconds',
        'minJumpDistance', 'maxJumpDistance', 'verticalVelocity', 'gravity',
        'platformWidth', 'platformDepth', 'platformHeight', 'minPlatformScale',
        'maxPlatformScale', 'centerRadius', 'geometryEpsilon', 'cameraMoveSeconds',
        'initialTargetDistance', 'platformPoolLimit', 'normalScore',
        'centerScoreMultiplier', 'maxRewardStreak',
    ];
    for (const key of positive) {
        const value = config[key];
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
            throw new RangeError(`${key} must be finite and positive`);
        }
    }
    for (const key of ['minEdgeGap', 'maxEdgeGap', 'safeRadius'] as const) {
        if (!Number.isFinite(config[key]) || config[key] < 0) throw new RangeError(`${key} must be non-negative`);
    }
    for (const key of ['maxTicksPerFrame', 'platformPoolLimit', 'normalScore', 'centerScoreMultiplier', 'maxRewardStreak'] as const) {
        if (!Number.isSafeInteger(config[key])) throw new RangeError(`${key} must be a safe integer`);
    }
    if (config.maxTicksPerFrame > 5) throw new RangeError('at most 5 ticks per render frame');
    if (config.platformPoolLimit < 4) throw new RangeError('pool must hold current, target, history and preview');
    if (config.maxChargeSeconds <= config.minChargeSeconds) throw new RangeError('charge interval must increase');
    if (config.maxJumpDistance < config.minJumpDistance) throw new RangeError('distance interval inverted');
    if (config.maxPlatformScale < config.minPlatformScale || config.maxEdgeGap < config.minEdgeGap) {
        throw new RangeError('platform interval inverted');
    }
    const safeHalf = Math.min(config.platformWidth, config.platformDepth) * config.minPlatformScale / 2 - config.safeRadius;
    if (safeHalf <= 0 || config.centerRadius > safeHalf) throw new RangeError('invalid safe/center radii');
    if (config.geometryEpsilon >= Math.min(safeHalf, config.minChargeSeconds)) throw new RangeError('epsilon too large');
    if (config.initialTargetDistance < config.minJumpDistance || config.initialTargetDistance > config.maxJumpDistance) {
        throw new RangeError('initial target outside jump range');
    }
    if (!Array.isArray(config.modelKeys) || config.modelKeys.length !== MODEL_KEYS.length ||
        config.modelKeys.some((key, index) => key !== MODEL_KEYS[index])) {
        throw new Error('model whitelist/order must match learning contract');
    }
}

export function createGameConfig(overrides: Partial<GameConfig> = {}): Readonly<GameConfig> {
    const merged = { ...DEFAULT_GAME_CONFIG, ...overrides };
    validateGameConfig(merged);
    return Object.freeze({ ...merged, seed: normalizeSeed(merged.seed), modelKeys: Object.freeze([...merged.modelKeys]) });
}
