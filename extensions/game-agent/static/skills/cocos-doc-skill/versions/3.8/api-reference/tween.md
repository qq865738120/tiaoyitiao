---
id: cocos-3.8-api-reference-tween
version: "3.8"
category: api-reference
title: tween
keywords:
  - tween
  - 缓动
  - 动画
  - 补间
  - Tween
related_docs:
  - api-reference/animation.md
  - recipes/play-animation.md
related_api:
  - tween
  - Tween
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统 - Tween 缓动"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# tween

## 用途

`tween` / `Tween` 是 Cocos Creator 提供的链式缓动 API，用于对任意对象的属性做插值动画，支持位移、缩放、旋转、透明度等常见变换，以及链式组合、延迟、回调、缓动曲线。

## 所属模块

```ts
import { tween, Tween } from 'cc';
```

## 公开导出结论

- `tween<T>(target?)` 函数在 `cc` 模块以 `export function tween<T extends object = any>(target?: T): Tween<T>` 公开导出。
- `Tween<T>` 类在 `cc` 模块以 `export class Tween<T extends object = any>` 公开导出。
- `Tween` 公开方法（链式）：`to(duration, props, opts?)`、`by(duration, props, opts?)`、`set(props)`、`delay(duration)`、`call(callback)`、`repeat(times, embedTween?)`、`repeatForever(embedTween?)`（类型文件未直接列出但引擎中存在）、`then(tween)`、`sequence(...tweens)`、`parallel(...tweens)`、`tag(number)`、`id(number)`、`reverse()`、`start(time?)`、`stop()`、`pause()`、`resume()`、`clone(target?)`、`target(target)`、`timeScale(scale)`、`union(fromId?)`、`getTarget()`、`get running()`。
- 支持的缓动曲线参数可在 opts 中传入 easing：支持字符串名（如 `'sineOut'`、`'quadOut'`、`'backIn'` 等）或自定义函数。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `to(duration, props, opts?)` | 在 duration 秒内将属性过渡到目标值 | 位移动画 |
| `by(duration, props, opts?)` | 在 duration 秒内将属性增加指定值 | 缩放动画 |
| `set(props)` | 立即设置属性值 | 初始化状态 |
| `delay(duration)` | 添加延迟 | 序列延迟 |
| `call(callback)` | 添加回调 | 动画完成通知 |
| `repeat(times, embedTween?)` | 重复指定次数 | 循环动画 |
| `repeatForever(embedTween?)` | 无限重复 | 持续循环 |
| `start(time?)` | 开始执行动画 | 启动缓动 |
| `stop()` | 停止动画 | 提前终止 |
| `clone(target?)` | 克隆缓动到新目标 | 批量复用 |
| `then(tween)` | 串联另一个缓动 | 复合动画 |

## 高频代码

### 基础位移动画

```ts
import { _decorator, Component, tween, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('TweenExample')
export class TweenExample extends Component {
  start() {
    // 1 秒内从当前位置移动到 (100, 200, 0)
    tween(this.node)
      .to(1, { position: new Vec3(100, 200, 0) })
      .start();
  }
}
```

### 链式复合动画（移动 → 缩放 → 回调）

```ts
import { _decorator, Component, tween, Vec3, log } from 'cc';

const { ccclass } = _decorator;

@ccclass('ChainTweenExample')
export class ChainTweenExample extends Component {
  start() {
    tween(this.node)
      .to(1, { position: new Vec3(200, 0, 0) })
      .to(0.5, { scale: new Vec3(2, 2, 2) })
      .delay(0.3)
      .call(() => {
        log('动画序列完成');
      })
      .start();
  }
}
```

### 循环缩放动画

```ts
import { _decorator, Component, tween, Vec3, Tween } from 'cc';

const { ccclass } = _decorator;

@ccclass('RepeatTweenExample')
export class RepeatTweenExample extends Component {
  private _tween: Tween<this> | null = null;

  start() {
    this._tween = tween(this.node)
      .to(0.5, { scale: new Vec3(1.5, 1.5, 1.5) })
      .to(0.5, { scale: new Vec3(1, 1, 1) })
      .repeatForever()
      .start();
  }

  onDestroy() {
    if (this._tween) {
      this._tween.stop();
    }
  }
}
```

## 常见错误

1. **忘记调用 `.start()`**：`tween(...)` 只创建缓动实例，不会自动执行，必须调用 `.start()`。
2. **未在 `onDestroy` 中停止**：组件销毁后缓动仍在执行，可能导致访问已销毁目标，必须在 `onDestroy` 中 `stop()`。
3. **使用 `Node` 原生 setPosition 与 tween 冲突**：tween 逐帧修改属性时，外部同时调用 `node.setPosition` 会导致动画被打断。
4. **tween 链式调用后无法暂停/停止**：需保存 `tween()` 返回的引用才能调用 `stop()` / `pause()`。
5. **误用 `by` 替代 `to`**：`by` 是相对值（在当前值基础上增加），`to` 是绝对值（直接设置为目标值）。

## 关联任务

- [播放动画](../recipes/play-animation.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 动画系统 - Tween 缓动
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
