// Standalone tests of REAL compiled adapters/views. No core test entry is changed.
// Run: sh tests/jump/adapter-mocks/run.sh '<current scratch>/adapter-test'
declare const require: any;
declare const process: any;
import { InputAdapter, InputSink } from '../../assets/scripts/jump/adapters/InputAdapter';
import { PlatformPool } from '../../assets/scripts/jump/view/PlatformPool';
import { PlatformView } from '../../assets/scripts/jump/view/PlatformView';
import { PlatformSpec, ModelKey } from '../../assets/scripts/jump/core/types';
const cc: any = require('cc');
const results: any[] = [];
let assertions = 0;
function equal(actual: any, expected: any, reason: string): void {
    assertions++;
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${reason}; expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
}
function ok(value: any, reason: string): void { equal(!!value, true, reason); }
function test(id: string, fn: () => void): void {
    if (process.env.JUMP_ADAPTER_FILTER && !id.startsWith(process.env.JUMP_ADAPTER_FILTER)) return;
    const before = assertions;
    try { fn(); results.push({ id, status: 'pass', assertions: assertions - before }); console.log(`PASS ${id}`); }
    catch (error) { const reason = String(error); results.push({ id, status: 'fail', firstReason: reason, assertions: assertions - before }); console.log(`FAIL ${id}: ${reason}`); }
}
function fixture(): any {
    cc.input.reset(); cc.game.reset();
    const win = new cc.Bus(); const doc = new cc.Bus(); doc.activeElement = null; doc.hidden = false;
    (globalThis as any).window = win; (globalThis as any).document = doc;
    const ui = new cc.Node('UI');
    const f: any = { win, doc, ui, accepted: true, blocked: false, presses: [], releases: [], cancels: [], pauses: [], commands: [] };
    const sink: InputSink = {
        press: source => { f.presses.push(source); return f.accepted; },
        release: source => f.releases.push(source),
        cancel: (source, reason) => f.cancels.push([source, reason]),
        pause: reason => f.pauses.push(reason),
        command: key => f.commands.push(key), blocked: () => f.blocked,
    };
    f.adapter = new InputAdapter(sink, ui); f.adapter.bind(); return f;
}
function key(down: boolean, keyCode = 32): void { cc.input.emit(down ? 'key-down' : 'key-up', { keyCode }); }
function mouse(down: boolean, button = 0): void { cc.input.emit(down ? 'mouse-down' : 'mouse-up', { getButton: () => button, getLocation: () => ({ x: 20, y: 20 }) }); }
function touch(type: string, id: number): void { cc.input.emit(`touch-${type}`, { getID: () => id, getLocation: () => ({ x: 20, y: 20 }) }); }

