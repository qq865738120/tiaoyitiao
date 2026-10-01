---
id: cocos-3.8-ui-2d-canvas
version: "3.8"
category: ui-2d
title: Canvas — UI 渲染根节点
keywords:
  - Canvas
  - UI 根节点
  - 设计分辨率
  - 适配模式
  - UI 位置不对
related_docs:
  - ui-2d/ui-transform.md
  - ui-2d/widget.md
  - ui-2d/screen-adaptation.md
  - recipes/screen-adaptation.md
  - troubleshooting/ui-not-visible.md
related_api:
  - Canvas
  - ResolutionPolicy
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Canvas"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-07-24
---

# Canvas — UI 渲染根节点

## 用途

Canvas 是最常用的屏幕 UI 渲染根节点，并继承自 `RenderRoot2D`。2D/UI 可渲染节点需要位于 `RenderRoot2D` 子树；屏幕 UI 通常使用 Canvas，世界空间 2D/UI 则不必被限定为 Canvas 后代。

## 核心结论

- 屏幕 UI 通常使用一个 Canvas 作为渲染根；严格的渲染要求是处于 `RenderRoot2D` 子树，而不是“所有 UI 必须在 Canvas 下”。
- 设计分辨率和屏幕适配策略在项目设置中配置，不是 Canvas 组件上的 `designResolution` / `fitMode` 字段。
- Canvas 不自带可视外观；它只提供渲染根和适配上下文。
- Canvas 模板通常同时创建 UITransform、Canvas、Widget 和配套 Camera；使用模板后仍应复核 Camera 引用、Layer 与 Visibility。
- 普通空节点挂到 Canvas 下不会仅因父子关系自动添加 UITransform。

## 什么时候使用

- 创建 UI 界面：场景中放置 Canvas 节点作为 UI 根。
- 多分辨率适配：在项目设置中确定设计分辨率，再使用 Widget、安全区和布局组件完成节点级适配。
- UI 不可见排查：确认 UITransform 父链到达 RenderRoot2D，并检查 Layer 与 Camera Visibility。

## 关键 API / 组件

- `Canvas` 组件：挂载节点提供 UI 根渲染上下文。
- `Canvas.cameraComponent`：Canvas 关联的 Camera。
- `Canvas.alignCanvasWithScreen`：是否让 Canvas 节点与屏幕对齐。
- `RenderRoot2D`：Canvas 的父类，也是 2D/UI 渲染根的严格边界。

## 最小示例

1. 在项目设置中配置设计分辨率与适配策略。
2. 使用 Creator 的 Canvas 节点模板创建屏幕 UI 根。
3. 将 HUD、内容区和弹窗层按职责分组，并用 Widget/Layout 负责适配与排列。
4. 保存后复核 Canvas 的 Camera 引用、节点 Layer 和 Camera Visibility。

## 常见错误

- UI 无法显示：检查 UITransform 父链是否到达 RenderRoot2D，以及 Layer 是否被目标 Camera 看见。
- UI 位置偏移：检查项目设计分辨率、Widget、锚点和安全区，不要尝试写入不存在的 Canvas `fitMode`。
- Canvas 后代没有 UITransform：父子关系不会递归添加组件，应使用 UI 模板或显式添加依赖 UITransform 的组件。

## 关联文档

- [UITransform — UI 节点的尺寸与坐标](ui-transform.md)
- [Widget — 自动对齐与边距](widget.md)
- [屏幕适配心智模型](screen-adaptation.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)

## 来源

- 官方：[Cocos Creator 3.8 Canvas](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/canvas.html)
- 官方：[Cocos Creator 3.8 RenderRoot2D](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/renderroot2d.html)
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
