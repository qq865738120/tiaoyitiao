import { AudioClip, AudioSource, Node } from 'cc';
import type { DomainEvent } from '../core/types';

export interface AudioClips {
    readonly intro: AudioClip;
    readonly loop: AudioClip;
    readonly success: AudioClip;
    readonly combos: readonly AudioClip[];
    readonly fall: AudioClip;
    readonly start: AudioClip;
}
export const AUDIO_INITIAL_VOLUMES = Object.freeze({ charge: 0.35, success: 0.55, combo: 0.55, fall: 0.5, start: 0.45 });
type Sound = 'intro' | 'loop' | 'success' | 'combo' | 'fall' | 'start';
interface Voice { node: Node; source: AudioSource; sound: Sound; ended: (source: AudioSource) => void; }
export interface AudioSnapshot {
    enabled: boolean; destroyed: boolean; runId: number; generation: number;
    charging: boolean; paused: boolean; terminal: boolean; failed: boolean;
    lastJumpId: number; lastScoredJumpId: number; activeSources: number; endedListeners: number;
    charge: Sound | null; feedback: Sound | null; combo: number | null;
    /** Counts requested plays, NOT audible or successfully started playback. */
    playRequests: number;
}

/** Two exclusive voice slots. Retired sources are never reused (including same-clip ABA). */
export class AudioAdapter {
    private enabled = false;
    private destroyed = false;
    private runId = -1;
    private generation = 0;
    private charging = false;
    private paused = false;
    private terminal = false;
    private failed = false;
    private started = false;
    private lastJumpId = -1;
    private lastScoredJumpId = -1;
    private charge: Voice | null = null;
    private feedback: Voice | null = null;
    private combo: number | null = null;
    private playRequests = 0;
    constructor(private readonly owner: Node, private readonly clips: AudioClips) {
        if (!clips.intro || !clips.loop || !clips.success || !clips.fall || !clips.start ||
            clips.combos.length !== 8 || clips.combos.some(clip => !clip)) {
            throw new Error('AudioAdapter requires 13 core AudioClips (combo1 through combo8 in order)');
        }
    }
    enableFromGesture(): void { if (!this.destroyed) this.enabled = true; }
    reset(runId: number): void {
        if (this.destroyed || !Number.isSafeInteger(runId) || runId < 0 || runId < this.runId) return;
        // Repeated reset for the same run still stops voices but never reopens event deduplication.
        this.stopAll();
        if (runId === this.runId) return;
        this.runId = runId;
        this.paused = this.terminal = this.failed = this.started = false;
        this.lastJumpId = this.lastScoredJumpId = -1;
    }
    consume(event: DomainEvent, currentRunId: number): void {
        if (this.destroyed || !Number.isSafeInteger(currentRunId) || currentRunId < 0 || currentRunId < this.runId) return;
        // Core emits Returned with the OLD runId, then increments state.runId. Sync before filtering.
        if (currentRunId !== this.runId) this.reset(currentRunId);
        if (event.runId !== this.runId) return;
        switch (event.type) {
        case 'Started':
            if (this.started || this.terminal) return;
            this.started = true;
            if (this.enabled) this.playFeedback('start', this.clips.start, AUDIO_INITIAL_VOLUMES.start);
            break;
        case 'Charge':
            if (event.action === 'cancel') this.stopCharge();
            else if (this.enabled && !this.charging && !this.paused && !this.terminal) {
                this.charging = true;
                this.retireFeedback();
                this.playCharge('intro', this.clips.intro, false);
            }
            break;
        case 'Jump':
            if (this.terminal || this.paused || event.jumpId <= this.lastJumpId || event.jumpId <= this.lastScoredJumpId) return;
            this.lastJumpId = event.jumpId;
            this.stopCharge(); break;
        case 'Landed':
            if (event.jumpId < this.lastJumpId || event.jumpId <= this.lastScoredJumpId) return;
            this.stopCharge(); break;
        case 'Paused': this.paused = true; this.stopAll(); break;
        case 'Resumed': this.paused = false; break;
        case 'Returned': this.terminal = true; this.stopAll(); break;
        case 'Scored': {
            if (this.terminal || this.paused || !Number.isSafeInteger(event.jumpId) || event.jumpId <= this.lastScoredJumpId || event.jumpId < this.lastJumpId) return;
            this.lastJumpId = this.lastScoredJumpId = event.jumpId;
            this.stopCharge();
            if (!this.enabled) return;
            const combo = Math.max(0, Math.min(8, Math.floor(event.streak)));
            if (combo > 0) this.playFeedback('combo', this.clips.combos[combo - 1], AUDIO_INITIAL_VOLUMES.combo, combo);
            else this.playFeedback('success', this.clips.success, AUDIO_INITIAL_VOLUMES.success);
            break;
        }
        case 'Failed':
            if (this.failed || this.terminal || event.jumpId < this.lastJumpId || event.jumpId <= this.lastScoredJumpId) return;
            this.failed = true; this.terminal = true;
            this.stopAll();
            if (this.enabled) this.playFeedback('fall', this.clips.fall, AUDIO_INITIAL_VOLUMES.fall);
            break;
        }
    }
    stopAll(): void {
        ++this.generation;
        this.stopCharge();
        this.retireFeedback();
    }
    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.stopAll();
        this.enabled = false;
    }
    snapshot(): AudioSnapshot {
        const count = Number(!!this.charge) + Number(!!this.feedback);
        return { enabled: this.enabled, destroyed: this.destroyed, runId: this.runId, generation: this.generation,
            charging: this.charging, paused: this.paused, terminal: this.terminal, failed: this.failed,
            lastJumpId: this.lastJumpId, lastScoredJumpId: this.lastScoredJumpId, activeSources: count, endedListeners: count,
            charge: this.charge?.sound ?? null, feedback: this.feedback?.sound ?? null, combo: this.combo,
            playRequests: this.playRequests };
    }
    private stopCharge(): void {
        this.charging = false;
        const old = this.charge; this.charge = null;
        this.retire(old);
    }
    private retireFeedback(): void {
        const old = this.feedback; this.feedback = null; this.combo = null;
        this.retire(old);
    }
    private retire(voice: Voice | null): void {
        if (!voice) return;
        voice.node.off(AudioSource.EventType.ENDED, voice.ended);
        // stop() alone only queues STOP while loading/playing. Mute first, invalidate load, NEVER reuse.
        voice.source.volume = 0;
        voice.source.stop();
        voice.source.clip = null;
        voice.node.active = false;
        voice.node.removeFromParent();
        voice.node.destroy(); // Creator defers physical component destruction until the frame boundary.
    }
    private createVoice(sound: Sound, clip: AudioClip, loop: boolean, volume: number,
        onEnded: (voice: Voice) => void): Voice {
        const node = new Node(`JumpAudio-${sound}`);
        node.active = false; // Prevent AudioSource default playOnAwake before configuring it.
        const source = node.addComponent(AudioSource);
        source.playOnAwake = false;
        source.loop = loop; source.volume = volume;
        const voice: Voice = { node, source, sound, ended: endedSource => {
            if (endedSource === source) onEnded(voice);
        } };
        node.on(AudioSource.EventType.ENDED, voice.ended);
        this.owner.addChild(node);
        node.active = true;
        source.clip = clip;
        return voice;
    }
    private playCharge(sound: 'intro' | 'loop', clip: AudioClip, loop: boolean): void {
        const generation = this.generation, runId = this.runId;
        const voice = this.createVoice(sound, clip, loop, AUDIO_INITIAL_VOLUMES.charge, old => {
            if (this.destroyed || this.charge !== old || generation !== this.generation || runId !== this.runId ||
                !this.charging || this.paused || this.terminal) return;
            this.charge = null;
            this.retire(old);
            if (sound === 'intro') this.playCharge('loop', this.clips.loop, true);
            else this.charging = false;
        });
        this.charge = voice;
        ++this.playRequests; voice.source.play();
    }
    private playFeedback(sound: Sound, clip: AudioClip, volume: number, combo: number | null = null): void {
        this.retireFeedback();
        const voice = this.createVoice(sound, clip, false, volume, old => {
            if (this.feedback !== old) return;
            this.feedback = null; this.combo = null;
            this.retire(old);
        });
        this.feedback = voice; this.combo = combo;
        ++this.playRequests; voice.source.play();
    }
}
