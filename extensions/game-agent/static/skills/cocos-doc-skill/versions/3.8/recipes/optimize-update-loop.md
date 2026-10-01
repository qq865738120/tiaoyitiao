---
id: cocos-3.8-recipes-optimize-update-loop
version: "3.8"
category: recipes
title: 优化 update 循环 — 避免每帧高开销操作
keywords:
  - update 优化
  - update 性能
  - 缓存引用
  - 分帧
  - 节流
  - 对象复用
  - 避免每帧创建 Vec3
  - find 性能
  - getComponent 每帧
  - 脚本性能优化
related_docs:
  - concepts/profiler-workflow.md
  - troubleshooting/frame-rate-low.md
  - troubleshooting/performance-issues.md
  - scripting/coding-pitfalls.md
  - api-reference/vec3.md
  - api-reference/color.md
related_api:
  - Component.update
  - Node.find
  - Component.getComponent
  - NodePool
  - Vec3
  - Color
  - tween
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - update 性能"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：update 中最常见的性能问题是每帧 getComponent 和循环中创建临时对象"
status: draft
updated: 2026-06-18
---

# 优化 update 循环 — 避免每帧高开销操作

## 目标

减少 `update(dt)` 中对 CPU 的浪费，消除不必要的每帧逻辑，让脚本层的每帧开销从十几毫秒降到 1-2 毫秒以内。

## 推荐做法

`update(dt)` 每帧都被引擎调用（60fps 时每秒 60 次），任何看似轻量的操作在 60 帧放大后都会成为显著开销。优化的核心原则是：**只把必须每帧做的事留在 update 中，其余全部移出**。

### 1. 避免每帧 find / getComponent

在 `update` 中调用 `find` 或 `getComponent` 是最常见的性能陷阱。这些方法每帧遍历节点树或组件列表，会产生 O(n) 开销。

```ts
// 不好的做法：每帧查找
update(dt: number) {
  const node = find('Canvas/HUD/ScoreLabel');  // 每帧遍历节点树！
  const label = node!.getComponent(Label);      // 每帧遍历组件列表！
  label!.string = ...;
}

// 好的做法：在 start 中缓存一次
import { _decorator, Component, Label, find } from 'cc';

const { ccclass } = _decorator;

@ccclass('HudScore')
export class HudScore extends Component {
  private _label: Label | null = null;

  start() {
    const node = find('Canvas/HUD/ScoreLabel');
    if (node) this._label = node.getComponent(Label);
  }

  update(dt: number) {
    if (!this._label) return;
    // 直接使用缓存的引用
    this._label.string = `Score: ${this.computeScore()}`;
  }

  private computeScore(): number {
    return Math.floor(Date.now() / 1000);
  }
}
```

### 2. 分帧和节流

不需要每帧都执行的任务，使用 `schedule` 或自定义节流。

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('ThrottledLogic')
export class ThrottledLogic extends Component {
  private _frameCount = 0;

  start() {
    // 不需要每帧更新的逻辑，改为固定间隔
    this.schedule(this.heavyTask, 0.5); // 每 0.5 秒执行一次
  }

  update(dt: number) {
    this._frameCount++;

    // 每 10 帧执行一次的低频更新
    if (this._frameCount % 10 === 0) {
      this.occasionalTask();
    }

    // 真正每帧必须做的事（例如角色位置更新）仍然放在 update 中
    this.essentialTask(dt);
  }

  private heavyTask() { /* 耗时逻辑 */ }
  private occasionalTask() { /* 低频逻辑 */ }
  private essentialTask(dt: number) { /* 真正每帧必要逻辑 */ }
}
```

### 3. 对象复用 — 避免循环中创建临时对象

在 update 或高频循环中创建 `Vec3`、`Color`、`Mat4`、数组等对象会导致 GC 频繁触发，造成周期性掉帧。

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('PositionTracker')
export class PositionTracker extends Component {
  // 复用临时向量，避免每次 update 创建新对象
  private _tempVec3 = new Vec3();

  update(dt: number) {
    // 不好的做法：
    // const pos = new Vec3(this.node.position.x, this.node.position.y, 0);

    // 好的做法：复用预分配的 Vec3
    this.node.getPosition(this._tempVec3);
    this._tempVec3.x += dt * 100;

    // 如果只需要读取但不修改，直接读 position 属性即可
    // const currX = this.node.position.x;
  }
}
```

