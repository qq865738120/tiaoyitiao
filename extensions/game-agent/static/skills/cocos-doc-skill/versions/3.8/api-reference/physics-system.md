---
id: cocos-3.8-api-reference-physics-system
version: "3.8"
category: api-reference
title: PhysicsSystem
keywords:
  - PhysicsSystem
  - 3D物理系统
  - 3D物理
  - raycast
  - 射线检测
  - sweep
  - 碰撞查询
  - 物理分组
  - mask
  - 物理后端
related_docs:
  - api-reference/rigid-body.md
  - api-reference/collider.md
  - recipes/raycast-3d.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - PhysicsSystem
  - PhysicsRayResult
  - Collider
  - RigidBody
  - geometry.Ray
  - ERigidBodyType
source:
  official: "Cocos Creator 3.8 官方文档 - 3D 物理 - 物理系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# PhysicsSystem

## 用途

PhysicsSystem 是 Cocos Creator 3.8 的 3D 物理系统，管理物理世界的重力、碰撞检测、射线检测和扫描检测。它是整个 3D 物理模拟的核心调度器。

与 PhysicsSystem2D 不同，PhysicsSystem 处理的是三维空间中的物理模拟 —— 碰撞体使用 Vec3 位置、射线检测返回 3D 命中结果、支持 BoxCast / SphereCast / CapsuleCast 等扫描碰撞查询。

## 所属模块

```ts
import { PhysicsSystem } from 'cc';
```

## 公开导出结论

- `PhysicsSystem` 在 `cc` 模块以 `export class PhysicsSystem extends System` 公开导出。
- 通过 `PhysicsSystem.instance` 单例访问全局物理系统。
- 物理后端编译常量（编译期、只读）：`PhysicsSystem.PHYSICS_NONE`、`PHYSICS_BUILTIN`、`PHYSICS_CANNON`、`PHYSICS_BULLET`、`PHYSICS_PHYSX`。
- 核心属性：`enable`（启用状态）、`gravity`（重力，Vec3）、`allowSleep`（允许休眠）、`fixedTimeStep`（固定步长时间）、`maxSubSteps`（最大子步数）、`autoSimulation`（是否自动模拟）、`defaultMaterial`（默认物理材质）、`debugDrawFlags`（调试绘制标志）、`minVolumeSize`（碰撞体最小尺寸）。
- 核心方法：`raycast(worldRay, mask, maxDistance, queryTrigger)`、`raycastClosest(worldRay, mask, maxDistance, queryTrigger)`、`sweepBox` / `sweepSphere` / `sweepCapsule` 及其最近命中版本、`step(fixedTimeStep, deltaTime, maxSubSteps)`、`emitEvents()`、`syncSceneToPhysics()`。
- 查询结果：`raycastResults`（PhysicsRayResult[]）、`raycastClosestResult`（PhysicsRayResult）、`sweepCastResults` / `sweepCastClosestResult`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `enable` | 物理系统启用/暂停 | 控制物理模拟开关 |
| `gravity` | 重力（默认 (0, -10, 0)） | 设置 3D 场景重力 |
| `allowSleep` | 是否允许刚体自动休眠 | 性能优化 |
| `autoSimulation` | 是否自动模拟每帧物理 | 手动步进时关闭 |
| `fixedTimeStep` | 每步模拟耗时（秒） | 物理精度调优 |
| `maxSubSteps` | 每帧最大子步数 | 防止物理崩溃 |
| `debugDrawFlags` | 调试绘制标志 | 可视化碰撞边界 |
| `raycastResults` | raycast 检测结果数组（只读） | 读取全部命中 |
| `raycastClosestResult` | raycastClosest 最近结果（只读） | 读取最近命中 |
| `defaultMaterial` | 全局默认物理材质 | 修改默认摩擦弹性 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `raycast(worldRay, mask?, maxDistance?, queryTrigger?)` | 全部命中检测，结果在 `raycastResults` | 射线检测遍历 |
| `raycastClosest(worldRay, mask?, maxDistance?, queryTrigger?)` | 最近命中检测，结果在 `raycastClosestResult` | 拾取/瞄准 |
| `sweepBox(worldRay, halfExtent, orientation, mask?, maxDistance?, queryTrigger?)` | 盒体扫描全部命中 | 碰撞体测试 |
| `sweepSphereClosest(worldRay, radius, mask?, maxDistance?, queryTrigger?)` | 球体扫描最近命中 | 角色碰撞预估 |
| `sweepCapsule(worldRay, radius, height, orientation, mask?, maxDistance?, queryTrigger?)` | 胶囊体扫描全部命中 | 角色碰撞检测 |
| `emitEvents()` | 触发碰撞和触发事件 | 手动步进后调用 |
| `syncSceneToPhysics()` | 同步场景变化到物理世界 | 手动步进前调用 |

## 物理分组与 Mask 机制

3D 物理的 Group/Mask 用于过滤碰撞检测：

- **Group**：刚体或碰撞体所属的分组，值为 2 的幂（同 2D 物理，32 位整数）。
- **Mask**：声明哪些本实例与哪些 Group 发生碰撞（位掩码）。
- 两个物体的 `group & mask` 结果非零时，才会产生碰撞或 raycast 命中。
- 编辑器中的碰撞矩阵配置最终会映射到 Group/Mask。

RigidBody 和 Collider 都拥有独立的 Group/Mask：
- RigidBody：通过 `getGroup()` / `setGroup()`、`getMask()` / `setMask()` 以及 `addMask()` / `removeMask()` 操作。
- Collider：同一套 API。

