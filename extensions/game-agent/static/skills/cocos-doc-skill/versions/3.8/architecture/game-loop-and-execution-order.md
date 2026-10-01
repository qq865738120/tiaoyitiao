---
id: cocos-3.8-architecture-game-loop-and-execution-order
version: "3.8"
category: architecture
title: 游戏主循环与执行顺序策略
keywords:
  - 游戏主循环
  - 执行顺序
  - executionOrder
  - 统一调度
  - Bootstrap
  - Manager
  - 初始化顺序
  - 更新顺序
  - 跨节点
  - 同节点
  - 架构模式
related_docs:
  - scripting/component-lifecycle.md
  - concepts/lifecycle-overview.md
  - scene-node-component/destroy-lifecycle.md
related_api:
  - Component
  - director
  - game
source:
  official: "Cocos Creator 3.8 官方文档 - 组件和组件执行顺序、生命周期回调"
  verified-against:
    - "Cocos Creator 3.8 引擎测试 - test-component-scheduler.js"
  supplement:
    - "工程经验：三种执行顺序策略的适用场景与权衡分析"
status: draft
updated: 2026-06-18
---

# 游戏主循环与执行顺序策略

## 适用条件

- 原长文未提供可保留的紧凑段落；按本页 frontmatter 与关联文档补齐该必需章节。

## 非适用条件

- 原长文未提供可保留的紧凑段落；按本页 frontmatter 与关联文档补齐该必需章节。

## Cocos落地

优先用 Cocos 生命周期和 `@executionOrder` 解决同节点或少量组件顺序；跨节点、跨系统顺序改用显式 Bootstrap/Manager 在 `start` 后统一调度；需要编辑器绑定的依赖在 `onLoad` 检查，避免在 `update` 中反复查找。

## 代价

显式调度提高可追踪性，但会削弱组件自治，增加调度器维护成本；`@executionOrder` 操作简单，但顺序分散在装饰器和编辑器排列中，团队协作时更难审计。

## 概述

Cocos Creator 的组件生命周期和游戏主循环为开发者提供了多层次的执行顺序控制手段。根据控制粒度、可靠性和可维护性，分为三种策略：**同节点隐式顺序**、**跨节点隐式顺序** 和 **统一显式调度**。

选择哪种策略取决于：组件的耦合程度、项目规模、团队协作模式和对引擎内部行为的依赖程度。

## 常见误区

1. **"executionOrder 可以控制一切"**：只控制 onLoad/onEnable/start/update/lateUpdate，不控制 onDisable/onDestroy。跨节点也不生效。
2. **"父节点组件一定比子节点组件先 update"**：引擎测试证实了这一点，但不应依赖——引擎不将此作为公开 API 保证。
3. **"使用统一调度后可以完全放弃引擎 update"**：可以，但需确保引擎的 update 被禁用（`this.enabled = false` 或在组件类中不定义 update 方法）。
4. **"统一调度太麻烦，小项目直接用 executionOrder 就好"**：小项目的确可以。但一旦需要跨节点协调，executionOrder 就失效了。从项目开始就使用统一调度可以避免日后的重构成本。
5. **"把所有组件引用拖拽到 Game 上很麻烦"**：可以使用 `find` 辅助，但更好的做法是按模块分组，使用中间管理器（如 `ConfigManager`、`UIManager`），Game 只调度 Manager。

## 关联文档

- [组件生命周期与执行顺序](../scripting/component-lifecycle.md)
- [组件生命周期概览](../concepts/lifecycle-overview.md)
- [节点销毁与生命周期清理](../scene-node-component/destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 组件和组件执行顺序（统一控制脚本模式、executionOrder、排列顺序）
- 已验证：Cocos Creator 3.8 引擎测试 test-component-scheduler.js（父子节点激活/销毁顺序、executionOrder 行为、动态 addComponent 的 onLoad 时机）
- 补充：工程经验——三种执行顺序策略的适用边界、权衡分析、常见误区

## 已知替代方案

| 方案 | 适用场景 | 缺陷 |
|---|---|---|
| 事件驱动（EventBus） | 松耦合初始化通知 | 无法保证顺序；调试困难 |
| Promise/async 链 | 异步初始化依赖 | 仅控制单次初始化，不涉及 update 循环 |
| 状态机切换 | 复杂状态初始化 | 额外复杂度；非游戏主循环问题 |
