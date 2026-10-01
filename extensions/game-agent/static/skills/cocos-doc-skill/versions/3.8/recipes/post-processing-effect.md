---
id: cocos-3.8-recipes-post-processing-effect
version: "3.8"
category: recipes
title: 相机添加后处理效果
keywords:
  - 后处理
  - Bloom
  - MSAA
  - FXAA
  - FSR
  - Shading Scale
  - Color Grading
  - LUT
  - Tone Mapping
  - BuiltinPipelineSettings
  - PostProcess
  - 抗锯齿
  - 泛光
  - 后效
related_docs:
  - concepts/render-pipeline-version-boundary.md
  - api-reference/camera.md
related_api:
  - BuiltinPipelineSettings
  - PostProcess
  - Camera
  - Material
source:
  official: "Cocos Creator 3.8 官方文档 - 后处理"
  verified-against: []
  supplement:
    - "工程经验：3.8.4+ 后处理统一在 BuiltinPipelineSettings 中配置，3.8.3- 使用 PostProcess 组件挂载子组件"
    - "BuiltinPipelineSettings 不在 cc 模块类型声明中公开导出，属于编辑器内置组件。编辑器中使用添加组件方式添加，不从 cc import。代码示例中的 import 写法在编译器层面可能报类型缺失错误"
  verified-against:
    - "cc-engine 3.8 公开类型声明 — BuiltinPipelineSettings 确认不在 cc 模块声明中"
    - "cc-engine 3.8 引擎源码 — BuiltinPipelineSettings 位于 editor/assets/default_renderpipeline/"
status: needs-review
updated: 2026-06-18
---

# 相机添加后处理效果

> **此文档标记为 needs-review**：渲染管线版本边界为 3.8.4，新旧后处理体系需严格区分。后处理表现与设备兼容性密切相关，需在目标平台测试验证。
>
> **新增冲突项**：`BuiltinPipelineSettings` 不在 `cc` 模块公开类型声明中公开导出。代码示例中 `import { BuiltinPipelineSettings } from 'cc'` 在编译器层面可能报类型缺失错误。实际使用应通过编辑器"添加组件"方式添加，再通过 `getComponent(BuiltinPipelineSettings)` 获取运行时实例。

## 目标

为场景相机添加后处理效果，包括 Bloom（泛光）、MSAA（多采样抗锯齿）、FXAA（快速近似抗锯齿）、Shading Scale（渲染缩放配合 FSR 上采样）、Color Grading（颜色分级）等。

> **前置阅读**：请先阅读 [渲染管线与后处理 — 版本边界](../concepts/render-pipeline-version-boundary.md)，确认当前项目使用的 Cocos Creator 小版本，选择对应的后处理配置方式。

## 3.8.4+ 推荐做法（新后处理体系）

Cocos Creator 3.8.4 及以上版本使用 `BuiltinPipelineSettings` 组件统一配置后处理。

### 操作步骤

1. **选中 Camera 节点**：在场景层级管理器中选中要添加后处理的 Camera 节点。
2. **添加 `BuiltinPipelineSettings` 组件**：在 Inspector 中点击 **添加组件** → 搜索或选择 `BuiltinPipelineSettings`。
3. **配置后处理参数**：

#### MSAA 多采样抗锯齿

```
BuiltinPipelineSettings.antialiasing:
  msaa: 2x 或 4x
```

- 可选值：`NONE`、`MSAA_2X`、`MSAA_4X`。
- **仅原生平台（iOS / Android 原生构建）生效**，Web 平台无效。
- MSAA 会增加 GPU 负载，移动端建议使用 2x。

#### Shading Scale（渲染缩放）

```
BuiltinPipelineSettings.shadingScale: 0.5  ~  1.0
```

- 取值范围 0~1。例：`0.5` 表示内部分辨率降为 50%，配合 FSR 上采样回原始分辨率。
- 在性能受限的设备上推荐先调低 Shading Scale，再开启 FSR 补偿画质。
- 值过低（< 0.5）会导致画面模糊严重，需配合 FSR 使用。

#### FSR（AMD FidelityFX Super Resolution）

