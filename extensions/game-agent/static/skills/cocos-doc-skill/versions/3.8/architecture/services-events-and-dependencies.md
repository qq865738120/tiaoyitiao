---
id: cocos-3.8-architecture-services-events-and-dependencies
version: "3.8"
category: architecture
title: 服务、事件与依赖管理模式
keywords:
  - 全局服务
  - 场景服务
  - 单例
  - persistNode
  - 常驻节点
  - 事件总线
  - EventBus
  - 依赖注入
  - @property
  - 服务定位器
  - 发布订阅
  - 循环依赖
  - 内存泄漏
  - onDestroy
  - 事件取消订阅
  - AudioService
  - SaveService
  - SceneFlowService
  - 架构模式
related_docs:
  - architecture/game-loop-and-execution-order.md
  - scripting/component-lifecycle.md
  - scene-node-component/destroy-lifecycle.md
  - concepts/lifecycle-overview.md
related_api:
  - Component
  - Node
  - director
  - game
  - sys
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本生命周期、节点系统、事件机制"
  supplement:
    - "工程经验：四种服务范围划分、五种依赖管理方式对比、事件通信规范与清理清单"
status: draft
updated: 2026-06-18
---

# 服务、事件与依赖管理模式

## 适用条件

- 多个场景或多个系统需要共享配置、状态、音频、存档、网络等服务。
- 直接组件引用已经导致循环依赖、初始化顺序不清或测试困难。
- UI、玩法、音效、动画需要通过事件解耦副作用。

## 非适用条件

- 单个节点内部的简单协作优先使用 `@property` 或 `getComponent`。
- 一次性原型不需要抽象全局服务或事件总线。
- 高频逐帧数据同步不应走全局事件广播。

## Cocos落地

把跨场景服务放在明确创建的常驻节点或普通 TypeScript 服务对象中，由启动组件完成注册和销毁；组件之间优先显式绑定，跨系统通知才使用 `EventTarget` 或事件中心，并在 `onDestroy` 成对解绑。

## 代价

服务和事件能降低直接耦合，但会隐藏调用链；需要命名规范、生命周期清理和调试日志，否则问题会从“引用太多”变成“事件从哪来”。

## 概述

Cocos 项目中模块之间的通信与依赖管理直接影响代码的可维护性、可测试性和运行期稳定性。本文档定义了四种服务范围、五种依赖管理方式，以及事件通信的完整规范。

核心问题：一个模块如何获取它需要的另一个模块？答案取决于该模块的生命周期、耦合度和运行范围。

## 常见误区

1. **"单例解决一切依赖问题"**：单例适合真正的全局服务，不适合场景级或节点级功能。单例使测试困难和依赖隐式化。
2. **"事件总线比直接调用更松耦合，所以更好"**：松耦合不是无条件好的。一对一的服务调用使用事件会降低可追踪性和类型安全。事件更适合一对多广播。
3. **"常驻节点越多越方便"**：常驻节点是内存泄漏的主要来源之一。严格控制数量，非全局功能一律不持久化。
4. **"编辑器拖拽引用太麻烦，改成 `find` 查找"**：`find` 使用字符串路径，节点重命名后静默失败。`@property` 拖拽引用在节点重命名时编辑器会更新引用。
5. **"onDisable 中取消事件就够了，不需要 onDestroy"**：`onDisable` 在组件 disabled 时触发，但节点销毁时组件可能仍 enabled（先触发 onDestroy 再 onDisable 的顺序引擎不保证）。保险做法是 onDestroy 中清理。

---

## 关联文档

- [游戏主循环与执行顺序策略](./game-loop-and-execution-order.md)
- [组件生命周期与执行顺序](../scripting/component-lifecycle.md)
- [节点销毁与生命周期清理](../scene-node-component/destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本生命周期、节点系统、事件机制、系统 API
- 补充：工程经验——四种服务范围划分、五种依赖管理方式对比、事件命名与清理规范、滥用信号与修正策略

## 第五部分：依赖管理决策树

遇到"模块 A 需要访问模块 B"时，按以下流程决策：

<!-- 长示意图已压缩：保留上文结构与下文决策规则。 -->

---

## 已知替代方案

| 方案 | 适用场景 | 缺陷 |
|---|---|---|
| 服务定位器（ServiceLocator） | 需要运行时动态注册/替换服务 | 隐藏依赖、无法静态分析、类型不安全 |
| 依赖注入框架（IoC 容器） | 大型项目、大量服务 | 额外学习成本、Runtime 开销、Cocos 生态缺乏成熟方案 |
| Pub/Sub 中间件 | 复杂事件流、跨模块广播 | 额外依赖、增加抽象层 |

---