其他临时对象的复用：

```ts
import { _decorator, Component, Color, Node, Sprite } from 'cc';

const { ccclass } = _decorator;

@ccclass('ColorAnimator')
export class ColorAnimator extends Component {
  private _tempColor = new Color(255, 255, 255, 255);

  update(dt: number) {
    // 复用 Color 对象而不是 new Color(...)
    this._tempColor.a = Math.floor((Math.sin(Date.now() * 0.003) + 1) * 127.5);
    const sprite = this.node.getComponent(Sprite);
    if (sprite) {
      sprite.color = this._tempColor;
    }
  }
}
```

### 4. 使用 tween 代替手动 update

对于常见的属性动画（位置、缩放、旋转、透明度），优先使用 `tween` 代替手动在 update 中计算。tween 内部做了优化，且代码更简洁。

```ts
// 不好的做法：手写 update 做缓动
update(dt: number) {
  this._progress += dt * 0.5;
  if (this._progress > 1) this._progress = 1;
  this.node.position = new Vec3(
    this._start.x + (this._end.x - this._start.x) * this._progress,
    this.node.position.y,
    0
  );
}

// 好的做法：使用 tween
import { _decorator, Component, tween, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('TweenMover')
export class TweenMover extends Component {
  start() {
    tween(this.node)
      .to(2, { position: new Vec3(100, 0, 0) }, { easing: 'quadOut' })
      .start();
  }
}
```

### 5. 避免循环中创建临时数组

```ts
// 不好的做法：每帧创建数组
update(dt: number) {
  const positions = []; // 每次 update 创建一个新数组
  for (const child of this.node.children) {
    positions.push(child.position);
  }
  this.processPositions(positions);
}

// 好的做法：复用数组
private _positions: Vec3[] = [];

update(dt: number) {
  this._positions.length = 0; // 清空但保留分配的空间
  for (const child of this.node.children) {
    this._positions.push(child.position);
  }
  this.processPositions(this._positions);
}
```

## 操作步骤

1. **先用 Profiler 确认 update 是瓶颈**：打开 Creator Profiler（`开发者 -> 打开 Profiler`），确认 `dispatch` 或 `update` 耗时占比较高（参考 `concepts/profiler-workflow.md`）。
2. **检查 update 中是否有 find / getComponent**：全部替换为 `start` 或 `onLoad` 中的缓存引用。
3. **检查 update 中是否有 new Vec3 / new Color / 数组 push**：改为预分配复用。
4. **检查不需要每帧的逻辑**：移入 `schedule`、`scheduleOnce`、事件回调或 tween。
5. **检查高频创建和销毁的对象**：改用 `NodePool` 对象池（参考 `recipes/use-node-pool.md`）。
6. **验证优化效果**：再次用 Profiler 对比优化前后的耗时变化。

## 验证方式

- 优化前后在 Creator Profiler 中对比 `dispatch` / `update` 的耗时占比。
- 在 Chrome DevTools Performance 中录制两段帧曲线，对比脚本耗时和 GC 频率。
- 观察目标设备上的 FPS 是否稳定提升。

## 常见错误

- 只做了缓存引用，但忽略了循环中的临时对象创建，GC 仍然频繁。
- 把本不需要每帧执行的逻辑也保留在 update 中（如定时刷新 UI 文字）。
- 在 update 中调用 `console.log`：每条日志都有 I/O 开销，60fps 时每秒 60 次显著影响性能。
- 在 update 中做 `instantiate` 或 `resources.load`：这些是异步高开销操作，不应出现在每帧循环中。
- 在 update 中频繁修改 `this.node.active` 或 `this.enabled`：这会触发节点的 active 链更新。
- 在 update 中每帧调用 `tween.start()` 或 `tween.stop()`。

## 相关文档

- [Profiler 工作流](../concepts/profiler-workflow.md)
- [帧率低排查](../troubleshooting/frame-rate-low.md)
- [编码陷阱 — 高频误区](../scripting/coding-pitfalls.md)
- [Vec3 API 卡片](../api-reference/vec3.md)
- [Color API 卡片](../api-reference/color.md)
- [使用对象池](../recipes/use-node-pool.md)
- [性能问题分诊](../troubleshooting/performance-issues.md)
