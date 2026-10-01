---
id: cocos-3.8-gameplay-systems-skills-and-cooldowns
version: "3.8"
category: gameplay-systems
title: 技能与冷却系统
keywords:
  - 技能
  - 冷却
  - 施法
  - 法力
  - 目标选择
  - 范围效果
  - 弹幕
  - Buff
  - 技能配置
  - 技能栏
  - GCD
  - 全局冷却
related_docs:
  - gameplay-systems/health-and-damage.md
  - gameplay-systems/spawning-and-pickups.md
  - architecture/services-events-and-dependencies.md
  - architecture/state-machines-and-data-driven-design.md
related_api:
  - Component
  - Node
  - Vec2
  - Vec3
  - EventTarget
source:
  official: "Cocos Creator 3.8 官方文档 - 组件开发、事件系统、调度器"
  supplement:
    - "游戏系统设计经验：技能冷却管理、施法流程、Effect 系统解耦、目标选择模式"
status: draft
updated: 2026-06-18
---

# 技能与冷却系统

## 职责边界

### 该系统做什么

- 定义技能的静态配置（冷却时间、消耗、目标类型）
- 管理每个技能的**冷却状态**和**剩余冷却时间**
- 执行施法流程：预检查 → 消耗资源 → 施法 → 执行效果 → 进入冷却
- 管理**法力/能量**等施法资源
- 提供技能效果的分发机制（范围伤害、弹幕、Buff 等）

### 该系统不做什么

- 不负责**技能 UI 的渲染**（技能图标、冷却遮罩是 UI 层，通过事件消费）
- 不负责**角色移动/动画的细节**（施法动作由 Animation 组件控制，技能系统只触发信号）
- 不负责**伤害的最终计算**（伤害由 Health 系统处理，技能只传递 DamageData）
- 不负责**Buff 的具体效果**（Buff 系统独立运行，技能只负责"施加 Buff"这一动作）
- 不负责**AI 的技能选择决策**（AI 只调用技能系统 API，决策逻辑在 AI 模块）

---

## 状态

### 冷却状态机

```
ready ──useSkill──→ onCooldown
  ↑                    │
  │                    ↓ (update: timer -= dt)
  └────timer <= 0──────┘
```

### 技能实例状态

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

---

## 接口

### 核心接口定义

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### CooldownManager

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 技能施法流程

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

---

## 组合与依赖

### 依赖关系

```
SkillComponent
  ├── 读取 ISkillConfig[]（技能配置）
  ├── 调用 Health.takeDamage / heal（通过 Effect 系统）
  ├── 调用 BuffSystem.applyBuff（施加 Buff）
  ├── 调用 Spawner.spawn（弹幕/召唤物）
  ├── 依赖 Input 系统获取 target/direction
  └── 发射事件 → UI（冷却图标）/ Animation（施法动画）/ Audio（技能音效）
```

### 挂载方式

```
Player (Node)
├── SkillComponent (Component)          ← 本系统
├── Health (Component)                  ← 被技能治疗/护盾引用

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 扩展点

| 扩展方式 | 适用场景 | 示例 |
|---|---|---|
| **新增 Effect 类型** | 自定义技能效果 | 召唤（summon）、位移（dash）、护盾（shield） |
| **GCD（全局冷却）** | 所有技能共享一个冷却周期 | 在 `canUseSkill` 中增加 GCD 计时器检查 |
| **技能升级** | RPG 中技能可升级（减少冷却、增加伤害） | 动态修改 `ISkillConfig` 中的数值 |
| **Combo 连招** | 在规定时间内连续使用技能触发额外效果 | 记录施法时间序列，匹配 combo 表 |
| **资源类型扩展** | 除法力外增加怒气/能量/弹药 | `ResourceManager` 统一管理多种资源类型 |
| **条件施法** | 仅在特定状态下可施放（如跳起） | `canUseSkill` 中增加状态机状态检查 |

### GCD 扩展

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

---
