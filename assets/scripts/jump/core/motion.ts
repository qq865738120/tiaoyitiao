import { DEFAULT_GAME_CONFIG } from './config';
import { FootPosition, GameConfig, JumpPlan } from './types';

export function chargeDistance(holdSeconds: number, config: GameConfig = DEFAULT_GAME_CONFIG): number {
    if (!Number.isFinite(holdSeconds) || holdSeconds < 0) throw new RangeError('invalid holdSeconds');
    const q = Math.max(0, Math.min(1, (holdSeconds - config.minChargeSeconds) / (config.maxChargeSeconds - config.minChargeSeconds)));
    return config.minJumpDistance + (config.maxJumpDistance - config.minJumpDistance) * q;
}
/** Descending crossing of a horizontal plane, not a render-frame proximity test. */
export function descendingLandingTime(startY: number, topY: number, config: GameConfig = DEFAULT_GAME_CONFIG): number {
    const d = config.verticalVelocity * config.verticalVelocity + 2 * config.gravity * (startY - topY);
    if (!Number.isFinite(d) || d < 0) throw new RangeError('unreachable landing height');
    return (config.verticalVelocity + Math.sqrt(d)) / config.gravity;
}
export function sampleJump(plan: JumpPlan, seconds: number, config: GameConfig = DEFAULT_GAME_CONFIG): FootPosition {
    if (!Number.isFinite(seconds)) throw new RangeError('invalid sample time');
    const t = Math.max(0, Math.min(plan.flightTime, seconds));
    const progress = t / plan.flightTime;
    return Object.freeze({ x: plan.startFoot.x + plan.directionXZ.x * plan.distance * progress,
        z: plan.startFoot.z + plan.directionXZ.z * plan.distance * progress,
        y: plan.startFoot.y + config.verticalVelocity * t - config.gravity * t * t / 2 });
}
