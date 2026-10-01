---
id: cocos-3.8-scripting-input-events
version: "3.8"
category: scripting
title: 输入事件与传播
keywords:
  - 输入事件
  - 事件冒泡
  - 事件捕获
  - 节点事件
  - 点击坐标
  - 坐标转换
  - UI 命中
  - BlockInputEvents
related_docs:
  - scripting/input-system.md
  - scripting/event-system.md
  - api-reference/input.md
  - api-reference/node.md
  - api-reference/ui-transform.md
  - api-reference/button.md
  - troubleshooting/click-through.md
  - troubleshooting/input-not-triggered.md
related_api:
  - input
  - Node
  - EventTouch
  - UITransform
  - BlockInputEvents
source:
  official: "Cocos Creator 3.8 官方文档 - 事件系统 - 节点事件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-17
---

# 输入事件与传播

## 用途

说明全局输入（`input.on`）和节点输入（`node.on`）的核心区别、节点事件冒泡/捕获机制、UI 命中检测规则以及坐标转换入口。帮助开发者选择正确的输入监听方式，理解事件传播路径。

> **注意**：本文档聚焦事件传播机制。全局输入的基础用法见 [输入系统](./input-system.md)，API 细节见 [input API 卡片](../api-reference/input.md)。

## 核心结论

1. **全局输入 vs 节点输入**：全局输入（`input.on`）不依赖节点，任何位置都能触发；节点输入（`node.on`）需要命中节点区域（依赖 UITransform）才能触发。
2. **节点事件传播三阶段**：捕获阶段（Capture）-> 目标阶段（Target）-> 冒泡阶段（Bubble）。事件从根节点逐级向下到达目标节点（捕获），再从目标节点逐级向上返回根节点（冒泡）。
3. **Button clickEvents 与 node.on 是不同的绑定方式**：`clickEvents` 通过 `EventHandler` 机制在引擎底层处理，与代码 `node.on(Node.EventType.TOUCH_START)` 的执行顺序和生命周期不同。clickEvents 是 Button 组件内部处理后的独立事件派发。
4. **坐标转换**：节点触摸事件中获取的坐标通常在世界空间，使用 `node.getComponent(UITransform)?.convertToNodeSpaceAR()` 转为节点局部坐标。

## 什么时候使用

| 场景 | 推荐方式 |
|---|---|
| 全局键盘快捷键（如 ESC 退出） | `input.on(Input.EventType.KEY_DOWN)` |
| 全局触摸拖动（不关心点击了哪个 UI） | `input.on(Input.EventType.TOUCH_MOVE)` |
| 按钮/图片等特定 UI 元素的触摸 | `node.on(Node.EventType.TOUCH_START)` |
| 需要检查点击位置是否在某个节点内 | `node.on + UITransform.convertToNodeSpaceAR` |
| Button 点击回调 | `node.on(Button.EventType.CLICK)` 或编辑器中配置 `clickEvents` |

## 事件传播机制

### 冒泡阶段（默认）

默认 `node.on(type, callback, target)` 注册的回调在**冒泡阶段**触发。事件从目标节点逐级向父节点传递：

```ts
import { NodeEventType } from 'cc';

// 父节点和子节点都绑定相同的触摸事件
// 点击子节点时：子节点先触发，然后父节点触发
parentNode.on(NodeEventType.TOUCH_START, () => {
  console.log('parent touched (bubble)');
});

childNode.on(NodeEventType.TOUCH_START, () => {
  console.log('child touched (bubble)');
});

// 点击 childNode 输出顺序：
// "child touched (bubble)"
// "parent touched (bubble)"
```

### 捕获阶段

使用 `node.on(type, callback, target, useCapture)` 第四个参数为 `true` 可在捕获阶段监听：

```ts
import { NodeEventType } from 'cc';

// 父节点使用捕获模式，子节点使用冒泡模式
parentNode.on(NodeEventType.TOUCH_START, () => {
  console.log('parent touched (capture)');
}, undefined, true); // 第四个参数 true = 捕获阶段

childNode.on(NodeEventType.TOUCH_START, () => {
  console.log('child touched (bubble)');
});

// 点击 childNode 输出顺序：
// "parent touched (capture)"
// "child touched (bubble)"
```

### 阻止冒泡

```ts
import { NodeEventType, EventTouch } from 'cc';

childNode.on(NodeEventType.TOUCH_START, (event: EventTouch) => {
  event.propagationStopped = true; // 事件不再继续传递
  console.log('child touched, propagation stopped');
});

// 此时父节点不会收到该事件
```

