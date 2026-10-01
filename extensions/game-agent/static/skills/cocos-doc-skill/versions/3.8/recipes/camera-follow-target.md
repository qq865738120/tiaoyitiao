---
id: cocos-3.8-recipes-camera-follow-target
version: "3.8"
category: recipes
title: 相机跟随目标
keywords:
  - camera跟随
  - 相机跟随
  - 相机平滑跟随
  - 摄像机跟随玩家
  - 镜头跟随
related_docs:
  - api-reference/camera.md
  - api-reference/vec3.md
  - troubleshooting/coordinate-conversion-wrong.md
related_api:
  - Camera
  - Vec3
  - Node
  - Component
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - 相机 - 3D 相机"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：平滑跟随使用 lerp + 复用临时 Vec3 是标准做法"
status: draft
updated: 2026-06-17
---

# 相机跟随目标

## 目标

实现相机跟随一个目标节点（如玩家角色）移动，包括刚性跟随和带平滑效果的跟随。

## 推荐做法

- 在相机节点上挂载一个组件控制跟随逻辑。
- 在 `lateUpdate` 中更新相机位置（确保目标节点已更新完位置）。
- 使用 `Vec3.lerp` 实现平滑跟随效果。
- 避免在 `update` 中通过 `find()` 或 `getChildByName` 频繁查找节点——应将目标节点引用缓存为属性（`@property`）或成员变量。

## 前置条件

1. 场景中有一个 Camera 节点（编辑器默认创建 `Main Camera`）。
2. 有一个目标节点（如玩家的 `Player` 节点）。
3. 如果是 2D 游戏，Camera 的投影模式应为 `ORTHO`；如果是 3D 游戏，使用 `PERSPECTIVE` 模式。

## 示例代码

### 刚性跟随（直接定位）

```ts
import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CameraRigidFollow')
export class CameraRigidFollow extends Component {
  @property(Node)
  target: Node | null = null; // 在编辑器中拖拽绑定

  lateUpdate(dt: number) {
    if (!this.target) return;

    // 相机位置 = 目标位置 + 偏移量
    const targetPos = this.target.worldPosition;
    this.node.setWorldPosition(targetPos.x, targetPos.y + 2, targetPos.z + 5);
  }
}
```

### 平滑跟随（lerp 插值）

```ts
import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CameraSmoothFollow')
export class CameraSmoothFollow extends Component {
  @property(Node)
  target: Node | null = null; // 在编辑器中拖拽绑定

  @property
  smoothSpeed: number = 3.0; // 跟随速度，越大越灵敏

  @property
  offset: Vec3 = new Vec3(0, 2, 5); // 相机相对于目标的偏移量

  private _targetPos = new Vec3();
  private _currentPos = new Vec3();

  lateUpdate(dt: number) {
    if (!this.target) return;

    // 计算期望位置
    Vec3.add(this._targetPos, this.target.worldPosition, this.offset);

    // 当前相机位置
    this._currentPos.copy(this.node.worldPosition);

    // 线性插值平滑移动（lerp）
    const t = 1 - Math.pow(1 - this.smoothSpeed * dt, 60 / 60);
    Vec3.lerp(this._currentPos, this._currentPos, this._targetPos, t);

    this.node.setWorldPosition(this._currentPos);
  }
}
```

### 2D 横版跟随（仅跟随 X 轴）

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Camera2DFollow')
export class Camera2DFollow extends Component {
  @property(Node)
  target: Node | null = null;

  @property
  smoothSpeed: number = 4.0;

  // 边界限制（世界坐标）
  @property
  minX: number = -100;

  @property
  maxX: number = 100;

  lateUpdate(dt: number) {
    if (!this.target) return;

    const targetX = this.target.worldPosition.x;
    const currentX = this.node.worldPosition.x;

    // 限制目标 X 在边界内
    const clampedX = Math.max(this.minX, Math.min(this.maxX, targetX));

    // 平滑插值
    const newX = currentX + (clampedX - currentX) * this.smoothSpeed * dt;
    this.node.setWorldPosition(newX, this.node.worldPosition.y, this.node.worldPosition.z);
  }
}
```

### 3D 俯视角跟随（含高度和距离）

```ts
import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CameraTopDownFollow')
export class CameraTopDownFollow extends Component {
  @property(Node)
  target: Node | null = null;

