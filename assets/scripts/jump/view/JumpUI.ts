import { _decorator, Component, Node, Label, Button, Graphics, UITransform, Color, TTFFont } from 'cc';
import { Phase } from '../core';
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
    private bindings: Array<{ button: Button; callback: () => void }> = [];
    private page = '';
    private shadeSizes = new Map<Node, string>();
    connect(actions: UIActions): void {
        this.disconnect();
        if (!this.homePage || !this.hudPage || !this.pausePage || !this.resultPage || !this.numberFont ||
            !this.score || !this.resultScore || !this.bestScore ||
            !this.play || !this.pauseButton || !this.resumeButton || !this.pauseRestart || !this.pauseHome || !this.replay || !this.home)
            throw new Error('JumpUI phase03 references incomplete');
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
    }
    onDestroy(): void { this.disconnect(); }
    setLocked(locked: boolean): void { for (const { button } of this.bindings) button.interactable = !locked; }
    render(phase: Phase, score: number, best: number, firstJump: boolean, storageError: string | null): void {
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
