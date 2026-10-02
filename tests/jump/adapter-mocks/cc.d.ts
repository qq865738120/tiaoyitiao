// Test-only minimal cc declarations. Not a substitute for Creator engine typecheck.
declare module 'cc' {
    export const _decorator: { ccclass: (name: string) => ClassDecorator; property: any };
    export class Component { node: Node; unscheduleAllCallbacks(): void; getComponent<T>(ctor: new (...args: any[]) => T): T | null; }
    export class Node {
        name: string; active: boolean; activeInHierarchy: boolean; children: Node[];
        constructor(name?: string);
        addChild(node: Node): void; removeFromParent(): void; destroy(): void;
        getComponent<T>(ctor: new (...args: any[]) => T): T | null;
        getComponentsInChildren<T>(ctor: new (...args: any[]) => T): T[];
        setPosition(x: number, y: number, z: number): void;
        setScale(x: number, y: number, z: number): void;
        setRotationFromEuler(x: number, y: number, z: number): void;
    }
    export class Prefab {}
    export class Material {}
    export class MeshRenderer extends Component { sharedMaterials: (Material | null)[]; setSharedMaterial(material: Material | null, index: number): void; }
    export class Tween { static stopAllByTarget(target: Node): void; }
    export function instantiate(prefab: Prefab): Node;
    export class Vec2 { x: number; y: number; }
    export class UITransform extends Component { hitTest(point: Vec2): boolean; }
    export class Button extends Component { enabled: boolean; }
    export class EditBox extends Component { enabled: boolean; }
    export class BlockInputEvents extends Component { enabled: boolean; }
    export enum KeyCode { SPACE = 32, KEY_P = 80, KEY_R = 82 }
    export class EventKeyboard { keyCode: KeyCode; }
    export class EventMouse { getButton(): number; getLocation(): Vec2; }
    export class EventTouch { getID(): number; getLocation(): Vec2; }
    export class Input { static EventType: { KEY_DOWN: string; KEY_UP: string; MOUSE_DOWN: string; MOUSE_UP: string; TOUCH_START: string; TOUCH_END: string; TOUCH_CANCEL: string }; }
    export const input: { on(type: string, fn: Function, ctx: unknown): void; off(type: string, fn: Function, ctx: unknown): void; };
    export class Game { static EVENT_HIDE: string; }
    export const game: typeof input;
}
