---
id: cocos-3.8-concepts-render-pipeline-version-boundary
version: "3.8"
category: concepts
title: 渲染管线与后处理 — 版本边界
keywords:
  - 渲染管线
  - 可定制渲染管线
  - CRP
  - BuiltinPipelineSettings
  - PostProcess
  - 后处理
  - Bloom
  - MSAA
  - FXAA
  - FSR
  - Shading Scale
  - Color Grading
  - LUT
  - Tone Mapping
  - 3.8.4
  - 版本边界
  - 内置管线
related_docs:
  - api-reference/material.md
  - concepts/effect-shader-overview.md
  - api-reference/camera.md
  - concepts/3d-scene-rendering.md
  - recipes/post-processing-effect.md
related_api:
  - BuiltinPipelineSettings
  - PostProcess
  - Camera
  - Material
source:
  official: "Cocos Creator 3.8 官方文档 - 渲染管线 / 后处理"
  verified-against: []
  supplement:
    - "工程经验：渲染管线版本边界是 3.8.3 与 3.8.4，新旧后处理体系完全不同，不可混用"
    - "BuiltinPipelineSettings 不在 cc 模块类型声明中公开导出，属于编辑器内置组件。编辑器中使用添加组件方式添加"
  verified-against: []
status: needs-review
updated: 2026-06-18
---

# 渲染管线与后处理 — 版本边界

## 用途

明确 Cocos Creator 3.8 不同小版本的渲染管线体系差异，正确选择后处理配置方式，避免将 3.8.4+ 的后处理 API 套用到 3.8.3 及以下项目，反之亦然。

> **重要提示**：本主题涉及版本敏感行为，默认 `needs-review`。请在继续操作前**确认当前项目使用的 Cocos Creator 小版本号**。
>
> **注意：`BuiltinPipelineSettings` 不在 `cc` 模块类型声明中公开导出，属于编辑器内置组件。所有代码引用和组件操作都应通过编辑器 UI 完成。**

## 核心版本边界

Cocos Creator 3.8 系列在 **3.8.4** 版本引入了渲染管线体系的重构。以下为版本分界：

### Cocos Creator 3.8.3 及以下（旧版）

- 使用**旧可定制渲染管线（Customable Render Pipeline, CRP）**。
- 自定义管线及相关文档入口为旧版 `custom-pipeline`。
- 后处理通过 Camera 节点上的 **`PostProcess` 组件**实现。
- 如果你接手的是 3.8.3 或更早版本创建的项目，且未主动升级渲染管线，请使用旧版 API。

### Cocos Creator 3.8.4 及以上（新版）

- 引入**新渲染管线体系**，内置管线基于 CRP 构建，但抽象层次更高。
- **新项目默认使用新管线**。
- **旧项目升级**到 3.8.4+ 时：
  - 保持原管线配置不变。
  - 但旧自定义管线会**自动切换到新管线体系**，无需手动迁移。
- 后处理不再使用独立的 `PostProcess` 组件，改为在 Camera 节点上添加 **`BuiltinPipelineSettings` 组件**。

## 后处理体系对比

### 3.8.4+ 新后处理（BuiltinPipelineSettings）

Camera 节点添加 `BuiltinPipelineSettings` 组件后，可配置以下后处理效果：

| 功能 | 配置方式 | 说明 |
|---|---|---|
| **MSAA** | 多采样抗锯齿（2x / 4x） | **仅原生平台生效**，Web 平台不支持 |
| **Shading Scale** | 范围 0~1 | 降低内部分辨率后通过 FSR 上采样，提升性能 |
| **Bloom** | Iterations / Threshold / Intensity | 泛光效果，控制迭代次数、亮度阈值和强度 |
| **Color Grading** | LUT 贴图 | 基于查找表（Look-Up Table）的颜色映射调色 |
| **FXAA** | 快速近似抗锯齿 | 快速抗锯齿，所有平台可用 |
| **FSR** | AMD FidelityFX Super Resolution | 配合 Shading Scale 使用，低分辨率渲染后高质量上采样 |
| **Tone Mapping** | 色调映射 | 将 HDR 颜色映射到 LDR 输出范围 |