test('I01-space-repeat-keydown-single-release', () => {
    const f = fixture(); for (let i = 0; i < 20; i++) key(true); key(false); key(false);
    equal(f.presses, ['space'], 'repeat does not press twice'); equal(f.releases, ['space'], 'release once'); f.adapter.unbind();
});
test('I02-mouse-owner-touch-and-key-nonowner-release', () => {
    const f = fixture(); mouse(true); touch('start', 7); key(true); touch('end', 7); key(false);
    equal(f.presses, ['mouse-left'], 'one owner'); equal(f.releases, [], 'non-owner cannot release'); mouse(false);
    equal(f.releases, ['mouse-left'], 'owner releases'); f.adapter.unbind();
});
test('I03-touch-owner-multitouch-and-mouse-competition', () => {
    const f = fixture(); touch('start', 11); touch('start', 12); mouse(true); mouse(false); touch('cancel', 12);
    equal(f.cancels, [], 'competitor cancel cannot cancel owner'); equal(f.releases, [], 'competitor mouse up ignored');
    touch('end', 11); equal(f.presses, ['touch:11'], 'touch has exclusive owner'); equal(f.releases, ['touch:11'], 'touch owner releases once'); f.adapter.unbind();
});
test('I04-rejected-flight-input-is-not-buffered', () => {
    const f = fixture(); f.accepted = false; key(true); mouse(true); touch('start', 4);
    equal(f.presses, ['space', 'mouse-left', 'touch:4'], 'sink sees busy attempts'); f.accepted = true;
    key(true); mouse(true); touch('start', 4); equal(f.presses.length, 3, 'repeat after ready cannot become press');
    key(false); mouse(false); touch('end', 4); equal(f.releases, [], 'rejected down has no release');
    key(true); key(false); equal(f.presses.length, 4, 'only new physical edge presses'); equal(f.releases, ['space'], 'new press owns release'); f.adapter.unbind();
});
test('I05-pause-reset-held-key-requires-release', () => {
    const f = fixture(); key(true); f.adapter.reset(); key(true);
    equal(f.presses, ['space'], 'held key stays quarantined'); equal(f.cancels, [['space', 'input-reset']], 'reset cancels owner');
    key(false); equal(f.releases, [], 'old owner release cannot launch'); key(true); key(false);
    equal(f.presses, ['space', 'space'], 'repress accepted'); equal(f.releases, ['space'], 'fresh release only'); f.adapter.unbind();
});
test('I06-reset-held-pointer-and-touch-requires-release', () => {
    for (const source of ['mouse', 'touch']) {
        const f = fixture(); const down = () => source === 'mouse' ? mouse(true) : touch('start', 3);
        const up = () => source === 'mouse' ? mouse(false) : touch('end', 3);
        down(); f.adapter.reset(); down(); equal(f.presses.length, 1, 'pointer held quarantined'); up(); equal(f.releases, [], 'reset owner gone'); down(); up(); equal(f.releases.length, 1, 'fresh pointer released'); f.adapter.unbind();
    }
});
test('I07-UI-Button-EditBox-BlockInputEvents-hit-blocks', () => {
    for (const ctor of [cc.Button, cc.EditBox, cc.BlockInputEvents]) {
        const f = fixture(); const node = new cc.Node('Control'); const transform = node.addComponent(new cc.UITransform()); node.addComponent(new ctor()); f.ui.addChild(node);
        mouse(true); mouse(false); touch('start', 6); touch('end', 6); equal(f.presses, [], 'UI hit stops world press');
        transform.hit = false; mouse(true); mouse(false); equal(f.presses, ['mouse-left'], 'miss allows world input'); f.adapter.unbind();
    }
});
test('I08-disabled-inactive-UI-and-modal-block', () => {
    const f = fixture(); const parent = new cc.Node(); const node = new cc.Node(); node.addComponent(new cc.UITransform()); const button = node.addComponent(new cc.Button()); parent.addChild(node); f.ui.addChild(parent);
    button.enabled = false; mouse(true); mouse(false); button.enabled = true; parent.active = false; touch('start', 1); touch('end', 1);
    equal(f.presses, ['mouse-left', 'touch:1'], 'inactive/disabled UI does not hit'); f.blocked = true; key(true); key(false); equal(f.presses.length, 2, 'modal sink blocks keyboard'); f.adapter.unbind();
});
test('I09-form-focus-input-textarea-contentEditable', () => {
    for (const element of [{ tagName: 'INPUT' }, { tagName: 'TEXTAREA' }, { tagName: 'DIV', isContentEditable: true }]) {
        const f = fixture(); f.doc.activeElement = element; key(true); key(true, 80); equal(f.presses, [], 'focused form space blocked'); equal(f.commands, [], 'form command blocked');
        f.doc.activeElement = null; key(true); equal(f.presses, [], 'blocked space does not leak while held'); key(false); key(false, 80); key(true); key(false); key(true, 80); key(true, 80); key(false, 80);
        equal(f.releases, ['space'], 'fresh space after focus released'); equal(f.commands, [80], 'command repeat suppressed'); f.adapter.unbind();
    }
});
test('I10-touch-cancel-no-release-and-fresh-touch', () => {
    const f = fixture(); touch('start', 8); touch('cancel', 8); touch('end', 8);
    equal(f.cancels, [['touch:8', 'touch-cancel']], 'touch cancel reason'); equal(f.releases, [], 'cancel never releases'); touch('start', 8); touch('end', 8); equal(f.releases, ['touch:8'], 'touch cancel clears physical down'); f.adapter.unbind();
});
test('I11-bind-unbind-counts-idempotence-20-cycles', () => {
    const f = fixture(); f.adapter.bind();
    equal([cc.input.listeners.length, cc.game.listeners.length, f.win.listeners.length, f.doc.listeners.length], [7, 1, 1, 1], 'one listener set');
    for (let i = 0; i < 20; i++) { f.adapter.unbind(); f.adapter.unbind(); equal([cc.input.listeners.length, cc.game.listeners.length, f.win.listeners.length, f.doc.listeners.length], [0, 0, 0, 0], 'all listeners removed'); f.adapter.bind(); f.adapter.bind(); }
    f.adapter.unbind(); equal([cc.input.onCalls, cc.input.offCalls, cc.game.onCalls, cc.game.offCalls, f.win.onCalls, f.win.offCalls, f.doc.onCalls, f.doc.offCalls], [147, 147, 21, 21, 21, 21, 21, 21], 'exact event registration/removal pairs');
    key(true); mouse(true); touch('start', 9); equal(f.presses, [], 'no input after unbind');
});
test('I12-game-hide-window-blur-document-hidden', () => {
    for (const event of ['hide', 'blur', 'visibility']) {
        const f = fixture(); key(true);
        if (event === 'hide') cc.game.emit('hide'); else if (event === 'blur') f.win.emit('blur'); else { f.doc.hidden = false; f.doc.emit('visibilitychange'); equal(f.pauses, [], 'visible document not paused'); f.doc.hidden = true; f.doc.emit('visibilitychange'); }
        equal(f.cancels, [['space', 'input-reset']], 'lifecycle cancels charge'); equal(f.pauses, [event === 'blur' ? 'blur' : 'background'], 'lifecycle pauses sink'); key(true); equal(f.presses.length, 1, 'held key remains blocked'); key(false); key(true); key(false); equal(f.releases, ['space'], 'fresh gesture after lifecycle'); f.adapter.unbind();
    }
});
test('I13-unbind-clears-physical-down-for-rebind', () => {
    const f = fixture(); key(true); f.adapter.unbind(); f.adapter.bind(); key(true); key(false);
    equal(f.presses, ['space', 'space'], 'unbind full reset'); equal(f.releases, ['space'], 'new binding fresh owner'); f.adapter.unbind();
});
test('I14-right-mouse-button-ignored', () => {
    const f = fixture(); mouse(true, 2); mouse(false, 2); equal(f.presses, [], 'right mouse ignored'); mouse(true); mouse(false); equal(f.releases, ['mouse-left'], 'left mouse unaffected'); f.adapter.unbind();
});

