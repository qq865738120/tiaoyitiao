---
id: cocos-3.8-concepts-3d-scene-rendering
version: "3.8"
category: concepts
title: 3D 场景渲染基础
keywords:
  - 3D 场景
  - 渲染管线
  - Camera
  - Light
  - MeshRenderer
  - Material
  - Layer
  - visibility
  - clearFlags
  - near far 裁剪
  - 3D 与 2D 共存
  - 模型材质
related_docs:
  - api-reference/camera.md
  - api-reference/directional-light.md
  - api-reference/sphere-light.md
  - api-reference/spot-light.md
  - troubleshooting/3d-object-not-visible.md
  - concepts/scene-node-component-model.md
related_api:
  - Camera
  - DirectionalLight
  - SphereLight
  - SpotLight
  - MeshRenderer
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 场景 - 节点和组件 / 光照 / 相机"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-17
---

# 3D 场景渲染基础

## 用途

理解 Cocos Creator 3.8 中 Camera、Light、MeshRenderer、Material 如何协作完成 3D 场景的渲染，以及 Layer/visibility、near-far 裁剪、2D UI 与 3D 场景共存等核心概念。

## 核心结论

Cocos Creator 3.8 的 3D 渲染是一个多组件协作流水线：

1. **Camera** 决定从哪个视角看、看哪些内容（通过 visibility + Layer）、裁剪范围（near/far）以及背景清除方式（clearFlags）。
2. **Light**（DirectionalLight / SphereLight / SpotLight）提供光照能量，影响模型表面的着色计算。
3. **MeshRenderer** 提供要渲染的几何网格（Mesh）和视觉外观（Material）。
4. **Material** 定义着色方式（Effect/Shader），接收光照数据并计算出最终像素颜色。

渲染流程简化示意：

```
Camera 裁剪 → 筛选 visible Layers 中的节点
    → MeshRenderer 提交网格数据
    → 材质 Shader 结合灯光计算颜色
    → 输出到屏幕（或 targetTexture）
```

### Camera、Light、MeshRenderer、Material 的协作

| 角色 | 职责 | 关键属性 |
|---|---|---|
| Camera | 定义观察视锥体，筛选可见节点 | `visibility`, `nearClip`, `farClip`, `clearFlags`, `projection` |
| Light | 提供光照参数，影响材质着色 | `color`, `illuminance`/`luminousPower`, `range`, `spotAngle` |
| MeshRenderer | 持有 Mesh 和 Material 列表，提交绘制 | `mesh`, `materials[]` |
| Material | 定义着色算法，接收光照输入 | Effect（如 builtin-standard）、贴图、材质参数 |

**重要：没有 Light 的场景中，使用 PBR 材质的模型将显示为全黑。** 新建场景默认自动创建 `Main Light` 平行光。

## Layer / visibility / clearFlags / near-far 裁剪

### Layer 和 visibility

Camera 的 `visibility` 属性是一个位掩码（bitmask），用于控制 Camera 渲染哪些 Layer 上的节点：

- 每个节点有一个 `Layer` 属性（默认为 `DEFAULT`）。
- Camera 的 `visibility` 中若包含该 Layer 位，对应节点被该相机渲染；否则被忽略。
- 这可以实现分组渲染——例如一个 Camera 只渲染 UI（Layer = UI_2D），另一个只渲染 3D 场景（Layer = DEFAULT）。
- 默认 Camera 只渲染 `DEFAULT` 层（Layer 0）上的节点。

编辑器中的 Layer 列表在 **项目设置 -> Layers** 中管理。引擎内置若干 Layer（DEFAULT、UI_2D、GIZMOS 等），也提供 `User Layer 0-19` 供自定义。

### clearFlags

`clearFlags` 决定 Camera 在每帧开始渲染前如何清除帧缓冲区：

| 枚举值 | 说明 | 使用场景 |
|---|---|---|
| `Camera.ClearFlag.SKYBOX` | 用天空盒填充背景 | 3D 场景默认，配合 Skybox 效果 |
| `Camera.ClearFlag.SOLID_COLOR` | 用 `clearColor` 指定的纯色填充 | UI 相机、简单 3D 场景 |
| `Camera.ClearFlag.DEPTH_ONLY` | 只清除深度缓冲 | 辅助相机（如小地图） |
| `Camera.ClearFlag.DONT_CLEAR` | 不清除任何内容 | 叠加渲染（如后处理） |

### near / far 裁剪

Camera 的近裁剪面（`nearClip`）和远裁剪面（`farClip`）定义了一个平截头体（frustum），只有位于此范围内的物体才会被渲染：

