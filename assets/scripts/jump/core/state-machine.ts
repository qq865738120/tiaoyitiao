import { createGameConfig, DEFAULT_GAME_CONFIG, normalizeSeed } from './config';
import { ActivePhase, CallbackToken, DomainEvent, GameConfig, JumpPlan, JumpPlanDraft, JumpToken, LandingOutcome, RunState } from './types';

export type JumpEventKind = 'Scored' | 'Failed';
/** Publication boundary only; deliberately contains no collision or reward rules. */
export class JumpEventBoundary {
    private runId = 0;
    private lastJumpId = 0;
    private activeJumpId: number | null = null;
    private claimed = new Set<JumpEventKind>();
    startRun(runId: number): boolean {
        if (!Number.isSafeInteger(runId) || runId <= this.runId) return false;
        this.runId = runId; this.lastJumpId = 0; this.activeJumpId = null; this.claimed.clear();
        return true;
    }
    openJump(token: JumpToken): boolean {
        if (token.runId !== this.runId || !Number.isSafeInteger(token.jumpId) || token.jumpId <= this.lastJumpId) return false;
        this.lastJumpId = token.jumpId; this.activeJumpId = token.jumpId; this.claimed.clear();
        return true;
    }
    closeJump(token: JumpToken): boolean {
        if (token.runId !== this.runId || token.jumpId !== this.activeJumpId) return false;
        this.activeJumpId = null; this.claimed.clear(); return true;
    }
    claim(token: JumpToken, kind: JumpEventKind): boolean {
        if ((kind !== 'Scored' && kind !== 'Failed') || token.runId !== this.runId ||
            token.jumpId !== this.activeJumpId || this.claimed.has(kind)) return false;
        this.claimed.add(kind);
        return true;
    }
}

export type RunCommand =
    { readonly type: 'start'; readonly seed?: number; } |
    { readonly type: 'home'; readonly runId: number; } |
    { readonly type: 'charge'; readonly runId: number; readonly source: string; } |
    { readonly type: 'cancel'; readonly runId: number; readonly source?: string; readonly reason?: string; } |
    { readonly type: 'launch'; readonly runId: number; readonly source: string; readonly plan: JumpPlanDraft; } |
    { readonly type: 'pause'; readonly runId: number; readonly reason?: string; } |
    { readonly type: 'resume'; readonly runId: number; } |
    ({ readonly type: 'land'; readonly outcome: LandingOutcome; } & JumpToken) |
    ({ readonly type: 'beginRecenter'; } & JumpToken) |
    ({ readonly type: 'finishRecenter'; readonly currentId: number; readonly targetId: number; } & JumpToken) |
    ({ readonly type: 'finishLanding'; } & JumpToken) |
    ({ readonly type: 'fall'; readonly reason?: string; } & JumpToken) |
    ({ readonly type: 'finishFall'; } & JumpToken);
export interface CommandResult {
    readonly accepted: boolean;
    readonly reason: string | null;
    readonly state: Readonly<RunState>;
    readonly events: readonly DomainEvent[];
}

