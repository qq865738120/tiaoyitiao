---
id: cocos-3.8-recipes-reduce-draw-calls
version: "3.8"
category: recipes
title: 减少 DrawCall — UI 合批条件与优化实践
keywords:
  - DrawCall 高
  - DrawCall 优化
  - 降低 DrawCall
  - 合批条件
  - UI 合批条件
  - 图集优化
  - 合批验证
  - 减少 DrawCall
  - 渲染批次
related_docs:
  - ui-2d/draw-call-batching.md
  - concepts/profiler-workflow.md
  - troubleshooting/frame-rate-low.md
  - troubleshooting/performance-issues.md
  - ui-2d/sprite.md
  - ui-2d/label.md
related_api:
  - SpriteAtlas
  - Sprite
  - SpriteFrame
  - Label
  - RichText
  - Mask
  - Material
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - 合批优化"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程建议：降低 DrawCall 优先从图集合并和节点层级重排入手"
status: draft
updated: 2026-06-18
---

# 减少 DrawCall — UI 合批条件与优化实践

## 目标

降低 UI 界面中的 DrawCall 数量，提升渲染性能，尤其是在中低端移动设备上保证帧率稳定。

## 推荐做法

Cocos Creator 3.8 的渲染引擎会将**渲染状态相同**的连续 UI 节点自动合批为一次 DrawCall。当相邻节点的纹理、材质、渲染模式不同时，合批会被打断。因此降低 DrawCall 的核心策略是：

1. **使用同一图集**：将 UI 小图打包到一张 `SpriteAtlas` 中，同图集内的 Sprite 节点可合批。
2. **按组件类型归类层级**：Sprite 放一起、Label 放一起，减少跨类型组件交错排列。
3. **减少 RichText、Mask、customMaterial 的使用**，这些组件会打断合批。
4. **避免运行时动态换图为不同图集**，导致已合批的批次被打断。

DrawCall 只是性能的一部分。节点遍历开销和脚本执行效率同样重要，合批降低后如果帧率仍未达标，还需排查其他方向（见 `troubleshooting/frame-rate-low.md`）。

## 示例代码

```ts
import { _decorator, Component, Node, Sprite, SpriteFrame, SpriteAtlas } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 以下代码演示动态设置同一图集下的 SpriteFrame
 * 前提：所有 Sprite 节点在层级树中连续排列
 */
@ccclass('AtlasDemo')
export class AtlasDemo extends Component {
  @property(SpriteAtlas)
  uiAtlas: SpriteAtlas | null = null;

  start() {
    if (!this.uiAtlas) return;
    // 同一图集下的 SpriteFrame 自动合批
    const sprite = this.node.getComponent(Sprite);
    if (sprite && this.uiAtlas.getSpriteFrame('icon_coin')) {
      sprite.spriteFrame = this.uiAtlas.getSpriteFrame('icon_coin');
    }
  }
}
```

## 操作步骤

1. **确认 DrawCall 是否过高**
   - 打开 Creator Profiler（`开发者 -> 打开 Profiler`），查看 `DrawCall` 数值。移动端建议控制到 100-200 以内。
   - 也可以在 Chrome DevTools 中查看渲染数据。

2. **合并图集**
   - 在编辑器中创建 `SpriteAtlas` 资源，将当前 UI 使用的所有碎片图片打包到同一张图集中。
   - 也可以使用 AutoAtlas 工具自动打包。
   - 确保所有相关 Sprite 节点引用的 SpriteFrame 都来自同一图集。

3. **调整节点层级**
   - 在 Node 层级树中，将使用同一图集的 Sprite 节点放在连续父子或兄弟位置。
   - 避免不同纹理的节点交错排列（A 图集 → B 图集 → A 图集会打断合批）。

4. **处理异常组件**
   - 如果必须使用 `RichText`，将其放到层级末尾，减少对其余节点的合批打断。
   - `Mask` 和 `customMaterial` 会打断合批，尽量限制使用范围。
   - `Label` 的烘焙模式（`CacheMode` 设为 `BITMAP` 或 `CHAR`）可以减少合批打断，但需注意字符集和字体限制。

5. **验证效果**
   - 操作前后对比 Profiler 中的 DrawCall 数值。
   - 在目标设备上测试帧率是否有提升。

## 验证方式

- 打开 Creator Profiler，观察 DrawCall 数值在步骤前后的变化：如果步骤操作正确，DrawCall 应明显下降。
- 在构建发布后，使用 Chrome DevTools Rendering Tab 或平台 Profiler 再次确认。
- 如果 DrawCall 未变化，说明合批条件未达到：（A）节点层级不连续，（B）图集/纹理不一致，（C）存在未清理的 customMaterial。

## 常见错误

- **只改图集不改层级**：即使所有节点使用同一图集，如果不同纹理的节点在层级中交错排列，合批仍然会被打断。
- **盲目合并大图集**：一张图集不宜超过 2048x2048（视平台限制），过大会导致内存浪费和带宽压力。
- **忽略 Label 对 DrawCall 的影响**：每个 Label 默认使用独立纹理，插入一组 Sprite 节点之间会打断合批。Label 应集中放置。
- **运行时动态 SpriteFrame 来自图集外**：`resources.load` 加载的独立纹理不会自动归入已有图集的合批。
- **忽视 RichText 的 DrawCall 放大**：每个内联样式片都是一个独立批次，大量 RichText 可能产生数十个 DrawCall。
- **customMaterial 全局使用**：使用自定义材质的节点即使位置连续也无法合批。

## 相关文档

- [2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md)：合批机制的全面说明，包含合批打断的详细分析
- [Profiler 工作流](../concepts/profiler-workflow.md)
- [帧率低排查](../troubleshooting/frame-rate-low.md)
- [Sprite — 图片显示组件](../ui-2d/sprite.md)
- [Label — 文本显示组件](../ui-2d/label.md)
- [性能问题分诊](../troubleshooting/performance-issues.md)
