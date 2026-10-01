---
id: cocos-3.8-architecture-grid-and-dual-grid-tile-systems
version: "3.8"
category: architecture
title: 网格与双网格瓦片系统
keywords:
  - 网格
  - 瓦片
  - 方形网格
  - 六边形网格
  - 坐标系统
  - offset坐标
  - cube坐标
  - 双网格
  - dual grid
  - 位掩码邻接
  - 地形过渡
  - 占用检测
  - 邻接查询
  - A星寻路
  - 战棋
  - 塔防
  - 地牢生成
  - 农场模拟
related_docs:
  - architecture/game-loop-and-execution-order.md
  - architecture/services-events-and-dependencies.md
  - architecture/state-machines-and-data-driven-design.md
  - case-studies/tiled-map-rendering-and-collision.md
related_api:
  - Node
  - Vec2
  - Vec3
  - Sprite
  - Component
  - EventTarget
source:
  official: "Amit's Game Programming Information - Hexagonal Grids、Red Blob Games"
  supplement:
    - "工程经验：方形网格/六边形网格在 2D 游戏中的坐标映射、双网格瓦片过渡、位掩码邻接编码"
status: draft
updated: 2026-06-18
---

# 网格与双网格瓦片系统

## 适用条件

- **回合制/战棋游戏**：移动范围基于格子距离，攻击范围基于格子邻接
- **塔防游戏**：路径由格子序列定义，防御塔放置在格子中心
- **地牢生成**：房间和走廊由格子拼接，使用 BSP/Drunkard's Walk/元胞自动机等算法
- **农场/建造模拟**：地块是可耕种单元，建筑占用 N×M 格子
- **消除/三消类**：棋盘本身就是网格，交换和消除依赖格子邻接
- **需要地形过渡的场景**：如草地→沙地→水面的平滑边界，使用双网格技术

## 非适用条件

- **自由移动的物理游戏**：角色位置由物理引擎连续计算，不需要离散化（如平台跳跃、空中射击）
- **纯 3D 开放世界**：地形由高度图和三角网格表示，使用 NavMesh 而非格子网格做寻路
- **只有极少交互对象的场景**：用格子反而增加复杂度，直接使用世界坐标 + 距离判断更简单
- **需要极精细空间划分的游戏**：如精确的弹道模拟，格子粒度过粗

---

# 第一部分：网格坐标基础

## Cocos落地

在 Cocos 中通常用数据层维护格子坐标、占用和地形类型，用 TileMap/TiledMap、Sprite 或自定义 Mesh 负责表现；双网格属于算法与资源组织方案，不是 Creator 内置开关，需要自己生成过渡瓦片和邻接掩码。

## 代价

网格系统会引入坐标换算、增量刷新和资源命名约定；双网格能提升地形过渡质量，但会增加瓦片素材数量、编辑流程和调试成本。

## 概述

网格（Grid）是 2D 游戏中最基础的空间组织方式。它将连续的 2D 世界离散化为有限个格子，每个格子有明确的坐标和邻接关系。网格系统解决的核心问题：**将连续空间的"在哪里"转化为离散空间的"第几行第几列"**，从而让寻路、放置、范围判定等逻辑变得精确且可预测。

双网格（Dual Grid）是一种高级瓦片技术：同时维护顶点网格（vertex grid）和格子网格（cell grid）的对应关系，通过位掩码编码邻接地形类型，自动选择正确的过渡瓦片，实现平滑的地形边界（如草地到水面的边缘过渡）。

## 3. 数据流与所有权

```
用户输入
  ↓
GridInputHandler (屏幕坐标 → grid坐标)
  ↓
GridManager (setOccupancy / markDirty)
  ↓
GridRenderer.flushDirty() (更新 Node/Sprite)
  ↓
渲染到屏幕
```

- **GridManager** 持有网格数据的**唯一所有权**，所有修改必须经过它
- **GridRenderer** 只读 GridManager 数据，执行可视化

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 4. 可组合性

| 组合场景 | 方式 |
|---|---|
| 网格 + 对象池 | GridRenderer 使用 NodePool 管理格子节点，避免频繁 instantiate/destroy |
| 网格 + 状态机 | 将每个格子视为一个状态机，管理其生命周期（空地→施工中→建筑） |
| 网格 + 事件总线 | 格子状态变化时发射事件，解耦 UI/音效/AI 的响应 |
| 网格 + A* 寻路 | Pathfinder 读取 GridManager 的占用数据，返回路径格子序列 |
| 双网格 + 对象池 | 地形变更时增量更新 vertex grid 的位掩码和瓦片 sprite |

---

# 第五部分：维护代价

| 维度 | 方形网格 | 六边形网格 | 双网格 |
|---|---|---|---|

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。