```
BuiltinPipelineSettings.fsr.enabled: true
BuiltinPipelineSettings.fsr.sharpness: 0.5  // 锐度，范围 0~1
```

- FSR 在 Shading Scale < 1.0 时效果最明显。
- `sharpness` 控制 FSR 输出图像的锐利程度，值越高图像边缘越锐利。

#### Bloom 泛光

```
BuiltinPipelineSettings.bloom.enabled: true
BuiltinPipelineSettings.bloom.iterations: 3  // 迭代次数
BuiltinPipelineSettings.bloom.threshold: 1.0  // 亮度阈值
BuiltinPipelineSettings.bloom.intensity: 1.0  // 强度
```

- **Threshold**：只有亮度超过此值的像素才会产生 Bloom 效果。调高可减少 Bloom 范围，只保留高亮区域的泛光。
- **Iterations**：迭代次数越多 Bloom 扩散越平滑，但性能开销也越大。推荐 2~4。
- **Intensity**：Bloom 整体强度。

#### Color Grading（颜色分级）

```
BuiltinPipelineSettings.colorGrading.enabled: true
BuiltinPipelineSettings.colorGrading.lutTexture: <LUT 贴图资源>
```

- 使用 LUT（Look-Up Table）贴图进行颜色映射调色。
- LUT 贴图建议尺寸 16x16 或 32x32，格式为 PNG。
- 可以在外部图像编辑软件（Photoshop、DaVinci Resolve 等）中制作 LUT，再导入项目。

#### FXAA 快速抗锯齿

```
BuiltinPipelineSettings.fxaa.enabled: true
```

- FXAA 在所有平台（Web、原生、小游戏）上均可用。
- 性能开销较低，适合移动端。
- 与 MSAA 可同时开启，但一般推荐选择其中一种即可。

#### Tone Mapping（色调映射）

```
BuiltinPipelineSettings.toneMapping.enabled: true
BuiltinPipelineSettings.toneMapping.type: <tone mapping 类型>
```

- 将 HDR 渲染结果映射到 LDR 输出范围。
- 类型通常可选择标准模式或电影模式。

## 3.8.3- 旧后处理（仅作参考）

Cocos Creator 3.8.3 及以下版本使用 `PostProcess` 组件 + 子后效组件的方式。以下为旧版配置方式，仅供参考。

### 操作步骤

1. **选中 Camera 节点**。
2. **添加 `PostProcess` 组件**：Inspector → 添加组件 → `PostProcess`。
3. **添加子后效组件**：在 Inspector 中的 `PostProcess` 组件上点击添加子项，可选择：
   - `Bloom` — 泛光效果
   - `TAA` — 时序抗锯齿
   - `FSR` — AMD FidelityFX Super Resolution
   - `FXAA` — 快速近似抗锯齿
   - `Color Grading` — 颜色分级（LUT 方式）
   - `HBAO` — 水平基准环境光遮蔽
4. **配置参数**：每个子后效组件有自己的参数面板，按需调整。

> **注意**：旧版后效执行顺序由引擎内部决定，组件挂载顺序不影响渲染顺序。

## 完整示例代码

以下示例演示在 3.8.4+ 项目中通过脚本开关 Bloom 并调整其参数：

