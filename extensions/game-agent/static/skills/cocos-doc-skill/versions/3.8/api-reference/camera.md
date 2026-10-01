---
id: cocos-3.8-api-reference-camera
version: "3.8"
category: api-reference
title: Camera
keywords:
  - Camera
  - 相机
  - 摄像机
  - camera跟随
  - 屏幕坐标转世界坐标
  - 相机裁剪
  - camera priority
  - 相机渲染顺序
  - 多相机
  - ClearFlags
  - visibility
  - Layer
  - RenderTexture
  - targetTexture
  - camera rect
  - 画中画
  - 小地图
  - UI相机
  - 后处理
related_docs:
  - recipes/camera-follow-target.md
  - troubleshooting/coordinate-conversion-wrong.md
  - recipes/screen-adaptation.md
  - concepts/camera-rendering-stack.md
related_api:
  - Camera
  - Canvas
  - RenderTexture
  - Component
  - director
  - Vec3
  - Node
  - Layers
source:
  official: "Cocos Creator 3.8 官方文档 - 相机"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-18
---

# Camera

## 用途

Camera（别称 CameraComponent）是控制场景渲染视角的核心组件。每个场景至少需要一个 Camera 才能看到渲染内容。Camera 决定了哪些节点被渲染（通过 visibility / Layer）、以什么视角渲染（正交/透视）、以及裁剪范围（near/far）。

## 公开导出结论

- `Camera` 在 `cc` 模块以 `export class Camera extends Component` 公开导出。
- 在 `cc` 模块中也通过 `CameraComponent` 别名导出（两者相同）。
- 公开属性包含：`priority`、`clearFlags`、`clearColor`、`visibility`、`rect`、`targetTexture`、`projection`、`fov`、`fovAxis`、`orthoHeight`、`nearClip`、`farClip`、`screenScale`、`usePostProcess`、`renderPipeline` 等。
- 公开方法：`screenToWorld(screenPoint, out)`、`worldToScreen(worldPoint, out)`、`screenPointToRay(x, y, out)`。
- 静态属性：`Camera.main`（获取场景当前激活的主相机）。
- 静态枚举：`Camera.ClearFlag`（SKYBOX / SOLID_COLOR / DEPTH_ONLY / DONT_CLEAR）、`Camera.ProjectionType`（ORTHO / PERSPECTIVE）、`Camera.FOVAxis`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `priority` | 渲染优先级（数值越小越先渲染） | 控制多相机绘制顺序 |
| `clearFlags` | 清除标志（SKYBOX / SOLID_COLOR / DEPTH_ONLY / DONT_CLEAR） | 设置背景清除方式 |
| `clearColor` | 清除颜色（当 clearFlags 为 SKYBOX 时无效） | 设置背景色 |
| `projection` | 投影类型（`Camera.Projection.ORTHO` / `Camera.Projection.PERSPECTIVE`） | 2D 正交 / 3D 透视切换 |
| `visibility` | 可见性掩码（决定哪些 Layer 的节点被该相机渲染） | 筛选渲染对象 |
| `rect` | 屏幕视口（x, y, width, height，归一化 0-1） | 画中画、分屏 |
| `nearClip` | 近裁剪面距离 | 近距离裁剪控制 |
| `farClip` | 远裁剪面距离 | 远距离裁剪控制 |
| `orthoHeight` | 正交投影的视口高度的一半（仅 ORTHO 模式） | 2D 相机缩放 |
| `fov` | 视角大小（弧度，仅 PERSPECTIVE 模式） | 3D 相机视野宽度 |
| `fovAxis` | FOV 轴向（VERTICAL / HORIZONTAL） | 控制 FOV 基于哪一轴 |
| `targetTexture` | 渲染目标纹理（为空时渲染到屏幕） | 渲染到纹理（RT） |
| `screenScale` | 内部缓冲尺寸缩放值，1 为与 canvas 相同 | 降低分辨率以提升性能 |
| `renderPipeline` | 渲染管线引用（只读） | 渲染管线配置 |

### 投影模式选择

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `camera.screenToWorld(screenPoint, out)` | 屏幕坐标转世界坐标 | 点击屏幕获取 3D 坐标 |
| `camera.worldToScreen(worldPoint, out)` | 世界坐标转屏幕坐标 | 3D 坐标映射到屏幕位置用于 UI 显示 |
| `camera.convertScreenUAToWorld(screenUAPoint, out)` | UI 坐标系屏幕点转世界坐标 | UI 交互到世界坐标转换 |

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 相机
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
