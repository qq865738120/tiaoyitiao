---
id: cocos-3.8-scripting-scheduler-timer
version: "3.8"
category: scripting
title: 计时器与定时执行
keywords:
  - 计时器
  - 定时器
  - schedule
  - scheduleOnce
  - unschedule
  - 延时执行
  - 定时执行
  - 重复执行
related_docs:
  - scripting/component-lifecycle.md
  - scripting/coding-pitfalls.md
  - api-reference/component.md
related_api:
  - Component
source:
  official: "Cocos Creator 3.8 官方文档 - 使用计时器"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：计时器回调中 this 自动指向组件；组件销毁时计时器自动取消"
status: draft
updated: 2026-06-17
---

# 计时器与定时执行

## 用途

说明如何在组件中使用 `schedule`、`scheduleOnce`、`unschedule` 实现延时执行、重复执行和定时逻辑。比 `setTimeout`/`setInterval` 更贴合组件生命周期，且组件销毁时自动清理。

## 核心结论

- **`schedule(callback, interval)`** 开始重复计时器，每隔 `interval` 秒执行一次。
- **`scheduleOnce(callback, delay)`** 延时执行一次后自动停止。
- **`unschedule(callback)`** 取消指定计时器。
- 组件被销毁时，该组件上的所有计时器**自动取消**，无需手动清理。
- 回调中的 `this` 自动指向组件本身。

## schedule——重复执行

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('TimerExample')
export class TimerExample extends Component {
  private _elapsed: number = 0;

  onLoad() {
    // 每隔 1 秒执行一次
    this.schedule(this.onTimerTick, 1);
  }

  private onTimerTick() {
    // this 自动指向当前组件
    this._elapsed++;
    console.log(`Timer tick ${this._elapsed}`);
  }
}
```

### 带参数的 schedule

```ts
// schedule(callback, interval, repeat, delay)
// repeat: 重复次数（实际执行 repeat + 1 次）
// delay: 首次执行前的延时（秒）

this.schedule(() => {
  console.log('每 0.5s 一次，共执行 4 次，首次延迟 2s');
}, 0.5, 3, 2);
// repeat=3 → 执行 4 次（首次 + 3 次重复）
// delay=2  → 2 秒后开始第一次
```

## scheduleOnce——执行一次

```ts
onLoad() {
  // 3 秒后执行一次，之后自动取消
  this.scheduleOnce(() => {
    console.log('3 seconds later');
  }, 3);
}
```

## unschedule——取消计时器

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('UnscheduleExample')
export class UnscheduleExample extends Component {
  private _timerCallback = () => {
    console.log('tick');
  };

  onEnable() {
    // 开始计时
    this.schedule(this._timerCallback, 1);
  }

  onDisable() {
    // 停止计时——推荐在 onDisable 中取消
    this.unschedule(this._timerCallback);
  }

  stopTimer() {
    // 也可随时手动取消
    this.unschedule(this._timerCallback);
  }
}
```

**要点**：`unschedule` 必须传入**同一个函数引用**，匿名箭头函数无法取消：

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('UnscheduleTrapsExample')
class UnscheduleTrapsExample extends Component {
  private _callback: (() => void) | null = null;

  bad() {
    // ❌ 错误：匿名函数无法取消
    this.schedule(() => { console.log('tick'); }, 1);
    this.unschedule(() => { console.log('tick'); }); // 无效！
  }

  good() {
    // ✅ 正确：保存函数引用
    this._callback = () => { console.log('tick'); };
    this.schedule(this._callback, 1);
    this.unschedule(this._callback);  // 有效
  }
}
```

## 与 update 的选择

| 需求 | 方案 | 原因 |
|---|---|---|
| 每帧都执行的逻辑 | `update(deltaTime)` | 引擎专用钩子，无额外调度开销 |
| 每隔 N 秒执行一次 | `schedule` | 自动管理间隔和暂停 |
| 延迟执行一次性逻辑 | `scheduleOnce` | 比 `setTimeout` 更安全 |
| 暂停时也需要执行的逻辑 | `setTimeout` / `setInterval` | schedule 受组件暂停影响 |

## 常见错误

1. **用匿名函数无法 unschedule**：`schedule(() => {}, 1)` 无法取消，必须保存引用。
2. **忘记在 onDisable 中取消**：disable 后计时器虽然暂停，但如果 enable 回来会继续，可能造成逻辑错乱。有状态依赖的计时器应该在 onDisable 取消、onEnable 重建。
3. **interval 为 0**：`schedule(cb, 0)` 会每帧执行，效果等同 update，但开销略大于直接写 `update`。
4. **认为组件销毁后还需要手动 unschedule**：不需要，引擎自动清理。

## 关联文档

- [onLoad 与 start 实战选择](./component-lifecycle.md)
- [常见编码陷阱](./coding-pitfalls.md)
- [Component API 卡片](../api-reference/component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 使用计时器
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——匿名函数无法 unschedule；与 onEnable/onDisable 配对模式
