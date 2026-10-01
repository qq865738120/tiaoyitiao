---
id: cocos-3.8-ui-2d-sprite
version: "3.8"
category: ui-2d
title: Sprite — UI 图片显示组件
keywords:
  - Sprite
  - SpriteFrame
  - 图片
  - 九宫格
  - UI 图片
  - 图片资源
  - 颜色
  - 透明度
  - 层级
  - UI 看不到
related_docs:
  - ui-2d/label.md
  - ui-2d/rich-text.md
  - api-reference/sprite.md
  - recipes/change-label-text.md
  - troubleshooting/ui-not-visible.md
  - ui-2d/draw-call-batching.md
related_api:
  - Sprite
  - SpriteFrame
  - Texture2D
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Sprite"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Sprite — UI 图片显示组件

## 用途

Sprite 组件在 UI 中渲染图片。它是 UI 系统中最基础的显示组件，负责显示图标、背景、按钮贴图等所有 2D 图片内容。

## 核心结论

- Sprite 与 SpriteFrame 的关系：
  - **Sprite** 是**渲染组件**，挂载在节点上负责显示。
  - **SpriteFrame** 是**资源对象**，包含裁剪矩形、旋转、九宫格等图集元数据，被 Sprite 引用。
  - 一张图片（Texture2D）对应多个 SpriteFrame（图集内不同区域），但一个 SpriteFrame 只能引用一张图片。
- 修改图片 → 修改 Sprite 的 `spriteFrame` 属性，赋值新的 SpriteFrame 资源引用。
- 颜色和透明度通过节点的 `color`（`Color` 类型）和 `opacity`（数字类型 0-255）控制。
- UI 层级由节点的 `zIndex` 控制，以及节点在场景层级树的先后顺序。高 `zIndex` 在上层。
- Sprite 支持多种绘制模式：`SIMPLE`（普通）、`SLICED`（九宫格）、`TILED`（平铺）、`FILLED`（填充进度）。
  - `SLICED` 模式配合 SpriteFrame 的九宫格（inset）设置，实现边角不变形、中间拉伸的背景。
- 不显示排查 → 检查节点是否在 Canvas 子树下、UITransform contentSize 是否为零、Sprite.spriteFrame 是否为空、`color.alpha` 是否为零。

## 什么时候使用

- 显示 UI 图标、按钮背景、头像。
- 九宫格背景拉伸（`SLICED` 模式）。
- 进度条或遮罩动画（`FILLED` 模式）。

## 关键 API / 组件

- `Sprite.spriteFrame`：引用的 SpriteFrame 资源。
- `Sprite.type`：绘制模式（`Sprite.Type.SIMPLE`、`SLICED`、`TILED`、`FILLED`）。
- `Sprite.sizeMode`：尺寸模式（`CUSTOM`、`TRIMMED`、`RAW`）。
- 节点 `color`：叠加颜色，与 Sprite 贴图颜色相乘。
- 节点 `opacity`：透明度 0-255，0 为完全透明。
- 节点 `zIndex`：同一父节点下的渲染层级。

## 最小示例

```ts
import { _decorator, Component, Sprite, SpriteFrame, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SpriteDemo')
export class SpriteDemo extends Component {
  @property(SpriteFrame)
  myFrame: SpriteFrame | null = null;

  start() {
    const sprite = this.getComponent(Sprite);
    if (!sprite || !this.myFrame) return;
    // 设置 SpriteFrame
    sprite.spriteFrame = this.myFrame;
    // 设为九宫格模式
    sprite.type = Sprite.Type.SLICED;
    // 修改节点颜色和透明度
    this.node.color = new Color(255, 255, 255);
    this.node.opacity = 200;
  }
}
```

## 常见错误

- Sprite 不显示：`spriteFrame` 为空、`UITransform.contentSize` 为 0、`opacity` 为 0、节点不在 Canvas 子树下。
- 九宫格拉伸变形：未设置 SpriteFrame 的九宫格（inset）边界，或 `type` 未设为 `SLICED`。
- 图片颜色不对：节点 `color` 与原始贴图内容颜色相乘，导致偏色。白色 `(255,255,255)` 为原始颜色。
- 图片模糊：逻辑像素与图片像素不匹配。推荐图片像素尺寸为显示尺寸的 1 倍到 2 倍。
- 合批被打断：相邻节点使用不同图集的 SpriteFrame 会打断合批。

## 关联文档

- [Label — 纯文本显示组件](label.md)
- [RichText — 富文本显示](rich-text.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)
- [DrawCall 合批优化](draw-call-batching.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Sprite
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