**Raycast 的 mask 参数**：`raycast(worldRay, mask)` 的 mask 参数与刚体和碰撞体的 mask 联合使用。只有 `(colliderGroup & raycastMask) !== 0` 且 `(raycastGroup & colliderMask) !== 0` 时才会命中。

## 查询结果生命周期

- `raycastResults` / `raycastClosestResult` 的内容在每次 `raycast` 调用后被覆盖。
- `sweepCastResults` / `sweepCastClosestResult` 的内容在每次 sweep 调用后被覆盖。
- 多个 raycast 之间调用前，需**将结果立即复制**，否则前一次结果会被后一次覆盖。
- 结果对象（`PhysicsRayResult`）的 `hitPoint`、`distance`、`collider`、`hitNormal` 为只读属性。

## 高频代码

### 基础射线检测

```ts
import { _decorator, Component, PhysicsSystem, geometry, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('RaycastExample')
export class RaycastExample extends Component {
  start() {
    // 创建从 (0, 0, 0) 沿 (0, 0, -1) 方向的射线
    const ray = new geometry.Ray(0, 0, 0, 0, 0, -1);

    // 执行全部命中检测（mask 默认为 0xffffffff）
    if (PhysicsSystem.instance.raycast(ray)) {
      const results = PhysicsSystem.instance.raycastResults;
      for (let i = 0; i < results.length; i++) {
        const hit = results[i];
        console.log(`击中: ${hit.collider.node.name}, 距离: ${hit.distance}`);
      }
    }
  }
}
```

### 最近命中 + mask 过滤

```ts
import { _decorator, Component, PhysicsSystem, geometry, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('RaycastClosest')
export class RaycastClosest extends Component {
  private _ray = new geometry.Ray();

  start() {
    // 定义射线方向并设置 mask
    Vec3.set(this._ray.o, 0, 1, 0);
    Vec3.set(this._ray.d, 0, -1, 0);

    // mask = 1 << 0（检测 Group 0 的物体）
    const mask = 0xffffffff;

    if (PhysicsSystem.instance.raycastClosest(this._ray, mask)) {
      const hit = PhysicsSystem.instance.raycastClosestResult;
      console.log(`最近击中: ${hit.collider.node.name}`);
      console.log(`命中点: (${hit.hitPoint.x}, ${hit.hitPoint.y}, ${hit.hitPoint.z})`);
      console.log(`命中法线: (${hit.hitNormal.x}, ${hit.hitNormal.y}, ${hit.hitNormal.z})`);
    }
  }
}
```

### 物理系统状态控制

```ts
import { _decorator, Component, PhysicsSystem, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('PhysicsControl')
export class PhysicsControl extends Component {
  pausePhysics() {
    PhysicsSystem.instance.enable = false;
  }

  resumePhysics() {
    PhysicsSystem.instance.enable = true;
  }

  setGravity(x: number, y: number, z: number) {
    PhysicsSystem.instance.gravity = new Vec3(x, y, z);
  }
}
```

## 3D vs 2D 物理系统区别

| 维度 | PhysicsSystem（3D） | PhysicsSystem2D |
|---|---|---|
| 空间维度 | Vec3（3D） | Vec2（2D） |
| 碰撞体基类 | Collider | Collider2D |
| 刚体基类 | RigidBody | RigidBody2D |
| 射线检测 | `raycast(geometry.Ray, ...)` | 无（2D 通过碰撞体直接检测） |
| 扫描检测 | sweepBox / sweepSphere / sweepCapsule | 无 |
| 事件类型 | `onTriggerEnter` / `onCollisionEnter`（字符串事件类型） | `Contact2DType.BEGIN_CONTACT` 枚举 |
| 调试绘制 | `debugDrawFlags` 属性 | `debugDraw` 属性 |
| 重力类型 | Vec3 | Vec2 |
| 后端 | Builtin / Cannon.js / Bullet / PhysX | Box2D / Builtin |
| 无需 RigidBody | 3D 碰撞体可以不依赖 RigidBody（静态碰撞） | 2D 场景需要 RigidBody2D 参与碰撞 |
| enabledContactListener | 3D 无此属性（回调在 Collider 上注册即可） | 2D 必须在 RigidBody2D 上开启 |

## 常见错误

1. **误用 PhysicsSystem2D 代替 PhysicsSystem**：两者互不兼容，3D 物理组件（Collider / RigidBody）必须在 PhysicsSystem 管理下工作。
2. **raycast 后未及时读取结果**：多次调用 `raycast` 会覆盖 `raycastResults`，每次 raycast 后必须立即处理或复制结果。
3. **mask 参数设置为 0 导致无命中**：`raycast` 的 mask 默认为 `0xffffffff`；显式设置 0 将命中任何物体。
4. **maxDistance 传入 Infinity 或 Number.MAX_VALUE**：引擎限制不能传入无穷大，否则行为未定义。
5. **未启用物理系统**：`PhysicsSystem.instance.enable = false` 时所有物理模拟和检测都不会进行。
6. **未调用 emitEvents**：手动步进模式下，调用 `step()` 后需要手动调用 `emitEvents()` 触发碰撞回调。

## 关联任务

- [RigidBody API 卡片](rigid-body.md)
- [Collider API 卡片](collider.md)
- [3D Raycast 任务](../recipes/raycast-3d.md)
- [3D 物理不触发排查](../troubleshooting/physics-3d-not-triggered.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 物理系统 - 3D 物理
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
