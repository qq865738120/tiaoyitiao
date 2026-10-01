---
id: cocos-3.8-api-reference-rigid-body-2d
version: "3.8"
category: api-reference
title: RigidBody2D
keywords:
  - RigidBody2D
  - 刚体
  - 2D物理
  - 刚体类型
  - 物理模拟
  - 施加力
related_docs:
  - api-reference/collider-2d.md
  - recipes/detect-collision-2d.md
  - troubleshooting/collision-not-triggered.md
related_api:
  - RigidBody2D
  - ERigidBody2DType
  - PhysicsSystem2D
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 2D - 刚体"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# RigidBody2D

## 用途

RigidBody2D 组件为节点添加 2D 物理模拟能力。刚体接受力、冲量和扭矩，模拟真实世界的运动、碰撞和反弹。按行为分为 Static（静态）、Kinematic（运动学）、Dynamic（动态）和 Animated（动画化）四种类型。

## 所属模块

```ts
import { RigidBody2D } from 'cc';
```

## 公开导出结论

- `RigidBody2D` 在 `cc` 模块以 `export class RigidBody2D extends Component` 公开导出。
- `ERigidBody2DType` 枚举在 `cc` 模块公开导出：`Static = 0`、`Kinematic = 1`、`Dynamic = 2`、`Animated = 3`。
- 关键公开属性：`type`（刚体类型）、`group`（分组）、`gravityScale`（重力缩放）、`linearDamping`（线性阻尼）、`angularDamping`（角阻尼）、`linearVelocity`（线速度）、`angularVelocity`（角速度）、`fixedRotation`（固定旋转）、`bullet`（连续碰撞检测）、`allowSleep`（允许休眠）、`awakeOnLoad`（初始化时唤醒）、`enabledContactListener`（启用碰撞回调）。
- 关键公开方法：`applyForce(force, point, wake)`、`applyForceToCenter(force, wake)`、`applyTorque(torque, wake)`、`applyLinearImpulse(impulse, point, wake)`、`applyLinearImpulseToCenter(impulse, wake)`、`applyAngularImpulse(impulse, wake)`、`getMass()`、`getInertia()`、`wakeUp()`、`sleep()`、`isAwake()`，以及 Box2D 坐标/速度转换方法。
- `PhysicsSystem2D` 在 `cc` 模块公开导出，通过 `PhysicsSystem2D.instance` 访问全局物理系统，可设置 `gravity`（重力，默认 (0, -10)）。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `type` | 刚体类型（Static/Kinematic/Dynamic/Animated） | 切换物理行为 |
| `gravityScale` | 重力缩放倍数 | 调整受重力影响程度 |
| `linearVelocity` | 线速度（Vec2） | 获取/设置速度 |
| `angularVelocity` | 角速度（弧度/秒） | 旋转速度 |
| `fixedRotation` | 是否固定旋转 | 防止翻转 |
| `bullet` | 是否启用连续碰撞检测 | 快速移动物体防穿透 |
| `group` | 碰撞分组 | 碰撞过滤 |
| `allowSleep` | 是否允许休眠 | 性能优化 |
| `linearDamping` | 线性阻尼 | 减速效果 |
| `angularDamping` | 角阻尼 | 旋转减速 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `applyForceToCenter(force, wake)` | 在质心施加力 | 推动物体 |
| `applyLinearImpulseToCenter(impulse, wake)` | 在质心施加冲量 | 瞬间加速 |
| `applyTorque(torque, wake)` | 施加扭矩 | 旋转物体 |
| `getMass()` | 获取质量 | 计算动量 |
| `wakeUp()` / `sleep()` | 唤醒/休眠刚体 | 控制物理模拟 |

## 高频代码

### 设置刚体并施加力

```ts
import { _decorator, Component, RigidBody2D, ERigidBody2DType, Vec2 } from 'cc';

const { ccclass } = _decorator;

@ccclass('RigidBodyExample')
export class RigidBodyExample extends Component {
  start() {
    const rb = this.node.getComponent(RigidBody2D);
    if (!rb) return;

    // 设置为动态刚体
    rb.type = ERigidBody2DType.Dynamic;
    rb.gravityScale = 1;

    // 施加一个向右的力
    rb.applyForceToCenter(new Vec2(100, 0), true);
  }
}
```

### 碰撞回调配置

```ts
import { _decorator, Component, RigidBody2D, Collider2D, Contact2DType } from 'cc';

const { ccclass } = _decorator;

@ccclass('CollisionSetupExample')
export class CollisionSetupExample extends Component {
  start() {
    const rb = this.node.getComponent(RigidBody2D);
    if (!rb) return;

    // 必须启用碰撞监听
    rb.enabledContactListener = true;

    const collider = this.node.getComponent(Collider2D);
    if (!collider) return;

    collider.on(Contact2DType.BEGIN_CONTACT, (self, other) => {
      console.log('碰撞发生');
    });
  }
}
```

## 常见错误

1. **enabledContactListener 默认为 false**：碰撞回调不触发的首要原因，必须显式设为 `true`。
2. **Static 刚体不受力和速度影响**：`type = Static` 时 `applyForce`、`linearVelocity` 等 API 无效。需改为 `Dynamic` 才能响应物理模拟。
3. **Kinematic 刚体质量无穷大**：Kinematic 刚体不受力影响，只能通过设置 `linearVelocity` 移动，或通过 Animation 组件驱动。
4. **Dynamic 刚体受重力影响但 gravityScale 未设置**：默认 `gravityScale = 0`，需要设为 1 或更大才会受重力影响。
5. **分组掩码未配置**：两个刚体的分组不匹配时不会产生碰撞。检查 `group` 属性与碰撞矩阵配置。

## 关联任务

- [检测 2D 碰撞](../recipes/detect-collision-2d.md)
- [碰撞未触发排查](../troubleshooting/collision-not-triggered.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 物理 2D - 刚体
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
