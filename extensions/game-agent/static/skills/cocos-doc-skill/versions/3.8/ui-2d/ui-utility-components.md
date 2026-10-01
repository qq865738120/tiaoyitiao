---
id: cocos-3.8-ui-2d-ui-utility-components
version: "3.8"
category: ui-2d
title: UI 中频工具组件 — UIOpacity / UICoordinateTracker / UISkew / UIStaticBatch / UIMeshRenderer
keywords:
  - UIOpacity
  - UICoordinateTracker
  - UISkew
  - UIStaticBatch
  - UIMeshRenderer
  - 透明度控制
  - 3D坐标跟随UI
  - UI倾斜变换
  - 静态合批
  - UI中渲染3D
related_docs:
  - ui-2d/ui-transform.md
  - ui-2d/widget.md
  - ui-2d/canvas.md
  - ui-2d/sprite.md
  - ui-2d/draw-call-batching.md
  - api-reference/component.md
related_api:
  - UIOpacity
  - UICoordinateTracker
  - UISkew
  - UIStaticBatch
  - UIMeshRenderer
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - UI 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "引擎源码：UIStaticBatch 自 v3.4.1 起已废弃，方法体被清空"
    - "UIMeshRenderer 的稳定性和性能在复杂场景下未充分验证，官方推荐使用 Render Texture 替代"
status: draft
updated: 2026-06-18
---

# UI 中频工具组件 — UIOpacity / UICoordinateTracker / UISkew / UIStaticBatch / UIMeshRenderer

## 用途

Cocos Creator 3.8 提供若干中频使用的 UI 工具组件，用于解决特定场景下的布局、渲染和交互需求。本文档覆盖 UIOpacity（节点透明度）、UICoordinateTracker（3D 坐标 UI 跟随）、UISkew（倾斜变换）、UIStaticBatch（废弃的静态合批）和 UIMeshRenderer（UI 中渲染 3D 模型）。

## 核心结论

- **UIOpacity**：控制节点树整体透明度，适用于含多个子节点的容器整体淡入淡出。渲染节点应直接设置 `color.a`。
- **UICoordinateTracker**：每帧将 3D 世界坐标转换为 UI 屏幕坐标，适用于血条/名称跟随。需要设置目标节点和 3D 相机。
- **UISkew**：对 UI 节点施加斜切变换，支持 x/y 轴独立倾斜角度和旋转/切线两种算法。
- **UIStaticBatch**：自 v3.4.1 起已废弃，功能失效，不应在新项目中使用。
- **UIMeshRenderer**：在 UI 节点上渲染 3D 模型，强制前向渲染，无法与 Sprite/Label 合批，官方推荐使用 Render Texture 替代。

## 关联文档

- [UITransform — UI 节点尺寸与布局基础](ui-transform.md)
- [Widget — UI 自动对齐与边距约束](widget.md)
- [Canvas — UI 渲染根节点](canvas.md)
- [Sprite — 精灵组件](sprite.md)
- [DrawCall 合批](draw-call-batching.md)
- [Component API 卡片](../api-reference/component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - UI 组件
- 已交叉验证：cc-engine 3.8 公开类型声明
