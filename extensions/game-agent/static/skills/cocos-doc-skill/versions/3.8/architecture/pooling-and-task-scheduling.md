---
id: cocos-3.8-architecture-pooling-and-task-scheduling
version: "3.8"
category: architecture
title: 对象池与帧内任务调度策略
keywords:
  - 对象池
  - NodePool
  - 回收协议
  - 泄漏防护
  - 任务调度
  - 分帧
  - 时间片
  - 节流
  - 固定步长
  - FixedUpdate
  - 帧率解耦
  - GC 优化
  - 预热
  - 容量策略
related_docs:
  - recipes/use-node-pool.md
  - recipes/optimize-update-loop.md
  - architecture/game-loop-and-execution-order.md
related_api:
  - NodePool
  - Component.update
  - Component.schedule
  - instantiate
  - Node
  - Tween
source:
  official: "Cocos Creator 3.8 官方文档 - 对象池、脚本生命周期、调度器"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：对象池泄漏模式、帧内调度策略的适用边界与测量方法"
status: draft
updated: 2026-06-18
---

# 对象池与帧内任务调度策略

## 适用条件（对象池）

- 高频创建/销毁的对象（每秒 >10 次）
- 对象的生命周期短（< 5 秒）
- 创建/销毁开销大（Prefab instantiate + destroy）
- GC 抖动已导致可观测的帧率问题

## 非适用条件（对象池）

- 低频对象（每分钟 < 1 次创建）
- 创建/销毁开销极小（纯数据对象，不涉及节点）
- 对象实例之间存在显著差异（每个实例需加载不同资源）
- 项目处于原型阶段（优化收益不确定，代码复杂度不值得）

## Cocos落地

对象池在 Cocos Creator 3.8 中有两种落地方式：

1. **NodePool**：引擎内置，管理节点对象。通过构造参数传入组件名，`put()`/`get()` 时自动调用 `unuse()`/`reuse()` 生命周期回调。适用于所有需要频繁创建/销毁节点的场景。

2. **自定义对象池**：开发者实现，管理普通 TS 对象。无引擎依赖，通过 factory/reset 函数注入行为。适用于纯数据对象（如伤害数字数据、路径点数组）的复用。

任务调度依托引擎的 `Component.update(dt)` 和 `Component.schedule(callback, interval)` API：

- `update(dt)`：每帧回调，适合持续逻辑
- `schedule(callback, interval)`：定时回调，适合低频检查
- 分帧/时间片：自定义实现，在 `update` 中控制每帧处理量

## 代价

- **对象池**：中高。每个可池化对象必须实现回收协议（reset/unuse），遗漏项会导致难以调试的 bug。测试需覆盖 acquire/release/prewarm/overflow/clear 全部场景。池中节点 parent=null 增加调试难度。必须在 onDestroy 中清理，否则池中节点阻止场景释放。
- **任务调度**：低（schedule）到中（分帧/时间片）。分帧和时间片需要维护任务队列、进度跟踪、取消机制。未完成的分帧任务需有状态指示。

---

# 第二部分：任务调度

## 概述

高频创建/销毁节点会引发 GC 抖动和帧率不稳。对象池通过复用已有对象消除频繁分配/释放开销。帧内任务调度将重型逻辑切分到多帧或降频执行，保证渲染帧预算。两者结合是 Cocos 性能优化的核心手段。

---

# 第一部分：对象池

## 常见误区

1. **"对象池就是 new NodePool()"**：NodePool 只解决节点复用。完整的对象池策略还包括：回收协议设计、泄漏防护、容量监控、场景切换清理。
2. **"put 之后就不需要管了"**：put 不会自动清除事件监听、Tween、定时器。未清理的状态会在下次 get 时生效，导致难以排查的 bug。
3. **"池越大越好"**：池容量过大会占用大量内存。应根据运行时 `maxActive` 动态调整。
4. **"所有对象都改对象池"**：池化增加代码复杂度。低频对象（< 1/min）创建/销毁本身开销可忽略。
5. **"分帧后事情做得更慢了"**：分帧的目的是防止单帧卡顿，总时间可能更长。体验上好于单帧大卡顿。
6. **"用 schedule 替代 update 就能解决所有性能问题"**：schedule 适合低频逻辑。高频 update 优化应关注算法复杂度、对象复用和缓存引用。
7. **"时间片适合所有场景"**：时间片增加任务管理开销。简单逻辑直接用 schedule 或节流。
8. **"对象池回收 = node.destroy()"**：池的目的是复用，应 `pool.put()` 而非 `destroy()`。

---

## 关联文档

- [使用对象池](../recipes/use-node-pool.md)
- [优化 update 循环](../recipes/optimize-update-loop.md)
- [游戏主循环与执行顺序策略](./game-loop-and-execution-order.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 对象池 API（NodePool）、脚本生命周期 API（update、schedule、scheduleOnce）
- 已验证：cc-engine 3.8 公开类型声明（NodePool.get/put/size/clear 签名）
- 补充：工程经验——对象池泄漏模式、回收检查表、容量测量方法、帧内调度策略的适用边界

## 池化决策

### 适合池化

| 类型 | 特征 | 典型场景 |
|---|---|---|
| 子弹/炮弹 | 高频创建、快速销毁 | STG / 射击游戏 |
| 敌人/怪物 | 波次生成、死亡回收 | ARPG / 塔防 |
| 飘字/伤害数字 | 创建频繁、生命周期短 | RPG / 动作游戏 |
| 列表项/ScrollView Cell | 滚动时高频复用 | UI 滚动列表 |
| 掉落物 | 频繁生成、拾取即销毁 | 所有游戏类型 |
| 粒子效果 | 短生命周期、重复播放 | 爆炸、技能特效 |
| 音效节点 | 频繁播放短音效 | AudioSource 节点复用 |

### 不适合池化

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 数据流与所有权

```
PoolManager (所有者)
 ├─ _pool (NodePool)      ← 持有所有池中节点
 ├─ _activeNodes (Set)    ← 跟踪已发出节点
 ├─ acquire() → 发出节点
 └─ release() ← 回收节点

外部使用者 → 不持有节点所有权，仅借用
             归还时必须调用 release()
             禁止自行 destroy()
```

## 可组合性

对象池可与以下模式组合：

- **统一调度（Game）**：Game 持有 PoolManager，统一控制各池的预热时机和清理时机
- **事件总线（EventBus）**：发出/回收节点时广播事件，供统计/调试使用
- **状态机**：回收节点时统一触发"回到待机"状态转换

## 已知替代方案

| 方案 | 对比 | 场景 |
|---|---|---|
| **直接 instantiate/destroy** | 代码简单，GC 开销大 | 低频场景、原型阶段 |
| **Web Worker 并行计算** | 不阻塞主线程，通信开销大 | 大量数据离线计算 |
| **WebAssembly 加速** | 执行速度快，开发成本高 | 路径计算、物理模拟 |
| **预制体变体（Prefab Variant）** | 编辑器变体减少代码，但仍是创建/销毁 | UI 面板变体 |
| **enable/disable 替代 create/destroy** | 不涉及池，但不复用，需提前创建所有节点 | 少量固定节点 |
