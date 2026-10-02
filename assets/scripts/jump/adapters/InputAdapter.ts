import { input, Input, EventKeyboard, EventMouse, EventTouch, KeyCode, game, Game, Node, UITransform, Button, EditBox, BlockInputEvents, Vec2 } from 'cc';

export interface InputSink {
    press(source: string): boolean;
    release(source: string): void;
    cancel(source?: string, reason?: string): void;
    pause(reason: string): void;
    command(key: KeyCode): void;
    blocked(): boolean;
}

/** The physical-down set is independent of gameplay owner; rejected busy inputs never become buffered presses. */
export class InputAdapter {
    private readonly down = new Set<string>();
    private owner: string | null = null;
    private bound = false;
    constructor(private readonly sink: InputSink, private readonly ui: Node) {}
    bind(): void {
        if (this.bound) return;
        this.bound = true;
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);
        input.on(Input.EventType.KEY_UP, this.keyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.mouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.mouseUp, this);
        input.on(Input.EventType.TOUCH_START, this.touchDown, this);
        input.on(Input.EventType.TOUCH_END, this.touchUp, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.on(Game.EVENT_HIDE, this.hide, this);
        if (typeof window !== 'undefined') window.addEventListener('blur', this.blur);
        if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.visibility);
    }
    unbind(): void {
        if (!this.bound) return;
        this.bound = false;
        input.off(Input.EventType.KEY_DOWN, this.keyDown, this);
        input.off(Input.EventType.KEY_UP, this.keyUp, this);
        input.off(Input.EventType.MOUSE_DOWN, this.mouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.mouseUp, this);
        input.off(Input.EventType.TOUCH_START, this.touchDown, this);
        input.off(Input.EventType.TOUCH_END, this.touchUp, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.off(Game.EVENT_HIDE, this.hide, this);
        if (typeof window !== 'undefined') window.removeEventListener('blur', this.blur);
        if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.visibility);
        this.reset(); this.down.clear();
    }
    reset(): void { this.sink.cancel(this.owner || undefined, 'input-reset'); this.owner = null; }
    private begin(source: string, blocked: boolean): void {
        if (this.down.has(source)) return;
        this.down.add(source);
        if (!blocked && !this.sink.blocked() && this.owner === null && this.sink.press(source)) this.owner = source;
    }
    private end(source: string, cancel = false): void {
        this.down.delete(source);
        if (this.owner !== source) return;
        this.owner = null;
        if (cancel) this.sink.cancel(source, 'touch-cancel'); else this.sink.release(source);
    }
    private keyDown(event: EventKeyboard): void {
        if (event.keyCode === KeyCode.SPACE) this.begin('space', this.formFocused());
        else {
            const source = `key:${event.keyCode}`;
            if (!this.down.has(source) && !this.formFocused()) { this.down.add(source); this.sink.command(event.keyCode); }
        }
    }
    private keyUp(event: EventKeyboard): void {
        if (event.keyCode === KeyCode.SPACE) this.end('space'); else this.down.delete(`key:${event.keyCode}`);
    }
    private mouseDown(event: EventMouse): void { if (event.getButton() === 0) this.begin('mouse-left', this.hitUI(event.getLocation())); }
    private mouseUp(event: EventMouse): void { if (event.getButton() === 0) this.end('mouse-left'); }
    private touchDown(event: EventTouch): void { this.begin(`touch:${event.getID()}`, this.hitUI(event.getLocation())); }
    private touchUp(event: EventTouch): void { this.end(`touch:${event.getID()}`); }
    private touchCancel(event: EventTouch): void { this.end(`touch:${event.getID()}`, true); }
    private hitUI(point: Vec2): boolean {
        const nodes = this.ui.getComponentsInChildren(UITransform);
        return nodes.some(ui => ui.node.activeInHierarchy && (
            ui.getComponent(Button)?.enabled || ui.getComponent(EditBox)?.enabled || ui.getComponent(BlockInputEvents)?.enabled
        ) && ui.hitTest(point));
    }
    private formFocused(): boolean {
        if (typeof document === 'undefined') return false;
        const element = document.activeElement as HTMLElement | null;
        return !!element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable);
    }
    private hide(): void { this.reset(); this.sink.pause('background'); }
    private readonly blur = (): void => { this.reset(); this.sink.pause('blur'); };
    private readonly visibility = (): void => { if (document.hidden) this.hide(); };
}
