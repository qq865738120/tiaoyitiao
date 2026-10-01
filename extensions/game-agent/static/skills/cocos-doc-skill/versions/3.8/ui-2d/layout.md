---
id: cocos-3.8-ui-2d-layout
version: "3.8"
category: ui-2d
title: Layout — 自动布局容器
keywords:
  - Layout
  - 自动布局
  - 容器
  - 水平布局
  - 垂直布局
  - 网格布局
  - 自适应
  - 子节点排列
  - Widget 冲突
related_docs:
  - ui-2d/widget.md
  - ui-2d/ui-transform.md
  - ui-2d/scroll-view.md
  - ui-2d/list-virtualization.md
  - recipes/button-click.md
related_api:
  - Layout
  - Widget
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Layout"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-07-24
---

# Layout — 自动布局容器

## 用途

Layout 组件自动排列其直接子节点，支持水平（HORIZONTAL）、垂直（VERTICAL）和网格（GRID）三种排列模式。适合列表、菜单、图库等需要自动排布的容器。

## 核心结论

- Layout 控制的是**直接子节点**的位置和/或尺寸。不支持递归布局多层后代。
- 三种布局类型：
  - `HORIZONTAL`：子节点水平排列。支持设置 `spacingX` 横向间距。
  - `VERTICAL`：子节点垂直排列。支持设置 `spacingY` 纵向间距。
  - `GRID`：网格排列，通过 `startAxis` 选择水平或垂直主推进方向。
- Layout 的 `resizeMode` 控制容器是否自动适配子节点尺寸：
  - `NONE`：不调整容器或子节点尺寸；它不负责裁剪，超出内容需由 Mask/ScrollView 控制。
  - `CONTAINER`：容器尺寸根据子节点自动扩展。
  - `CHILDREN`：子节点尺寸根据容器尺寸自动拉伸填满。
- Layout 排列直接子节点，Widget 对齐或拉伸当前节点。二者可以共存，但必须避免同一节点同一轴被多个系统竞争写入。
- 运行时动态增删子节点后，Layout 会自动重新计算布局。
- 动态列表建议使用 ScrollView + Layout 配合，但对超长列表需要虚拟化。

## 什么时候使用

- 需要自动排列的按钮组、菜单栏。
- 网格展示的图库。
- 动态增删子节点的列表。
- 需要容器自适应子节点总尺寸。

## 关键 API / 组件

- `Layout.type`：布局类型（`HORIZONTAL`、`VERTICAL`、`GRID`、`NONE`）。
- `Layout.resizeMode`：尺寸模式（`NONE`、`CONTAINER`、`CHILDREN`）。
- `Layout.spacingX`、`Layout.spacingY`：子节点间距。
- `Layout.paddingLeft`、`Layout.paddingRight`、`Layout.paddingTop`、`Layout.paddingBottom`：容器内边距。
- `Layout.cellSize`：网格模式下每个子节点的尺寸。
- `Layout.startAxis`：网格排列的主推进方向（`HORIZONTAL` 或 `VERTICAL`）。

## 最小示例

```ts
import { _decorator, Component, Layout } from 'cc';

const { ccclass } = _decorator;

@ccclass('LayoutDemo')
export class LayoutDemo extends Component {
  start() {
    const layout = this.getComponent(Layout);
    if (!layout) return;
    layout.type = Layout.Type.HORIZONTAL;
    layout.resizeMode = Layout.ResizeMode.CONTAINER;
    layout.spacingX = 10;
    layout.paddingLeft = 20;
    layout.paddingRight = 20;
  }
}
```

## 常见错误

- Layout 与 Widget 同时使用导致布局错乱：检查是否有同一轴竞争写入；如果 Widget 只负责容器对父节点的对齐、Layout 只负责排列子项，可以合理共存。
- 子节点不按预期排列：Layout 只影响直接子节点，不影响孙子节点。
- 容器尺寸异常：`resizeMode` 设为 `CONTAINER` 时容器自动扩展；设为 `NONE` 时子节点可能溢出。
- 网格模式下 `cellSize` 设置过大导致内容溢出：检查 `startAxis`、容器可用空间、内边距和间距；需要裁剪时使用 Mask/ScrollView。
- 动态添加子节点后位置不对：布局可能在下一帧才重新计算；如果需要立即生效，可以手动触发。

## 关联文档

- [Widget — 自动对齐与边距](widget.md)
- [UITransform — 节点尺寸](ui-transform.md)
- [ScrollView — 滚动视图](scroll-view.md)
- [长列表虚拟化](list-virtualization.md)

## 来源

- 官方：[Cocos Creator 3.8 Layout](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/layout.html)
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
