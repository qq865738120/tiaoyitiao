---
id: cocos-3.8-architecture-state-machines-and-data-driven-design
version: "3.8"
category: architecture
title: 状态机与数据驱动设计
keywords:
  - 状态机
  - 有限状态机
  - FSM
  - 状态模式
  - 表驱动
  - 数据驱动
  - 动画状态机
  - 玩法状态
  - UI状态
  - 输入状态
  - 场景流程
  - 状态爆炸
  - 状态转换
  - enter
  - exit
  - transition
  - guard
  - 子状态机
related_docs:
  - concepts/animation-graph.md
  - concepts/animation-blending.md
  - architecture/game-loop-and-execution-order.md
  - scripting/component-lifecycle.md
related_api:
  - Component
  - AnimationController
  - Animation
  - director
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - 动画图 Marionette、脚本开发"
  supplement:
    - "游戏编程经典模式：State Pattern、Finite State Machine、表驱动状态机"
    - "工程经验：四种状态（玩法/动画/输入/场景）的职责边界与交互方式"
status: draft
updated: 2026-06-18
---

# 状态机与数据驱动设计

## 适用条件

- 角色、UI、关卡流程或动画状态已经出现互斥状态和清晰转换条件。
- 需要把输入、动画、技能、受击和死亡等流程从布尔变量组合中拆出来。
- 策划配置、关卡配置或技能配置需要驱动一组可扩展行为。

## 非适用条件

- 只有两三个线性步骤，用普通方法或枚举分支更清晰。
- 状态没有互斥关系，强行状态机会制造额外样板。
- 配置结构尚未稳定时，不要过早做大型数据驱动框架。

## Cocos落地

状态机可作为 Component 内的普通 TypeScript 对象，也可以拆成独立 State 类；动画状态应通过 Animation/AnimationController 参数或事件同步，不要让动画图直接承载玩法状态；配置数据用 JSON/Scriptable 资源风格的 DTO 表达，运行时再转为行为对象。

## 代价

状态机提升边界清晰度，但增加状态类、转换表和调试成本；数据驱动降低硬编码，却要求 schema、校验和版本迁移，否则配置错误会推迟到运行时暴露。

## 概述

游戏对象的行为随玩家操作、物理碰撞、动画播放而变化。状态机（Finite State Machine, FSM）将这些离散行为模式化为有限状态集合，并通过明确的转换规则管理状态间的切换。

本文覆盖四种常见状态机方案在 Cocos Creator 3.8 中的落地方式，并严格区分**玩法状态、动画状态、输入状态、场景流程状态**四类易混淆概念，帮助开发者做出正确的架构选择。

## 常见误区

1. **"把 Animation Graph 当游戏逻辑状态机用"**：Animation Graph 只管理动画过渡，不应在其中定义游戏逻辑状态转换。玩法状态机是源，Animation Graph 是呈现。

2. **"动画状态可以驱动玩法状态"**：这是最常见的架构倒置。动画事件不应修改玩法状态——动画可能被中断、跳过或不出现在某些配置下。

3. **"所有状态都应该放进一个状态机"**：不同维度的状态（移动、武器、buff）应使用独立状态机或子状态机，避免笛卡尔积爆炸。

4. **"enum + switch 就够了"**：对 3–5 个状态的简单角色确实够了。但一旦超过 7 个状态，switch 的可维护性急剧下降。从项目开始就评估状态数量预期，选择合适方案。

5. **"状态机必须每帧 update"**：不是所有状态都需要每帧逻辑。比如 `Dead` 状态可能只需要 `enter` 时播放死亡动画并禁用碰撞，`update` 可以为空。

6. **"动画事件是可靠的时序机制"**：动画事件依赖动画播放。如果动画被跳过、中断或播放速度改变，事件触发可能不符合预期。对于关键逻辑时序，使用代码中的计时器而非依赖动画事件。

---

## 关联文档

- [动画图（Animation Graph）](../concepts/animation-graph.md)
- [动画混合、分层与过渡](../concepts/animation-blending.md)
- [游戏主循环与执行顺序策略](./game-loop-and-execution-order.md)
- [组件生命周期与执行顺序](../scripting/component-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统 - 动画图 Marionette、脚本开发 - 组件
- 补充：游戏编程经典模式（State Pattern、Finite State Machine、表驱动状态机、分层状态机/HFSM）在 Cocos 中的落地适配
- 工程经验：四类状态（玩法/动画/输入/场景）的职责边界混淆是游戏开发中高频架构问题

## 第一部分：状态机方案对比

### 1. enum + switch（最简枚举状态机）

**描述：** 使用枚举定义状态，在 `update` 中通过 `switch` 分发逻辑，`changeState` 统一处理状态切换。

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**适用条件：**

- 状态数量在 **3–5 个**，状态转换逻辑简单
- 单个脚本控制一个角色/对象，不需要跨对象协调
- 原型阶段快速验证玩法

**非适用条件：**

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 数据流与所有权

```
        InputManager ───→ PlayerController (玩法状态机 Owner)
                              │
                              ├─→ AnimationController (setValue 驱动动画)
                              │
                              └─→ UI 系统 (HUD 更新)

        GameFlowController (场景流程状态机 Owner)
            │
            ├─→ director.pause() / resume()
            ├─→ InputManager (切换输入模式)
            └─→ UI 节点 (Loading / HUD / Pause / GameOver)
```

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 可组合性

| 组合 | 说明 |
|---|---|
| 玩法状态机 + Animation Graph | 标准模式，玩法状态通过 `setValue` 驱动动画参数 |
| 场景流程 + 玩法状态 | 场景流程控制 `director.pause()` 和输入模式，玩法状态机本身不需要感知场景状态 |
| 表驱动 + State 类 | 表驱动定义转换规则，State 类实现具体逻辑——灵活性和表达能力兼备 |
| 输入状态 + 玩法状态 | 输入状态决定按键路由，玩法状态接收过滤后的输入指令 |

**避免的组合：**

- Animation Graph 事件 → 直接修改玩法状态（绕过状态机，违反单向数据流）

---

## 已知替代方案

| 方案 | 适用场景 | 缺陷 |
|---|---|---|
| 行为树（Behavior Tree） | 复杂 AI 决策、条件分层评估 | 学习曲线陡峭；过度设计场景少的小型游戏 |
| 协程驱动 | 线性时序行为（如剧情步骤） | 非状态驱动，无状态查询能力；打断和恢复困难 |
| ECS（Entity Component System） | 大量实体并行处理 | 架构重量级；Cocos 3.8 无原生 ECS 支持 |
| 纯事件驱动（无状态） | 松耦合简单交互 | 行为不可预测；缺乏全局可查询状态 |

---
