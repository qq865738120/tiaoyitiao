---
id: cocos-3.8-ui-2d-list-virtualization
version: "3.8"
category: ui-2d
title: 长列表虚拟化 — 为什么需要虚拟化
keywords:
  - 虚拟化
  - 长列表
  - 列表卡顿
  - 性能
  - 动态列表
  - ScrollView
  - update 刷新 UI
  - 帧率
related_docs:
  - ui-2d/scroll-view.md
  - ui-2d/layout.md
  - ui-2d/draw-call-batching.md
  - ui-2d/common-recipes.md
  - troubleshooting/performance-issues.md
related_api:
  - ScrollView
  - Layout
  - Node
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - ScrollView"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程建议：超过 100 个子节点即应考虑虚拟化"
status: draft
updated: 2026-06-17
---

# 长列表虚拟化 — 为什么需要虚拟化

## 用途

说明 Cocos Creator 3.8 中长列表（数百个子节点）为什么会卡顿，以及虚拟化是怎样解决这个问题的。给出不引入外部库的前提下 Cocos 推荐的实现思路。

## 核心结论

- **为什么卡顿**：ScrollView 内容节点内每个子节点都是一个 UI 节点。当子节点数量超过几百个时：
  1. **节点遍历开销**：每帧引擎需要遍历节点树，计算变换矩阵、更新 UITransform。
  2. **UI 渲染开销**：每个节点产生独立的渲染指令，DrawCall 数量随节点数线性增长。
  3. **事件检测开销**：每个节点参与 UI 点击事件检测。
  4. **内存占用**：每个节点和组件占用堆内存。
- **虚拟化原理**：只创建**可见范围内**的子节点 UI 对象，滑动时回收不可见的节点，将新数据复用到回收的节点上。内容节点上始终只保留几十个活跃节点，但通过滚动偏移让用户感觉列表很长。
- Cocos Creator 3.8 没有内置虚拟化组件，需要自行实现或使用社区方案。基本思路：
  1. 监听 ScrollView `scrolling` 事件，计算当前滚动百分比。
  2. 维护一个节点对象池（`NodePool`），根据可见范围从池中取出或回收节点。
  3. 回收的节点移动到屏幕外或隐藏，使用时更新其位置和数据。
- **update 中刷新 UI 的风险**：在 `update()` 中每帧修改 UI 属性（如位置、尺寸、文本、颜色）会导致频繁的渲染状态更新，叠加虚拟化滚动事件中的 UI 操作，进一步加剧卡顿。应只在需要时才更新 UI（例如 `scrolling` 回调中，而非每帧 `update()`）。

## 什么时候使用

- ScrollView 内容节点子节点数量预期超过 100 个。
- 常见举例：聊天记录（几百到几千条）、积分排行榜、大型物品列表。

## 关键 API / 组件

- `NodePool`：对象池，回收和复用节点。
- `ScrollView.node` 上的 `scrolling` 事件：滚动中回调，用于计算可见范围。
- `ScrollView.getScrollOffset()`：获取当前滚动偏移量。
- `UITransform.setContentSize()`：设置内容节点的虚拟总高度。

## 最小示例

```ts
import { _decorator, Component, ScrollView, NodePool, Node, Prefab, instantiate, UITransform, Size } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('VirtualListDemo')
export class VirtualListDemo extends Component {
  @property(Prefab)
  itemPrefab: Prefab | null = null;

  private pool = new NodePool();
  private totalItems = 1000;
  private itemHeight = 80;

  start() {
    const scrollView = this.getComponent(ScrollView);
    if (!scrollView || !this.itemPrefab) return;
    // 设置内容节点总高度
    const contentTransform = scrollView.content!.getComponent(UITransform)!;
    contentTransform.setContentSize(new Size(200, this.totalItems * this.itemHeight));
    // 初始化可见区域的节点
    this.updateVisibleItems(0);
    // 监听滚动事件
    scrollView.node.on('scrolling', this.onScrolling, this);
  }

  private onScrolling(scrollView: ScrollView) {
    const offset = scrollView.getScrollOffset().y;
    this.updateVisibleItems(offset);
  }

  private updateVisibleItems(offset: number) {
    // 1) 计算可见范围起始/结束索引
    // 2) 回收不可见节点回 pool
    // 3) 从 pool 取出或 instantiate 新节点
    // 4) 设置节点位置和数据显示
    // （此处省略批量管理逻辑，完整实现参考 community 方案）
  }
}
```

## 常见错误

- 在 `update()` 中每帧更新列表子节点的位置/文本：高频更新会放大性能问题，应只在滚动回调中更新。
- 使用 Layout 自动布局管理超长列表：Layout 会在子节点增删时遍历所有子节点计算位置，节点数多时非常慢。虚拟化列表中应手动计算位置。
- 对象池回收不彻底：节点被回收后未重置状态（位置、数据引用），重新使用时显示旧数据。
- 内容节点 contentSize 与实际子节点总尺寸不一致：导致滚动条指示不准确。

## 关联文档

- [ScrollView — 滚动视图](scroll-view.md)
- [Layout — 自动布局容器](layout.md)
- [DrawCall 合批优化](draw-call-batching.md)
- [UI 高频任务索引](common-recipes.md)
- [性能问题排查](../troubleshooting/performance-issues.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - ScrollView
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
- 补充：工程建议——超过 100 个子节点即应考虑虚拟化
