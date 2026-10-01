---
id: cocos-3.8-scripting-input-system
version: "3.8"
category: scripting
title: 输入系统
keywords:
  - 输入
  - input
  - 键盘
  - Keyboard
  - KeyCode
  - 全局触摸
  - 鼠标
  - 重力传感
  - 输入事件
  - systemEvent
related_docs:
  - scripting/event-system.md
  - scripting/component-lifecycle.md
  - scripting/coding-pitfalls.md
related_api:
  - input
  - Input
  - EventKeyboard
  - EventTouch
  - EventMouse
  - EventAcceleration
  - KeyCode
source:
  official: "Cocos Creator 3.8 官方文档 - 输入事件系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：input 从 v3.4.0 起替代 systemEvent；on/off 配对与生命周期关联"
status: draft
updated: 2026-06-17
---

# 输入系统

## 用途

说明如何使用 `input` 对象监听全局输入事件（键盘、全局触摸、鼠标、重力传感）。区别于 [事件系统](./event-system.md) 的节点级事件（触摸/鼠标冒泡到具体节点）。

## 核心结论

- **`input` 对象从 v3.4.0 起是全局输入入口**，替代废弃的 `systemEvent`。
- **`input.on(type, callback, target)` / `input.off(type, callback, target)`** 注册/解绑。
- **全局输入与节点无关**——任何时候都能触发，必须在 `onDestroy` 中解绑。
- `input` 支持键盘、触摸、鼠标、设备重力传感四种事件类型。

## 键盘事件

```ts
import { _decorator, Component, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass } = _decorator;

@ccclass('KeyboardExample')
export class KeyboardExample extends Component {
  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  private onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.ARROW_LEFT:
        console.log('Left arrow pressed');
        break;
      case KeyCode.ARROW_RIGHT:
        console.log('Right arrow pressed');
        break;
      case KeyCode.SPACE:
        console.log('Space pressed');
        break;
      case KeyCode.KEY_W:
        console.log('W pressed');
        break;
    }
  }

  private onKeyUp(event: EventKeyboard) {
    if (event.keyCode === KeyCode.SPACE) {
      console.log('Space released');
    }
  }
}
```

## 全局触摸/鼠标事件

全局触摸不同于节点触摸——全局触摸在任何位置都能触发，不依赖节点区域。

```ts
import { _decorator, Component, input, Input, EventTouch } from 'cc';
const { ccclass } = _decorator;

@ccclass('GlobalTouchExample')
export class GlobalTouchExample extends Component {
  onEnable() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onDisable() {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    const pos = event.getUILocation();
    console.log(`Touch start at (${pos.x}, ${pos.y})`);
  }

  private onTouchMove(event: EventTouch) {
    const delta = event.getUIDelta();
    console.log(`Touch moved by (${delta.x}, ${delta.y})`);
  }

  private onTouchEnd(event: EventTouch) {
    console.log('Touch ended');
  }
}
```

## 输入事件类型速查

| 枚举 | 含义 |
|---|---|
| `Input.EventType.KEY_DOWN` | 键盘按下 |
| `Input.EventType.KEY_PRESSING` | 键盘持续按下 |
| `Input.EventType.KEY_UP` | 键盘释放 |
| `Input.EventType.TOUCH_START` | 触摸开始 |
| `Input.EventType.TOUCH_MOVE` | 触摸移动 |
| `Input.EventType.TOUCH_END` | 触摸结束 |
| `Input.EventType.TOUCH_CANCEL` | 触摸取消 |
| `Input.EventType.MOUSE_DOWN` | 鼠标按下 |
| `Input.EventType.MOUSE_MOVE` | 鼠标移动 |
| `Input.EventType.MOUSE_UP` | 鼠标释放 |
| `Input.EventType.MOUSE_WHEEL` | 鼠标滚轮 |
| `Input.EventType.DEVICEMOTION` | 设备重力传感 |

## 解绑时机与生命周期关联

```ts
// ✅ 推荐：onEnable 注册 + onDisable 解绑
// 组件 disable 时不响应输入，enable 时恢复

import { _decorator, Component, input, Input } from 'cc';
const { ccclass } = _decorator;

@ccclass('GlobalKeyExample')
class GlobalKeyExample extends Component {
  private onGlobalKey() {}

  // ⚠️ 如果是全局永远需要的输入（如退出键）
  // 注册放 onLoad，解绑放 onDestroy
  onLoad() {
    input.on(Input.EventType.KEY_DOWN, this.onGlobalKey, this);
  }
  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onGlobalKey, this);
  }
}
```

## 常见错误

1. **忘记解绑 input 事件**：组件销毁后回调仍在触发，访问 `this` 报空引用。global input 不像 node 事件那样随节点自动清理。
2. **`input.on` 第三个参数缺失**：`input.on(type, callback, this)` 中缺少 `this`，导致无法用 `input.off(type, callback, this)` 解绑。
3. **混淆节点事件和全局输入**：按钮点击用 `node.on(Node.EventType.TOUCH_START)`，全局检测用 `input.on(Input.EventType.TOUCH_START)`。
4. **使用已废弃的 `systemEvent`**：从 v3.4.0 起用 `input`。

## 关联文档

- [事件系统（节点事件）](./event-system.md)
- [onLoad 与 start 实战选择](./component-lifecycle.md)
- [常见编码陷阱](./coding-pitfalls.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 输入事件系统
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——input 事件必须与生命周期严格配对解绑
