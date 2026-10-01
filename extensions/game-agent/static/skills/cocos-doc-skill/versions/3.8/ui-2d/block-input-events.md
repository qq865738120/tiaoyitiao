---
id: cocos-3.8-ui-2d-block-input-events
version: "3.8"
category: ui-2d
title: BlockInputEvents — 弹窗点击穿透阻挡
keywords:
  - BlockInputEvents
  - 输入阻断
  - 弹窗遮挡
  - 阻止点击
  - 事件拦截
  - 点击穿透
  - 弹窗挡不住点击
related_docs:
  - api-reference/ui-transform.md
  - ui-2d/widget.md
  - api-reference/button.md
  - troubleshooting/click-through.md
related_api:
  - BlockInputEvents
  - UITransform
  - Button
  - Node.EventType
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - BlockInputEvents 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：BlockInputEvents 不阻止触摸事件冒泡到其他系统组件"
status: draft
updated: 2026-06-17
---

# BlockInputEvents — 弹窗点击穿透阻挡

## 用途

BlockInputEvents 组件挂载到节点后，会阻止该节点的输入事件（点击/触摸）传递到下层节点。这是解决弹窗遮挡时点击穿透到背景层节点的标准方案。

> 注意：BlockInputEvents **不停止事件冒泡**，只是阻止事件传递到更下层的节点。事件仍然会被 BlockInputEvents 所在节点捕获并消费掉。

## 核心结论

- BlockInputEvents 阻止触摸/点击事件穿透过该节点到达下层（zIndex 更低或 Hierarchy 顺序更前）的节点。
- 必须配合 **UITransform** 使用：遮罩节点的 UITransform 尺寸决定了"阻挡区域"的大小。
- 节点自身的按钮或交互组件不受影响——BlockInputEvents 不阻止节点自身上的事件处理。
- 节点层级必须在想要保护的内容之上（zIndex 更高或 Hierarchy 中更靠下）。

## 什么时候使用

- 弹出模态弹窗时，阻止用户点到弹窗后面的按钮。
- 侧边菜单打开时，点击空白区域只关闭菜单而不触发底层操作。
- 加载遮罩层（Loading Overlay）阻止用户操作。
- 新手引导遮罩，防止触摸穿透。

## 关键 API / 组件

- **`BlockInputEvents`**：挂载到节点上即可，**无任何可配置属性**。
- **`UITransform`**：必须在同一节点上，其 `contentSize` 决定了阻挡区域的覆盖范围。
- **`Widget`**：可选配合，用于让遮罩节点自适应充满父节点尺寸。

## 最小示例

### 模态弹窗阻止点击穿透

```ts
import { _decorator, Component, Node, BlockInputEvents, UITransform, Widget } from 'cc';

const { ccclass } = _decorator;

@ccclass('ModalExample')
export class ModalExample extends Component {
  private _overlay: Node | null = null;

  showModal() {
    // 创建遮罩节点
    const overlay = new Node('Overlay');
    this.node.addChild(overlay);

    // 添加 BlockInputEvents 阻止点击穿透
    overlay.addComponent(BlockInputEvents);

    // 必须有 UITransform 定义阻挡区域
    const uiTransform = overlay.addComponent(UITransform);
    // 使用 Widget 自适应父节点尺寸后，UITransform 自动填充，无需手动设置尺寸

    // 使用 Widget 自适应父节点尺寸
    const widget = overlay.addComponent(Widget);
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.isAlignTop = true;
    widget.isAlignBottom = true;
    widget.left = 0;
    widget.right = 0;
    widget.top = 0;
    widget.bottom = 0;
    widget.updateAlignment();

    // 设置层级确保在最上
    overlay.setSiblingIndex(this.node.children.length - 1);

    this._overlay = overlay;
  }

  hideModal() {
    if (this._overlay) {
      this._overlay.removeFromParent();
      this._overlay = null;
    }
  }
}
```

### 使用 Widget 自动撑满父节点

更推荐的做法是利用 Widget 让遮罩节点自适应父节点尺寸：

```ts
import { _decorator, Component, Node, BlockInputEvents, Widget } from 'cc';

const { ccclass } = _decorator;

@ccclass('FullScreenOverlay')
export class FullScreenOverlay extends Component {
  start() {
    // 挂载当前节点到 Canvas 下，并设置全屏遮罩
    const overlayNode = new Node('FullScreenOverlay');
    overlayNode.addComponent(BlockInputEvents);

    const widget = overlayNode.addComponent(Widget);
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.isAlignTop = true;
    widget.isAlignBottom = true;
    widget.left = 0;
    widget.right = 0;
    widget.top = 0;
    widget.bottom = 0;
    widget.updateAlignment();

    // 确保节点在 Canvas 的最子层（即最上层渲染）
    this.node.addChild(overlayNode);
    overlayNode.setSiblingIndex(this.node.children.length - 1);
  }
}
```

## 常见错误

1. **遮罩节点没有 UITransform**：没有 UITransform 时 `contentSize` 为零，BlockInputEvents 的阻挡区域无效，点击直接穿透。
2. **UITransform 尺寸未覆盖全屏**：尺寸太小导致阻挡区域不完整，部分点击穿透到下层。
3. **节点层级不对**：BlockInputEvents 只阻挡事件传递到比自己更下层的节点。如果遮罩节点不在上层（zIndex 较低或在 Hierarchy 中的顺序位置偏上），则无法阻挡。
4. **以为 BlockInputEvents 会改变外观**：BlockInputEvents 仅阻挡事件，不产生任何视觉效果。如果需要视觉遮罩，还需要叠加 Sprite 或 Graphics 组件。
5. **事件仍然冒泡到其他系统**：BlockInputEvents 不阻止事件冒泡到引擎内部的事件系统——它只是阻止节点树中更下层的节点接收到该事件。

## 关联文档

- [点击穿透排查](../troubleshooting/click-through.md)——遇到点击穿透时的诊断指南
- [Widget — UI 自动对齐](widget.md)——用 Widget 让遮罩节点自适应父节点
- [UITransform API](../api-reference/ui-transform.md)——定义阻挡区域的关键组件
- [Button API](../api-reference/button.md)——点击穿透排查中涉及的下层按钮

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - BlockInputEvents 组件
- 已交叉验证：cc-engine 3.8 公开类型声明
- 工程经验补充
