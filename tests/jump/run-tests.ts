import {
    DEFAULT_GAME_CONFIG as C, createGameConfig, normalizeSeed, Xorshift32,
    RunStateMachine, JumpEventBoundary, FixedTickClock, GameConfig, JumpPlanDraft,
    JumpToken, RunCommand,
} from '../../assets/scripts/jump/core';

// Keep this entry independent of npm/@types/node and Creator's generated tsconfig.
declare const require: (name: string) => any;
declare const process: any;
const fs = require('fs');
const crypto = require('crypto');
const cp = require('child_process');
const os = require('os');
const baselinePath = 'docs/数据/验收基准.json';
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const results: any[] = [];
let assertions = 0;
function assert(value: unknown, message: string): asserts value {
    assertions++;
    if (!value) throw new Error(message);
}
function equal(actual: unknown, expected: unknown, message = 'equality'): void {
    assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
}
function near(actual: number, expected: number, epsilon = 1e-10): void {
    assert(Math.abs(actual - expected) <= epsilon, `expected ${expected}, got ${actual}`);
}
function throws(fn: () => void): void {
    let rejected = false;
    try { fn(); } catch (_) { rejected = true; }
    assert(rejected, 'expected throw');
}
function test(caseId: string, expected: string, body: () => unknown): void {
    const before = assertions;
    try {
        const actual = body();
        results.push({ caseId, expected, actual: actual === undefined ? 'all assertions passed' : actual, status: 'pass', assertions: assertions - before });
        console.log(`PASS ${caseId}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ caseId, expected, actual: message, status: 'fail', assertions: assertions - before });
        console.error(`FAIL ${caseId}: ${message}`);
    }
}
function draft(targetId = 1): JumpPlanDraft {
    return { startFoot: { x: 0, y: 5.5, z: 0 }, directionXZ: { x: 1, z: 0 }, distance: 14, flightTime: 0.6, targetId };
}
function started(): RunStateMachine {
    const machine = new RunStateMachine();
    assert(machine.dispatch({ type: 'start' }).accepted, 'start');
    return machine;
}
function charge(machine: RunStateMachine): void {
    assert(machine.dispatch({ type: 'charge', runId: machine.state.runId, source: 'space' }).accepted, 'charge');
}
function launch(machine: RunStateMachine): JumpToken {
    charge(machine);
    for (let n = 0; n < 5; n++) assert(machine.advanceTick(), 'charge tick');
    assert(machine.dispatch({ type: 'launch', runId: machine.state.runId, source: 'space', plan: draft(machine.state.targetId!) }).accepted, 'launch');
    equal(machine.state.phase, 'airborne');
    return { runId: machine.state.runId, jumpId: machine.state.jumpId! };
}
function rejected(machine: RunStateMachine, command: RunCommand): void {
    const previous = machine.state;
    const result = machine.dispatch(command);
    assert(!result.accepted, 'command must reject');
    equal(result.events, [], 'rejected command emits no events');
    assert(previous === machine.state, 'rejected command does not mutate snapshot');
}
let random100: number[] = [];
test('P01-prng-100-repeat', '100 identical uint32s for seed=20260930; float [0,1)', () => {
    const a = new Xorshift32(20260930), b = new Xorshift32(20260930), f = new Xorshift32(20260930);
    random100 = Array.from({ length: 100 }, () => a.nextUint32());
    const second = Array.from({ length: 100 }, () => b.nextUint32());
    equal(random100, second);
    for (const integer of random100) {
        const float = f.next();
        equal(float, integer / 4294967296);
        assert(float >= 0 && float < 1, 'random range');
    }
    return { count: random100.length, sha256: crypto.createHash('sha256').update(JSON.stringify(random100)).digest('hex') };
});
test('P02-prng-first16-baseline', 'exact match to independent precomputed first16', () => {
    equal(C.configVersion, baseline.configVersion); equal(C.seed, baseline.seed);
    equal(random100.slice(0, 16), baseline.prng.first16Uint32);
    return random100.slice(0, 16);
});
test('P03-zero-seed', '0 normalizes to 1 in config, PRNG and run', () => {
    equal(normalizeSeed(0), 1); equal(createGameConfig({ seed: 0 }).seed, 1);
    const a = new Xorshift32(0), b = new Xorshift32(1);
    for (let n = 0; n < 100; n++) equal(a.nextUint32(), b.nextUint32());
    const m = started(); assert(m.dispatch({ type: 'start', seed: 0 }).accepted, 'zero run seed'); equal(m.state.seed, 1);
});
test('P04-seed-validation', 'negative, fraction, NaN, Infinity and >uint32 rejected; maxuint32 accepted', () => {
    for (const seed of [-1, 0.1, NaN, Infinity, 4294967296]) {
        throws(() => new Xorshift32(seed)); throws(() => createGameConfig({ seed }));
    }
    equal(new Xorshift32(0xffffffff).currentState, 0xffffffff);
});
test('C01-design-single-source', 'all design values and model order exact; derived T=.6/apex=3.6', () => {
    const expected: GameConfig = {
        configVersion: 'jump-learning-1.0', seed: 20260930, fixedStepSeconds: 1 / 60, maxTicksPerFrame: 5,
        minChargeSeconds: 0.08, maxChargeSeconds: 1.2, minJumpDistance: 4, maxJumpDistance: 22,
        verticalVelocity: 24, gravity: 80, platformWidth: 10, platformDepth: 10, platformHeight: 5.5,
        minPlatformScale: 0.8, maxPlatformScale: 1, minEdgeGap: 2, maxEdgeGap: 8,
        safeRadius: 0.3, centerRadius: 0.5, geometryEpsilon: 1e-6, cameraMoveSeconds: 0.25,
        initialTargetDistance: 14, platformPoolLimit: 8, normalScore: 1, centerScoreMultiplier: 2,
        maxRewardStreak: 8, modelKeys: ['block_00', 'block_01', 'block_03', 'block_04', 'block_08', 'block_11', 'block_12', 'block_33', 'block_34', 'block_35'],
    };
    equal(C, expected); equal(createGameConfig(), expected);
    near(2 * C.verticalVelocity / C.gravity, 0.6); near(C.verticalVelocity ** 2 / (2 * C.gravity), 3.6);
    assert(Object.isFrozen(C) && Object.isFrozen(C.modelKeys), 'deep-frozen default');
    const keys = [...C.modelKeys]; const config = createGameConfig({ modelKeys: keys }); keys.reverse();
    equal(config.modelKeys, expected.modelKeys); assert(Object.isFrozen(config.modelKeys), 'defensive model copy');
    // This mutation must fail against the independent design expectation.
    assert(JSON.stringify(createGameConfig({ gravity: 81 })) !== JSON.stringify(expected), 'wrong valid parameter detected');
});
test('C02-illegal-config', 'invalid numbers, ordering, bounds, whitelist rejected before run', () => {
    const mutants: Partial<GameConfig>[] = [
        { configVersion: '' }, { fixedStepSeconds: 0 }, { fixedStepSeconds: NaN }, { gravity: Infinity },
        { gravity: -80 }, { maxTicksPerFrame: 6 }, { maxTicksPerFrame: 1.5 }, { minChargeSeconds: 0 },
        { maxChargeSeconds: 0.08 }, { minJumpDistance: 23 }, { minPlatformScale: 1.1 },
        { minEdgeGap: -1 }, { maxEdgeGap: 1 }, { safeRadius: -1 }, { safeRadius: 5 },
        { centerRadius: 4 }, { geometryEpsilon: 1 }, { platformPoolLimit: 3 }, { platformPoolLimit: 4.5 },
        { initialTargetDistance: 23 }, { normalScore: 1.5 }, { maxRewardStreak: 0 }, { modelKeys: [] },
        { modelKeys: [...C.modelKeys].reverse() }, { cameraMoveSeconds: NaN }, { platformHeight: 0 },
    ];
    for (const mutant of mutants) throws(() => createGameConfig(mutant));
    return { rejectedConfigs: mutants.length };
});
test('S01-menu-and-illegal-transitions', 'no tick in menu; all tested invalid transitions reject without mutations/events', () => {
    const m = new RunStateMachine(); equal(m.state.phase, 'menu'); assert(!m.advanceTick(), 'menu frozen');
    rejected(m, { type: 'charge', runId: 0, source: 'space' });
    assert(m.dispatch({ type: 'start' }).accepted, 'start');
    const token = { runId: m.state.runId, jumpId: 1 };
    rejected(m, { type: 'resume', runId: token.runId });
    rejected(m, { type: 'launch', runId: token.runId, source: 'space', plan: draft() });
    rejected(m, { type: 'land', ...token, outcome: 'target' });
    rejected(m, { type: 'fall', ...token });
    rejected(m, { type: 'finishFall', ...token });
    rejected(m, { type: 'beginRecenter', ...token });
    rejected(m, { type: 'charge', runId: token.runId, source: '' });
});
test('S02-owner-short-cancel', 'one owner; 4 ticks (<.08) cancels; explicit cancel ready without jump/score', () => {
    const m = started(); charge(m); const runId = m.state.runId;
    rejected(m, { type: 'charge', runId, source: 'touch-2' });
    rejected(m, { type: 'cancel', runId, source: 'touch-2' });
    rejected(m, { type: 'launch', runId, source: 'touch-2', plan: draft() });
    for (let n = 0; n < 4; n++) m.advanceTick();
    const result = m.dispatch({ type: 'launch', runId, source: 'space', plan: draft() });
    assert(result.accepted, 'short release processed'); equal(m.state.phase, 'ready'); equal(m.state.jumpId, null);
    equal(result.events.map(e => e.type), ['Charge']); equal(m.state.score, 0);
    charge(m); assert(m.dispatch({ type: 'cancel', runId, source: 'space' }).accepted, 'owner cancels');
    equal(m.state.inputOwner, null); equal(m.state.chargeStartTick, null); equal(m.state.phase, 'ready');
});
test('S03-charging-pause-cancel', 'pause/focus/background cancel charging; resume ready, fresh press required', () => {
    for (const reason of ['pause', 'blur', 'background']) {
        const m = started(); charge(m); m.advanceTick(); const tick = m.state.tick, runId = m.state.runId;
        const r = m.dispatch({ type: 'pause', runId, reason }); assert(r.accepted, 'pause accepted');
        equal(r.events.map(e => e.type), ['Charge', 'Paused']);
        equal(m.state.phase, 'paused'); equal(m.state.resumePhase, 'ready'); equal(m.state.inputOwner, null);
        for (let n = 0; n < 100; n++) assert(!m.advanceTick(), 'paused tick refused');
        equal(m.state.tick, tick); rejected(m, { type: 'pause', runId });
        assert(m.dispatch({ type: 'resume', runId }).accepted, 'resume'); equal(m.state.phase, 'ready');
        rejected(m, { type: 'launch', runId, source: 'space', plan: draft() }); charge(m);
    }
});
test('S04-airborne-pause-resume', 'airborne plan/token/tick preserved; async and transition callbacks blocked while paused', () => {
    const m = started(); const token = launch(m); m.advanceTick();
    const plan = m.state.jumpPlan, tick = m.state.tick;
    assert(m.dispatch({ type: 'pause', runId: token.runId }).accepted, 'pause flight');
    equal(m.state.resumePhase, 'airborne'); assert(!m.advanceTick(), 'pause no tick');
    let calls = 0; assert(!m.guardCallback(token, () => calls++), 'callback blocked'); equal(calls, 0);
    rejected(m, { type: 'land', ...token, outcome: 'target' });
    assert(m.dispatch({ type: 'resume', runId: token.runId }).accepted, 'resume');
    equal(m.state.phase, 'airborne'); equal(m.state.tick, tick); assert(plan === m.state.jumpPlan, 'same immutable plan');
    assert(m.guardCallback(token, () => calls++), 'live callback'); equal(calls, 1);
    assert(m.advanceTick(), 'next tick'); equal(m.state.tick, tick + 1);
});
test('S05-target-cycle-and-score-boundary', 'target path completes; input ignored busy; scoring permit once; no scoring formula', () => {
    const m = started(); const token = launch(m);
    rejected(m, { type: 'charge', runId: token.runId, source: 'space' });
    assert(!m.claimJumpEvent(token, 'Scored'), 'no score while airborne');
    const r = m.dispatch({ type: 'land', ...token, outcome: 'target' }); assert(r.accepted, 'land');
    equal(r.events.map(e => e.type), ['Landed']);
    rejected(m, { type: 'land', ...token, outcome: 'target' });
    rejected(m, { type: 'charge', runId: token.runId, source: 'space' });
    assert(m.claimJumpEvent(token, 'Scored'), 'first score permit'); assert(!m.claimJumpEvent(token, 'Scored'), 'duplicate score denied');
    equal(m.state.score, 0); equal(m.state.streak, 0);
    rejected(m, { type: 'finishLanding', ...token });
    assert(m.dispatch({ type: 'beginRecenter', ...token }).accepted, 'camera start');
    rejected(m, { type: 'charge', runId: token.runId, source: 'space' });
    rejected(m, { type: 'finishRecenter', ...token, currentId: 0, targetId: 2 });
    assert(m.dispatch({ type: 'finishRecenter', ...token, currentId: 1, targetId: 2 }).accepted, 'camera finish');
    equal(m.state.phase, 'ready'); equal(m.state.currentId, 1); equal(m.state.targetId, 2); equal(m.state.jumpId, null);
    assert(!m.isCurrent(token), 'finished jump invalid'); equal(m.state.inputOwner, null);
});
test('S06-current-cycle', 'current landing no score and no recenter; restores ready', () => {
    const m = started(); const token = launch(m);
    assert(m.dispatch({ type: 'land', ...token, outcome: 'current' }).accepted, 'land current');
    assert(!m.claimJumpEvent(token, 'Scored'), 'current cannot score');
    rejected(m, { type: 'beginRecenter', ...token });
    assert(m.dispatch({ type: 'finishLanding', ...token }).accepted, 'finish current');
    equal(m.state.phase, 'ready'); equal(m.state.currentId, 0); equal(m.state.targetId, 1); equal(m.state.score, 0);
});
test('S07-fall-terminal-once', 'fall→gameover emits Failed once; gameover frozen', () => {
    const m = started(), token = launch(m);
    rejected(m, { type: 'finishFall', ...token });
    assert(m.dispatch({ type: 'fall', ...token, reason: 'fixture-miss' }).accepted, 'fall');
    assert(!m.claimJumpEvent(token, 'Scored'), 'fall cannot score');
    const r = m.dispatch({ type: 'finishFall', ...token }); assert(r.accepted, 'finish fall');
    equal(r.events.map(e => e.type), ['Failed']); equal(m.state.phase, 'gameover');
    rejected(m, { type: 'finishFall', ...token }); rejected(m, { type: 'pause', runId: token.runId });
    assert(!m.advanceTick(), 'gameover no tick'); assert(!m.guardCallback(token, () => { throw new Error('must not run'); }), 'terminal callback blocked');
});
test('S08-old-run-restart-home', 'new run and home invalidate old callbacks, score claims and failure transitions', () => {
    const m = started(), old = launch(m); const oldPlan = m.state.jumpPlan;
    assert(m.dispatch({ type: 'start' }).accepted, 'restart'); assert(m.state.runId > old.runId, 'run increments');
    equal(m.state.tick, 0); equal(m.state.jumpId, null); equal(m.state.inputOwner, null); equal(m.state.jumpPlan, null);
    const fresh = launch(m); equal(fresh.jumpId, 1); assert(oldPlan !== m.state.jumpPlan, 'plan replaced');
    assert(!m.guardCallback(old, () => { throw new Error('stale run'); }), 'old callback denied');
    assert(!m.claimJumpEvent(old, 'Scored'), 'old score denied'); rejected(m, { type: 'fall', ...old });
    rejected(m, { type: 'land', ...old, outcome: 'target' });
    assert(m.dispatch({ type: 'home', runId: fresh.runId }).accepted, 'home');
    equal(m.state.phase, 'menu'); assert(m.state.runId > fresh.runId, 'home invalidates generation');
    assert(!m.isCurrent(fresh), 'home token invalid'); rejected(m, { type: 'fall', ...fresh });
});
test('S09-old-jump-same-run', 'jumpId increases in run; previous jump cannot mutate current flight', () => {
    const m = started(), old = launch(m);
    m.dispatch({ type: 'land', ...old, outcome: 'current' }); m.dispatch({ type: 'finishLanding', ...old });
    const fresh = launch(m); equal(fresh.runId, old.runId); equal(fresh.jumpId, old.jumpId + 1);
    rejected(m, { type: 'fall', ...old }); rejected(m, { type: 'land', ...old, outcome: 'target' });
    assert(!m.guardCallback(old, () => { throw new Error('old jump'); }), 'old jump callback denied');
    assert(!m.claimJumpEvent(old, 'Scored'), 'old jump score denied');
});
test('S09b-missing-invalid-jump-token', 'runtime commands missing jumpId or using null/noninteger reject without mutation', () => {
    const m = started(), token = launch(m);
    for (const jumpId of [undefined, null, 0, -1, 1.5, NaN]) {
        rejected(m, { type: 'land', runId: token.runId, jumpId, outcome: 'target' } as any);
        rejected(m, { type: 'fall', runId: token.runId, jumpId } as any);
    }
});
test('S10-boundary-lifecycle', 'each kind once; stale tokens reject; duplicate open/start cannot reset dedup', () => {
    const gate = new JumpEventBoundary(); const a = { runId: 1, jumpId: 1 };
    assert(gate.startRun(1), 'start boundary'); assert(gate.openJump(a), 'open');
    assert(gate.claim(a, 'Scored'), 'score first'); assert(!gate.claim(a, 'Scored'), 'score duplicate');
    assert(gate.claim(a, 'Failed'), 'terminal first'); assert(!gate.claim(a, 'Failed'), 'terminal duplicate');
    assert(!gate.openJump(a), 'cannot reopen same id'); assert(!gate.startRun(1), 'cannot reset same run');
    assert(gate.openJump({ runId: 1, jumpId: 2 }), 'second jump'); assert(!gate.claim(a, 'Scored'), 'old jump denied');
    assert(!gate.closeJump(a), 'old jump cannot close new jump');
    assert(gate.closeJump({ runId: 1, jumpId: 2 }), 'close current jump');
    assert(!gate.claim({ runId: 1, jumpId: 2 }, 'Failed'), 'closed jump denied');
    assert(gate.startRun(2), 'new run'); assert(gate.openJump({ runId: 2, jumpId: 1 }), 'ids reset in new run');
    assert(!gate.claim(a, 'Failed'), 'old run terminal denied'); assert(!gate.startRun(1), 'old run cannot reopen');
});
test('S11-plan-validation-and-freeze', 'bad plans reject; valid plan defensively copied and frozen; invalid seed leaves state intact', () => {
    const m = started(); charge(m); for (let n = 0; n < 5; n++) m.advanceTick();
    for (const plan of [ { ...draft(), distance: 23 }, { ...draft(), flightTime: 1 },
        { ...draft(), targetId: 999 }, { ...draft(), directionXZ: { x: 2, z: 0 } },
        { ...draft(), startFoot: { x: NaN, y: 0, z: 0 } } ]) {
        rejected(m, { type: 'launch', runId: m.state.runId, source: 'space', plan });
    }
    const input = draft(); assert(m.dispatch({ type: 'launch', runId: m.state.runId, source: 'space', plan: input }).accepted, 'valid plan');
    (input.startFoot as any).x = 500;
    equal(m.state.jumpPlan!.startFoot.x, 0);
    assert(Object.isFrozen(m.state) && Object.isFrozen(m.state.jumpPlan) && Object.isFrozen(m.state.jumpPlan!.startFoot), 'frozen snapshots');
    rejected(m, { type: 'start', seed: -1 });
});
test('S12-pause-all-active-phases', 'ready/landing/recentering/falling pause and recover original state without ticks', () => {
    for (const phase of ['ready', 'landing', 'recentering', 'falling']) {
        const m = started();
        if (phase !== 'ready') {
            const token = launch(m);
            if (phase === 'falling') m.dispatch({ type: 'fall', ...token });
            else {
                m.dispatch({ type: 'land', ...token, outcome: 'target' });
                if (phase === 'recentering') m.dispatch({ type: 'beginRecenter', ...token });
            }
        }
        const tick = m.state.tick;
        assert(m.dispatch({ type: 'pause', runId: m.state.runId }).accepted, `pause ${phase}`);
        equal(m.state.resumePhase, phase); assert(!m.advanceTick(), 'no pause ticks');
        assert(m.dispatch({ type: 'resume', runId: m.state.runId }).accepted, `resume ${phase}`);
        equal(m.state.phase, phase); equal(m.state.tick, tick);
    }
});
test('T01-five-ticks-limit', '5 ticks processed; negative/nonfinite deltas reject; reset clears', () => {
    const clock = new FixedTickClock(); const ticks: number[] = [];
    const r = clock.advanceFrame(5 / 60, t => ticks.push(t)); equal(ticks, [1, 2, 3, 4, 5]);
    equal(r.ticksThisFrame, 5); assert(!r.frozen, 'not frozen at exact limit');
    for (const bad of [-1, NaN, Infinity]) throws(() => clock.advanceFrame(bad, () => {}));
    clock.reset(); equal(clock.tick, 0); equal(clock.snapshot.pendingSeconds, 0);
});
test('T02-backlog-freeze-preserve', '6 ticks freezes at 0; keeps .1s; no new wall time while frozen; explicit recovery 5+1', () => {
    const clock = new FixedTickClock(); const ticks: number[] = [];
    let r = clock.advanceFrame(0.1, t => ticks.push(t)); equal(r.ticksThisFrame, 0); equal(r.tick, 0);
    equal(r.freezeReason, 'backlog'); near(r.pendingSeconds, 0.1); equal(ticks, []);
    r = clock.advanceFrame(100, t => ticks.push(t)); near(r.pendingSeconds, 0.1); equal(r.tick, 0);
    clock.resume(); r = clock.advanceFrame(100, t => ticks.push(t)); equal(r.ticksThisFrame, 5); near(r.pendingSeconds, 1 / 60);
    r = clock.advanceFrame(100, t => ticks.push(t)); equal(r.ticksThisFrame, 1); equal(r.tick, 6);
    near(r.pendingSeconds, 0); assert(!r.recovering, 'recovery complete'); equal(ticks, [1, 2, 3, 4, 5, 6]);
});
test('T03-large-backlog-no-drop', '60 pending ticks retained and drained in 12 explicit recovery frames', () => {
    const clock = new FixedTickClock(); let count = 0;
    assert(clock.advanceFrame(1, () => count++).frozen, 'freeze 1s backlog'); equal(count, 0);
    clock.resume();
    for (let frame = 0; frame < 12; frame++) {
        const r = clock.advanceFrame(50, () => count++); assert(r.ticksThisFrame <= 5, 'per-frame cap');
    }
    equal(count, 60); equal(clock.tick, 60); near(clock.snapshot.pendingSeconds, 0);
});
test('T04-pause-resume-ignore-background', 'pause preserves fraction; resume skips first wall delta; no background catchup', () => {
    const clock = new FixedTickClock(); const noop = () => {};
    clock.advanceFrame(1 / 120, noop); clock.pause();
    equal(clock.advanceFrame(100, noop).ticksThisFrame, 0); near(clock.snapshot.pendingSeconds, 1 / 120);
    clock.resume(); equal(clock.advanceFrame(100, noop).ticksThisFrame, 0); near(clock.snapshot.pendingSeconds, 1 / 120);
    equal(clock.advanceFrame(1 / 120, noop).ticksThisFrame, 1); near(clock.snapshot.pendingSeconds, 0);
});
test('T05-synchronous-pause', 'onTick pause stops batch immediately without deleting remaining ticks', () => {
    const clock = new FixedTickClock(); let count = 0;
    const r = clock.advanceFrame(5 / 60, () => { count++; clock.pause(); });
    equal(r.ticksThisFrame, 1); equal(count, 1); near(r.pendingSeconds, 4 / 60);
    clock.resume(); equal(clock.advanceFrame(100, () => count++).ticksThisFrame, 4); equal(count, 5);
});
test('T06-clock-30-60-120fps', 'each 1s clock sequence produces exactly ticks 1..60 (not full gameplay replay)', () => {
    const sequences: number[][] = [];
    for (const fps of [30, 60, 120]) {
        const clock = new FixedTickClock(), sequence: number[] = [];
        for (let frame = 0; frame < fps; frame++) assert(!clock.advanceFrame(1 / fps, tick => sequence.push(tick)).frozen, 'normal fps no freeze');
        equal(clock.tick, 60); sequences.push(sequence);
    }
    equal(sequences[0], sequences[1]); equal(sequences[1], sequences[2]);
});
test('T07-machine-clock-pause-integration', 'app paired pause/resume freezes flying tick; resume delta skipped; plan unchanged', () => {
    const m = started(), token = launch(m), clock = new FixedTickClock(); const plan = m.state.jumpPlan;
    const tick = m.state.tick;
    m.dispatch({ type: 'pause', runId: token.runId }); clock.pause();
    clock.advanceFrame(20, () => m.advanceTick()); equal(m.state.tick, tick);
    m.dispatch({ type: 'resume', runId: token.runId }); clock.resume();
    clock.advanceFrame(20, () => m.advanceTick()); equal(m.state.tick, tick);
    clock.advanceFrame(1 / 60, () => m.advanceTick()); equal(m.state.tick, tick + 1); assert(m.state.jumpPlan === plan, 'plan retained');
});
test('A01-core-no-cc', 'core TypeScript sources have no cc dependency', () => {
    const files: string[] = fs.readdirSync('assets/scripts/jump/core').filter((name: string) => name.endsWith('.ts'));
    for (const name of files) {
        const source = fs.readFileSync(`assets/scripts/jump/core/${name}`, 'utf8');
        assert(!/(?:from\s*|require\s*\()(['"])cc(?:\/[^'"]*)?\1/.test(source), `cc dependency in ${name}`);
    }
    return { checkedFiles: files.length };
});

const failures = results.filter(r => r.status === 'fail').length;
const sourceFiles: string[] = fs.readdirSync('assets/scripts/jump/core')
    .filter((name: string) => name.endsWith('.ts')).map((name: string) => `assets/scripts/jump/core/${name}`);
sourceFiles.push('tests/jump/run-tests.ts', baselinePath);
const sourceSha256: Record<string, string> = {};
for (const path of sourceFiles.sort()) sourceSha256[path] = crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const tscPath = '/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc';
const out = process.env.JUMP_TEST_OUT || '<compile-output-directory>';
const project = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert(project.uuid === '4856b445-bfe4-49c2-8933-59e229f06792', 'authorized project identity');
const report = {
    schemaVersion: 1, stage: '01', scope: 'pure TypeScript skeleton only',
    projectPath: process.cwd(), projectUuid: project.uuid, creatorVersion: project.creator.version,
    gameAgentVersion: '0.4.0 (assignment context; not independently runtime-queried)',
    configVersion: C.configVersion, seed: C.seed,
    configSha256: crypto.createHash('sha256').update(JSON.stringify(C)).digest('hex'),
    executedAt: new Date().toISOString(),
    environment: { node: process.version, platform: process.platform, arch: process.arch,
        osRelease: os.release(), typescript: cp.execFileSync(process.execPath, [tscPath, '--version'], { encoding: 'utf8' }).trim(),
        compilerSource: 'existing Creator engine dependency; no network or installation' },
    commands: [
        `node "${tscPath}" --strict --target ES2018 --module commonjs --moduleResolution node --skipLibCheck --rootDir . --outDir "${out}" tests/jump/run-tests.ts`,
        `JUMP_TEST_OUT="${out}" node "${out}/tests/jump/run-tests.js" --evidence`,
    ],
    sourceSha256, summary: { cases: results.length, pass: results.length - failures, fail: failures, assertions },
    cases: results,
    notRun: ['Creator preview/visual verification (parent-owned)', 'stage02 platform generation/reachability/collision/reward formulas', '20-jump full gameplay replay/storage/audio'],
    integration: ['pair clock and state pause/resume; reset clock for new run', 'phase02 must atomically combine score claim, score reducer and Scored publication'],
    firstWriteTransaction: 'UeA-sCihpZg2U-ppcMbso (assets/scripts/jump/core/README.md)',
};
if (process.argv.includes('--evidence')) {
    fs.mkdirSync('docs/验收证据', { recursive: true });
    fs.writeFileSync('docs/验收证据/阶段01规则测试.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report.summary));
process.exitCode = failures === 0 ? 0 : 1;
