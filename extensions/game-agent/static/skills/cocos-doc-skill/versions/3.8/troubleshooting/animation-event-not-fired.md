---
id: cocos-3.8-troubleshooting-animation-event-not-fired
version: "3.8"
category: troubleshooting
title: 动画事件不触发
keywords:
  - 动画事件
  - 动画事件不触发
  - Animation Event
  - 事件帧
  - 回调未调用
  - 动画帧事件
  - AnimationClip 事件
  - StateMachineComponent
related_docs:
  - api-reference/animation.md
  - api-reference/animation-controller.md
  - concepts/animation-graph.md
  - recipes/play-animation.md
  - recipes/switch-animation-state.md
related_api:
  - Animation
  - AnimationController
  - AnimationClip
  - StateMachineComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "动画事件基于 AnimationClip 中定义的事件帧，非基于 Animation.StateMachineComponent"
    - "AnimationController 不使用 Animation.EventType，需区分两个完全不同的回调体系"
status: draft
updated: 2026-06-17
---

# 动画事件不触发

## 现象

在 AnimationClip 中添加了事件帧（Event Frame），运行时该事件的回调函数没有执行。

## 排查顺序

### 第一步：事件是否添加到正确的剪辑和时间点

- 确认事件帧被添加到**实际播放的那个 AnimationClip** 上，而不是另一个同名不同源的资源。
- 确认事件的时间点（frame / time）在剪辑的有效时长内。事件帧如果超过剪辑的结束时间，永远不会被触发。
- 如果剪辑设置了 `wrapMode` 为 Normal（一次播放），确认播放时间确实经过了事件帧位置。
- **排查提示**：在编辑器中点击 AnimationClip 资源，查看 Events 列表，确认是否存在事件条目及其时间和方法名。

### 第二步：回调组件和方法名是否存在

- 事件帧中填写的方法名（Function Name）必须与动画播放节点上某个组件中定义的方法名**完全一致**（严格大小写敏感）。
- 该方法必须在组件声明中可见——`private` 方法不可见，必须是 `public` 或默认访问级别。
- 如果方法名写错或不存在，事件不会触发也不报错。
- **排查提示**：在编辑器中点击事件帧，确认 Function Name 字段填写正确；在脚本中确认该方法存在且可公开访问。

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('MyAnimReceiver')
export class MyAnimReceiver extends Component {
  // 动画事件帧调用的方法——必须与事件帧中填写的 Function Name 一致
  onAttackHit() {
    console.log('攻击命中事件触发');
    // 播放音效、触发伤害逻辑
  }

  onFootstep() {
    console.log('脚步声事件触发');
  }
}
```

### 第三步：节点 active / 组件 enabled

- 动画播放时，事件触发依赖于节点处于 active 状态。如果节点或其父节点的 `active` 为 false，事件帧不会被触发。
- 接收事件方法的组件必须 `enabled === true`。
- AnimationController 组件自身的 `enabled` 也必须为 true。
- **排查提示**：在代码中检查 `this.node.activeInHierarchy` 和组件 `this.enabled`。

### 第四步：Animation 与 AnimationController 使用路径是否混淆

这是动画事件排错中最容易被忽略的问题——两种动画系统使用完全不同的回调机制：

| 回调体系 | Animation 组件 | AnimationController 组件 |
|---|---|---|
| 剪辑事件帧 | 支持：AnimationClip 的事件帧在播放到对应帧时自动回调 | **不支持**：AnimationController 驱动的动画图不处理剪辑事件帧 |
| 生命周期回调 | Animation.EventType（从 node 派发） | StateMachineComponent（状态进入/退出/更新回调） |
| 状态监控 | getState(name) 查询 AnimationState | getCurrentStateStatus(layer) / getCurrentClipStatuses(layer) |

- 如果使用 **AnimationController（动画图）** 播放动画，AnimationClip 中定义的事件帧**不会被执行**。即使剪辑中有事件帧，引擎也不会回调。
- 如果需要在使用动画图时实现"播放到某帧执行回调"的效果，应使用 **StateMachineComponent** 的 `onMotionStateUpdate` 方法进行进度判断，或创建多个 Motion State 分段。
- 如果使用 **Animation 组件（非动画图）** 播放剪辑，则事件帧应该正常触发。若仍有问题，排查上述其他步骤。

**如何判断是哪种方式？**

```ts
// 方式一：节点的 Animation 组件
const animComp = this.node.getComponent(Animation);
if (animComp) {
  // 这里的动画播放支持 AnimationClip 事件帧
  animComp.play('Attack');
}

// 方式二：节点的 AnimationController 组件
const ctrlComp = this.node.getComponent(AnimationController);
if (ctrlComp) {
  // 这里的动画图播放不支持 AnimationClip 事件帧
  ctrlComp.setValue('attack', true);
}

