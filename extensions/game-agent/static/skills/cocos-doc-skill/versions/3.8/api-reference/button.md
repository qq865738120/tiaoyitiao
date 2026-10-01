---
id: cocos-3.8-api-reference-button
version: "3.8"
category: api-reference
title: Button
keywords:
  - Button
  - 按钮
  - 点击事件
  - 按钮状态
related_docs:
  - api-reference/sprite.md
  - api-reference/label.md
  - recipes/button-click.md
  - ui-2d/button.md
related_api:
  - Button
  - EventHandler
  - NodeEventType
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Button 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Button

## 用途

Button 组件用于处理用户点击交互，支持颜色过渡、图片切换和缩放过渡三种状态反馈。按钮事件从所属 Node 上派发，通过 `clickEvents`（编辑器绑定）或代码监听来处理点击。

## 所属模块

```ts
import { Button } from 'cc';
```

## 公开导出结论

- `Button` 在 `cc` 模块以 `export class Button extends Component` 公开导出。
- 公开属性：`target`（过渡目标节点）、`interactable`（可交互）、`transition`（过渡类型）、`normalColor`、`pressedColor`、`hoverColor`、`disabledColor`、`duration`、`zoomScale`、`normalSprite`、`pressedSprite`、`hoverSprite`、`disabledSprite`。
- `clickEvents: EventHandler[]`：编辑器绑定点击事件的数组，`EventHandler` 在 `cc` 模块公开导出。
- 静态枚举：`Button.Transition`（NONE/COLOR/SPRITE/SCALE）。
- `Button.EventType` 类型为 `typeof __private._cocos_ui_button__EventType`，包含的值：`CLICK = "click"`。
- **事件从所属节点派发**：需要使用 `node.on(Button.EventType.CLICK, callback)` 或 `node.on('click', callback)` 来监听，不是在 Button 组件本身上监听。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `interactable` | 是否可交互 | 禁用/启用按钮 |
| `target` | 过渡效果作用的节点 | 按钮背景图片 |
| `transition` | 过渡类型（NONE/COLOR/SPRITE/SCALE） | 按钮状态反馈 |
| `clickEvents` | 编辑器绑定的点击事件列表 | 编辑器内配置点击响应 |
| `normalColor` / `pressedColor` | 普通/按下态颜色 | COLOR 过渡自定义颜色 |
| `zoomScale` | 缩放过渡比例 | SCALE 过渡缩放值 |

## 常用方法

| 方法 | 说明 |
|---|---|
| 无独立公开方法 | 所有操作通过属性赋值与事件监听 |

## 高频代码

### 监听 Button 点击事件

```ts
import { _decorator, Component, Button } from 'cc';

const { ccclass } = _decorator;

@ccclass('ButtonExample')
export class ButtonExample extends Component {
  start() {
    const button = this.node.getComponent(Button);
    if (!button) return;

    // 监听点击事件（从节点派发）
    this.node.on(Button.EventType.CLICK, this.onClick, this);
  }

  onClick(button: Button) {
    console.log('按钮被点击');
    // 处理点击逻辑
  }

  onDestroy() {
    // 清理事件监听
    this.node.off(Button.EventType.CLICK, this.onClick, this);
  }
}
```

### 通过代码切换按钮交互状态

```ts
import { _decorator, Component, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ButtonToggleExample')
export class ButtonToggleExample extends Component {
  @property(Button)
  submitButton: Button | null = null;

  toggleButton(canSubmit: boolean) {
    if (!this.submitButton) return;

    this.submitButton.interactable = canSubmit;
  }
}
```

## 常见错误

1. **错误地在 Button 组件上监听事件**：`Button` 的点击事件不是从 Button 实例上派发的，而是从 `node` 上派发，必须使用 `this.node.on(Button.EventType.CLICK, ...)`。
2. **interactable 设为 false 后仍期望触发点击**：`interactable = false` 时按钮不会发出点击事件，也不会显示过渡效果。
3. **未设置 target 导致过渡不生效**：`COLOR`/`SPRITE`/`SCALE` 过渡需要 `target` 指向目标节点；默认为按钮自身节点。
4. **点击事件未清理**：`onDestroy` 中未 `off` 事件监听可能导致内存泄漏。
5. **忘记检查 null**：`getComponent(Button)` 可能返回 null。

## 关联任务

- [按钮点击](../recipes/button-click.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Button 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
