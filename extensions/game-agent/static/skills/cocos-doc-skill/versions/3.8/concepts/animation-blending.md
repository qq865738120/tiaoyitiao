---
id: cocos-3.8-concepts-animation-blending
version: "3.8"
category: concepts
title: 动画混合、分层与过渡
keywords:
  - 动画混合
  - 动画分层
  - 动画过渡
  - crossFade
  - 图层混合
  - 骨骼动画叠加
  - 状态切换
  - Animation
  - SkeletalAnimation
  - AnimationController
related_docs:
  - concepts/animation-graph.md
  - api-reference/animation.md
  - api-reference/skeletal-animation.md
  - api-reference/animation-controller.md
  - recipes/animation-event-callback.md
  - recipes/play-animation.md
  - recipes/switch-animation-state.md
  - troubleshooting/animation-event-not-fired.md
related_api:
  - Animation
  - SkeletalAnimation
  - AnimationController
  - AnimationClip
  - AnimationState
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "Animation 组件与 AnimationController 不能同时控制同一动画资源"
    - "叠加动画（additive）必须配置在叠加层级，否则模型异常"
status: draft
updated: 2026-06-18
---

# 动画混合、分层与过渡

## 核心结论

Cocos Creator 3.8 提供三套动画控制手段：**Animation 组件**（基础播放/过渡）、**SkeletalAnimation 组件**（带骨骼挂点的角色动画）和 **AnimationController 组件**（动画图/状态机驱动）。选择哪一套取决于动画的复杂度和控制需求。

- **状态切换（Transition）**：动画图状态机中状态之间的有向跳转，根据参数条件自动评估和执行。
- **过渡（CrossFade）**：在指定时长内将一个动画淡出、另一个淡入，两种动画在过渡期间同时存在。
- **混合（Blend）**：通过混合参数（0-1 浮点、2D 坐标等）将多个动画按权重合并，产生连续变化的动作（如根据速度插值走/跑）。
- **分层（Layer）**：多个动画图层并行运行，上层可覆盖下层同一骨骼的输出，通过图层权重控制混合比例。

## 动画系统组件边界

### Animation 组件

基础动画组件，适合简单动画播放和过渡。适用于 UI 动效、单对象动画、不需要骨骼挂点的 2D/3D 动画。

关键方法：

| 方法 | 说明 |
|---|---|
| `play(name?)` | 立即播放指定动画剪辑。无参数时播放 `defaultClip`。 |
| `crossFade(name, duration?)` | 在指定时长内从当前动画平滑过渡到目标动画。`duration` 默认为 0.3 秒。 |
| `pause()` | 暂停所有动画。 |
| `resume()` | 恢复所有动画。 |
| `stop()` | 停止所有动画。 |
| `getState(name)` | 获取指定剪辑的 `AnimationState`，用于控制 speed、time、wrapMode 等。 |

动画状态通过 `AnimationState` 控制：

```ts
const state = anim.getState('Run');
if (state) {
  state.speed = 2.0;              // 2 倍速播放
  state.wrapMode = AnimationClip.WrapMode.Loop; // 循环模式
}
```

### SkeletalAnimation 组件

继承 `Animation` 组件，**拥有 Animation 的全部能力**，额外增加骨骼挂点（Socket）功能。适用于 3D 角色骨骼动画的播放和管理。

```ts
// SkeletalAnimation 继承 Animation，因此可以调用
// play() / crossFade() / pause() / resume() / stop() / getState()
const skelAnim = this.getComponent(SkeletalAnimation);
skelAnim?.play('Walk');

// 骨骼挂点——将子节点附加到指定骨骼上
const socket = new Socket('root/spine/bone_hand', targetNode);
skelAnim.sockets = [socket];
```

`SkeletalAnimation` 的 `sockets` 属性使其在角色动画挂载武器/装备时不可替代。如果不需要 Socket 功能，直接使用 `Animation` 组件即可。

### AnimationController 组件

Marionette 动画系统的运行时组件，绑定额外的 `AnimationGraph` 资源。通过设置参数变量（float/boolean/trigger/integer）驱动状态机中的状态切换，支持多图层叠加混合。

```ts
const controller = this.getComponent(AnimationController);
controller?.setValue('speed', 3.5);
controller?.setValue('isRunning', true);
controller?.setValue('attack', true);  // TRIGGER 类型，自动复位
```

**与 Animation 组件的关键区别**：

- `AnimationController` 不派发 `Animation.EventType` 事件（如 `FINISHED`），状态监控需通过 `getCurrentStateStatus()` / `getCurrentClipStatuses()` 或 `StateMachineComponent` 回调。
- `AnimationController` 和 `Animation` 可以**同时存在于同一节点**，但**不能同时控制同一动画资源**。

## 状态切换 vs 过渡 vs 混合 vs 分层

### 状态切换（Transition）

状态切换是动画图状态机（Animation Graph）中的概念——状态之间的有向跳转关系。每个过渡有关联的**条件**（Condition）和**时长**。

- 条件基于图中定义的参数（float/boolean/trigger）判断是否触发切换。
- 切换一旦触发，状态机当前状态退出、目标状态进入。
- 切换期间可以通过 Exit Time / Fixed Duration 控制过渡时机。

```ts
// 在代码中设置参数，动画图自动评估条件切换状态
controller.setValue('speed', 4.0);    // FLOAT 参数：速度值
controller.setValue('attack', true);  // TRIGGER 参数：触发攻击
```

### 过渡（CrossFade）

过渡是在指定周期内从一个动画平滑过渡到另一个动画的技术，常用于无需状态机的简单角色动画切换。

