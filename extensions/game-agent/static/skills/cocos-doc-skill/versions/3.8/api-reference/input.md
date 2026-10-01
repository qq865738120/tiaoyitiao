---
id: cocos-3.8-api-reference-input
version: "3.8"
category: api-reference
title: input / Input
keywords:
  - input
  - Input
  - EventTouch
  - EventMouse
  - EventKeyboard
  - EventAcceleration
  - KeyCode
  - 输入事件
  - 触摸
  - 键盘
  - 鼠标
  - 重力传感
related_docs:
  - scripting/input-system.md
  - scripting/input-events.md
  - recipes/handle-touch-and-keyboard.md
related_api:
  - input
  - Input
  - EventTouch
  - EventMouse
  - EventKeyboard
  - EventAcceleration
  - KeyCode
source:
  official: "Cocos Creator 3.8 官方文档 - 输入事件系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# input / Input

## 用途

`input` 是全局输入入口（`Input` 类实例），用于监听不依赖节点的全局键盘、触摸、鼠标、重力传感事件。节点级触摸/鼠标事件请使用 `node.on(Node.EventType.*)`。

## 所属模块

```ts
import { input, Input, EventTouch, EventMouse, EventKeyboard, EventAcceleration, KeyCode } from 'cc';
```

## 公开导出结论

- `input` 在 `cc` 模块以 `export const input` 公开导出，类型为 `Input` 类实例。
- `Input` 类公开导出，含伴生 namespace（`Input.EventType` 枚举）。
- `EventTouch`、`EventMouse`、`EventKeyboard`、`EventAcceleration`、`KeyCode` 类/枚举公开导出。
- 公开方法：`input.on(type, callback, target)` / `input.off(type, callback, target)`。
- 公开枚举：`Input.EventType` 含 KEY_DOWN、KEY_PRESSING、KEY_UP、TOUCH_START、TOUCH_MOVE、TOUCH_END、TOUCH_CANCEL、MOUSE_DOWN、MOUSE_MOVE、MOUSE_UP、MOUSE_WHEEL、DEVICEMOTION。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `input.on(type, callback, target)` | 注册全局输入事件 | onEnable 中注册 |
| `input.off(type, callback, target)` | 解绑全局输入事件 | onDisable/onDestroy 中解绑 |

## 常用事件类型

| 枚举值 | 事件对象类型 | 说明 |
|---|---|---|
| `Input.EventType.KEY_DOWN` | EventKeyboard | 键盘按下 |
| `Input.EventType.KEY_PRESSING` | EventKeyboard | 键盘持续按下（每帧触发） |
| `Input.EventType.KEY_UP` | EventKeyboard | 键盘释放 |
| `Input.EventType.TOUCH_START` | EventTouch | 触摸开始 |
| `Input.EventType.TOUCH_MOVE` | EventTouch | 触摸移动 |
| `Input.EventType.TOUCH_END` | EventTouch | 触摸结束（抬起） |
| `Input.EventType.TOUCH_CANCEL` | EventTouch | 触摸取消（被系统中断） |
| `Input.EventType.MOUSE_DOWN` | EventMouse | 鼠标按下 |
| `Input.EventType.MOUSE_MOVE` | EventMouse | 鼠标移动 |
| `Input.EventType.MOUSE_UP` | EventMouse | 鼠标释放 |
| `Input.EventType.MOUSE_WHEEL` | EventMouse | 鼠标滚轮 |
| `Input.EventType.DEVICEMOTION` | EventAcceleration | 设备重力传感 |

## EventTouch 常用成员

| 成员 | 类型 | 说明 |
|---|---|---|
| `getLocation()` | `Vec2` | 触摸位置（世界坐标） |
| `getUILocation()` | `Vec2` | 触摸位置（UI 坐标） |
| `getDelta()` | `Vec2` | 本次与上次触发之间的位移（世界坐标） |
| `getUIDelta()` | `Vec2` | 本次与上次触发之间的位移（UI 坐标） |
| `getTouches()` | `Touch[]` | 多点触摸列表 |
| `touch` | `Touch` | 底层 Touch 对象 |
| `propagationStopped` | `boolean` | 设置为 true 阻止事件冒泡（节点事件中使用） |