配置方式：选中场景中的 Camera 节点 → Inspector → 添加组件 → `BuiltinPipelineSettings` → 按需勾选并配置参数。

### 3.8.3- 旧后处理（PostProcess）

Camera 节点添加 `PostProcess` 组件，然后挂载子后效组件：

| 子组件 | 说明 |
|---|---|
| Bloom | 泛光效果 |
| TAA | 时序抗锯齿（Temporal Anti-Aliasing） |
| FSR | AMD FidelityFX Super Resolution |
| FXAA | 快速近似抗锯齿 |
| Color Grading | 颜色分级（LUT 方式） |
| HBAO | 水平基准环境光遮蔽 |

后效执行顺序由引擎内部决定，组件挂载顺序不影响渲染顺序。

配置方式：选中 Camera 节点 → Inspector → 添加组件 → `PostProcess` → 在 `PostProcess` 组件上添加子后效组件 → 配置参数。

## 何时退回基础文档

以下场景无需涉及渲染管线版本边界，直接使用对应基础文档：

| 场景 | 文档入口 |
|---|---|
| 简单材质/颜色修改 | `api-reference/material.md` |
| Shader 编写 | `concepts/effect-shader-overview.md` |
| 相机设置（视角、裁剪、投影） | `api-reference/camera.md` |
| 灯光配置 | 灯光相关 API 卡片（DirectionalLight / SphereLight / SpotLight） |
| 3D 渲染基础（Camera / Light / MeshRenderer 协作） | `concepts/3d-scene-rendering.md` |

## 关键注意事项

- **不要混用**：不要把 3.8.4+ 的后处理方式（`BuiltinPipelineSettings`）套用到 3.8.3 及以下项目；反之亦然。混用会导致组件找不到、运行时报错。
- **版本确认**：在编辑器顶部菜单栏 **Cocos Creator → 关于 Cocos Creator** 或编辑器启动时的欢迎页确认当前版本号。
- **升级旧项目**：如果从 3.8.3- 升级到 3.8.4+，旧自定义管线自动迁移。如果需要使用新后处理 API，移除 Camera 上的 `PostProcess` 组件，替换为 `BuiltinPipelineSettings`。
- **MSAA 仅原生**：MSAA 在 Web 平台无效，Web 平台应使用 WebGL 的 antialias 属性或 FXAA。
- **Shading Scale + FSR**：配合使用时，Shading Scale 降低渲染分辨率，FSR 负责高质量上采样回原始分辨率。适用于性能受限的设备。

## 排错入口

| 现象 | 排查方向 |
|---|---|
| 后处理组件找不到 | 检查 Cocos Creator 版本与后处理 API 是否匹配 |
| `PostProcess` 组件无法添加 | 项目版本 >= 3.8.4，应使用 `BuiltinPipelineSettings` |
| `BuiltinPipelineSettings` 找不到 | 项目版本 < 3.8.4，应使用 `PostProcess` |
| MSAA 不生效 | 确认运行在原生平台（iOS/Android），Web 平台 MSAA 无效 |
| 后处理参数不生效 | 检查 Shader 宏定义、控制台渲染相关错误、平台兼容性 |

## 关联文档

- [相机添加后处理效果 Recipe](../recipes/post-processing-effect.md)
- [Material API 卡片](../api-reference/material.md)
- [Camera API 卡片](../api-reference/camera.md)
- [Effect / Shader 概念概览](./effect-shader-overview.md)
- [3D 场景渲染基础](./3d-scene-rendering.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 渲染管线 / 后处理
- 工程经验：渲染管线版本边界为 3.8.4，新旧后处理体系需严格区分
