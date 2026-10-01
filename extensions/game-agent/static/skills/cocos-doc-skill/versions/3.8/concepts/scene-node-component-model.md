---
id: cocos-3.8-concepts-scene-node-component-model
version: "3.8"
category: concepts
title: 场景、节点与组件模型
keywords:
  - 节点 Node
  - 组件 Component
  - 场景 Scene
  - 预制体 Prefab
  - 节点组件关系
  - EC 架构
  - Entity Component
  - 实体组件系统
related_docs:
  - api-reference/node.md
  - api-reference/component.md
  - api-reference/prefab.md
  - concepts/lifecycle-overview.md
  - recipes/create-node-and-component.md
  - recipes/instantiate-prefab.md
related_api:
  - Node
  - Component
  - Prefab
source:
  official: "Cocos Creator 3.8 官方文档 - 概念 - 节点和组件"
  verified-against: []
  supplement: []
status: draft
updated: 2026-06-17
---

# 场景、节点与组件模型

## 用途

解释 Cocos Creator 3.8 中 Scene、Node、Component、Prefab 四者之间的关系和设计思想。

## 核心结论

- **Scene（场景）是节点的根容器**。一个场景就是一个以根节点为起点的节点树。
- **Node（节点）是承载体**，负责管理空间变换（位置、旋转、缩放）和父子层级关系。
- **Component（组件）是功能体**，挂载到 Node 上赋予其行为（渲染、动画、物理、自定义脚本等）。
- **Prefab（预制体）是可复用的节点树模板**，实例化后生成的节点与手动搭建的节点完全等价。
- Cocos 采用 **Entity-Component（EC）架构**：实体（Node）提供容器能力，组件提供功能，以**组合代替继承**来构建游戏对象。
- Component 通过 `this.node` 访问所属节点，通过 `this.node.getComponent()` 访问同节点上的其他组件。

## 什么时候使用

- 理解 Cocos 的核心设计思想，与 Unity GameObject 或纯 ECS 做对比。
- 理解为什么一个 Node 上可以挂多个 Component，以及它们如何协作。
- 理解 Prefab 的定位——什么时候应该做成 Prefab。

## 与 Unity / 纯 ECS 的高层对比

| 方面 | Cocos Creator 3.8 | Unity | 纯 ECS |
|---|---|---|---|
| 实体 | `Node`（有空间变换能力） | `GameObject`（有空间变换能力） | Entity（无数据的纯 ID） |
| 组件基类 | `Component` | `MonoBehaviour` / 内置组件 | 纯数据 Component（无行为） |
| 脚本组件 | 继承 `Component`，可访问 `this.node` | 继承 `MonoBehaviour`，可访问 `gameObject` | System 中操作 Entity + Component |
| 预制体 | Prefab：序列化的节点树 | Prefab：序列化的 GameObject 层级 | 无直接等价概念 |
| 设计哲学 | 以组合代替继承，实体+组件 | 以组合代替继承，实体+组件 | 数据与行为彻底分离 |

Cocos 的模型与 Unity 非常接近，但比纯 ECS 更易上手；节点本身带有空间变换能力（不像纯 ECS 中 Entity 只是 ID）。

## 关键 API / 组件

- `Node`：节点类，管理父子层级和空间变换。
- `Component`：所有组件（包括脚本）的基类。
- `Prefab`：预制体资源类，可通过 `instantiate()` 生成节点实例。

## 最小示例

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
  start() {
    // Component 通过 this.node 访问所属节点
    console.log(this.node.name);

    // 通过节点获取同节点上的其他组件
    const other = this.node.getComponent('OtherComponent');
  }
}
```

## 常见错误

- 在构造函数中访问 `this.node`——此时组件尚未附加到节点，`this.node` 为 `null`。初始化逻辑应放在 `onLoad` 或 `start` 中。
- 一个节点上挂载多个渲染组件（MeshRenderer、Sprite、Label 等）——每个节点只能有一个渲染组件。
- 试图用 `new MyComponent()` 创建组件——组件必须通过 `node.addComponent()` 创建。

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [Component API 卡片](../api-reference/component.md)
- [Prefab API 卡片](../api-reference/prefab.md)
- [生命周期概览](./lifecycle-overview.md)
- [创建节点与组件（Recipe）](../recipes/create-node-and-component.md)
- [实例化预制体（Recipe）](../recipes/instantiate-prefab.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 概念 - 场景 - 节点和组件