const keys: ModelKey[] = ['block_00', 'block_01', 'block_03', 'block_04', 'block_08', 'block_11', 'block_12', 'block_33', 'block_34', 'block_35'];
function spec(id: number, modelKey: ModelKey = 'block_00'): PlatformSpec {
    const base = { id, modelKey, topY: 5.5, centerXZ: { x: id * 10, z: id * 2 }, horizontalScale: 0.8 };
    return modelKey === 'block_03' ? { ...base, shape: 'circle', radius: 4 } : { ...base, shape: 'rect', halfExtent: { x: 4, z: 4 } };
}
function poolFixture(limit = 8): any {
    const material = new cc.Material('shared-original'); const parent = new cc.Node('World');
    const wrapper = () => { const node = new cc.Node('Wrapper'); const visual = new cc.Node('Visual'); visual.setPosition(0, -2.75, 0); node.addChild(visual); const view = node.addComponent(new PlatformView()); view.visual = visual; return node; };
    const rect = new cc.Prefab(wrapper); const rect01 = new cc.Prefab(wrapper); const circle = new cc.Prefab(wrapper);
    const models = keys.map(key => new cc.Prefab(() => { const node = new cc.Node(key); node.addComponent(new cc.MeshRenderer([material])); return node; }));
    return { pool: new PlatformPool(parent, rect, rect01, circle, models, keys, limit), parent, material, models, rect, rect01, circle };
}
function throws(fn: () => void, text: string): void {
    let reason = ''; try { fn(); } catch (error) { reason = String(error); } ok(reason.includes(text), `must throw ${text}`);
}
test('P01-pool-limit-8-and-1000-reuse', () => {
    const f = poolFixture(); f.pool.sync(Array.from({ length: 8 }, (_, i) => spec(i))); equal(f.pool.count, 8, 'fills cap');
    throws(() => f.pool.sync(Array.from({ length: 9 }, (_, i) => spec(i))), 'platform pool limit exceeded'); equal(f.pool.count, 8, 'rejected batch does not grow');
    for (let i = 8; i < 1008; i++) { f.pool.sync([spec(i, keys[i % keys.length])]); equal(f.pool.count, 8, 'bounded reuse'); equal(f.parent.children.filter((n: any) => n.active).length, 1, 'one active requested slot'); }
    f.pool.clear(); equal(f.pool.count, 8, 'clear retains allocated wrappers'); f.pool.destroy(); equal(f.pool.count, 0, 'destroy empties pool'); equal(f.parent.children.length, 0, 'destroy removes wrappers');
});
test('P02-rect-circle-apply-metadata-and-transform', () => {
    const f = poolFixture(); f.pool.sync([spec(2, 'block_03'), spec(3, 'block_01')]);
    const circle = f.parent.children[0]; const view = circle.getComponent(PlatformView);
    equal([view.modelKey, view.shape, view.halfX, view.halfZ, view.radius, view.horizontalScale], ['block_03', 'circle', 4, 4, 4, 0.8], 'circle metadata'); equal(circle.position, [20, 5.5, 4], 'top center root'); equal(view.visual.scale, [0.8, 1, 0.8], 'XZ only scaling');
    equal(f.circle.instances.length, 1, 'circle wrapper chosen'); equal(f.rect01.instances.length, 1, '01 wrapper chosen');
    const rv = f.parent.children[1].getComponent(PlatformView); equal([rv.shape, rv.radius, rv.halfX, rv.halfZ], ['rect', 0, 4, 4], 'rect metadata'); f.pool.destroy();
});
test('P03-recycle-clears-metadata-root-and-visual-position-scale', () => {
    const f = poolFixture(); f.pool.sync([spec(1)]); const node = f.parent.children[0]; const v = node.getComponent(PlatformView);
    node.setRotationFromEuler(20, 30, 40); node.setScale(2, 3, 4); v.visual.setPosition(7, 8, 9); v.visual.setScale(4, 5, 6); f.pool.clear();
    equal([v.spec, v.modelKey, v.shape, v.halfX, v.halfZ, v.radius, v.horizontalScale, node.active], [null, '', '', 0, 0, 0, 1, false], 'recycle metadata reset'); equal(node.position, [0, 0, 0], 'root position reset'); equal(node.euler, [0, 0, 0], 'root rotation reset'); equal(node.scale, [1, 1, 1], 'root scale reset'); equal(v.visual.position, [0, -2.75, 0], 'visual origin reset'); equal(v.visual.scale, [1, 1, 1], 'visual scale reset'); ok(v.unscheduled > 0, 'view callbacks unscheduled'); f.pool.destroy();
});
test('P04-recycle-restores-shared-material-stops-descendant-tweens', () => {
    const f = poolFixture(); f.pool.sync([spec(1)]); const node = f.parent.children[0]; const renderer = node.getComponentsInChildren(cc.MeshRenderer)[0]; const model = renderer.node;
    const mutated = new cc.Material('instance-mutation'); renderer.sharedMaterials[0] = mutated; cc.stopped.length = 0; f.pool.clear();
    ok(renderer.sharedMaterials[0] === f.material, 'original shared material restored'); equal(renderer.restores.length, 1, 'renderer setter invoked');
    ok(cc.stopped.includes(node) && cc.stopped.includes(node.children[0]) && cc.stopped.includes(model), 'Tween stop reaches descendants'); equal(f.material.name, 'shared-original', 'shared material not mutated'); f.pool.destroy();
});
test('P05-model-replacement-and-idempotent-same-id', () => {
    const f = poolFixture(1); f.pool.sync([spec(1)]); const node = f.parent.children[0]; const v = node.getComponent(PlatformView); const old = v.visual.children[0];
    f.pool.sync([spec(1)]); equal(f.models[0].instances.length, 1, 'same id not recreated'); f.pool.sync([spec(2, 'block_03')]);
    equal(f.pool.count, 1, 'same wrapper reused across shape'); ok(old.destroyed, 'old model destroyed'); equal(v.visual.children.length, 1, 'single model child'); equal([v.shape, v.radius, v.modelKey], ['circle', 4, 'block_03'], 'new metadata replaces old'); f.pool.destroy();
});
test('P06-recycle-resets-visual-local-rotation', () => {
    const f = poolFixture(1); f.pool.sync([spec(1)]); const v = f.parent.children[0].getComponent(PlatformView); v.visual.setRotationFromEuler(0, 45, 0);
    try { f.pool.clear(); equal(v.visual.euler, [0, 0, 0], 'all Visual local transforms must return to wrapper baseline'); }
    finally { f.pool.destroy(); }
});
test('P07-invalid-scale-and-array-length-mismatch-fail-explicitly', () => {
    const f = poolFixture(); throws(() => f.pool.sync([{ ...spec(1), horizontalScale: 0.7 }]), 'horizontalScale must'); f.pool.destroy();
    throws(() => new PlatformPool(new cc.Node(), new cc.Prefab(), new cc.Prefab(), new cc.Prefab(), [], keys, 8), '10 explicit model Prefabs required');
});

