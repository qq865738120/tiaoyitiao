---
id: cocos-3.8-ui-2d-scroll-view
version: "3.8"
category: ui-2d
title: ScrollView — 滚动视图
keywords:
  - ScrollView
  - 滚动视图
  - 滚动
  - 动态列表
  - 内容节点
  - 滚动条
  - 滚不动
  - 内容溢出
  - 虚拟化
related_docs:
  - ui-2d/layout.md
  - ui-2d/label.md
  - ui-2d/button.md
  - ui-2d/list-virtualization.md
  - ui-2d/ui-transform.md
related_api:
  - ScrollView
  - Layout
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - ScrollView"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# ScrollView — 滚动视图

## 用途

ScrollView 组件提供一个可滚动的容器，当内容区域超出视图边界时，用户可以通过触摸滑动来查看隐藏部分。它是实现列表、长文本、大图浏览等功能的基础组件。

## 核心结论

- ScrollView 由两部分组成：**视图节点（自身）** 和 **内容节点（content）**。
  - 视图节点：固定可见区域，通过 UITransform `contentSize` 限定显示范围。
  - 内容节点：容纳实际内容（子节点列表、长文本等），其尺寸超出视图节点时触发滚动。
- 滚动可行性取决于内容节点的 UITransform `contentSize` 是否大于视图节点的 UITransform `contentSize`。如果内容节点尺寸不大于视图节点，则无法滚动。
- 内容节点的**尺寸计算**需要正确处理：
  - 使用 Layout 自动布局时，将 `resizeMode` 设为 `CONTAINER` 让内容容器自动适应子节点总尺寸。
  - 使用手动布局时，需要代码计算并设置内容节点的 `contentSize`。
- ScrollView 嵌套子节点数量过多（几百个）会导致性能问题，此时需要虚拟化。
- 动态列表实现 → [list-virtualization.md](list-virtualization.md) 说明长列表场景。
- 滚动无效排查 → 先检查内容节点的 contentSize 是否大于视图节点。

## 什么时候使用

- 列表形式的好友列表、排行榜、日志。
- 可滚动阅读的长文本。
- 需要横向滚动浏览的图库。

## 关键 API / 组件

- `ScrollView.content`：内容节点引用，类型 `Node`。
- `ScrollView.horizontal`、`ScrollView.vertical`：是否启用水平/垂直滚动。
- `ScrollView.inertia`：是否启用惯性滚动。
- `ScrollView.brake`：惯性阻尼值，0 到 1，越大停止越快。
- `ScrollView.elastic`：是否启用回弹效果。
- `ScrollView.scrollToTop()`、`scrollToBottom()`、`scrollToLeft()`、`scrollToRight()` 等：编程滚动方法。
- `ScrollView.scrollToPercent()`：滚动到指定百分比位置。
- `ScrollView.scrollToOffset()`：滚动到指定偏移量。

## 最小示例

```ts
import { _decorator, Component, ScrollView, Node, UITransform, Size } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ScrollViewDemo')
export class ScrollViewDemo extends Component {
  @property(Node)
  content: Node | null = null;

  start() {
    const scrollView = this.getComponent(ScrollView);
    if (!scrollView || !this.content) return;
    // 确保内容节点尺寸足够大以触发滚动
    const contentTransform = this.content.getComponent(UITransform);
    if (contentTransform) {
      contentTransform.setContentSize(new Size(200, 1200));
    }
  }

  scrollToBottomSmooth() {
    const scrollView = this.getComponent(ScrollView);
    if (!scrollView) return;
    scrollView.scrollToBottom(0.5); // 0.5 秒动画
  }
}
```

## 常见错误

- ScrollView 无法滚动：内容节点的 contentSize 未超过视图节点。常见的失败原因包括：Layout 未设置 `resizeMode: CONTAINER`、动态添加子节点后未更新内容节点尺寸、内容节点 UITransform 被显式锁定为固定尺寸。
- 滚动到边界后仍然可以拖动：`elastic` 为 `true` 时会有回弹效果，这是正常行为。如果不想回弹，设为 `false`。
- 内容错位：子节点总尺寸计算不正确，超出部分不可见。检查 Layout 的 `padding` 和 `spacing` 设置。
- 滚动区域内有按钮点击不生效：按钮在滚动区域内，触摸事件被 ScrollView 拦截。需要确保按钮的点击事件优先级高于 ScrollView 的拖动事件。一般不用额外配置，引擎内部做了事件区分；如果冲突，可调整按钮层级或使用 `ScrollView.scrollTo...` 配合按钮事件触发。
- 性能问题：内容节点内子节点超过数百个会导致帧率下降，推荐使用虚拟化。

## 关联文档

- [Layout — 自动布局容器](layout.md)
- [UITransform — 节点尺寸](ui-transform.md)
- [长列表虚拟化](list-virtualization.md)
- [DrawCall 合批优化](draw-call-batching.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - ScrollView
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
