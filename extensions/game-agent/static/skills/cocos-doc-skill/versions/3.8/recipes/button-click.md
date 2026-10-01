---
id: cocos-3.8-recipes-button-click
version: "3.8"
category: recipes
title: 绑定 Button 点击事件
keywords:
  - Button
  - 按钮
  - 点击事件
  - 按钮点击
  - click
  - 监听点击
  - 按钮回调
related_docs:
  - api-reference/button.md
  - api-reference/node.md
  - troubleshooting/button-not-clickable.md
related_api:
  - Button
  - EventHandler
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Button 组件"
  verified-against: []
  supplement:
    - "工程经验：Button 点击事件从 node 派发而非 Button 组件本身，这是最常见的使用误区"
status: draft
updated: 2026-06-17
---

# 绑定 Button 点击事件

## 目标

在运行时通过代码监听 Button 的点击事件，执行自定义回调逻辑。

## 推荐做法

1. **事件必须从 Node 上监听**：Button 的点击事件 `Button.EventType.CLICK`（即 `'click'`）是从 `node` 派发的，**不是**从 Button 组件实例派发；
2. 推荐在 `start()` 中注册事件，在 `onDestroy()` 中移除事件；
3. 两种绑定方式：
   - **编辑器绑定**：在 Button 组件的 `ClickEvents` 数组中拖拽节点并选择回调方法；
   - **代码绑定**：使用 `node.on(Button.EventType.CLICK, callback, target)`。

## 示例代码

### 代码绑定点击事件（推荐做法）

```ts
import { _decorator, Component, Button, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ButtonClickExample')
export class ButtonClickExample extends Component {
  @property(Node)
  startButton: Node | null = null;

  start() {
    if (!this.startButton) return;

    const button = this.startButton.getComponent(Button);
    if (!button) return;

    // 关键：事件监听在 node 上，不是 button 实例上
    this.startButton.on(Button.EventType.CLICK, this.onStartClick, this);
  }

  onStartClick(button: Button) {
    console.log('开始按钮被点击');
    // 处理点击逻辑...
  }

  onDestroy() {
    if (this.startButton) {
      this.startButton.off(Button.EventType.CLICK, this.onStartClick, this);
    }
  }
}
```

### 动态创建 Button 并绑定事件

```ts
import { _decorator, Component, Node, Button, Label, UITransform, Sprite } from 'cc';

const { ccclass } = _decorator;

@ccclass('DynamicButtonExample')
export class DynamicButtonExample extends Component {
  start() {
    const btnNode = new Node('DynamicButton');
    this.node.addChild(btnNode);

    // 添加 UI 组件
    const uiTransform = btnNode.addComponent(UITransform);
    uiTransform.width = 160;
    uiTransform.height = 60;

    const sprite = btnNode.addComponent(Sprite);
    // sprite.spriteFrame = ...（需设置背景图）

    const button = btnNode.addComponent(Button);

    // 添加标签
    const labelNode = new Node('Label');
    btnNode.addChild(labelNode);
    const label = labelNode.addComponent(Label);
    label.string = '点击我';
    label.fontSize = 24;
    label.color = { r: 255, g: 255, b: 255, a: 255 };

    // 绑定点击事件
    btnNode.on(Button.EventType.CLICK, this.onBtnClick, this);
  }

  onBtnClick(button: Button) {
    console.log('动态按钮被点击');
  }

  onDestroy() {
    // 清理建议使用 targetOff，避免手动维护引用
    this.node.targetOff(this);
  }
}
```

### 禁用/启用按钮

```ts
import { _decorator, Component, Button, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ButtonToggleExample')
export class ButtonToggleExample extends Component {
  @property(Button)
  submitBtn: Button | null = null;

  setButtonEnabled(enabled: boolean) {
    if (!this.submitBtn) return;
    this.submitBtn.interactable = enabled;
  }
}
```

## 操作步骤

1. 确保节点上有 Button 组件（编辑器中添加或代码 `addComponent(Button)`）；
2. 如果是编辑器创建的 Button，在脚本中用 `@property(Node)` 或 `@property(Button)` 绑定引用；
3. 在 `start()` 中通过 `node.on(Button.EventType.CLICK, callback, this)` 注册事件；
4. 回调函数接收一个参数 `button: Button`，即被点击按钮的 Button 组件实例；
5. 在 `onDestroy()` 中通过 `node.off(Button.EventType.CLICK, callback, this)` 移除事件。

## 验证方式

- 运行场景后点击按钮，控制台输出预期日志；
- 多次点击应触发对应次数的回调；
- 设置 `interactable = false` 后点击无响应；
- 场景切换或节点销毁后，点击不再触发回调。

## 常见错误

1. **错误地在 Button 组件上监听事件**：`button.on(...)` 无效，必须用 `node.on(Button.EventType.CLICK, ...)`。
2. **interactable = false 后仍期望触发**：`interactable = false` 时按钮不会发出任何事件。
3. **事件未清理导致内存泄漏**：`onDestroy` 中未 `off` 事件监听，组件销毁后点击仍触发回调，可能访问已销毁对象。
4. **未设置 target 导致过渡不生效**：Button 的 COLOR/SPRITE/SCALE 过渡效果需要在 `target` 属性中指定作用节点（默认为按钮自身节点）。
5. **未检查 null**：`getComponent(Button)` 在节点上没有 Button 组件时返回 null。
6. **多层嵌套点击穿透**：子节点和父节点都有 Button 组件时，子节点点击会冒泡到父节点，使用 `event.propagationStopped = true` 阻止冒泡。

## 相关文档

- [Button API 卡片](../api-reference/button.md)
- [按钮点击无响应排查](../troubleshooting/button-not-clickable.md)
- [创建节点与组件](./create-node-and-component.md)
