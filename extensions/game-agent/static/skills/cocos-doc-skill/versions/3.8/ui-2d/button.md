---
id: cocos-3.8-ui-2d-button
version: "3.8"
category: ui-2d
title: Button — UI 按钮交互组件
keywords:
  - Button
  - 按钮
  - 点击事件
  - EventHandler
  - 交互
  - 按钮点击无效
  - 点击不生效
related_docs:
  - ui-2d/label.md
  - ui-2d/sprite.md
  - ui-2d/ui-transform.md
  - api-reference/button.md
  - recipes/button-click.md
  - troubleshooting/button-not-clickable.md
related_api:
  - Button
  - EventHandler
  - UITransform
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Button"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Button — UI 按钮交互组件

## 用途

Button 组件让 UI 节点可点击，并响应触摸事件，是 UI 中最主要的交互方式。它通过 EventHandler 机制将点击事件分发到目标组件的方法中。

## 核心结论

- Button 的交互模型：检测触摸/点击 → 触发交互状态变化（`NORMAL`、`HOVERED`、`PRESSED`、`DISABLED`）→ 执行绑定的 EventHandler 列表。
- EventHandler 是事件派发机制：绑定一个**目标节点**、一个**组件类名**和一个**方法名**，点击时调用该方法。EventHandler 支持传递一个自定义参数。
- Button 组件不负责渲染外观，外观由子节点上的 Sprite、Label 等共同呈现。
- Button 通过 `transition` 属性控制交互状态反馈类型：
  - `NONE`：无视觉反馈。
  - `COLOR`：状态切换时改变节点颜色。
  - `SPRITE`：状态切换时更换 SpriteFrame（需要子节点有 Sprite 组件）。
  - `SCALE`：状态切换时缩放节点。
- 点击事件绑定的完整步骤 → 指向 [recipes/button-click.md](../recipes/button-click.md)。
- 点击无效排查 → 指向 [troubleshooting/button-not-clickable.md](../troubleshooting/button-not-clickable.md)。

## 什么时候使用

- 需要用户点击交互的所有 UI 元素。
- 需要多状态反馈的视觉按钮（按压变色、放大、切换图片）。
- 需要点击后调用脚本方法或切换场景。

## 关键 API / 组件

- `Button.interactable`：布尔值，控制按钮是否可交互。设为 `false` 后按钮变为灰色（DISABLED 状态），不响应点击。
- `Button.transition`：交互反馈类型枚举（`NONE`、`COLOR`、`SPRITE`、`SCALE`）。
- `Button.clickEvents`：EventHandler 数组，注册点击回调。
- `EventHandler`：包含 `target`（节点）、`component`（组件名）、`handler`（方法名）、`customEventData`（自定义参数）。
- `Button.normalColor`、`Button.pressedColor`、`Button.hoverColor`、`Button.disabledColor`：COLOR 模式下的各状态颜色。
- `Button.duration`：COLOR 和 SCALE 模式下的过渡动画时长。

## 最小示例

```ts
import { _decorator, Component, Button, EventHandler } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ButtonDemo')
export class ButtonDemo extends Component {
  start() {
    const btn = this.getComponent(Button);
    if (!btn) return;

    // 编程方式添加点击事件
    const handler = new EventHandler();
    handler.target = this.node;
    handler.component = 'ButtonDemo';
    handler.handler = 'onButtonClick';
    handler.customEventData = 'hello';
    btn.clickEvents.push(handler);
  }

  onButtonClick(customData: string) {
    console.log('Button clicked:', customData);
  }
}
```

## 常见错误

- 按钮点击不生效：检查 `interactable` 是否为 `true`、节点 UITransform `contentSize` 是否大于零、节点是否在 Canvas 子树下、事件是否被上层节点遮挡。
- 按钮状态不切换：`transition` 设为 `NONE` 或未设置状态资源/颜色。
- EventHandler 方法不被调用：检查目标节点上是否存在目标组件、组件是否启用、方法名是否拼写错误、方法是否为 `public` 可见性。
- 按钮点击穿透：多个按钮重叠，只响应最上层节点的点击。检查节点的 zIndex 和层级顺序。

## 关联文档

- [UITransform — 节点尺寸与交互区域](ui-transform.md)
- [Sprite — 图片显示组件](sprite.md)
- [Label — 文本显示组件](label.md)
- [按钮点击事件绑定](../recipes/button-click.md)
- [按钮点击无效排查](../troubleshooting/button-not-clickable.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Button
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
