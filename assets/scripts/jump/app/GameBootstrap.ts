import { _decorator, Component, Prefab, Texture2D, AudioClip, AudioSource, Sprite, director, game, Game, Node, Label, TTFFont, KeyCode, sys, Tween, profiler } from 'cc';
import { DEBUG } from 'cc/env';
import { createGameConfig, FixedTickClock, JumpGameplay, sampleJump, ReplayInput, FootPosition, PlatformSpec } from '../core';
import { InputAdapter } from '../adapters/InputAdapter';
import { AvatarView } from '../view/AvatarView';
import { BackgroundView } from '../view/BackgroundView';
import { PlatformPool } from '../view/PlatformPool';
import { CameraFollow } from '../view/CameraFollow';
import { JumpUI } from '../view/JumpUI';
import { StorageAdapter } from '../adapters/StorageAdapter';
import { AudioAdapter } from '../adapters/AudioAdapter';
const { ccclass, property } = _decorator;

/** Phase04 composition root. Runtime presentation consumes immutable pure-rule snapshots. */
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
    @property(AudioClip) chargeIntro: AudioClip | null = null;
    @property(AudioClip) chargeLoop: AudioClip | null = null;
    @property(AudioClip) successClip: AudioClip | null = null;
    @property([AudioClip]) comboClips: AudioClip[] = [];
    @property(AudioClip) fallClip: AudioClip | null = null;
    @property(AudioClip) startClip: AudioClip | null = null;
    @property(Sprite) gradient: Sprite | null = null;
    @property([Texture2D]) backgroundTextures: Texture2D[] = [];
    private storage: StorageAdapter | null = null;
    private audio: AudioAdapter | null = null;
    private background: BackgroundView | null = null;
    private audioEvents: Array<{ runId: number; jumpId?: number; type: string; feedback: string | null; combo: number | null; playRequests: number }> = [];
    private transitionSeconds = 0;
    private uiGeneration = 0;
    private finalRun = -1;
    private fixtureFail = false;
    private restartCount = 0;
    private capture: 'center' | 'flight' | null = null;
    private captureReady = false;
    private audioPlayed: Array<{ clip: string; volume: number; loop: boolean }> = [];
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
            this.coreModelPrefabs.length !== this.config.modelKeys.length || !this.numberFont || !this.singlePlayerUI ||
            !this.chargeIntro || !this.chargeLoop || !this.successClip || !this.fallClip || !this.startClip || this.comboClips.length !== 8 ||
            !this.gradient || this.backgroundTextures.length !== 7) throw new Error('JumpMain phase04 references incomplete');
        this.audio = new AudioAdapter(this.node, { intro: this.chargeIntro, loop: this.chargeLoop, success: this.successClip,
            combos: this.comboClips, fall: this.fallClip, start: this.startClip });
        this.background = new BackgroundView(this.gradient, this.backgroundTextures);
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
            cancel: (source, reason) => { this.record('cancel', source || 'system'); this.gameplay.cancel(source, reason); this.consumeEvents(); },
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
        this.adapter?.unbind(); this.pool?.destroy(); this.audio?.destroy(); this.background?.destroy(); this.avatarView?.clear();
        this.singlePlayerUI?.disconnect();
        this.unscheduleAllCallbacks();
        const bridge = this.bridge();
        for (const key of ['jump', 'jumpPlatforms', 'jumpResults', 'jumpInputs', 'jumpView', 'jumpUI', 'jumpAudio', 'jumpAudioEngine', 'jumpAudioEvents', 'jumpFeedback']) bridge?.clearState?.(key);
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
        // DEBUG screenshot freezes the renderer only after an actual input-driven event/sample.
        if (DEBUG && (this.captureReady || (this.capture === 'flight' && this.gameplay.state.phase === 'airborne' &&
            this.gameplay.state.jumpPlan && (this.gameplay.state.tick - this.gameplay.state.jumpPlan.startTick) * this.config.fixedStepSeconds >= .20))) {
            this.capture = null; this.captureReady = false; director.pause();
        }
    }
    private press(source: string): boolean {
        if (source !== 'replay') this.audio?.enableFromGesture();
        this.record('press', source); const accepted = this.gameplay.press(source); this.consumeEvents(); return accepted;
    }
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
    private activateRun(): void { this.audio?.enableFromGesture(); this.uiAction(() => this.newRun()); }
    private cleanupRun(): void {
        this.uiGeneration++; this.unscheduleAllCallbacks(); this.autoReplay = false; this.fixtureFail = false;
        this.audio?.stopAll(); this.audioEvents = []; this.audioPlayed = [];
        this.adapter?.reset(); this.pool?.clear(); this.avatarView?.clear(); this.singlePlayerUI?.clearFeedback();
        if (this.avatarView?.visual) Tween.stopAllByTarget(this.avatarView.visual);
        this.inputs = []; this.counts = { jumps: 0, scored: 0, failed: 0 }; this.recenterJump = 0;
    }
    private goHome(): void {
        this.cleanupRun(); this.gameplay.home(); this.audio?.reset(this.gameplay.state.runId); this.background?.reset(this.gameplay.state.runId);
        this.avatarView?.resetFeedback(this.gameplay.state.runId); this.singlePlayerUI?.resetFeedback(this.gameplay.state.runId);
        this.clock.reset(); this.clock.pause();
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
        this.gameplay.start(this.config.seed); this.audio?.reset(this.gameplay.state.runId); this.background?.reset(this.gameplay.state.runId);
        this.avatarView?.resetFeedback(this.gameplay.state.runId); this.singlePlayerUI?.resetFeedback(this.gameplay.state.runId);
        this.previousFoot = this.gameplay.foot;
        this.camera?.reset(this.gameplay.current!, this.gameplay.target!);
        this.pool?.sync(this.gameplay.platforms); this.consumeEvents(); this.render(0); this.publish();
    }
    private command(key: KeyCode): void {
        this.audio?.enableFromGesture();
        if (key === KeyCode.KEY_P) this.uiAction(() => this.togglePause());
        else if (key === KeyCode.KEY_R && this.gameplay.state.phase !== 'menu') this.activateRun();
        else if (key === KeyCode.ESCAPE) this.uiAction(() => this.goHome());
        else if (DEBUG && key === KeyCode.F6) this.capture = 'center';
        else if (DEBUG && key === KeyCode.F5) this.capture = 'flight';
        else if (DEBUG && key === KeyCode.F7) game.emit(Game.EVENT_HIDE);
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
            this.audio?.consume(event, this.gameplay.state.runId);
            if ((event.type === 'Scored' || event.type === 'Failed') && event.runId === this.gameplay.state.runId && this.audio) {
                const audio = this.audio.snapshot();
                this.audioEvents.push({ runId: event.runId, jumpId: event.jumpId, type: event.type,
                    feedback: audio.feedback, combo: audio.combo, playRequests: audio.playRequests });
                this.audioEvents = this.audioEvents.slice(-16);
            }
            if (event.runId !== this.gameplay.state.runId) continue;
            if (DEBUG && this.capture === 'center' && event.type === 'Scored' && event.streak > 0) this.captureReady = true;
            this.avatarView?.consume(event, this.gameplay.state.runId);
            this.singlePlayerUI?.consume(event, this.gameplay.state.runId, this.gameplay.foot);
            this.background?.consume(event, this.gameplay.state.runId);
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
        const seconds = (state.tick + (state.phase === 'paused' ? 0 : alpha)) * this.config.fixedStepSeconds;
        if (state.phase === 'menu') {
            this.singlePlayerUI?.render(state.phase, state.score, this.storage?.best || 0, true, this.storage?.lastError || null, seconds);
            return;
        }
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
        this.avatarView?.render(foot, q, flight, this.gameplay.current?.topY || this.config.platformHeight, seconds, state.jumpPlan?.directionXZ);
        this.camera?.render(state.tick, state.phase === 'paused' ? 0 : alpha);
        this.singlePlayerUI?.render(state.phase, state.score, this.storage?.best || 0, this.counts.jumps === 0, this.storage?.lastError || null, seconds);

    }
    private record(type: ReplayInput['type'], source: string): void { this.inputs.push({ tick: this.gameplay.state.tick, type, source }); }
    private bridge(): any { return (globalThis as any).__GAME_AGENT_TEST__; }
    private publish(): void {
        this.bridge()?.setState?.('jumpFeedback', {
            backgroundIndex: this.background?.index, backgroundFrames: this.background?.ownedFrameCount,
            centerActive: this.singlePlayerUI?.centerFlash?.node.active || false,
            scoreScale: this.singlePlayerUI?.score?.node.scale.x,
            visualScale: this.avatarView?.visual ? { x: this.avatarView.visual.scale.x, y: this.avatarView.visual.scale.y, z: this.avatarView.visual.scale.z } : null,
            visualRotation: this.avatarView?.visual ? { x: this.avatarView.visual.rotation.x, y: this.avatarView.visual.rotation.y, z: this.avatarView.visual.rotation.z, w: this.avatarView.visual.rotation.w } : null,
        });
        this.bridge()?.setState?.('jumpAudio', this.audio?.snapshot());
        this.bridge()?.setState?.('jumpAudioEvents', this.audioEvents);
        const sources = this.node.getComponentsInChildren(AudioSource);
        for (const source of sources) if (source.playing && source.clip && !this.audioPlayed.some(item => item.clip === source.clip!.name)) {
            this.audioPlayed.push({ clip: source.clip.name, volume: source.volume, loop: source.loop });
            this.audioPlayed = this.audioPlayed.slice(-16);
        }
        this.bridge()?.setState?.('jumpAudioEngine', {
            sourceCount: sources.length, playedClips: this.audioPlayed.slice(),
            sources: sources.map(source => ({ name: source.node.name, playing: source.playing, loop: source.loop,
                volume: source.volume, currentTime: source.currentTime, duration: source.duration, clip: source.clip?.name })),
        });
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
