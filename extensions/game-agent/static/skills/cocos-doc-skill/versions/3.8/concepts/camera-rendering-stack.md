---
id: cocos-3.8-concepts-camera-rendering-stack
version: "3.8"
category: concepts
title: 相机与多相机叠加渲染
keywords:
  - Camera
  - 相机
  - 多相机
  - priority
  - ClearFlags
  - visibility
  - Layer
  - targetTexture
  - RenderTexture
  - 小地图
  - 画中画
  - 后处理
  - UI相机
  - 相机渲染顺序
  - rect
related_docs:
  - api-reference/camera.md
  - concepts/3d-scene-rendering.md
  - concepts/coordinate-input-event-model.md
  - troubleshooting/3d-object-not-visible.md
related_api:
  - Camera
  - Canvas
  - RenderTexture
  - Layers
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 相机"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-18
---

# 相机与多相机叠加渲染

## 用途

建立 Camera priority、visibility、Layer、ClearFlags、Rect、TargetTexture 和多相机叠加的统一心智模型。理解多相机如何在同一帧内协作完成复杂渲染需求（UI 叠加、小地图、画中画、后处理）。

## 核心结论

Cocos Creator 3.8 的多相机渲染围绕 **三条核心规则**：

1. **priority 越小越先渲染**：数值小的相机先绘制，后绘制的相机像素覆盖前者。这是多相机的唯一渲染顺序规则。
2. **visibility 位掩码决定每个相机看什么**：相机只渲染其 `visibility` 包含的 Layer 上的节点，不同相机可各看各的 Layer。
3. **ClearFlags 控制帧缓冲清除行为**：决定每帧开始时清除什么（颜色/深度/模板），决定前后相机如何叠加。

这三条规则独立运作、组合使用。相机渲染顺序 ≠ 2D 节点排序顺序 ≠ 输入命中顺序——这是三个不同系统。

## 关联文档

- [Camera API 卡片](../api-reference/camera.md)
- [3D 场景渲染基础](./3d-scene-rendering.md)
- [坐标、输入与事件模型](./coordinate-input-event-model.md)
- [3D 对象不可见排查](../troubleshooting/3d-object-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 相机
- 已交叉验证：cc-engine 3.8 公开类型声明

## 最小示例

### 示例一：双相机初始化（UI 叠加 3D）

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 示例二：RenderTexture 小地图

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->
