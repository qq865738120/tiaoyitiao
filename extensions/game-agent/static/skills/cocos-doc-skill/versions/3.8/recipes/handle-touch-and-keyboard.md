---
id: cocos-3.8-recipes-handle-touch-and-keyboard
version: "3.8"
category: recipes
title: 处理触摸与键盘输入
keywords:
  - 触摸事件
  - 键盘输入
  - WASD
  - 角色移动
  - 鼠标点击
  - 屏幕坐标
  - 输入不触发
  - EventTouch
  - EventKeyboard
  - EventMouse
related_docs:
  - api-reference/input.md
  - scripting/input-events.md
  - scripting/input-system.md
  - troubleshooting/input-not-triggered.md
related_api:
  - input
  - Input
  - EventTouch
  - EventKeyboard
  - EventMouse
source:
  official: "Cocos Creator 3.8 官方文档 - 输入事件系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：onEnable 注册 + onDisable 解绑是最安全模式"
status: draft
updated: 2026-06-17
---

# 处理触摸与键盘输入

## 目标

实现三种常见输入场景：
1. 键盘 WASD 控制角色移动
2. 触摸屏幕移动角色位置
3. 鼠标点击获取屏幕坐标并执行操作

## 推荐做法

- 在 `onEnable` 中注册事件，在 `onDisable` 中解绑，确保组件 enable/disable 时自动切换输入监听状态。
- 使用 `input.on` 监听全局输入（不依赖节点区域），适合角色移动等不受 UI 遮挡影响的操作。
- 回调函数使用箭头函数或 `bind(this)` 确保 `this` 指向正确；推荐 `input.on(type, callback, this)` 三参数形式。

## 前置条件

- 脚本挂载到场景中的持久节点（如 Canvas 或专门的 GameManager 节点）。
- 挂载节点不应被销毁（不放在动态生成后被销毁的子节点上）。

## 示例代码

### 示例 1：WASD 键盘移动

```ts
import { _decorator, Component, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WASDMovement')
export class WASDMovement extends Component {
  @property
  moveSpeed = 200;

  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  private onKeyDown(event: EventKeyboard) {
    if (!this.node || !this.node.parent) return;

    const pos = this.node.position.clone();
    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.ARROW_UP:
        pos.y += this.moveSpeed;
        break;
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        pos.y -= this.moveSpeed;
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        pos.x -= this.moveSpeed;
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        pos.x += this.moveSpeed;
        break;
    }
    this.node.position = pos;
  }
}
```

### 示例 2：触摸点击移动位置

点击屏幕任意位置，节点移动到触摸点。

```ts
import { _decorator, Component, input, Input, EventTouch, tween, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('TouchMoveToPosition')
export class TouchMoveToPosition extends Component {
  onEnable() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onDisable() {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  private onTouchStart(event: EventTouch) {
    if (!this.node) return;

    const uiPos = event.getUILocation();

    // 使用缓动动画移动到触摸位置
    tween(this.node)
      .to(0.3, { position: { x: uiPos.x, y: uiPos.y, z: 0 } })
      .start();
  }
}
```

### 示例 3：鼠标获取屏幕坐标

鼠标点击时输出 UI 坐标和世界坐标，并判断是否点击在特定节点区域内。

```ts
import { _decorator, Component, input, Input, EventMouse, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MouseCoordExample')
export class MouseCoordExample extends Component {
  @property(Node)
  targetNode: Node | null = null;

  onEnable() {
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
  }

  onDisable() {
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
  }

  private onMouseDown(event: EventMouse) {
    // 获取 UI 坐标
    const uiPos = event.getUILocation();
    console.log(`Mouse UI position: (${uiPos.x}, ${uiPos.y})`);

    // 获取世界坐标
    const worldPos = event.getLocation();
    console.log(`Mouse world position: (${worldPos.x}, ${worldPos.y})`);

    // 判断是否点击在 targetNode 区域内
    if (this.targetNode) {
      const uiTransform = this.targetNode.getComponent(UITransform);
      if (uiTransform) {
        const localPos = uiTransform.convertToNodeSpaceAR(event.getUILocation());
        const halfW = uiTransform.width / 2;
        const halfH = uiTransform.height / 2;

        if (Math.abs(localPos.x) <= halfW && Math.abs(localPos.y) <= halfH) {
          console.log('Clicked inside targetNode!');
        }
      }
    }
  }
}
```

## 操作步骤

### WASD 移动

1. 创建新脚本，继承 `Component`。
2. 在 `onEnable` 中用 `input.on(Input.EventType.KEY_DOWN, callback, this)` 注册键盘事件。
3. 在回调中通过 `event.keyCode` 判断按下的键，修改节点位置。
4. 在 `onDisable` 中用 `input.off(Input.EventType.KEY_DOWN, callback, this)` 解绑。
5. 将脚本挂载到场景中的持久节点。

### 触摸移动

1. 创建新脚本，继承 `Component`。
2. 在 `onEnable` 中用 `input.on(Input.EventType.TOUCH_START, callback, this)` 注册触摸事件。
3. 使用 `event.getUILocation()` 获取触摸位置的 UI 坐标。
4. 用 `tween` 或直接赋值 `node.position` 移动节点。
5. 在 `onDisable` 中解绑。

### 鼠标坐标

1. 创建新脚本，继承 `Component`。
2. 在 `onEnable` 中用 `input.on(Input.EventType.MOUSE_DOWN, callback, this)` 注册鼠标事件。
3. 使用 `event.getUILocation()` 获取 UI 坐标，`event.getLocation()` 获取世界坐标。
4. 如需判断是否点击在某节点内，使用目标节点的 `UITransform.convertToNodeSpaceAR()`。
5. 在 `onDisable` 中解绑。

## 验证方式

- 运行场景后按下 WASD 键，节点应沿对应方向移动。
- 触摸/点击屏幕，节点应移动到触摸位置，或控制台输出正确的坐标信息。
- 禁用组件（设置 `enabled = false`）后，输入不再响应；重新启用后恢复。
- 解绑后节点不应再响应输入。

## 常见错误

1. **忘记在 onDisable 中解绑**：组件 disable 后仍响应输入，enable 后重复注册导致回调被多次触发。
2. **多组件重复注册 input 事件**：如果多个组件都监听相同事件，注意各自的回调独立触发，不要假设只有一个监听者。
3. **未使用三参数 on/off 形式**：缺少 `this` 参数时 `off` 无法正确匹配解绑。
4. **节点位置直接使用 UTC 坐标**：`event.getUILocation()` 返回 UI 坐标，包含了 Canvas 缩放和位置偏移；如果节点在 Canvas 下，这是正确的。如果节点不在 UI 层级下，需使用 `event.getLocation()`（世界坐标）。
5. **触摸移动未使用 getUIDelta**：`getUIDelta()` 比 `getDelta()` 更适合 UI 空间中的移动计算。
6. **组件挂载在将被销毁的节点上**：如果父节点被动态销毁，input 事件仍存活导致内存泄漏。

## 相关文档

- [input API 卡片](../api-reference/input.md)
- [输入事件与传播](../scripting/input-events.md)
- [输入不触发排查](../troubleshooting/input-not-triggered.md)
