import { _decorator, Component, Node, Label, Button, Graphics, UITransform, Color, TTFFont, Camera, Vec3 } from 'cc';
import { Phase, DomainEvent, FootPosition } from '../core';
import { FeedbackTimeline } from './FeedbackTimeline';
const { ccclass, property } = _decorator;
export interface UIActions { start(): void; pause(): void; resume(): void; restart(): void; home(): void; }

/** Presentation only: page is derived from the single gameplay phase. No rule/controller copy. */
@ccclass('JumpUI')
export class JumpUI extends Component {
    @property(Node) homePage: Node | null = null;
    @property(Node) hudPage: Node | null = null;
    @property(Node) pausePage: Node | null = null;
    @property(Node) resultPage: Node | null = null;
    @property(Label) score: Label | null = null;
    @property(Label) hint: Label | null = null;
    @property(Label) resultScore: Label | null = null;
    @property(Label) bestScore: Label | null = null;
    @property(Label) storageNotice: Label | null = null;
    @property(TTFFont) numberFont: TTFFont | null = null;
    @property(Button) play: Button | null = null;
    @property(Button) pauseButton: Button | null = null;
    @property(Button) resumeButton: Button | null = null;
    @property(Button) pauseRestart: Button | null = null;
    @property(Button) pauseHome: Button | null = null;
    @property(Button) replay: Button | null = null;
    @property(Button) home: Button | null = null;
    // Optional editor-owned HUD child with Graphics + UITransform; never created at runtime.
    @property(Graphics) centerFlash: Graphics | null = null;
    @property(Camera) worldCamera: Camera | null = null;
    private readonly feedback = new FeedbackTimeline();
    private centerFoot: Vec3 | null = null;
    private scoreBase: Vec3 | null = null;
    private readonly projected = new Vec3();
    private bindings: Array<{ button: Button; callback: () => void }> = [];
    private page = '';
    private shadeSizes = new Map<Node, string>();
    connect(actions: UIActions): void {
        this.disconnect();
        if (!this.homePage || !this.hudPage || !this.pausePage || !this.resultPage || !this.numberFont ||
            !this.score || !this.resultScore || !this.bestScore ||
            !this.play || !this.pauseButton || !this.resumeButton || !this.pauseRestart || !this.pauseHome || !this.replay || !this.home)
            throw new Error('JumpUI phase03 references incomplete');
        this.scoreBase = this.score.node.scale.clone();
        for (const label of [this.score, this.resultScore, this.bestScore]) {
            label.useSystemFont = false; label.font = this.numberFont;
        }
        const pairs: Array<[Button, () => void]> = [[this.play, actions.start], [this.pauseButton, actions.pause],
            [this.resumeButton, actions.resume], [this.pauseRestart, actions.restart], [this.pauseHome, actions.home],
            [this.replay, actions.restart], [this.home, actions.home]];
        this.bindings = pairs.map(([button, callback]) => {
            button.node.on(Button.EventType.CLICK, callback, this); return { button, callback };
        });
    }
    disconnect(): void {
        for (const { button, callback } of this.bindings) button.node.off(Button.EventType.CLICK, callback, this);
        this.bindings = [];
        this.clearFeedback();
    }
    consume(event: DomainEvent, currentRunId: number, centerFoot?: FootPosition): void {
        if (!this.feedback.consume(event, currentRunId)) return;
        if (event.type === 'Started' || event.type === 'Returned' || event.type === 'Failed') {
            this.centerFoot = null; this.restoreScore(); this.centerFlash?.clear();
        } else if (event.type === 'Scored') {
            this.centerFoot = event.streak > 0 && centerFoot ? new Vec3(centerFoot.x, centerFoot.y, centerFoot.z) : null;
        }
    }
    resetFeedback(runId: number): void {
        this.feedback.reset(runId); this.centerFoot = null; this.restoreScore();
        if (this.centerFlash) { this.centerFlash.clear(); this.centerFlash.node.active = false; }
    }
    clearFeedback(): void { this.resetFeedback(-1); }
    private restoreScore(): void { if (this.score && this.scoreBase) this.score.node.setScale(this.scoreBase); }
    private renderFeedback(seconds: number): void {
        const f = this.feedback.sample(seconds);
        if (this.score && this.scoreBase) this.score.node.setScale(this.scoreBase.x * f.scoreScale, this.scoreBase.y * f.scoreScale, this.scoreBase.z);
        const flash = this.centerFlash;
        if (!flash) return;
        flash.clear();
        const parent = flash.node.parent;
        flash.node.active = !!(f.centerActive && this.centerFoot && this.worldCamera && parent && parent.getComponent(UITransform));
        if (!flash.node.active || !parent || !this.worldCamera || !this.centerFoot) return;
        this.worldCamera.convertToUINode(this.centerFoot, parent, this.projected);
        flash.node.setPosition(this.projected);
        flash.lineWidth = 3;
        flash.strokeColor = new Color(255, 255, 225, Math.round(235 * f.centerAlpha));
        flash.circle(0, 0, f.centerRadius); flash.stroke();
    }
    onDestroy(): void { this.disconnect(); }
    setLocked(locked: boolean): void { for (const { button } of this.bindings) button.interactable = !locked; }
    render(phase: Phase, score: number, best: number, firstJump: boolean, storageError: string | null, simulationSeconds = 0): void {
        this.renderFeedback(simulationSeconds);
        const page = phase === 'menu' ? 'home' : phase === 'paused' ? 'pause' : phase === 'gameover' ? 'result' : 'hud';
        if (page !== this.page) {
            this.page = page;
            if (this.homePage) this.homePage.active = page === 'home';
            if (this.hudPage) this.hudPage.active = page === 'hud';
            if (this.pausePage) this.pausePage.active = page === 'pause';
            if (this.resultPage) this.resultPage.active = page === 'result';
        }
        if (this.score) this.score.string = String(score);
        if (this.resultScore) this.resultScore.string = String(score);
        if (this.bestScore) this.bestScore.string = String(best);
        if (this.hint) this.hint.node.active = firstJump;
        if (this.storageNotice) this.storageNotice.string = storageError ? '最高分暂未保存，本次仍可继续' : '';
        for (const node of [this.homePage, this.pausePage, this.resultPage]) {
            if (!node?.activeInHierarchy) continue;
            const shade = node.getChildByName('Shade'), transform = shade?.getComponent(UITransform), graphics = shade?.getComponent(Graphics);
            if (!shade || !transform || !graphics) continue;
            const size = `${transform.width}:${transform.height}`;
            if (this.shadeSizes.get(shade) === size) continue;
            graphics.clear(); graphics.fillColor = new Color(25, 27, 31, node === this.homePage ? 75 : 175);
            graphics.rect(-transform.width / 2, -transform.height / 2, transform.width, transform.height); graphics.fill();
            this.shadeSizes.set(shade, size);
        }
    }
    get currentPage(): string { return this.page; }
    get listenerCount(): number { return this.bindings.length; }
}
