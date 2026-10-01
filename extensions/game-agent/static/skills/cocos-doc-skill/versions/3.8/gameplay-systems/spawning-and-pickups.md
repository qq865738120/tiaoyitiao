---
id: cocos-3.8-gameplay-systems-spawning-and-pickups
version: "3.8"
category: gameplay-systems
title: 生成与拾取系统
keywords:
  - 生成器
  - 刷怪
  - 拾取物
  - 掉落
  - 对象池
  - 触发器
  - 碰撞检测
  - 区域生成
  - 延迟生成
  - 波次系统
  - 交互拾取
  - 自动拾取
related_docs:
  - gameplay-systems/health-and-damage.md
  - gameplay-systems/skills-and-cooldowns.md
  - architecture/pooling-and-task-scheduling.md
  - assets/prefab.md
  - scene-node-component/scene-loading.md
related_api:
  - Node
  - Prefab
  - instantiate
  - NodePool
  - Collider2D
  - Contact2DType
  - Vec2
  - Vec3
  - Component
  - EventTarget
source:
  official: "Cocos Creator 3.8 官方文档 - 实例化、对象池、碰撞系统、事件系统"
  supplement:
    - "游戏系统设计经验：生成器模式、拾取物接口、触发区域交互、对象池集成、事件解耦的 Spawn/Pickup 通信"
status: draft
updated: 2026-06-18
---

# 生成与拾取系统

## 职责边界

### 该系统做什么

**生成器：**
- 定义何时、何地、生成什么对象（`SpawnConfig` 驱动）
- 管理生成频率（间隔、最大同时存在数）
- 集成对象池：生成 = 从池获取，回收 = 归还到池
- 波次控制（Wave System）：按阶段/时间/触发条件切换生成队列
- 发射生成事件，供其他系统响应

**拾取系统：**
- 定义拾取物的类型、价值和效果
- 管理拾取物的触发生命周期（生成 → 可拾取 → 被收集 → 回收）
- 处理碰撞进入触发区域后的自动拾取或交互拾取
- 发射拾取事件，供 UI/音效/Achievement 消费

### 该系统不做什么

- 不负责**被生成对象的具体行为**（AI 由 AI 系统管理，弹幕移动由 Projectile 组件管理）

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 状态

### Spawner 状态

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### Pickup 状态

```
pending ──spawn──→ active ──onPickup──→ collected ──recycle──→ pooled

                     │ (lifetime expired)
                     ↓
                   expired ──recycle──→ pooled
```

---

## 接口

### Spawner 生成器

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### Spawner 公共方法

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### Pickup 拾取物

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### Pickup 公共方法

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 拾取效果处理器（事件消费者）

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

---

## 组合与依赖

### 依赖关系

```
Spawner
  ├── 依赖 Prefab（被生成对象）
  ├── 依赖 NodePool（对象复用）
  ├── 发射事件 → 波次管理器 / UI（存活计数）/ 成就系统
  └── 不依赖其他组件

Pickup
  ├── 依赖 Collider2D（sensor 模式触发检测）
  ├── 发射事件 → PickupCollector / 音效 / UI
  └── 不依赖其他组件

PickupCollector
  ├── 调用 Health.heal（生命回复拾取）
  ├── 调用 SkillComponent（法力回复拾取）
  └── 发射事件 → Economy / Buff 系统（金币/增益拾取）

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 扩展点

| 扩展方式 | 适用场景 | 示例 |
|---|---|---|
| **波次系统（Wave System）** | 塔防/生存类游戏的阶段性刷怪 | `WaveManager` 管理波次队列，按时间/击杀数切换 Spawner 配置 |
| **条件生成（Conditional Spawn）** | 击杀 Boss 后刷小怪、特定区域激活后生成 | Spawner 监听外部事件，收到信号后 `spawn()` |
| **延迟生成队列** | 一次性生成大量对象时分帧生成 | 将 `spawn()` 调用放入队列，每帧处理 N 个 |
| **磁铁吸引** | 范围拾取道具（如 Vampire Survivors） | Pickup `update` 中检测范围内玩家，tween 飞向玩家 |
| **交互拾取（按键）** | 需要按键确认的拾取（如开门宝箱） | `config.requireInteract = true`，碰撞进入不拾取，按 E 键调用 `collect()` |
| **拾取过滤** | 只有特定角色/队伍可拾取 | 覆盖 `canBeCollectedBy` 检查 collector 的 tag 或所属队伍 |
| **掉落表（Loot Table）** | 击杀敌人时按概率掉落不同物品 | `LootManager.rollLoot(enemyType)` → 返回 PickupConfig 列表 → 生成多个 Pickup |

### 波次系统扩展示例

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 磁铁吸引扩展示例

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

---
