---
id: cocos-3.8-gameplay-systems-health-and-damage
version: "3.8"
category: gameplay-systems
title: 生命与伤害系统
keywords:
  - 生命值
  - 伤害
  - 治疗
  - 死亡
  - 无敌帧
  - 伤害类型
  - 物理伤害
  - 魔法伤害
  - 真实伤害
  - 击退
  - 暴击
  - 护盾
  - 减伤
related_docs:
  - gameplay-systems/skills-and-cooldowns.md
  - gameplay-systems/spawning-and-pickups.md
  - architecture/services-events-and-dependencies.md
  - architecture/state-machines-and-data-driven-design.md
related_api:
  - Component
  - Node
  - EventTarget
  - Vec2
  - Collider2D
source:
  official: "Cocos Creator 3.8 官方文档 - 组件开发、事件系统"
  supplement:
    - "游戏系统设计经验：Health/Damage 系统的职责边界、无敌帧、伤害类型、事件解耦模式"
status: draft
updated: 2026-06-18
---

# 生命与伤害系统

## 职责边界

### 该系统做什么

- 管理最大生命值（maxHp）和当前生命值（currentHp）
- 提供 `takeDamage` 统一入口处理所有伤害来源
- 提供 `heal` 统一入口处理所有治疗
- 管理无敌状态（invincibility）及其持续时间
- 在生命值归零时触发死亡流程
- 通过事件发射状态变化，供 UI/音效/动画监听

### 该系统不做什么

- 不负责**伤害来源的判定**（碰撞检测由物理系统处理，技能范围由技能系统处理）
- 不负责**UI 显示**（血条、数字飘字是独立 UI 组件，通过事件消费）
- 不负责**Buff/Debuff 逻辑**（持续伤害/治疗由 Buff 系统通过 `takeDamage`/`heal` 接口驱动）
- 不负责**死亡动画播放**（动画由状态机或 Animation 组件独立控制）
- 不负责**对象销毁或对象池回收**（死亡事件发出后，由专门的 LifecycleManager 或 Spawner 处理）

---

## 状态

### 状态定义

```
         active ──takeDamage──→ active
            │                    │
            │                    ↓ (currentHp <= 0)
            │                  dying
            │                    │
            │                    ↓ (死亡动画/延迟结束)
            │                  dead
            │
            └──enterInvincibility──→ invincible
                                         │
                                         └──duration elapsed──→ active
```

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 状态转换表

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 接口

### 核心接口定义

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 公共方法

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 事件清单

| 事件名 | 参数 | 触发时机 |
|---|---|---|
| `health:damaged` | `DamageData` | 受到伤害且伤害生效后 |
| `health:healed` | `amount: number` | 收到治疗且治疗生效后 |
| `health:died` | 无 | 生命值归零，死亡判定完成 |
| `health:invincibility-start` | 无 | 进入无敌状态 |
| `health:invincibility-end` | 无 | 无敌时间结束 |
| `health:knockback` | `Vec2` | 受到伤害且包含击退方向 |

### 监听者示例

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 组合与依赖

### 依赖关系

```
Health 组件
  ├── 不依赖其他组件（自包含）
  ├── 接收外部驱动：Collider2D（碰撞）→ takeDamage
  ├── 接收外部驱动：SkillEffect → takeDamage / heal
  └── 发射事件 → UI / Animation / Spawner 消费
```

### 挂载方式

```
Player (Node)
├── Health (Component)       ← 本系统
├── CharacterMovement (Component)
├── Collider2D (Component)   ← 碰撞检测 → 调用 health.takeDamage()
└── Animation (Component)    ← 监听 health 事件 → 播放受击/死亡动画

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 扩展点

| 扩展方式 | 适用场景 | 示例 |
|---|---|---|
| **子类覆盖 `applyDamageReduction`** | 不同类型的护甲/抗性计算公式 | 物理伤害 `armor * 0.5`、魔法伤害 `magicResist * 0.3` |
| **事件监听** | UI/音效/动画等副作用 | 血条更新、受击特效、伤害数字飘字 |
| **Buff 系统注入** | 通过 `takeDamage` 入口驱动持续伤害 | 中毒 Buff：每 0.5 秒 `health.takeDamage({amount: 5, type: True})` |
| **Shield 装饰模式** | 额外护盾层 | 伤害先由 Shield 吸收，剩余穿透给 Health |
| **自定义死亡行为** | 不同单位的死亡特效/回收策略 | `health.events.on('health:died', () => pool.release(this.node))` |

### Shield 示例（装饰模式）

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

---
