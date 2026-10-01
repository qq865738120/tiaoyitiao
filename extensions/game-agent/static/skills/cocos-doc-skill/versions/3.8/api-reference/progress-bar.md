---
id: cocos-3.8-api-reference-progress-bar
version: "3.8"
category: api-reference
title: ProgressBar
keywords:
  - ProgressBar
  - 进度条
  - 血条
  - 加载进度
  - 经验条
related_docs:
  - api-reference/slider.md
related_api:
  - ProgressBar
  - ProgressBarComponent
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - ProgressBar 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# ProgressBar

## 用途

ProgressBar 组件实现进度条显示，用于血条、加载进度、经验值条、技能冷却等需要展示进度的视觉场景。

## 所属模块

```ts
import { ProgressBar } from 'cc';
```

## 公开导出结论

- `ProgressBar` 在 `cc` 模块以 `export class ProgressBar extends Component` 公开导出。
- 公开属性：`barSprite`（进度显示用的 Sprite）、`mode`（进度条模式）、`totalLength`（进度条总长度）、`progress`（当前进度 0-1）、`reverse`（是否反向）。
- 静态枚举：`ProgressBar.Mode`（HORIZONTAL / VERTICAL / FILLED）。
- 公开方法：无独立公开方法，所有操作通过属性赋值。
- 无类型声明、源码、官方文档之间的冲突。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `progress` | 当前进度值，范围 0-1 | 设置血条/加载进度 |
| `mode` | 进度条模式（HORIZONTAL / VERTICAL / FILLED） | 水平/垂直/环形进度 |
| `barSprite` | 用来显示进度的 Sprite 图片 | 进度条图片 |
| `totalLength` | 进度条实际总长度（像素） | 调整进度条范围 |
| `reverse` | 是否反向变化 | 特殊进度条效果 |

## 高频代码

### 血条效果

```ts
import { _decorator, Component, ProgressBar } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HealthBarExample')
export class HealthBarExample extends Component {
  @property(ProgressBar)
  hpBar: ProgressBar | null = null;

  private maxHP = 100;
  private currentHP = 100;

  start() {
    if (!this.hpBar) return;

    this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
    this.hpBar.totalLength = 200;
    this.hpBar.progress = 1;
  }

  /** 受到伤害 */
  takeDamage(damage: number) {
    this.currentHP = Math.max(0, this.currentHP - damage);
    this.updateHPBar();
  }

  /** 恢复血量 */
  heal(amount: number) {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    this.updateHPBar();
  }

  private updateHPBar() {
    if (!this.hpBar) return;
    this.hpBar.progress = this.currentHP / this.maxHP;
  }
}
```

### 加载进度条

```ts
import { _decorator, Component, ProgressBar, director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LoadingBarExample')
export class LoadingBarExample extends Component {
  @property(ProgressBar)
  loadingBar: ProgressBar | null = null;

  private progress = 0;

  update(dt: number) {
    if (!this.loadingBar) return;

    // 模拟加载进度
    this.progress += dt * 0.2;
    if (this.progress > 1) {
      this.progress = 1;
      this.onLoadComplete();
    }

    this.loadingBar.progress = this.progress;
  }

  private onLoadComplete() {
    console.log('加载完成');
    // 切换到主场景
    // director.loadScene('main');
  }
}
```

### 反向进度条

```ts
import { _decorator, Component, ProgressBar } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ReverseProgressBarExample')
export class ReverseProgressBarExample extends Component {
  @property(ProgressBar)
  cooldownBar: ProgressBar | null = null;

  private maxCooldown = 5; // 秒
  private remainingTime = 0;

  start() {
    if (!this.cooldownBar) return;

    // 反向进度条：满的时候值最大（未冷却），空的时候值最小（冷却中）
    this.cooldownBar.reverse = true;
    this.cooldownBar.progress = 1;
  }

  startCooldown() {
    this.remainingTime = this.maxCooldown;
  }

  update(dt: number) {
    if (!this.cooldownBar) return;
    if (this.remainingTime <= 0) return;

    this.remainingTime -= dt;
    this.cooldownBar.progress = this.remainingTime / this.maxCooldown;

    if (this.remainingTime <= 0) {
      console.log('冷却结束');
    }
  }
}
```

### FILLED 模式（环形/扇形进度条）

```ts
import { _decorator, Component, ProgressBar } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('FilledProgressExample')
export class FilledProgressExample extends Component {
  @property(ProgressBar)
  radialBar: ProgressBar | null = null;

  start() {
    if (!this.radialBar) return;

    // 设置 FILLED 模式，配合 Sprite 的 fillType 使用
    this.radialBar.mode = ProgressBar.Mode.FILLED;
  }

  setRadialProgress(value: number) {
    if (!this.radialBar) return;
    this.radialBar.progress = Math.max(0, Math.min(1, value));
  }
}
```

## 常见错误

1. **未设置 `barSprite` 导致界面空白**：必须在 Inspector 中将显示进度的 Sprite 节点拖拽到 `barSprite` 属性上。
2. **`totalLength` 与 Sprite 实际宽度不匹配**：`totalLength` 应与 `barSprite` 的原始宽度一致，否则进度显示异常。
3. **`progress` 未限制 0-1 范围**：虽然属性声明范围 0-1，但赋值超出范围可能导致行为异常。
4. **`mode` 理解错误**：`HORIZONTAL` 和 `VERTICAL` 裁剪 Sprite 的宽/高；`FILLED` 需要 Sprite 的 `type` 设置为 `FILLED` 类型。
5. **未检查 null**：`getComponent(ProgressBar)` 或 `@property(ProgressBar)` 可能为 null。

## 关联任务

- [滑动条](../api-reference/slider.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - ProgressBar 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