  @property
  height: number = 10;

  @property
  distance: number = 8;

  @property
  smoothSpeed: number = 3.0;

  private _desiredPos = new Vec3();
  private _tempVec3 = new Vec3();

  lateUpdate(dt: number) {
    if (!this.target) return;

    // 相机在目标的后上方
    const forward = this.target.forward;
    Vec3.set(
      this._desiredPos,
      this.target.worldPosition.x - forward.x * this.distance,
      this.target.worldPosition.y + this.height,
      this.target.worldPosition.z - forward.z * this.distance,
    );

    // 平滑过渡
    Vec3.lerp(this._tempVec3, this.node.worldPosition, this._desiredPos, this.smoothSpeed * dt);
    this.node.setWorldPosition(this._tempVec3);

    // 相机始终看向目标
    this.node.lookAt(this.target.worldPosition);
  }
}
```

## 操作步骤

### 基本设置

1. 在场景中创建或确认存在目标节点（如 `Player`）。
2. 在 `Main Camera` 节点上添加一个自定义脚本组件（如 `CameraSmoothFollow`）。
3. 在 Inspector 中将脚本的 `target` 属性拖拽绑定到目标节点。
4. 调整 `offset`（偏移量）和 `smoothSpeed`（平滑速度）参数。

### 调试建议

1. 先在 `start()` 中打印 Camera 和目标节点的初始位置，确认引用正确。
2. 如需调试，可以暂时将 `smoothSpeed` 设为极大值（如 100）来观察是否接近"刚性跟随"效果。
3. 如果发现相机跟不上，检查目标节点是否在 `lateUpdate` 中更新位置（而不是在 `update` 中）。

## 验证方式

- 运行时目标节点移动，相机跟随目标移动。
- 平滑跟随模式下，停止移动后相机有一段"惯性"过渡到最终位置。
- 边界限制模式下，相机不会超出设定的最小/最大值范围。
- 3D 模式下，相机始终朝向目标节点。

## 常见错误

1. **使用 `find()` 在 `update` 中查找目标节点**：这会导致每帧调用全局节点查找，性能极差。**应将节点引用存储在成员变量中**，或在属性面板中绑定。
   ```ts
   // ❌ 错误：每帧查找
   update(dt: number) {
     const target = find('Canvas/Player');
     if (target) { ... }
   }

   // ✅ 正确：缓存引用
   private _target: Node | null = null;
   start() { this._target = find('Canvas/Player'); }
   lateUpdate(dt: number) {
     if (this._target) { ... }
   }
   ```

2. **在 `update` 而非 `lateUpdate` 中更新相机位置**：如果目标节点也在 `update` 中更新位置，相机会在目标位置更新之前先移动，导致相机位置滞后一帧。建议在 `lateUpdate` 中跟随。

3. **2D 游戏使用 PERSPECTIVE 相机**：2D 游戏应使用 ORTHO 投影的相机，否则视角变形且无法正确显示 UI 元素。

4. **lerp 系数计算不当**：`lerp` 的 t 参数范围是 0-1，表示从起点到终点的比例。不要直接将 `dt` 作为 t 传入，应该是 `1 - Math.pow(1 - speed * dt, ...)` 的帧率无关计算。

5. **未判断 `this.target` 为 null**：当目标节点被销毁时（如场景切换），访问 `this.target.worldPosition` 会导致错误。使用前必须判空。

## 2D 与 3D 视角差异

| 维度 | 2D 横版/俯视 | 3D 视角 |
|---|---|---|
| 投影模式 | `ORTHO` | `PERSPECTIVE` |
| 相机偏移 | 通常只跟 X/Y（保持固定 Z） | 需要 Z 偏移，可能需要 `lookAt` |
| 缩放控制 | 通过 `orthoHeight` | 通过 `fov` 或距离 |
| 旋转 | 通常不旋转 | 需要旋转保持目标在视野内 |

## 相关文档

- [Camera API 卡片](../api-reference/camera.md)
- [Vec3 API 卡片](../api-reference/vec3.md)
- [坐标转换错误排查](../troubleshooting/coordinate-conversion-wrong.md)