```ts
import { _decorator, Component, Camera, BuiltinPipelineSettings } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PostProcessControl')
export class PostProcessControl extends Component {
    @property({ type: Camera })
    private targetCamera: Camera | null = null;

    private _pipelineSettings: BuiltinPipelineSettings | null = null;

    start() {
        if (!this.targetCamera) {
            this.targetCamera = this.getComponent(Camera);
        }
        if (!this.targetCamera) return;

        // 获取 BuiltinPipelineSettings 组件
        this._pipelineSettings = this.targetCamera.getComponent(BuiltinPipelineSettings);
        if (!this._pipelineSettings) {
            console.warn('未找到 BuiltinPipelineSettings 组件，请先添加到 Camera 节点');
            return;
        }
    }

    /**
     * 切换 Bloom 效果开关
     */
    toggleBloom(enable: boolean) {
        if (!this._pipelineSettings) return;
        this._pipelineSettings.bloom.enabled = enable;
    }

    /**
     * 设置 Bloom 参数
     */
    setBloomParams(threshold: number, intensity: number, iterations: number) {
        if (!this._pipelineSettings?.bloom.enabled) return;
        this._pipelineSettings.bloom.threshold = threshold;
        this._pipelineSettings.bloom.intensity = intensity;
        this._pipelineSettings.bloom.iterations = iterations;
    }

    /**
     * 设置渲染缩放比例
     */
    setShadingScale(scale: number) {
        if (!this._pipelineSettings) return;
        this._pipelineSettings.shadingScale = Math.max(0.1, Math.min(1.0, scale));
    }

    /**
     * 切换 MSAA 级别（仅原生生效）
     */
    setMSAA(level: 'NONE' | 'MSAA_2X' | 'MSAA_4X') {
        if (!this._pipelineSettings) return;
        this._pipelineSettings.antialiasing.msaa = level;
    }
}
```

## 操作步骤摘要

1. 确认 Cocos Creator 小版本号。
2. 选中场景中的 Camera 节点。
3. 根据版本添加对应组件：
   - **3.8.4+**：添加 `BuiltinPipelineSettings`
   - **3.8.3-**：添加 `PostProcess` + 子后效组件
4. 按需求配置后处理参数（Bloom、MSAA、FxAA、FSR、Shading Scale、Color Grading、Tone Mapping）。
5. 运行预览查看效果。

## 验证方式

- 运行后画面出现对应的后处理效果（Bloom 泛光高亮区域、MSAA 边缘更平滑、FSR 上采样画面等）。
- 控制台无渲染相关错误日志。
- 调整 Bloom Intensity / Threshold 参数后画面效果实时变化。

## 后处理不生效排查

| 现象 | 排查方向 |
|---|---|
| 组件找不到/添加失败 | 确认 Cocos Creator 版本：3.8.4+ 用 `BuiltinPipelineSettings`，3.8.3- 用 `PostProcess` |
| MSAA 不生效 | MSAA **仅原生平台（iOS/Android 原生构建）生效**，Web 平台应使用 FXAA 或 WebGL antialias |
| Bloom 调整后无变化 | 检查 Bloom.enabled 是否开启、Threshold 是否设置过高导致所有像素被过滤 |
| Shading Scale 无效果 | 检查值范围是否为 0~1 |
| FSR 画面变形 | 检查 Shading Scale 是否 < 1.0；FSR 需要低分辨率输入才能工作 |
| 后处理整体无效果 | 确认 Camera 已启用（enabled = true）、后处理组件已正确挂载 |
| 颜色分级 LUT 不生效 | 确认 LUT 贴图已导入项目且被 Color Grading 正确引用 |
| Web 平台 Bloom 开销大 | Web 平台某些后效性能开销大，考虑减少 Bloom Iterations 或关闭不必要后效 |
| Shader 相关报错 | 检查 Shader 宏是否正确定义，查看控制台渲染相关错误 |

## 平台差异汇总

| 功能 | 原生平台 | Web 平台 | 小游戏平台 |
|---|---|---|---|
| MSAA | 支持（2x/4x） | 不支持（使用 WebGL antialias） | 不支持 |
| FXAA | 支持 | 支持 | 支持 |
| Bloom | 支持 | 支持（性能开销大） | 支持（性能开销大） |
| FSR | 支持 | 支持 | 支持 |
| Shading Scale | 支持 | 支持 | 支持 |
| Color Grading (LUT) | 支持 | 支持 | 支持 |
| Tone Mapping | 支持 | 支持 | 支持 |

## 相关文档

- [渲染管线与后处理 — 版本边界](../concepts/render-pipeline-version-boundary.md)
- [Camera API 卡片](../api-reference/camera.md)
- [Material API 卡片](../api-reference/material.md)
- [3D 场景渲染基础](../concepts/3d-scene-rendering.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 后处理
- 工程经验：渲染管线版本差异大，后处理与设备兼容性密切相关，需确认目标平台后再配置
