---
id: cocos-3.8-concepts-animation-graph
version: "3.8"
category: concepts
title: 动画图（Animation Graph）
keywords:
  - 动画图
  - Animation Graph
  - Marionette
  - 动画状态机
  - 状态过渡
  - 图层混合
  - 动画参数
  - 角色动作
related_docs:
  - api-reference/animation-controller.md
  - api-reference/animation.md
  - recipes/switch-animation-state.md
  - recipes/play-animation.md
  - troubleshooting/animation-event-not-fired.md
related_api:
  - AnimationController
  - Animation
  - AnimationClip
  - animation.VariableType
  - StateMachineComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - 动画图（Marionette）"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "Marionette 是 Cocos Creator 3.8 中动画图的内部代号"
    - "动画图不适用于简单 UI 或一次性播放，应使用 Animation 组件"
status: draft
updated: 2026-06-17
---

# 动画图（Animation Graph）

## 用途

解释 Cocos Creator 3.8 中"动画图（Animation Graph，引擎内部代号 Marionette）"的设计思想、组成部分、适用场景以及与 Animation 组件的关系。

## 核心结论

- **动画图是一个可视化状态机系统**，在图编辑器中通过节点连线的方式定义动画状态（Idle / Run / Attack）、过渡条件（Condition）、参数类型（Trigger / Boolean / Float / Int）和图层（Layer）混合规则。
- **动画图解决的问题**：当动画状态数量增多、状态间存在复杂条件（移动速度、方向、是否在地面、攻击命中等）时，代码手动管理 `Animation.play()` / `crossFade()` 会变得极其脆弱。动画图将状态切换逻辑声明式地"固化"在资产中，运行时只需通过 `AnimationController.setValue()` 设置参数，引擎自动评估条件并触发过渡。
- **运行时由 AnimationController 组件驱动**：将动画图资产赋值给节点的 `AnimationController.graph` 属性，实例化后即可通过 setValue/getValue 与图中定义的参数交互。
- **动画图不派发 Animation.EventType 事件**：状态监控通过 `getCurrentStateStatus()` / `getCurrentClipStatuses()` 查询或使用 `StateMachineComponent` 回调。

### 与 AnimationClip / Animation 的关系

- **AnimationClip** 是原始的动画数据（关键帧、骨骼变换、事件帧），是动画系统的构建砖块。
- **Animation** 组件直接播放一个或多个 AnimationClip，通过 `play()` / `crossFade()` 代码切换。
- **动画图** 将多个 AnimationClip 编排为状态机，声明过渡规则和混合参数，运行时自动管理。
- 三者层次：AnimationClip（数据层） -> Animation 组件或动画图（驱动层） -> 节点（表现层）。

## 什么时候使用

### 适用场景

- **角色动作控制**：使用输入（速度、方向、跳跃）驱动角色从 Idle 到 Run 到 Jump 的切换，过渡条件自动评估。
- **多条件状态切换**：同一帧需要根据多个参数组合决定切换到哪个动画（例如：速度 + 是否持有武器 + 是否在斜坡上）。
- **分层混合**：上半身射击动画 + 下半身行走动画通过不同图层叠加，图层权重可运行时调整。
- **状态间平滑过渡**：声明过渡时间后，引擎自动 cross-fade，无需代码干预。

### 不适用场景

> **简单 UI 动画或一次性剪辑播放**：一个按钮弹跳动画、一个 UI 过渡、一个技能特效的一次性播放——这些场景使用 `Animation` 组件的 `play()` / `crossFade()` 或 `tween` 更加轻量、直接，不需要引入动画图的复杂性。
>
> **只有 2-3 个动画剪辑的简单角色**：如果角色只有 Idle 和 Run 两个状态且切换逻辑简单，使用 `Animation.crossFade()` 代码切换比制作动画图更高效。

## 关键 API / 组件

- **AnimationController**：运行时组件，负责实例化动画图并暴露参数接口（setValue / getValue / getVariables）。
- **AnimationGraphRunTime / AnimationGraphVariantRunTime**：动画图资产的运行时类型标识，作为 `AnimationController.graph` 的类型。
- **animation.VariableType**：参数类型枚举（FLOAT / BOOLEAN / TRIGGER / INTEGER / VEC3_experimental / QUAT_experimental）。
- **animation.Value**：`number | string | boolean`，setValue/value 的类型联合。
- **ClipStatus**：剪辑运行状态接口，包含 `clip: AnimationClip` 和 `weight: number`。
- **TransitionStatus**：过渡状态接口，包含 `duration: number` 和 `time: number`。
- **MotionStateStatus**：动作状态运行状态接口，包含 `progress: number`（规范化时间）。
- **StateMachineComponent**：状态机生命周期回调基类，可继承后绑定到图中状态机节点，监听 enter / exit / update 事件。

## 动画图组成结构

