import { createGameConfig, DEFAULT_GAME_CONFIG } from './config';
import { assertReachable } from './geometry';
import { Xorshift32 } from './random';
import { GameConfig, ModelKey, PlatformSpec, XZ } from './types';

export interface GeneratedPlatform {
    readonly platform: PlatformSpec;
    readonly axis: 'X' | 'Z';
    readonly gap: number;
    readonly centerDistance: number;
}
export class PlatformGenerator {
    private readonly random: Xorshift32;
    private readonly config: Readonly<GameConfig>;
    constructor(seed: number, config: GameConfig = DEFAULT_GAME_CONFIG) {
        this.config = createGameConfig(config); this.random = new Xorshift32(seed);
    }
    initial(): readonly PlatformSpec[] {
        const a = this.make(0, 'block_00', 1, { x: 0, z: 0 });
        const b = this.make(1, 'block_01', 1, { x: this.config.initialTargetDistance, z: 0 });
        assertReachable(a.centerXZ, b, this.config);
        return Object.freeze([a, b]);
    }
    next(previous: PlatformSpec): GeneratedPlatform {
        const axis = this.random.next() < 0.5 ? 'X' : 'Z';
        const scale = this.config.minPlatformScale + (this.config.maxPlatformScale - this.config.minPlatformScale) * this.random.next();
        const gap = this.config.minEdgeGap + (this.config.maxEdgeGap - this.config.minEdgeGap) * this.random.next();
        const model = this.config.modelKeys[Math.floor(this.config.modelKeys.length * this.random.next())];
        const half = previous.shape === 'circle' ? previous.radius : previous.halfExtent[axis === 'X' ? 'x' : 'z'];
        const newHalf = (model === 'block_03' ? Math.min(this.config.platformWidth, this.config.platformDepth) :
            axis === 'X' ? this.config.platformWidth : this.config.platformDepth) * scale / 2;
        const centerDistance = half + newHalf + gap;
        const center = { x: previous.centerXZ.x + (axis === 'X' ? centerDistance : 0),
            z: previous.centerXZ.z + (axis === 'Z' ? centerDistance : 0) };
        const platform = this.make(previous.id + 1, model, scale, center);
        assertReachable(previous.centerXZ, platform, this.config);
        return Object.freeze({ platform, axis, gap, centerDistance });
    }
    private make(id: number, modelKey: ModelKey, horizontalScale: number, centerXZ: XZ): PlatformSpec {
        const base = { id, modelKey, horizontalScale, centerXZ: Object.freeze({ ...centerXZ }), topY: this.config.platformHeight };
        return modelKey === 'block_03' ? Object.freeze({ ...base, shape: 'circle',
            radius: Math.min(this.config.platformWidth, this.config.platformDepth) * horizontalScale / 2 }) :
            Object.freeze({ ...base, shape: 'rect', halfExtent: Object.freeze({ x: this.config.platformWidth * horizontalScale / 2,
                z: this.config.platformDepth * horizontalScale / 2 }) });
    }
}
