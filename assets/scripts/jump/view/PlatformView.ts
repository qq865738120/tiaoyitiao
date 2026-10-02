import { _decorator, Component, Node } from 'cc';
import { DEFAULT_GAME_CONFIG } from '../core/config';
import { PlatformSpec } from '../core/types';

const { ccclass, property } = _decorator;

/** Root = top center; collision metadata deliberately excludes the shadow. */
@ccclass('PlatformView')
export class PlatformView extends Component {
    @property(Node) visual: Node | null = null;
    @property modelKey = 'block_00';
    @property shape = 'rect';
    @property halfX = DEFAULT_GAME_CONFIG.platformWidth / 2;
    @property halfZ = DEFAULT_GAME_CONFIG.platformDepth / 2;
    @property radius = DEFAULT_GAME_CONFIG.platformWidth / 2;
    @property height = DEFAULT_GAME_CONFIG.platformHeight;
    @property horizontalScale = 1;

    spec: PlatformSpec | null = null;

    apply(spec: PlatformSpec): void {
        this.spec = spec; this.modelKey = spec.modelKey; this.shape = spec.shape;
        this.node.setPosition(spec.centerXZ.x, spec.topY, spec.centerXZ.z);
        this.halfX = spec.shape === 'rect' ? spec.halfExtent.x : spec.radius;
        this.halfZ = spec.shape === 'rect' ? spec.halfExtent.z : spec.radius;
        this.radius = spec.shape === 'circle' ? spec.radius : 0;
        this.setHorizontalScale(spec.horizontalScale);
    }
    resetForPool(): void {
        this.unscheduleAllCallbacks(); this.spec = null; this.modelKey = ''; this.shape = '';
        this.halfX = 0; this.halfZ = 0; this.radius = 0; this.horizontalScale = 1;
        this.node.setPosition(0, 0, 0); this.node.setRotationFromEuler(0, 0, 0); this.node.setScale(1, 1, 1);
        this.visual?.setRotationFromEuler(0, 0, 0);
        this.visual?.setScale(1, 1, 1); this.visual?.setPosition(0, -this.height / 2, 0);
    }

    setHorizontalScale(scale: number): void {
        if (!Number.isFinite(scale) || scale < DEFAULT_GAME_CONFIG.minPlatformScale || scale > DEFAULT_GAME_CONFIG.maxPlatformScale) {
            throw new RangeError('horizontalScale must be in [0.8, 1]');
        }
        this.horizontalScale = scale;
        this.visual?.setScale(scale, 1, scale);
    }
}
