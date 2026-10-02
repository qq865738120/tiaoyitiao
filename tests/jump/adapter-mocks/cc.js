'use strict';
// Engine boundary only: event registration, node transforms, renderer setter and Prefab factories.
// Gameplay/input/pool rules are executed exclusively from compiled project implementations.
class Bus {
    constructor() { this.listeners = []; this.onCalls = 0; this.offCalls = 0; }
    on(type, fn, ctx) { this.onCalls++; this.listeners.push({ type, fn, ctx }); }
    off(type, fn, ctx) { this.offCalls++; this.listeners = this.listeners.filter(e => !(e.type === type && e.fn === fn && e.ctx === ctx)); }
    emit(type, event) { for (const e of [...this.listeners]) if (e.type === type) e.fn.call(e.ctx, event); }
    addEventListener(type, fn) { this.on(type, fn, undefined); }
    removeEventListener(type, fn) { this.off(type, fn, undefined); }
    reset() { this.listeners = []; this.onCalls = 0; this.offCalls = 0; }
}
class Component {
    constructor() { this.unscheduled = 0; }
    unscheduleAllCallbacks() { this.unscheduled++; }
    getComponent(ctor) { return this.node.getComponent(ctor); }
}
class Node {
    constructor(name = '') { this.name = name; this.active = true; this.parent = null; this.children = []; this.components = []; this.position = [0, 0, 0]; this.scale = [1, 1, 1]; this.euler = [0, 0, 0]; this.destroyed = false; }
    get activeInHierarchy() { return this.active && (!this.parent || this.parent.activeInHierarchy); }
    addChild(node) { node.removeFromParent(); node.parent = this; this.children.push(node); }
    removeFromParent() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); this.parent = null; }
    addComponent(component) { component.node = this; this.components.push(component); return component; }
    getComponent(ctor) { return this.components.find(c => c instanceof ctor) || null; }
    getComponentsInChildren(ctor) { return [...this.components.filter(c => c instanceof ctor), ...this.children.flatMap(n => n.getComponentsInChildren(ctor))]; }
    setPosition(x, y, z) { this.position = [x, y, z]; }
    setScale(x, y, z) { this.scale = [x, y, z]; }
    setRotationFromEuler(x, y, z) { this.euler = [x, y, z]; }
    destroy() { this.destroyed = true; this.active = false; this.children.forEach(n => n.destroy()); this.removeFromParent(); }
}
class Prefab { constructor(factory) { this.factory = factory; this.instances = []; } }
class Material { constructor(name = '') { this.name = name; } }
class MeshRenderer extends Component {
    constructor(materials = []) { super(); this.sharedMaterials = [...materials]; this.restores = []; }
    setSharedMaterial(material, index) { this.restores.push({ material, index }); this.sharedMaterials[index] = material; }
}
const stopped = [];
class Tween { static stopAllByTarget(node) { stopped.push(node); } }
class UITransform extends Component { constructor(hit = true) { super(); this.hit = hit; } hitTest() { return this.hit; } }
class Button extends Component { constructor() { super(); this.enabled = true; } }
class EditBox extends Button {}
class BlockInputEvents extends Button {}
const property = (...args) => { if (args.length >= 2) return; return () => {}; };
const input = new Bus(); const game = new Bus();
const Input = { EventType: { KEY_DOWN: 'key-down', KEY_UP: 'key-up', MOUSE_DOWN: 'mouse-down', MOUSE_UP: 'mouse-up', TOUCH_START: 'touch-start', TOUCH_END: 'touch-end', TOUCH_CANCEL: 'touch-cancel' } };
module.exports = { Bus, Component, Node, Prefab, Material, MeshRenderer, Tween, stopped, UITransform, Button, EditBox, BlockInputEvents, Vec2: class Vec2 {}, input, game, Input, Game: { EVENT_HIDE: 'hide' }, KeyCode: { SPACE: 32, KEY_P: 80, KEY_R: 82 }, _decorator: { ccclass: () => ctor => ctor, property }, instantiate(prefab) { const node = prefab.factory(); prefab.instances.push(node); return node; } };
