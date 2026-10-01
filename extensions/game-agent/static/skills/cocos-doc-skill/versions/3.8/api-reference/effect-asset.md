---
id: cocos-3.8-api-reference-effect-asset
version: "3.8"
category: api-reference
title: EffectAsset
keywords:
  - EffectAsset
  - Effect
  - 特效资源
  - Shader
  - 着色器
  - 材质
  - 材质资源
  - technique
  - pass
  - shader
related_docs:
  - api-reference/material.md
  - api-reference/mesh-renderer.md
  - recipes/change-material-property.md
  - troubleshooting/material-not-updated.md
related_api:
  - EffectAsset
  - Material
  - IMaterialInfo
  - EffectAsset.ITechniqueInfo
  - EffectAsset.IPassInfo
  - EffectAsset.IShaderInfo
source:
  official: "Cocos Creator 3.8 官方文档 - 材质系统 - Effect 资源"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-17
---

# EffectAsset

## 用途

`EffectAsset` 是 Effect 资源类，继承自 `Asset`。Effect 是 Cocos Creator 的 Shader 组织和管理的核心概念，它定义了一组渲染技术（technique），每个 technique 包含多个渲染 Pass，每个 Pass 包含 Shader 程序、管线状态、Uniform 声明和默认值。Material 需要引用 EffectAsset 才能完成初始化并参与渲染。

## 所属模块

```ts
import { EffectAsset } from 'cc';
```

## 公开导出结论

- `EffectAsset` 在 `cc` 模块以 `export class EffectAsset extends Asset` 公开导出（L28775）。
- 静态方法：`register(asset)`、`remove(asset)`、`get(name)`、`getAll()`。
- 实例属性：`techniques`（`ITechniqueInfo[]`）、`shaders`（`IShaderInfo[]`）、`combinations`（`IPreCompileInfo[]`）、`hideInEditor`。
- 实例方法：`onLoaded()`、`destroy()`、`initDefault()`、`validate()`。
- 命名空间 `EffectAsset` 包含大量接口类型：`IPropertyInfo`、`IPassStates`、`IPassInfo`、`ITechniqueInfo`、`IShaderInfo`、`IPreCompileInfo` 等。

## 常用属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `techniques` | `ITechniqueInfo[]` | 当前 Effect 的所有可用 technique |
| `shaders` | `IShaderInfo[]` | 当前 Effect 使用的所有 Shader |
| `combinations` | `IPreCompileInfo[]` | 每个 Shader 需要预编译的宏定义组合 |
| `hideInEditor` | `boolean` | 是否在编辑器内隐藏 |

## 静态方法

| 方法 | 说明 |
|------|------|
| `EffectAsset.register(asset)` | 将 EffectAsset 注册到全局管理器 |
| `EffectAsset.remove(asset)` | 从全局管理器移除指定 EffectAsset |
| `EffectAsset.get(name)` | 根据名称获取 EffectAsset，返回 `EffectAsset \| null` |
| `EffectAsset.getAll()` | 获取所有已注册的 EffectAsset，返回 `Record<string, EffectAsset>` |

## Material 与 EffectAsset 的关系

- **EffectAsset** 是 Shader 程序的资源定义，不包含具体的 uniform 值或宏开关。
- **Material** 引用一个 EffectAsset，并在初始化时传入 `effectName` 或 `effectAsset` 引用，将具体的 uniform 值、宏定义和管线状态实例化到每个 Pass 中。
- 一个 EffectAsset 可以被多个 Material 引用，每个 Material 提供不同的 uniform 参数值。
- Material 的 `initialize()` 和 `reset()` 方法接收 `IMaterialInfo` 参数，其中 `effectName` 或 `effectAsset` 至少需要指定一个。
- 内置 EffectAsset 包括 `builtin-standard`（PBR 材质）、`builtin-unlit`（无光照材质）等。
- 编辑器中的 `.effect` 文件加载后即生成 EffectAsset 资源。

## 获取和加载 EffectAsset

### 通过名称获取已注册的 EffectAsset

```ts
import { EffectAsset } from 'cc';

const effect = EffectAsset.get('builtin-standard');
if (effect) {
  console.log('techniques count:', effect.techniques.length);
}
```

### 通过 resources.load 加载自定义 Effect

```ts
import { resources, EffectAsset } from 'cc';

resources.load('materials/my-effect', EffectAsset, (err, asset) => {
  if (err) {
    console.error('加载 Effect 失败:', err);
    return;
  }
  // 使用 asset 创建 Material
  const mat = new Material();
  mat.initialize({ effectAsset: asset });
});
```

### 在 IMaterialInfo 中通过名称引用

```ts
import { Material } from 'cc';

const mat = new Material();
mat.initialize({
  effectName: 'builtin-standard', // 通过名称引用已注册的 EffectAsset
  defines: { USE_INSTANCING: true },
});
```

## EffectAsset 内部结构

```ts
// technique 示例结构
interface ITechniqueInfo {
  passes: IPassInfo[];
  name?: string;
}

// pass 示例结构
interface IPassInfo extends IPassStates {
  program: string;                   // Shader 程序名
  embeddedMacros?: MacroRecord;      // 嵌入宏
  propertyIndex?: number;
  properties?: Record<string, IPropertyInfo>; // uniform 属性声明
}
```

## 高频代码

### 列出所有已注册的 Effect

```ts
import { EffectAsset, Material } from 'cc';

const allEffects = EffectAsset.getAll();
Object.keys(allEffects).forEach(name => {
  console.log(`Effect: ${name}`);
});
```

### 使用 EffectAsset 初始化材质

```ts
import { EffectAsset, Material } from 'cc';

const effect = EffectAsset.get('builtin-standard');
if (effect) {
  const mat = new Material();
  mat.initialize({
    effectAsset: effect,
    technique: 0,
  });
}
```

## 常见错误

**直接使用未被注册的 Effect 名称**：自定义 Effect 需要先加载（通过 `resources.load` 或 Asset Bundle），加载完成后自动注册。在 Effect 加载完成前使用 `effectName` 初始化 Material 会导致初始化失败。

**误解 EffectAsset 与自定义 Shader 的关系**：EffectAsset 是 `.effect` 资源的运行时表示。要编写自定义 Shader，需要在编辑器中创建 `.effect` 文件（使用 Cocos 的 YAML 元数据 + GLSL 格式），构建后自动生成 EffectAsset。不能直接使用原生 GLSL 代码创建 EffectAsset。

**错误地认为 `effectName` 是文件路径**：`effectName` 是 Effect 的名称，不是 `.effect` 文件的路径。内置 Effect 的名称是 `builtin-standard`、`builtin-unlit` 等。自定义 Effect 的名称在 `.effect` 文件的 YAML 头部定义。

**手动注册/取消注册导致状态不一致**：`EffectAsset.register()` 和 `EffectAsset.remove()` 是引擎内部使用的静态管理方法，不建议外部手动调用，可能导致全局状态不一致。

## 关联任务

- 理解 Material 如何引用 EffectAsset：`api-reference/material.md`
- 运行时修改材质属性：`recipes/change-material-property.md`
- 材质问题排查：`troubleshooting/material-not-updated.md`

## 来源

- cc-engine 3.8 公开类型声明
- Cocos Creator 3.8 官方文档 - 材质系统
