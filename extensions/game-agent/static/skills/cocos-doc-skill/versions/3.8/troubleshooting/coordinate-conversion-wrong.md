---
id: cocos-3.8-troubleshooting-coordinate-conversion-wrong
version: "3.8"
category: troubleshooting
title: 坐标转换结果不对
keywords:
  - 坐标不对
  - 坐标转换
  - 世界坐标
  - 本地坐标
  - 屏幕坐标
  - 位置错误
  - 节点位置不对
related_docs:
  - api-reference/camera.md
  - api-reference/vec3.md
  - api-reference/node.md
  - api-reference/ui-transform.md
  - recipes/camera-follow-target.md
related_api:
  - Node
  - Camera
  - UITransform
  - Vec3
  - director
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - 坐标系统、相机"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：坐标系统混淆是游戏开发中最高频的问题之一"
status: draft
updated: 2026-06-17
---

# 坐标转换结果不对

## 现象

- `screenToWorld` 或 `worldToScreen` 返回的位置与预期不符。
- UI 节点在世界坐标中的位置和视觉位置不匹配。
- 节点在屏幕上显示的位置与代码中打印的 `position` 值不一致。
- 触摸事件获取到的坐标与节点实际位置偏差很大。

## 最可能原因

1. **本地坐标、世界坐标、屏幕坐标三者混淆**（最常见）。
2. **UI 节点直接读 `node.position` 而不是通过 `UITransform` 的坐标转换方法**。
3. **Camera 配置不正确或使用的相机不是预期的相机**（特别是在多相机场景或 3D 场景中）。
4. **父节点的缩放/旋转影响子节点的本地坐标值**。
5. **转换方法中 z 值参数传递错误**——`screenToWorld` 的 z 值代表从相机的距离，不是屏幕 z。

## 快速检查

- [ ] 确认当前读取的是本地坐标 (`node.position`) 还是世界坐标 (`node.worldPosition`)。
- [ ] 如果操作 UI 节点，使用的是 `UITransform.convertToNodeSpaceAR` / `convertToWorldSpaceAR` 而不是直接读位置。
- [ ] 确认使用的是正确的 Camera 实例（特别是多相机场景中）。
- [ ] 检查 Camera 的 `projection` 模式（ORTHO / PERSPECTIVE）是否符合预期。
- [ ] 确认父节点没有非预期的缩放或旋转值。
- [ ] 检查将屏幕坐标转换为世界坐标时传入的 z 值是否合理。

## 解决方案

### 1. 确认坐标空间

Cocos Creator 3.8 中三种坐标空间的关系：

