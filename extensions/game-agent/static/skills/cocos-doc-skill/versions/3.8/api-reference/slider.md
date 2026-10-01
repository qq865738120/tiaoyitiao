---
id: cocos-3.8-api-reference-slider
version: "3.8"
category: api-reference
title: Slider
keywords:
  - Slider
  - 滑动条
  - 音量调节
  - 进度调节
  - 滑块
related_docs:
  - api-reference/progress-bar.md
related_api:
  - Slider
  - SliderComponent
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Slider 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Slider

## 用途

Slider 组件实现滑动条交互，用于音量调节、进度控制、数值范围选择等需要用户拖拽调节的场景。

## 所属模块

```ts
import { Slider } from 'cc';
```

## 公开导出结论

- `Slider` 在 `cc` 模块以 `export class Slider extends Component` 公开导出。
- 公开属性：`handle`（滑块 Sprite）、`direction`（方向）、`progress`（当前进度 0-1）、`slideEvents`（滑动事件回调数组）。
- 静态枚举：`Slider.Direction`（HORIZONTAL / VERTICAL）。
- 公开方法：无独立公开方法，所有操作通过属性赋值与事件回调。
- 无类型声明、源码、官方文档之间的冲突。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `progress` | 当前进度值，范围 0-1 | 获取/设置音量、进度 |
| `handle` | 滑块按钮的 Sprite 组件 | 自定义滑块样式 |
| `direction` | 方向（HORIZONTAL / VERTICAL） | 水平/垂直滑动条 |
| `slideEvents` | 滑动事件回调数组 | 编辑器绑定滑动回调 |

## 高频代码

### 音量调节滑动条

```ts
import { _decorator, Component, Slider } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SliderExample')
export class SliderExample extends Component {
  @property(Slider)
  volumeSlider: Slider | null = null;

  start() {
    if (!this.volumeSlider) return;

    // 初始音量为 80%
    this.volumeSlider.progress = 0.8;
  }

  /** 在 slideEvents 中绑定此方法，或通过代码监听 */
  onVolumeChanged(slider: Slider) {
    if (!slider) return;
    const vol = Math.round(slider.progress * 100);
    console.log(`当前音量：${vol}%`);

    // 在此处更新实际音量
    this.setVolume(slider.progress);
  }

  private setVolume(value: number) {
    // 实际的音量设置逻辑
  }
}
```

### 通过代码监听滑动事件

```ts
import { _decorator, Component, Slider, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SliderEventExample')
export class SliderEventExample extends Component {
  @property(Slider)
  slider: Slider | null = null;

  onEnable() {
    if (!this.slider) return;

    // 监听滑动进度变化（从节点派发）
    this.node.on('slide', this.onSliding, this);
  }

  onDisable() {
    this.node.off('slide', this.onSliding, this);
  }

  private onSliding(slider: Slider) {
    if (!slider) return;
    console.log(`滑动进度：${(slider.progress * 100).toFixed(0)}%`);
  }

  onDestroy() {
    this.node.off('slide', this.onSliding, this);
  }
}
```

### 代码控制进度

```ts
import { _decorator, Component, Slider, Tween, tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SliderControlExample')
export class SliderControlExample extends Component {
  @property(Slider)
  progressSlider: Slider | null = null;

  /** 直接设置进度 */
  setProgress(value: number) {
    if (!this.progressSlider) return;
    this.progressSlider.progress = Math.max(0, Math.min(1, value));
  }

  /** 动画过渡到指定进度 */
  animateTo(targetProgress: number) {
    if (!this.progressSlider) return;

    const slider = this.progressSlider;
    const start = slider.progress;
    const delta = targetProgress - start;

    // 使用 tween 做进度动画
    tween(slider)
      .to(0.5, { progress: targetProgress })
      .start();
  }
}
```

## 常见错误

1. **`progress` 值未限制范围**：`progress` 范围是 0-1，超出范围可能导致异常行为。
2. **`handle` 未设置导致无法拖拽**：Slider 需要 `handle` 节点上的 Sprite 组件来实现拖拽交互。
3. **事件从 Node 派发而非 Slider 组件**：`'slide'` 事件从节点派发，需使用 `this.node.on('slide', ...)` 监听，而不是在 Slider 组件上监听。
4. **未检查 null**：`getComponent(Slider)` 或 `@property(Slider)` 可能为 null。
5. **方向切换后未更新布局**：从水平改为垂直后，handle 的位置可能不正确，需要检查场景编辑器的预览效果。

## 关联任务

- [进度条](../api-reference/progress-bar.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Slider 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
