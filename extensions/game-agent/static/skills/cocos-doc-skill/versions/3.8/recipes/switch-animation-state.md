---
id: cocos-3.8-recipes-switch-animation-state
version: "3.8"
category: recipes
title: 切换动画状态
keywords:
  - 动画状态切换
  - AnimationController
  - 动画图
  - 状态机
  - setValue
  - 动画参数
  - 角色动作
  - 键盘控制
  - 触摸控制
related_docs:
  - api-reference/animation-controller.md
  - concepts/animation-graph.md
  - recipes/play-animation.md
  - recipes/handle-touch-and-keyboard.md
  - troubleshooting/animation-event-not-fired.md
  - troubleshooting/animation-not-playing.md
related_api:
  - AnimationController
  - animation.VariableType
  - StateMachineComponent
  - Input
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - 动画图"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "setValue 不确保立即切换——过渡由动画图条件和过渡时间决定"
    - "TRIGGER 参数设置为 true 后引擎自动复位为 false"
    - "动画图编辑器中定义的变量名必须与 setValue 中使用的名称完全一致"
status: draft
updated: 2026-06-17
---

# 切换动画状态

## 目标

通过 AnimationController 在运行时切换角色的 Idle / Run / Attack 等动画状态，并配合输入事件（键盘 WASD / 屏幕触摸）驱动状态变化。

## 推荐做法

1. 在动画图编辑器中定义状态机，包含 Idle（待机）、Run（奔跑）、Attack（攻击）等 Motion State，定义 FLOAT/BOOLEAN/TRIGGER 参数作为过渡条件。
2. 在脚本中通过 `AnimationController.setValue(name, value)` 设置参数，引擎自动评估过渡条件并执行状态切换。
3. 对于 TRIGGER 类型的参数（攻击、闪避），设置为 `true` 后引擎自动复位，无需手动重置。
4. 对于 BOOLEAN / FLOAT 类型的参数（是否奔跑、速度值），持续通过 setValue 更新驱动。
5. 查询当前状态时使用 `getCurrentStateStatus(layer)` 获取进度，使用 `getCurrentClipStatuses(layer)` 查看各剪辑权重。

## 前置条件

1. 目标节点上挂载 `AnimationController` 组件，并在 `graph` 属性中绑定已编辑好的动画图资产。
2. 动画图资产中已定义好：
   - 状态：Idle、Run、Attack（至少一个 Motion State，绑定对应的 AnimationClip）
   - 过渡：定义各状态间的过渡条件（基于参数变量）和过渡时间
   - 变量：`speed`（FLOAT）、`isRunning`（BOOLEAN）、`attack`（TRIGGER）
3. 动画图中的变量名与代码 setValue 传入的名称完全一致（严格大小写敏感）。

## 示例代码

### 基础状态切换——键盘 WASD 驱动

```ts
import { _decorator, Component, AnimationController, input, Input, EventKeyboard, KeyCode } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('StateSwitchDemo')
export class StateSwitchDemo extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  onLoad() {
    if (!this.controller) return;

    // 初始状态：待机
    this.controller.setValue('speed', 0);
    this.controller.setValue('isRunning', false);
  }

  start() {
    // 注册键盘事件
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  onKeyDown(event: EventKeyboard) {
    if (!this.controller) return;

    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.KEY_A:
      case KeyCode.KEY_S:
      case KeyCode.KEY_D:
        // WASD 按下时进入奔跑状态
        // 动画图过渡条件：isRunning == true && speed > 0.1 时从 Idle 切换到 Run
        this.controller.setValue('isRunning', true);
        this.controller.setValue('speed', 3.5);
        break;

      case KeyCode.SPACE:
        // 空格触发攻击——TRIGGER 参数设置为 true 后自动复位
        this.controller.setValue('attack', true);
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    if (!this.controller) return;

    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.KEY_A:
      case KeyCode.KEY_S:
      case KeyCode.KEY_D:
        // 松开移动键时回到待机
        // 注意：如果还有其他键按着，不应立刻归零——这里是简化示例
        this.controller.setValue('isRunning', false);
        this.controller.setValue('speed', 0);
        break;
    }
  }

  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
  }
}
```

### 触摸按钮驱动状态切换

```ts
import { _decorator, Component, Node, AnimationController } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TouchStateSwitch')
export class TouchStateSwitch extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  @property(Node)
  attackButton: Node | null = null;

  @property(Node)
  runButton: Node | null = null;

  start() {
    if (!this.controller) return;

    // 初始状态
    this.controller.setValue('speed', 0);
    this.controller.setValue('isRunning', false);

    // 绑定触摸按钮
    if (this.attackButton) {
      this.attackButton.on(Node.EventType.TOUCH_END, () => {
        this.doAttack();
      });
    }

    if (this.runButton) {
      this.runButton.on(Node.EventType.TOUCH_START, () => {
        this.startRun();
      });
      this.runButton.on(Node.EventType.TOUCH_END, () => {
        this.stopRun();
      });
    }
  }

  doAttack() {
    if (!this.controller) return;
    // TRIGGER 脉冲触发
    this.controller.setValue('attack', true);
  }

  startRun() {
    if (!this.controller) return;
    this.controller.setValue('isRunning', true);
    this.controller.setValue('speed', 4.0);
  }

  stopRun() {
    if (!this.controller) return;
    this.controller.setValue('isRunning', false);
    this.controller.setValue('speed', 0);
  }

  onDestroy() {
    if (this.attackButton) {
      this.attackButton.off(Node.EventType.TOUCH_END);
    }
    if (this.runButton) {
      this.runButton.off(Node.EventType.TOUCH_START);
      this.runButton.off(Node.EventType.TOUCH_END);
    }
  }
}
```

