declare const require: (name: string) => any;
declare const process: { argv: string[]; env: { [key: string]: string | undefined }; cwd(): string; version: string; exitCode?: number };
import { AudioClip, AudioSource, Node } from 'cc';
import { AudioAdapter, AudioClips, AUDIO_INITIAL_VOLUMES } from '../../assets/scripts/jump/adapters/AudioAdapter';
import type { DomainEvent, JumpPlan } from '../../assets/scripts/jump/core/types';
const mock = require('cc').__audio;
const fs = require('fs'), crypto = require('crypto');
let assertions = 0;
function ok(condition: unknown, message: string): void { ++assertions; if (!condition) throw new Error(message); }
function eq(actual: unknown, expected: unknown, message: string): void { if (actual === expected) { ok(true, message); return; } const a = JSON.stringify(actual), b = JSON.stringify(expected); ok(a === b, `${message}: ${a} != ${b}`); }
const tests: { id: string; name: string; run: () => void }[] = [];
function test(id: string, name: string, run: () => void): void { tests.push({ id, name, run }); }
const fixtures: { audio: AudioAdapter; owner: Node }[] = [];
function fixture(run = 1): { audio: AudioAdapter; owner: Node; clips: AudioClips } {
    const owner = new Node('AudioTestOwner');
    const clips = { intro: new AudioClip('intro'), loop: new AudioClip('loop'), success: new AudioClip('success'),
        combos: Array.from({ length: 8 }, (_, i) => new AudioClip(`combo${i + 1}`)), fall: new AudioClip('fall'), start: new AudioClip('start') };
    const audio = new AudioAdapter(owner, clips); audio.reset(run); fixtures.push({ audio, owner });
    return { audio, owner, clips };
}
const charge = (runId = 1, action: 'begin' | 'cancel' = 'begin'): DomainEvent => ({ type: 'Charge', runId, tick: 1, action, source: 'space' });
const score = (jumpId = 1, streak = 0, runId = 1): DomainEvent => ({ type: 'Scored', runId, tick: 2, jumpId, streak, delta: 1, score: jumpId });
const failed = (jumpId = 1, runId = 1): DomainEvent => ({ type: 'Failed', runId, tick: 3, jumpId, reason: 'miss' });
const started = (runId = 1): DomainEvent => ({ type: 'Started', runId, tick: 0, seed: 20260930 });
const paused = (runId = 1): DomainEvent => ({ type: 'Paused', runId, tick: 2, resumePhase: 'ready', reason: 'blur' });
function jump(jumpId = 1, runId = 1): DomainEvent {
    const plan: JumpPlan = { jumpId, runId, startTick: 1, startFoot: { x: 0, y: 0, z: 0 }, directionXZ: { x: 1, z: 0 }, distance: 14, flightTime: 0.6, targetId: 1 };
    return { type: 'Jump', runId, tick: 2, jumpId, plan };
}
function voice(sound: string): any { return [...mock.sources].find((s: any) => s.node.parent && s.node.name === `JumpAudio-${sound}`); }
function end(source: any): void { source.node.emit(AudioSource.EventType.ENDED, source); }
function quiet(audio: AudioAdapter): void { eq(audio.snapshot().activeSources, 0, 'no attached voices'); mock.settle(); eq(mock.metrics().audiblePlayers, 0, 'no audible player'); eq(mock.metrics().listeners, 0, 'no ENDED listener'); }