```ts
// Animation 组件的 crossFade
const anim = this.getComponent(Animation);

// 0.3 秒过渡到 Run 动画
anim?.crossFade('Run', 0.3);

// 传 0 等价于 play()
anim?.crossFade('Attack', 0);
```

- 过渡期间，**前后两个动画同时播放**，前一个逐渐降权，后一个逐渐升权。
- `crossFade` 的第二个参数是过渡时长（秒），非目标动画时长。
- 默认过渡时长为 0.3 秒。

### 混合（Blend）

混合是通过一个或多个参数在多个动画之间插值的机制，产生连续变化的动作效果。动画图的混合空间（Blend Space）支持：

- **1D 线性插值**：根据一个 Float 参数在多个动画间插值。典型场景：根据速度值在 Idle / Walk / Run 之间连续混合。

```
速度 = 0   → Idle
速度 = 2   → Walk
速度 = 6   → Run
中间值自动线性插值
```

- **2D 重心坐标插值**：根据两个 Float 参数在多个动画间进行 2D 插值。典型场景：根据移动方向（X 轴速度、Z 轴速度）前/后/左/右行走动画混合。

混合空间的动画数据在动画图编辑器中通过 Blend Space 节点配置，不通过代码直接控制。

### 分层（Layer）

分层是动画图的核心能力之一——多个图层并行运行，每层独立绑定一个状态机，各图层的骨骼动画输出按权重叠加。

```
动画图 (Animation Graph)
├── 图层 0 (Base Layer, weight=1.0)
│   └── 下半身状态机：Idle / Walk / Run
├── 图层 1 (Upper Body Layer, weight=0.8)
│   └── 上半身状态机：Idle / Shoot / Wave
└── 图层 2 (Additive Layer, weight=0.3)
    └── 叠加层：受伤抖动
```

- 下层骨骼输出被上层同名骨骼覆盖或混合。
- 通过 `AnimationController.setLayerWeight(layer, weight)` 调整图层权重。
- 叠加动画（Additive Animation）必须配置在独立的叠加层级中，否则会导致模型变换异常。

## 选择指南

| 场景 | 推荐方案 | 理由 |
|---|---|---|
| UI 动效、单对象属性动画 | `Animation.play()` | 简单直接，无需额外资产 |
| 角色动画切换（走路→跑步→攻击） | `Animation.crossFade()` | 代码控制，轻量化 |
| 复杂状态机（多条件切换、多层级） | `AnimationController` + `AnimationGraph` | 声明式管理，条件自动评估 |
| 3D 骨骼模型动画（需要 Socket 挂点） | `SkeletalAnimation` | 提供骨骼挂点功能 |
| 上半身/下半身动作分离 | `AnimationController` 多图层 | 不同图层独立控制不同骨骼组 |
| 根据速度连续插值走/跑 | `AnimationController` + Blend Space 1D | 参数驱动连续混合 |
| 根据运动方向混合前/后/左/右行走 | `AnimationController` + Blend Space 2D | 双轴参数驱动 |

## 常见错误

### 1. 动画剪辑名称不匹配

`Animation.play('Run')` 中的名称必须等于 `clips` 数组中对应剪辑的 `name` 属性，严格区分大小写。名称不匹配时播放无效且不报错。

### 2. 未勾选循环

非循环动画（`WrapMode.Normal`）播放一次后自动停止。如果期望动画持续播放但没有勾选循环，播完即停，表现为"动画只动了一次"。

```ts
// 正确设置循环
const state = anim.getState('Idle');
if (state) {
  state.wrapMode = AnimationClip.WrapMode.Loop;
}
```

### 3. 权重/过渡时间设置不符合预期

- `crossFade` 过渡时间过长会导致角色在两个动画间"卡在半路"的感觉。
- 图层权重（`setLayerWeight`）为 0 时，该图层状态机无论怎么切换都不产生视觉效果。

### 4. Animation 组件与 AnimationController 冲突

这两个组件可以同时存在于同一节点，但不能同时控制同一个 AnimationClip。如果 AnimationClip 被 Animation 组件的 `play()` 控制后又被 `AnimationController` 引用，行为不可预测。

### 5. 叠加动画未正确配置

叠加动画（Additive Animation）必须配置在独立的叠加层级中。如果将叠加动画放在常规（非叠加）图层中，骨骼变换会被错误叠加到基础姿态上，导致模型变形。

### 6. setValue 后预期立即切换

`setValue` 只是设置了参数，状态切换由动画图中的过渡条件和过渡时间决定，不会在当前帧立即完成切换。如果需要即时切换，在动画图中将过渡时间设为 0。

## 关联文档

- [动画图（Animation Graph）概念](animation-graph.md) —— 了解状态机和图层的编排方式
- [Animation API 卡片](../api-reference/animation.md) —— Animation 组件详细 API
- [SkeletalAnimation API 卡片](../api-reference/skeletal-animation.md) —— 骨骼动画组件详细 API
- [AnimationController API 卡片](../api-reference/animation-controller.md) —— 动画控制器详细 API
- [动画事件与回调（Recipe）](../recipes/animation-event-callback.md) —— 动画帧事件和系统事件用法
- [播放动画（Recipe）](../recipes/play-animation.md) —— Animation 组件播放动画实操
- [切换动画状态（Recipe）](../recipes/switch-animation-state.md) —— AnimationController 状态切换实操
- [动画事件不触发排错](../troubleshooting/animation-event-not-fired.md) —— 事件帧不触发的排查流程

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统
- 已交叉验证：cc-engine 3.8 公开类型声明