| 坐标空间 | 说明 | 获取方式 |
|---|---|---|
| 本地坐标 | 相对于父节点的位置 | `node.position` |
| 世界坐标 | 在场景根坐标系下的位置 | `node.worldPosition` |
| 屏幕坐标 | 屏幕像素坐标（左下角原点） | 通过 Camera 转换 |

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('CheckCoordinates')
export class CheckCoordinates extends Component {
  start() {
    // 打印三种坐标供调试
    console.log('Local position:', this.node.position);
    console.log('World position:', this.node.worldPosition);
    // 屏幕坐标需要通过 Camera 转换获得
  }
}
```

### 2. UI 节点坐标转换

UI 节点不能直接读 `node.position` 作为屏幕坐标——UI 坐标受 Canvas 缩放、Widget 约束等因素影响。**必须使用 UITransform 的专用转换方法**。

```ts
import { _decorator, Component, UITransform, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('UICoordinateConversion')
export class UICoordinateConversion extends Component {
  private _tempVec3 = new Vec3();

  convertUIToScreen() {
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) return;

    // 将 UI 节点本地坐标转换到世界坐标
    const worldPos = uiTransform.convertToWorldSpaceAR(Vec3.ZERO);
    console.log('UI node world position:', worldPos);

    // 将屏幕坐标转换到 UI 节点本地坐标
    const screenPoint = new Vec3(100, 200, 0);
    const localPos = uiTransform.convertToNodeSpaceAR(screenPoint);
    console.log('Screen point in local space:', localPos);
  }
}
```

### 3. 检查 Camera 配置

Camera 的配置直接影响坐标转换结果。

```ts
import { _decorator, Component, Camera, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('CheckCameraConfig')
export class CheckCameraConfig extends Component {
  start() {
    const camera = Camera.main;
    if (!camera) {
      console.error('No main camera found!');
      return;
    }

    // 打印相机配置，用于调试
    console.log('Camera projection:', camera.projection);
    console.log('Camera orthoHeight:', camera.orthoHeight);
    console.log('Camera nearClip:', camera.nearClip);
    console.log('Camera farClip:', camera.farClip);
    console.log('Camera visibility:', camera.visibility);
  }
}
```

### 4. 屏幕 -> 世界坐标：注意 z 值

`screenToWorld` 的第三个参数 z 代表从相机的深度距离，不是屏幕 z 坐标。

```ts
import { _decorator, Component, Camera, Vec3, Input, input, EventTouch } from 'cc';

const { ccclass } = _decorator;

@ccclass('ScreenToWorldWithDepth')
export class ScreenToWorldWithDepth extends Component {
  private _camera: Camera | null = null;
  private _tempVec3 = new Vec3();

  start() {
    this._camera = Camera.main;
    input.on(Input.EventType.TOUCH_START, this.onTouch, this);
  }

  onTouch(event: EventTouch) {
    if (!this._camera) return;

    const screenPos = event.getLocation();

    // 方法一：在指定深度平面（z=10）上获取世界坐标
    Vec3.set(this._tempVec3, screenPos.x, screenPos.y, 10);
    this._camera.screenToWorld(this._tempVec3, this._tempVec3);
    console.log('World pos at z=10:', this._tempVec3);

    // 方法二：如果只想在相机近平面位置，z 传 0
    Vec3.set(this._tempVec3, screenPos.x, screenPos.y, 0);
    this._camera.screenToWorld(this._tempVec3, this._tempVec3);
    console.log('World pos at z=0 (near plane):', this._tempVec3);
  }
}
```

### 5. 父节点变换影响子节点

子节点的 worldPosition 受父节点所有变换（位置、旋转、缩放）影响。如果父节点有非预期的变换，子节点的 `position`（本地坐标）与其视觉位置大相径庭。

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('DebugParentTransform')
class DebugParentTransform extends Component {
  start() {
    // 打印父节点变换，帮助定位问题
    console.log('Parent position:', this.node.parent?.position);
    console.log('Parent rotation:', this.node.parent?.rotation);
    console.log('Parent scale:', this.node.parent?.scale);
    console.log('Child local position:', this.node.position);
    console.log('Child world position:', this.node.worldPosition);
  }
}
```

### 6. 物理世界坐标与图形世界坐标不一致

如果使用了物理引擎，物理碰撞体的位置和变换通过 `node.worldPosition` 与图形同步。正常情况下两者一致，但以下情况可能导致不同步：

- 物理体通过 `rigidBody.setLinearVelocity` 移动但未同步 Node 的 `worldPosition`（实际物理引擎会自动同步）。
- 手动修改了 `node.position` 但物理 Body 未调用 `wakeUp`。
- 帧同步问题，物理模拟更新后图形的位置更新在 `lateUpdate` 中才会体现。

## 仍未解决时

- 在场景编辑器中切换到 3D 视角，观察节点的实际世界位置。
- 用一个明显的标记节点（如大红色的 Cube）放在转换后的世界坐标位置，确认坐标点是否在预期位置。
- 检查是否使用了 Canvas 子节点作为世界坐标的参考——UI 节点的世界坐标经过了 Canvas 缩放，需要额外小心。
- 确认当前 Camera 的 `visibility` 与节点的 `layer` 匹配。
- 如果是在 `start()` 中获取坐标但结果不对，尝试在 `lateUpdate` 或延迟一帧后再获取（可能是场景初始化顺序问题）。

## 相关文档

- [Camera API 卡片](../api-reference/camera.md)
- [Vec3 API 卡片](../api-reference/vec3.md)
- [Node API 卡片](../api-reference/node.md)
- [UITransform API 卡片](../api-reference/ui-transform.md)
- [相机跟随目标](../recipes/camera-follow-target.md)
