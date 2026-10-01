import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

/** Logical node origin = foot. Only Visual is available for future animation. */
@ccclass('AvatarView')
export class AvatarView extends Component {
    @property(Node) visual: Node | null = null;
    @property(Node) head: Node | null = null;
    @property(Node) body: Node | null = null;
    @property rawFootY = 0.0837;
}
