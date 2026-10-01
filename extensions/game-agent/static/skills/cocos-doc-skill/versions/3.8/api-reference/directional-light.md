---
id: cocos-3.8-api-reference-directional-light
version: "3.8"
category: api-reference
title: DirectionalLight
keywords:
  - DirectionalLight
  - 平行光
  - 方向光
  - 太阳光
  - 光源
  - 3D 灯光
related_docs:
  - api-reference/sphere-light.md
  - api-reference/spot-light.md
  - concepts/3d-scene-rendering.md
  - troubleshooting/3d-object-not-visible.md
related_api:
  - DirectionalLight
  - SphereLight
  - SpotLight
  - Camera
  - MeshRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - 光源类型 - 平行光"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# DirectionalLight

## 用途

DirectionalLight（别称 DirectionalLightComponent）是最常用的 3D 光源组件，模拟无限远处的光源发出的光线，常用于实现太阳光。平行光的光照方向由节点的旋转（Rotation）决定，位置和朝向不影响光照效果。

## 所属模块

```ts
import { DirectionalLight } from 'cc';
```

## 公开导出结论

- `DirectionalLight` 在 `cc` 模块以 `export class DirectionalLight extends Component` 公开导出。
- 在 `cc` 模块中也通过 `DirectionalLightComponent` 别名导出（两者相同）。
- 公开属性包含：`color`、`illuminance`、`useColorTemperature`、`colorTemperature`、`staticSettings` 等。
- 场景最多只支持一个平行光。若同时添加多个，以最后一个添加的为准。
- 新建场景时，默认自动创建 `Main Light` 平行光节点。

## 常用属性

| 属性 | 类型 | 说明 | 高频场景 |
|---|---|---|---|
| `color` | `Color` | 光源颜色 | 设置阳光颜色（偏暖黄或偏冷白） |
| `illuminance` | `number` | 照度，单位勒克斯（lx） | 控制整体光照强弱 |
| `useColorTemperature` | `boolean` | 是否启用色温 | 模拟日出/日落色温变化 |
| `colorTemperature` | `number` | 色温值（Kelvin） | `useColorTemperature` 为 true 时有效 |
| `staticSettings` | `StaticLightSettings` | 静态灯光设置 | 光照贴图烘焙 |

### 光照方向控制

平行光的光照方向由节点旋转控制。节点的位置和朝向（forward 方向）不影响渲染效果，只有旋转影响光线入射角度。

- 旋转节点使灯光从上方斜照（模拟太阳）—— Y 轴向上，X/Z 轴旋转控制太阳高度角和方位角。
- 通过编辑器左上角的旋转变换工具调整。

## 常用方法

DirectionalLight 组件自身无特殊公开方法。相关功能通过组件基类 `Component` 和节点 `Node` 提供。

## 最小场景设置

一个最基本的平行光场景包含：
1. 场景中有一个 `Main Light` 节点（编辑器默认创建）挂载 DirectionalLight 组件。
2. 一个挂载了 MeshRenderer + Mesh 的模型节点（如立方体、球体）。
3. 模型材质的 PBR 效果需要灯光照射才能显示——无灯光时模型将全黑。

```ts
import { _decorator, Component, DirectionalLight, Color, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DirectionalLightExample')
export class DirectionalLightExample extends Component {
  @property(DirectionalLight)
  mainLight: DirectionalLight | null = null;

  start() {
    if (!this.mainLight) return;

    // 设置暖色阳光
    this.mainLight.color = new Color(255, 244, 230, 255);

    // 设置照度（典型室外晴天约 10000 - 100000 lx）
    this.mainLight.illuminance = 50000;

    // 启用色温
    this.mainLight.useColorTemperature = true;
    this.mainLight.colorTemperature = 5500; // 正午日光色温

    // 通过旋转节点控制光照方向
    this.node.setRotationFromEuler(-45, 0, 0); // 从斜上方照射
  }
}
```

## 适用场景

| 场景 | 说明 |
|---|---|
| 太阳光 / 室外场景 | 模拟太阳从某个方向照射整个场景 |
| 主光源 | 作为场景的主要照明光源 |
| 方向性阴影 | 配合 Shadow 设置产生方向光阴影 |

## 常见错误

1. **灯光方向不对**：平行光实际不依赖位置，只有旋转控制光照方向。如果旋转设置错误，场景可能看起来没有受到光照。检查节点的 eulerAngles，典型太阳光角度是 `(-30 ~ -60, 0, 0)`。

2. **场景没有灯光**：新建场景默认有 `Main Light`，但如果手动删除了，场景中的 3D 模型将显示为全黑。需要确保场景中至少有一个平行光。

3. **材质不受光**：模型材质使用的 Effect（如 builtin-standard）需要支持 PBR 光照。如果使用了自定义 effect 且未处理光照计算，模型可能显示为全亮或全暗。

4. **多个平行光不生效**：Cocos Creator 3.8 只支持一个平行光。如果添加了多个，只有最后一个生效。

5. **Layer 不被相机渲染**：如果节点的 Layer 不在 Camera 的 visibility 掩码中，即使有灯光也不会被渲染。确保模型节点和灯光节点的 Layer 设置正确。

6. **没有阴影**：平行光阴影需要手动开启。在场景的阴影设置中启用阴影，并确保材质的 Shadow Casting Mode 设置正确。阴影默认不开启。

## 关联任务

- [3D 场景渲染概念](../concepts/3d-scene-rendering.md)
- [SphereLight API 卡片](./sphere-light.md)
- [SpotLight API 卡片](./spot-light.md)
- [3D 对象不可见排查](../troubleshooting/3d-object-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 光源类型 - 平行光
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