test('A01', '首手势前静音且开启不补播旧事件', () => {
    const { audio } = fixture();
    for (const event of [started(), charge(), score(), failed()]) audio.consume(event, 1);
    eq(audio.snapshot().playRequests, 0, 'pre-gesture zero play requests'); eq(mock.metrics().pendingLoads, 0, 'no pre-gesture loads');
    audio.enableFromGesture(); audio.enableFromGesture(); eq(audio.snapshot().playRequests, 0, 'no replay on unlock'); quiet(audio);
    audio.reset(2); audio.consume(started(2), 2); eq(audio.snapshot().feedback, 'start', 'future start accepted');
});
test('A02', '首次手势后Started每run唯一与初始音量', () => {
    const { audio, clips } = fixture(); audio.enableFromGesture(); audio.consume(started(), 1);
    const source = voice('start'); eq(source.clip, clips.start, 'start clip'); eq(source.volume, 0.45, 'unlistened initial start volume'); eq(source.playOnAwake, false, 'no auto play');
    audio.consume(started(), 1); eq(audio.snapshot().playRequests, 1, 'start duplicate suppressed');
    mock.settle(); eq(mock.metrics().audibleStarts, 1, 'mock start request reached player'); end(source); quiet(audio);
});
test('A03', 'intro ENDED进入loop及单一蓄力声道', () => {
    const { audio, clips, owner } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
    const intro = voice('intro'); eq(intro.loop, false, 'intro nonloop'); eq(intro.volume, 0.35, 'charge volume');
    audio.consume(charge(), 1); eq(audio.snapshot().playRequests, 1, 'duplicate begin ignored');
    mock.settle(); end(intro);
    const loop = voice('loop'); eq(loop.clip, clips.loop, 'loop clip'); eq(loop.loop, true, 'loop enabled'); eq(owner.children.length, 1, 'old node detached immediately');
    mock.settle(); eq(mock.metrics().sources, 1, 'one physical source after frame'); eq(mock.metrics().listeners, 1, 'one ended listener');
    eq(audio.snapshot().charge, 'loop', 'snapshot loop');
});
test('A04', '释放Jump停止intro和loop', () => {
    for (const phase of ['intro', 'loop']) {
        const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
        if (phase === 'loop') { mock.settle(); end(voice('intro')); }
        audio.consume(jump(), 1); quiet(audio); eq(audio.snapshot().charging, false, 'released not charging');
    }
});
test('A05', '取消停止intro和loop', () => {
    for (const phase of ['intro', 'loop']) {
        const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
        if (phase === 'loop') { mock.settle(); end(voice('intro')); }
        audio.consume(charge(1, 'cancel'), 1); quiet(audio);
    }
});
test('A06', '暂停冻结音频且恢复不续蓄力', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1); mock.settle(); end(voice('intro')); mock.settle();
    audio.consume(paused(), 1); quiet(audio); audio.consume(charge(), 1); quiet(audio);
    audio.consume({ type: 'Resumed', runId: 1, tick: 3, phase: 'ready' }, 1); quiet(audio);
    audio.consume(charge(), 1); eq(audio.snapshot().charge, 'intro', 'fresh press starts intro');
});
test('A07', 'core旧run Returned及新局不受旧Returned影响', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
    audio.consume({ type: 'Returned', runId: 1, tick: 2 }, 2); quiet(audio); eq(audio.snapshot().runId, 2, 'authoritative home run synced');
    audio.consume(started(3), 3); const count = audio.snapshot().playRequests;
    audio.consume({ type: 'Returned', runId: 1, tick: 2 }, 3); eq(audio.snapshot().feedback, 'start', 'old return does not stop new run'); eq(audio.snapshot().playRequests, count, 'no extra sound');
});
test('A08', 'Failed先停蓄力再唯一fall并拒绝终局旧得分', () => {
    const { audio, clips } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1); mock.settle();
    audio.consume(failed(), 1); eq(audio.snapshot().charge, null, 'failure stops intro'); eq(audio.snapshot().feedback, 'fall', 'fall selected');
    eq(voice('fall').clip, clips.fall, 'not fall_2'); eq(voice('fall').volume, 0.5, 'fall initial volume');
    const count = audio.snapshot().playRequests;
    audio.consume(failed(), 1); audio.consume(failed(2), 1); audio.consume(score(2), 1); audio.consume(charge(), 1);
    eq(audio.snapshot().playRequests, count, 'failed once/run and terminal closed'); mock.settle(); eq(mock.metrics().audiblePlayers, 1, 'only fall remains');
});
test('A09', 'Scored普通success、combo1—8封顶且不堆叠', () => {
    const { audio, clips } = fixture(); audio.enableFromGesture();
    audio.consume(score(), 1); eq(voice('success').clip, clips.success, 'normal success'); eq(voice('success').volume, 0.55, 'success initial volume');
    for (let streak = 1; streak <= 10; ++streak) {
        audio.consume(score(streak + 1, streak), 1); const combo = Math.min(streak, 8);
        eq(voice('combo').clip, clips.combos[combo - 1], `combo${combo} clip`); eq(voice('combo').volume, 0.55, 'combo volume');
        eq(audio.snapshot().combo, combo, 'combo snapshot'); mock.settle(); eq(mock.metrics().sources, 1, 'single feedback source'); eq(mock.metrics().audiblePlayers, 1, 'feedback does not stack');
    }
});
test('A10', '重复Scored/旧jump不会干扰新蓄力', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(jump(1), 1); audio.consume(score(1), 1);
    audio.consume(charge(), 1); const intro = voice('intro'), count = audio.snapshot().playRequests;
    audio.consume(score(1, 8), 1); audio.consume(jump(1), 1); audio.consume({ type: 'Landed', jumpId: 1, runId: 1, tick: 3, outcome: 'target' }, 1); audio.consume(failed(1), 1);
    eq(voice('intro'), intro, 'stale prior jump leaves new charge alone'); eq(audio.snapshot().playRequests, count, 'duplicate scored ignored');
    audio.consume(jump(2), 1); audio.consume(score(1), 1); audio.consume(failed(1), 1); eq(audio.snapshot().terminal, false, 'old failed rejected');
});
test('A11', '旧run及逆向权威run拒绝', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1); audio.reset(2); audio.consume(charge(2), 2);
    const count = audio.snapshot().playRequests;
    for (const event of [score(), failed(), paused(), jump(), charge(), started()]) audio.consume(event, 2);
    audio.consume(paused(), 1); audio.reset(1);
    eq(audio.snapshot().runId, 2, 'monotonic run'); eq(audio.snapshot().charge, 'intro', 'new voice survives stale events'); eq(audio.snapshot().playRequests, count, 'no stale plays');
});
test('A12', '旧ENDED闭包及错误source不会启动loop', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
    const old = voice('intro'), callback = old.node.listeners.get('ended')[0];
    audio.consume(charge(1, 'cancel'), 1); audio.consume(charge(), 1); const current = voice('intro');
    ok(old !== current, 'no reused source identity'); callback(old); current.node.emit('ended', old);
    eq(audio.snapshot().charge, 'intro', 'old ended cannot transition'); eq(audio.snapshot().playRequests, 2, 'no old loop request');
    audio.reset(2); callback(old); quiet(audio);
});
test('A13', 'intro未加载cancel再用同clip无ABA', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1); const old = voice('intro');
    eq(old.queue, ['play'], 'engine-like pre-load PLAY queued'); audio.consume(charge(1, 'cancel'), 1);
    eq(old.volume, 0, 'mute before retire'); eq(old.clip, null, 'invalidate load'); audio.consume(charge(), 1);
    eq(mock.metrics().pendingLoads, 2, 'old/new asynchronous loads coexist'); mock.resolveLoad(0); mock.flushPlayback();
    eq(mock.metrics().discardedLoads, 1, 'old load discarded by clip identity'); eq(mock.metrics().audibleStarts, 0, 'no old audible start');
    mock.settle(); eq(mock.metrics().sources, 1, 'only new source remains'); eq(mock.metrics().audiblePlayers, 1, 'new intro may play');
});
test('A14', '加载完成而底层play排队时reset立即静音', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
    const old = voice('intro'); mock.resolveLoad(); ok(!!old.player, 'loaded player with queued play'); eq(mock.metrics().audibleStarts, 0, 'player play gate not flushed');
    const player = old.player; audio.reset(2); eq(player.volume, 0, 'old gain muted before queued stop'); ok(player.destroyed, 'old player destroyed by clip=null');
    mock.flushPlayback(); quiet(audio); eq(mock.metrics().audibleStarts, 0, 'no late playback at queue flush');
});
test('A15', '新局未加载start/score/fall全清且旧加载无声音', () => {
    for (const event of [started(), score(), failed()]) {
        const { audio } = fixture(); audio.enableFromGesture(); audio.consume(event, 1); audio.reset(2); quiet(audio);
        eq(mock.metrics().audibleStarts, 0, 'cancel before load silent');
    }
});
test('A16', 'stopAll/暂停清理反馈，重复reset不重开去重', () => {
    const { audio } = fixture(); audio.enableFromGesture(); audio.consume(started(), 1); audio.stopAll(); quiet(audio);
    audio.consume(started(), 1); eq(audio.snapshot().playRequests, 1, 'stopped start not replayed');
    audio.consume(score(), 1); audio.consume(paused(), 1); quiet(audio);
    audio.reset(1); audio.consume(score(), 1); eq(audio.snapshot().playRequests, 2, 'same-run reset retains scored water mark');
});
test('A17', '独占声道与JSON snapshot不谎称已播放', () => {
    const { audio, owner } = fixture(); audio.enableFromGesture(); audio.consume(started(), 1); audio.consume(charge(), 1);
    eq(owner.children.length, 1, 'charge replaces start feedback');
    const snapshot = audio.snapshot(); eq(JSON.parse(JSON.stringify(snapshot)), snapshot, 'plain JSON'); eq(snapshot.activeSources, 1, 'bounded attached voice'); eq(snapshot.endedListeners, 1, 'bounded listener');
    eq(mock.metrics().audibleStarts, 0, 'playRequests do not mean playback');
    for (const value of Object.values(AUDIO_INITIAL_VOLUMES)) ok(value >= 0 && value <= 1, 'volume finite in range');
});
let lifecycle: any[] = [];
test('A18', '连续20新局无源/监听/声音增长（含帧末销毁）', () => {
    const { audio, owner } = fixture(); audio.enableFromGesture(); lifecycle = [];
    for (let run = 1; run <= 20; ++run) {
        audio.reset(run); audio.consume(started(run), run); audio.consume(charge(run), run); mock.settle();
        const old = voice('intro'), oldEnded = old.node.listeners.get('ended')[0]; end(old); mock.settle();
        eq(mock.metrics().sources, 1, 'one loop source each settled run'); eq(mock.metrics().listeners, 1, 'one listener each settled run');
        audio.consume(paused(run), run); audio.consume({ type: 'Resumed', runId: run, tick: 4, phase: 'ready' }, run); audio.consume(score(1, run, run), run);
        audio.reset(run + 1); oldEnded(old); mock.settle();
        const metrics = mock.metrics(); lifecycle.push({ run, sources: metrics.sources, players: metrics.players, listeners: metrics.listeners, attached: metrics.attached, pendingLoads: metrics.pendingLoads });
        eq(owner.children.length, 0, 'no audio children after reset'); eq(metrics.sources, 0, 'physical sources reclaimed at frame'); eq(metrics.players, 0, 'players reclaimed'); eq(metrics.listeners, 0, 'listeners reclaimed'); eq(metrics.pendingLoads, 0, 'test loads settled'); eq(metrics.audiblePlayers, 0, 'no loop remains');
        eq(metrics.createdSources, metrics.destroyedSources, 'create/destroy balance'); ok(metrics.maxAttached <= 2, 'attached source bound');
    }
});
test('A19', '20次同帧新局立即摘除静音，帧末回收全部退役源', () => {
    const { audio, owner } = fixture(); audio.enableFromGesture();
    for (let run = 1; run <= 20; ++run) { audio.reset(run); audio.consume(charge(run), run); ok(owner.children.length <= 1, 'same-frame attached bound'); }
    ok(mock.metrics().pendingDestroy > 0, 'physical destruction correctly deferred, not hidden');
    audio.stopAll(); quiet(audio); eq(mock.metrics().sources, 0, 'all retired physical sources reclaimed'); eq(mock.metrics().players, 0, 'no residual player'); eq(mock.metrics().audibleStarts, 0, 'all pre-load old plays cancelled');
});
test('A20', 'destroy幂等且晚到ENDED/加载/后续调用无声音', () => {
    const { audio, owner } = fixture(); audio.enableFromGesture(); audio.consume(charge(), 1);
    const old = voice('intro'), callback = old.node.listeners.get('ended')[0]; audio.destroy(); audio.destroy(); callback(old);
    audio.enableFromGesture(); audio.reset(2); audio.consume(started(2), 2); audio.consume(charge(2), 2);
    quiet(audio); eq(audio.snapshot().enabled, false, 'destroyed gate closed'); eq(audio.snapshot().destroyed, true, 'destroy flag'); eq(audio.snapshot().playRequests, 1, 'no post-destroy requests'); eq(owner.children.length, 0, 'no children'); eq(mock.metrics().sources, 0, 'no live source'); eq(mock.metrics().players, 0, 'no player');
});

