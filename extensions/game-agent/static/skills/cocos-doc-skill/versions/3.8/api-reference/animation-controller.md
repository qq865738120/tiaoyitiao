---
id: cocos-3.8-api-reference-animation-controller
version: "3.8"
category: api-reference
title: AnimationController
keywords:
  - AnimationController
  - 动画控制器
  - 动画图
  - 动画状态机
  - Marionette
  - 动画参数
  - 图层混合
  - setValue
  - crossFade
related_docs:
  - api-reference/animation.md
  - concepts/animation-graph.md
  - recipes/switch-animation-state.md
  - troubleshooting/animation-event-not-fired.md
related_api:
  - AnimationController
  - Animation
  - AnimationClip
  - StateMachineComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - 动画控制器"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "AnimationController 嵌套在 module 'cc' 顶层，非 namespace，可从 cc 直接导入"
    - "Animation.EventType 位于 cc.Animation 命名空间，AnimationController 不支持 Animation.EventType"
    - "setValue/getValue 不触发过渡意图——过渡由动画图状态机中声明的条件和参数类型决定"
    - "实验性 API（setValue_experimental、overrideClips_experimental）和姿态图仍不稳定，不适合稳定生产使用"
status: draft
updated: 2026-06-17
---

# AnimationController

## 用途

AnimationController 是 Cocos Creator 3.8 动画图系统（Marionette）的运行时组件，负责解析和驱动"动画图（Animation Graph）"资产。它将动画图实例化到挂载节点上，通过设置图中的参数变量（trigger / boolean / float / int）触发状态机中的条件过渡，实现比 Animation.play() / crossFade() 更灵活、更复杂的动画状态管理。

## 所属模块

```ts
import { AnimationController } from 'cc';
```

## 公开导出结论

- `AnimationController` 在 `cc` 模块以 `export class AnimationController extends Component` **直接公开导出**（位于 `declare module "cc"` 顶层作用域，非嵌套命名空间）。
- 其关联的辅助类型在同一作用域导出：
  - `animation.VariableType`（枚举包含 FLOAT、BOOLEAN、TRIGGER、INTEGER，以及实验性向量/四元数类型）
  - `animation.Value`（`number | string | boolean`）
  - `ClipStatus`（接口：`clip: AnimationClip`, `weight: number`）
  - `TransitionStatus`（接口：`duration: number`, `time: number`）
  - `MotionStateStatus`（接口：`progress: number`）
  - `StateMachineComponent`（类，状态机生命周期回调基类）
  - `AnimationGraphRunTime` / `AnimationGraphVariantRunTime`（不透明接口，运行时标识动画图实例）
- **不与 `Animation` 组件共享事件类型**：`AnimationController` 不派发 `Animation.EventType` 事件，状态监控通过 `getCurrentStateStatus()`、`getCurrentClipStatuses()` 等查询方法或 `StateMachineComponent` 回调完成。

## 与 Animation 组件的区别

| 维度 | Animation | AnimationController |
|---|---|---|
| 驱动方式 | 代码直接调用 `play()` / `crossFade()` | 动画图状态机根据参数自动过渡 |
| 状态管理 | 手动管理切换逻辑 | 状态机 + 条件 + 参数声明式驱动 |
| 参数交互 | 无 | setValue() / getValue() 设置 trigger/boolean/float/int 变量 |
| 混合能力 | crossFade 单一过渡 | 图层分层、多状态混合、层级权重 |
| 适用场景 | 简单 UI、一次性播放 | 角色动作、多条件组合、复杂状态切换 |

## 常用属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `graph` | `AnimationGraphRunTime \| AnimationGraphVariantRunTime \| null` | 动画控制器绑定的动画图资产（get/set） |
| `layerCount` | `number` | 动画图中定义的图层数量，未指定图时为 0（只读） |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `setValue(name, value)` | 设置动画图中的变量值 | 驱动状态切换（浮点数、布尔值、触发器） |
| `getValue(name)` | 获取动画图中变量的当前值 | 检查参数状态 |
| `getVariables()` | 遍历动画图的所有变量名与类型 | 运行时枚举参数 |
| `getCurrentStateStatus(layer)` | 获取指定图层当前动作状态状态 | 查询当前播放进度 |
| `getCurrentClipStatuses(layer)` | 获取图层当前状态下各剪辑的运行状态 | 查看实际剪辑曝光权重 |
| `getCurrentTransition(layer)` | 获取图层当前正在进行的过渡状态 | 调试过渡是否在进行 |
| `getNextStateStatus(layer)` | 获取图层下一个动作状态状态 | 查询过渡目标 |
| `getNextClipStatuses(layer)` | 获取图层下一状态各剪辑状态 | 查看过渡目标剪辑权重 |
| `getLayerWeight(layer)` | 获取图层权重 | 查看图层混合比重 |
| `setLayerWeight(layer, weight)` | 设置图层权重 | 运行时调整图层混合 |
| `overrideClips_experimental(overrides)` | 覆盖动画图中的部分剪辑（实验性） | 运行时换装、替换动画资源 |
| `getAuxiliaryCurveValue_experimental(name)` | 获取辅助曲线值（实验性） | 获取动画驱动的额外数值输出 |