// 注意：同一个节点上可以同时存在这两个组件
```

### 第五步：动画状态是否真的播放到事件帧

- 即使动画看起来在播放，但如果状态机没有播放到包含事件帧的那个剪辑，或者处于过渡混合阶段（cross-fade），目标剪辑的权重可能为 0，导致事件不触发。
- 使用 `getCurrentClipStatuses(layer)` 检查当前正在播放的剪辑及其权重：

```ts
import { _decorator, Component, AnimationController } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ClipStatusChecker')
export class ClipStatusChecker extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  update() {
    if (!this.controller) return;

    // 检查图层 0 当前播放的剪辑
    for (const clipStatus of this.controller.getCurrentClipStatuses(0)) {
      console.log(`播放中剪辑: ${clipStatus.clip.name}, 权重: ${clipStatus.weight}`);
    }
  }
}
```

## 快速检查清单

- [ ] 事件帧在正确的 AnimationClip 上，且时间点在有效范围内。
- [ ] 事件帧中填写的 Function Name 与脚本中方法名完全一致（大小写敏感）。
- [ ] 接收事件的节点 active 为 true，组件 enabled 为 true。
- [ ] 使用的是 Animation 组件播放动画（支持剪辑事件帧）还是 AnimationController（不支持）？如果是后者，考虑改用 StateMachineComponent。
- [ ] 如果使用 AnimationController，检查 `getCurrentClipStatuses(0)` 确认目标剪辑权重 > 0。
- [ ] 如果是 Animation.EventType 事件（如 FINISHED），确认是通过 `node.on()` 监听而非 Animation 组件实例监听（事件从 node 派发）。
- [ ] 确认组件没有被其他 `enabled = false` 或 `onDestroy` 清理逻辑干扰。

## 解决方案

### 情况一：使用 Animation 组件但事件不触发

```ts
import { _decorator, Component, Animation, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('AnimationEventFix')
export class AnimationEventFix extends Component {
  start() {
    const anim = this.node.getComponent(Animation);
    if (!anim) {
      console.warn('Animation 组件不存在');
      return;
    }

    // 确保节点 active
    if (!this.node.activeInHierarchy) {
      console.warn('节点未激活，动画事件无法触发');
      return;
    }

    // 确保 clip 配置正确
    if (anim.clips.length === 0 || !anim.clips[0].events) {
      console.warn('未配置 clip 或 clip 中没有事件');
      return;
    }

    // 方法应在同一个组件上定义（或同节点上的其他组件）
    // 事件帧 Function Name 填写 'onAttackHit'，则必须存在此方法：
    // public onAttackHit() { ... }
  }

  // 动画事件回调方法——必须与事件帧中填写的名称完全一致
  onAttackHit() {
    // 这个方法由引擎在动画播放到事件帧时自动调用
  }
}
```

### 情况二：使用 AnimationController 需要帧精确回调

使用 StateMachineComponent 替代剪辑事件帧：

```ts
import { _decorator, Component, AnimationController, StateMachineComponent, MotionStateStatus } from 'cc';

const { ccclass, property } = _decorator;

// 1. 自定义 StateMachineComponent 子类
class AttackStateEvents extends StateMachineComponent {
  onMotionStateEnter(controller: AnimationController, status: Readonly<MotionStateStatus>): void {
    console.log('进入攻击状态');
  }

  onMotionStateUpdate(controller: AnimationController, status: Readonly<MotionStateStatus>): void {
    // 在动画进度的 30% 触发一次"命中判定"
    if (status.progress >= 0.3 && status.progress < 0.35) {
      console.log('命中判定触发');
    }

    // 在动画进度的 60% 触发一次"收招音效"
    if (status.progress >= 0.6 && status.progress < 0.65) {
      console.log('收招音效');
    }
  }

  onMotionStateExit(controller: AnimationController, status: Readonly<MotionStateStatus>): void {
    console.log('退出攻击状态');
  }
}

// 2. 在组件中使用
@ccclass('AnimationControllerEventHandler')
export class AnimationControllerEventHandler extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  start() {
    // StateMachineComponent 需要在动画图编辑器中绑定到状态机节点
    // 而非通过代码 addComponent
    // 在编辑器中选中状态机 -> Inspector -> Add Component -> 搜索 AttackStateEvents
    if (!this.controller) return;
    console.log('AnimationController OK');
  }
}
```

## 仍未解决时

- 检查 Cocos Creator 编辑器的 Console 面板是否有报错——事件回调方法不存在时通常没有错误日志。
- 在动画回调方法中使用 `console.trace()` 确认调用栈。
- 使用 `schedule` 在 update 中轮询 `anim.getState(clipName).time` 查看当前播放时间是否经过事件帧位置。
- 检查构建后资源是否正确导出——打包后资源丢失事件帧的情况偶有发生。
- 确认使用的是 Cocos Creator 3.8 的动画系统（而非 2.x），API 存在差异。

## 相关文档

- [Animation API 卡片](../api-reference/animation.md)
- [AnimationController API 卡片](../api-reference/animation-controller.md)
- [动画图概念](../concepts/animation-graph.md)
- [播放动画（Recipe）](../recipes/play-animation.md)
- [切换动画状态（Recipe）](../recipes/switch-animation-state.md)
- [动画不播放排错](./animation-not-playing.md)