## EventMouse 常用成员

| 成员 | 类型 | 说明 |
|---|---|---|
| `getLocation()` | `Vec2` | 鼠标位置（世界坐标） |
| `getUILocation()` | `Vec2` | 鼠标位置（UI 坐标） |
| `getDelta()` | `Vec2` | 鼠标位移 |
| `getScrollData()` | `number` | 滚轮滚动值（MOUSE_WHEEL 时有效） |
| `setButton(button)` | `void` | 设置鼠标按键 |
| `getButton()` | `number` | 获取鼠标按键（0=左键, 1=中键, 2=右键） |

## EventKeyboard 常用成员

| 成员 | 类型 | 说明 |
|---|---|---|
| `keyCode` | `KeyCode` | 按键枚举值 |

常用 KeyCode：`KeyCode.KEY_W`、`KeyCode.KEY_A`、`KeyCode.KEY_S`、`KeyCode.KEY_D`、`KeyCode.KEY_J`、`KeyCode.KEY_K`、`KeyCode.SPACE`、`KeyCode.ENTER`、`KeyCode.ESCAPE`、`KeyCode.ARROW_LEFT`、`KeyCode.ARROW_RIGHT`、`KeyCode.ARROW_UP`、`KeyCode.ARROW_DOWN`。

## 高频代码

### 键盘 WASD 移动

```ts
import { _decorator, Component, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass } = _decorator;

@ccclass('WASDInputExample')
export class WASDInputExample extends Component {
  private speed = 200;

  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  private onKeyDown(event: EventKeyboard) {
    if (!this.node.parent) return;

    const pos = this.node.position.clone();
    switch (event.keyCode) {
      case KeyCode.KEY_W: pos.y += this.speed; break;
      case KeyCode.KEY_S: pos.y -= this.speed; break;
      case KeyCode.KEY_A: pos.x -= this.speed; break;
      case KeyCode.KEY_D: pos.x += this.speed; break;
    }
    this.node.position = pos;
  }
}
```

### 触摸移动

```ts
import { _decorator, Component, input, Input, EventTouch } from 'cc';
const { ccclass } = _decorator;

@ccclass('TouchMoveExample')
export class TouchMoveExample extends Component {
  onEnable() {
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  onDisable() {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  private onTouchMove(event: EventTouch) {
    const delta = event.getUIDelta();
    this.node.setPosition(
      this.node.position.x + delta.x,
      this.node.position.y + delta.y,
      this.node.position.z
    );
  }
}
```

### 鼠标点击获取坐标

```ts
import { _decorator, Component, input, Input, EventMouse } from 'cc';
const { ccclass } = _decorator;

@ccclass('MouseClickExample')
export class MouseClickExample extends Component {
  onEnable() {
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
  }

  onDisable() {
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
  }

  private onMouseDown(event: EventMouse) {
    const pos = event.getUILocation();
    console.log(`Mouse clicked at UI (${pos.x}, ${pos.y})`);
    // 左键: 0, 中键: 1, 右键: 2
    console.log(`Button: ${event.getButton()}`);
  }
}
```

## 常见错误

1. **忘记解绑 input 事件**：组件销毁后回调仍在触发，访问 `this` 报空引用。global input 不像 node 事件那样随节点自动清理。
2. **`input.on` 第三个参数缺失**：`input.on(type, callback, this)` 中缺少 `this`，导致无法用 `input.off(type, callback, this)` 解绑。
3. **混淆全局 input 事件和节点级事件**：按钮点击用 `node.on(Node.EventType.TOUCH_START)`，全局检测用 `input.on(Input.EventType.TOUCH_START)`。
4. **使用已废弃的 `systemEvent`**：从 v3.4.0 起用 `input` 替代 `systemEvent`。
5. **全局触摸无命中检测**：`input.on(TOUCH_START)` 在任何位置都能触发，不检查节点区域；如需节点区域检测，改用 `node.on(Node.EventType.TOUCH_START)`。

## 关联任务

- [触摸与键盘输入](../recipes/handle-touch-and-keyboard.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 输入事件系统
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
