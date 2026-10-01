---
id: cocos-3.8-troubleshooting-click-through
version: "3.8"
category: troubleshooting
title: 点击穿透
keywords:
  - 点击穿透
  - 弹窗挡不住点击
  - 事件穿透
  - 按钮点到下面
  - BlockInputEvents 不生效
related_docs:
  - ui-2d/block-input-events.md
  - troubleshooting/button-not-clickable.md
  - api-reference/mask.md
  - api-reference/ui-transform.md
related_api:
  - BlockInputEvents
  - UITransform
  - Widget
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - BlockInputEvents 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：点击穿透大多数情况是 BlockInputEvents + UITransform 配置不当"
    - "论坛线索：3.8.8 版本存在点击穿透回归问题，含 Demo 复现。来源：forum.cocos.org（ev-414）"
status: needs-review
updated: 2026-06-18
---

# 点击穿透

> **注意**：本文档部分内容基于论坛线索，结论待复核。建议结合当前 Cocos Creator 版本和官方文档核实。

## 现象

弹窗或遮罩层打开后，点击弹窗区域的空白处时，弹窗下面的按钮或交互节点仍然被触发。弹窗看起来是"透明的"，无法阻挡点击事件。

## 最可能原因（按排查顺序）

> 排查点击穿透时，请按以下顺序逐步确认。每个步骤检查通过后再进入下一步，避免跳步导致误判。

### Step 1：确认节点层级与事件传播路径

事件从最上层的节点向下传递。点击穿透往往因为遮罩节点不在正确的事件链路中。优先确认：
- 遮罩节点在 Hierarchy 中是否位于被遮挡节点的**上方**（下方子节点在上层）。
- 遮罩节点的 `zIndex` 是否足够高（UI 节点按 zIndex 排序，zIndex 越大越靠上）。
- 是否有动态创建的节点插入到遮罩节点和下层节点之间，打乱了事件层级。

### Step 2：检查 BlockInputEvents 组件

1. **遮罩节点未添加 BlockInputEvents 组件**——最常见的遗漏。弹窗只做了视觉遮罩（半透明 Sprite），但没有添加 BlockInputEvents 阻挡输入事件。

2. **遮罩节点的 UITransform 尺寸为零或未覆盖全屏**——添加了 BlockInputEvents，但节点没有 UITransform，或者 UITransform 的 `contentSize` 为 `(0, 0)` 或尺寸太小，导致阻挡区域不存在或不完整。

### Step 3：检查节点 active 与 UITransform 状态

3. **遮罩节点或其父节点 active = false**——节点或其祖先被禁用，BlockInputEvents 不工作。

4. **UITransform 禁用了**——`UITransform.enabled` 为 `false` 时不参与事件检测，BlockInputEvents 失去阻挡区域。

### Step 4：检查遮罩节点尺寸与事件覆盖

5. **遮罩节点层级不正确**——遮罩节点不在场景节点树的较下层（zIndex 不够高或 `setSiblingIndex` 未设置在最子层）。BlockInputEvents 只阻挡传到更下层的节点，如果遮罩节点本身就在下层，则无法阻挡。

### Step 5：检查透明度与事件阻挡的关系

6. **节点 opacity = 0 被误解**——即使节点透明度为 0，只要 UITransform 有效且有 BlockInputEvents，点击事件仍会被阻挡。如果既没有 BlockInputEvents 也没有交互组件，透明度为 0 的节点不会阻挡事件。

## 快速检查

- [ ] 遮罩节点 Inspector 中是否已添加 **BlockInputEvents** 组件。
- [ ] 遮罩节点上是否有 **UITransform** 组件，且 `ContentSize` 大于 0 并覆盖期望区域。
- [ ] 遮罩节点的 `zIndex` 值是否高于下方的交互节点，或在 Hierarchy 中是否处于更靠下的位置（外层 Canvas 下靠后的子节点在上层）。
- [ ] 是否使用了 Widget 让遮罩节点自适应全屏（推荐做法）。
- [ ] 遮罩节点及其所有父节点的 `active` 属性是否为 `true`。
- [ ] 遮罩节点的 UITransform 是否 `enabled`。

## 解决方案

### 方案一：添加 BlockInputEvents + 确保 UITransform

```ts
import { _decorator, Component, Node, BlockInputEvents, UITransform, view } from 'cc';

const { ccclass } = _decorator;

@ccclass('FixClickThrough')
export class FixClickThrough extends Component {
  start() {
    // 为遮罩节点添加组件
    const overlay = new Node('Overlay');
    overlay.addComponent(BlockInputEvents);

    const uiTransform = overlay.addComponent(UITransform);
    // 使用 view.getVisibleSize() 获取实际可见区域尺寸，避免硬编码
    uiTransform.setContentSize(view.getVisibleSize());

    this.node.addChild(overlay);
    overlay.setSiblingIndex(this.node.children.length - 1); // 确保在最上层
  }
}
```

> 避免硬编码设计稿尺寸；推荐使用 `view.getVisibleSize()` 或方案二的 Widget 全屏对齐。

### 方案二：使用 Widget 自适应父节点

```ts
import { _decorator, Component, Node, BlockInputEvents, Widget } from 'cc';

const { ccclass } = _decorator;

@ccclass('OverlayWithWidget')
export class OverlayWithWidget extends Component {
  start() {
    const overlay = new Node('Overlay');
    overlay.addComponent(BlockInputEvents);

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

    this.node.addChild(overlay);
    overlay.setSiblingIndex(this.node.children.length - 1);
  }
}
```

### 方案三：检查组件的 active 状态

```ts
// 排除 active 问题
if (overlayNode.active && overlayNode.activeInHierarchy) {
  // 确认节点及其父节点都可用
} else {
  console.warn('遮罩节点或其父节点被禁用');
}
```

## 仍未解决时

- **3.8.8 版本回归提示**：Cocos Creator 3.8.8 存在已被论坛用户报告的点击穿透回归问题（含复现 Demo）。如果您在使用 3.8.8 并按上述所有步骤排查仍无法解决，请注意这可能是引擎层面的事件系统回归而非项目配置问题。建议：
  - 在论坛搜索 `3.8.8 点击穿透` 或 `click through 3.8.8` 查看最新进展。
  - 尝试在 3.8.7 或 3.8.9 以上版本测试，确认是否是版本特定问题。
  - 提交最小复现 Demo 到 GitHub Issues。
- 在编辑器中选择遮罩节点，检查是否真的位于场景的最上层（在 Hierarchy 视图中确认）。
- 在运行时通过 `cc.director.getScene()` 检查节点的实际层级关系，看是否有动态创建的节点插到了遮罩节点和下层按钮之间。
- 检查是否在同一节点上同时挂载了多个交互组件导致事件系统异常。
- 检查是否有自定义脚本手动调用了 `event.propagationStopped` 或 `event.preventSwallow` 影响事件传递。
- 在原生平台测试时，确认触摸事件在平台层面是否有特殊处理（如原生手势冲突）。

## 相关文档

- [BlockInputEvents — 弹窗点击穿透阻挡](../ui-2d/block-input-events.md)
- [Button 点击不生效](button-not-clickable.md)
- [Mask 遮罩 API 卡片](../api-reference/mask.md)
- [UITransform API 卡片](../api-reference/ui-transform.md)
