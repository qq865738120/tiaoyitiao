---
id: cocos-3.8-ui-2d-draw-call-batching
version: "3.8"
category: ui-2d
title: 2D 合批优化 — DrawCall 为什么高
keywords:
  - DrawCall
  - 合批
  - 性能
  - UI 合批
  - 图集
  - SpriteAtlas
  - 合批失败
  - UI DrawCall 高
  - 合批优化
  - Sorting2D
  - siblingIndex
  - 渲染排序
  - 排序打断合批
related_docs:
  - ui-2d/sprite.md
  - ui-2d/label.md
  - ui-2d/rich-text.md
  - ui-2d/list-virtualization.md
  - troubleshooting/performance-issues.md
  - concepts/render-order-and-sorting.md
related_api:
  - Sprite
  - SpriteFrame
  - Label
  - RichText
  - Sorting2D
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - 合批优化"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程建议：一套 UI 使用同一张图集是降低 DrawCall 的最直接方法"
status: draft
updated: 2026-06-17
---

# 2D 合批优化 — DrawCall 为什么高

## 用途

解释 Cocos Creator 3.8 中 UI 系统的合批（Batch）机制，分析 DrawCall 高的常见原因，以及降低 DrawCall 的实践方法。

## 核心结论

- DrawCall 是 CPU 向 GPU 发送的一次渲染命令。DrawCall 数量过高会降低帧率，尤其是中低端设备。
- Cocos 引擎会将**渲染状态相同**的连续 UI 节点合并为一次 DrawCall。以下情况会打断合批：
  1. **不同图集/纹理**：相邻 UI 节点使用来自不同图集（Texture）的 SpriteFrame，无法合批。
  2. **不同渲染模式**：混合了 Sprite、Label、RichText、Graphics 等不同组件类型（渲染材质不同）。
  3. **层级交错**：使用不同纹理的节点在层级树上交错排列（A 图集 → B 图集 → A 图集），引擎无法重新排序。
  4. **自定义材质**：使用了自定义 Material 的节点打断合批。
  5. **RichText 内联样式**：每个样式片段产生独立的渲染命令。
- 降低 DrawCall 的实践方法：
  - **使用图集（SpriteAtlas）**：将所有 UI 图片打包到同一张图集中。相邻 Sprite 节点用同一图集即可合批。
  - **按组件类型归类层级**：将 Sprite 节点集中放置、Label 节点集中放置，减少跨类型的渲染打断。
  - **减少 RichText 使用量**：对大量文本用 Label，仅关键处用 RichText。
  - **避免同一层级树中不同图集交错排列**：将使用同一图集的节点放在连续的兄弟位置。
- 注意：合批只是性能优化的一部分。**节点数量过多**（几百个节点本身的遍历开销）和 **update 中频繁修改 UI 属性**同样会影响性能。

## 什么时候使用

- 发现 UI 界面上 DrawCall 异常高（例如几十到上百）。
- 发布到低端移动设备时 UI 帧率不达标。
- 排查"UI DrawCall 为什么高"类问题。

## 关键概念

- **DrawCall**：一次 GPU 渲染调用。每帧的 DrawCall 数量应在几十以内。
- **Batch**：引擎将一个或多个节点合并为一次 DrawCall 的过程。
- **SpriteAtlas**：图集资源，将多张小图合并为一张大纹理，配合 SpriteFrame 元数据引用区域。
- **AutoAtlas**：Cocos 提供的自动化图集打包工具。
- **RenderData**：每个 UI 节点的渲染数据，对齐材质 → 纹理 → 顶点数据后触发合批。

## 最小示例

```ts
import { _decorator, Component, Sprite, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

// 假设 uiAtlas 是打包好的图集资源
// 所有使用 uiAtlas 中 SpriteFrame 的相邻 Sprite 节点会自动合批
// 不需要额外代码

@ccclass('BatchDemo')
export class BatchDemo extends Component {
  @property(SpriteFrame)
  icon1: SpriteFrame | null = null;

  @property(SpriteFrame)
  icon2: SpriteFrame | null = null;
}
```

## 排序变化如何破坏合批

改变渲染排序可能直接打断 DrawCall 合批。合批依赖**纹理连续性**——引擎只能合批渲染队列中相邻且使用相同纹理/材质的节点。当排序发生变化时，原本连续的节点可能被拆散。

### 破坏合批的排序操作

| 操作 | 影响机制 | 严重程度 |
|---|---|---|
| **Sorting2D 交错不同图集节点** | 通过 `sortingOrder` 将使用不同图集的节点插入到原本连续的合批序列中，打断纹理连续性 | 高 |
| **运行时修改 `setSiblingIndex`** | 改变同级节点顺序，合批状态需要重建 | 中 |
| **Mask 节点** | Mask 启动/关闭 Stencil 写入和测试，必然打断合批 | 高（每层 Mask 至少 +1 DrawCall） |
| **频繁修改排序属性** | 在 `update()` 中每帧修改 `sortingOrder` 或 `siblingIndex`，导致合批状态频繁重建 | 高 |

### 实践建议

```ts
import { _decorator, Component, Node, Sorting2D } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BatchingSortExample')
export class BatchingSortExample extends Component {
  @property(Node)
  backgroundGroup: Node | null = null;   // 所有背景 Sprite 用同一图集 A

  @property(Node)
  foregroundGroup: Node | null = null;   // 所有前景 Sprite 用同一图集 B

  start() {
    // 好的做法：按图集分组设置 Sorting2D，同组节点保持纹理连续性
    if (this.backgroundGroup) {
      const bgSort = this.backgroundGroup.addComponent(Sorting2D);
      bgSort.sortingOrder = 0;   // 图集 A 节点集中排列，可合批
    }

    if (this.foregroundGroup) {
      const fgSort = this.foregroundGroup.addComponent(Sorting2D);
      fgSort.sortingOrder = 10;  // 图集 B 节点集中排列，可合批
    }
    // 同一排序层的同图集节点是连续的 → 合批不受影响
  }

  // 错误做法：逐个节点单独设置 sortingOrder，打乱纹理连续性
  // spriteA1.sortingOrder = 0;   // 图集 A
  // spriteB1.sortingOrder = 1;   // 图集 B ← 打断
  // spriteA2.sortingOrder = 2;   // 图集 A ← 再次打断
}
```

> 详细排序机制见 [2D/3D 渲染顺序与排序](../concepts/render-order-and-sorting.md)。

## 常见错误

- 盲目追求合批：过度优化的图集可能导致内存浪费。一个图集不宜超过 2048x2048（按项目需求）。
- 忽视节点遍历开销：即使 DrawCall 很低（例如全部在一张图集中合批），几百个节点的每帧遍历仍然会消耗 CPU 时间。
- 未使用 AutoAtlas：直接引用独立的散图（每张图片一个 Texture）会大幅增加 DrawCall。
- 运行时动态换图导致合批打断：动态加载的 SpriteFrame 来自不同图集时打断合批。
- 在 `update()` 中每帧修改 Sprite 的位置或颜色：导致合批状态频繁重建。

## 关联文档

- [Sprite — 图片显示组件](sprite.md)
- [Label — 纯文本显示组件](label.md)
- [RichText — 富文本](rich-text.md)
- [长列表虚拟化](list-virtualization.md)
- [UI 高频任务索引](common-recipes.md)
- [性能问题排查](../troubleshooting/performance-issues.md)
- [2D/3D 渲染顺序与排序](../concepts/render-order-and-sorting.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - 合批优化
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
- 补充：工程建议——一套 UI 使用同一张图集是降低 DrawCall 的最直接方法
