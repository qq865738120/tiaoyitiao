---
id: cocos-3.8-scene-node-component-transform
version: "3.8"
category: scene-node-component
title: Transform 变换：位置、旋转与缩放
keywords:
  - 位置
  - 旋转
  - 缩放
  - position
  - rotation
  - scale
  - 世界坐标
  - 本地坐标
  - setPosition
  - eulerAngles
related_docs:
  - api-reference/node.md
  - api-reference/ui-transform.md
  - scene-node-component/hierarchy.md
related_api:
  - Node
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - 坐标系和变换"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：世界坐标通过矩阵链计算，读取开销比本地坐标大；2D 场景中 z 轴用于控制渲染层级"
status: draft
updated: 2026-06-17
---

# Transform 变换：位置、旋转与缩放

## 用途

说明如何设置节点的位置、旋转和缩放，以及本地坐标系与世界坐标系的区别。

## 核心结论

- **本地坐标**：相对于父节点的位置、旋转、缩放。设置 `position` / `rotation` / `scale` 直接修改本地值。
- **世界坐标**：节点在场景世界中的绝对位置。`worldPosition` / `worldRotation` 由引擎自动计算（沿层级链累积）。
- **优先操作本地坐标**，世界坐标主要用于读取。直接设置 `worldPosition` 会反向计算本地坐标。
- 2D 场景中 z 轴控制渲染层级（排序），x/y 控制屏幕位置。

## 位置（Position）

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('PositionExample')
export class PositionExample extends Component {
  start() {
    // 设置本地位置
    this.node.setPosition(100, 200, 0);
    // 或
    this.node.position = new Vec3(100, 200, 0);

    // 获取本地位置
    const localPos = this.node.getPosition();

    // 获取世界位置（只读最常用）
    const worldPos = this.node.worldPosition;
    console.log(`世界坐标: ${worldPos.x}, ${worldPos.y}, ${worldPos.z}`);

    // 设置世界位置（会反向计算本地坐标）
    this.node.worldPosition = new Vec3(500, 300, 0);
  }
}
```

## 旋转（Rotation）

```ts
import { _decorator, Component, Vec3, Quat } from 'cc';

const { ccclass } = _decorator;

@ccclass('RotationExample')
export class RotationExample extends Component {
  start() {
    // 用欧拉角设置旋转（最常用，角度制）
    this.node.setRotationFromEuler(0, 0, 45);  // 绕 z 轴旋转 45°

    // 直接设置欧拉角
    this.node.eulerAngles = new Vec3(0, 0, 90);

    // 2D 场景中只旋转 z 轴
    this.node.angle = 30;  // 等同于 setRotationFromEuler(0, 0, 30)

    // 用四元数设置旋转（3D 场景更常用）
    this.node.setRotation(new Quat(0, 0, 0.3827, 0.9239));
  }
}
```

**旋转方式对比**：

| 方式 | 单位 | 适用场景 |
|---|---|---|
| `eulerAngles` / `setRotationFromEuler()` | 角度 | 2D 和 3D，最直觉 |
| `angle` | 角度（仅 z 轴） | 2D 旋转，最简洁 |
| `rotation` / `setRotation()` | 四元数 | 3D 复杂旋转，无万向锁 |

## 缩放（Scale）

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('ScaleExample')
export class ScaleExample extends Component {
  start() {
    // 统一缩放
    this.node.setScale(1.5, 1.5, 1);

    // 分别设置各轴
    this.node.scale = new Vec3(0.5, 1.0, 1.0);  // x 轴缩小到 50%

    // 翻转（镜像）
    this.node.setScale(-1, 1, 1);  // 水平翻转
  }
}
```

## 本地坐标 vs 世界坐标

| 概念 | API | 说明 |
|---|---|---|
| 本地位置 | `position` / `setPosition()` | 相对于父节点的偏移 |
| 世界位置 | `worldPosition` | 场景中的绝对位置，由父链矩阵累积计算 |
| 本地旋转 | `eulerAngles` / `rotation` | 相对于父节点的旋转 |
| 世界旋转 | `worldRotation` | 场景中的绝对旋转 |
| 本地缩放 | `scale` | 相对于父节点的缩放 |
| 世界缩放 | `worldScale` | 考虑父节点缩放的累积结果 |

```ts
// 典型场景：判断两个节点是否足够接近
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DistanceCheck')
export class DistanceCheck extends Component {
  @property(Node)
  target: Node | null = null;

  isCloseToTarget(threshold: number): boolean {
    if (!this.target) return false;

    // 用世界坐标比较（不受各自父节点影响）
    const myPos = this.node.worldPosition;
    const targetPos = this.target.worldPosition;

    const dx = myPos.x - targetPos.x;
    const dy = myPos.y - targetPos.y;
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  }
}
```

## UI 节点与 3D 节点的基本差异

| 方面 | UI 节点 | 3D 节点 |
|---|---|---|
| 坐标系统 | 2D 屏幕坐标（x 左→右，y 下→上） | 3D 世界坐标（x, y, z） |
| 必备组件 | `UITransform`（提供尺寸和锚点） | 无强制要求 |
| z 轴用途 | 渲染排序（同级节点 z 值大的渲染在上层） | 深度位置（前后关系） |
| 常用旋转轴 | z 轴（`angle`） | x/y/z 三轴 |
| 锚点 | `UITransform.anchorPoint`，默认 (0.5, 0.5) 中心 | 无锚点概念 |

## 常见错误

1. **混淆本地坐标和世界坐标**：子节点的 `position` 是相对父节点的，放在不同父节点下相同的 `position` 值可能对应不同屏幕位置。
2. **修改 `position` 的返回对象**：`getPosition(out)` 返回的 Vec3 对象不应直接修改其分量，应使用 `setPosition` 重新设置。
3. **每帧读取 `worldPosition`**：世界坐标需要沿父链计算矩阵，频繁读取有一定开销。优先缓存结果。
4. **在屏幕适配中手动计算坐标**：应使用 Widget 组件和 UITransform 的锚点系统，避免硬编码像素值。

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [UITransform API 卡片](../api-reference/ui-transform.md)
- [节点层级操作](./hierarchy.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - 坐标系和变换、UI 系统 - 定位和布局
- 已交叉验证：cc-engine 3.8 公开类型声明
