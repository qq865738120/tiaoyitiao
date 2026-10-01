---
id: cocos-3.8-ui-2d-widget
version: "3.8"
category: ui-2d
title: Widget — UI 自动对齐与边距约束
keywords:
  - Widget
  - 自动对齐
  - 边距
  - 百分比约束
  - UI 布局
  - 父子节点尺寸
  - 屏幕适配
related_docs:
  - ui-2d/canvas.md
  - ui-2d/ui-transform.md
  - ui-2d/screen-adaptation.md
  - ui-2d/layout.md
  - recipes/screen-adaptation.md
related_api:
  - Widget
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Widget"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Widget — UI 自动对齐与边距约束

## 用途

Widget 组件让 UI 节点自动对齐到父节点的边界，或者按百分比位置约束。它是实现屏幕适配和响应式 UI 的核心工具，与 Canvas 和 UITransform 协同工作。

## 核心结论

- Widget 将子节点对齐到**父节点 UITransform** 的边界。父节点尺寸变化时，子节点自动重新定位。
- 支持**左/右/上/下**四边对齐，可以单独启用某一边或组合使用。
- 边距值可以是绝对像素值，也可以是父节点尺寸的百分比（`isAbsolute` 为 `false` 时）。
- Widget 约束在 `start()` 时生效；运行时修改后可以调用 `updateAlignment()` 强制刷新。
- Widget 和 Layout 不应同时挂载在同一节点上，否则布局逻辑冲突。

## 什么时候使用

- UI 元素需要贴在屏幕边缘：底部工具栏、顶部状态栏。
- UI 元素需要居中显示：弹出窗口、加载提示。
- 适配不同分辨率：用百分比边距配合 Canvas 设计分辨率。
- 弹窗或提示框需要跟随父容器扩展：左右/上下各边启用约束。

## 关键 API / 组件

- `Widget.isAlignLeft / isAlignRight / isAlignTop / isAlignBottom`：是否启用该边对齐。
- `Widget.left / right / top / bottom`：边距值，单位像素或百分比，由 `isAbsolute` 决定。
- `Widget.isAbsoluteLeft` 等：`true` 为像素绝对值，`false` 为百分比。
- `Widget.alignMode`：对齐时机（`ON_WINDOW_RESIZE` 等）。
- `Widget.updateAlignment()`：手动触发对齐刷新。

## 最小示例

```ts
import { _decorator, Component, Widget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WidgetDemo')
export class WidgetDemo extends Component {
  start() {
    const widget = this.getComponent(Widget);
    if (!widget) return;
    // 底边对齐，距离父节点底边 20 像素
    widget.isAlignBottom = true;
    widget.bottom = 20;
    widget.isAbsoluteBottom = true;
    // 水平居中——左右同时对齐，使用百分比各 50%
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.left = 50;
    widget.right = 50;
    widget.isAbsoluteLeft = false;
    widget.isAbsoluteRight = false;
  }
}
```

## 常见错误

- Widget 计算位置后又被代码中的 `position` 修改覆盖：Widget 在 `start()` / 重新对齐时会覆盖 `position`；需要在 `start()` 之后修改，或者关闭 Widget 再手动定位。
- Widget 与 Layout 同时挂载冲突：两者都会修改子节点位置，不应同时使用在同一节点。
- 百分比约束下节点超出父节点边界：百分比值两侧总和不等于 100% 时节点可能溢出。
- Widget 约束与 `anchorPoint` 配合不当导致位置偏移：例如 `anchorPoint` 在 `(0, 0)` 时，Widget 对其父节点左上角约束。
- 运行时修改 Widget 参数未生效：调用 `updateAlignment()` 触发重新对齐。

## 关联文档

- [Canvas — UI 渲染根节点](canvas.md)
- [UITransform — UI 节点尺寸与布局基础](ui-transform.md)
- [Layout — 自动布局容器](layout.md)
- [屏幕适配心智模型](screen-adaptation.md)
- [UI 适配任务](../recipes/screen-adaptation.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Widget
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
