import { _decorator, Component, Node } from 'cc';
import { DEFAULT_GAME_CONFIG } from '../core/config';

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

    setHorizontalScale(scale: number): void {
        if (!Number.isFinite(scale) || scale < DEFAULT_GAME_CONFIG.minPlatformScale || scale > DEFAULT_GAME_CONFIG.maxPlatformScale) {
            throw new RangeError('horizontalScale must be in [0.8, 1]');
        }
        this.horizontalScale = scale;
        this.visual?.setScale(scale, 1, scale);
    }
}
