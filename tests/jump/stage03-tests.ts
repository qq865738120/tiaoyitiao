import { StorageAdapter, StoragePort, BEST_SCORE_KEY } from '../../assets/scripts/jump/adapters/StorageAdapter';
import { JumpGameplay, RunStateMachine, JumpPlanDraft, RunCommand, JumpToken, DEFAULT_GAME_CONFIG as C } from '../../assets/scripts/jump/core';
declare const require: (name: string) => any;
declare const process: any;
const fs = require('fs'), crypto = require('crypto'), os = require('os');
const cases: any[] = [];
let assertions = 0;
function assert(value: unknown, message: string): asserts value {
    assertions++; if (!value) throw new Error(message);
}
function eq(actual: unknown, expected: unknown, message = 'equality'): void {
    assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
function test(caseId: string, expected: string, run: () => unknown): void {
    const before = assertions;
    try {
        const actual = run(); cases.push({ caseId, expected, actual: actual === undefined ? 'all assertions passed' : actual,
            status: 'pass', assertions: assertions - before }); console.log(`PASS ${caseId}`);
    } catch (e) {
        const actual = e instanceof Error ? e.message : String(e);
        cases.push({ caseId, expected, actual, status: 'fail', assertions: assertions - before }); console.error(`FAIL ${caseId}: ${actual}`);
    }
}
/** A fault-injected storage port, not a replacement for the production adapter. */
class MemoryStorage implements StoragePort {
    readonly values = new Map<string, string>();
    readonly calls: { operation: string; key: string; value?: string }[] = [];
    failGet = false; failSet = false; failRemove = false;
    constructor(raw: string | null = null) { if (raw !== null) this.values.set(BEST_SCORE_KEY, raw); }
    getItem(key: string): string | null {
        this.calls.push({ operation: 'get', key }); if (this.failGet) throw new Error('injected get');
        return this.values.has(key) ? this.values.get(key)! : null;
    }
    setItem(key: string, value: string): void {
        this.calls.push({ operation: 'set', key, value }); if (this.failSet) throw new Error('injected set');
        this.values.set(key, value);
    }
    removeItem(key: string): void {
        this.calls.push({ operation: 'remove', key }); if (this.failRemove) throw new Error('injected remove');
        this.values.delete(key);
    }
}

test('R13-namespace-missing', 'fixed package namespace, missing=0, read-only construction, no network', () => {
    const port = new MemoryStorage(), adapter = new StorageAdapter(port);
    const identity = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    eq(adapter.key, `jump:${identity.uuid}:best:v1`); eq(adapter.best, 0); eq(adapter.lastError, null);
    eq(port.calls, [{ operation: 'get', key: adapter.key }]);
});
test('R13-valid-integer', 'JSON numeric integers including0 load without writes', () => {
    for (const raw of ['0', '27', ' 42 ', '1.0', '1e2']) {
        const port = new MemoryStorage(raw), adapter = new StorageAdapter(port);
        eq(adapter.best, JSON.parse(raw)); eq(adapter.lastError, null); eq(port.calls.length, 1);
    }
});
for (const [name, samples] of [
    ['json-or-garbage', ['{}', '[]', '[42]', '"42"', 'null', 'true', '{"best":42}', '', ' ', 'garbage', '12oops', '01']],
    ['negative-or-fraction', ['-1', '-99', '0.5', '4.25']],
    ['nonfinite', ['NaN', 'Infinity', '-Infinity', '1e309']],
] as [string, string[]][]) {
    test(`R13-${name}`, 'invalid stored payload falls back0 without mutation or throw', () => {
        for (const raw of samples) {
            const port = new MemoryStorage(raw), adapter = new StorageAdapter(port);
            eq(adapter.best, 0, raw); eq(adapter.lastError, 'invalid-stored-score');
            eq(port.values.get(adapter.key), raw); eq(port.calls.length, 1);
        }
        return { payloads: samples.length };
    });
}
test('R13-get-exception', 'get failure falls back0; subsequent valid record recovers', () => {
    const port = new MemoryStorage('8'); port.failGet = true;
    const adapter = new StorageAdapter(port); eq(adapter.best, 0); eq(adapter.lastError, 'storage-read-failed');
    assert(adapter.record(9), 'record independent of get'); eq(adapter.best, 9); eq(adapter.lastError, null);
    eq(port.values.get(adapter.key), '9');
});
test('R13-max-never-lowers', 'lower/equal scores do not lower value or write; new instance reads persisted max', () => {
    const port = new MemoryStorage('20'), adapter = new StorageAdapter(port);
    assert(adapter.record(3), 'lower accepted'); assert(adapter.record(20), 'equal accepted'); eq(port.calls.length, 1);
    assert(adapter.record(31), 'higher persisted'); assert(adapter.record(0), 'zero accepted'); eq(adapter.best, 31);
    eq(port.values.get(adapter.key), '31'); eq(new StorageAdapter(port).best, 31);
});
test('R13-invalid-record', 'negative/fraction/NaN/Infinity/runtime invalid rejected without storage mutation', () => {
    const port = new MemoryStorage('20'), adapter = new StorageAdapter(port);
    for (const score of [-1, .5, NaN, Infinity, -Infinity, '21', null, undefined, {}, []]) {
        assert(!adapter.record(score as number), 'invalid record'); eq(adapter.best, 20); eq(adapter.lastError, 'invalid-score');
    }
    eq(port.values.get(adapter.key), '20'); eq(port.calls.length, 1);
});
test('R13-set-exception-memory-and-retry', 'set failure keeps memory max; lower record retries pending max; persisted old value visible on reload', () => {
    const port = new MemoryStorage('5'), adapter = new StorageAdapter(port); port.failSet = true;
    assert(!adapter.record(23), 'set fails'); eq(adapter.best, 23); eq(adapter.lastError, 'storage-write-failed');
    assert(!adapter.record(1), 'pending retry fails'); eq(adapter.best, 23); eq(port.values.get(adapter.key), '5');
    eq(new StorageAdapter(port).best, 5, 'failed write is not persistence');
    port.failSet = false; assert(adapter.record(2), 'lower retries'); eq(port.values.get(adapter.key), '23'); eq(adapter.lastError, null);
    eq(new StorageAdapter(port).best, 23);
});
test('R13-reset-success-and-isolation', 'reset removes only project key and zeroes memory; new adapter sees0', () => {
    const port = new MemoryStorage('77'), adapter = new StorageAdapter(port);
    const other = 'jump:other-project:best:v1'; port.values.set(other, '999');
    assert(adapter.reset(), 'reset'); eq(adapter.best, 0); eq(adapter.lastError, null); eq(new StorageAdapter(port).best, 0);
    eq(port.values.get(other), '999'); assert(adapter.record(4), 'record after reset'); eq(adapter.best, 4);
    assert(port.calls.every(call => call.key === adapter.key), 'only project key accessed');
});
test('R13-remove-exception', 'remove failure returnsfalse and preserves best/persisted value; retry succeeds', () => {
    const port = new MemoryStorage('44'), adapter = new StorageAdapter(port); port.failRemove = true;
    assert(!adapter.reset(), 'remove fails'); eq(adapter.best, 44); eq(adapter.lastError, 'storage-remove-failed');
    eq(port.values.get(adapter.key), '44'); port.failRemove = false;
    assert(adapter.reset(), 'retry succeeds'); eq(adapter.best, 0); eq(adapter.lastError, null);
});
test('R13-reset-pending-write', 'failed remove retains pending best; successful reset cancels pending write', () => {
    const port = new MemoryStorage('2'), adapter = new StorageAdapter(port); port.failSet = true; port.failRemove = true;
    assert(!adapter.record(10), 'write fails'); assert(!adapter.reset(), 'remove fails'); eq(adapter.best, 10);
    port.failSet = false; assert(adapter.record(1), 'pending max retries'); eq(port.values.get(adapter.key), '10');
    port.failSet = true; assert(!adapter.record(12), 'write fails again'); port.failRemove = false;
    assert(adapter.reset(), 'reset succeeds'); eq(adapter.best, 0);
    const count = port.calls.length; assert(adapter.record(0), 'no pending after reset'); eq(port.calls.length, count);
});
function ticks(game: JumpGameplay, count: number): void {
    for (let i = 0; i < count; i++) assert(game.step(), 'active step');
}
function launchGame(game: JumpGameplay, holdTicks = 42): void {
    assert(game.press('space'), 'press'); ticks(game, holdTicks); assert(game.release('space'), 'release');
    eq(game.state.phase, 'airborne');
}
test('R13-write-failure-restart-home', 'real scored event with failing storage does not block restart/home/new scored event', () => {
    const port = new MemoryStorage(); port.failSet = true;
    const adapter = new StorageAdapter(port), game = new JumpGameplay(); assert(game.start(), 'start');
    launchGame(game); ticks(game, 36); eq(game.state.score, 2);
    const scoreEvents = game.drainEvents().filter(e => e.type === 'Scored'); eq(scoreEvents.length, 1);
    assert(!adapter.record(game.state.score), 'write rejected'); eq(adapter.best, 2);
    const oldRun = game.state.runId; assert(game.start(), 'restart after write failure'); assert(game.state.runId > oldRun, 'new run');
    eq(game.state.score, 0); assert(game.home(), 'home'); assert(game.start(), 'start again');
    launchGame(game); ticks(game, 36); eq(game.state.score, 2); eq(adapter.best, 2);
    eq(game.drainEvents().filter(e => e.type === 'Scored').length, 1);
});

const draft: JumpPlanDraft = { startFoot: { x: 0, y: 5.5, z: 0 }, directionXZ: { x: 1, z: 0 }, distance: 14, flightTime: .6, targetId: 1 };
function accepted(machine: RunStateMachine, command: RunCommand): void {
    assert(machine.dispatch(command).accepted, `accepted ${command.type}`);
}
function launchMachine(machine: RunStateMachine): JumpToken {
    const runId = machine.state.runId;
    accepted(machine, { type: 'charge', runId, source: 'space' });
    for (let i = 0; i < 5; i++) assert(machine.advanceTick(), 'charge tick');
    accepted(machine, { type: 'launch', runId, source: 'space', plan: { ...draft, targetId: machine.state.targetId! } });
    return { runId, jumpId: machine.state.jumpId! };
}
function rejected(machine: RunStateMachine, command: RunCommand): void {
    const snapshot = machine.state, result = machine.dispatch(command);
    assert(!result.accepted, `rejected ${command.type}`); eq(result.events, []);
    assert(machine.state === snapshot, 'rejection cannot mutate state');
}
function rejectOldCallbacks(machine: RunStateMachine, old: JumpToken): void {
    let calls = 0;
    assert(!machine.guardCallback(old, () => calls++), 'old callback rejected');
    assert(!machine.guardCallback({ runId: old.runId }, () => calls++), 'old run callback rejected'); eq(calls, 0);
    rejected(machine, { type: 'score', ...old, center: true });
    rejected(machine, { type: 'fall', ...old }); rejected(machine, { type: 'finishFall', ...old });
    assert(!machine.claimJumpEvent(old, 'Scored'), 'old event reservation rejected');
}
for (const transition of ['restart', 'home'] as const) {
    test(`R12-old-run-${transition}`, 'real dispatch rejects old callbacks even when new jumpId matches; noScored/Failed or state mutation', () => {
        const machine = new RunStateMachine(); accepted(machine, { type: 'start' }); const old = launchMachine(machine);
        if (transition === 'home') {
            accepted(machine, { type: 'home', runId: old.runId }); rejectOldCallbacks(machine, old);
            eq(machine.state.phase, 'menu');
        }
        accepted(machine, { type: 'start' }); const current = launchMachine(machine);
        eq(current.jumpId, old.jumpId, 'jumpId reused across run'); assert(current.runId > old.runId, 'new generation');
        accepted(machine, { type: 'land', ...current, outcome: 'target' }); rejectOldCallbacks(machine, old);
        const scored = machine.dispatch({ type: 'score', ...current, center: true }); assert(scored.accepted, 'new score works');
        eq(scored.events.filter(e => e.type === 'Scored').length, 1); eq(machine.state.score, 2);
        rejected(machine, { type: 'score', ...current, center: true });
        accepted(machine, { type: 'beginRecenter', ...current });
        accepted(machine, { type: 'finishRecenter', ...current, currentId: 1, targetId: 2 });
        const falling = launchMachine(machine); accepted(machine, { type: 'fall', ...falling });
        rejectOldCallbacks(machine, old); const failure = machine.dispatch({ type: 'finishFall', ...falling });
        assert(failure.accepted, 'new failure works'); eq(failure.events.filter(e => e.type === 'Failed').length, 1);
        rejected(machine, { type: 'finishFall', ...falling });
    });
}
test('R12-old-jump-same-run', 'closed old jump cannot score/fail/callback during next jump of same run; active event publishes once', () => {
    const machine = new RunStateMachine(); accepted(machine, { type: 'start' }); const old = launchMachine(machine);
    accepted(machine, { type: 'land', ...old, outcome: 'current' }); accepted(machine, { type: 'finishLanding', ...old });
    const current = launchMachine(machine); eq(current.runId, old.runId); assert(current.jumpId > old.jumpId, 'new jump');
    let calls = 0; assert(!machine.guardCallback(old, () => calls++), 'old jump callback'); eq(calls, 0);
    accepted(machine, { type: 'land', ...current, outcome: 'target' });
    rejected(machine, { type: 'score', ...old, center: true }); rejected(machine, { type: 'finishFall', ...old });
    const result = machine.dispatch({ type: 'score', ...current, center: false }); assert(result.accepted, 'active score');
    eq(result.events.filter(e => e.type === 'Scored').length, 1); eq(machine.state.score, 1);
    rejected(machine, { type: 'score', ...current, center: false });
    accepted(machine, { type: 'beginRecenter', ...current });
    accepted(machine, { type: 'finishRecenter', ...current, currentId: 1, targetId: 2 });
    const falling = launchMachine(machine); accepted(machine, { type: 'fall', ...falling });
    rejected(machine, { type: 'finishFall', ...old }); rejected(machine, { type: 'fall', ...old });
    const failure = machine.dispatch({ type: 'finishFall', ...falling }); assert(failure.accepted, 'active fail');
    eq(failure.events.filter(e => e.type === 'Failed').length, 1);
});
function clean(game: JumpGameplay, phase: 'ready' | 'menu'): void {
    eq(game.state.phase, phase); eq(game.state.inputOwner, null); eq(game.state.chargeStartTick, null);
    eq(game.state.jumpPlan, null); eq(game.state.jumpId, null); eq(game.state.resumePhase, null);
    eq(game.state.landingOutcome, null); eq(game.state.score, 0); eq(game.state.streak, 0); eq(game.results, []);
}
function prepareAbortedPhase(game: JumpGameplay, mode: number): void {
    if (mode === 0) { assert(game.press('space'), 'charging'); ticks(game, 10); }
    else {
        launchGame(game, mode === 3 ? 18 : 42);
        if (mode === 2 || mode === 3) ticks(game, 36);
        if (mode === 4) assert(game.pause(), 'paused airborne');
    }
    eq(game.state.phase, ['charging', 'airborne', 'landing', 'falling', 'paused'][mode]);
}
test('R12-twenty-restart-home-cycles', '20 cycles abort charging/airborne/landing/falling/paused; empty queue/plans/owner; no old delayed score/fail after120ticks', () => {
    const game = new JumpGameplay(); assert(game.start(), 'initial start');
    const oldRuns: number[] = [];
    for (let cycle = 0; cycle < 20; cycle++) {
        prepareAbortedPhase(game, cycle % 5); oldRuns.push(game.state.runId);
        assert(game.start(), 'restart'); assert(game.state.runId > oldRuns[oldRuns.length - 1], 'restart generation'); clean(game, 'ready');
        const started = game.drainEvents(); eq(started.length, 1); eq(started[0].type, 'Started'); eq(started[0].runId, game.state.runId);
        assert(!game.release('space'), 'old release ignored'); ticks(game, 120); clean(game, 'ready'); eq(game.drainEvents(), []);
        prepareAbortedPhase(game, (cycle + 2) % 5); const homeRun = game.state.runId;
        assert(game.home(), 'home'); assert(game.state.runId > homeRun, 'home generation'); clean(game, 'menu');
        eq(game.platforms, []); eq(game.drainEvents(), []); assert(!game.release('space'), 'menu old release');
        for (let tick = 0; tick < 120; tick++) assert(!game.step(), 'menu frozen'); eq(game.drainEvents(), []);
        assert(game.start(), 'start from home'); clean(game, 'ready'); game.drainEvents(); eq(game.platforms.length, 3);
    }
    launchGame(game); ticks(game, 36); eq(game.state.score, 2);
    const events = game.drainEvents(); eq(events.filter(e => e.type === 'Jump').length, 1);
    eq(events.filter(e => e.type === 'Scored').length, 1); eq(events.filter(e => e.type === 'Failed').length, 0);
    return { cycles: 20, abortPhases: ['charging', 'airborne', 'landing', 'falling', 'paused'], finalScore: game.state.score };
});

const paths = ['package.json', 'assets/scripts/jump/adapters/StorageAdapter.ts', 'tests/jump/stage03-tests.ts',
    'assets/scripts/jump/core/index.ts', 'assets/scripts/jump/core/config.ts', 'assets/scripts/jump/core/types.ts',
    'assets/scripts/jump/core/state-machine.ts', 'assets/scripts/jump/core/gameplay.ts', 'assets/scripts/jump/core/platforms.ts',
    'assets/scripts/jump/core/geometry.ts', 'assets/scripts/jump/core/motion.ts', 'assets/scripts/jump/core/random.ts'];
const sha256 = (path: string) => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const passed = cases.filter(c => c.status === 'pass').length, failed = cases.length - passed;
const identity = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const report = {
    project: { path: process.cwd(), uuid: identity.uuid, creator: identity.creator.version },
    executedAt: new Date().toISOString(), environment: { node: process.version, platform: os.platform(), arch: os.arch() },
    configVersion: C.configVersion, configHash: sha256('assets/scripts/jump/core/config.ts'), seed: C.seed,
    key: BEST_SCORE_KEY, sourceHashes: paths.map(path => ({ path, sha256: sha256(path) })),
    commands: { compile: process.env.JUMP_STAGE03_COMPILE_COMMAND || 'not supplied', execute: process.argv.join(' ') },
    summary: { total: cases.length, passed, failed, assertions }, cases,
    notCovered: ['Creator Preview/UI and real sys.localStorage persistence across Preview restart',
        'InputAdapter physical-down/listener cleanup and view/Tween/scene instances',
        'Audio cleanup or old sound playback (stage03 has no audio implementation)', 'Physical touch devices'],
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.indexOf('--evidence') !== -1) {
    const evidence = 'docs/验收证据/阶段03纯逻辑测试.json';
    // Exclusive creation preserves prior evidence; never truncate a historical run.
    fs.writeFileSync(evidence, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    console.log(`EVIDENCE ${evidence}`);
}
if (failed) process.exitCode = 1;
