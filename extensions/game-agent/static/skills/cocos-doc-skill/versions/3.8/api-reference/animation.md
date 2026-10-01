---
id: cocos-3.8-api-reference-animation
version: "3.8"
category: api-reference
title: Animation
keywords:
  - Animation
  - 动画组件
  - 动画播放
  - 动画剪辑
  - AnimationClip
related_docs:
  - api-reference/tween.md
  - recipes/play-animation.md
related_api:
  - Animation
  - AnimationClip
  - AnimationState
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - Animation 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Animation

## 用途

Animation 组件用于管理节点上的动画剪辑（AnimationClip），提供播放、淡入淡出切换、暂停、停止等功能。适用于编辑器制作的复杂动画（骨骼动画、属性动画、事件帧等）在运行时的控制。

## 所属模块

```ts
import { Animation, AnimationClip } from 'cc';
```

## 公开导出结论

- `Animation` 在 `cc` 模块以 `export class Animation extends Component` 公开导出。
- 关键属性：`clips`（动画剪辑数组）、`defaultClip`（默认剪辑）、`playOnLoad`（启动时自动播放）。
- 关键方法：`play(name?)`、`crossFade(name, duration?)`、`pause()`、`resume()`、`stop()`、`getState(name)`、`createState(clip, name?)`。
- `Animation.EventType` 类型为 `typeof __private._cocos_animation_animation_state__EventType`，包含 `PLAY`、`STOP`、`PAUSE`、`RESUME`、`FINISHED` 等事件类型。
- `AnimationClip` 在 `cc` 模块以 `export class AnimationClip extends Asset` 公开导出。
- `AnimationState` 在 `cc` 模块以 `export class AnimationState extends Playable` 公开导出，提供 `play`、`stop`、`pause`、`resume` 以及 `speed`、`time`、`duration`、`wrapMode` 等控制。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `clips` | 动画剪辑列表 | 管理多个剪辑 |
| `defaultClip` | 默认动画剪辑 | 设置播放的默认动画 |
| `playOnLoad` | 是否在组件启动时自动播放默认剪辑 | 自动播放 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `play(name?)` | 立即播放指定动画（无参数时播放默认剪辑） | 切换动画 |
| `crossFade(name, duration?)` | 平滑过渡到指定动画（默认过渡 0.3s） | 动画混合 |
| `pause()` | 暂停所有动画 | 暂停 |
| `resume()` | 恢复所有动画 | 恢复 |
| `stop()` | 停止所有动画 | 停止播放 |
| `getState(name)` | 获取指定动画的状态 | 控制播放进度/速度 |

## 高频代码

### 播放默认动画

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('AnimationExample')
export class AnimationExample extends Component {
  start() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;

    // 播放默认剪辑
    anim.play();
  }
}
```

### 播放指定动画剪辑并监听完成

> Animation 自身实现了 EventTarget 接口，事件须监听在组件实例上，挂在 `this.node` 不会触发。

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('AnimControlExample')
export class AnimControlExample extends Component {
  private _anim: Animation | null = null;

  start() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;
    this._anim = anim;

    // 切换到 'Attack' 动画（立即切换）
    anim.play('Attack');

    // 监听播放完成事件——必须监听在 Animation 组件实例上
    anim.on(Animation.EventType.FINISHED, (event) => {
      console.log('动画播放完成');
    });
  }

  onDestroy() {
    if (this._anim) {
      this._anim.off(Animation.EventType.FINISHED);
    }
  }
}
```

### 使用 crossFade 平滑切换

```ts
import { _decorator, Component, Animation } from 'cc';

const { ccclass } = _decorator;

@ccclass('CrossFadeExample')
export class CrossFadeExample extends Component {
  changeToRun() {
    const anim = this.node.getComponent(Animation);
    if (!anim) return;

    // 0.5 秒淡入淡出到 'Run' 动画
    anim.crossFade('Run', 0.5);
  }
}
```

## 常见错误

1. **未添加 Animation 组件**：`getComponent(Animation)` 返回 null，必须判空。
2. **动画剪辑名称写错**：`play('name')` 中的名称需与 `clips` 数组中的剪辑名称一致，区分大小写。
3. **playOnLoad 冲突**：`playOnLoad = true` 的同时在 `start()` 中又调用了 `play()`，后者会覆盖前者的播放。
4. **未在 onDestroy 停止**：动画事件监听器在组件销毁后仍可能触发，应在 `onDestroy` 中调用 `stop()` 和事件清理。

## 关联任务

- [播放动画](../recipes/play-animation.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统 - Animation 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
