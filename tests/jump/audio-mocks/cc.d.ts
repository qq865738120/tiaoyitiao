declare module 'cc' {
    export class AudioClip { constructor(name?: string); name: string; }
    export class Node {
        constructor(name?: string); name: string; active: boolean; children: Node[];
        addChild(node: Node): void; removeFromParent(): void; destroy(): boolean;
        addComponent(type: typeof AudioSource): AudioSource;
        on(type: string, callback: (...args: any[]) => void): void;
        off(type: string, callback: (...args: any[]) => void): void;
        emit(type: string, ...args: any[]): void;
    }
    export class AudioSource {
        static EventType: { ENDED: string; STARTED: string };
        node: Node; clip: AudioClip | null; loop: boolean; volume: number; playOnAwake: boolean;
        play(): void; stop(): void;
    }
}
