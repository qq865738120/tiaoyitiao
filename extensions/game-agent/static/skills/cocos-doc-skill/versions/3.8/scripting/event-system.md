---
id: cocos-3.8-scripting-event-system
version: "3.8"
category: scripting
title: 事件系统
keywords:
  - 事件
  - 节点事件
  - 触摸事件
  - 鼠标事件
  - 事件冒泡
  - 自定义事件
  - dispatchEvent
  - on
  - off
  - 事件解绑
related_docs:
  - scripting/input-system.md
  - scripting/component-lifecycle.md
  - scripting/coding-pitfalls.md
  - scene-node-component/node-events.md
  - api-reference/node.md
related_api:
  - Node
  - Event
  - EventTouch
  - EventMouse
source:
  official: "Cocos Creator 3.8 官方文档 - 事件系统、节点事件系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：事件解绑与生命周期绑定的重要性"
status: draft
updated: 2026-06-17
---

# 事件系统

## 用途

说明节点级别的事件注册、派发、冒泡机制，以及自定义事件的用法。全局输入事件（键盘、设备重力传感等）见 [输入系统](./input-system.md)。

## 核心结论

- 节点事件（触摸、鼠标）通过 **`node.on(type, callback, target)`** 注册，**`node.off(type, callback, target)`** 解绑。
- 事件支持 **捕获→目标→冒泡** 三阶段，冒泡从目标节点逐级向父节点传递。
- **事件监听必须在 onDestroy 中解绑**，否则内存泄漏或误触发。
- 自定义事件用 `node.dispatchEvent(event)` 派发，需继承 `Event` 类。

## 注册和解除节点事件

### 标准模式：onEnable 注册，onDisable 解绑

```ts
import { _decorator, Component, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('NodeEventExample')
export class NodeEventExample extends Component {
  onEnable() {
    // ✅ 使用枚举 EventType，不写字符串
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onDisable() {
    // ✅ 解绑时参数必须与注册时完全一致
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    console.log('Touch start at:', event.getUILocation());
  }

  private onTouchEnd(event: EventTouch) {
    console.log('Touch end');
  }
}
```

**关键规则**：
- `on()` / `off()` 的三个参数必须**完全一致**才能解绑。
- 推荐在 `onEnable` 注册、`onDisable` 解绑，与生命周期自动联动。
- 事件类型必须使用 `Node.EventType` 枚举，不写字符串。

## 触摸与鼠标事件

| 事件类型 | 触发时机 |
|---|---|
| `Node.EventType.TOUCH_START` | 手指/鼠标在节点区域内按下 |
| `Node.EventType.TOUCH_MOVE` | 手指/鼠标在屏幕上移动 |
| `Node.EventType.TOUCH_END` | 手指/鼠标在节点区域内抬起 |
| `Node.EventType.TOUCH_CANCEL` | 手指/鼠标在节点区域外抬起 |
| `Node.EventType.MOUSE_DOWN` | 鼠标在节点区域按下（仅 PC） |
| `Node.EventType.MOUSE_MOVE` | 鼠标在节点区域移动（仅 PC） |
| `Node.EventType.MOUSE_UP` | 鼠标在节点区域松开（仅 PC） |

> **注意**：2D UI 节点的触摸检测依赖 `UITransform` 组件，节点需要有尺寸才能接收事件。

## 自定义事件

```ts
import { _decorator, Component, Node, Event } from 'cc';
const { ccclass } = _decorator;

// 自定义事件类
class ScoreEvent extends Event {
  public score: number;
  constructor(score: number) {
    super('score-changed', true); // 第二个参数 true 表示支持冒泡
    this.score = score;
  }
}

@ccclass('CustomEventExample')
export class CustomEventExample extends Component {
  onLoad() {
    // 监听自定义事件
    this.node.on('score-changed', this.onScoreChanged, this);
  }

  addScore(points: number) {
    // 派发自定义事件
    this.node.dispatchEvent(new ScoreEvent(points));
  }

  private onScoreChanged(event: ScoreEvent) {
    console.log('Score changed to:', event.score);
  }
}
```

## 事件冒泡

```ts
// 阻止事件继续冒泡
private onTouchStart(event: EventTouch) {
  event.propagationStopped = true;  // 事件不再向父节点传递
}
```

## 常见错误

1. **忘记在 onDisable/onDestroy 中解绑**：导致组件已销毁但事件回调仍在触发，报 null 引用错误。
2. **`off` 参数与 `on` 不一致**：缺少第三个参数 `this`，或者使用了不同的匿名函数。
3. **用字符串注册事件**：`node.on('touch-start', ...)` 应改为 `node.on(Node.EventType.TOUCH_START, ...)`。
4. **触摸不触发排查**：检查节点是否有 `UITransform` 组件、尺寸是否 > 0、是否被其他节点遮挡。
5. **在 onDestroy 后仍有事件触发**：将解绑放在 `onDestroy` 中而非 `onDisable`（因为 disable 不等于 destroy）。

## 关联文档

- [输入系统（全局事件）](./input-system.md)
- [onLoad 与 start 实战选择](./component-lifecycle.md)
- [常见编码陷阱](./coding-pitfalls.md)
- [Node 事件（场景节点层）](../scene-node-component/node-events.md)
- [Node API 卡片](../api-reference/node.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 事件系统、节点事件系统
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——on/off 配对模式；未解绑是最常见的 bug 来源之一
