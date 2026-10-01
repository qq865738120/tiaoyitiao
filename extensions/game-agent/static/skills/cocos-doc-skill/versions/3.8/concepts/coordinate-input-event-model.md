---
id: cocos-3.8-concepts-coordinate-input-event-model
version: "3.8"
category: concepts
title: 坐标、输入与事件模型
keywords:
  - 坐标系统
  - 屏幕坐标
  - 世界坐标
  - UI坐标
  - 本地坐标
  - 瓦片坐标
  - 坐标转换
  - Camera screenToWorld
  - UITransform
  - 输入事件
  - EventTouch
  - 事件冒泡
  - 事件捕获
  - 命中检测
  - 多点触摸
  - BlockInputEvents
  - TiledMap
  - 多相机输入
related_docs:
  - scripting/input-events.md
  - scripting/input-system.md
  - scripting/event-system.md
  - api-reference/camera.md
  - api-reference/ui-transform.md
  - api-reference/tiled-map.md
  - api-reference/node.md
  - api-reference/vec3.md
  - troubleshooting/coordinate-conversion-wrong.md
  - troubleshooting/click-through.md
  - troubleshooting/input-not-triggered.md
  - ui-2d/screen-adaptation.md
  - concepts/scene-node-component-model.md
related_api:
  - Camera
  - Node
  - UITransform
  - EventTouch
  - Vec2
  - Vec3
  - Input
  - TiledMap
  - TiledLayer
  - BlockInputEvents
source:
  official: "Cocos Creator 3.8 官方文档 - 坐标系统、事件系统、相机、UI 系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：坐标混淆是最高频问题之一；EventTouch.getLocation/getUILocation 区别常被误解"
status: draft
updated: 2026-06-18
---

# 坐标、输入与事件模型

## 用途

串联 Cocos Creator 3.8 中的屏幕坐标、UI 坐标、世界坐标、节点本地坐标和瓦片坐标，并说明输入事件的命中检测与传播机制。帮助开发者理解坐标转换全景图和事件流向，快速定位坐标/事件相关问题。

## 核心结论

1. **五种坐标空间共存**：屏幕坐标（像素）、UI 坐标（设计分辨率适配后）、世界坐标（场景绝对位置）、节点本地坐标（相对父节点）、瓦片坐标（TiledMap 行列索引）。
2. **坐标转换需要相机和 UITransform**：Camera 负责屏幕↔世界，UITransform 负责 UI↔世界，TiledMap 负责世界↔瓦片。
3. **事件传播三阶段**：捕获（根→目标）→ 目标 → 冒泡（目标→根），默认在冒泡阶段回调。
4. **命中规则按 siblingIndex 从大到小**：同层兄弟节点中排序靠后的先检测命中，BlockInputEvents 可拦截后续检测。
5. **多相机场景不是简单按 priority 选择相机**：需要手动管理点击时的相机选择逻辑。

## 常见问题

### "getLocation 和 getUILocation 的区别？"

- `getLocation()` 返回物理屏幕像素坐标，原点在**左上角**。不受 Canvas 适配影响。
- `getUILocation()` 返回设计分辨率坐标，原点在 Canvas 的**左下角**。已自动处理屏幕适配。
- **推荐**：绝大多数 UI 交互使用 `getUILocation()`，仅在需要原始像素坐标时使用 `getLocation()`。

### "为什么点击事件穿透了？"

可能原因（按排查顺序）：

1. 上层节点**未添加 `BlockInputEvents` 组件**。
2. 上层节点的 `UITransform` 尺寸为零或 `enabled = false`。
3. 上层节点的 `siblingIndex` 比下层节点**小**（即排序在下层之前，视觉上在下层）。
4. 上层节点或其父节点链上某节点 `active = false`。

详见 [点击穿透排错](../troubleshooting/click-through.md)。

### "多相机下点击用哪个相机？"

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 关联文档

- [输入事件与传播](../scripting/input-events.md)
- [输入系统（全局事件）](../scripting/input-system.md)
- [事件系统](../scripting/event-system.md)
- [Camera API 卡片](../api-reference/camera.md)
- [UITransform API 卡片](../api-reference/ui-transform.md)
- [TiledMap API 卡片](../api-reference/tiled-map.md)
- [Node API 卡片](../api-reference/node.md)
- [坐标转换结果不对排错](../troubleshooting/coordinate-conversion-wrong.md)
- [点击穿透排错](../troubleshooting/click-through.md)
- [屏幕适配](../ui-2d/screen-adaptation.md)
- [场景、节点与组件模型](./scene-node-component-model.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 坐标系统、事件系统、相机组件、UI 系统、TiledMap 组件
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——坐标转换与事件传播是高频率误解和 bug 的来源；多相机输入选择需手动管理

## 最小示例

### 1. 点击世界物体（屏幕 → 世界坐标）

在 Canvas 节点上监听触摸，通过 Camera 将 UI 坐标转为世界坐标，判断是否点击到世界中的物体。

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 2. 拖拽 UI 节点

监听节点的 TOUCH_MOVE 事件，根据 `getUIDelta()` 移动节点位置。

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

> 如果拖拽的节点在 Canvas 的子节点层级中且 Canvas 有适配，使用 `getUIDelta()` 可以正确处理缩放后的增量。

### 3. 点选 TiledMap 瓦片

将触摸的屏幕坐标转为世界坐标，再通过 TiledLayer 的瓦片尺寸和图层尺寸计算瓦片行列索引，使用 `getTileGIDAt` 获取瓦片数据。

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。