### 使用 StateMachineComponent 监听状态变化

```ts
import { _decorator, Component, AnimationController, StateMachineComponent, MotionStateStatus } from 'cc';

const { ccclass, property } = _decorator;

// 自定义状态机组件——在动画图编辑器中绑定到状态机节点
class AttackStateListener extends StateMachineComponent {
  onMotionStateEnter(controller: AnimationController, status: Readonly<MotionStateStatus>): void {
    console.log('进入 Attack 状态，进度:', status.progress);
    // 可以在这里触发伤害判定或其他逻辑
  }

  onMotionStateExit(controller: AnimationController, status: Readonly<MotionStateStatus>): void {
    console.log('退出 Attack 状态');
  }

  onMotionStateUpdate(controller: AnimationController, status: Readonly<MotionStateStatus>): void {
    // 在动画更新时调用（不包含首尾帧）
    if (status.progress >= 0.6) {
      // 在 60% 进度时触发特殊逻辑
    }
  }
}

@ccclass('StateChangeMonitor')
export class StateChangeMonitor extends Component {
  @property(AnimationController)
  controller: AnimationController | null = null;

  update() {
    if (!this.controller) return;

    // 查询过渡状态
    const transition = this.controller.getCurrentTransition(0);
    if (transition) {
      console.log(`正在过渡中: ${transition.time} / ${transition.duration}`);
    }

    // 查询当前状态进度
    const status = this.controller.getCurrentStateStatus(0);
    if (status) {
      // progress 是规范化时间（0-1）
      console.log(`当前进度: ${(status.progress * 100).toFixed(0)}%`);
    }

    // 查询当前剪辑状态
    const clipStatuses = this.controller.getCurrentClipStatuses(0);
    for (const clipStatus of clipStatuses) {
      console.log(`剪辑: ${clipStatus.clip.name}, 权重: ${clipStatus.weight}`);
    }
  }
}
```

## 操作步骤

1. **准备动画图资产**：在 Cocos Creator 编辑器中创建 `.animgraph` 资产，定义 Idle / Run / Attack 等 Motion State，绑定对应的 AnimationClip。
2. **定义参数变量**：在动画图编辑器中添加 `speed`（FLOAT）、`isRunning`（BOOLEAN）、`attack`（TRIGGER）变量。
3. **编辑过渡条件**：从 Idle 到 Run 添加条件 `isRunning == true && speed > 0`；从 Any 到 Attack 添加条件 `attack == true`；定义过渡时间。
4. **挂载组件**：将 AnimationController 添加到角色节点，在 `graph` 属性中拖入上一步的动画图资产。
5. **编写控制脚本**：使用 `setValue` 设置参数驱动状态切换，可参照上述示例。
6. **注册输入**：根据游戏类型使用键盘事件或触摸事件绑定控制逻辑。

## 验证方式

- [ ] 调用 `controller.getValue('isRunning')` 确认参数值已被正确设置。
- [ ] 调用 `controller.getCurrentStateStatus(0)` 确认返回非 null，且 `progress` 值在正常范围内变化。
- [ ] 调用 `controller.getCurrentTransition(0)` 确认过渡正在进行时返回非 null 的 TransitionStatus。
- [ ] 观察游戏中角色的动画视觉上从 Idle 平滑过渡到 Run 再到 Attack。
- [ ] （可选）重复调用 TRIGGER 参数 `setValue('attack', true)` 确认每次触发都能切换攻击动画。

## 常见错误

1. **参数名拼写错误**：`setValue('speed', value)` 中的 `speed` 必须与动画图编辑器中定义的变量名完全一致。不一致时 setValue 静默失败，无任何报错。
2. **过渡条件不满足**：设置了参数但状态没有切换，检查动画图编辑器中过渡条件的表达式是否与参数值匹配。例如条件写 `speed > 1` 但 setValue 只设了 `0.5`。
3. **TRIGGER 误解**：TRIGGER 型参数设置为 `true` 后立即自动复位，不能在 update 中反复设置 `true/false/true` 进行脉冲节流——这会导致 TRIGGER 无法正确触发。每次触发目标状态应只调用一次 `setValue('attack', true)`。
4. **过渡时间过长**：过渡时间设置过大时（如 3 秒），从 Idle 切换到 Run 需要 3 秒才能完全过渡到 Run，中间表现为混合。如果期望快速切换，应缩小过渡时间。
5. **节点 active 或组件 enabled 为 false**：AnimationController 组件所在的节点 active 为 false 或组件自身的 enabled 为 false 时，控制器不会运行，setValue 也不生效。
6. **graph 未绑定**：`controller.graph` 为 null 时所有操作无效，务必在编辑器或通过代码赋值。
7. **getCurrentStateStatus 返回 null**：当前状态不是 Motion State（例如空状态或子状态机）时返回 null，不是 bug。

## 相关文档

- [AnimationController API 卡片](../api-reference/animation-controller.md)
- [动画图概念](../concepts/animation-graph.md)
- [播放动画（Recipe）](../recipes/play-animation.md)
- [处理触摸和键盘输入（Recipe）](../recipes/handle-touch-and-keyboard.md)
- [动画事件不触发排错](../troubleshooting/animation-event-not-fired.md)
- [动画不播放排错](../troubleshooting/animation-not-playing.md)
