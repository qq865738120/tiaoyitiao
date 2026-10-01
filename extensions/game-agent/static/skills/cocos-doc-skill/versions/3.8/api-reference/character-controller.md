---
id: cocos-3.8-api-reference-character-controller
version: "3.8"
category: api-reference
title: CharacterController
keywords:
  - CharacterController
  - BoxCharacterController
  - CapsuleCharacterController
  - 角色控制器
  - 3D角色
  - 碰撞检测
  - 物理
  - 角色移动
  - sweep算法
  - isGrounded
  - stepOffset
  - slopeLimit
related_docs:
  - api-reference/rigid-body.md
  - api-reference/collider.md
  - api-reference/physics-system.md
  - recipes/use-physics-constraint.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - CharacterController
  - BoxCharacterController
  - CapsuleCharacterController
  - CharacterTriggerEventType
  - CharacterCollisionEventType
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 角色控制器"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "仅 Bullet 和 PhysX 后端支持 CharacterController。Cannon.js 和 Builtin 后端下所有方法为空操作。"
    - "同节点混用 RigidBody 会产生不可预知的错误"
    - "抖音小程序 wasm 不支持角色控制器"
status: needs-review
updated: 2026-06-18
---

# CharacterController

> **此文档标记为 needs-review**：CharacterController 仅 Bullet/PhysX 后端支持，Cannon.js/Builtin 下为空操作。各平台（含抖音小程序 wasm）支持情况需结合项目实际物理后端确认。

## 用途

CharacterController 是 Cocos Creator 3.8 提供的 3D 角色控制器组件。它基于 sweep 算法驱动角色移动，遇到障碍物时自动滑行而非弹回。适用于第三人称/第一人称角色的移动控制。

**关键特性**：
- 支持盒体（BoxCharacterController）和胶囊体（CapsuleCharacterController）两种碰撞外形。
- 通过 `move()` 方法驱动，引擎内部执行 sweep 碰撞检测。
- 不受力（Force）影响——角色控制器不响应重力或物理碰撞力。
- 提供自动爬台阶（stepOffset）和爬坡限制（slopeLimit）功能。
- 支持碰撞和触发事件回调。

## 公开导出结论

- `CharacterController` 在 `cc` 模块以 `export class CharacterController extends Component` 公开导出。
- `BoxCharacterController extends CharacterController` 在 `cc` 模块以 `export class BoxCharacterController extends CharacterController` 公开导出。
- `CapsuleCharacterController extends CharacterController` 在 `cc` 模块以 `export class CapsuleCharacterController extends CharacterController` 公开导出。
- 关联事件类型也在 `cc` 模块公开导出：
  - `CharacterTriggerEventType`：触发事件类型枚举
  - `CharacterCollisionEventType`：碰撞事件类型枚举

## 常用属性

| 属性 | 类型 | 说明 | 高频场景 |
|---|---|---|---|
| `group` | `number` | 物理分组 | 碰撞过滤 |
| `stepOffset` | `number` | 最大自动爬台阶高度（单位：米） | 默认 0.1 |
| `slopeLimit` | `number` | 最大爬坡角度（度） | 默认 45 度 |
| `skinWidth` | `number` | 皮肤宽度。防止碰撞体穿透和抖动 | 默认 0.01 |
| `center` | `Vec3` | 控制器在节点本地坐标中的中心点偏移 | 调整控制器位置 |
| `velocity` | `Vec3`（只读） | 角色当前速度。仅在 `move()` 后更新 | 读取移动速度 |
| `isGrounded` | `boolean`（只读） | 是否在地面上 | 检测落地/跳跃判断 |

### BoxCharacterController 额外属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `halfHeight` | `number` | 盒体高度的一半 |
| `halfSideExtent` | `number` | 盒体侧边宽度的一半（X 轴方向） |
| `halfForwardExtent` | `number` | 盒体前向深度的一半（Z 轴方向） |

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `move(movement: Vec3)` | 移动角色。传入位移向量，引擎执行 sweep 检测并调整最终位置。返回值表示碰撞标志。 | 角色移动 |
| `on(CharacterTriggerEventType, callback)` | 注册角色触发器事件回调（进入/停留/退出触发区域） | 触发区域检测 |
| `on(CharacterCollisionEventType, callback)` | 注册角色碰撞事件回调（碰撞开始/持续/结束） | 碰撞检测 |

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 物理 - 角色控制器
- 已交叉验证：cc-engine 3.8 公开类型声明