## Button clickEvents 的传播特殊性

Button 组件的 `clickEvents` 通过编辑器配置的 `EventHandler` 列表触发。它与 `node.on(Node.EventType.TOUCH_START)` 有以下区别：

| 特性 | `node.on(TOUCH_START)` | clickEvents |
|---|---|---|
| 触发时机 | 触摸按下立即触发 | 触摸按下并抬起（完整点击）后触发 |
| 绑定位置 | 在代码中注册 | 编辑器拖拽配置或代码创建 EventHandler |
| 执行优先级 | 在事件传播中按阶段执行 | 在 Button 组件内部处理完成后执行 |
| 生命周期 | 需手动 off 解绑 | 随组件自动管理 |

```ts
// clickEvents 在编辑器配置的操作，等价于以下代码
import { _decorator, Component, Node, EventHandler, Button } from 'cc';
const { ccclass } = _decorator;

@ccclass('ButtonEventExample')
export class ButtonEventExample extends Component {
  start() {
    const btn = this.node.getComponent(Button);
    if (!btn) return;

    const handler = new EventHandler();
    handler.target = this.node;
    handler.component = 'ButtonEventExample';
    handler.handler = 'onButtonClick';
    btn.clickEvents.push(handler);
  }

  onButtonClick() {
    console.log('Button clicked (via clickEvents)');
  }
}
```

## UI 命中检测规则

节点事件（TOUCH_START/MOVE/END）的触发需要满足以下条件：

1. 节点必须有 `UITransform` 组件，且 `contentSize` 的宽高 > 0。
2. 节点的 `active` 和 `activeInHierarchy` 为 true。
3. 触摸/点击位置在节点 `UITransform` 定义的矩形范围内。
4. 上层节点（同层中 zIndex 更高或排序靠后）如果命中，会拦截事件传递到下层节点。
5. `BlockInputEvents` 组件可以拦截所有下层节点的触摸事件，自身不需要有尺寸。

```ts
// 检查触摸点是否在某个节点内
import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass } = _decorator;

@ccclass('HitTestExample')
export class HitTestExample extends Component {
  start() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  private onTouchStart(event: EventTouch) {
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) return;

    // 将屏幕/世界坐标转换到节点局部坐标
    const localPos = uiTransform.convertToNodeSpaceAR(event.getUILocation());
    console.log(`Local position: (${localPos.x}, ${localPos.y})`);
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
  }
}
```

### BlockInputEvents 组件

`BlockInputEvents` 组件添加到节点后，会拦截该节点下层所有节点的触摸/鼠标事件。即使该节点自身尺寸为 0 或不接收事件，其下层节点也无法收到触摸事件。常用于弹窗遮罩防止点击穿透。

## 最小示例：全局输入 vs 节点输入

```ts
import { _decorator, Component, Node, input, Input, EventTouch } from 'cc';
const { ccclass } = _decorator;

@ccclass('InputCompareExample')
export class InputCompareExample extends Component {
  onEnable() {
    // 全局输入：任何位置触发
    input.on(Input.EventType.TOUCH_START, this.onGlobalTouch, this);

    // 节点输入：只在这个节点区域内触发
    this.node.on(Node.EventType.TOUCH_START, this.onNodeTouch, this);
  }

  onDisable() {
    input.off(Input.EventType.TOUCH_START, this.onGlobalTouch, this);
    this.node.off(Node.EventType.TOUCH_START, this.onNodeTouch, this);
  }

  private onGlobalTouch(event: EventTouch) {
    console.log('Global touch at:', event.getUILocation());
    // 触发时不判断节点区域
  }

  private onNodeTouch(event: EventTouch) {
    console.log('Node touch at:', event.getUILocation());
    // 只在节点 UITransform 区域内触发
  }
}
```

## 常见错误

1. **在不需要位置的场景使用全局输入**：如果只需要监听特定 UI 元素的触摸，用 `node.on` 更精准。
2. **节点事件中用错坐标系**：`event.getLocation()` 返回世界坐标，使用 `convertToNodeSpaceAR` 转为节点局部坐标。
3. **混淆 TOUCH_START 和 Button.CLICK**：TOUCH_START 在按下时立即触发，CLICK 在按下+抬起后触发。
4. **BlockInputEvents 不生效**：确保 BlockInputEvents 组件添加在上层节点，且上层节点在 Hierarchy 中排在受影响节点的前面（或 zIndex 更高）。

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 事件系统 - 节点事件
- 已交叉验证：cc-engine 3.8 公开类型声明
