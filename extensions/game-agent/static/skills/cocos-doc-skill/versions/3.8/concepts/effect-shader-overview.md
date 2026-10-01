---
id: cocos-3.8-concepts-effect-shader-overview
version: "3.8"
category: concepts
title: Effect / Shader 概念概览
keywords:
  - Effect
  - Shader
  - EffectAsset
  - Material
  - Pass
  - Property
  - Uniform
  - 着色器
  - 材质
  - 自定义材质
  - 合批
  - 变体
  - 宏
related_docs:
  - concepts/scene-node-component-model.md
  - ui-2d/draw-call-batching.md
  - ui-2d/sprite.md
  - api-reference/sprite.md
  - recipes/create-simple-effect.md
  - troubleshooting/shader-compile-failed.md
  - troubleshooting/material-breaks-batching.md
  - ui-2d/common-recipes.md
related_api:
  - EffectAsset
  - Material
  - Pass
  - renderer
source:
  official: "Cocos Creator 3.8 官方文档 - Shader (着色器) / 材质系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明 (EffectAsset, Material, Pass)"
    - "cc-engine 3.8 内置着色器源码 (builtin-unlit.effect, builtin-sprite.effect)"
  supplement:
    - "概念总结：EffectAsset 定义着色方案模板，Material 是该模板的实际参数实例"
    - "工程建议：仅修改颜色/纹理等参数时只操作 Material；需要定制渲染逻辑时才写 Effect"
status: draft
updated: 2026-06-17
---

# Effect / Shader 概念概览

## 用途

解释 Cocos Creator 3.8 中 EffectAsset（着色器）、Material（材质）、Shader（着色器代码）、Pass（渲染过程）、Property（属性）、Uniform（全局变量）之间的关系，帮助判断"什么时候只改 Material"和"什么时候需要写 Effect"。

## 核心结论

### 层级关系

Cocos Creator 3.8 的渲染管线中，各个概念按以下层级组织：

```
EffectAsset（.effect 文件）
  └─ Technique（渲染技术，如 opaque / transparent）
       └─ Pass（渲染过程，每个 Pass 指定 VS + FS）
            ├─ Shader Code（CCProgram 中的 GLSL 代码）
            ├─ Properties（声明可在 Material 面板编辑的属性）
            ├─ Pipeline States（深度测试、混合、剔除等）
            └─ Defines（宏定义开关）

Material（材质实例）
  └─ 引用一个 EffectAsset
  └─ 为 Properties 提供具体值（颜色、纹理等）
  └─ 控制 Defines 开启/关闭
```

- **EffectAsset（.effect 文件）**：可复用的着色方案模板，定义渲染技术和属性声明。存放在项目 `assets` 目录下的 `.effect` 文件即为 EffectAsset 资源。
- **Material（材质资源 .mtl）**：EffectAsset 的配置实例，引用一个 EffectAsset 并为它的属性提供实际值。一个 Material 可以关联到多个渲染组件。
- **Shader**：Effect 中的 GLSL 代码部分，通常写在 `CCProgram` 块中，包含顶点着色器和片元着色器的实现。
- **Pass**：一个 Technique 中的一次完整渲染过程，包含一个顶点着色器和一个片元着色器。一个 Technique 可以有多个 Pass 按序执行。
- **Property**：EffectAsset 中声明的可编辑属性（如颜色、纹理、数值滑块），会显示在 Material 的 Inspector 面板中。
- **Uniform**：Shader 代码中的全局变量声明，与 Property 通过名称或 `target` 字段关联。运行时引擎自动将 Material 中设置的属性值传递给对应的 Uniform。

### 什么时候只改 Material，什么时候需要写 Effect

| 场景 | 操作方式 |
|---|---|
| 只修改颜色、纹理、数值参数 | 直接修改 Material 属性（Inspector / `Material.setProperty`） |
| 需要组合不同的宏开关（如开启 USE_TEXTURE） | 在 Material Inspector 中勾选宏开关 |
| 需要完全不同的着色算法（如模型描边、溶解、扭曲） | 创建新的 `.effect` 文件，然后创建引用它的 Material |
| 需要新增一个可由 Material 控制的参数 | 修改 EffectAsset 的 `properties` 段 + 增加对应 Uniform |
| 要修混合模式、深度测试等渲染状态 | 在 Material Inspector 的 Pass 参数中改，或编辑 Effect 中 Pass 的状态配置 |

### 2D Sprite / 3D Mesh 的使用差异

