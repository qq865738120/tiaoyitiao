---
id: cocos-3.8-api-reference-sphere-light
version: "3.8"
category: api-reference
title: SphereLight
keywords:
  - SphereLight
  - 球面光
  - 点光源
  - 灯泡
  - 光源
  - 3D 灯光
related_docs:
  - api-reference/directional-light.md
  - api-reference/spot-light.md
  - concepts/3d-scene-rendering.md
  - troubleshooting/3d-object-not-visible.md
related_api:
  - SphereLight
  - DirectionalLight
  - SpotLight
  - Camera
  - MeshRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - 光源类型 - 球面光"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# SphereLight

## 用途

SphereLight（别称 SphereLightComponent）是向所有方向均匀发散光线的 3D 光源组件，类似于 v2.x 版本的点光源（Point Light）。物体受到的光照强度随距离增大而衰减，超过 `range` 范围后光照强度为 0。通常用于模拟火把、蜡烛、灯泡等向四周发光的点状光源。

## 所属模块

```ts
import { SphereLight } from 'cc';
```

## 公开导出结论

- `SphereLight` 在 `cc` 模块以 `export class SphereLight extends Component` 公开导出。
- 在 `cc` 模块中也通过 `SphereLightComponent` 别名导出（两者相同）。
- 公开属性包含：`color`、`range`、`size`、`term`（`LUMINOUS_POWER` / `LUMINANCE`）、光通量、`luminance`、`useColorTemperature`、`colorTemperature`、`staticSettings` 等。
- 光照强度随距离呈平方反比衰减。

## 常用属性

| 属性 | 类型 | 说明 | 高频场景 |
|---|---|---|---|
| `color` | `Color` | 光源颜色 | 设置灯泡颜色（暖黄/冷白） |
| `range` | `number` | 光照影响范围 | 控制光源照亮区域的大小 |
| `term` | `number` | 光照强度单位类型（`LUMINOUS_POWER` / `LUMINANCE`） | 选择亮度度量方式 |
| `luminousPower` | `number` | 光通量，单位流明（lm），`term` 为 `LUMINOUS_POWER` 时生效 | 模拟实际灯泡的光通量参数 |
| `luminance` | `number` | 亮度，单位坎德拉每平方米（cd/m^2），`term` 为 `LUMINANCE` 时生效 | 模拟实际灯泡的亮度参数 |
| `size` | `number` | 光源大小（当前版本运行时暂不生效） | 预留属性 |
| `useColorTemperature` | `boolean` | 是否启用色温 | 模拟白炽灯/荧光灯色温 |
| `colorTemperature` | `number` | 色温值（Kelvin） | `useColorTemperature` 为 true 时有效 |

### 光照衰减

球面光遵循物理正确的平方反比衰减：
- 光照强度与距离的平方成反比。
- 在 `range` 距离处光照强度衰减为 0。
- 编辑器中以半透明球体直观显示光照覆盖范围。

### 光照强度单位选择

| `term` 值 | 适用场景 | 说明 |
|---|---|---|
| `LUMINOUS_POWER`（光通量） | 灯泡、蜡烛等向四周均匀发光的点光源 | 使用流明（lm），值越大光源越亮 |
| `LUMINANCE`（亮度） | 需要考虑光源面积亮度的场景 | 使用 cd/m^2，受 `size` 影响 |

## 常用方法

SphereLight 组件自身无特殊公开方法。相关功能通过组件基类 `Component` 和节点 `Node` 提供。

## 最小场景设置

```ts
import { _decorator, Component, SphereLight, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SphereLightExample')
export class SphereLightExample extends Component {
  @property(SphereLight)
  sphereLight: SphereLight | null = null;

  start() {
    if (!this.sphereLight) return;

    // 设置暖色灯光，模拟灯泡
    this.sphereLight.color = new Color(255, 200, 150, 255);

    // 设置光照范围
    this.sphereLight.range = 10;

    // 设置光通量（灯泡典型值约 400 - 1500 lm）
    this.sphereLight.term = SphereLight.Term.LUMINOUS_POWER;
    this.sphereLight.luminousPower = 800;
  }
}
```

## 适用场景

| 场景 | 说明 |
|---|---|
| 室内灯光 | 模拟灯泡、台灯等固定光源 |
| 火把 / 蜡烛 | 温暖色调、小范围照亮 |
| 装饰性光源 | 场景氛围灯、路灯 |
| 可移动光源 | 跟随角色或物体的照明 |

## 常见错误

1. **光照看不到效果**：球面光的 `range` 默认值可能较小（如 1-3），如果模型距离光源较远，光照衰减到 0，模型看起来没有受到光照。增大 `range` 或将光源靠近模型。

2. **强度设置太低**：`luminousPower` 默认值可能很低。典型灯泡在 400-1500 lm 范围，如果设置了 10-50 lm，光源几乎不可见。

3. **`size` 属性不生效**：当前版本球面光的 `size` 属性在运行时暂不生效，引擎将在后续版本优化。

4. **没有阴影**：球面光目前暂不支持实时阴影。如果需要阴影，使用平行光或聚光灯。

5. **距离衰减理解错误**：球面光是平方反比衰减。光源距离物体 2 倍远时，该物体接收到的光照只有原先的 1/4。

6. **Layer 不匹配**：光源节点或受照模型的 Layer 不在 Camera 的 visibility 范围内时无法渲染。

## 关联任务

- [3D 场景渲染概念](../concepts/3d-scene-rendering.md)
- [DirectionalLight API 卡片](./directional-light.md)
- [SpotLight API 卡片](./spot-light.md)
- [3D 对象不可见排查](../troubleshooting/3d-object-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 光源类型 - 球面光
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
