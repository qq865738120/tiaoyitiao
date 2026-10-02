import { _decorator, Component, Prefab, Texture2D, Node, Label, TTFFont, KeyCode, sys, Tween, profiler } from 'cc';
import { DEBUG } from 'cc/env';
import { createGameConfig, FixedTickClock, JumpGameplay, sampleJump, ReplayInput, FootPosition, PlatformSpec } from '../core';
import { InputAdapter } from '../adapters/InputAdapter';
import { AvatarView } from '../view/AvatarView';
import { PlatformPool } from '../view/PlatformPool';
import { CameraFollow } from '../view/CameraFollow';
import { JumpUI } from '../view/JumpUI';
import { StorageAdapter } from '../adapters/StorageAdapter';
const { ccclass, property } = _decorator;

/** Phase03 composition root. Runtime presentation consumes immutable pure-rule snapshots. */
@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property(Prefab) avatarPrefab: Prefab | null = null;
    @property(Prefab) currentPlatformPrefab: Prefab | null = null;
    @property(Prefab) targetPlatformPrefab: Prefab | null = null;
    @property(Prefab) circlePlatformPrefab: Prefab | null = null;
    @property(Texture2D) backgroundTexture: Texture2D | null = null;
    @property([Prefab]) coreModelPrefabs: Prefab[] = [];
    @property(Node) world: Node | null = null;
    @property(Node) avatar: Node | null = null;
    @property(Node) worldCamera: Node | null = null;
    @property(Node) uiRoot: Node | null = null;
    @property(Label) scoreLabel: Label | null = null;
    @property(Label) statusLabel: Label | null = null;
    @property(Label) pauseControl: Label | null = null;
    @property(Label) restartControl: Label | null = null;
    @property(TTFFont) numberFont: TTFFont | null = null;
    @property(JumpUI) singlePlayerUI: JumpUI | null = null;
    private storage: StorageAdapter | null = null;
    private transitionSeconds = 0;
    private uiGeneration = 0;
    private finalRun = -1;
    private fixtureFail = false;
    private restartCount = 0;
    readonly config = createGameConfig();
    private readonly gameplay = new JumpGameplay(this.config);
    private readonly clock = new FixedTickClock(this.config);
    private adapter: InputAdapter | null = null;
    private pool: PlatformPool | null = null;
    private camera: CameraFollow | null = null;
    private avatarView: AvatarView | null = null;
    private previousFoot: FootPosition = { x: 0, y: 0, z: 0 };
    private inputs: ReplayInput[] = [];
    private counts = { jumps: 0, scored: 0, failed: 0 };
    private autoReplay = false;
    private autoHoldTicks = 0;
    private initialized = false;
    private recenterJump = 0;
    private readonly calibrationPlatforms: Node[] = [];

    start(): void {
        if (!this.world || !this.avatar || !this.worldCamera || !this.uiRoot || !this.currentPlatformPrefab ||
            !this.targetPlatformPrefab || !this.circlePlatformPrefab || !this.backgroundTexture ||
            this.coreModelPrefabs.length !== this.config.modelKeys.length || !this.numberFont || !this.singlePlayerUI) throw new Error('JumpMain phase03 references incomplete');
        this.avatarView = this.avatar.getComponent(AvatarView);
        if (!this.avatarView) throw new Error('stage01 AvatarView missing');
        // Keep editable stage01 calibration instances; the runtime pool owns playable platforms.
        for (const child of this.world.children) if (child !== this.avatar && child.getComponent('PlatformView')) {
            this.calibrationPlatforms.push(child); child.active = false;
        }
        this.pool = new PlatformPool(this.world, this.currentPlatformPrefab, this.targetPlatformPrefab, this.circlePlatformPrefab,
            this.coreModelPrefabs, this.config.modelKeys, this.config.platformPoolLimit);
        this.gameplay.start();
        this.initialPlatforms.push(this.gameplay.current!, this.gameplay.target!);
        this.camera = new CameraFollow(this.worldCamera, Math.ceil(this.config.cameraMoveSeconds / this.config.fixedStepSeconds), this.gameplay.current!, this.gameplay.target!);
        this.adapter = new InputAdapter({
            press: source => this.press(source), release: source => { this.release(source); },
            cancel: (source, reason) => { this.record('cancel', source || 'system'); this.gameplay.cancel(source, reason); },
            pause: reason => this.pause(reason), command: key => this.command(key),
            blocked: () => this.transitionSeconds > 0 || this.autoReplay || ['menu', 'paused', 'gameover'].indexOf(this.gameplay.state.phase) >= 0,
        }, this.uiRoot);
        this.adapter.bind();
        this.storage = new StorageAdapter(sys.localStorage);
        this.singlePlayerUI.connect({ start: () => this.activateRun(), pause: () => this.uiAction(() => this.pause('player')),
            resume: () => this.uiAction(() => this.resume()), restart: () => this.activateRun(), home: () => this.uiAction(() => this.goHome()) });
        profiler.hideStats();
        this.initialized = true; this.goHome();
    }
    onEnable(): void { if (this.initialized) this.adapter?.bind(); }
    onDisable(): void { this.adapter?.unbind(); if (this.initialized) this.pause('disabled'); }
    onDestroy(): void {
        this.adapter?.unbind(); this.pool?.destroy();
        this.singlePlayerUI?.disconnect();
        this.unscheduleAllCallbacks();
        const bridge = this.bridge();
        for (const key of ['jump', 'jumpPlatforms', 'jumpResults', 'jumpInputs', 'jumpView', 'jumpUI']) bridge?.clearState?.(key);
    }
    update(delta: number): void {
        if (!this.initialized) return;
        if (this.transitionSeconds > 0) {
            this.transitionSeconds = Math.max(0, this.transitionSeconds - delta);
            if (this.transitionSeconds === 0) this.singlePlayerUI?.setLocked(false);
        }
        const frame = this.clock.advanceFrame(delta, () => {
            this.previousFoot = this.gameplay.foot;
            if (this.autoReplay) this.replayInput();
            this.gameplay.step(); this.consumeEvents();
        });
        if (frame.freezeReason === 'backlog' && this.gameplay.state.phase !== 'paused') this.pause('simulation-backlog');
        this.render(frame.interpolationAlpha); this.publish();
    }
    private press(source: string): boolean { this.record('press', source); return this.gameplay.press(source); }
    private release(source: string): void { this.record('release', source); this.gameplay.release(source); this.consumeEvents(); }
    private pause(reason: string): void {
        if (!this.gameplay.pause(reason)) return;
        this.record('pause', reason); this.clock.pause(); this.adapter?.reset(); this.consumeEvents();
        this.render(0); this.publish();
    }
    private resume(): void {
        if (!this.gameplay.resume()) return;
        this.record('resume', 'control'); this.clock.resume(); this.consumeEvents();
    }
    private togglePause(): void { if (this.gameplay.state.phase === 'paused') this.resume(); else this.pause('player'); }
    private uiAction(action: () => void): void {
        if (this.transitionSeconds > 0) return;
        this.lockUI(); action(); this.render(0); this.publish();
    }
    private lockUI(): void { this.uiGeneration++; this.transitionSeconds = 0.18; this.singlePlayerUI?.setLocked(true); }
    private activateRun(): void { this.uiAction(() => this.newRun()); }
    private cleanupRun(): void {
        this.uiGeneration++; this.unscheduleAllCallbacks(); this.autoReplay = false; this.fixtureFail = false;
        this.adapter?.reset(); this.pool?.clear();
        if (this.avatarView?.visual) Tween.stopAllByTarget(this.avatarView.visual);
        this.inputs = []; this.counts = { jumps: 0, scored: 0, failed: 0 }; this.recenterJump = 0;
    }
    private goHome(): void {
        this.cleanupRun(); this.gameplay.home(); this.clock.reset(); this.clock.pause();
        // Restore saved editable calibration nodes, not a second game/controller.
        for (const child of this.calibrationPlatforms) child.active = child.name !== 'PlatformCircle03';
        this.avatarView?.render({ x: 0, y: this.config.platformHeight, z: 0 }, 0, null, this.config.platformHeight);
        this.camera?.reset(this.initialPlatforms[0], this.initialPlatforms[1]);
        this.render(0); this.publish();
    }
    private readonly initialPlatforms: PlatformSpec[] = [];
    private newRun(): void {
        this.cleanupRun(); this.clock.reset();
        this.restartCount++;
        for (const child of this.calibrationPlatforms) child.active = false;
        this.gameplay.start(this.config.seed); this.previousFoot = this.gameplay.foot;
        this.camera?.reset(this.gameplay.current!, this.gameplay.target!);
        this.pool?.sync(this.gameplay.platforms); this.consumeEvents(); this.render(0); this.publish();
    }
    private command(key: KeyCode): void {
        if (key === KeyCode.KEY_P) this.uiAction(() => this.togglePause());
        else if (key === KeyCode.KEY_R && this.gameplay.state.phase !== 'menu') this.activateRun();
        else if (key === KeyCode.ESCAPE) this.uiAction(() => this.goHome());
        else if (DEBUG && key === KeyCode.F8) { this.storage?.reset(); this.render(0); this.publish(); }
        else if (DEBUG && (key === KeyCode.F9 || key === KeyCode.F10)) {
            this.uiAction(() => { this.newRun(); this.autoReplay = true; this.fixtureFail = key === KeyCode.F10; this.publish(); });
        }
    }
    /** Developer fixture uses only ordinary press/release with integer ticks; no position/score setters. */
    private replayInput(): void {
        if (this.gameplay.state.phase === 'ready') {
            if (this.fixtureFail && this.counts.scored >= 1) {
                this.autoHoldTicks = Math.ceil(this.config.minChargeSeconds / this.config.fixedStepSeconds);
                this.press('replay'); return;
            }
            if (this.counts.scored >= 24) {
                this.autoReplay = false; this.pause('replay-complete'); this.bridge()?.checkpoint?.('phase02-24-jumps'); return;
            }
            const foot = this.gameplay.foot, target = this.gameplay.target!;
            const distance = Math.hypot(target.centerXZ.x - foot.x, target.centerXZ.z - foot.z);
            const seconds = this.config.minChargeSeconds + (distance - this.config.minJumpDistance) /
                (this.config.maxJumpDistance - this.config.minJumpDistance) * (this.config.maxChargeSeconds - this.config.minChargeSeconds);
            this.autoHoldTicks = Math.round(seconds / this.config.fixedStepSeconds); this.press('replay');
        } else if (this.gameplay.state.phase === 'charging' &&
            this.gameplay.state.tick - this.gameplay.state.chargeStartTick! >= this.autoHoldTicks) this.release('replay');
    }
    private consumeEvents(): void {
        for (const event of this.gameplay.drainEvents()) {
            if (event.runId !== this.gameplay.state.runId) continue;
            if (event.type === 'Jump') this.counts.jumps++;
            else if (event.type === 'Scored') this.counts.scored++;
            else if (event.type === 'Failed') {
                this.counts.failed++; this.autoReplay = false;
                if (this.finalRun !== event.runId) { this.finalRun = event.runId; this.storage?.record(this.gameplay.state.score); this.lockUI(); }
                this.bridge()?.checkpoint?.('phase03-gameover');
            }
        }
        if (this.gameplay.state.phase === 'recentering' && this.gameplay.state.jumpId !== this.recenterJump) {
            const landed = this.gameplay.target!, next = this.gameplay.platforms.find(s => s.id === landed.id + 1)!;
            this.camera?.begin(this.gameplay.state.tick, landed, next); this.recenterJump = this.gameplay.state.jumpId!;
        }
        this.pool?.sync(this.gameplay.platforms);
    }
    private render(alpha: number): void {
        const state = this.gameplay.state;
        this.singlePlayerUI?.render(state.phase, state.score, this.storage?.best || 0, this.counts.jumps === 0, this.storage?.lastError || null);
        if (state.phase === 'menu') return;
        const phase = state.phase === 'paused' ? state.resumePhase : state.phase;
        let foot = this.gameplay.foot;
        let flight: number | null = null;
        if (phase === 'airborne' && state.jumpPlan) {
            const elapsed = Math.max(0, (state.tick - state.jumpPlan.startTick - 1 + alpha) * this.config.fixedStepSeconds);
            foot = sampleJump(state.jumpPlan, elapsed, this.config); flight = elapsed / state.jumpPlan.flightTime;
        } else if (phase === 'falling' && state.jumpPlan) {
            const elapsed = (state.tick - state.jumpPlan.startTick) * this.config.fixedStepSeconds;
            foot = { ...foot, y: state.jumpPlan.startFoot.y + this.config.verticalVelocity * elapsed - this.config.gravity * elapsed * elapsed / 2 };
        } else if (state.phase !== 'paused') {
            const a = this.previousFoot, b = foot;
            foot = { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha, z: a.z + (b.z - a.z) * alpha };
        }
        const q = this.gameplay.holdSeconds / this.config.maxChargeSeconds;
        this.avatarView?.render(foot, q, flight, this.gameplay.current?.topY || this.config.platformHeight);
        this.camera?.render(state.tick, state.phase === 'paused' ? 0 : alpha);

    }
    private record(type: ReplayInput['type'], source: string): void { this.inputs.push({ tick: this.gameplay.state.tick, type, source }); }
    private bridge(): any { return (globalThis as any).__GAME_AGENT_TEST__; }
    private publish(): void {
        this.bridge()?.setState?.('jump', {
            configVersion: this.config.configVersion, ...this.gameplay.state,
            foot: this.gameplay.foot, holdSeconds: this.gameplay.holdSeconds,
            poolCount: this.pool?.count || 0, counts: { ...this.counts }, autoReplay: this.autoReplay,
        });
        this.bridge()?.setState?.('jumpUI', { page: this.singlePlayerUI?.currentPage, best: this.storage?.best || 0,
            storageKey: this.storage?.key, storageError: this.storage?.lastError, locked: this.transitionSeconds > 0,
            generation: this.uiGeneration, restartCount: this.restartCount, uiListeners: this.singlePlayerUI?.listenerCount,
            bootstrapCount: this.node.scene?.getComponentsInChildren(GameBootstrap).length });
        this.bridge()?.setState?.('jumpPlatforms', this.gameplay.platforms);
        this.bridge()?.setState?.('jumpResults', this.gameplay.results.slice(-32));
        this.bridge()?.setState?.('jumpInputs', this.inputs.slice(-32));
        this.bridge()?.setState?.('jumpView', {
            cameraPosition: this.worldCamera ? { x: this.worldCamera.position.x, y: this.worldCamera.position.y, z: this.worldCamera.position.z } : null,
            renderedFoot: this.avatar ? { x: this.avatar.position.x, y: this.avatar.position.y, z: this.avatar.position.z } : null,
            visualScaleY: this.avatarView?.visual?.scale.y,
        });
    }
}
