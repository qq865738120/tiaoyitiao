---
id: cocos-3.8-api-reference-skeletal-animation
version: "3.8"
category: api-reference
title: SkeletalAnimation（骨骼动画组件）
keywords:
  - SkeletalAnimation
  - 骨骼动画
  - 预烘焙动画
  - 骨骼挂点
  - Socket
  - useBakedAnimation
  - SkinnedMeshRenderer
related_docs:
  - api-reference/animation.md
  - recipes/play-animation.md
  - assets/spine-dragonbones.md
  - troubleshooting/animation-not-playing.md
related_api:
  - SkeletalAnimation
  - Animation
  - AnimationClip
  - AnimationState
  - Socket
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - 骨骼动画"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# SkeletalAnimation（骨骼动画组件）

## 用途

SkeletalAnimation 组件用于播放和管理 3D 模型上的骨骼动画（蒙皮动画）。它管理动画剪辑（AnimationClip），控制骨骼的位移动画、旋转动画和缩放动画。适用于角色动画（行走、奔跑、攻击、待机等）、怪物动画、以及任何使用蒙皮模型的动画场景。

## 所属模块

```ts
import { SkeletalAnimation, AnimationClip, AnimationState } from 'cc';
```

## 公开导出结论

- `SkeletalAnimation` 在 `cc` 模块以 `export class SkeletalAnimation extends Animation` 公开导出。
- 别名 `SkeletalAnimationComponent` 指向同一类型。
- **继承关系**：`SkeletalAnimation extends Animation extends Component`。因此 SkeletalAnimation 拥有 Animation 的所有能力（play, crossFade, pause, resume, stop, getState, clips 等）。
- 额外属性：`sockets`（骨骼挂点数组）、`useBakedAnimation`（是否使用预烘焙动画）。
- `Socket` 在 `cc` 模块以 `export class Socket` 公开导出。
- 关键方法继承自 `Animation`：`play(name?)`、`crossFade(name, duration?)`、`pause()`、`resume()`、`stop()`、`getState(name)`、`createState(clip, name?)`。
- 动画剪辑通过 `clips` 属性注入，默认剪辑通过 `defaultClip` 设置，`playOnLoad` 控制自动播放。
- 骨骼动画的渲染由模型节点上的 `SkinnedMeshRenderer` 组件配合 SkeletalAnimation 完成。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `clips` | 动画剪辑列表（AnimationClip[]） | 管理多个动画片段 |
| `defaultClip` | 默认动画剪辑 | 设置默认播放的动画 |
| `playOnLoad` | 是否在加载时自动播放 | 角色自动进入待机动画 |
| `useBakedAnimation` | 是否使用预烘焙模式（默认 true） | 性能调优 |
| `sockets` | 骨骼挂点列表（Socket[]） | 挂载武器、装备等子节点到骨骼 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `play(name?)` | 播放指定动画（默认使用 defaultClip） | 切换动作 |
| `crossFade(name, duration?)` | 平滑过渡到指定动画 | 动作混合，走跑切换 |
| `pause()` | 暂停所有动画 | 暂停角色动作 |
| `resume()` | 恢复所有动画 | 恢复动作 |
| `stop()` | 停止所有动画 | 停止动作 |
| `getState(name)` | 获取指定动画的状态 | 控制播放进度/速度/循环模式 |

## 高频代码

### 播放骨骼动画

```ts
import { _decorator, Component, SkeletalAnimation } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SkeletalAnimExample')
export class SkeletalAnimExample extends Component {
  start() {
    const anim = this.getComponent(SkeletalAnimation);
    if (!anim) return;

    // 播放默认动画（由 defaultClip + playOnLoad 控制）
    if (!anim.playOnLoad) {
      anim.play();
    }
  }

  playAction(name: string) {
    const anim = this.getComponent(SkeletalAnimation);
    if (!anim) return;

    // 切换到指定动画
    anim.play(name);
  }
}
```

### 切换动画并监听完成

