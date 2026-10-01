# Architecture

本目录存放 Cocos Creator 3.8 的架构原理、模式选择、职责边界与 Cocos 落地方式。

## 分类说明

### 是什么

- 设计模式（如 MVC、ECS、Service Locator、Observer）在 Cocos 中的落地
- 模块/子系统间的职责边界、数据流方向、所有权
- 架构决策的适用条件、非适用条件与维护代价
- 跨模块通信机制（事件总线、全局管理器、依赖注入）的取舍
- 代码组织、分层策略、目录结构约定

### 不是什么

- 单一 API 的全量参数/返回值说明（属于 `api-reference/`）
- 逐步操作教程（属于 `recipes/`）
- 特定报错信息的排查指南（属于 `troubleshooting/`）
- 只描述 API 用法而不涉及架构取舍

## 文档列表

| 文档 | 说明 |
|---|---|
| [架构百科基础篇](./foundations.md) | 节点组件模型下的游戏架构原则、分层映射、使用场景区分与过度设计信号 |
| [game-loop-and-execution-order.md](./game-loop-and-execution-order.md) | 游戏主循环与执行顺序策略：三种初始化/更新顺序策略的适用场景与对比 |
| [services-events-and-dependencies.md](./services-events-and-dependencies.md) | 服务、事件与依赖管理模式：四种服务范围划分、五种依赖管理方式对比、事件通信规范与清理清单 |
| [ECS 与 Cocos 节点组件模型](./ecs-and-node-component.md) | ECS 概念解释、Cocos Component 对比、混合架构方案、迁移阈值分析 |
| [游戏主循环与执行顺序策略](./game-loop-and-execution-order.md) | 三种执行顺序策略：同节点隐式、跨节点隐式、统一显式调度 |
| [状态机与数据驱动设计](./state-machines-and-data-driven-design.md) | 四种状态机方案对比、四类状态（玩法/动画/输入/场景）职责边界、与动画系统交互 |
| [对象池与帧内任务调度策略](./pooling-and-task-scheduling.md) | NodePool/自定义池、回收协议、容量策略、泄漏防护、分帧/时间片/节流调度 |
| [game-data-and-save-architecture.md](./game-data-and-save-architecture.md) | 四类数据区分、存档 DTO 规则、版本迁移与恢复、配置管理架构 |
| [grid-and-dual-grid-tile-systems.md](./grid-and-dual-grid-tile-systems.md) | 网格坐标基础（方形/六边形）、双网格位掩码邻接与地形过渡、占用检测与增量刷新、A* 寻路前提 |

## 进入条件

创建 architecture 文档前，确认：

- 内容围绕**模式选择、设计权衡、职责划分**，而非单一 API 描述
- 有明确的**适用条件**和**非适用条件**
- 说明了**Cocos 中的具体落地方式**（代码结构、组件划分、通信路径）
- 量化或定性说明了**维护代价**（复杂度、性能影响、团队成本）

## 排除条件

以下内容不适合放入 architecture/：

- 某个具体组件的 API 属性列表（如 "Label 的 font 属性有哪些值"）
- 纯引擎内置行为说明，不含架构决策（如 "onLoad 的执行时机"）
- 不涉及模式或边界讨论的纯操作步骤
- 专属于某个具体游戏项目的业务架构设计

## 章节模板

新架构文档应包含以下章节：

1. **概述**：解决的问题、核心思想
2. **适用条件**：什么场景下应该选择此模式/方案
3. **非适用条件**：什么场景下**不应该**使用（反例 + 原因）
4. **Cocos 落地方式**：在 Cocos Creator 3.8 中的具体实现、组件划分、代码结构
5. **数据流与所有权**：谁持有状态、谁修改、谁消费
6. **可组合性**：与其它模式的组合方式与冲突
7. **维护代价**：复杂度、性能影响、测试难度、新人理解成本
8. **已知替代方案**：不同方案对比与选择建议
9. **常见误区**：使用该模式时的典型错误认知

## ID 格式

```
cocos-3.8-architecture-{slug}
```

示例：`cocos-3.8-architecture-service-locator`

## related_docs 约定

使用相对于 `versions/3.8/` 的路径：

```yaml
related_docs:
  - architecture/service-locator.md
  - concepts/engine-overview.md
```
