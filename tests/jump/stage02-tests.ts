import {
    DEFAULT_GAME_CONFIG as C, JumpGameplay, PlatformGenerator, PlatformSpec, FootPosition,
    chargeDistance, sampleJump, descendingLandingTime, isSafeLanding, isCenterLanding,
    classifyLanding, safeRayInterval, reachableDistanceInterval, directionToTarget,
    createGameConfig, RunStateMachine, JumpPlanDraft, FixedTickClock, ReplayInput,
} from '../../assets/scripts/jump/core';
declare const require: (name: string) => any;
declare const process: any;
const fs = require('fs'), crypto = require('crypto'), cp = require('child_process'), os = require('os');
const baselinePath = 'docs/数据/验收基准.json';
const B = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const cases: any[] = []; let assertions = 0;
function assert(v: unknown, message: string): asserts v { assertions++; if (!v) throw new Error(message); }
function eq(a: unknown, b: unknown, message = 'equality'): void { assert(JSON.stringify(a) === JSON.stringify(b), `${message}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); }
function near(a: number, b: number, e = 1e-10): void { assert(Math.abs(a - b) <= e, `${a} != ${b}`); }
function throws(f: () => unknown): void { let threw = false; try { f(); } catch (_) { threw = true; } assert(threw, 'expected rejection'); }
function test(caseId: string, expected: string, f: () => unknown): void {
    const before = assertions;
    try { const actual = f(); cases.push({ caseId, expected, actual: actual === undefined ? 'all assertions passed' : actual, status: 'pass', assertions: assertions - before }); console.log(`PASS ${caseId}`); }
    catch (e) { const actual = e instanceof Error ? e.message : String(e); cases.push({ caseId, expected, actual, status: 'fail', assertions: assertions - before }); console.error(`FAIL ${caseId}: ${actual}`); }
}
function game(): JumpGameplay { const g = new JumpGameplay(); assert(g.start(), 'start'); return g; }
function ticks(g: JumpGameplay, n: number): void { for (let i = 0; i < n; i++) assert(g.step(), 'active tick'); }
function idle(g: JumpGameplay): void { let n = 0; while (g.state.phase !== 'ready' && g.state.phase !== 'gameover' && n++ < 100) g.step(); assert(n < 100, 'settled'); }
function holdForDistance(distance: number): number {
    let best = 5, error = Infinity;
    for (let n = 5; n <= 72; n++) { const e = Math.abs(chargeDistance(n * C.fixedStepSeconds) - distance); if (e < error) { best = n; error = e; } }
    return best;
}
function jump(g: JumpGameplay, holdTicks: number): void { assert(g.press('space'), 'press'); ticks(g, holdTicks); assert(g.release('space'), 'release'); eq(g.state.phase, 'airborne'); idle(g); }
function centerJump(g: JumpGameplay): void { jump(g, holdForDistance(Math.hypot(g.target!.centerXZ.x - g.foot.x, g.target!.centerXZ.z - g.foot.z))); eq(g.results[g.results.length - 1].classification, 'target-center'); }
const rect: PlatformSpec = Object.freeze({ id: 0, modelKey: 'block_00', horizontalScale: 1, centerXZ: { x: 0, z: 0 }, topY: 5.5, shape: 'rect', halfExtent: { x: 5, z: 5 } });
const circle: PlatformSpec = { ...rect, modelKey: 'block_03', shape: 'circle', radius: 5 };
const plan: JumpPlanDraft = { startFoot: { x: 0, y: 5.5, z: 0 }, directionXZ: { x: 1, z: 0 }, distance: 14, flightTime: 0.6, targetId: 1 };

test('R01-charge-and-cap', 'baseline distances; >=5tick launch; 120tick hold never auto-releases, distance22', () => {
    B.chargeCases.forEach((c: any) => near(chargeDistance(c.holdSeconds), c.distance));
    const g = game(); assert(g.press('space'), 'press'); ticks(g, 120); eq(g.state.phase, 'charging'); near(g.holdSeconds, 1.2);
    assert(g.release('space'), 'release'); near(g.state.jumpPlan!.distance, 22); assert(!g.release('space'), 'duplicate release');
    eq(g.drainEvents().filter(e => e.type === 'Jump').length, 1);
    assert(chargeDistance(0.64, createGameConfig({ maxJumpDistance: 21 })) !== 13, 'distance mutant detected by independent baseline');
    throws(() => chargeDistance(NaN));
});
test('R02-single-owner-short-and-cancel', '4ticks cancel; repeated, nonowner, multi-source releases never launch', () => {
    const g = game(); assert(g.press('touch:1'), 'first'); assert(!g.press('touch:1'), 'repeat'); assert(!g.press('touch:2'), 'second');
    assert(!g.press('space'), 'mixed'); assert(!g.release('touch:2'), 'nonowner release'); assert(!g.cancel('space'), 'nonowner cancel');
    ticks(g, 4); assert(g.release('touch:1'), 'short processed'); eq(g.state.phase, 'ready'); eq(g.state.score, 0); eq(g.results.length, 0);
    assert(!g.release('touch:1'), 'stray'); assert(g.press('mouse'), 'fresh'); assert(g.cancel(undefined, 'blur'), 'global cancel'); eq(g.state.inputOwner, null);
    assert(!g.press(''), 'invalid source');
});
test('R03-busy-input-and-phase-ticks', '36 flight + 1 landing + 15recenter; busy presses ignored and not cached', () => {
    const g = game(); g.press('space'); ticks(g, holdForDistance(14)); g.release('space');
    for (let n = 0; n < 35; n++) { assert(!g.press('space') && !g.release('space'), 'flight ignored'); g.step(); }
    eq(g.state.phase, 'airborne'); g.step(); eq(g.state.phase, 'landing');
    assert(!g.press('touch'), 'landing ignored'); g.step(); eq(g.state.phase, 'recentering');
    for (let n = 0; n < 14; n++) { assert(!g.press('mouse'), 'camera ignored'); g.step(); }
    eq(g.state.phase, 'recentering'); g.step(); eq(g.state.phase, 'ready'); eq(g.state.inputOwner, null); eq(g.state.currentId, 1); eq(g.state.targetId, 2);
    const score = g.state.score; ticks(g, 10); eq(g.state.phase, 'ready'); eq(g.state.score, score);
    eq(g.drainEvents().filter(e => e.type === 'Scored').length, 1);
});
test('R04-pause-cancel-and-flight-freeze', 'blur/background/pause cancel charging; paused flight does not move/tick', () => {
    for (const reason of ['pause', 'blur', 'background']) {
        const g = game(); g.press('space'); ticks(g, 20); assert(g.pause(reason), 'pause'); const t = g.state.tick;
        for (let i = 0; i < 50; i++) assert(!g.step(), 'paused'); eq(g.state.tick, t); eq(g.state.inputOwner, null);
        assert(g.resume(), 'resume'); eq(g.state.phase, 'ready'); assert(!g.release('space'), 'must fresh press');
    }
    const g = game(); g.press('space'); ticks(g, 42); g.release('space'); ticks(g, 9); const p = g.state.jumpPlan, foot = g.foot, t = g.state.tick;
    g.pause('background'); for (let i = 0; i < 100; i++) assert(!g.step(), 'freeze'); eq(g.foot, foot); eq(g.state.tick, t); assert(g.state.jumpPlan === p, 'plan same');
    g.resume(); g.step(); assert(g.foot !== foot, 'continues');
});
test('R05-analytic-baseline-and-lock', 'independent ballistic samples 0/.3/.6, exact descending crossing; offset direction frozen', () => {
    const full = { ...plan, runId: 1, jumpId: 1, startTick: 0 };
    B.ballisticCases.forEach((c: any) => { const p = sampleJump(full, c.t); near(p.y - 5.5, c.deltaY); near(p.x / 14, c.progress); });
    near(descendingLandingTime(5.5, 5.5), 0.6); near(sampleJump(full, 0.3).y, 9.1);
    assert(Math.abs(sampleJump(full, 0.3, createGameConfig({ gravity: 81 })).y - 9.1) > 1e-5, 'gravity mutant fails apex expectation');
    const g = game(); centerJump(g); jump(g, 5); eq(g.results[1].classification, 'current');
    const foot = g.foot; g.press('space'); ticks(g, 42); g.release('space'); const locked = g.state.jumpPlan!;
    eq(locked.startFoot, foot); const dir = directionToTarget(foot, g.target!); eq(locked.directionXZ, dir); assert(Object.isFrozen(locked) && Object.isFrozen(locked.startFoot), 'immutable');
    const vector = { x: g.target!.centerXZ.x - foot.x, z: g.target!.centerXZ.z - foot.z };
    near(vector.x * locked.directionXZ.z - vector.z * locked.directionXZ.x, 0);
    const side = game(); centerJump(side); centerJump(side);
    const distance = Math.hypot(side.target!.centerXZ.x - side.foot.x, side.target!.centerXZ.z - side.foot.z);
    jump(side, holdForDistance(distance + 1.5)); eq(side.state.currentId, 3);
    side.press('space'); ticks(side, 42); side.release('space');
    const diagonal = side.state.jumpPlan!;
    assert(Math.abs(diagonal.directionXZ.x) > .01 && Math.abs(diagonal.directionXZ.z) > .01, 'off-axis actual foot generates diagonal ray when axis turns');
    eq(diagonal.startFoot, side.foot); eq(diagonal.directionXZ, directionToTarget(side.foot, side.target!));
});
test('R06-safe-boundaries-and-tolerance', 'rect/circle equal + inward.001 success, outward.001 fail; epsilon admitted', () => {
    for (const p of [rect, circle]) for (const sign of [-1, 1]) for (const axis of ['x', 'z'] as const) {
        const point = (r: number) => ({ x: axis === 'x' ? sign * r : 0, z: axis === 'z' ? sign * r : 0 });
        assert(isSafeLanding(point(4.7), p), 'equal'); assert(isSafeLanding(point(4.699), p), 'inside'); assert(!isSafeLanding(point(4.701), p), 'outside');
        assert(isSafeLanding(point(4.7 + 1e-8), p), 'epsilon'); assert(!isSafeLanding(point(4.7 + 1e-4), p), 'beyond epsilon');
    }
});
test('R07-corners-and-shadow', 'rect four inset corners success; circle circumscribed corners and visual shadow fail', () => {
    for (const x of [-4.7, 4.7]) for (const z of [-4.7, 4.7]) { assert(isSafeLanding({ x, z }, rect), 'rect corner'); assert(!isSafeLanding({ x, z }, circle), 'circle corner'); }
    assert(!isSafeLanding({ x: 5.2, z: 0 }, rect), 'shadow excluded'); assert(!isSafeLanding({ x: 5.2, z: 0 }, circle), 'circle shadow excluded');
});
test('R08-center-boundaries', 'center .5 equal/inside yes; outside .001 ordinary', () => {
    const target: PlatformSpec = { ...rect, id: 1, centerXZ: { x: 14, z: 0 } };
    for (const sign of [-1, 1]) {
        assert(isCenterLanding({ x: 14 + sign * .5, z: 0 }, target), 'equal'); assert(isCenterLanding({ x: 14 + sign * .499, z: 0 }, target), 'inside');
        eq(classifyLanding({ x: 14 + sign * .501, z: 0 }, rect, target), 'target-normal');
    }
});
test('R09-nine-center-normal-reset', 'actual Gameplay yields independent rewards2..16/16 then ordinary1 and center2', () => {
    const g = game(), rewards: number[] = []; let score = 0;
    for (let i = 0; i < 9; i++) { centerJump(g); rewards.push(g.state.score - score); score = g.state.score; }
    eq(rewards, B.centerRewards); eq(g.state.streak, 9);
    const d = Math.hypot(g.target!.centerXZ.x - g.foot.x, g.target!.centerXZ.z - g.foot.z);
    jump(g, holdForDistance(d + 1.5)); eq(g.results[9].classification, 'target-normal'); eq(g.state.score, score + 1); eq(g.state.streak, 0);
    centerJump(g); eq(g.state.score, score + 3); eq(g.state.streak, 1);
    return { rewards, finalScore: g.state.score };
});
test('R10-current-foot-streak-and-miss-terminal', 'current keeps foot/streak/score; old platform cannot land; miss36ticks then Failed once', () => {
    const g = game(); centerJump(g); const score = g.state.score, streak = g.state.streak, foot = g.foot; jump(g, 5);
    eq(g.results[1].classification, 'current'); eq(g.state.score, score); eq(g.state.streak, streak); assert(g.foot.x !== foot.x, 'actual current landing foot retained');
    eq(g.foot, g.results[1].foot); assert(Math.hypot(g.foot.x - g.current!.centerXZ.x, g.foot.z - g.current!.centerXZ.z) > 1, 'not recentered');
    centerJump(g); eq(classifyLanding({ x: 0, z: 0 }, g.current!, g.target!), 'miss');
    const m = game(); jump(m, holdForDistance(7.5)); eq(m.results[0].classification, 'miss'); eq(m.state.phase, 'gameover');
    const fail = m.drainEvents().filter(e => e.type === 'Failed'); eq(fail.length, 1); eq(fail[0].tick - m.results[0].tick, 36);
    assert(m.foot.y < m.results[0].foot.y, 'falling continues below topY');
    for (let i = 0; i < 100; i++) assert(!m.step(), 'terminal frozen'); eq(m.drainEvents(), []);
});
test('R11-baseline-first10', 'actual generator first0/1+10 match independent precomputed parameters', () => {
    const gen = new PlatformGenerator(C.seed); const initial = gen.initial();
    initial.forEach((p, i) => { const e = B.initialPlatforms[i]; eq(p.id, e.id); eq(p.modelKey, e.modelKey); near(p.horizontalScale, e.scale); eq([p.centerXZ.x, p.centerXZ.z], e.centerXZ); });
    let previous = initial[1];
    for (const expected of B.generatedPlatforms) { const generated = gen.next(previous), p = generated.platform;
        eq(p.id, expected.id); eq(p.modelKey, expected.modelKey); eq(p.shape, expected.shape); eq(generated.axis, expected.axis);
        near(p.horizontalScale, expected.scale); near(generated.gap, expected.gap); near(generated.centerDistance, expected.centerDistance);
        near(p.centerXZ.x, expected.centerXZ[0]); near(p.centerXZ.z, expected.centerXZ[1]); previous = p;
    }
    const g = game(); eq(g.platforms.length, 3); near(g.platforms[2].centerXZ.x, B.generatedPlatforms[0].centerXZ[0]);
});
test('R11-1000-offset-foot-ray-reachable', 'same-seed1000 identical, corners/circle perimeter actual feet all ray-safe reachable', () => {
    const a = new PlatformGenerator(C.seed), b = new PlatformGenerator(C.seed); let pa = a.initial()[1], pb = b.initial()[1];
    let checked = 0; const sequence: PlatformSpec[] = [];
    for (let i = 0; i < 1000; i++) {
        const ga = a.next(pa), gb = b.next(pb); eq(ga, gb); const target = ga.platform; sequence.push(target);
        assert(ga.gap >= 2 && ga.gap <= 8, 'gap'); assert(target.horizontalScale >= .8 && target.horizontalScale <= 1, 'scale');
        const points: FootPosition[] = [{ ...pa.centerXZ, y: pa.topY }];
        if (pa.shape === 'rect') for (const x of [-1, 1]) for (const z of [-1, 1]) points.push({ x: pa.centerXZ.x + x * (pa.halfExtent.x - C.safeRadius), z: pa.centerXZ.z + z * (pa.halfExtent.z - C.safeRadius), y: pa.topY });
        else for (let angle = 0; angle < 16; angle++) points.push({ x: pa.centerXZ.x + Math.cos(angle * Math.PI / 8) * (pa.radius - C.safeRadius), z: pa.centerXZ.z + Math.sin(angle * Math.PI / 8) * (pa.radius - C.safeRadius), y: pa.topY });
        for (const foot of points) {
            assert(isSafeLanding(foot, pa), 'actual valid offset foot'); const interval = reachableDistanceInterval(foot, target); assert(interval, 'reachable from offset foot');
            const dir = directionToTarget(foot, target); const distance = (interval.min + interval.max) / 2;
            assert(distance >= 4 && distance <= 22, 'allowed distance');
            assert(isSafeLanding({ x: foot.x + dir.x * distance, z: foot.z + dir.z * distance }, target), 'ray witness lands safely'); checked++;
        }
        pa = target; pb = gb.platform;
    }
    const offRay = safeRayInterval({ x: 0, z: 10 }, { x: 1, z: 0 }, rect); eq(offRay, null);
    const far: PlatformSpec = { ...rect, id: 2, centerXZ: { x: 100, z: 0 } }; eq(reachableDistanceInterval({ x: 0, z: 0 }, far), null);
    throws(() => new JumpGameplay(createGameConfig({ maxJumpDistance: 4 })).start());
    return { platforms: 1000, offsetRays: checked, sequenceSha256: hash(sequence) };
});
test('R12-atomic-score-old-run-jump-home', 'score is atomic/once; old callbacks/score/failure cannot affect new run', () => {
    const m = new RunStateMachine(); m.dispatch({ type: 'start' }); const runId = m.state.runId;
    const launch = () => { m.dispatch({ type: 'charge', runId: m.state.runId, source: 'space' }); for (let n = 0; n < 5; n++) m.advanceTick(); m.dispatch({ type: 'launch', runId: m.state.runId, source: 'space', plan }); return { runId: m.state.runId, jumpId: m.state.jumpId! }; };
    const old = launch(); m.dispatch({ type: 'land', ...old, outcome: 'target' });
    const unscored = m.state;
    assert(!m.dispatch({ type: 'score', ...old, center: 'yes' } as any).accepted, 'invalid center does not reserve score');
    assert(!m.dispatch({ type: 'score', runId: old.runId, jumpId: undefined, center: true } as any).accepted, 'missing jump token');
    assert(m.state === unscored, 'invalid score leaves snapshot identical');
    const scored = m.dispatch({ type: 'score', ...old, center: true }); assert(scored.accepted, 'atomic score'); eq(scored.events.map(e => e.type), ['Scored']); eq(m.state.score, 2); eq(m.state.streak, 1);
    const snapshot = m.state; const duplicate = m.dispatch({ type: 'score', ...old, center: false }); assert(!duplicate.accepted, 'dedup'); eq(duplicate.events, []); assert(snapshot === m.state, 'no side effects');
    m.dispatch({ type: 'start' }); const fresh = launch(); eq(fresh.jumpId, 1); assert(fresh.runId > runId, 'new generation');
    for (const command of [{ type: 'score', ...old, center: true }, { type: 'land', ...old, outcome: 'target' }, { type: 'finishFall', ...old }]) assert(!m.dispatch(command as any).accepted, 'old rejected');
    assert(!m.guardCallback(old, () => { throw new Error('must not run'); }), 'guard old');
    m.dispatch({ type: 'land', ...fresh, outcome: 'current' }); m.dispatch({ type: 'finishLanding', ...fresh }); const newer = launch();
    assert(!m.dispatch({ type: 'score', ...fresh, center: true }).accepted, 'old same-run jump'); assert(!m.guardCallback(fresh, () => { throw new Error('must not run'); }), 'old jump guard');
    m.dispatch({ type: 'home', runId: newer.runId }); assert(!m.guardCallback(newer, () => { throw new Error('must not run'); }), 'home invalidates');
    const g = game(); const snapshotBeforeInvalid = g.state; assert(!g.start(-1), 'invalid seed rejected'); assert(g.state === snapshotBeforeInvalid, 'invalid seed preserves run');
    g.press('space'); ticks(g, 10); g.start(); eq(g.state.inputOwner, null); eq(g.results, []); eq(g.drainEvents().map(e => e.type), ['Started']); assert(!g.release('space'), 'old input');
});
test('R15-paired-clock-background-backlog', 'background first delta skipped; lag freezes without advancing charge, recovers at<=5ticks', () => {
    const g = game(), clock = new FixedTickClock(); g.press('space'); clock.advanceFrame(1 / 60, () => g.step());
    assert(clock.advanceFrame(1, () => g.step()).frozen, 'backlog'); eq(g.state.tick, 1); g.pause('backlog'); const t = g.state.tick;
    clock.advanceFrame(100, () => g.step()); eq(g.state.tick, t); g.resume(); clock.resume();
    for (let i = 0; i < 12; i++) assert(clock.advanceFrame(100, () => g.step()).ticksThisFrame <= 5, 'bounded drain');
    eq(g.state.tick, 61); eq(g.state.phase, 'ready'); eq(g.state.score, 0);
    g.press('space'); clock.pause(); g.pause('background'); clock.advanceFrame(100, () => g.step()); g.resume(); clock.resume();
    eq(clock.advanceFrame(100, () => g.step()).ticksThisFrame, 0); eq(g.state.tick, 61); assert(!g.release('space'), 'canceled background charge');
});

function hash(value: unknown): string { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function collectPlatforms(g: JumpGameplay, map: Map<number, PlatformSpec>): void { for (const p of g.platforms) map.set(p.id, p); assert(g.platforms.length <= 8, 'pool bounded'); }
function apply(g: JumpGameplay, event: ReplayInput): void {
    if (event.type === 'press') assert(g.press(event.source), 'replay press');
    else if (event.type === 'release') assert(g.release(event.source), 'replay release');
    else if (event.type === 'cancel') g.cancel(event.source);
    else if (event.type === 'pause') g.pause(event.source);
    else g.resume();
}
let replay: any = null;
test('R14-24jump-30-60-120-replay', 'same integer tick inputs produce all four classes, identical platforms/id/score and feet<=1e-5', () => {
    const planner = game(), inputs: ReplayInput[] = [], platformMap = new Map<number, PlatformSpec>(); collectPlatforms(planner, platformMap);
    const expectedClasses: string[] = [];
    // Planning uses public distance mapping, never the expected classification algorithm.
    for (let j = 0; j < 24; j++) {
        let desiredClass: string, desiredDistance: number;
        const d = Math.hypot(planner.target!.centerXZ.x - planner.foot.x, planner.target!.centerXZ.z - planner.foot.z);
        if (j === 0) { desiredClass = 'current'; desiredDistance = 4; }
        else if (j === 23) { desiredClass = 'miss'; desiredDistance = d - 6; }
        else if (j === 5 || j === 14) { desiredClass = 'target-normal'; desiredDistance = d + 1.5; }
        else { desiredClass = 'target-center'; desiredDistance = d; }
        expectedClasses.push(desiredClass);
        const press: ReplayInput = { tick: planner.state.tick, type: 'press', source: 'space' }; inputs.push(press); apply(planner, press);
        ticks(planner, holdForDistance(desiredDistance));
        const release: ReplayInput = { tick: planner.state.tick, type: 'release', source: 'space' }; inputs.push(release); apply(planner, release);
        while (planner.state.phase !== 'ready' && planner.state.phase !== 'gameover') { planner.step(); collectPlatforms(planner, platformMap); }
        eq(planner.results[j].classification, desiredClass, `planned jump ${j + 1}`);
    }
    eq(planner.state.phase, 'gameover');
    const endTick = Math.ceil(planner.state.tick / 2) * 2;
    const executions: any[] = [];
    for (const fps of [30, 60, 120]) {
        const g = game(), clock = new FixedTickClock(), map = new Map<number, PlatformSpec>(); collectPlatforms(g, map); let inputIndex = 0;
        let simulationTick = 0;
        while (clock.tick < endTick) {
            const frame = clock.advanceFrame(1 / fps, tick => {
                simulationTick = tick - 1;
                while (inputIndex < inputs.length && inputs[inputIndex].tick === simulationTick) apply(g, inputs[inputIndex++]);
                g.step(); collectPlatforms(g, map);
            }); assert(!frame.frozen, 'normal fps');
        }
        eq(inputIndex, inputs.length); eq(g.results.length, 24); eq(g.results.map(r => r.classification), expectedClasses);
        const platforms = Array.from(map.values()).sort((a, b) => a.id - b.id);
        eq(platforms, Array.from(platformMap.values()).sort((a, b) => a.id - b.id), 'platform sequence');
        eq(g.state.score, planner.state.score); eq(g.state.streak, planner.state.streak);
        g.results.forEach((r, i) => { const expected = planner.results[i]; eq([r.tick, r.jumpId, r.classification, r.score, r.streak], [expected.tick, expected.jumpId, expected.classification, expected.score, expected.streak]);
            near(r.foot.x, expected.foot.x, 1e-5); near(r.foot.y, expected.foot.y, 1e-5); near(r.foot.z, expected.foot.z, 1e-5); });
        executions.push({ fps, endClockTick: clock.tick, finalState: g.state, platforms, results: g.results, events: g.drainEvents() });
    }
    const compare = (a: any, b: any) => { eq(a.platforms, b.platforms); eq(a.results, b.results); eq(a.finalState, b.finalState); };
    compare(executions[0], executions[1]); compare(executions[1], executions[2]);
    eq(executions[0].events, executions[1].events, 'target ids and locked plans match via all events');
    eq(executions[1].events, executions[2].events, 'event dedup identical');
    let maximumFootDifference = 0;
    for (const execution of executions) execution.results.forEach((r: any, i: number) => {
        const expected = planner.results[i].foot;
        maximumFootDifference = Math.max(maximumFootDifference, Math.abs(r.foot.x - expected.x), Math.abs(r.foot.y - expected.y), Math.abs(r.foot.z - expected.z));
    });
    replay = { schemaVersion: 1, scope: 'pure FixedTickClock + JumpGameplay; no Creator/render verification', configVersion: C.configVersion, seed: C.seed,
        inputTickConvention: 'inputs at simulation tick N are applied before tick N+1; terminal padding has no gameplay effect',
        inputs, expectedClasses, results: planner.results, endTick, executions, maximumFootDifference, tolerance: 1e-5 };
    return { jumps: 24, inputs: inputs.length, classes: Array.from(new Set(expectedClasses)), fps: [30, 60, 120], finalScore: planner.state.score, maxFootDifference: maximumFootDifference, platformSha256: hash(executions[0].platforms) };
});

const out = process.env.JUMP_TEST_OUT || '<current scratch>/core-test';
let legacySummary: any = null;
test('REG-stage01-preserved-contracts', 'existing phase01 suite27pass without overwriting its evidence', () => {
    const output: string = cp.execFileSync(process.execPath, [`${out}/tests/jump/run-tests.js`], { encoding: 'utf8' });
    legacySummary = JSON.parse(output.trim().split('\n').pop()!);
    eq(legacySummary.cases, 27); eq(legacySummary.pass, 27); eq(legacySummary.fail, 0);
    return legacySummary;
});
const failures = cases.filter(c => c.status === 'fail').length;
const sourceFiles: string[] = fs.readdirSync('assets/scripts/jump/core').filter((n: string) => n.endsWith('.ts')).map((n: string) => `assets/scripts/jump/core/${n}`);
sourceFiles.push('tests/jump/stage02-tests.ts', 'tests/jump/run-tests.ts', baselinePath);
const sourceSha256: Record<string, string> = {}; for (const p of sourceFiles.sort()) sourceSha256[p] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const project = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert(project.uuid === '4856b445-bfe4-49c2-8933-59e229f06792', 'authorized project identity');
const tsc = '/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc';
const report = { schemaVersion: 1, stage: '02', scope: 'pure TypeScript rules and deterministic replay only', projectPath: process.cwd(), projectUuid: project.uuid,
    creatorVersion: project.creator.version, configVersion: C.configVersion, seed: C.seed, configSha256: hash(C), executedAt: new Date().toISOString(),
    environment: { node: process.version, platform: process.platform, arch: process.arch, osRelease: os.release(), typescript: cp.execFileSync(process.execPath, [tsc, '--version'], { encoding: 'utf8' }).trim() },
    commands: [`node "${tsc}" --strict --target ES2015 --module commonjs --moduleResolution node --skipLibCheck --noEmit assets/scripts/jump/core/index.ts`, `node "${tsc}" --strict --target ES2018 --module commonjs --moduleResolution node --skipLibCheck --rootDir . --outDir "${out}" tests/jump/run-tests.ts tests/jump/stage02-tests.ts`,
        `JUMP_TEST_OUT="${out}" node "${out}/tests/jump/run-tests.js"`, `JUMP_TEST_OUT="${out}" node "${out}/tests/jump/stage02-tests.js" --evidence`],
    sourceSha256, firstWriteTransaction: 'tmtQyObYkT5OwR762Fv5D (assets/scripts/jump/core/README.md)', summary: { cases: cases.length, pass: cases.length - failures, fail: failures, assertions }, cases,
    notRun: ['Creator preview/visual/20 manual jumps (parent-owned)', 'real touch/mouse/keyboard adapters/UI blocking', 'view/audio/material pool cleanup'],
    legacyRegression: { summary: legacySummary, execution: 'existing run-tests.ts executed separately and also by this entry via child_process without --evidence; stage01 report remains unchanged' },
    integration: ['pair Gameplay+FixedTickClock pause/resume and reset clock for start', 'use actual foot and immutable jumpPlan; consume events once', 'R13 storage belongs to stage03 and is not claimed'] };
if (process.argv.indexOf('--evidence') >= 0) {
    fs.mkdirSync('docs/验收证据', { recursive: true }); fs.writeFileSync('docs/验收证据/阶段02规则测试.json', JSON.stringify(report, null, 2) + '\n');
    if (replay) fs.writeFileSync('docs/验收证据/阶段02回放.json', JSON.stringify(replay, null, 2) + '\n');
}
console.log(JSON.stringify(report.summary)); process.exitCode = failures === 0 ? 0 : 1;
