---
id: cocos-3.8-api-reference-safe-area
version: "3.8"
category: api-reference
title: SafeArea
keywords:
  - SafeArea
  - 安全区
  - 刘海屏
  - 异形屏
  - 适配
  - 安全区域
  - SafeAreaComponent
related_docs:
  - ui-2d/widget.md
  - recipes/screen-adaptation.md
related_api:
  - SafeArea
  - Widget
  - Canvas
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - SafeArea 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "具体机型的适配表现因系统和引擎版本而异，建议在目标设备实测"
status: draft
updated: 2026-06-17
---

# SafeArea

## 用途

SafeArea 组件用于在刘海屏、挖孔屏等异形屏设备上，自动调整节点位置和尺寸使其处于系统安全区域内，避免 UI 元素被状态栏、刘海、底部手势指示条等遮挡。

## 所属模块

```ts
import { SafeArea } from 'cc';
```

## 公开导出结论

- `SafeArea` 在 `cc` 模块以 `export class SafeArea extends Component` 公开导出，别称 `SafeAreaComponent`。
- 公开方法：`updateArea()`。
- SafeArea 没有公开属性配置——它自动读取设备安全区数据并调整节点位置和尺寸。
- SafeArea 不直接修改 `position` 或 `contentSize`，而是通过约束节点使其必须留在安全区内。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|

SafeArea 不暴露可配置的公开属性，核心逻辑通过 `updateArea()` 触发。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `updateArea()` | 手动刷新安全区适配 | 屏幕旋转后、窗口尺寸变化后 |

## 高频代码

### 基本用法：顶部工具栏适配安全区

```ts
import { _decorator, Component, SafeArea, Widget, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SafeAreaExample')
export class SafeAreaExample extends Component {
  @property(SafeArea)
  safeArea: SafeArea | null = null;

  start() {
    // SafeArea 通常通过编辑器挂载到 Canvas 的子节点上
    // 代码中主动调用 updateArea 确保生效
    if (this.safeArea) {
      this.safeArea.updateArea();
    }
  }
}
```

### 配合 Widget 使用

SafeArea 通常与 Widget 组件配合，实现安全区内自适应布局：

```ts
import { _decorator, Component, SafeArea, Widget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SafeAreaWithWidget')
export class SafeAreaWithWidget extends Component {
  @property(SafeArea)
  safeArea: SafeArea | null = null;

  @property(Widget)
  widget: Widget | null = null;

  start() {
    // Widget 负责对齐到父节点边界
    // SafeArea 确保不超出安全区
    if (this.safeArea) {
      this.safeArea.updateArea();
    }
  }
}
```

### 屏幕旋转时刷新安全区

```ts
import { _decorator, Component, SafeArea, sys } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RotationSafeArea')
export class RotationSafeArea extends Component {
  @property(SafeArea)
  safeArea: SafeArea | null = null;

  protected onEnable() {
    // 监听设备方向变化
    window.addEventListener('orientationchange', this.onOrientationChange);
  }

  protected onDisable() {
    window.removeEventListener('orientationchange', this.onOrientationChange);
  }

  private onOrientationChange = () => {
    // 方向变化后刷新安全区
    if (this.safeArea) {
      this.safeArea.updateArea();
    }
  };
}
```

> **注意**：`window.addEventListener` 仅适用于 Web 平台。原生和小游戏平台需要通过平台特定 API 监听方向变化。

## 常见错误

1. **安全区未生效**：SafeArea 组件需挂载到 Canvas 的直接子节点上，且该节点应有 UITransform 组件。多层嵌套可能导致安全区计算不正确。
2. **与 Widget 同时使用时的顺序**：如果同时挂载 Widget 和 SafeArea，建议先让 SafeArea 生效再配置 Widget 边距，避免 Widget 位置被覆盖。
3. **移动端平台差异**：不同操作系统（iOS / Android）的安全区定义不一致，甚至同一系统的不同版本（如 Android 9 vs 12）的刘海区域也不同。
4. **窗口 resize 未刷新**：Web 端窗口尺寸变化或设备旋转后，SafeArea 不会自动重新计算，需要手动调用 `updateArea()`。
5. **性能留意**：频繁调用 `updateArea()`（如逐帧调用）无必要，只应在尺寸或方向变化时触发。

> 注意：SafeArea 组件在具体机型上的适配表现因系统和引擎版本而异，建议务必在目标设备上进行实测。

## 关联任务

- [Widget — UI 自动对齐与边距约束](../ui-2d/widget.md)（与 SafeArea 协作使用）
- [屏幕适配](../recipes/screen-adaptation.md)（完整的多分辨率适配方案）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - SafeArea 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
