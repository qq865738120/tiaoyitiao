'use strict';
// Independent, deterministic model of Creator 3.8.8 AudioSource's load queue + clip identity check.
// Playback gate models suspended Web Audio's queued play; it is not an engine/browser execution.
const nodes = new Set(), sources = new Set(), players = new Set(), loads = [], deferred = [], plays = [];
const stats = { discardedLoads: 0, audibleStarts: 0, createdSources: 0, destroyedSources: 0, maxAttached: 0 };
class AudioClip { constructor(name = '') { this.name = name; } }
class Node {
    constructor(name = '') { this.name = name; this.active = true; this.children = []; this.parent = null; this.listeners = new Map(); this.components = []; this.dead = false; nodes.add(this); }
    addChild(node) { node.removeFromParent(); node.parent = this; this.children.push(node); }
    removeFromParent() { if (this.parent) { this.parent.children = this.parent.children.filter(n => n !== this); this.parent = null; } }
    addComponent(Type) { const source = new Type(); source.node = this; this.components.push(source); return source; }
    on(type, fn) { const list = this.listeners.get(type) || []; list.push(fn); this.listeners.set(type, list); }
    off(type, fn) { this.listeners.set(type, (this.listeners.get(type) || []).filter(f => f !== fn)); }
    emit(type, ...args) { for (const fn of [...(this.listeners.get(type) || [])]) fn(...args); }
    destroy() { if (this.dead) return false; this.dead = true; deferred.push(this); return true; }
}
class Player {
    constructor(clip) { this.clip = clip; this.volume = 1; this.loop = false; this.playing = false; this.destroyed = false; this.ops = []; players.add(this); }
    play() { this.ops.push('play'); if (!plays.includes(this)) plays.push(this); }
    stop() { this.ops.push('stop'); if (!plays.includes(this)) plays.push(this); }
    destroy() { this.destroyed = true; this.playing = false; players.delete(this); }
}
class AudioSource {
    static EventType = { ENDED: 'ended', STARTED: 'started' };
    constructor() { this._clip = null; this.lastClip = null; this.loaded = false; this.player = null; this.queue = []; this._volume = 1; this._loop = false; this.playOnAwake = true; sources.add(this); ++stats.createdSources; }
    set volume(value) { this._volume = value; if (this.player) this.player.volume = value; }
    get volume() { return this._volume; }
    set loop(value) { this._loop = value; if (this.player) this.player.loop = value; }
    get loop() { return this._loop; }
    set clip(value) {
        if (value === this._clip) return;
        this._clip = value;
        if (value === this.lastClip) return;
        this.lastClip = value;
        if (!value) { if (this.player) this.player.destroy(); this.player = null; return; }
        this.loaded = false; this.queue = [];
        loads.push({ source: this, clip: value });
    }
    get clip() { return this._clip; }
    play() { if (!this.loaded && this.clip) { this.queue.push('play'); return; } if (this.player) this.player.play(); }
    stop() { if (!this.loaded && this.clip) { this.queue.push('stop'); return; } if (this.player) this.player.stop(); }
    destroy() { this.stop(); this.clip = null; sources.delete(this); ++stats.destroyedSources; }
}
function resolveLoad(index = 0) {
    const task = loads.splice(index, 1)[0]; if (!task) return;
    const player = new Player(task.clip), source = task.source;
    if (source.lastClip !== task.clip) { player.destroy(); ++stats.discardedLoads; return; }
    source.loaded = true; if (source.player) source.player.destroy(); source.player = player;
    player.volume = source.volume; player.loop = source.loop;
    const ops = source.queue; source.queue = []; for (const op of ops) source[op]();
}
function flushPlayback() {
    while (plays.length) {
        const player = plays.shift();
        if (player.destroyed) { player.ops = []; continue; }
        for (const op of player.ops) {
            if (op === 'play') { player.playing = true; if (player.volume > 0) ++stats.audibleStarts; }
            else player.playing = false;
        }
        player.ops = [];
    }
}
function flushFrame() {
    while (deferred.length) {
        const node = deferred.shift(); for (const child of [...node.children]) child.destroy();
        for (const source of node.components) source.destroy();
        node.listeners.clear(); node.removeFromParent(); nodes.delete(node);
    }
}
function settle() { while (loads.length) resolveLoad(); flushPlayback(); flushFrame(); }
function metrics() {
    const attached = [...sources].filter(s => !!s.node.parent && !s.node.dead).length;
    stats.maxAttached = Math.max(stats.maxAttached, attached);
    return { ...stats, attached, sources: sources.size, players: players.size, pendingLoads: loads.length,
        pendingDestroy: deferred.length, listeners: [...nodes].reduce((n, node) => n + [...node.listeners.values()].reduce((a, list) => a + list.length, 0), 0),
        audiblePlayers: [...players].filter(p => p.playing && p.volume > 0).length };
}
function clear() {
    nodes.clear(); sources.clear(); players.clear(); loads.length = deferred.length = plays.length = 0;
    Object.assign(stats, { discardedLoads: 0, audibleStarts: 0, createdSources: 0, destroyedSources: 0, maxAttached: 0 });
}
module.exports = { AudioClip, Node, AudioSource, __audio: { sources, resolveLoad, flushPlayback, flushFrame, settle, metrics, clear } };
