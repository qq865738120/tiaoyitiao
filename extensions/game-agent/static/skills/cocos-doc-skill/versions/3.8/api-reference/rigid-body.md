---
id: cocos-3.8-api-reference-rigid-body
version: "3.8"
category: api-reference
title: RigidBody
keywords:
  - RigidBody
  - 3D刚体
  - 刚体类型
  - 3D物理
  - 物理模拟
  - 施加力
  - DYNAMIC
  - STATIC
  - KINEMATIC
  - 刚体运动
related_docs:
  - api-reference/collider.md
  - api-reference/physics-system.md
  - recipes/raycast-3d.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - RigidBody
  - ERigidBodyType
  - Collider
  - PhysicsSystem
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 3D 刚体"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# RigidBody

## 用途

RigidBody 是 3D 物理刚体组件，为节点添加物理模拟能力。刚体接受力、冲量和扭矩，模拟三维空间中的真实运动、碰撞和反弹。按行为分为 DYNAMIC（动态）、STATIC（静态）、KINEMATIC（运动学）三种类型。

## 所属模块

```ts
import { RigidBody } from 'cc';
```

## 公开导出结论

- `RigidBody` 在 `cc` 模块以 `export class RigidBody extends Component` 公开导出。
- `ERigidBodyType` 枚举在 `cc` 模块公开导出：`DYNAMIC = 1`、`STATIC = 2`、`KINEMATIC = 4`。
- 可通过 `RigidBody.Type` 访问类型枚举别名：`RigidBody.Type.DYNAMIC` / `STATIC` / `KINEMATIC`。
- 关键公开属性：`type`（刚体类型）、`group`（分组）、`mass`（质量）、`allowSleep`（允许休眠）、`linearDamping`（线性阻尼）、`angularDamping`（角阻尼）、`useGravity`（使用重力）、`linearFactor`（线速度因子）、`angularFactor`（角速度因子）、`sleepThreshold`（休眠阈值）、`useCCD`（连续碰撞检测）、`isAwake`、`isSleepy`、`isSleeping`、`isStatic`、`isDynamic`、`isKinematic`。
- 关键公开方法：`applyForce(force, relativePoint?)`、`applyLocalForce(force, localPoint?)`、`applyImpulse(impulse, relativePoint?)`、`applyLocalImpulse(impulse, localPoint?)`、`applyTorque(torque)`、`applyLocalTorque(torque)`、`wakeUp()`、`sleep()`、`clearState()`、`clearForces()`、`clearVelocity()`、`getLinearVelocity(out)`、`setLinearVelocity(value)`、`getAngularVelocity(out)`、`setAngularVelocity(value)`、`getGroup()`、`setGroup(v)`、`addGroup(v)`、`removeGroup(v)`、`getMask()`、`setMask(v)`、`addMask(v)`、`removeMask(v)`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `type` | 刚体类型 | 切换物理行为 |
| `mass` | 质量 | 影响力作用效果 |
| `useGravity` | 是否受重力影响 | 默认 true |
| `linearDamping` | 线性阻尼 | 速度衰减（空气阻力） |
| `angularDamping` | 角阻尼 | 旋转速度衰减 |
| `linearFactor` | 各轴速度缩放因子（Vec3） | 限制某轴向移动 |
| `angularFactor` | 各轴旋转缩放因子（Vec3） | 限制某轴向旋转 |
| `allowSleep` | 是否允许休眠 | 性能优化 |
| `useCCD` | 是否启用连续碰撞检测 | 快速物体防穿透 |
| `isAwake` | 是否唤醒状态（只读） | 判断物理活动状态 |
| `group` | 碰撞分组 | 碰撞过滤 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `applyForce(force, relativePoint?)` | 在世界空间施加力 | 推动物体 |
| `applyLocalForce(force, localPoint?)` | 在本地空间施加力 | 局部方向推动 |
| `applyImpulse(impulse, relativePoint?)` | 在世界空间施加冲量 | 瞬间加速 |
| `applyTorque(torque)` | 施加扭矩 | 旋转物体 |
| `setLinearVelocity(value)` | 直接设置线速度 | 控制移动方向速度 |
| `getLinearVelocity(out)` | 获取当前线速度 | 读取速度 |
| `wakeUp()` | 唤醒刚体 | 唤醒休眠刚体 |
| `sleep()` | 休眠刚体 | 手动休眠 |
| `clearState()` | 清除力和速度 | 重置运动状态 |
| `clearForces()` | 清除力（保留速度） | 停止施加力 |
| `clearVelocity()` | 清除速度（保留力） | 紧急停止 |

## 刚体类型

| 类型 | 值 | 说明 | 运动方式 | 碰撞响应 |
|---|---|---|---|---|
| DYNAMIC | 1 | 完全物理模拟 | 受力/冲量/重力驱动 | 是 |
| STATIC | 2 | 静态（不可移动） | 不运动 | 是（对其他刚体） |
| KINEMATIC | 4 | 运动学（用户控制） | 通过 transform 或 setLinearVelocity | 是（质量无穷大） |

