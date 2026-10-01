---
id: cocos-3.8-recipes-raycast-3d
version: "3.8"
category: recipes
title: 3D 射线检测（Raycast）
keywords:
  - 3D射线检测
  - raycast
  - 射线检测
  - 点击拾取
  - 屏幕坐标转射线
  - PhysicsRayResult
  - mask过滤
  - Camera.screenPointToRay
  - PhysicsSystem
  - 3D拾取
related_docs:
  - api-reference/physics-system.md
  - api-reference/collider.md
  - api-reference/rigid-body.md
  - api-reference/camera.md
  - troubleshooting/physics-3d-not-triggered.md
related_api:
  - PhysicsSystem
  - PhysicsRayResult
  - Camera
  - Collider
  - geometry.Ray
  - Vec3
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 3D 射线检测"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：raycastResults 的内容在每次 raycast 调用后覆盖，必须立即处理或复制"
status: draft
updated: 2026-06-17
---

# 3D 射线检测（Raycast）

## 目标

在 Cocos Creator 3.8 中，从相机发射一条射线检测 3D 物体（点击拾取、瞄准检测、地面对齐等）。支持从屏幕点击点转换射线、使用 mask 过滤检测对象，并在命中后读取碰撞点和碰撞体信息。

## 推荐做法

1. **从相机屏幕点发射**：使用 `camera.screenPointToRay(x, y, out)` 将触摸/鼠标坐标转换为世界空间射线。
2. **使用 PhysicsSystem 查询**：通过 `PhysicsSystem.instance.raycast(worldRay, mask, maxDistance, queryTrigger)` 执行检测。
3. **读取结果**：检测返回 `boolean`，命中结果存储在 `PhysicsSystem.instance.raycastResults[]`（全部命中）或 `raycastClosestResult`（最近命中）。
4. **mask 过滤**：使用 mask 参数按碰撞分组过滤，避免检测无关物体。
5. **立即处理结果**：多次 `raycast` 调用会覆盖结果数组，每次检测后必须立即读取或复制。

## 示例代码

### 从相机触摸点发射射线（全部命中）

```ts
import { _decorator, Component, Camera, PhysicsSystem, geometry, Vec3, Input, input, EventTouch } from 'cc';

const { ccclass } = _decorator;

@ccclass('RaycastFromCamera')
export class RaycastFromCamera extends Component {
  private _camera: Camera | null = null;
  private _ray = new geometry.Ray();

  start() {
    this._camera = Camera.main;
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: EventTouch) {
    if (!this._camera) return;

    // 获取触摸位置（屏幕坐标）
    const touchPos = event.getLocation();

    // 转换为世界空间射线，传入 z 作为距离相机的深度
    this._camera.screenPointToRay(touchPos.x, touchPos.y, this._ray);

    // 执行射线检测（mask 默认 0xffffffff，全部检测）
    if (PhysicsSystem.instance.raycast(this._ray)) {
      const results = PhysicsSystem.instance.raycastResults;
      console.log(`击中 ${results.length} 个物体:`);
      for (let i = 0; i < results.length; i++) {
        const hit = results[i];
        console.log(`  [${i}] ${hit.collider.node.name}, 距离: ${hit.distance}`);
      }
    }
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }
}
```

### 最近命中检测（拾取/瞄准）

```ts
import { _decorator, Component, Camera, PhysicsSystem, geometry, Input, input, EventTouch } from 'cc';

const { ccclass } = _decorator;

@ccclass('RaycastClosestPick')
export class RaycastClosestPick extends Component {
  private _camera: Camera | null = null;
  private _ray = new geometry.Ray();

  start() {
    this._camera = Camera.main;
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onTouchEnd(event: EventTouch) {
    if (!this._camera) return;

    const touchPos = event.getLocation();
    this._camera.screenPointToRay(touchPos.x, touchPos.y, this._ray);

    // 只取最近命中
    if (PhysicsSystem.instance.raycastClosest(this._ray)) {
      const hit = PhysicsSystem.instance.raycastClosestResult;
      const collider = hit.collider;
      console.log(`最近击中: ${collider.node.name}`);
      console.log(`命中点: (${hit.hitPoint.x.toFixed(2)}, ${hit.hitPoint.y.toFixed(2)}, ${hit.hitPoint.z.toFixed(2)})`);
      console.log(`命中法线: (${hit.hitNormal.x.toFixed(2)}, ${hit.hitNormal.y.toFixed(2)}, ${hit.hitNormal.z.toFixed(2)})`);
      console.log(`距离: ${hit.distance.toFixed(2)}`);
    }
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }
}
```

