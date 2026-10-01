---
id: cocos-3.8-api-reference-collider
version: "3.8"
category: api-reference
title: Collider
keywords:
  - Collider
  - 3D碰撞体
  - BoxCollider
  - SphereCollider
  - CapsuleCollider
  - MeshCollider
  - 碰撞检测
  - Trigger
  - 碰撞回调
  - Group
  - Mask
related_docs:
  - api-reference/rigid-body.md
  - api-reference/physics-system.md
  - recipes/raycast-3d.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - Collider
  - BoxCollider
  - SphereCollider
  - CapsuleCollider
  - MeshCollider
  - ITriggerEvent
  - ICollisionEvent
  - CollisionEventType
  - TriggerEventType
  - RigidBody
  - PhysicsSystem
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 碰撞体"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Collider

## 用途

Collider 是 3D 物理碰撞体的基类，定义碰撞体的形状和物理属性。碰撞体可以独立存在（静态碰撞），也可以与 RigidBody 配合使用产生完整的物理碰撞响应。Collider 支持两种模式：**碰撞（Collision）** 模式产生物理碰撞力和位置变化，**触发器（Trigger）** 模式仅检测重叠不产生物理力。

内置的碰撞体子类包括：`BoxCollider`、`SphereCollider`、`CapsuleCollider`、`CylinderCollider`、`ConeCollider`、`MeshCollider`、`TerrainCollider`、`SimplexCollider`、`PlaneCollider`。

## 所属模块

```ts
import { Collider, BoxCollider, SphereCollider, CapsuleCollider } from 'cc';
```

## 公开导出结论

- `Collider` 在 `cc` 模块以 `export class Collider extends Eventify(Component)` 公开导出。
- 核心公开属性：`attachedRigidBody`（关联的 RigidBody，可能为 null）、`sharedMaterial`（共享物理材质）、`material`（实例物理材质）、`isTrigger`（是否为触发器）、`center`（本地空间中心偏移）、`worldBounds`（世界包围盒）、`boundingSphere`（包围球）、`type`（EColliderType 枚举）。
- 碰撞体子类均有各自的形状参数：
  - `BoxCollider`：`size`（Vec3 尺寸）
  - `SphereCollider`：`radius`（半径）
  - `CapsuleCollider`：`radius`（半径）、`height`（高度）、`direction`（轴向）
  - `MeshCollider`：`mesh`（三角形网格资源）、`convex`（是否凸包）
- 事件注册方法（继承自 Eventify）：`on(type, callback, target)`、`off(type, callback, target)`、`once(type, callback, target)`、`removeAll(typeOrTarget)`。
- 事件类型字符串：
  - 触发事件：`"onTriggerEnter"`、`"onTriggerStay"`、`"onTriggerExit"`
  - 碰撞事件：`"onCollisionEnter"`、`"onCollisionStay"`、`"onCollisionExit"`
- 回调参数类型：`ITriggerEvent`（包含 `selfCollider`、`otherCollider`）、`ICollisionEvent`（包含 `selfCollider`、`otherCollider`、`contacts: IContactEquation[]`）。
- 分组方法：`getGroup()`、`setGroup(v)`、`addGroup(v)`、`removeGroup(v)`。
- 掩码方法：`getMask()`、`setMask(v)`、`addMask(v)`、`removeMask(v)`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `isTrigger` | 是否为触发器（只检测不产生物理力） | 区域检测 |
| `center` | 碰撞体相对于节点的本地中心偏移 | 调整碰撞区域位置 |
| `attachedRigidBody` | 绑定的 RigidBody 组件（可能为 null） | 获取关联刚体 |
| `sharedMaterial` | 共享物理材质 | 设置摩擦/弹性 |
| `material` | 实例物理材质（共享时会生成新实例） | 单独调整材质 |
| `worldBounds` | 世界空间包围盒（只读） | 碰撞体外围检测 |
| `type` | 碰撞体类型枚举 | 判断当前碰撞体子类类型 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `on("onCollisionEnter", callback)` | 注册碰撞进入回调 | 碰撞响应 |
| `on("onCollisionExit", callback)` | 注册碰撞离开回调 | 碰撞分离检测 |
| `on("onTriggerEnter", callback)` | 注册触发进入回调 | 区域检测 |
| `on("onTriggerExit", callback)` | 注册触发离开回调 | 离开区域检测 |
| `getGroup()` | 获取碰撞分组值 | 碰撞过滤 |
| `setGroup(v)` | 设置碰撞分组值 | 碰撞过滤 |
| `getMask()` | 获取掩码值 | 碰撞过滤 |
| `setMask(v)` | 设置掩码值 | 碰撞过滤 |
| `addMask(v)` | 增加掩码（加入待检测分组） | 碰撞过滤 |

