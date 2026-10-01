---
id: cocos-3.8-recipes-detect-collision-2d
version: "3.8"
category: recipes
title: 检测 2D 碰撞
keywords:
  - 2D碰撞
  - 碰撞检测
  - Collider2D
  - RigidBody2D
  - 碰撞回调
  - 碰撞监听
  - Contact2DType
  - 碰撞不触发
  - 触发器
related_docs:
  - api-reference/collider-2d.md
  - api-reference/rigid-body-2d.md
  - troubleshooting/collision-not-triggered.md
  - concepts/physics-filtering-and-collision-matrix.md
related_api:
  - Collider2D
  - RigidBody2D
  - Contact2DType
  - BoxCollider2D
  - CircleCollider2D
  - PhysicsSystem2D
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 2D - 碰撞回调、碰撞体、刚体"
  verified-against: []
  supplement:
    - "工程经验：碰撞回调不触发的首要原因是 enabledContactListener 未开启；分组掩码配置也需要核对"
status: draft
updated: 2026-06-17
---

# 检测 2D 碰撞

## 目标

在 Cocos Creator 3.8 中检测 2D 碰撞事件，编写碰撞回调逻辑（如角色碰到敌人扣血、子弹击中目标销毁）。

## 推荐做法

1. 碰撞检测需要同时满足：节点上有 **Collider2D**（碰撞体）+ 至少一方有 **RigidBody2D**（刚体）；
2. 碰撞回调通过 Collider2D 的事件系统注册：`collider.on(Contact2DType.BEGIN_CONTACT, callback)`；
3. **Box2D 物理引擎**必须将 RigidBody2D 的 `enabledContactListener` 设为 `true`，否则回调不触发；
4. 如果只需要检测重叠而不产生物理碰撞（如道具拾取区域），将 Collider2D 的 `sensor` 设为 `true`；
5. 碰撞分组通过 `group` 属性和项目设置中的碰撞矩阵控制。详见 [物理过滤与碰撞矩阵](../concepts/physics-filtering-and-collision-matrix.md)。

## 示例代码

### 基本碰撞检测

```ts
import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';

const { ccclass } = _decorator;

@ccclass('CollisionDetector')
export class CollisionDetector extends Component {
  start() {
    const collider = this.node.getComponent(Collider2D);
    if (!collider) return;

    // 注册碰撞回调
    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    console.log('碰撞开始:', otherCollider.node.name);

    // 根据对方节点名或组件判断碰撞对象
    if (otherCollider.node.name === 'Enemy') {
      this.onHitEnemy();
    }
  }

  onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    console.log('碰撞结束:', otherCollider.node.name);
  }

  onHitEnemy() {
    console.log('击中敌人');
  }

  onDestroy() {
    const collider = this.node.getComponent(Collider2D);
    if (collider) {
      collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }
}
```

### 传感器（Trigger）拾取道具

```ts
import { _decorator, Component, Collider2D, Contact2DType } from 'cc';

const { ccclass } = _decorator;

@ccclass('PickupTrigger')
export class PickupTrigger extends Component {
  start() {
    const collider = this.node.getComponent(Collider2D);
    if (!collider) return;

    // 传感器模式：只触发回调，不产生物理碰撞
    collider.sensor = true;

    collider.on(Contact2DType.BEGIN_CONTACT, (self, other) => {
      // 判断是否是玩家
      if (other.node.name === 'Player') {
        this.collectPickup();
      }
    });
  }

  collectPickup() {
    console.log('道具被拾取');
    this.node.destroy();
  }
}
```

### 动态刚体获取碰撞信息

```ts
import { _decorator, Component, RigidBody2D, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';

const { ccclass } = _decorator;

@ccclass('PhysicsContactExample')
export class PhysicsContactExample extends Component {
  start() {
    const collider = this.node.getComponent(Collider2D);
    if (!collider) return;

    collider.on(Contact2DType.BEGIN_CONTACT, (self, other, contact) => {
      if (!contact) return;

      // 获取碰撞法向量和碰撞点
      const worldManifold = contact.getWorldManifold();
      const normal = worldManifold.normal;
      const points = worldManifold.points;

      if (points.length > 0) {
        console.log(`碰撞点: (${points[0].x}, ${points[0].y})`);
      }
    });
  }
}
```

## 操作步骤

### 配置碰撞体（编辑器）

1. 为需要碰撞的节点添加 Collider2D 组件（BoxCollider2D / CircleCollider2D / PolygonCollider2D）；
2. 为需要物理模拟的节点添加 RigidBody2D 组件，并设置 `type`（Static/Dynamic/Kinematic）；
3. 在 RigidBody2D 上**勾选 EnabledContactListener**（Box2D 引擎必须）；
4. 如需过滤碰撞，配置 Collider2D 和 RigidBody2D 的 `group` 属性（2D 物理的 mask 由碰撞矩阵全局控制）。

### 编写碰撞脚本

1. 在脚本中通过 `getComponent(Collider2D)` 获取碰撞体；
2. 使用 `collider.on(Contact2DType.BEGIN_CONTACT, callback)` 注册碰撞回调；
3. 回调参数包括 `selfCollider`、`otherCollider`、`contact`（碰撞信息）；
4. 在 `onDestroy` 中移除事件监听：`collider.off(...)`。

### 设置传感器模式

1. 将 Collider2D 的 `sensor` 属性设为 `true`；
2. 传感器碰撞体只触发回调不产生物理碰撞力/位移；
3. 适用于道具拾取区域、检测区域等。

## 验证方式

- 两个有碰撞体和刚体的节点靠近时触发碰撞回调；
- `BEGIN_CONTACT` 在碰撞开始时触发一次，`END_CONTACT` 在分离时触发一次；
- 传感器模式下重叠触发回调但不产生物理位移；
- 分组不匹配的节点之间不发生碰撞。

## 常见错误

1. **enabledContactListener 未开启**：这是碰撞回调不触发的最常见原因。在 RigidBody2D 属性中必须勾选 `Enabled Contact Listener`。
2. **只有 Collider2D 没有 RigidBody2D**：两个碰撞体至少一个所在的节点需要 RigidBody2D，否则物理引擎不会处理碰撞。
3. **刚体类型设置错误**：Static 刚体不参与物理模拟，不会受重力/力影响。如果需要碰撞检测但不需要物理模拟，可以使用 `sensor` 模式。
4. **分组掩码未配置**：两个碰撞体的 `group` 在碰撞矩阵中不匹配。检查 **项目设置 → 物理 → 碰撞矩阵**。注意 2D 物理中 `mask` 由碰撞矩阵全局控制，碰撞体组件上只暴露 `group` 属性。详见 [物理过滤与碰撞矩阵](../concepts/physics-filtering-and-collision-matrix.md)。
5. **碰撞回调在 onDestroy 中未清理**：节点销毁后回调可能仍触发，导致访问空引用。
6. **Static 刚体力/速度 API 无效**：`type = Static` 时 `applyForce`、`linearVelocity` 等 API 不生效。改用 `Dynamic`。
7. **Kinematic 刚体不受力但可回调**：Kinematic 刚体质量无穷大，不受力影响，只能通过 `linearVelocity` 或 Animation 驱动，但碰撞回调正常触发。

## 相关文档

- [Collider2D API 卡片](../api-reference/collider-2d.md)
- [RigidBody2D API 卡片](../api-reference/rigid-body-2d.md)
- [碰撞不触发排查](../troubleshooting/collision-not-triggered.md)
- [物理过滤与碰撞矩阵](../concepts/physics-filtering-and-collision-matrix.md)
