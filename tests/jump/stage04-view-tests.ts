import { FeedbackTimeline, BackgroundSequence, FEEDBACK_SECONDS as D } from '../../assets/scripts/jump/view/FeedbackTimeline';
import { DEFAULT_GAME_CONFIG as C, JumpGameplay, PlatformGenerator, PlatformSpec, DomainEvent, chargeDistance } from '../../assets/scripts/jump/core';
declare const require: any; declare const process: any;
const fs = require('fs'), crypto = require('crypto');
const cases: any[] = []; let assertions = 0;
function assert(v: unknown, message = 'assertion'): asserts v { assertions++; if (!v) throw new Error(message); }
function eq(a: unknown, b: unknown): void { assert(JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} != ${JSON.stringify(b)}`); }
function near(a: number, b: number, e = 1e-9): void { assert(Math.abs(a - b) <= e, `${a} != ${b}`); }
function test(id: string, f: () => unknown): void {
    const before = assertions;
    try { const actual = f(); cases.push({ id, status: 'pass', assertions: assertions - before, actual: actual === undefined ? 'all assertions passed' : actual }); console.log(`PASS ${id}`); }
    catch (e) { cases.push({ id, status: 'fail', assertions: assertions - before, actual: String(e) }); console.error(`FAIL ${id}: ${e}`); }
}
const started = (runId = 1): DomainEvent => ({ type: 'Started', runId, tick: 0, seed: C.seed });
const scored = (jumpId = 1, tick = 0, runId = 1, streak = 1): DomainEvent => ({ type: 'Scored', jumpId, tick, runId, streak, delta: 2, score: jumpId * 2 });
const launched = (runId = 1): DomainEvent => ({ type: 'Jump', runId, tick: 0, jumpId: 1, plan: { runId, jumpId: 1, startTick: 0, startFoot: { x: 0, y: 5.5, z: 0 }, directionXZ: { x: 1, z: 0 }, distance: 14, flightTime: .6, targetId: 1 } });

test('V01-seconds-30-60-120', () => {
    const observed: any[] = [];
    for (const fps of [30, 60, 120]) {
        const timeline = new FeedbackTimeline(); timeline.consume(started(), 1); timeline.consume(launched(), 1); timeline.consume(scored(), 1);
        near(timeline.sample(.3).flipRadians, Math.PI); near(timeline.sample(.6).flipRadians, 2 * Math.PI);
        near(timeline.sample(.1).axisX, 0); near(timeline.sample(.1).axisZ, -1);
        let centerEnd = 0, scoreEnd = 0, launchEnd = 0;
        for (let frame = 1; frame <= fps; frame++) {
            const t = frame / fps, f = timeline.sample(t);
            if (!centerEnd && !f.centerActive) centerEnd = t;
            if (!scoreEnd && !f.scoreActive) scoreEnd = t;
            if (!launchEnd && t >= D.launch && Math.abs(f.scaleY - 1) < 1e-9) launchEnd = t;
        }
        assert(centerEnd >= D.center - 1e-9 && centerEnd <= D.center + 1 / fps);
        assert(scoreEnd >= D.score - 1e-9 && scoreEnd <= D.score + 1 / fps);
        assert(launchEnd >= D.launch && launchEnd <= D.launch + 1 / fps);
        timeline.consume({ type: 'Landed', runId: 1, tick: 60, jumpId: 1, outcome: 'target' }, 1);
        near(timeline.sample(1 + D.landing / 2).scaleY, .78); near(timeline.sample(1 + D.landing).scaleY, 1);
        let landingEnd = 0;
        for (let frame = 1; frame <= fps; frame++) {
            const elapsed = frame / fps;
            if (elapsed >= D.landing && Math.abs(timeline.sample(1 + elapsed).scaleY - 1) < 1e-9) { landingEnd = elapsed; break; }
        }
        assert(landingEnd >= D.landing && landingEnd <= D.landing + 1 / fps);
        timeline.consume({ type: 'Charge', action: 'begin', source: 'space', runId: 1, tick: 120 }, 1);
        near(timeline.sample(2, 1).scaleY, 1); near(timeline.sample(2 + D.chargeEase, 1).scaleY, .72);
        timeline.consume({ type: 'Charge', action: 'cancel', source: 'space', runId: 1, tick: 126 }, 1); near(timeline.sample(2.1, 0).scaleY, 1);
        observed.push({ fps, centerEnd, scoreEnd, launchEnd, landingEnd, analyticalDurations: D });
    }
    return observed;
});
test('V02-pause-resume-dedupe-old-run', () => {
    const t = new FeedbackTimeline(); t.consume(started(), 1); t.consume(launched(), 1); t.consume(scored(), 1);
    t.consume({ type: 'Paused', runId: 1, tick: 6, resumePhase: 'airborne', reason: 'test' }, 1);
    const frozen = t.sample(.1); eq(frozen, t.sample(100));
    t.consume({ type: 'Resumed', runId: 1, tick: 6, phase: 'airborne' }, 1); eq(t.sample(.1), frozen);
    assert(t.sample(.2).flipRadians > frozen.flipRadians, 'resumed simulation continues');
    const before = t.sample(.2); assert(!t.consume(scored(), 1)); assert(!t.consume(started(), 1)); eq(t.sample(.2), before);
    t.reset(2); assert(!t.consume(scored(100, 0, 1), 2)); assert(!t.consume(launched(1), 2));
    eq(t.sample(100).scoreScale, 1); assert(!t.sample(100).centerActive);
    for (let run = 2; run <= 21; run++) {
        t.reset(run); t.consume(launched(run), run); t.consume(scored(1, 0, run), run);
        assert(t.sample(.1).centerActive); t.reset(run + 1);
        assert(!t.sample(.1).centerActive); near(t.sample(.1).scoreScale, 1); near(t.sample(.1).flipRadians, 0);
    }
    t.consume({ type: 'Charge', action: 'begin', source: 'space', runId: 22, tick: 0 }, 22);
    t.consume({ type: 'Paused', runId: 22, tick: 1, resumePhase: 'ready', reason: 'blur' }, 22);
    near(t.sample(100, 0).scaleY, 1);
});
test('V03-background-cycle-20-resets', () => {
    const b = new BackgroundSequence(); b.reset(1); const indices = [b.index];
    for (let i = 1; i <= 28; i++) { assert(b.consume(scored(i), 1)); assert(!b.consume(scored(i), 1)); if (i % 4 === 0) indices.push(b.index); }
    eq(indices, [5, 0, 1, 2, 3, 4, 6, 5]);
    for (let run = 2; run <= 21; run++) {
        b.reset(run); eq(b.index, 5); assert(!b.consume(scored(999, 0, run - 1), run));
        for (let i = 1; i <= 4; i++) b.consume(scored(i, 0, run), run); eq(b.index, 0);
        b.consume({ type: 'Returned', runId: run, tick: 0 }, run); eq(b.index, 5);
    }
});

// Scoped cc host mock. It cannot prove rendered appearance or engine resource destruction timing.
class V3 { constructor(public x = 0, public y = 0, public z = 0) {} clone(): V3 { return new V3(this.x, this.y, this.z); } }
class MockNode {
    position = new V3(); scale = new V3(1, 1, 1); rotation: any = { x: 0, y: 0, z: 0, w: 1 };
    parent: any = null; active = true; activeInHierarchy = true; children: any = {}; components = new Map<any, any>(); events: any[] = [];
    setPosition(x: any, y?: number, z?: number): void { this.position = typeof x === 'number' ? new V3(x, y, z) : new V3(x.x, x.y, x.z); }
    setScale(x: any, y?: number, z?: number): void { this.scale = typeof x === 'number' ? new V3(x, y, z) : new V3(x.x, x.y, x.z); }
    setRotation(q: any): void { this.rotation = { x: q.x, y: q.y, z: q.z, w: q.w }; }
    setRotationFromEuler(): void { this.rotation = { x: 0, y: 0, z: 0, w: 1 }; }
    getChildByName(name: string): any { return this.children[name] || null; }
    getComponent(type: any): any { return this.components.get(type) || null; }
    on(type: any, cb: any, owner: any): void { this.events.push({ type, cb, owner }); }
    off(type: any, cb: any, owner: any): void { this.events = this.events.filter(e => e.type !== type || e.cb !== cb || e.owner !== owner); }
}
class MockComponent { node = new MockNode(); }
class MockGraphics extends MockComponent { lineWidth = 0; strokeColor: any; fillColor: any; paths = 0; clear(): void { this.paths = 0; } circle(): void { this.paths++; } stroke(): void {} rect(): void { this.paths++; } fill(): void {} }
class MockTransform {}
class MockButton extends MockComponent { static EventType = { CLICK: 'click' }; interactable = true; }
class MockFrame { static created = 0; static destroyed = 0; texture: any; dead = false; constructor() { MockFrame.created++; } destroy(): void { assert(!this.dead, 'double frame destroy'); this.dead = true; MockFrame.destroyed++; } }
const mock = {
    _decorator: { ccclass: () => (v: any) => v, property: (...args: any[]) => { if (args.length >= 2) return; return () => {}; } },
    Component: MockComponent, Node: MockNode, Label: MockComponent, Button: MockButton, Graphics: MockGraphics, UITransform: MockTransform,
    Vec3: V3, Quat: class { x = 0; y = 0; z = 0; w = 1; set(x: number, y: number, z: number, w: number): void { Object.assign(this, { x, y, z, w }); } },
    Color: class { constructor(public r: number, public g: number, public b: number, public a: number) {} },
    TTFFont: class {}, Camera: class {}, Sprite: class {}, SpriteFrame: MockFrame, Texture2D: class {},
};
const moduleHost = require('module'), originalLoad = moduleHost._load;
moduleHost._load = function(name: string, ...rest: any[]): any { return name === 'cc' ? mock : originalLoad.call(this, name, ...rest); };
const { AvatarView } = require('../../assets/scripts/jump/view/AvatarView');
const { BackgroundView } = require('../../assets/scripts/jump/view/BackgroundView');
const { JumpUI } = require('../../assets/scripts/jump/view/JumpUI');

test('V04-avatar-pivot-shadow-20-resets', () => {
    const a = new AvatarView(); a.visual = new MockNode(); const shadow = new MockNode(); a.node.children.ContactShadow = shadow;
    const foot = Object.freeze({ x: 7, y: 9.1, z: 4 }); a.consume(started(), 1); a.consume(launched(), 1);
    a.render(foot, 0, .25, 5.5, .15, { x: 1, z: 0 }); eq(a.node.position, foot); eq(foot, { x: 7, y: 9.1, z: 4 });
    // R * (0, rawFootY*sy, 0) + Visual.position == zero, even mid flip.
    const q = a.visual.rotation, v = a.rawFootY * a.visual.scale.y;
    near(a.visual.position.x - 2 * q.z * q.w * v, 0);
    near(a.visual.position.y + (1 - 2 * (q.x * q.x + q.z * q.z)) * v, 0);
    near(a.visual.position.z + 2 * q.x * q.w * v, 0);
    near(shadow.position.y + foot.y, 5.515); near(shadow.scale.x, .18 / 1.36);
    for (let run = 2; run <= 21; run++) { a.resetFeedback(run); a.consume(scored(1, 0, run - 1), run); eq(a.visual.scale, new V3(1, 1, 1)); }
    a.clear(); a.clear(); eq(a.visual.rotation.w, 1);
});
test('V05-background-seven-frames-release', () => {
    const sprite = { spriteFrame: { original: true } }, original = sprite.spriteFrame;
    const textures = Array.from({ length: 7 }, (_, index) => ({ index }));
    const before = MockFrame.created, destroyed = MockFrame.destroyed;
    const b = new BackgroundView(sprite, textures); eq(b.ownedFrameCount, 7); assert((sprite.spriteFrame as any).texture === textures[5]);
    for (let run = 1; run <= 20; run++) {
        b.reset(run); eq(b.index, 5);
        for (let j = 1; j <= 28; j++) b.consume(scored(j, 0, run), run);
        eq(b.index, 5); eq(b.ownedFrameCount, 7);
    }
    eq(MockFrame.created - before, 7); b.clear(); b.destroy(); eq(MockFrame.destroyed - destroyed, 7);
    assert(sprite.spriteFrame === original); eq(b.ownedFrameCount, 0); b.reset(21); eq(b.ownedFrameCount, 0);
});
test('V06-ui-one-ring-one-pulse-20-reset', () => {
    const u = new JumpUI();
    for (const name of ['homePage', 'hudPage', 'pausePage', 'resultPage']) u[name] = new MockNode();
    for (const name of ['score', 'resultScore', 'bestScore']) u[name] = new MockComponent();
    u.score.node.setScale(1.3, 1.3, 1); u.numberFont = {};
    for (const name of ['play', 'pauseButton', 'resumeButton', 'pauseRestart', 'pauseHome', 'replay', 'home']) u[name] = new MockButton();
    const flash = new MockGraphics(); flash.node.parent = u.hudPage; u.hudPage.components.set(MockTransform, new MockTransform()); u.centerFlash = flash;
    let projectionCalls = 0; u.worldCamera = { convertToUINode(p: any, _: any, out: any) { projectionCalls++; Object.assign(out, p); } };
    const actions = { start() {}, pause() {}, resume() {}, restart() {}, home() {} };
    u.connect(actions); eq(u.listenerCount, 7);
    for (let run = 1; run <= 20; run++) {
        u.resetFeedback(run); u.consume(scored(1, 0, run), run, { x: 1, y: 5.5, z: 2 });
        u.render('ready', 2, 2, false, null, .1); eq(flash.paths, 1); assert(flash.node.active); assert(u.score.node.scale.x > 1.3);
        u.consume(scored(1, 0, run), run, { x: 99, y: 0, z: 0 }); u.render('ready', 2, 2, false, null, .1); eq(flash.node.position.x, 1);
        u.render('ready', 2, 2, false, null, .45); eq(flash.paths, 0); assert(!flash.node.active); near(u.score.node.scale.x, 1.3);
        u.resetFeedback(run + 1); u.consume(scored(9, 0, run), run + 1); u.render('ready', 0, 2, true, null, .1); eq(flash.paths, 0); near(u.score.node.scale.x, 1.3);
    }
    eq(u.listenerCount, 7); assert(projectionCalls > 0); u.disconnect(); u.disconnect(); eq(u.listenerCount, 0); eq(flash.paths, 0);
});

test('V07-R11-1000-historical-hash-independent-sequence', () => {
    const a = new PlatformGenerator(C.seed), b = new PlatformGenerator(C.seed); let pa = a.initial()[1], pb = b.initial()[1];
    const background = new BackgroundSequence(); background.reset(1); const sequence: PlatformSpec[] = [];
    for (let i = 0; i < 1000; i++) {
        background.consume(scored(i + 1), 1); const x = a.next(pa), y = b.next(pb); eq(x, y); sequence.push(x.platform); pa = x.platform; pb = y.platform;
    }
    const hash = crypto.createHash('sha256').update(JSON.stringify(sequence)).digest('hex');
    const historical = JSON.parse(fs.readFileSync('docs/验收证据/阶段02规则测试.json', 'utf8'));
    const expected = historical.cases.find((c: any) => c.caseId === 'R11-1000-offset-foot-ray-reachable').actual.sequenceSha256;
    eq(hash, expected);
    const baseline = JSON.parse(fs.readFileSync('docs/数据/验收基准.json', 'utf8'));
    for (const [i, e] of baseline.generatedPlatforms.entries()) { eq(sequence[i].modelKey, e.modelKey); near(sequence[i].horizontalScale, e.scale); near(sequence[i].centerXZ.x, e.centerXZ[0]); near(sequence[i].centerXZ.z, e.centerXZ[1]); }
    return { platforms: sequence.length, hash, expectedSource: '阶段02规则测试.json + 验收基准.json' };
});
test('V08-real-core-24-jumps-with-without-sampling', () => {
    function replay(sample: boolean, fps: number): any {
        const g = new JumpGameplay(), visual = new FeedbackTimeline(), background = new BackgroundSequence(); g.start();
        function drain(): void { for (const e of g.drainEvents()) if (sample) { visual.consume(e, g.state.runId); background.consume(e, g.state.runId); } }
        function tick(): void {
            g.step(); drain(); if (!sample) return;
            const snapshot = JSON.stringify({ foot: g.foot, state: g.state, platforms: g.platforms });
            for (let n = 0; n < Math.max(1, fps / 60); n++) visual.sample(g.state.tick / 60 + n / fps, g.holdSeconds / 1.2, null);
            eq(JSON.stringify({ foot: g.foot, state: g.state, platforms: g.platforms }), snapshot);
        }
        drain();
        for (let jump = 0; jump < 24; jump++) {
            const distance = Math.hypot(g.target!.centerXZ.x - g.foot.x, g.target!.centerXZ.z - g.foot.z);
            let hold = 5, error = Infinity;
            for (let n = 5; n <= 72; n++) { const e = Math.abs(chargeDistance(n / 60) - distance); if (e < error) { hold = n; error = e; } }
            assert(g.press('space')); drain(); for (let n = 0; n < hold; n++) tick(); assert(g.release('space')); drain();
            let guard = 0; while (g.state.phase !== 'ready' && g.state.phase !== 'gameover' && guard++ < 100) tick();
            assert(g.state.phase === 'ready'); eq(g.results[jump].classification, 'target-center');
        }
        return { results: g.results, score: g.state.score, foot: g.foot, platforms: g.platforms };
    }
    const reference = replay(false, 60); for (const fps of [30, 60, 120]) eq(replay(true, fps), reference);
    return { jumps: 24, score: reference.score, fps: [30, 60, 120] };
});
moduleHost._load = originalLoad;
const sourcePaths = ['assets/scripts/jump/view/README.md', 'assets/scripts/jump/view/AvatarView.ts', 'assets/scripts/jump/view/JumpUI.ts', 'assets/scripts/jump/view/FeedbackTimeline.ts', 'assets/scripts/jump/view/BackgroundView.ts', 'assets/scripts/jump/core/gameplay.ts', 'assets/scripts/jump/core/platforms.ts', 'tests/jump/stage04-view-tests.ts', 'tests/jump/run-stage04-view-tests.sh'];
const report = {
    project: { path: process.cwd(), ...JSON.parse(fs.readFileSync('package.json', 'utf8')) },
    executedAt: new Date().toISOString(), node: process.version, compileCommand: process.env.JUMP_VIEW_COMPILE_COMMAND,
    executeCommand: process.env.JUMP_VIEW_EXECUTE_COMMAND,
    sourceHashes: Object.fromEntries(sourcePaths.map(p => [p, crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),
    firstImplementationTransaction: 'CyB-2K2RU_nxy8_eYzQiS', cases, assertions,
    passed: cases.filter(c => c.status === 'pass').length, failed: cases.filter(c => c.status === 'fail').length,
    limitations: ['cc host mocks, not Creator rendering', '30/60/120 sampler simulated seconds, not actual Preview FPS', 'ContactShadow alpha not implemented: material contract unavailable', 'parent must bind one Graphics/Camera and seven textures', 'no Preview, save/reopen, lights/material/transparent rendering acceptance'],
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.indexOf('--evidence') >= 0) fs.writeFileSync('docs/验收证据/阶段04视图测试.json', JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
if (report.failed) process.exitCode = 1;
