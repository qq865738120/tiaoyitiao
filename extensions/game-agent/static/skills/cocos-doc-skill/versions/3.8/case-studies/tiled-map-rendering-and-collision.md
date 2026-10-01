---
id: cocos-3.8-case-studies-tiled-map-rendering-and-collision
version: "3.8"
category: case-studies
title: 2D 瓦片地图渲染与碰撞
keywords:
  - TiledMap
  - TiledLayer
  - 瓦片地图
  - TMX
  - ObjectGroup
  - 对象层
  - 碰撞检测
  - 渲染层级
  - Sorting2D
  - 坐标转换
  - 分块加载
  - 地形碰撞
related_docs:
  - api-reference/tiled-map.md
  - scene-node-component/common-node-compositions.md
  - scene-node-component/component-dependencies-and-combinations.md
  - concepts/coordinate-input-event-model.md
  - concepts/physics-filtering-and-collision-matrix.md
  - recipes/detect-collision-2d.md
  - recipes/load-resource-dynamically.md
related_api:
  - TiledMap
  - TiledLayer
  - TiledObjectGroup
  - TiledMapAsset
  - TMXObject
  - BoxCollider2D
  - PolygonCollider2D
  - Sorting2D
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - 组件 - TiledMap, 物理 2D, 渲染排序"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：瓦片地图层级管理、动态碰撞体生成、坐标转换、分块加载方案"
status: draft
updated: 2026-06-18
---

# 2D 瓦片地图渲染与碰撞

## 场景树

### 推荐层命名约定

在 Tiled 编辑器中按以下约定命名图层，便于代码中按名称查找和排序管理：

```
地图 (TMX 文件)
├── Background (Tile Layer)      # 最底层：天空、远景
├── Ground (Tile Layer)          # 地面：可行走区域
├── Decoration (Tile Layer)      # 装饰：不可碰撞的装饰物
├── Foreground (Tile Layer)      # 前景：角色身后的物体
├── Collision (Object Layer)     # 碰撞区域：多边形/矩形碰撞体
├── SpawnPoint (Object Layer)    # 出生点：对象标记
├── Triggers (Object Layer)      # 触发器：区域事件
└── Overlay (Tile Layer)         # 最顶层：覆盖角色的物体（如树叶、屋顶）
```

### Cocos 运行时节点树

<!-- 长示意图已压缩：保留上文结构与下文决策规则。 -->

> **说明**：TiledLayer 子节点由 TiledMap 在设置 `tmxAsset` 后自动创建，每个对应 TMX 中的一个 Tile Layer。CollisionObjects、SpawnObjects、TriggerZones 是运行时手动创建的父节点，用于容纳动态生成的碰撞体和标记。

## 组件表

| 节点路径 | 组件 | 用途 |
|---|---|---|
| MapRoot | `TiledMap` | 加载并渲染 TMX 地图，管理图层/对象组访问 |
| MapRoot | `UITransform` | 定义地图节点的 UI 变换（TiledMap 依赖） |
| MapRoot/Background ~ Overlay | `TiledLayer` | 渲染对应图层瓦片（自动生成） |
| MapRoot/Foreground/Player | `Sprite` | 角色渲染 |
| MapRoot/Foreground/Player | `PlayerController`（自定义） | 处理输入与移动逻辑 |
| MapRoot/Foreground/Player | `RigidBody2D` | 提供物理运动与碰撞检测 |
| MapRoot/Foreground/Player | `BoxCollider2D` | 角色碰撞形状 |
| MapRoot/CollisionObjects/* | `BoxCollider2D` / `PolygonCollider2D` | 地形碰撞体 |
| MapRoot/TriggerZones/* | `BoxCollider2D`（sensor=true） | 触发器区域 |
| MapRoot/Overlay | `TiledLayer` | 覆盖角色的前景图层 |

## 数据流

<!-- 长示意图已压缩：保留上文结构与下文决策规则。 -->

## 关键实现

### 1. 地图加载与初始化

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**设计意图**：方式 A 在编辑器中拖拽绑定，类型安全且无需处理异步加载时机；方式 B 适用于按需加载多个地图的场景，配合 Bundle 实现分包。

### 2. 从 ObjectGroup 动态生成碰撞体

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**设计意图**：在 Tiled 编辑器中用 ObjectGroup 绘制碰撞区域，运行时读取多边形顶点或矩形尺寸，动态创建 Collider2D。多边形碰撞体适用于不规则地形（如河流、斜坡），矩形碰撞体适用于规则墙壁。关键点在于 Tiled 对象锚点在左上角（Y 轴向下为正），Cocos 的 BoxCollider2D.offset 以几何中心为参考，需要计算偏移。

### 3. 角色放置与渲染层级

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**设计意图**：
- **方案 A（siblingIndex 控制）**：将 Player 放在 Foreground 之后、Overlay 之前，利用节点的 siblingIndex 自然排序——TiledLayer 的渲染顺序与子节点在父节点下的顺序一致。
- **方案 B（Sorting2D）**：给 Player 添加 `Sorting2D` 组件，设置 `sortingLayer` 和 `sortingOrder`，与 TiledLayer 的排序值配合。TiledLayer 本身支持 `sortingLayer`，可通过编辑器或代码设置。
- **Overlay 遮挡**：Overlay 是顶层 Tile Layer，渲染在角色之上。当角色走到树下/屋顶下时，Overlay 的瓦片自然遮挡角色，无需额外代码。

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 验证

### 手动验证

1. **地图渲染**：启动场景后观察地图是否正常显示，各图层瓦片位置是否正确（无偏移/错位）。
2. **图层可见性**：在运行时通过代码切换各 TiledLayer 的 `node.active`，验证图层独立控制。
3. **碰撞体验**：控制角色向墙壁移动，确认角色不能穿过碰撞体；向开阔区域移动，确认可以自由行走。
4. **Overlay 遮挡**：控制角色走到 Overlay 图层（如树下），观察角色是否被正确遮住。向下走时角色应在树前，向上走时角色应在树后。
5. **触发器区域**：控制角色走进触发器区域，观察控制台是否输出进入日志。
6. **出生点**：观察角色是否出现在 SpawnPoint 标记的位置。

### 自动化验证

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

## 失败路径

### 1. 地图不显示

**现象**：场景运行时一片空白，控制台无报错。

**排查**：
- 检查 `TiledMap` 组件的 `tmxAsset` 是否为 null —— 在编辑器中拖拽绑定或代码中赋值。
- 检查 `.tmx` 文件导入后，`.tsx` 和图片文件是否在同一目录下。
- 检查相机是否正确配置：2D 地图需要场景中存在 Canvas 和 Camera（或 2D 正交相机），且相机 Culling Mask 包含地图所在层。
- 如果地图设置了旋转或倾斜，需关闭 `enableCulling`。

### 2. 碰撞体位置不对

**现象**：碰撞体偏移，角色在空气中碰撞或穿过墙壁。

**排查**：
- 确认 Tiled 坐标系（左上角原点，Y 向下）和 Cocos 坐标系（左下角原点，Y 向上）的转换是否正确。
- 对于 `BoxCollider2D`，`offset` 需要从 Tiled 对象的左上角锚点转换到几何中心：`offset = (width/2, -height/2)`。
- 对于 `PolygonCollider2D`，`points` 数组的顶点坐标是相对于 Tiled 对象位置的坐标，直接使用即可。
- 检查地图节点本身是否有额外的缩放、旋转或位置偏移。

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。
