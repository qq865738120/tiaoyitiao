import { DEFAULT_GAME_CONFIG } from './config';
import { GameConfig, PlatformSpec, ReplayResult, XZ } from './types';

export function isSafeLanding(point: XZ, platform: PlatformSpec, config: GameConfig = DEFAULT_GAME_CONFIG): boolean {
    const dx = point.x - platform.centerXZ.x, dz = point.z - platform.centerXZ.z;
    if (!Number.isFinite(dx) || !Number.isFinite(dz)) return false;
    if (platform.shape === 'rect') return Math.abs(dx) <= platform.halfExtent.x - config.safeRadius + config.geometryEpsilon &&
        Math.abs(dz) <= platform.halfExtent.z - config.safeRadius + config.geometryEpsilon;
    const r = platform.radius - config.safeRadius;
    return dx * dx + dz * dz <= r * r + config.geometryEpsilon;
}
export function isCenterLanding(point: XZ, platform: PlatformSpec, config: GameConfig = DEFAULT_GAME_CONFIG): boolean {
    return Math.hypot(point.x - platform.centerXZ.x, point.z - platform.centerXZ.z) <= config.centerRadius + config.geometryEpsilon;
}
export function classifyLanding(point: XZ, current: PlatformSpec, target: PlatformSpec,
    config: GameConfig = DEFAULT_GAME_CONFIG): ReplayResult['classification'] {
    if (isSafeLanding(point, target, config)) return isCenterLanding(point, target, config) ? 'target-center' : 'target-normal';
    return isSafeLanding(point, current, config) ? 'current' : 'miss';
}
export interface DistanceInterval { readonly min: number; readonly max: number; }
/** Geometric safety interval along a normalized ray; negative ray distances excluded. */
export function safeRayInterval(start: XZ, direction: XZ, target: PlatformSpec,
    config: GameConfig = DEFAULT_GAME_CONFIG): DistanceInterval | null {
    if (![start.x, start.z, direction.x, direction.z].every(Number.isFinite) ||
        Math.abs(Math.hypot(direction.x, direction.z) - 1) > config.geometryEpsilon) throw new RangeError('invalid ray');
    const offset = { x: start.x - target.centerXZ.x, z: start.z - target.centerXZ.z };
    let min = 0, max = Infinity;
    if (target.shape === 'circle') {
        const r = target.radius - config.safeRadius;
        const b = offset.x * direction.x + offset.z * direction.z;
        const discriminant = b * b - (offset.x * offset.x + offset.z * offset.z - r * r);
        if (discriminant < 0) return null;
        const root = Math.sqrt(discriminant);
        min = Math.max(0, -b - root); max = -b + root;
    } else {
        for (const axis of ['x', 'z'] as const) {
            const half = target.halfExtent[axis] - config.safeRadius;
            if (Math.abs(direction[axis]) < 1e-14) { if (Math.abs(offset[axis]) > half) return null; }
            else {
                const a = (-half - offset[axis]) / direction[axis], b = (half - offset[axis]) / direction[axis];
                min = Math.max(min, Math.min(a, b)); max = Math.min(max, Math.max(a, b));
            }
        }
    }
    return min <= max ? Object.freeze({ min, max }) : null;
}
export function directionToTarget(start: XZ, target: PlatformSpec): XZ {
    const dx = target.centerXZ.x - start.x, dz = target.centerXZ.z - start.z, length = Math.hypot(dx, dz);
    if (!Number.isFinite(length) || length === 0) throw new RangeError('invalid target direction');
    return Object.freeze({ x: dx / length, z: dz / length });
}
export function reachableDistanceInterval(start: XZ, target: PlatformSpec,
    config: GameConfig = DEFAULT_GAME_CONFIG): DistanceInterval | null {
    const interval = safeRayInterval(start, directionToTarget(start, target), target, config);
    if (!interval) return null;
    const min = Math.max(config.minJumpDistance, interval.min), max = Math.min(config.maxJumpDistance, interval.max);
    return min <= max ? Object.freeze({ min, max }) : null;
}
export function assertReachable(start: XZ, target: PlatformSpec, config: GameConfig = DEFAULT_GAME_CONFIG): DistanceInterval {
    const interval = reachableDistanceInterval(start, target, config);
    if (!interval) throw new RangeError(`configuration produces unreachable platform ${target.id} from actual foot`);
    return interval;
}
