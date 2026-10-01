---
id: cocos-3.8-architecture-foundations
version: "3.8"
category: architecture
title: 架构百科基础篇 —— 节点组件模型下的游戏架构原则
keywords:
  - 架构基础
  - 节点组件模型
  - 组合优先于继承
  - 职责边界
  - 显式依赖
  - 状态归属
  - 数据流方向
  - 分层架构
  - 表现层
  - 玩法层
  - 数据层
  - 服务层
  - 过度设计
  - 重构信号
  - 项目规模建议
related_docs:
  - architecture/game-loop-and-execution-order.md
  - scene-node-component/component.md
  - scene-node-component/node.md
  - scene-node-component/common-patterns.md
related_api:
  - Component
  - Node
  - _decorator
source:
  official: "Cocos Creator 3.8 官方文档 - 节点与组件系统、脚本开发指南"
  supplement:
    - "工程经验：游戏架构原则在 Cocos Creator 中的适用边界与权衡分析"
    - "社区实践：多个开源 Cocos 项目的目录结构与分层模式调研（ev-621）"
status: draft
updated: 2026-06-18
---

# 架构百科基础篇 —— 节点组件模型下的游戏架构原则

## 适用条件

- 项目开始出现跨节点、跨场景或跨系统的数据流问题，需要先确定职责边界。
- 组件开始承担输入、状态、表现和资源加载等多类职责，需要拆分为更稳定的组合。
- 团队需要统一 Cocos 节点、组件、服务、配置和存档的分层语言。

## 非适用条件

- 只是在查询某个 API 属性、参数或最小用法，应转到 API 或任务卡片。
- 问题是单点运行时报错，应先使用 troubleshooting 分诊。
- 项目规模很小且没有跨模块协作成本，不应提前引入复杂服务层或框架。

## Cocos落地

在 Cocos Creator 3.8 中，架构边界应贴合 Node/Component：编辑器可配置数据放在 `@property`，运行时状态放在组件或普通对象，跨场景服务用显式初始化的常驻节点或服务对象承接，UI、音效、动画通过事件消费状态变化。

## 代价

架构分层会增加文件数、绑定关系和初始化顺序管理成本；只有当复用、测试、协作或重构收益超过这些成本时才值得引入。

## 概述

"架构百科"分类解决的核心问题是：**在 Cocos Creator 的节点组件模型下，如何做出正确的架构决策**。它不教具体 API 怎么用，而是回答"这个功能应该放在哪里""这两个模块应该怎么通信""现在需要引入分层吗"这类问题。

### 分类边界

**适用任务：**

- 项目初期架构选型（分几层、用不用事件总线、Manager 模式要不要引入）
- 现有项目重构评估（哪里过度设计了、哪里耦合太紧需要拆）
- 新人上手指南（理解 Cocos 的分层惯例，避免把后端/Unity/纯 ECS 经验生搬硬套）
- 跨模块通信方案决策（直接引用 vs 事件 vs 全局 Manager vs 依赖注入）

**非适用任务：**

- 具体 API 的使用方法和参数说明（属于 `api-reference/`）

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 关联文档

- [游戏主循环与执行顺序策略](./game-loop-and-execution-order.md)
- [组件系统](../scene-node-component/component.md)
- [节点系统](../scene-node-component/node.md)
- [常用开发模式](../scene-node-component/common-patterns.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 节点与组件系统、脚本开发指南
- 补充：工程经验——游戏架构原则在 Cocos Creator 中的适用边界与权衡分析。文中标注"已知事实"的内容来源于官方文档和引擎行为，标注"工程建议"的内容来源于社区实践和项目经验总结，两者已明确区分。
