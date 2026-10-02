import { createGameConfig, DEFAULT_GAME_CONFIG, normalizeSeed } from './config';
import { assertReachable, classifyLanding, directionToTarget } from './geometry';
import { chargeDistance, descendingLandingTime, sampleJump } from './motion';
import { PlatformGenerator } from './platforms';
import { RunCommand, RunStateMachine } from './state-machine';
import { DomainEvent, FootPosition, GameConfig, PlatformSpec, ReplayResult, RunState } from './types';

/** Synchronous one-tick owner of rules; no view callbacks can drive its timers. */
export class JumpGameplay {
    private readonly config: Readonly<GameConfig>;
    private readonly machine: RunStateMachine;
    private generator: PlatformGenerator | null = null;
    private pool: readonly PlatformSpec[] = Object.freeze([]);
    private position: FootPosition = Object.freeze({ x: 0, y: 0, z: 0 });
    private queue: DomainEvent[] = [];
    private replayResults: readonly ReplayResult[] = Object.freeze([]);
    private phaseStartTick = 0;
    private nextPreview: PlatformSpec | null = null;
    constructor(config: GameConfig = DEFAULT_GAME_CONFIG) {
        this.config = createGameConfig(config); this.machine = new RunStateMachine(this.config);
    }
    get state(): Readonly<RunState> { return this.machine.state; }
    get foot(): FootPosition { return this.position; }
    get platforms(): readonly PlatformSpec[] { return this.pool; }
    get current(): PlatformSpec | undefined { return this.pool.find(p => p.id === this.state.currentId); }
    get target(): PlatformSpec | undefined { return this.pool.find(p => p.id === this.state.targetId); }
    get holdSeconds(): number {
        return this.state.phase === 'charging' ? Math.min(this.config.maxChargeSeconds,
            (this.state.tick - this.state.chargeStartTick!) * this.config.fixedStepSeconds) : 0;
    }
    get results(): readonly ReplayResult[] { return this.replayResults; }
    drainEvents(): DomainEvent[] { const events = this.queue; this.queue = []; return events; }
    start(seed: number = this.config.seed): boolean {
        // Prepare first: an invalid seed/config must not invalidate the existing run.
        try { seed = normalizeSeed(seed); } catch (_) { return false; }
        const generator = new PlatformGenerator(seed, this.config), initial = generator.initial();
        const preview = generator.next(initial[1]).platform;
        const result = this.machine.dispatch({ type: 'start', seed });
        if (!result.accepted) return false;
        this.generator = generator; this.pool = Object.freeze([...initial, preview]);
        this.position = Object.freeze({ ...initial[0].centerXZ, y: initial[0].topY });
        this.queue = [...result.events]; this.replayResults = Object.freeze([]);
        this.phaseStartTick = 0; this.nextPreview = null;
        return true;
    }
    home(): boolean {
        if (!this.send({ type: 'home', runId: this.state.runId })) return false;
        this.pool = Object.freeze([]); this.generator = null; this.nextPreview = null;
        this.replayResults = Object.freeze([]); this.queue = []; this.phaseStartTick = 0;
        return true;
    }
    press(source: string): boolean { return this.send({ type: 'charge', runId: this.state.runId, source }); }
    release(source: string): boolean {
        if (this.state.phase !== 'charging' || source !== this.state.inputOwner || !this.target) return false;
        const target = this.target;
        assertReachable(this.foot, target, this.config);
        return this.send({ type: 'launch', runId: this.state.runId, source, plan: {
            startFoot: this.foot, directionXZ: directionToTarget(this.foot, target),
            distance: chargeDistance(this.holdSeconds, this.config),
            flightTime: descendingLandingTime(this.foot.y, target.topY, this.config), targetId: target.id,
        } });
    }
    cancel(source?: string, reason?: string): boolean {
        return this.send({ type: 'cancel', runId: this.state.runId, source, reason });
    }
    pause(reason = 'pause'): boolean { return this.send({ type: 'pause', runId: this.state.runId, reason }); }
    resume(): boolean { return this.send({ type: 'resume', runId: this.state.runId }); }
    step(): boolean {
        if (!this.machine.advanceTick()) return false;
        const state = this.state, token = { runId: state.runId, jumpId: state.jumpId! };
        if (state.phase === 'airborne') {
            const plan = state.jumpPlan!;
            const elapsed = (state.tick - plan.startTick) * this.config.fixedStepSeconds;
            this.position = sampleJump(plan, elapsed, this.config);
            if (elapsed + Number.EPSILON >= plan.flightTime) this.touchDown();
        } else if (state.phase === 'landing' && state.tick - this.phaseStartTick >= 1) {
            if (state.landingOutcome === 'current') this.send({ type: 'finishLanding', ...token });
            else { this.send({ type: 'beginRecenter', ...token }); this.phaseStartTick = this.state.tick; }
        } else if (state.phase === 'recentering' && state.tick - this.phaseStartTick >= Math.ceil(this.config.cameraMoveSeconds / this.config.fixedStepSeconds)) {
            const currentId = state.targetId!, targetId = currentId + 1;
            if (this.send({ type: 'finishRecenter', ...token, currentId, targetId })) {
                this.pool = Object.freeze([...this.pool, this.nextPreview!].slice(-this.config.platformPoolLimit));
                this.nextPreview = null;
            }
        } else if (state.phase === 'falling') {
            const plan = state.jumpPlan!, end = sampleJump(plan, plan.flightTime, this.config);
            const elapsed = (state.tick - this.phaseStartTick) * this.config.fixedStepSeconds;
            const velocity = this.config.verticalVelocity - this.config.gravity * plan.flightTime;
            this.position = Object.freeze({ ...end, y: end.y + velocity * elapsed - this.config.gravity * elapsed * elapsed / 2 });
            if (state.tick - this.phaseStartTick >= Math.ceil(plan.flightTime / this.config.fixedStepSeconds)) this.send({ type: 'finishFall', ...token });
        }
        return true;
    }
    private touchDown(): void {
        const plan = this.state.jumpPlan!, current = this.current!, target = this.target!;
        const classification = classifyLanding(this.foot, current, target, this.config);
        const token = { runId: plan.runId, jumpId: plan.jumpId };
        if (classification === 'target-center' || classification === 'target-normal') {
            const upcoming = this.pool.find(p => p.id === target.id + 1)!;
            // Validate actual (possibly off-center) foot before score can change.
            assertReachable(this.foot, upcoming, this.config);
            this.nextPreview = this.generator!.next(upcoming).platform;
            this.position = Object.freeze({ ...this.foot, y: target.topY });
            this.send({ type: 'land', ...token, outcome: 'target' });
            this.send({ type: 'score', ...token, center: classification === 'target-center' });
        } else if (classification === 'current') {
            this.position = Object.freeze({ ...this.foot, y: current.topY });
            this.send({ type: 'land', ...token, outcome: 'current' });
        } else this.send({ type: 'fall', ...token, reason: 'miss' });
        this.phaseStartTick = this.state.tick;
        this.replayResults = Object.freeze([...this.replayResults, Object.freeze({ tick: this.state.tick,
            jumpId: plan.jumpId, classification, foot: this.foot, score: this.state.score, streak: this.state.streak })]);
    }
    private send(command: RunCommand): boolean {
        const result = this.machine.dispatch(command);
        if (result.accepted) this.queue.push(...result.events);
        return result.accepted;
    }
}
