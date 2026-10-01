---
id: cocos-3.8-scene-node-component-destroy-lifecycle
version: "3.8"
category: scene-node-component
title: 节点销毁与生命周期清理
keywords:
  - destroy
  - 销毁
  - onDestroy
  - 清理
  - 内存泄漏
  - isValid
  - 延迟销毁
  - 析构
related_docs:
  - api-reference/node.md
  - api-reference/component.md
  - scene-node-component/node.md
  - scene-node-component/component.md
  - scene-node-component/node-events.md
  - scene-node-component/common-patterns.md
  - concepts/lifecycle-overview.md
related_api:
  - Node
  - Component
  - isValid
  - destroy
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 创建和销毁节点"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：destroy 是延迟操作；onDestroy 中必须清理事件、定时器、外部引用"
status: draft
updated: 2026-06-17
---

# 节点销毁与生命周期清理

## 用途

说明 `destroy()` 的执行时机、销毁前需要清理什么，以及 `onDestroy` 中应做和不应做的事。

## 核心结论

- **`destroy()` 是延迟执行**：调用后节点在当前帧仍有效，下一帧才真正销毁。用 `isValid(node)` 判断是否已销毁。
- **销毁节点会自动递归销毁所有子节点**和挂载的所有组件。
- **`onDestroy` 中必须清理**：事件监听、定时器（schedule）、外部引用（全局单例、管理器注册）。
- **`onDestroy` 中不应对其他已销毁节点操作**（销毁顺序不确定）。

## destroy 的执行时机

```
调用 destroy()
  │
  ▼
当前帧：节点标记为 "待销毁"
  · isValid(node) 仍返回 true（默认模式）
  · update / lateUpdate 不再执行
  · onDisable 触发
  │
  ▼
帧末：真正销毁
  · onDestroy 触发（所有组件）
  · 递归销毁所有子节点
  · 释放引擎内部引用
  │
  ▼
下一帧：isValid(node) 返回 false
```

```ts
import { _decorator, Component, Node, isValid } from 'cc';

const { ccclass } = _decorator;

@ccclass('DestroyTimingExample')
export class DestroyTimingExample extends Component {
  destroyNode(target: Node) {
    target.destroy();

    // 当前帧仍在场景中
    console.log(target.name);         // 仍可访问
    console.log(isValid(target));     // true（默认模式）

    // 下一帧及之后
    // this.scheduleOnce(() => {
    //   console.log(isValid(target)); // false
    // }, 0);
  }
}
```

## onDestroy 清理清单

```ts
import { _decorator, Component, director, NodeEventType } from 'cc';

const { ccclass } = _decorator;

@ccclass('CleanupExample')
export class CleanupExample extends Component {
  private _callback: (() => void) | null = null;

  onLoad() {
    // 先注销再注册，避免重复
    director.on('someEvent', this.onDirectorEvent, this);
  }

  onEnable() {
    // 注册节点事件
    this.node.on(NodeEventType.TOUCH_START, this.onTouch, this);
  }

  onDisable() {
    // disable 时清理（可逆状态，非永久清理）
    this.node.off(NodeEventType.TOUCH_START, this.onTouch, this);
    this.unscheduleAllCallbacks();
  }

  onDestroy() {
    // ⚠️ 永久清理：组件即将被销毁

    // 1. 注销全局事件
    director.off('someEvent', this.onDirectorEvent, this);

    // 2. 清理节点事件（兜底）
    this.node.targetOff(this);

    // 3. 取消所有定时器
    this.unscheduleAllCallbacks();

    // 4. 从全局注册表中移除
    // GlobalRegistry.unregister(this);

    // 5. 清理外部引用
    this._callback = null;
  }

  private onTouch() {
    // 处理触摸
  }

  private onDirectorEvent() {
    // 处理全局事件
  }
}
```

**清理清单**：
1. ✅ 全局事件监听（director.on、game.on、systemEvent.on）
2. ✅ 节点事件监听（node.on）
3. ✅ 定时器（schedule、scheduleOnce）
4. ✅ 全局注册表/单例引用
5. ✅ 外部回调引用

## 销毁与 isValid

```ts
import { _decorator, Component, Node, isValid } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SafeAccessExample')
export class SafeAccessExample extends Component {
  @property(Node)
  targetNode: Node | null = null;

  doSomething() {
    // ❌ 错误：不检查就使用
    // this.targetNode.active = true;

    // ✅ 正确：先检查有效性
    if (this.targetNode && isValid(this.targetNode)) {
      this.targetNode.active = true;
    }
  }

  safeDestroy(target: Node) {
    if (isValid(target)) {
      target.destroy();
    }
  }
}
```

## 销毁节点的几种方式

| 方法 | 效果 | 使用场景 |
|---|---|---|
| `node.destroy()` | 销毁节点及其所有子节点 | 移除不需要的节点 |
| `node.destroyAllChildren()` | 销毁所有子节点，保留自身 | 清空容器 |
| `node.removeFromParent()` | 从父节点移除（不销毁） | 移走但保留节点 |
| `component.destroy()` | 销毁单个组件 | 移除特定功能 |

## 常见错误

1. **destroy 后继续使用**：`destroy()` 是延迟的，但销毁后不应再访问。应在逻辑上视为"已销毁"。
2. **onDestroy 中操作兄弟节点**：销毁顺序不确定，兄弟节点可能已被销毁。应判空。
3. **忘记清理全局注册**：组件注册到全局单例或管理器的回调/引用在 `onDestroy` 中必须注销。
4. **在 update 中 destroy 自身**：可以在 update 中调用 `this.node.destroy()`，但之后的代码应直接 return。
5. **多次 destroy**：重复调用 `destroy()` 不会出错但也没必要，先 `isValid` 判断可避免。

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [Component API 卡片](../api-reference/component.md)
- [组件生命周期概览](../concepts/lifecycle-overview.md)
- [节点事件：监听与解绑](./node-events.md)
- [常见模式与最佳实践](./common-patterns.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本系统 - 创建和销毁节点
- 已交叉验证：cc-engine 3.8 公开类型声明（Node.destroy、isValid）
- 补充：工程经验——onDestroy 清理清单是防止内存泄漏和空引用错误的必备实践