## 参数基础概念

动画图参数（Variable）是状态机条件的输入，由 AnimationController.setValue() 设置：

| 参数类型 | 枚举值 | setValue 传入类型 | 行为 |
|---|---|---|---|
| FLOAT | 0 | number | 连续值，用于速度、方向等 |
| BOOLEAN | 1 | boolean | 开关量，用于是否跑步、是否跳跃 |
| TRIGGER | 2 | boolean（true） | 脉冲触发，设置 true 后自动复位，用于攻击、闪避等一次性事件 |
| INTEGER | 3 | number（整数） | 离散值，用于武器类型、等级等 |
| VEC3 | 4（实验性） | Readonly\<Vec3\> | 三维向量（实验性） |
| QUAT | 5（实验性） | Readonly\<Quat\> | 四元数（实验性） |

## 高频代码

### 运行时绑定动画图

```ts
import { _decorator, Component, AnimationController, AnimationGraphRunTime } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ControllerSetup')
export class ControllerSetup extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  @property(AnimationGraphRunTime)
  animGraph: AnimationGraphRunTime | null = null;

  start() {
    if (!this.controller || !this.animGraph) return;

    // 绑定动画图资产
    this.controller.graph = this.animGraph;
  }
}
```

### 设置参数触发状态切换

```ts
import { _decorator, Component, AnimationController } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerAnimControl')
export class PlayerAnimControl extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  start() {
    if (!this.controller) return;

    // 开始奔跑
    this.controller.setValue('isRunning', true);
    // 设置移动速度
    this.controller.setValue('speed', 3.5);
  }

  doAttack() {
    if (!this.controller) return;

    // 触发攻击——TRIGGER 参数，设置后自动复位
    this.controller.setValue('attack', true);
  }

  stopRunning() {
    if (!this.controller) return;
    this.controller.setValue('isRunning', false);
  }
}
```

### 查询当前播放状态

```ts
import { _decorator, Component, AnimationController } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('StatusQuery')
export class StatusQuery extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  update() {
    if (!this.controller) return;

    // 查询图层 0 当前动作状态进度
    const stateStatus = this.controller.getCurrentStateStatus(0);
    if (stateStatus) {
      console.log(`当前动作进度: ${stateStatus.progress}`);
    }

    // 枚举所有变量
    for (const [name, { type }] of this.controller.getVariables()) {
      console.log(`变量: ${name}, 类型: ${type}`);
    }
  }
}
```

## 常见错误

1. **graph 未赋值**：`controller.graph` 为 null 时动画控制器不会工作，必须在编辑器或代码中绑定动画图资产。
2. **setValue 参数名不匹配**：`setValue` 中传入的 name 必须在动画图中已定义，否则设置无效且不报错。
3. **TRIGGER 误解为保持状态**：TRIGGER 是脉冲信号，`setValue('attack', true)` 触发后自动复位为 false，不能用来保持状态。
4. **与 Animation.EventType 混淆**：`AnimationController` 不派发 `FINISHED` / `PLAY` 等事件，监听动画完成应使用 `StateMachineComponent` 回调。
5. **跨帧过渡幻觉**：`setValue` 立即设置参数但不一定立即切换状态——过渡由动画图中的过渡条件和过渡时间决定。
6. **实验性 API 不可靠**：`setValue_experimental`、`overrideClips_experimental` 等标记 `@experimental` 的方法可能在版本升级时变更或移除。

## 实验性功能说明

以下内容不在本文档的稳定推荐范围内，但列出以便关注后续更新：

- **姿态图（Pose Graph）**：VEC3 和 QUAT 变量类型标记为 experimental，姿态图仍处于实验阶段，不适合稳定生产使用。
- **overrideClips_experimental**：运行时替换动画图中的剪辑，可用于换装系统，但 API 尚不稳定。
- **StateMachineComponent 子类化**：通过继承 `StateMachineComponent` 并在编辑器中绑定到状态机节点实现生命周期回调，目前缺少完善的调试工具和编辑器支持。
- **多图层复杂混合**：多个 AnimationController 或同一控制器的多个图层同时生效时，权重叠加规则需要仔细测试。
- **辅助曲线（Auxiliary Curve）**：`getAuxiliaryCurveValue_experimental` 用于获取动画驱动的额外数值，适用场景有限且为实验性接口。

## 关联任务

- [动画图概念](../concepts/animation-graph.md)
- [切换动画状态 Recipe](../recipes/switch-animation-state.md)
- [动画事件不触发排错](../troubleshooting/animation-event-not-fired.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统 - 动画控制器
- 已交叉验证：cc-engine 3.8 公开类型声明
