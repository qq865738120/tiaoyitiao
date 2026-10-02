import { _decorator, Component, Node, Quat } from 'cc';
import { DomainEvent, FootPosition, XZ } from '../core/types';
import { FeedbackTimeline } from './FeedbackTimeline';
const { ccclass, property } = _decorator;

/** Root is the logical foot. Only the Visual is animated; never read it for rules. */
@ccclass('AvatarView')
export class AvatarView extends Component {
    @property(Node) visual: Node | null = null;
    @property(Node) head: Node | null = null;
    @property(Node) body: Node | null = null;
    @property rawFootY = 0.0837;
    private readonly feedback = new FeedbackTimeline();
    private readonly rotation = new Quat();
    consume(event: DomainEvent, currentRunId: number): void { this.feedback.consume(event, currentRunId); }
    resetFeedback(runId: number): void {
        this.feedback.reset(runId);
        if (this.visual) {
            this.visual.setScale(1, 1, 1); this.visual.setRotationFromEuler(0, 0, 0);
            this.visual.setPosition(0, -this.rawFootY, 0);
        }
    }
    clear(): void { this.resetFeedback(-1); }
    onDestroy(): void { this.clear(); }
    // Existing four arguments remain valid. Stage04 uses simulation seconds and locked direction.
    render(foot: FootPosition, chargeRatio: number, flightRatio: number | null, topY: number,
        simulationSeconds = 0, direction?: XZ): void {
        this.node.setPosition(foot.x, foot.y, foot.z);
        if (this.visual) {
            const f = this.feedback.sample(simulationSeconds, chargeRatio, flightRatio, direction);
            this.visual.setScale(f.scaleXZ, f.scaleY, f.scaleXZ);
            const half = f.flipRadians / 2, sine = Math.sin(half);
            this.rotation.set(f.axisX * sine, 0, f.axisZ * sine, Math.cos(half));
            this.visual.setRotation(this.rotation);
            // Rotate scaled raw-foot compensation too: the pivot remains the logical foot.
            const offsetY = -this.rawFootY * f.scaleY, sin = Math.sin(f.flipRadians), cos = Math.cos(f.flipRadians);
            this.visual.setPosition(-f.axisZ * sin * offsetY, cos * offsetY, f.axisX * sin * offsetY);
        }
        const shadow = this.node.getChildByName('ContactShadow');
        if (shadow) {
            const height = Math.max(0, foot.y - topY);
            shadow.setPosition(0, topY - foot.y + 0.015, 0);
            shadow.setScale(0.18 / (1 + height * 0.1), 0.14 / (1 + height * 0.1), 1);
            shadow.active = foot.y >= topY;
            // No guessed uniform/shared-material mutation. Alpha requires verified renderer contract.
        }
    }
}
