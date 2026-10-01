---
id: cocos-3.8-scripting-component-lifecycle
version: "3.8"
category: scripting
title: 组件生命周期与执行顺序
keywords:
  - onLoad
  - start
  - onEnable
  - onDisable
  - onDestroy
  - update
  - lateUpdate
  - 生命周期
  - executionOrder
  - 执行顺序
  - 组件顺序
  - 初始化
  - 跨节点
  - 统一调度
  - 游戏主循环
related_docs:
  - concepts/lifecycle-overview.md
  - scene-node-component/destroy-lifecycle.md
  - scripting/node-component-access.md
  - scripting/coding-pitfalls.md
  - architecture/game-loop-and-execution-order.md
  - api-reference/component.md
related_api:
  - Component
  - director
  - game
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本 - 组件和组件执行顺序、生命周期回调、装饰器"
  verified-against:
    - "Cocos Creator 3.8 引擎测试 - test-component-scheduler.js"
  supplement:
    - "工程经验：onLoad/start 选择决策、跨节点执行顺序策略、常见排查指引"
status: draft
updated: 2026-06-18
---

# 组件生命周期与执行顺序

## 用途

完整说明 Component 从创建到销毁经历的全部生命周期回调、同一节点上组件间的执行顺序控制、跨节点执行顺序的不确定性以及应对策略。

## 核心结论

- 生命周期钩子按固定顺序执行：**onLoad → onEnable → start → update（循环）→ lateUpdate（循环）→ onDisable → onDestroy**。
- `onLoad`：获取引用、加载配置。此时**所有节点的 onLoad 都已执行完毕**，跨组件引用安全。
- `start`：初始化依赖帧循环的中间状态。所有 `onLoad` 和 `onEnable` 已执行完毕。
- `update`：每帧逻辑更新。`lateUpdate`：所有 update 之后、渲染之前。
- `@executionOrder` 控制 onLoad/onEnable/start/update/lateUpdate 的执行顺序（数值越小越先执行，默认 0）。不影响 onDisable/onDestroy。
- 同节点组件执行顺序：executionOrder 优先于属性检查器排列顺序。
- 跨节点执行顺序不保证——依赖跨节点顺序时必须使用统一 Bootstrap/Manager 控制初始化。

## 常见问题

### Q1：为什么 onLoad 中获取其他组件为 null？

**原因**：对方组件可能尚未执行 onLoad。虽然 onLoad 阶段保证了所有节点的 onLoad 都已执行，但如果代码中的 `addComponent` 是动态触发的（例如在 onLoad 中动态添加子节点和组件），该动态添加的组件可能在当前 onLoad 之后才触发。

**解决**：
- 优先使用 `@property` 在编辑器中拖拽绑定引用，避免在 onLoad 中动态查找。
- 如果必须动态查找，改用 `start` 中获取（此时所有动态添加的 onLoad 也已执行完毕）。
- 对于同节点上的多个组件，确保对方的 executionOrder 比你小。

### Q2：为什么 start 中访问另一个脚本的值是旧的？

**原因**：对方的 start 可能比你的 start 先执行，对方在你的 start 中看到的是"上一帧残存"的值而非本帧更新后的值。或者对方使用 update 更新数据，而 start 在该 update 之前。

**解决**：
- 检查 executionOrder 和同节点排列顺序，确保双方的 start 执行顺序符合预期。
- 如果依赖对方 update 的结果，在 `lateUpdate` 中读取。
- 使用自定义方法 + 统一 Controller 显式控制调用顺序。

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 关联文档

- [组件生命周期概览（概念层）](../concepts/lifecycle-overview.md)
- [节点销毁与生命周期清理](../scene-node-component/destroy-lifecycle.md)
- [访问节点和组件](./node-component-access.md)
- [常见编码陷阱](./coding-pitfalls.md)
- [游戏主循环与执行顺序策略（架构层）](../architecture/game-loop-and-execution-order.md)
- [Component API 卡片](../api-reference/component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 组件和组件执行顺序、生命周期回调、装饰器
- 已验证：Cocos Creator 3.8 引擎测试 test-component-scheduler.js（生命周期钩子调用顺序、executionOrder 验证、父子节点激活顺序）
- 补充：工程经验——跨节点执行顺序策略、常见排查 FAQ、onLoad/start 决策速查
