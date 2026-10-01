import { createGameConfig, DEFAULT_GAME_CONFIG } from './config';
import { GameConfig } from './types';

export interface ClockFrame {
    readonly tick: number;
    readonly ticksThisFrame: number;
    readonly pendingSeconds: number;
    readonly frozen: boolean;
    readonly freezeReason: 'paused' | 'backlog' | null;
    readonly recovering: boolean;
    readonly interpolationAlpha: number;
}
export interface TickClock {
    readonly tick: number;
    advanceFrame(deltaSeconds: number, onTick: (tick: number) => void): ClockFrame;
    pause(): void;
    resume(): void;
    reset(): void;
}

/** Wall time is supplied by an adapter; this module never reads Date/performance. */
export class FixedTickClock implements TickClock {
    private readonly config: Readonly<GameConfig>;
    private currentTick = 0;
    private accumulator = 0;
    private reason: 'paused' | 'backlog' | null = null;
    private skipNextDelta = false;
    private recovery = false;
    constructor(config: GameConfig = DEFAULT_GAME_CONFIG) { this.config = createGameConfig(config); }
    get tick(): number { return this.currentTick; }
    get snapshot(): ClockFrame { return this.result(0); }
    pause(): void { if (this.reason === null) this.reason = 'paused'; }
    resume(): void {
        if (this.reason === null) return;
        this.recovery = this.recovery || this.pendingTicks() > this.config.maxTicksPerFrame;
        this.reason = null;
        this.skipNextDelta = true;
    }
    reset(): void {
        this.currentTick = 0; this.accumulator = 0; this.reason = null;
        this.skipNextDelta = false; this.recovery = false;
    }
    advanceFrame(deltaSeconds: number, onTick: (tick: number) => void): ClockFrame {
        if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new RangeError('deltaSeconds must be finite and non-negative');
        if (this.reason !== null) return this.result(0);
        if (this.skipNextDelta) this.skipNextDelta = false;
        else if (!this.recovery) this.accumulator += deltaSeconds;
        if (!Number.isFinite(this.accumulator)) throw new RangeError('wall time overflow');
        let due = this.pendingTicks();
        if (!this.recovery && due > this.config.maxTicksPerFrame) {
            this.reason = 'backlog';
            return this.result(0); // No lost ticks and no extra charging ticks.
        }
        const limit = Math.min(due, this.config.maxTicksPerFrame);
        let count = 0;
        while (count < limit && this.reason === null) {
            if (!Number.isSafeInteger(this.currentTick + 1)) throw new RangeError('tick overflow');
            this.accumulator = Math.max(0, this.accumulator - this.config.fixedStepSeconds);
            this.currentTick++;
            count++;
            onTick(this.currentTick);
        }
        due = this.pendingTicks();
        if (this.recovery && due === 0) this.recovery = false;
        return this.result(count);
    }
    private pendingTicks(): number {
        // Only compensate rounding at integer boundaries; not the gameplay epsilon.
        return Math.floor(this.accumulator / this.config.fixedStepSeconds + 1e-9);
    }
    private result(count: number): ClockFrame {
        return Object.freeze({ tick: this.currentTick, ticksThisFrame: count,
            pendingSeconds: this.accumulator, frozen: this.reason !== null,
            freezeReason: this.reason, recovering: this.recovery,
            interpolationAlpha: Math.min(1, this.accumulator / this.config.fixedStepSeconds) });
    }
}