```ts
import { _decorator, Component, SkeletalAnimation, Animation } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SkeletalAnimControl')
export class SkeletalAnimControl extends Component {
  private _anim: SkeletalAnimation | null = null;

  start() {
    const anim = this.getComponent(SkeletalAnimation);
    if (!anim) return;
    this._anim = anim;

    // 播放攻击动画
    anim.play('Attack');

    // 监听播放完成——必须监听在 Animation 组件实例上
    anim.on(Animation.EventType.FINISHED, (type, state) => {
      console.log(`动画 ${state.name} 播放完成`);
      anim.play('Idle'); // 切回待机
    });
  }

  onDestroy() {
    if (this._anim) {
      this._anim.off(Animation.EventType.FINISHED);
    }
  }
}
```

### 使用 crossFade 平滑过渡

```ts
import { _decorator, Component, SkeletalAnimation } from 'cc';

const { ccclass } = _decorator;

@ccclass('AnimBlendExample')
export class AnimBlendExample extends Component {
  changeToRun() {
    const anim = this.getComponent(SkeletalAnimation);
    if (!anim) return;

    // 0.3 秒淡入淡出到 Run 动画
    anim.crossFade('Run', 0.3);
  }

  changeToWalk() {
    const anim = this.getComponent(SkeletalAnimation);
    if (!anim) return;

    anim.crossFade('Walk', 0.3);
  }
}
```

### 使用挂点系统挂载子节点

```ts
import { _decorator, Component, Node, SkeletalAnimation, Socket } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SkeletalAttachExample')
export class SkeletalAttachExample extends Component {
  @property(Node)
  weaponNode: Node | null = null;

  start() {
    const skeletalAnimation = this.getComponent(SkeletalAnimation);
    if (!skeletalAnimation || !this.weaponNode) return;

    // 创建空节点作为挂点目标
    const socketTarget = new Node('SocketTarget');
    socketTarget.parent = skeletalAnimation.node;

    // 将武器挂到 SocketTarget 下
    this.weaponNode.parent = socketTarget;

    // 创建 Socket，路径为目标骨骼名称
    const socket = new Socket('root/spine_01/arm_01/hand_01', socketTarget);
    skeletalAnimation.sockets = [socket];
  }
}
```

## 常见错误

1. **组件引用为空**：`getComponent(SkeletalAnimation)` 返回 null，原因是模型节点上未自动添加该组件。需检查模型资源是否包含蒙皮信息，或手动添加组件。
2. **骨骼动画不播放**：
   - 未设置 `clips` 或 `defaultClip` 为空。
   - `playOnLoad = false` 且未在代码中调用 `play()`。
   - 动画剪辑名称写错（区分大小写）。
   - `play('name')` 中的名称需与 `clips` 数组中动画剪辑名称一致。
3. **预烘焙模式问题**：
   - `useBakedAnimation = true` 时，CPU 侧无法获取骨骼变换，挂载子节点必须使用 Socket 系统。
   - 预烘焙模式不支持 `AnimationState.time` 在 CPU 端的实时读取。
4. **Socket 挂点不生效**：
   - 目标骨骼名称不对，可通过编辑器检查 `sockets[0].path` 下拉框确认骨骼名称。
   - `Socket` 的 `target` 必须是一个独立 Node，且父节点为 SkeletalAnimation 的 node。
   - `sockets` 赋值后 SkeletalAnimation 才会使用挂点。
5. **资源未正确导入**：
   - 模型（.fbx/.gltf）必须包含蒙皮数据才会自动创建 SkeletalAnimation 和 SkinnedMeshRenderer。
   - 导入后的模型在资源面板中生成 Prefab 和 AnimationClip 资源，需通过 `clips` 或 `defaultClip` 引用。

## 关联任务

- [播放动画](../recipes/play-animation.md)
- [Animation API 卡片](animation.md)（父类能力）
- [Spine/DragonBones 资产文档](../assets/spine-dragonbones.md)（第三方运行时，与 SkeletalAnimation 无直接关系）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统 - 骨骼动画
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