### 使用 mask 过滤 + 自定义射线

```ts
import { _decorator, Component, PhysicsSystem, geometry, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('RaycastWithMask')
export class RaycastWithMask extends Component {
  private _ray = new geometry.Ray();

  start() {
    // 从 (0, 2, 0) 沿 Y 轴负方向发射
    Vec3.set(this._ray.o, 0, 2, 0);
    Vec3.set(this._ray.d, 0, -1, 0);

    // 只检测 Group 0（1 << 0）
    const mask = 1 << 0;

    if (PhysicsSystem.instance.raycast(this._ray, mask, 100, false)) {
      for (const hit of PhysicsSystem.instance.raycastResults) {
        console.log(`击中 Group 0: ${hit.collider.node.name}`);
      }
    }
  }
}
```

### 手动构造射线检测远处物体

```ts
import { _decorator, Component, PhysicsSystem, geometry, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('ManualRaycast')
export class ManualRaycast extends Component {
  private _ray = new geometry.Ray();

  update(dt: number) {
    // 从玩家位置向前发射射线
    const pos = this.node.worldPosition;
    const forward = new Vec3();
    this.node.forward.clone(forward);

    Vec3.set(this._ray.o, pos.x, pos.y, pos.z);
    Vec3.set(this._ray.d, forward.x, forward.y, forward.z);

    // 最多检测 50 米
    if (PhysicsSystem.instance.raycastClosest(this._ray, 0xffffffff, 50)) {
      const hit = PhysicsSystem.instance.raycastClosestResult;
      // 如果击中的物体距离小于 10 米，则触发响应
      if (hit.distance < 10) {
        console.log(`检测到前方物体: ${hit.collider.node.name}`);
      }
    }
  }
}
```

## 操作步骤

1. **获取相机**：使用 `Camera.main` 获取主相机引用。
2. **获取点击坐标**：在触摸/鼠标事件回调中通过 `event.getLocation()` 获取屏幕坐标。
3. **转换为射线**：调用 `camera.screenPointToRay(x, y, outRay)` 生成世界空间射线。
4. **执行 raycast**：调用 `PhysicsSystem.instance.raycast(worldRay, mask)` 或 `raycastClosest(worldRay, mask)`。
5. **处理结果**：检查返回值为 `true` 后，立即读取 `raycastResults[]` 或 `raycastClosestResult`。
6. **可选：复制结果**：跨帧或多次调用 raycast 时，手动复制 `PhysicsRayResult` 的 `hitPoint`、`distance`、`collider`、`hitNormal`。

## 验证方式

- 在场景中放置多个带 Collider 的 3D 物体；
- 运行场景后点击屏幕或物体附近，查看控制台输出命中的物体名称和距离；
- 调节 mask 参数后，只有对应分组内的物体能被检测到；
- 使用 `PhysicsSystem.instance.debugDrawFlags` 开启物理调试绘制，可视化碰撞体边界辅助验证。

## 常见错误

1. **raycastResults 被后续调用覆盖**：连续多次调用 `raycast` 或 `raycastClosest` 后，结果数组仅保留最后一次调用的内容。必须在每次调用后立即处理。
2. **屏幕坐标转换时 z 值问题**：`screenPointToRay` 不需要传入 z。如果手动构造射线时未注意方向和原点，可能命中意外物体。
3. **mask 参数设为 0**：`raycast(ray, 0)` 不会检测任何物体。默认值 `0xffffffff` 检测所有分组。
4. **maxDistance 过大**：引擎限制不能传入 `Infinity` 或 `Number.MAX_VALUE`，建议使用 `10000000` 或更小值。
5. **碰撞体没有 Collider 组件**：物体缺少 Collider 组件时，raycast 永远不会命中和该物体。
6. **UI 点击坐标边界说明**：触摸事件的 `getLocation()` 返回的是**屏幕像素坐标**，原点在屏幕左上角。`camera.screenPointToRay` 直接接受该坐标，无需额外转换。但如果使用 `camera.screenToWorld` 进行 2D 坐标转换再构造射线，可能出现坐标偏移。
7. **物理系统未启用**：`PhysicsSystem.instance.enable = false` 时 raycast 不工作。

## 相关文档

- [PhysicsSystem API 卡片](../api-reference/physics-system.md)
- [Collider API 卡片](../api-reference/collider.md)
- [RigidBody API 卡片](../api-reference/rigid-body.md)
- [Camera API 卡片](../api-reference/camera.md)
- [3D 物理不触发排查](../troubleshooting/physics-3d-not-triggered.md)