const fs = require('fs'); const crypto = require('crypto'); const path = require('path');
const hashPaths = ['package.json', 'assets/scripts/jump/adapters/InputAdapter.ts', 'assets/scripts/jump/view/PlatformPool.ts', 'assets/scripts/jump/view/PlatformView.ts', 'assets/scripts/jump/core/config.ts', 'assets/scripts/jump/core/types.ts', 'tests/jump/adapter-tests.ts', 'tests/jump/adapter-mocks/cc.d.ts', 'tests/jump/adapter-mocks/cc.js', 'tests/jump/adapter-mocks/run.sh'];
const sourceHashes = Object.fromEntries(hashPaths.map(p => [p, crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const preCompileHashes = JSON.parse(process.env.JUMP_ADAPTER_PRE_HASHES);
const sourceStableDuringCompile = Object.keys(preCompileHashes).every(p => preCompileHashes[p] === sourceHashes[p]);
const compiledHashes: any = {};
for (const source of hashPaths.filter(p => p.endsWith('.ts') && !p.endsWith('.d.ts'))) {
    const output = path.join(process.env.JUMP_ADAPTER_OUT, source.replace(/\.ts$/, '.js'));
    compiledHashes[source] = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
}
const failed = results.filter(r => r.status === 'fail');
const report = {
    project: { path: process.cwd(), ...JSON.parse(fs.readFileSync('package.json', 'utf8')) },
    executedAt: new Date().toISOString(), environment: { node: process.version, platform: process.platform, tsc: process.env.JUMP_ADAPTER_TSC_VERSION },
    method: 'Existing Creator tsc compiles real selected TS implementation; Node executes it using test-only cc/DOM event/node/renderer mocks. InputAdapter/PlatformPool rules are not copied into mocks.',
    commands: { compile: process.env.JUMP_ADAPTER_COMPILE_COMMAND, execute: process.env.JUMP_ADAPTER_EXECUTE_COMMAND },
    sourceHashes, preCompileHashes, sourceStableDuringCompile, compiledHashes, results, summary: { cases: results.length, passed: results.length - failed.length, failed: failed.length, assertions },
    firstFailure: failed[0] || null,
    suggestions: failed.length ? ['PlatformView.resetForPool clears root rotation but omits Visual rotation; restore Visual baseline rotation (or captured prefab transform), then rerun P06. Implementation remains untouched by this validator.'] : [],
    limitations: ['Compilation uses minimal mock cc declarations; not a Creator host engine API typecheck.', 'No Creator Preview, actual device touch, real UI camera-coordinate hitTest, imported GLB appearance, GPU material-instance disposal or engine Tween execution tested.', 'Mock sink acceptance is controlled to simulate airborne rejection; gameplay phase correctness belongs to separate core tests.', 'Only PlatformView unschedule invocation is verified; arbitrary callbacks/components on descendants are not covered.', 'Static README/phase documents say phase02 not implemented while selected implementations exist; parent must reconcile final stage status.'],
};
console.log(JSON.stringify(report.summary));
if (process.argv.includes('--evidence')) {
    fs.mkdirSync('docs/验收证据', { recursive: true });
    const evidence = process.env.JUMP_ADAPTER_FILTER ? 'docs/验收证据/阶段02平台回收复验.json' : 'docs/验收证据/阶段02适配测试.json';
    fs.writeFileSync(evidence, JSON.stringify(report, null, 2) + '\n');
}
process.exitCode = failed.length || !sourceStableDuringCompile ? 1 : 0;
