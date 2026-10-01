---
id: cocos-3.8-recipes-screen-adaptation
version: "3.8"
category: recipes
title: 屏幕适配
keywords:
  - 屏幕适配
  - 多分辨率
  - Canvas
  - Widget
  - 设计分辨率
  - 分辨率适配
  - 屏幕适配方案
related_docs:
  - api-reference/ui-transform.md
  - recipes/change-label-text.md
related_api:
  - Canvas
  - Widget
  - UITransform
  - view
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - 多分辨率适配方案、Canvas 组件、Widget 组件"
  verified-against: []
  supplement:
    - "工程经验：多数项目使用 Fit Width + Fit Height 单开其一；Widget 组件是 UI 适配的核心工具"
status: draft
updated: 2026-06-17
---

# 屏幕适配

## 目标

在 Cocos Creator 3.8 中实现 UI 在不同屏幕分辨率和宽高比下的正确显示。

## 推荐做法

屏幕适配分为**全局缩放**和**局部对齐**两个层面：

1. **全局缩放**：通过 **项目设置 → 项目数据 → 设计分辨率** 和 Canvas 组件控制；
2. **局部对齐**：通过 Widget 组件让 UI 元素相对于父节点（或指定目标）的边界自动对齐。

### 适配模式选择

| 适配模式 | 行为 | 适用场景 |
|---|---|---|
| **适配宽度**（Fit Width） | 确保设计分辨率宽度不被裁剪 | 横屏游戏（宽高比较大时高度可能裁剪） |
| **适配高度**（Fit Height） | 确保设计分辨率高度不被裁剪 | 竖屏游戏（宽高比较小时宽度可能裁剪） |
| **同时勾选两者** | 按较小的缩放比例显示全部内容 | 必须完整显示所有内容时（可能产生黑边） |
| **都不勾选** | 自动选择适配模式避免黑边 | 不关心边缘裁剪时 |

大多数横屏项目只勾选 **Fit Width**，竖屏项目只勾选 **Fit Height**。

## 示例代码

### Widget 对齐（代码控制）

```ts
import { _decorator, Component, Widget } from 'cc';

const { ccclass } = _decorator;

@ccclass('WidgetSetup')
export class WidgetSetup extends Component {
  start() {
    const widget = this.node.getComponent(Widget);
    if (!widget) return;

    // 左对齐，距左边界 50px
    widget.isAlignLeft = true;
    widget.isAbsoluteLeft = true;
    widget.left = 50;

    // 顶部对齐，距上边界 10%
    widget.isAlignTop = true;
    widget.isAbsoluteTop = false;
    widget.top = 0.1;

    // 对齐模式设为 ONCE：只在初始化时对齐一次
    widget.alignMode = Widget.AlignMode.ONCE;
  }
}
```

### 获取实际屏幕/视图尺寸

```ts
import { _decorator, Component, view, screen } from 'cc';

const { ccclass } = _decorator;

@ccclass('ScreenInfo')
export class ScreenInfo extends Component {
  start() {
    // 设计分辨率
    const designSize = view.getDesignResolutionSize();
    console.log(`设计分辨率: ${designSize.width} x ${designSize.height}`);

    // 实际可见区域（画布尺寸）
    const visibleSize = view.getVisibleSize();
    console.log(`可见区域: ${visibleSize.width} x ${visibleSize.height}`);

    // 屏幕物理分辨率
    console.log(`屏幕分辨率: ${screen.windowSize.width} x ${screen.windowSize.height}`);
  }
}
```

### 动态设置 Widget 边界

```ts
import { _decorator, Component, Widget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DynamicWidget')
export class DynamicWidget extends Component {
  @property(Widget)
  targetWidget: Widget | null = null;

  setSafeArea(top: number, bottom: number) {
    if (!this.targetWidget) return;

    // 设置安全区域边距（常用于刘海屏适配）
    this.targetWidget.isAlignTop = true;
    this.targetWidget.isAbsoluteTop = true;
    this.targetWidget.top = top;

    this.targetWidget.isAlignBottom = true;
    this.targetWidget.isAbsoluteBottom = true;
    this.targetWidget.bottom = bottom;
  }
}
```

## 操作步骤

### 配置全局适配

1. 打开 **项目 → 项目设置 → 项目数据**；
2. 设置 **设计分辨率**（如 1280 x 720 横屏、750 x 1334 竖屏）；
3. 根据游戏方向勾选 **适配宽度** 或 **适配高度**（横屏通常勾选 Fit Width，竖屏勾选 Fit Height）；
4. 确保场景根节点下有 Canvas 节点（编辑器默认创建）。

### 使用 Widget 对齐 UI

1. 选中需要对齐的 UI 节点；
2. 在属性检查器中添加 Widget 组件；
3. 勾选需要对齐的边界（Top/Bottom/Left/Right）并设置边距值（px 或百分比）；
4. 设置 **Align Mode**：`ALWAYS`（始终对齐）、`ONCE`（仅初始化时对齐）、`ON_WINDOW_RESIZE`（窗口变化时对齐）。

## 验证方式

- 在浏览器中调整窗口大小，UI 元素位置和尺寸随窗口正确变化；
- 在预览面板切换不同设备分辨率，UI 布局符合预期；
- Widget 对齐的节点在父节点尺寸变化后保持正确的边距；
- 关键 UI 元素（按钮、HUD）始终在可视区域内。

## 常见错误

1. **Canvas 节点下未添加 UI 组件**：所有 2D 渲染元素必须作为 Canvas（RenderRoot2D）的子节点才能被渲染。
2. **Widget 设置了 ALWAYS 模式后无法手动修改位置**：ALWAYS 模式每帧都会重新对齐，覆盖手动设置的位置。如需运行时手动控制，使用 `Widget.AlignMode.ONCE`。
3. **设计分辨率与实际屏幕比例差距过大**：如果设计分辨率 1280x720 但实际设备 4:3，仅勾选 Fit Width 时上下裁剪较多，需用 Widget 保证关键 UI 在安全区内。
4. **对齐目标为空**：Widget 的 `Target` 为空时默认对齐父节点，如果父节点也不存在或没有 UITransform，Widget 无法对齐。
5. **同时拉伸两端导致尺寸为 0**：同时设置了 `isAlignLeft` + `isAlignRight` 且两边距和为 0，节点宽度会被拉伸。如果节点初始宽度为 0，可能导致渲染异常。
6. **百分比单位混淆**：Widget 边距的百分比是基于对齐目标节点的宽/高。例如 `left = 0.1` 表示距离左边界 10% 的父节点宽度。

## 相关文档

- [UITransform API 卡片](../api-reference/ui-transform.md)
- [修改 Label 文案](./change-label-text.md)
