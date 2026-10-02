import { instantiate, Node, Prefab, Tween, MeshRenderer, Material } from 'cc';
import { ModelKey, PlatformSpec } from '../core/types';
import { PlatformView } from './PlatformView';
interface Slot {
    node: Node; view: PlatformView; id: number | null; model: ModelKey | null;
    materials: { renderer: MeshRenderer; shared: (Material | null)[] }[];
}

/** Bounded wrapper pool. Only view instances own state; imported assets stay read-only. */
export class PlatformPool {
    private readonly slots: Slot[] = [];
    constructor(private readonly parent: Node, private readonly rect: Prefab, private readonly rect01: Prefab,
        private readonly circle: Prefab, private readonly models: readonly Prefab[], private readonly keys: readonly ModelKey[], private readonly limit: number) {
        if (models.length !== keys.length) throw new Error('10 explicit model Prefabs required');
    }
    sync(specs: readonly PlatformSpec[]): void {
        if (specs.length > this.limit) throw new Error('platform pool limit exceeded');
        const wanted = new Set(specs.map(s => s.id));
        for (const slot of this.slots) if (slot.id !== null && !wanted.has(slot.id)) this.recycle(slot);
        for (const spec of specs) {
            let slot = this.slots.find(s => s.id === spec.id);
            if (!slot) {
                slot = this.slots.find(s => s.id === null);
                if (!slot) {
                    if (this.slots.length >= this.limit) throw new Error('no free platform slot');
                    const prefab = spec.modelKey === 'block_03' ? this.circle : spec.modelKey === 'block_01' ? this.rect01 : this.rect;
                    const node = instantiate(prefab); this.parent.addChild(node);
                    const view = node.getComponent(PlatformView);
                    if (!view || !view.visual) throw new Error('stage01 PlatformView/Visual missing');
                    slot = { node, view, id: null, model: null, materials: [] }; this.slots.push(slot);
                }
                if (slot.model !== spec.modelKey) this.setModel(slot, spec.modelKey);
                slot.id = spec.id; slot.node.name = `Platform_${spec.id}_${spec.modelKey}`; slot.node.active = true;
            }
            slot.view.apply(spec);
        }
    }
    get count(): number { return this.slots.length; }
    clear(): void { this.slots.forEach(slot => this.recycle(slot)); }
    destroy(): void { this.slots.forEach(slot => slot.node.destroy()); this.slots.length = 0; }
    private setModel(slot: Slot, model: ModelKey): void {
        const visual = slot.view.visual!;
        for (const child of [...visual.children]) { child.removeFromParent(); child.destroy(); }
        const prefab = this.models[this.keys.indexOf(model)];
        if (!prefab) throw new Error(`missing model ${model}`);
        visual.addChild(instantiate(prefab)); slot.model = model;
        slot.materials = slot.node.getComponentsInChildren(MeshRenderer).map(renderer => ({ renderer, shared: [...renderer.sharedMaterials] }));
    }
    private recycle(slot: Slot): void {
        const stop = (node: Node): void => { Tween.stopAllByTarget(node); node.children.forEach(stop); };
        stop(slot.node);
        for (const entry of slot.materials) entry.shared.forEach((material, index) => entry.renderer.setSharedMaterial(material, index));
        slot.view.resetForPool(); slot.id = null; slot.node.active = false;
    }
}