const results: any[] = [];
for (const entry of tests) {
    mock.clear(); fixtures.length = 0; const before = assertions; let error: string | null = null;
    try { entry.run(); } catch (e) { error = e instanceof Error ? e.message : 'unknown failure'; }
    finally {
        for (const f of fixtures) { f.audio.destroy(); f.owner.destroy(); }
        mock.settle();
        try { eq(mock.metrics().sources, 0, 'test cleanup physical sources'); eq(mock.metrics().players, 0, 'test cleanup players'); eq(mock.metrics().listeners, 0, 'test cleanup listeners'); }
        catch (e) { if (!error) error = e instanceof Error ? e.message : 'cleanup failure'; }
    }
    const result = { id: entry.id, name: entry.name, passed: !error, assertions: assertions - before, error };
    results.push(result); console.log(`${error ? 'FAIL' : 'PASS'} ${entry.id} ${entry.name}${error ? ': ' + error : ''}`);
}
const paths = ['assets/scripts/jump/adapters/AudioAdapter.ts', 'assets/scripts/jump/core/types.ts', 'tests/jump/stage04-audio-tests.ts', 'tests/jump/audio-mocks/cc.d.ts', 'tests/jump/audio-mocks/cc/index.js', 'tests/jump/audio-mocks/run.sh'];
const report = { stage: '04-audio', project: process.cwd(), package: JSON.parse(fs.readFileSync('package.json', 'utf8')), executedAt: new Date().toISOString(), node: process.version,
    typeScript: process.env.JUMP_AUDIO_TSC_VERSION, commands: { engineDeclarationTypecheck: process.env.JUMP_AUDIO_ENGINE_CHECK, compile: process.env.JUMP_AUDIO_COMPILE_COMMAND, execute: process.env.JUMP_AUDIO_EXECUTE_COMMAND },
    recoveredChecks: [{ check: 'Initial scratch engine declaration config', result: 'failed TS2688', reason: 'Inherited relative types were resolved from scratch; fixed by explicit absolute current-project declaration paths', auditRunId: 'ocTk64X7T2paoIaPJrrwY' }],
    sourceHashes: Object.fromEntries(paths.map(path => [path, crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')])),
    firstWriteTransactions: { adapterReadme: 'zUbc0_wtprL01-MqHuhrh', audioAdapter: 'Hf3hsX5o-wchOAd5DRh84', ccDeclaration: 'bIKtsM6Uh5ku0kbN_LwNe', ccMock: 'jXT19iA6XuhWofIBYXHkQ', runner: '7d21IL1-G5VEsvSi6lPRX', testEntry: '4MrCh0wB7oMyZrADdSrgt' },
    summary: { tests: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, assertions }, results, lifecycle,
    coveredLayer: 'Real AudioAdapter class under independent deterministic cc mock; real Creator declarations typecheck, NOT engine/runtime/audio execution',
    notExecuted: ['Creator Preview and real listening/volume calibration', 'Actual browser AudioContext/DOM gesture policy and suspended-context playback', 'Actual engine loader, frame deferred destruction and platform interruption', 'Inspector binding of 13 AudioClips; parent integration'],
    limitations: ['At most two attached voice slots; retired Node/Component destruction occurs at engine frame end.', 'In-flight engine loads are invalidated, not aborted; unresolved promises may retain retired sources until resolution.', 'DOM audio fallback late browser gesture callbacks are engine-owned; mock cannot prove browser callback cleanup.'] };
console.log(JSON.stringify(report.summary));
if (process.argv.indexOf('--evidence') >= 0) {
    const first = 'docs/验收证据/阶段04音频测试.json';
    const output = fs.existsSync(first) ? `docs/验收证据/阶段04音频测试-复验-${new Date().toISOString().replace(/[:.]/g, '-')}.json` : first;
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' }); console.log(`Evidence: ${output}`);
}
if (report.summary.failed) process.exitCode = 1;