```
动画图 (Animation Graph)
├── 图层 (Layer) —— 支持多个图层，骨骼混合叠加
│   ├── 权重 (Weight) —— 每个图层独立权重，AnimationController.setLayerWeight() 调整
│   └── 状态机 (State Machine)
│       ├── 状态 (State)
│       │   ├── 动作状态 (Motion State) —— 绑定 AnimationClip
│       │   ├── 子状态机 (Sub-State Machine) —— 嵌套状态机
│       │   └── 空白状态 (Empty State) —— 无动画输出
│       ├── 过渡 (Transition)
│       │   ├── 条件 (Condition) —— 基于参数表达式
│       │   ├── 过渡时间——退出 / 目标 / 自定义
│       │   └── 是否打断 (Can Interrupt / Can Transition To Self)
│       └── 参数 (Variable) —— 状态机外部输入
│           ├── FLOAT：浮点数（速度、方向角度）
│           ├── BOOLEAN：布尔值（是否加速、是否在地面）
│           ├── TRIGGER：脉冲触发（攻击、闪避）
│           ├── INTEGER：整数（武器类型索引）
│           └── VEC3 / QUAT（实验性）
```

### 图层

每个图层独立运行一个状态机，各图层的动画输出通过骨骼蒙皮权重混合叠加。典型使用方式：

- **图层 0（Base Layer）**：下半身动作（走、跑、停）
- **图层 1（Upper Body Layer）**：上半身动作（射击、挥手）

通过 `setLayerWeight(layer, weight)` 可以调整单个图层的整体权重。

### 过渡条件

过渡条件（Transition Condition）在动画图编辑器中以声明方式定义。典型条件的判断表达式：

- `speed > 0.1` -> 从 Idle 切换到 Run
- `isGrounded == false` -> 切换到 Jump
- `attack`（TRIGGER 类型被触发）-> 切换到 Attack 状态

过渡时间（Transition Duration）控制从当前状态到目标状态的混合时长。

### 参数类型

| 类型 | 运行时 setValue 传入类型 | 典型用途 |
|---|---|---|
| FLOAT | number | 移动速度、角度 |
| BOOLEAN | boolean | 是否奔跑、是否举盾 |
| TRIGGER | boolean（true） | 攻击命中、受击闪避（自动复位） |
| INTEGER | number | 武器类型、动画变体索引 |
| VEC3 / QUAT（实验性） | Vec3 / Quat | 姿态控制 |

## 最小示例

```ts
import { _decorator, Component, AnimationController, input, Input, EventKeyboard, KeyCode } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AnimationGraphDemo')
export class AnimationGraphDemo extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  onLoad() {
    if (!this.controller) return;

    // 设置初始参数——对应动画图中定义的变量名
    this.controller.setValue('speed', 0);
    this.controller.setValue('isRunning', false);
  }

  // 键盘事件演示
  onKeyDown(event: EventKeyboard) {
    if (!this.controller) return;

    switch (event.keyCode) {
      case KeyCode.KEY_W:
        this.controller.setValue('isRunning', true);
        this.controller.setValue('speed', 3.5);
        break;
      case KeyCode.KEY_S:
        this.controller.setValue('isRunning', false);
        this.controller.setValue('speed', 0);
        break;
      case KeyCode.KEY_SPACE:
        // 触发攻击——TRIGGER 参数，设置为 true 后自动复位
        this.controller.setValue('attack', true);
        break;
    }
  }

  // 查询当前状态进度
  lateUpdate() {
    if (!this.controller) return;

    const layerStatus = this.controller.getCurrentStateStatus(0);
    if (layerStatus) {
      // progress 是规范化时间（0-1）
      // 不是剪辑的真实进度，如果 wrapMode 不是 Loop 则需结合 clip 时长计算
    }
  }
}
```

## 常见错误

1. **过度使用动画图**：对于 2 到 3 个状态的简单动画，动画图的资产制作和维护成本高于使用 `Animation.play()` / `crossFade()` 代码切换。只应在状态复杂或需要声明式过渡管理时才使用动画图。
2. **参数名称拼写不一致**：代码中 `setValue('speed', value)` 必须与动画图编辑器中定义的变量名完全一致（大小写敏感），否则设置无效且无报错。
3. **TRIGGER 的误用**：TRIGGER 是脉冲信号而非状态保持，不能通过反复 setValue true/false 来模拟 BOOLEAN 行为。TRIGGER 在过渡触发后自动复位。
4. **忽略图层权重**：多图层混合时，如果某个图层权重为 0，该图层上的状态机无论怎么切换都无法产生视觉效果。
5. **与 Animation 事件混淆**：动画图系统不使用 `Animation.EventType`。如需监听状态进入/退出，应使用 `StateMachineComponent` 子类。
6. **跨帧过渡难以预测**：`setValue` 后状态立即开始评估过渡条件，但过渡本身有耗时（Transition Duration），不会在当下帧立即完成切换。

## 关联文档

- [AnimationController API 卡片](../api-reference/animation-controller.md)
- [Animation API 卡片](../api-reference/animation.md)
- [切换动画状态（Recipe）](../recipes/switch-animation-state.md)
- [播放动画（Recipe）](../recipes/play-animation.md)
- [动画事件不触发排错](../troubleshooting/animation-event-not-fired.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统 - 动画图（Marionette）
- 已交叉验证：cc-engine 3.8 公开类型声明
