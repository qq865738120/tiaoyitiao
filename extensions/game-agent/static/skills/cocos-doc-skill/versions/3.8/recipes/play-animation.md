---
id: cocos-3.8-recipes-play-animation
version: "3.8"
category: recipes
title: 播放动画
keywords:
  - 播放动画
  - Animation
  - 动画剪辑
  - 骨骼动画
  - crossFade
  - 动画切换
  - AnimationClip
related_docs:
  - api-reference/animation.md
  - api-reference/tween.md
  - troubleshooting/animation-not-playing.md
related_api:
  - Animation
  - AnimationClip
  - AnimationState
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - Animation 组件"
  verified-against: []
  supplement:
    - "工程经验：Animation.EventType 事件从 node 派发；动画剪辑名称区分大小写"
status: draft
updated: 2026-06-17
---

# 播放动画

## 目标

在运行时控制 Animation 组件播放、切换、暂停和停止动画剪辑。

## 推荐做法

1. 使用 `anim.play('ClipName')` 播放指定名称的剪辑，无参数则播放默认剪辑（`defaultClip`）；
2. 使用 `anim.crossFade('ClipName', duration)` 平滑切换动画，过渡时长秒数，传入 0 等价于 `play()`；
3. 使用 `anim.pause()` / `anim.resume()` 控制暂停和恢复，使用 `anim.stop()` 停止所有动画；
4. 通过 `anim.getState('ClipName')` 获取 `AnimationState`，进而控制播放速度（`speed`）和时间（`time`）；
5. 监听动画完成等事件在 `node` 上使用 `Animation.EventType`（事件从 node 派发，非 Animation 组件实例）。

## 前置条件

1. 播放动画的节点上必须有 Animation 组件；
2. Animation 组件的 `clips` 数组中必须包含要播放的动画剪辑（在编辑器中配置或通过代码 `addClip` 添加）；
3. `playOnLoad` 属性控制是否在组件激活时自动播放默认剪辑，如果需要在 `start()` 中手动控制播放，建议关闭 `playOnLoad`；
4. 如果通过代码加载 AnimationClip，动画资源必须放在 `assets/resources/` 目录下。

## 示例代码

### 播放指定动画

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('PlayAnimExample')
export class PlayAnimExample extends Component {
  start() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;

    // 播放默认剪辑
    anim.play();
  }

  playAttack() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;

    // 播放指定名称的剪辑
    anim.play('Attack');
  }

  stopAnimation() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;

    anim.stop();
  }
}
```

### 平滑切换动画（crossFade）

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('CrossFadeExample')
export class CrossFadeExample extends Component {
  private _anim: Animation | null = null;

  start() {
    this._anim = this.node.getComponent(Animation);
  }

  changeState(state: 'idle' | 'run' | 'attack') {
    if (!this._anim) return;

    switch (state) {
      case 'run':
        // 0.3 秒淡入淡出切换到 Run 动画
        this._anim.crossFade('Run', 0.3);
        break;
      case 'attack':
        this._anim.crossFade('Attack', 0.15);
        break;
      default:
        // 回到待机
        this._anim.crossFade('Idle', 0.5);
    }
  }
}
```

### 监听动画播放完成

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('AnimEventExample')
export class AnimEventExample extends Component {
  private _anim: Animation | null = null;

  start() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;
    this._anim = anim;

    // Animation 自身实现了 EventTarget，事件须监听在组件实例上
    anim.on(Animation.EventType.FINISHED, (event) => {
      console.log('动画播放完成');
      // event 参数包含 type、target 信息
    });

    anim.play('SkillCast');
  }

  onDestroy() {
    if (this._anim) {
      this._anim.off(Animation.EventType.FINISHED);
    }
  }
}
```

### 控制动画播放速度与进度

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('AnimControlExample')
export class AnimControlExample extends Component {
  private _anim: Animation | null = null;

  start() {
    this._anim = this.node.getComponent(Animation);
  }

  setSpeed(speed: number) {
    if (!this._anim) return;

    // 通过 AnimationState 控制播放速度
    const state = this._anim.getState('Idle');
    if (state) {
      state.speed = speed; // 1.0 为正常速度，2.0 为两倍速
    }
  }

  pauseAll() {
    if (!this._anim) return;
    this._anim.pause();
  }

  resumeAll() {
    if (!this._anim) return;
    this._anim.resume();
  }
}
```

## 操作步骤

1. 在编辑器中为节点添加 Animation 组件，并在 `clips` 数组中配置动画剪辑；
2. 如需关掉自动播放，取消勾选 `playOnLoad`；
3. 在脚本中通过 `getComponent(Animation)` 获取组件引用；
4. 使用 `anim.play('ClipName')` 播放指定动画，无参数则播放默认剪辑；
5. 如需平滑切换，使用 `anim.crossFade('ClipName', duration)`；
6. 需要监听动画结束等事件时，在 `node` 上监听 `Animation.EventType`。

## 验证方式

- 调用 `play()` 后节点开始播放动画，场景中可见动画效果；
- `crossFade` 有平滑过渡效果；
- 调用 `stop()` 后动画停止并回到初始帧；
- `pause()` / `resume()` 正常暂停和恢复；
- 监听 `Animation.EventType.FINISHED` 能在动画结束时触发回调。

## 常见错误

1. **Animation 组件不存在**：节点上缺少 Animation 组件，`getComponent(Animation)` 返回 null，必须判空。
2. **剪辑名称错误**：`play('name')` 中的名称必须与 `clips` 数组中的剪辑名称完全一致（区分大小写）。
3. **playOnLoad 与手动 play 冲突**：`playOnLoad = true` 时组件激活即开始播放默认剪辑，在 `start()` 中又调用 `play()` 会覆盖。
4. **未在 onDestroy 中停止**：组件销毁后动画事件监听仍可能触发，应在 `onDestroy` 中 `stop()` 并 `off` 事件。
5. **动画剪辑未配置**：`clips` 数组为空时 `play()` 无效，需在编辑器中拖入 AnimationClip 资源或通过代码 `addClip`。
6. **crossFade 参数理解错误**：第二个参数是过渡时长（秒），不是目标动画时长。传入 `0` 等价于 `play()`。

## 相关文档

- [Animation API 卡片](../api-reference/animation.md)
- [动画不播放排查](../troubleshooting/animation-not-playing.md)
- [播放音频](./play-audio.md)
