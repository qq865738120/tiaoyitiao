---
id: cocos-3.8-concepts-render-order-and-sorting
version: "3.8"
category: concepts
title: 2D/3D 渲染顺序与排序
keywords:
  - 渲染顺序
  - 排序
  - Sorting2D
  - sortingLayer
  - sortingOrder
  - siblingIndex
  - 深度测试
  - depthTest
  - depthWrite
  - 透明排序
  - 不透明物体
  - 材质队列
  - priority
  - 相机顺序
  - 合批
  - DrawCall
  - Mask
  - 遮罩
  - 渲染层级
  - 节点层级
related_docs:
  - api-reference/camera.md
  - api-reference/ui-transform.md
  - api-reference/mask.md
  - api-reference/material.md
  - api-reference/node.md
  - scene-node-component/hierarchy.md
  - scene-node-component/transform.md
  - ui-2d/draw-call-batching.md
  - concepts/3d-scene-rendering.md
  - concepts/coordinate-input-event-model.md
related_api:
  - Sorting2D
  - Sorting
  - SortingLayers
  - Camera
  - Node
  - UITransform
  - Mask
  - Material
source:
  official: "Cocos Creator 3.8 官方文档 - 渲染排序、Sorting2D 组件、材质 Pass、Camera priority"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：Sorting2D 是 2D UI 最可靠的排序手段，position.z 在 3.x 中不是可靠的排序依据"
status: draft
updated: 2026-06-18
---

# 2D/3D 渲染顺序与排序

## 用途

系统说明 Cocos Creator 3.8 中 2D 和 3D 节点的渲染顺序控制机制：Sorting2D、节点层级（siblingIndex）、UITransform priority、Mask 裁剪、3D 深度测试与透明排序、相机 priority 等。帮助开发者理解"谁在前谁在后"的完整决策链。

## 核心结论

Cocos Creator 3.8 的渲染顺序由多个机制分层控制，优先级从高到低：

1. **Camera priority** — 相机层面：决定哪个相机先画，后画的相机覆盖先画的。
2. **Sorting2D / Sorting** — 组件层面：`sortingLayer > sortingOrder`，直接控制排序优先级。
3. **节点层级（siblingIndex）** — 结构层面：同级节点中索引大的后渲染（显示在上层）。
4. **位置 z 轴** — 仅默认排序规则中的辅助因素，优先级低于排序组件和兄弟索引。
5. **材质 Pass priority / phase** — 材质层面：控制同一节点不同 Pass 的执行顺序。
6. **深度测试（3D）** — GPU 硬件层面：不透明从前到后，透明从后到前。

### 2D / 3D / 2D-in-3D 场景排序规则

| 场景 | 主导排序机制 | z 轴作用 | 透明排序 |
|---|---|---|---|
| **纯 2D** | Sorting2D > siblingIndex > position.z | 辅助参考，优先级低 | 按排序结果逐节点绘制（Painter's Algorithm） |
| **纯 3D** | 深度测试（depthTest）+ 材质队列 | 真实深度位置 | 不透明先（前→后）、透明后（后→前） |
| **2D-in-3D**（2D UI 叠加 3D 场景） | Camera priority（UI 相机后画）> 各自相机内排序 | UI 相机内同"纯 2D"规则 | 各相机独立处理 |

## 关联文档

- [3D 场景渲染基础](./3d-scene-rendering.md) — Camera/Light/MeshRenderer 协作与 visibility
- [节点层级与父子关系](../scene-node-component/hierarchy.md) — siblingIndex 与层级操作
- [Transform 变换](../scene-node-component/transform.md) — UI 与 3D 节点的位置系统差异
- [坐标、输入与事件模型](./coordinate-input-event-model.md) — 命中检测中的 siblingIndex 规则
- [2D 合批优化](../ui-2d/draw-call-batching.md) — 排序变动对 DrawCall 的影响
- [Camera API 参考](../api-reference/camera.md) — Camera priority 与多相机管理
- [UITransform API 参考](../api-reference/ui-transform.md) — priority（已废弃）、cameraPriority
- [Mask API 参考](../api-reference/mask.md) — 遮罩裁剪与渲染顺序
- [Material API 参考](../api-reference/material.md) — Pass priority / phase

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 渲染排序 / Sorting2D 组件 / 材质系统 / Camera 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
- 补充：工程经验——Sorting2D 是 2D UI 最可靠的排序手段，position.z 在 3.x 中不是可靠的排序依据
