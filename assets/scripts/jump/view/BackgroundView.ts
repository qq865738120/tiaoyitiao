import { Sprite, SpriteFrame, Texture2D } from 'cc';
import { DomainEvent } from '../core/types';
import { BackgroundSequence } from './FeedbackTimeline';

/** Owns seven runtime frames only. Source Texture2D assets/import settings are read-only. */
export class BackgroundView {
    private readonly sequence = new BackgroundSequence();
    private frames: SpriteFrame[] = [];
    private readonly original: SpriteFrame | null;
    private disposed = false;
    constructor(private readonly gradient: Sprite, textures: readonly Texture2D[]) {
        if (textures.length !== 7 || textures.some(t => !t)) throw new Error('BackgroundView needs gradient_0..6 Texture2D in numeric order');
        this.original = gradient.spriteFrame;
        this.frames = textures.map(texture => { const frame = new SpriteFrame(); frame.texture = texture; return frame; });
        this.reset(-1);
    }
    reset(runId: number): void { if (!this.disposed) { this.sequence.reset(runId); this.apply(); } }
    consume(event: DomainEvent, currentRunId: number): void {
        if (!this.disposed && this.sequence.consume(event, currentRunId)) this.apply();
    }
    private apply(): void { this.gradient.spriteFrame = this.frames[this.sequence.index]; }
    get index(): number { return this.sequence.index; }
    get ownedFrameCount(): number { return this.frames.length; }
    // Terminal cleanup, idempotent. Use reset() (not clear()) for home/newRun.
    clear(): void {
        if (this.disposed) return;
        this.disposed = true;
        if (this.frames.indexOf(this.gradient.spriteFrame!) >= 0) this.gradient.spriteFrame = this.original;
        for (const frame of this.frames) frame.destroy();
        this.frames = [];
    }
    destroy(): void { this.clear(); }
}
