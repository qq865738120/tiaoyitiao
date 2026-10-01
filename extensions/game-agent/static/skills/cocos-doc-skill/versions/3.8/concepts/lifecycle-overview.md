---
id: cocos-3.8-concepts-lifecycle-overview
version: "3.8"
category: concepts
title: 组件生命周期概览
keywords:
  - 生命周期
  - onLoad
  - onEnable
  - start
  - update
  - lateUpdate
  - onDisable
  - onDestroy
  - 组件回调
  - 钩子顺序
related_docs:
  - api-reference/component.md
  - concepts/scene-node-component-model.md
related_api:
  - Component
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本 - 生命周期回调"
  verified-against: []
  supplement: []
status: draft
updated: 2026-06-17
---

# 组件生命周期概览

## 用途

说明 Component 从创建到销毁经历的完整生命周期钩子及其调用顺序。

## 核心结论

- 生命周期钩子按固定顺序执行，开发者只需定义对应方法即可，引擎自动调用。
- **onLoad → onEnable → start → update（循环）→ lateUpdate（循环）→ onDisable → onDestroy** 是完整的调用链。
- **onLoad 只执行一次**，在组件首次激活时触发，此时可安全访问场景中其他节点和资源。
- **start 在第一次 update 前执行一次**，适合初始化依赖帧循环的中间状态数据。
- **onEnable / onDisable** 随 `enabled` 属性或节点 `active` 属性变化反复触发。
- 同一节点上的组件执行顺序由**属性检查器中的排列顺序**和 **executionOrder** 控制。

## 什么时候使用

- 决定初始化逻辑放在 `onLoad` 还是 `start` 中。
- 理解 enable/disable 时发生了什么。
- 排查"为什么我的初始化代码没执行"或"为什么执行了多次"。
- 需要在特定时机绑定/解绑事件、注册/注销监听。

## 生命周期钩子顺序

```
节点创建 / 场景加载
  │
  ▼
onLoad()          ← 首次激活时执行一次。可安全访问场景节点和资源。
  │
  ▼
onEnable()        ← enabled 从 false→true 或节点 active 从 false→true 时触发。
  │                  （首次激活时在 onLoad 之后、start 之前）
  ▼
start()           ← 第一次 update 前执行一次。适合初始化中间状态。
  │
  ▼
┌─────────────────────┐
│  update(dt)         │  ← 每帧渲染前调用。游戏主逻辑所在。
│  lateUpdate(dt)     │  ← 每帧在所有 update 和动效更新之后调用。
│  （循环）            │
└─────────────────────┘
  │
  ▼
onDisable()       ← enabled 从 true→false 或节点 active 从 true→false 时触发。
  │                  （可反复：disable → enable → onEnable 再次触发）
  │
  ▼
onDestroy()       ← 组件或节点调用 destroy() 后触发。当帧结束时统一回收。
```

## 各钩子差异速查

| 钩子 | 触发时机 | 执行次数 | 典型用途 |
|---|---|---|---|
| `onLoad` | 首次激活 | 一次 | 获取场景中其他节点引用、加载资源数据 |
| `onEnable` | 组件/节点变为活跃 | 多次 | 注册事件监听、激活定时器 |
| `start` | 第一次 update 之前 | 一次 | 初始化依赖帧循环的中间状态 |
| `update` | 每帧渲染前 | 每帧 | 移动、状态更新、输入检测 |
| `lateUpdate` | 所有 update 和动效之后 | 每帧 | 跟随动画/物理结果做二次调整（如摄像机跟随） |
| `onDisable` | 组件/节点变为非活跃 | 多次 | 注销事件监听、暂停定时器 |
| `onDestroy` | 调用 destroy() 后 | 一次 | 清理资源、注销全局监听 |

## 关键规则

- **onLoad 保证在所有 start 之前完成**——可以利用这点安排脚本初始化顺序。
- **onDisable / onDestroy 不受 executionOrder 影响**——只有 onLoad、onEnable、start、update、lateUpdate 受执行顺序控制。
- **enabled 为 false 的组件不执行 update/lateUpdate**，但仍会响应 onLoad。
- **构造函数中不能访问 `this.node`**——此时组件尚未附加到节点上。

## 最小示例

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('LifecycleDemo')
export class LifecycleDemo extends Component {
  onLoad() {
    // ✅ 安全：可访问 this.node 和场景中其他节点
    console.log('onLoad:', this.node.name);
  }

  onEnable() {
    // ✅ 注册事件、激活监听
  }

  start() {
    // ✅ 初始化中间状态（依赖帧循环的数据）
  }

  update(deltaTime: number) {
    // ✅ 每帧逻辑
  }

  lateUpdate(deltaTime: number) {
    // ✅ 在所有 update 之后执行
  }

  onDisable() {
    // ✅ 注销事件、暂停计时
  }

  onDestroy() {
    // ✅ 最终清理
  }
}
```

## 常见错误

- **在 `onLoad` 中访问其他组件的 `start` 中才初始化的数据**——onLoad 时其他组件的 start 尚未执行。
- **在构造函数中访问 `this.node`**——组件尚未附加到节点，`this.node` 为 null。
- **忘记在 `onDisable` 中注销事件**——disable 后事件回调可能仍被触发，导致空引用。
- **在 `onDestroy` 中操作其他已销毁的节点**——销毁顺序不确定，应做空值检查。

## 关联文档

- [Component API 卡片](../api-reference/component.md)
- [场景、节点与组件模型](./scene-node-component-model.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本 - 生命周期回调、组件和组件执行顺序