## Collider、Trigger 与 Collision 的区别

| 模式 | isTrigger | 物理力 | 碰撞回调 | 适用场景 |
|---|---|---|---|---|
| **Collision（碰撞）** | false | 产生推力和反弹 | `onCollisionEnter/Stay/Exit` | 物理物体间真实碰撞 |
| **Trigger（触发器）** | true | 不产生任何物理力 | `onTriggerEnter/Stay/Exit` | 拾取区域、检测区域、伤害区域 |

**关键说明**：
- 使用 `isTrigger = true` 时，碰撞体变为传感器模式，物体可以穿透，但仍会触发 `onTrigger` 回调。
- Builtin 物理后端中 `isTrigger` 始终为 `true`（Builtin 后端只有触发器模式，无物理碰撞力）。
- 碰撞回调的结构体 `ICollisionEvent` 包含 `contacts` 数组，可获取每个碰撞点的位置、法线等信息。
- 触发回调的结构体 `ITriggerEvent` 仅提供碰撞双方引用，无接触点信息。

## Group 与 Mask

3D 碰撞体的 Group/Mask 与 RigidBody 的 Group/Mask 共同决定碰撞是否发生：

- **Group**：本碰撞体所属的分组（位掩码，2 的幂）。
- **Mask**：本碰撞体希望碰撞的分组位掩码。
- 碰撞条件：`(colliderGroup & otherMask) !== 0 && (otherGroup & colliderMask) !== 0`。
- 在编辑器的 **项目设置 -> 碰撞矩阵** 中进行可视化配置，最终转换为 Group/Mask 值。
- 代码中通过 `setGroup()` / `setMask()` / `addMask()` / `removeMask()` 运行时修改。

## Collider 与 Collider2D 的区别

| 维度 | Collider（3D） | Collider2D |
|---|---|---|
| 坐标空间 | Vec3（三维） | Vec2（二维） |
| 形状 | Box/Sphere/Capsule/Cylinder/Cone/Mesh/Terrain | Box/Circle/Polygon |
| 事件注册 | `on("onCollisionEnter", callback)` 字符串事件 | `on(Contact2DType.BEGIN_CONTACT, callback)` 枚举事件 |
| 碰撞类型 | CollisionEventType 字符串 | Contact2DType 枚举 |
| isTrigger | 布尔属性，Builtin 后端始终为 true | sensor 布尔属性 |
| RigidBody 依赖 | 碰撞体可以不依赖 RigidBody | 需要至少一方有 RigidBody2D |
| 注意与 Collider2D 区分 | 常用于 3D 场景 | 专用于 2D 场景 |

## 高频代码

### 碰撞回调注册

```ts
import { _decorator, Component, Collider, ICollisionEvent, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('CollisionExample')
export class CollisionExample extends Component {
  private _tempVec3 = new Vec3();

  start() {
    const collider = this.node.getComponent(Collider);
    if (!collider) return;

    // 注册碰撞事件（使用字符串事件类型）
    collider.on('onCollisionEnter', this.onCollisionEnter, this);
    collider.on('onCollisionExit', this.onCollisionExit, this);
  }

  onCollisionEnter(event: ICollisionEvent | null) {
    if (!event) return;
    const otherName = event.otherCollider.node.name;
    console.log(`与 ${otherName} 碰撞开始`);

    // 遍历碰撞点信息
    for (const contact of event.contacts) {
      contact.getWorldPointOnA(this._tempVec3);
      console.log(`碰撞点: (${this._tempVec3.x}, ${this._tempVec3.y}, ${this._tempVec3.z})`);
    }
  }

  onCollisionExit(event: ICollisionEvent | null) {
    if (!event) return;
    console.log(`与 ${event.otherCollider.node.name} 碰撞结束`);
  }

  onDestroy() {
    const collider = this.node.getComponent(Collider);
    if (collider) {
      collider.off('onCollisionEnter', this.onCollisionEnter, this);
      collider.off('onCollisionExit', this.onCollisionExit, this);
    }
  }
}
```

