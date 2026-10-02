import { DomainEvent, XZ } from '../core/types';

export const FEEDBACK_SECONDS = Object.freeze({ chargeEase: .08, launch: .12, landing: .18, center: .35, score: .45 });
const clamp = (v: number): number => Math.max(0, Math.min(1, v));
const age = (now: number, start: number | null): number => start === null ? Infinity : Math.max(0, now - start);
export interface FeedbackSample {
    readonly scaleXZ: number; readonly scaleY: number;
    readonly axisX: number; readonly axisZ: number; readonly flipRadians: number;
    readonly centerAlpha: number; readonly centerRadius: number; readonly scoreScale: number;
    readonly centerActive: boolean; readonly scoreActive: boolean;
}

/** No cc, wall-clock, timer, tween, random or rule writes. All time is simulation seconds. */
export class FeedbackTimeline {
    private runId = -1;
    private chargingAt: number | null = null;
    private launchAt: number | null = null;
    private landingAt: number | null = null;
    private centerAt: number | null = null;
    private scoreAt: number | null = null;
    private pausedAt: number | null = null;
    private flightTime = .6;
    private direction: XZ = { x: 1, z: 0 };
    // One monotonic id per event kind: bounded memory, even for very long runs.
    private lastJump = -1; private lastLanding = -1; private lastScore = -1;
    constructor(private readonly fixedStepSeconds = 1 / 60) {}
    reset(runId: number): void {
        this.runId = runId; this.chargingAt = this.launchAt = this.landingAt = this.centerAt = this.scoreAt = this.pausedAt = null;
        this.lastJump = this.lastLanding = this.lastScore = -1; this.direction = { x: 1, z: 0 };
    }
    clear(): void { this.reset(-1); }
    consume(event: DomainEvent, currentRunId: number): boolean {
        if (event.runId !== currentRunId) return false;
        if (event.type === 'Started') { if (this.runId === currentRunId) return false; this.reset(currentRunId); return true; }
        if (this.runId !== currentRunId) return false;
        const seconds = event.tick * this.fixedStepSeconds;
        switch (event.type) {
        case 'Charge': this.chargingAt = event.action === 'begin' ? seconds : null; break;
        case 'Jump':
            if (event.jumpId <= this.lastJump) return false;
            this.lastJump = event.jumpId; this.launchAt = seconds; this.landingAt = this.chargingAt = null;
            this.direction = { ...event.plan.directionXZ }; this.flightTime = event.plan.flightTime; break;
        case 'Landed':
            if (event.jumpId <= this.lastLanding) return false;
            this.lastLanding = event.jumpId; this.landingAt = seconds; this.launchAt = null; break;
        case 'Scored':
            if (event.jumpId <= this.lastScore) return false;
            this.lastScore = event.jumpId; this.scoreAt = seconds;
            this.centerAt = event.streak > 0 ? seconds : null; break;
        case 'Paused': this.pausedAt = seconds; this.chargingAt = null; break;
        case 'Resumed': this.pausedAt = null; break;
        case 'Failed': case 'Returned': this.reset(currentRunId); break;
        }
        return true;
    }
    sample(seconds: number, chargeRatio = 0, flightRatio: number | null = null, direction?: XZ): FeedbackSample {
        const now = this.pausedAt === null ? seconds : this.pausedAt;
        const charge = clamp(chargeRatio) * (this.chargingAt === null ? 1 : clamp(age(now, this.chargingAt) / FEEDBACK_SECONDS.chargeEase));
        const launchAge = age(now, this.launchAt), landAge = age(now, this.landingAt);
        const launch = launchAge < FEEDBACK_SECONDS.launch ? Math.sin(Math.PI * launchAge / FEEDBACK_SECONDS.launch) : 0;
        const land = landAge < FEEDBACK_SECONDS.landing ? Math.sin(Math.PI * landAge / FEEDBACK_SECONDS.landing) : 0;
        const spin = this.launchAt === null ? (flightRatio === null ? 0 : clamp(flightRatio)) : clamp(launchAge / this.flightTime);
        const dir = direction || this.direction, length = Math.hypot(dir.x, dir.z) || 1;
        const centerAge = age(now, this.centerAt), scoreAge = age(now, this.scoreAt);
        const centerActive = centerAge < FEEDBACK_SECONDS.center - 1e-9, scoreActive = scoreAge < FEEDBACK_SECONDS.score - 1e-9;
        return {
            scaleXZ: 1 + .12 * charge - .07 * launch + .10 * land,
            scaleY: 1 - .28 * charge + .18 * launch - .22 * land,
            axisX: dir.z / length, axisZ: -dir.x / length, flipRadians: spin * Math.PI * 2,
            centerAlpha: centerActive ? 1 - centerAge / FEEDBACK_SECONDS.center : 0,
            centerRadius: 12 + 24 * clamp(centerAge / FEEDBACK_SECONDS.center),
            scoreScale: scoreActive ? 1 + .20 * Math.sin(Math.PI * scoreAge / FEEDBACK_SECONDS.score) : 1,
            centerActive, scoreActive,
        };
    }
    get activeRunId(): number { return this.runId; }
}

/** Independent fixed visual sequence; never receives a platform PRNG. */
export class BackgroundSequence {
    private runId = -1; private scored = 0; private lastScore = -1;
    private readonly sequence = [5, 0, 1, 2, 3, 4, 6];
    reset(runId: number): void { this.runId = runId; this.scored = 0; this.lastScore = -1; }
    consume(event: DomainEvent, currentRunId: number): boolean {
        if (event.runId !== currentRunId) return false;
        if (event.type === 'Started') { if (this.runId === currentRunId) return false; this.reset(currentRunId); return true; }
        if (event.type === 'Returned') { this.reset(currentRunId); return true; }
        if (this.runId !== currentRunId || event.type !== 'Scored' || event.jumpId <= this.lastScore) return false;
        this.lastScore = event.jumpId; this.scored++; return true;
    }
    get index(): number { return this.sequence[Math.floor(this.scored / 4) % this.sequence.length]; }
}
