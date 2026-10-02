import { _decorator, Component, Node } from 'cc';
import { FootPosition } from '../core/types';
const { ccclass, property } = _decorator;

/** Root is the logical foot. Visual transforms cannot feed back into rule coordinates. */
@ccclass('AvatarView')
export class AvatarView extends Component {
    @property(Node) visual: Node | null = null;
    @property(Node) head: Node | null = null;
    @property(Node) body: Node | null = null;
    @property rawFootY = 0.0837;
    render(foot: FootPosition, chargeRatio: number, flightRatio: number | null, topY: number): void {
        this.node.setPosition(foot.x, foot.y, foot.z);
        if (this.visual) {
            const sy = 1 - 0.28 * chargeRatio;
            this.visual.setScale(1 + 0.12 * chargeRatio, sy, 1 + 0.12 * chargeRatio);
            this.visual.setPosition(0, -this.rawFootY * sy, 0);
            this.visual.setRotationFromEuler(0, flightRatio === null ? 0 : flightRatio * 360, 0);
        }
        const shadow = this.node.getChildByName('ContactShadow');
        if (shadow) {
            const height = Math.max(0, foot.y - topY);
            shadow.setPosition(0, topY - foot.y + 0.015, 0);
            shadow.setScale(0.18 / (1 + height * 0.1), 0.14 / (1 + height * 0.1), 1);
            shadow.active = foot.y >= topY;
        }
    }
}