### 触发器（Trigger）区域检测

```ts
import { _decorator, Component, Collider, ITriggerEvent } from 'cc';

const { ccclass } = _decorator;

@ccclass('TriggerExample')
export class TriggerExample extends Component {
  start() {
    const collider = this.node.getComponent(Collider);
    if (!collider) return;

    // 设置为触发器
    collider.isTrigger = true;

    // 注册触发事件
    collider.on('onTriggerEnter', this.onTriggerEnter, this);
    collider.on('onTriggerExit', this.onTriggerExit, this);
  }

  onTriggerEnter(event: ITriggerEvent | null) {
    if (!event) return;
    console.log(`进入: ${event.otherCollider.node.name}`);
  }

  onTriggerExit(event: ITriggerEvent | null) {
    if (!event) return;
    console.log(`离开: ${event.otherCollider.node.name}`);
  }

  onDestroy() {
    const collider = this.node.getComponent(Collider);
    if (collider) {
      collider.off('onTriggerEnter', this.onTriggerEnter, this);
      collider.off('onTriggerExit', this.onTriggerExit, this);
    }
  }
}
```

### 设置 BoxCollider 并调整分组

```ts
import { _decorator, Component, BoxCollider } from 'cc';

const { ccclass } = _decorator;

@ccclass('BoxColliderConfig')
export class BoxColliderConfig extends Component {
  start() {
    const collider = this.node.getComponent(BoxCollider);
    if (!collider) return;

    // 调整碰撞体尺寸和中心
    collider.size.set(2, 1, 2);
    collider.center.set(0, 0.5, 0);

    // 设置分组为 Group 1（二进制第 0 位）
    collider.setGroup(1 << 0);

    // 只检测 Group 1 和 Group 2
    collider.setMask((1 << 0) | (1 << 1));
  }
}
```

## 常见错误

1. **刚体/碰撞体缺失**：如果 RigidBody 类型为 DYNAMIC 但没有 Collider，物理引擎不会处理该节点。同样，Collider 也需要形状参数正确设置。
2. **碰撞矩阵不通**：两个碰撞体的 Group/Mask 没有交集时，即使物理重叠也不会触发碰撞/触发回调。检查项目设置中的碰撞矩阵和代码中的 Group/Mask 配置。
3. **isTrigger 设置错误**：需要物理碰撞响应（推力和反弹）时应设置 `isTrigger = false`；只需要检测重叠时设置 `isTrigger = true`。混淆两者会导致行为不符合预期。
4. **事件字符串拼写错误**：3D Collider 使用字符串事件名（如 `"onCollisionEnter"`），拼写错误不会报错但事件不触发。
5. **忘记清理事件监听**：`onDestroy` 中必须调用 `off` 移除注册的碰撞回调，否则节点销毁后残留回调可能访问已销毁组件。
6. **MeshCollider convex 设置不当**：非凸包碰撞体（`convex = false`）只支持触发检测；需要物理碰撞响应时需设置 `convex = true`。
7. **误用 Collider2D 代替 Collider**：3D 场景必须使用 3D Collider（`cc.Collider`），混用 2D Collider（`Collider2D`）不会产生 3D 碰撞。

## 关联任务

- [RigidBody API 卡片](rigid-body.md)
- [PhysicsSystem API 卡片](physics-system.md)
- [3D Raycast 任务](../recipes/raycast-3d.md)
- [3D 物理不触发排查](../troubleshooting/physics-3d-not-triggered.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 物理 - 碰撞体
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
