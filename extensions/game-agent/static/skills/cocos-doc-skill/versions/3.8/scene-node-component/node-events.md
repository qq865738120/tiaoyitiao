---
id: cocos-3.8-scene-node-component-node-events
version: "3.8"
category: scene-node-component
title: 节点事件：监听与解绑
keywords:
  - 节点事件
  - 事件监听
  - node.on
  - node.off
  - 触摸事件
  - 事件解绑
  - TOUCH_START
  - 事件冒泡
related_docs:
  - api-reference/node.md
  - scene-node-component/destroy-lifecycle.md
  - scene-node-component/common-patterns.md
related_api:
  - Node
  - NodeEventType
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - 节点事件系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：忘记解绑是内存泄漏和空引用错误的常见原因"
status: draft
updated: 2026-06-17
---

# 节点事件：监听与解绑

## 用途

说明如何在节点上监听和解除系统事件（触摸、鼠标等）和节点内置事件（变换、子节点变化等），以及事件解绑的最佳实践。

## 核心结论

- **`node.on(type, callback, target)`** 注册事件监听；**`node.off(type, callback, target)`** 移除监听。
- **不传 `target` 参数时**，`off` 必须用同一个 callback 引用来解绑（不能用匿名函数）。
- **事件应在 `onEnable` 中注册、`onDisable` 中注销**，形成对称管理。
- **必须解绑**：未解绑的事件在节点销毁后触发会导致错误（虽引擎有一定保护，但不完全可靠）。

## 系统事件（触摸/鼠标）

### 触摸事件

```ts
import { _decorator, Component, NodeEventType } from 'cc';

const { ccclass } = _decorator;

@ccclass('TouchExample')
export class TouchExample extends Component {
  onEnable() {
    // 注册触摸事件，传入 this 作为 target（推荐）
    this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
  }

  onDisable() {
    // 注销事件（传入 target 可一次性清理该 target 所有回调）
    this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this);

    // 或一次性清理所有：
    // this.node.targetOff(this);
  }

  private onTouchStart(event: any) {
    console.log('触摸开始:', event.getLocation());
  }

  private onTouchMove(event: any) {
    console.log('触摸移动:', event.getDelta());
  }

  private onTouchEnd(event: any) {
    console.log('触摸结束');
  }
}
```

### 鼠标事件

```ts
import { NodeEventType } from 'cc';

// 类似触摸事件，使用不同的事件类型：
this.node.on(NodeEventType.MOUSE_DOWN, this.onMouseDown, this);
this.node.on(NodeEventType.MOUSE_UP, this.onMouseUp, this);
this.node.on(NodeEventType.MOUSE_MOVE, this.onMouseMove, this);
this.node.on(NodeEventType.MOUSE_ENTER, this.onMouseEnter, this);
this.node.on(NodeEventType.MOUSE_LEAVE, this.onMouseLeave, this);
this.node.on(NodeEventType.MOUSE_WHEEL, this.onMouseWheel, this);
```

## 节点内置事件

节点在状态变化时会派发内置事件，适合监听层级变化或变换更新：

| 事件类型 | 触发时机 | 常用场景 |
|---|---|---|
| `CHILD_ADDED` | 添加子节点 | 动态 UI 容器管理 |
| `CHILD_REMOVED` | 移除子节点 | 清理关联状态 |
| `PARENT_CHANGED` | 父节点改变 | 追踪节点层级变化 |
| `TRANSFORM_CHANGED` | 位置/旋转/缩放改变 | 响应变换更新 |
| `SIZE_CHANGED` | UITransform 尺寸改变 | UI 自适应 |
| `NODE_DESTROYED` | 节点被销毁 | 外部感知销毁 |
| `ACTIVE_IN_HIERARCHY_CHANGED` | 激活状态变化 | 处理可见性变化 |

```ts
import { _decorator, Component, NodeEventType } from 'cc';

const { ccclass } = _decorator;

@ccclass('NodeEventExample')
export class NodeEventExample extends Component {
  onEnable() {
    // 监听节点销毁事件
    this.node.on(NodeEventType.NODE_DESTROYED, this.onNodeDestroyed, this);

    // 监听变换变化
    this.node.on(NodeEventType.TRANSFORM_CHANGED, (type) => {
      // type 参数指示哪种变换发生了变化
      // if (type & Node.TransformBit.POSITION) { ... }
    });
  }

  onDisable() {
    this.node.off(NodeEventType.NODE_DESTROYED, this.onNodeDestroyed, this);
  }

  private onNodeDestroyed() {
    console.log('节点即将销毁');
  }
}
```

## 事件解绑最佳实践

### 推荐模式：onEnable/onDisable 对称管理

```ts
import { _decorator, Component, NodeEventType } from 'cc';
const { ccclass } = _decorator;

@ccclass('EventManageExample')
export class EventManageExample extends Component {
  onEnable() {
    // ✅ 在 onEnable 中注册
    this.node.on(NodeEventType.TOUCH_START, this.onTouch, this);
  }

  onDisable() {
    // ✅ 在 onDisable 中注销
    this.node.targetOff(this);  // 清理所有以 this 为 target 的事件
  }

  onDestroy() {
    // ✅ 兜底：确保清理
    this.node.targetOff(this);
  }

  private onTouch(event: any) {
    // 处理触摸
  }
}
```

### 使用 targetOff 简化管理

```ts
// targetOff 会清理所有以指定对象为 target 的事件回调
this.node.targetOff(this);
// 等同于对所有事件类型逐个 off
```

### 一次性事件

```ts
import { NodeEventType } from 'cc';

// once：自动在触发一次后解绑
this.node.once(NodeEventType.TOUCH_START, (event) => {
  console.log('只触发一次');
}, this);
```

## 事件冒泡

节点事件默认会沿父节点链向上冒泡：

```
子节点 TOUCH_START → 父节点 TOUCH_START → ... → 场景根节点
```

可以通过 `event.propagationStopped = true` 阻止冒泡：

```ts
this.node.on(NodeEventType.TOUCH_START, (event) => {
  event.propagationStopped = true;  // 阻止事件向上冒泡
}, this);
```

## 常见错误

1. **用匿名函数注册事件但无法解绑**：`off` 需要相同的 callback 引用，匿名函数无法匹配。应使用类方法或保存引用。
2. **忘记在 onDisable 中解绑**：组件 disable 后事件仍可能触发，导致异常。
3. **onDestroy 中访问已销毁对象**：销毁顺序不确定，事件回调中访问其他节点前应判空。
4. **重复注册**：同类型同 callback 多次注册会导致回调执行多次。在 `onEnable` 中注册前先 `off` 再 `on`。

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)
- [常见模式与最佳实践](./common-patterns.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - 节点事件系统
- 已交叉验证：cc-engine 3.8 公开类型声明（NodeEventType 枚举、Node.on/off/once/targetOff）
- 补充：工程经验——事件对称管理是防泄漏的基础模式
