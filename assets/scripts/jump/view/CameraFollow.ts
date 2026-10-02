import { Node, Vec3 } from 'cc';
import { PlatformSpec } from '../core/types';

/** Presentation only. Camera moves on successful landing, using simulation ticks (pause-safe). */
export class CameraFollow {
    private from = new Vec3();
    private to = new Vec3();
    private startTick = 0;
    private moving = false;
    private readonly offset = new Vec3();
    constructor(private readonly camera: Node, private readonly durationTicks: number, initialCurrent: PlatformSpec, initialTarget: PlatformSpec) {
        const midpoint = this.midpoint(initialCurrent, initialTarget);
        Vec3.subtract(this.offset, camera.position, midpoint);
    }
    reset(current: PlatformSpec, target: PlatformSpec): void {
        this.moving = false; Vec3.add(this.to, this.midpoint(current, target), this.offset); this.camera.setPosition(this.to);
    }
    begin(tick: number, current: PlatformSpec, target: PlatformSpec): void {
        this.from.set(this.camera.position); Vec3.add(this.to, this.midpoint(current, target), this.offset);
        this.startTick = tick; this.moving = true;
    }
    render(tick: number, alpha: number): void {
        if (!this.moving) return;
        const q = Math.min(1, Math.max(0, (tick - this.startTick + alpha) / this.durationTicks));
        const smooth = q * q * (3 - 2 * q);
        this.camera.setPosition(Vec3.lerp(new Vec3(), this.from, this.to, smooth));
        if (q === 1) this.moving = false;
    }
    private midpoint(current: PlatformSpec, target: PlatformSpec): Vec3 {
        return new Vec3((current.centerXZ.x + target.centerXZ.x) / 2, 0, (current.centerXZ.z + target.centerXZ.z) / 2);
    }
}