export class RunStateMachine {
    private readonly config: Readonly<GameConfig>;
    private value: Readonly<RunState>;
    private nextJumpId = 0;
    private fallReason = 'miss';
    private readonly boundary = new JumpEventBoundary();
    constructor(config: GameConfig = DEFAULT_GAME_CONFIG) {
        this.config = createGameConfig(config);
        this.value = this.emptyState(0, 'menu', this.config.seed);
    }
    get state(): Readonly<RunState> { return this.value; }
    isCurrent(token: CallbackToken): boolean {
        return token.runId === this.value.runId && this.value.phase !== 'menu' &&
            (token.jumpId === undefined || token.jumpId === this.value.jumpId);
    }
    guardCallback(token: CallbackToken, callback: () => void): boolean {
        if (!this.isCurrent(token) || this.value.phase === 'paused' || this.value.phase === 'gameover') return false;
        callback(); return true;
    }
    advanceTick(): boolean {
        if (['menu', 'paused', 'gameover'].indexOf(this.value.phase) !== -1) return false;
        if (!Number.isSafeInteger(this.value.tick + 1)) throw new RangeError('tick overflow');
        this.patch({ tick: this.value.tick + 1 }); return true;
    }
    /** Phase02 must atomically combine this reservation with its score reducer/event. */
    claimJumpEvent(token: JumpToken, kind: 'Scored'): boolean {
        if (!this.isCurrent(token) || this.value.phase !== 'landing' || this.value.landingOutcome !== 'target') return false;
        return this.boundary.claim(token, kind);
    }
    dispatch(command: RunCommand): CommandResult {
        const events: DomainEvent[] = [];
        const reject = (reason: string) => this.result(false, reason, events);
        const emit = (event: DomainEvent) => events.push(Object.freeze(event));
        const base = () => ({ runId: this.value.runId, tick: this.value.tick });
        if (command.type === 'start') {
            let seed: number;
            try { seed = normalizeSeed(command.seed === undefined ? this.config.seed : command.seed); }
            catch (_) { return reject('invalid-seed'); }
            const runId = this.value.runId + 1;
            if (!Number.isSafeInteger(runId)) return reject('run-id-overflow');
            this.value = this.emptyState(runId, 'ready', seed);
            this.nextJumpId = 0; this.fallReason = 'miss'; this.boundary.startRun(runId);
            emit({ ...base(), type: 'Started', seed });
            return this.result(true, null, events);
        }
        if (!this.isCurrent(command)) return reject('stale-token');
        if (['land', 'beginRecenter', 'finishRecenter', 'finishLanding', 'fall', 'finishFall'].indexOf(command.type) !== -1) {
            const jumpId = (command as JumpToken).jumpId;
            if (!Number.isSafeInteger(jumpId) || jumpId <= 0 || jumpId !== this.value.jumpId) return reject('stale-jump');
        }
        switch (command.type) {
            case 'home': {
                const runId = this.value.runId + 1;
                if (!Number.isSafeInteger(runId)) return reject('run-id-overflow');
                emit({ ...base(), type: 'Returned' });
                this.value = this.emptyState(runId, 'menu', this.value.seed);
                this.boundary.startRun(runId); this.nextJumpId = 0;
                break;
            }
            case 'charge':
                if (this.value.phase !== 'ready') return reject('illegal-phase');
                if (typeof command.source !== 'string' || !command.source.trim()) return reject('invalid-source');
                this.patch({ phase: 'charging', inputOwner: command.source, chargeStartTick: this.value.tick });
                emit({ ...base(), type: 'Charge', action: 'begin', source: command.source });
                break;
            case 'cancel':
                if (this.value.phase !== 'charging') return reject('illegal-phase');
                if (command.source !== undefined && command.source !== this.value.inputOwner) return reject('not-owner');
                this.cancelCharge(events, command.reason || 'cancel');
                break;
            case 'launch': {
                if (this.value.phase !== 'charging') return reject('illegal-phase');
                if (command.source !== this.value.inputOwner) return reject('not-owner');
                const seconds = (this.value.tick - this.value.chargeStartTick!) * this.config.fixedStepSeconds;
                if (seconds + Number.EPSILON < this.config.minChargeSeconds) {
                    this.cancelCharge(events, 'short-charge'); break;
                }
                if (!this.validPlan(command.plan)) return reject('invalid-plan');
                const jumpId = this.nextJumpId + 1;
                if (!Number.isSafeInteger(jumpId)) return reject('jump-id-overflow');
                const plan: JumpPlan = Object.freeze({ ...command.plan, runId: this.value.runId, jumpId,
                    startTick: this.value.tick, startFoot: Object.freeze({ ...command.plan.startFoot }),
                    directionXZ: Object.freeze({ ...command.plan.directionXZ }) });
                this.nextJumpId = jumpId; this.boundary.openJump(plan);
                this.patch({ phase: 'airborne', jumpId, jumpPlan: plan, inputOwner: null, chargeStartTick: null });
                emit({ ...base(), type: 'Jump', jumpId, plan });
                break;
            }
            case 'pause': {
                const phase = this.value.phase;
                if (phase === 'paused' || phase === 'gameover') return reject('illegal-phase');
                if (phase === 'charging') this.cancelCharge(events, command.reason || 'pause');
                const resumePhase = this.value.phase as Exclude<ActivePhase, 'charging'>;
                this.patch({ phase: 'paused', resumePhase });
                emit({ ...base(), type: 'Paused', resumePhase, reason: command.reason || 'pause' });
                break;
            }
            case 'resume': {
                if (this.value.phase !== 'paused' || !this.value.resumePhase) return reject('illegal-phase');
                const phase = this.value.resumePhase;
                this.patch({ phase, resumePhase: null });
                emit({ ...base(), type: 'Resumed', phase });
                break;
            }
            case 'land':
                if (this.value.phase !== 'airborne') return reject('illegal-phase');
                if (command.outcome !== 'target' && command.outcome !== 'current') return reject('invalid-outcome');
                this.patch({ phase: 'landing', landingOutcome: command.outcome });
                emit({ ...base(), type: 'Landed', jumpId: command.jumpId, outcome: command.outcome });
                break;
            case 'beginRecenter':
                if (this.value.phase !== 'landing' || this.value.landingOutcome !== 'target') return reject('illegal-phase');
                this.patch({ phase: 'recentering' });
                break;
            case 'finishRecenter':
                if (this.value.phase !== 'recentering') return reject('illegal-phase');
                if (command.currentId !== this.value.targetId || !Number.isSafeInteger(command.targetId) || command.targetId <= command.currentId) return reject('invalid-platform-ids');
                this.finishJump({ currentId: command.currentId, targetId: command.targetId });
                break;
            case 'finishLanding':
                if (this.value.phase !== 'landing' || this.value.landingOutcome !== 'current') return reject('illegal-phase');
                this.finishJump({});
                break;
            case 'fall':
                if (this.value.phase !== 'airborne') return reject('illegal-phase');
                this.fallReason = command.reason || 'miss'; this.patch({ phase: 'falling' });
                break;
            case 'finishFall':
                if (this.value.phase !== 'falling') return reject('illegal-phase');
                if (!this.boundary.claim(command, 'Failed')) return reject('duplicate-event');
                this.patch({ phase: 'gameover' });
                emit({ ...base(), type: 'Failed', jumpId: command.jumpId, reason: this.fallReason });
                break;
            default: return reject('unknown-command');
        }
        return this.result(true, null, events);
    }
    private cancelCharge(events: DomainEvent[], reason: string): void {
        events.push(Object.freeze({ type: 'Charge', action: 'cancel', source: this.value.inputOwner!,
            runId: this.value.runId, tick: this.value.tick, reason }));
        this.patch({ phase: 'ready', inputOwner: null, chargeStartTick: null });
    }
    private validPlan(plan: JumpPlanDraft): boolean {
        if (!plan || !plan.startFoot || !plan.directionXZ) return false;
        const values = [plan.startFoot.x, plan.startFoot.y, plan.startFoot.z,
            plan.directionXZ.x, plan.directionXZ.z, plan.distance, plan.flightTime];
        return values.every(Number.isFinite) && plan.targetId === this.value.targetId &&
            Math.abs(Math.hypot(plan.directionXZ.x, plan.directionXZ.z) - 1) <= this.config.geometryEpsilon &&
            plan.distance >= this.config.minJumpDistance && plan.distance <= this.config.maxJumpDistance &&
            Math.abs(plan.flightTime - 2 * this.config.verticalVelocity / this.config.gravity) <= this.config.geometryEpsilon;
    }
    private finishJump(platforms: Partial<RunState>): void {
        this.boundary.closeJump({ runId: this.value.runId, jumpId: this.value.jumpId! });
        this.patch({ ...platforms, phase: 'ready', jumpId: null, jumpPlan: null, landingOutcome: null });
    }
    private patch(values: Partial<RunState>): void { this.value = Object.freeze({ ...this.value, ...values }); }
    private emptyState(runId: number, phase: 'menu' | 'ready', seed: number): Readonly<RunState> {
        return Object.freeze({ runId, phase, seed, tick: 0, score: 0, streak: 0,
            currentId: phase === 'menu' ? null : 0, targetId: phase === 'menu' ? null : 1,
            jumpId: null, chargeStartTick: null, inputOwner: null, jumpPlan: null,
            resumePhase: null, landingOutcome: null });
    }
    private result(accepted: boolean, reason: string | null, events: DomainEvent[]): CommandResult {
        return Object.freeze({ accepted, reason, state: this.value, events: Object.freeze(events) });
    }
}
