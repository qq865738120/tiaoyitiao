---
id: cocos-3.8-api-reference-spot-light
version: "3.8"
category: api-reference
title: SpotLight
keywords:
  - SpotLight
  - 聚光灯
  - 聚光
  - 手电筒
  - 舞台灯光
  - 3D 灯光
related_docs:
  - api-reference/directional-light.md
  - api-reference/sphere-light.md
  - concepts/3d-scene-rendering.md
  - troubleshooting/3d-object-not-visible.md
related_api:
  - SpotLight
  - DirectionalLight
  - SphereLight
  - Camera
  - MeshRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - 光源类型 - 聚光灯"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# SpotLight

## 用途

SpotLight（别称 SpotLightComponent）是从一个点向一个方向发射锥形光线的 3D 光源组件，类似手电筒或舞台追光灯。相比于球面光，聚光灯增加了锥角（`spotAngle`）和角度衰减（`angleAttenuationStrength`）控制，支持更精确的光照区域限定。

## 所属模块

```ts
import { SpotLight } from 'cc';
```

## 公开导出结论

- `SpotLight` 在 `cc` 模块以 `export class SpotLight extends Component` 公开导出。
- 在 `cc` 模块中也通过 `SpotLightComponent` 别名导出（两者相同）。
- 公开属性包含：`color`、`range`、`size`、`spotAngle`、`angleAttenuationStrength`、`term`（`LUMINOUS_POWER` / `LUMINANCE`）、光通量、`luminance`、`useColorTemperature`、`colorTemperature`、`staticSettings` 等。
- 聚光灯的位置、朝向和旋转都影响光照效果。
- 支持实时阴影（需在场景中启用阴影）。

## 常用属性

| 属性 | 类型 | 说明 | 高频场景 |
|---|---|---|---|
| `color` | `Color` | 光源颜色 | 设置灯光颜色 |
| `range` | `number` | 光照影响范围 | 控制光束最远距离 |
| `spotAngle` | `number` | 聚光角度（度），控制锥形光照范围 | 调整灯光覆盖区域宽窄 |
| `angleAttenuationStrength` | `number` | 角度衰减强度，值越大边缘越柔和，值越小边缘越硬 | 控制光斑边缘软硬 |
| `size` | `number` | 光源大小 | 影响亮度计算的物理参数 |
| `term` | `number` | 光照强度单位类型（`LUMINOUS_POWER` / `LUMINANCE`） | 选择亮度度量方式 |
| `luminousPower` | `number` | 光通量，单位流明（lm） | `term` 为 `LUMINOUS_POWER` 时生效 |
| `luminance` | `number` | 亮度，单位坎德拉每平方米（cd/m^2） | `term` 为 `LUMINANCE` 时生效 |
| `useColorTemperature` | `boolean` | 是否启用色温 | 模拟不同色温灯光 |
| `colorTemperature` | `number` | 色温值（Kelvin） | `useColorTemperature` 为 true 时有效 |

### 光照控制

聚光灯的光照效果由以下因素共同决定：

- **节点位置**：光源发射点的世界坐标。
- **节点旋转**：光照方向——灯光沿节点的 -Z 轴（forward 方向的反向）照射。
- **`range`**：光束最大距离，超出此距离物体不受光。
- **`spotAngle`**：锥角，0-180 度。角度越小光照越集中。
- **`angleAttenuationStrength`**：光斑边缘从亮到暗过渡的柔和程度。

## 常用方法

SpotLight 组件自身无特殊公开方法。相关功能通过组件基类 `Component` 和节点 `Node` 提供。

## 最小场景设置

```ts
import { _decorator, Component, SpotLight, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SpotLightExample')
export class SpotLightExample extends Component {
  @property(SpotLight)
  spotLight: SpotLight | null = null;

  start() {
    if (!this.spotLight) return;

    // 设置灯光颜色
    this.spotLight.color = new Color(255, 255, 200, 255);

    // 设置范围（光束射程）
    this.spotLight.range = 20;

    // 设置聚光角度（锥角），典型值 30-120 度
    this.spotLight.spotAngle = 45;

    // 设置边缘柔和度
    this.spotLight.angleAttenuationStrength = 0.5;

    // 设置光通量
    this.spotLight.term = SpotLight.Term.LUMINOUS_POWER;
    this.spotLight.luminousPower = 1000;
  }
}
```

## 适用场景

| 场景 | 说明 |
|---|---|
| 手电筒 | 窄角度、长射程、跟随角色方向 |
| 舞台追光灯 | 聚焦特定区域，边缘柔和 |
| 场景照明 | 照亮指定区域（如门口、橱窗） |
| 装饰性光锥 | 通过 `angleAttenuationStrength` 控制光斑视觉效果 |

## 常见错误

1. **朝向不对导致看不到效果**：聚光灯沿节点 -Z 轴方向照射。如果节点旋转不正确（如指向地面下方），光照效果不可见。使用编辑器的旋转工具调整聚光灯的照射方向。

2. **`spotAngle` 设置过大或过小**：角度为 0 时光束无限窄（不可见），角度为 180 度时退化为球面光效果。根据场景需要调整，典型值在 30-120 度之间。

3. **`range` 太小导致光束太短**：模型在聚光灯光束范围之外时不受光。增大 `range` 或将聚光灯移近目标。

4. **移动端多聚光灯阴影限制**：移动端原生平台（Android、iOS、OpenHarmony 等）默认不允许同时开启多个聚光灯的阴影。如需解除限制需要调用渲染管线配置代码。

5. **阴影没有生效**：聚光灯阴影需要先在场景中开启阴影。开启阴影后还需要确保材质的 Receive Shadow 和 Cast Shadow 设置正确。

6. **Layer 不匹配**：同其他光源一样，聚光灯和受照模型的 Layer 必须在 Camera 的 visibility 范围内。

## 关联任务

- [3D 场景渲染概念](../concepts/3d-scene-rendering.md)
- [DirectionalLight API 卡片](./directional-light.md)
- [SphereLight API 卡片](./sphere-light.md)
- [3D 对象不可见排查](../troubleshooting/3d-object-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 光源类型 - 聚光灯
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