| 维度 | 2D Sprite / UI | 3D Mesh |
|---|---|---|
| 默认 Shader | `builtin-sprite.effect`（2D）/ `builtin-standard.effect`（PBR 材质） | `builtin-standard.effect`（PBR） |
| 自定义材质方式 | Sprite 组件上的 `CustomMaterial` 属性，**最多一个** | `MeshRenderer.materials` 数组，支持多个材质 |
| 合批影响 | 使用自定义材质会打断 UI 合批 | 3D 合批依赖 `USE_INSTANCING` 或动态 VB 合并 |
| 共同点 | 都可以通过 `Material.setProperty` 运行时修改 | |

**2D 说明**：2D 渲染组件（Sprite、Label、Graphics 等）在未指定自定义材质时使用内置材质。一旦指定自定义材质，组件的渲染效果完全由自定义材质决定，且面板上的 `Grayscale` 属性会失效。详见官方文档"2D 渲染对象自定义材质"章节。

### Shader 变体和宏的影响

- Cocos Shader 的 `#define` 宏（如 `USE_TEXTURE`、`USE_COLOR`）会在编译时生成不同的 Shader 变体（Variant）。
- **包体影响**：每个宏组合产生一个独立的 Shader 变体，过多的宏组合会导致 Shader 编译产物体积显著增大。建议控制宏的总数和可能的组合数。
- **编译时间**：多个 Technique + 多个宏组合 = 大量变体，首次编译和构建时耗时增加。
- **运行时**：新的宏组合会在首次使用时才编译，可能导致短暂卡顿。
- 使用 `range` / `options` tag 声明的宏会将组合限制在声明范围内，有助于控制变体数量。详见官方文档"预处理宏定义"章节。

## 什么时候使用

- 需要理解 Effect / Material / Shader 的整体概念关系。
- 不确定是改 Material 就行还是必须写 Effect。
- 遇到 Shader 编译报错、合批被打断等问题需要定位时，先阅读本文理解基础概念。

## 关键 API / 组件

- `EffectAsset`：运行时表示 `.effect` 文件资源的类，通过 `cc.EffectAsset` 访问。
- `Material`：材质实例，通过 `new Material()` 创建或从 `.mtl` 资源加载。
- `Material.setProperty(name, value)`：设置材质属性值，名称需与 Effect 中声明的 Property 名或 Uniform 名一致。
- `Material.getProperty(name)`：获取材质属性值。
- `RenderableComponent.material` / `sharedMaterial`：获取材质实例或共享材质。
- `RenderableComponent.getMaterialInstance(index)`：获取指定索引的材质实例。

## 最小示例

```ts
import { _decorator, Component, Material, Sprite, MeshRenderer, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ShaderConceptDemo')
export class ShaderConceptDemo extends Component {
  @property(Material)
  myMaterial: Material | null = null;

  start() {
    // 2D 方式：通过 sprite.customMaterial 获取
    const sprite = this.getComponent(Sprite);
    if (sprite && sprite.customMaterial) {
      // 修改材质属性（Effect 中需声明同名 Property/Uniform）
      sprite.customMaterial.setProperty('mainColor', new Color(255, 0, 0, 255));
    }

    // 3D 方式：通过 MeshRenderer.material 获取
    const meshRenderer = this.getComponent(MeshRenderer);
    if (meshRenderer) {
      const mat = meshRenderer.material;
      if (mat) {
        mat.setProperty('mainColor', new Color(0, 255, 0, 255));
      }
    }
  }
}
```

## 常见错误

1. **直接在 `.effect` 文件中写材质参数**：EffectAsset 只定义"能调哪些参数"，具体数值由 Material 配置。
2. **混淆 Uniform 和 Property 的名称**：Property 的 `target` 字段指定它对应哪个 Uniform。如果名称不匹配，Material 设置的值无法传递给 Shader。
3. **2D 组件设置多个自定义材质**：2D 渲染组件最多支持一个自定义材质。
4. **忘记宏的默认值**：所有自定义宏默认值为 0（false），不能用 `#ifdef` 判断。
5. **乱贴 3D Shader 到 2D 组件**：2D 组件应使用 `builtin-sprite` 等 2D 专用 Shader，否则渲染可能异常。

## 关联文档

- [Sprite 图片显示组件](../ui-2d/sprite.md)
- [2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md)
- [创建简单 Effect 步骤](../recipes/create-simple-effect.md)
- [Shader 编译失败排查](../troubleshooting/shader-compile-failed.md)
- [材质破坏合批排查](../troubleshooting/material-breaks-batching.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 材质系统概述、着色器语法、YAML 101 与着色器示例
- 已交叉验证：cc-engine 3.8 公开类型声明（EffectAsset L28775, Material L29038）/ 内置着色器源码
- 补充：工程建议——EffectAsset 定义着色方案模板，Material 是该模板的具体参数实例