- 物体距离 Camera 小于 `nearClip` 或大于 `farClip` 时完全不渲染，**且不会有任何控制台报错**。
- `nearClip` 默认 0.1 或 1（编辑器创建时），如果设置过小可能引起近平面闪烁（z-fighting）。
- `farClip` 默认 1000，如果场景物体超出此距离将不可见。
- `farClip` 设置过大会降低深度缓冲区精度。

## 2D UI 与 3D 场景共存

Cocos Creator 3.8 支持 2D UI 和 3D 场景在同一画面中混合渲染，常见配置有两种方式：

### 方式一：单相机混合渲染

一个 Camera 同时渲染 UI 和 3D 对象：
- 3D 模型节点使用 `DEFAULT` 层。
- UI 节点（Canvas）使用 `UI_2D` 层。
- Camera 的 `visibility` 同时包含 `DEFAULT` 和 `UI_2D`。
- 这种方式简单但 UI 和 3D 场景共享同一个 ClearFlags 和投影设置。

### 方式二：双相机分层渲染（推荐）

UI 相机和 3D 相机分开，各司其职：

| | 3D 场景相机 | UI 相机 |
|---|---|---|
| 投影模式 | `PERSPECTIVE` | `ORTHO` |
| Layer | `DEFAULT` | `UI_2D` |
| clearFlags | `SKYBOX` 或 `SOLID_COLOR` | `DEPTH_ONLY` 或 `DONT_CLEAR` |
| 渲染优先级 | 0（先渲染） | 1（后渲染，覆盖在 3D 之上） |

3D 相机先渲染场景到帧缓冲，UI 相机随后在之上渲染 UI（不清除颜色缓冲）。这样 3D 和 UI 各自有独立的 clearFlags 和投影设置。

### 方式三：渲染到纹理（RT）

3D 场景相机将输出渲染到 `targetTexture`，再由 UI 上的 Sprite 引用该纹理显示。详见 Camera API 卡片。

## 模型、材质和灯光的基础关系

### 材质受光的基本条件

要使一个模型在场景中正确显示光照效果，需要满足：

1. **场景中有光源**：至少一个 DirectionalLight（推荐）或其他类型光源。
2. **材质使用的 Effect 支持光照**：引擎内置的 `builtin-standard` Effect 默认支持 PBR 光照。如果使用了不处理光照的自定义 Effect，模型不会对场景中的光源产生反应。
3. **网格有合法法线数据**：法线错误会导致光照计算结果异常（部分面过暗或过亮）。
4. **模型节点在 Camera 的 visibility 范围内**。

### 光源类型选择

| 光源类型 | 强度衰减 | 方向性 | 阴影支持 | 场景数量限制 |
|---|---|---|---|---|
| DirectionalLight | 无衰减 | 由节点旋转决定 | 是 | 最多 1 个 |
| SphereLight | 平方反比衰减 | 全方向 | 暂不支持 | 不限 |
| SpotLight | 平方反比衰减 | 锥形方向 | 是 | 不限 |

### 环境光

场景根节点上的 `ambient` 组件（`SceneAmbient`）提供环境光设置：
- `SkyLightingColor`：天空颜色
- `SkyIllum`：环境光照亮度
- `GroundLightingColor`：地面反射光颜色

环境光均匀照亮所有物体，解决背光面全黑问题，可以配合 DirectionalLight 使用。需要在场景中选中根节点后在 Inspector 中配置 Ambient 属性。

## 常见排错入口

| 问题现象 | 排查方向 | 文档 |
|---|---|---|
| 3D 模型全黑 | 检查是否有光源、材质是否支持光照 | troubleshooting/3d-object-not-visible.md |
| 3D 模型不显示 | Camera 位置/朝向、near/far、Layer | troubleshooting/3d-object-not-visible.md |
| 部分模型看不到 | Layer 与 visibility 不匹配 | troubleshooting/3d-object-not-visible.md |
| 模型贴图显示异常 | 材质贴图设置、UV 坐标 | 无直接排错文档，查材质文档 |
| UI 显示异常 | Canvas / 双相机配置 | troubleshooting/ui-not-visible.md |
| 坐标转换错误 | Camera 投影类型、屏幕坐标 z 值 | troubleshooting/coordinate-conversion-wrong.md |
| 性能问题 | 模型面数、DrawCall、阴影设置 | troubleshooting/performance-issues.md |

## 关联文档

- [Camera API 卡片](../api-reference/camera.md)
- [DirectionalLight API 卡片](../api-reference/directional-light.md)
- [SphereLight API 卡片](../api-reference/sphere-light.md)
- [SpotLight API 卡片](../api-reference/spot-light.md)
- [3D 对象不可见排查](../troubleshooting/3d-object-not-visible.md)
- [场景、节点与组件模型](./scene-node-component-model.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景（节点 / 组件 / Layer / 光照 / 相机）
- 已交叉验证：cc-engine 3.8 公开类型声明