## 高频代码

### 创建并配置动态刚体

```ts
import { _decorator, Component, RigidBody, ERigidBodyType, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('RigidBodyExample')
export class RigidBodyExample extends Component {
  private _rb: RigidBody | null = null;

  start() {
    this._rb = this.node.getComponent(RigidBody);
    if (!this._rb) return;

    // 设置为动态刚体
    this._rb.type = ERigidBodyType.DYNAMIC;
    this._rb.mass = 2;
    this._rb.useGravity = true;

    // 施加一个向上的冲量
    this._rb.applyImpulse(new Vec3(0, 10, 0));
  }

  update(dt: number) {
    if (!this._rb) return;

    // 读取当前速度
    const vel = new Vec3();
    this._rb.getLinearVelocity(vel);
  }
}
```

### 运动学刚体控制移动

```ts
import { _decorator, Component, RigidBody, ERigidBodyType, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('KinematicExample')
export class KinematicExample extends Component {
  private _rb: RigidBody | null = null;
  private _speed = new Vec3(5, 0, 0);

  start() {
    this._rb = this.node.getComponent(RigidBody);
    if (!this._rb) return;

    // 运动学刚体不受重力/力影响
    this._rb.type = ERigidBodyType.KINEMATIC;
  }

  update(dt: number) {
    if (!this._rb) return;

    // 通过 setLinearVelocity 控制移动
    this._rb.setLinearVelocity(this._speed);
  }
}
```

### 力与冲量的使用

```ts
import { _decorator, Component, RigidBody, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('ForceExample')
export class ForceExample extends Component {
  private _rb: RigidBody | null = null;

  start() {
    this._rb = this.node.getComponent(RigidBody);
  }

  applyForce() {
    if (!this._rb) return;

    // 在质心施加持续向前力
    this._rb.applyForce(new Vec3(0, 0, -50));
  }

  applyJumpImpulse() {
    if (!this._rb) return;

    // 施加瞬时向上的冲量（跳跃）
    this._rb.applyImpulse(new Vec3(0, 5, 0));
  }

  applyRotationTorque() {
    if (!this._rb) return;

    // 施加绕 Y 轴的扭矩
    this._rb.applyTorque(new Vec3(0, 10, 0));
  }

  stop() {
    if (!this._rb) return;

    // 清除速度
    this._rb.clearVelocity();
  }
}
```

## RigidBody 与 RigidBody2D 的区别

| 维度 | RigidBody（3D） | RigidBody2D |
|---|---|---|
| 空间 | Vec3（x, y, z） | Vec2（x, y） |
| 类型值 | DYNAMIC=1 / STATIC=2 / KINEMATIC=4 | Static=0 / Kinematic=1 / Dynamic=2 / Animated=3 |
| 分组方式 | getGroup()/setGroup() 方法 | group 属性 |
| mask 操作 | addMask()/removeMask() 方法 | mask 属性 |
| enabledContactListener | 无此属性 | 必须设为 true |
| 连续碰撞检测 | useCCD 属性 | bullet 属性 |
| 力 API | applyForce/applyLocalForce/applyImpulse/applyLocalImpulse | applyForce/applyForceToCenter/applyLinearImpulse/applyLinearImpulseToCenter |
| 重力控制 | useGravity 属性 | gravityScale 属性 |
| 阻尼 | linearDamping / angularDamping | linearDamping / angularDamping |
| 轴锁定 | linearFactor / angularFactor（Vec3） | fixedRotation（布尔） |

## 常见错误

1. **缺少刚体组件**：添加了 Collider 但没有 RigidBody 时，碰撞体仍可产生碰撞回调，但 DYNAMIC 刚体需要 RigidBody 组件才能施加力和速度。
2. **STATIC 刚体力/速度 API 无效**：`type = STATIC` 时 `applyForce`、`setLinearVelocity` 等 API 不生效。需要改为 `DYNAMIC`。
3. **KINEMATIC 刚体不受力**：Kinematic 刚体质量无穷大，只能通过 transform 或 `setLinearVelocity` 移动。
4. **节点缩放导致物理异常**：节点缩放（scale）为 0 或负值时，物理外形计算异常，碰撞体可能消失或变形。确保碰撞体节点 scale 为正值。
5. **worldPosition 和碰撞体中心不一致**：碰撞体的 `center` 是相对于节点本地坐标的偏移。如果不设置 center，碰撞体中心默认在节点原点。
6. **useGravity 默认为 true**：部分场景需要关闭重力时，必须显式设置 `useGravity = false`。
7. **Group/Mask 不匹配**：两个刚体即使都是 DYNAMIC，如果 group/mask 没有交集，也不会产生碰撞回调。

## 关联任务

- [Collider API 卡片](collider.md)
- [PhysicsSystem API 卡片](physics-system.md)
- [3D 物理不触发排查](../troubleshooting/physics-3d-not-triggered.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 物理 - 3D 刚体
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
