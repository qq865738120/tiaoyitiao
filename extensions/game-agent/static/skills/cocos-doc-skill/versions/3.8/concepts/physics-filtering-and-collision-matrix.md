---
id: cocos-3.8-concepts-physics-filtering-and-collision-matrix
version: "3.8"
category: concepts
title: 物理过滤与碰撞矩阵
keywords:
  - 碰撞矩阵
  - collisionMatrix
  - 碰撞过滤
  - 碰撞分组
  - 位掩码
  - group
  - mask
  - sensor
  - 碰撞响应
  - 碰撞回调
  - 刚体类型
  - Static
  - Dynamic
  - Kinematic
  - 物理后端
related_docs:
  - api-reference/physics-system.md
  - api-reference/collider-2d.md
  - api-reference/rigid-body-2d.md
  - api-reference/collider.md
  - api-reference/rigid-body.md
  - api-reference/physics-system.md
  - recipes/detect-collision-2d.md
  - troubleshooting/collision-not-triggered.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - Collider2D
  - RigidBody2D
  - Collider
  - RigidBody
  - PhysicsSystem2D
  - PhysicsSystem
  - ICollisionMatrix
  - PhysicsGroup
  - ERigidBodyType
  - ERigidBody2DType
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 碰撞矩阵、分组掩码"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "collisionMatrix 由编辑器生成，代码侧读写 ICollisionMatrix 字典"
    - "2D 和 3D 共用同一份 collisionMatrix 项目配置"
status: draft
updated: 2026-06-18
---

# 物理过滤与碰撞矩阵

## 用途

解释 Cocos Creator 3.8 中物理碰撞过滤机制（碰撞矩阵、group、mask、sensor）的工作原理，说明碰撞响应与碰撞回调的区别，以及不同刚体类型和物理后端的差异。

---

## 常见问题

### 碰撞不触发？

排查清单：

1. **group/mask 不匹配**：确认 `(A.group & B.mask) !== 0 && (B.group & A.mask) !== 0`
2. **碰撞矩阵未配置**：在项目设置中检查对应分组是否勾选了碰撞
3. **代码覆盖了配置**：代码中调用 `setGroup()` / `setMask()` 会覆盖编辑器配置
4. **回调未注册**：2D 需 `enabledContactListener = true`，3D 需正确注册事件监听
5. **sensor/isTrigger 标记**：sensor 模式下只触发回调不产生碰撞力

### 碰撞矩阵改了不生效？

- 检查代码中是否通过 `setGroup()` / `setMask()` 覆盖了编辑器配置
- 2D 物理中 Collider2D 的 `group` 是直接属性，修改后立即生效
- 3D 物理需调用 `collider.setGroup()` / `collider.setMask()` 设置
- collisionMatrix 在项目设置中修改后，需要保存项目并重新运行才能生效

### 2D vs 3D 分组机制差异

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。
