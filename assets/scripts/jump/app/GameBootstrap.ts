import { _decorator, Component, Prefab, Texture2D } from 'cc';
import { createGameConfig } from '../core/config';

const { ccclass, property } = _decorator;

/** Stage 01 composition shell: validated config and explicit imported references. */
@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property(Prefab) avatarPrefab: Prefab | null = null;
    @property(Prefab) currentPlatformPrefab: Prefab | null = null;
    @property(Prefab) targetPlatformPrefab: Prefab | null = null;
    @property(Prefab) circlePlatformPrefab: Prefab | null = null;
    @property(Texture2D) backgroundTexture: Texture2D | null = null;

    readonly config = createGameConfig();

    start(): void {
        // References are reserved for phase02 assembly. Never load a .glb directly.
        if (!this.avatarPrefab || !this.currentPlatformPrefab || !this.targetPlatformPrefab ||
            !this.circlePlatformPrefab || !this.backgroundTexture) {
            throw new Error('JumpMain stage01 asset references are incomplete');
        }
    }
}
