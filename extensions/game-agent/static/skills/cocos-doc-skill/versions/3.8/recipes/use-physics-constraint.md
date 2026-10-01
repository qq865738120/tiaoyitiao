---
id: cocos-3.8-recipes-use-physics-constraint
version: "3.8"
category: recipes
title: 使用物理约束
keywords:
  - 物理约束
  - HingeConstraint
  - PointToPointConstraint
  - 铰链约束
  - 绳索连接
  - 刚体约束
  - 物理关节
  - 门铰链
  - 摆锤
  - 马达
  - pivotA
  - pivotB
  - axis
  - 连接体
related_docs:
  - api-reference/rigid-body.md
  - api-reference/collider.md
  - api-reference/character-controller.md
  - api-reference/physics-system.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - HingeConstraint
  - PointToPointConstraint
  - RigidBody
  - Collider
  - PhysicsSystem
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 约束"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "约束行为跨物理引擎差异较大，需在不同平台充分测试"
    - "约束需要刚体组件，节点缺少刚体时，添加约束会自动为其添加 RigidBody"
    - "connectedBody 为 null 表示连接到世界原点（静态）"
    - "Bullet / PhysX 完全支持，Cannon.js 实验性支持，Builtin 不支持"
status: needs-review
updated: 2026-06-18
---

# 使用物理约束

> **此文档标记为 needs-review**：约束行为跨物理引擎差异较大（Bullet/PhysX 完全支持，Cannon.js 实验性，Builtin 不支持），需在不同平台充分测试。

## 验证方式

- [ ] 铰链约束：门只能围绕指定轴旋转，角度限制范围内无法继续旋转。
- [ ] 马达驱动：马达启用后门自动旋转到限制位置。
- [ ] 绳索连接：两个物体被"拴"在一起，移动一个另一个被拉动。
- [ ] 约束不产生非物理的抖动或扭曲。
- [ ] 切换物理后端测试（Bullet / PhysX）确认效果一致。
