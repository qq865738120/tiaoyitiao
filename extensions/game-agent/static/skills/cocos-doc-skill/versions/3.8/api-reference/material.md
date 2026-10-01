---
id: cocos-3.8-api-reference-material
version: "3.8"
category: api-reference
title: Material
keywords:
  - Material
  - 材质
  - EffectAsset
  - setProperty
  - 材质实例
  - 共享材质
  - 材质资源
related_docs:
  - api-reference/effect-asset.md
  - api-reference/mesh-renderer.md
  - recipes/change-material-property.md
  - troubleshooting/material-not-updated.md
related_api:
  - Material
  - EffectAsset
  - IMaterialInfo
  - Renderer.sharedMaterials
  - Renderer.materials
  - MaterialInstance
source:
  official: "Cocos Creator 3.8 官方文档 - 材质系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-17
---

# Material

## 用途

`Material` 是材质资源类，继承自 `Asset`。材质定义了渲染一个物体时使用的 Shader（通过 EffectAsset）、Shader 宏定义（defines）、Uniform 参数值和管线状态（pass overrides）。材质是 EffectAsset 到渲染组件的桥梁——EffectAsset 描述了 Shader 程序，Material 提供了具体的参数实例化。

## 所属模块

```ts
import { Material } from 'cc';
```

## 公开导出结论

- `Material` 在 `cc` 模块以 `export class Material extends Asset` 公开导出（L29038）。
- 构造参数 `IMaterialInfo` 包含 `effectAsset`/`effectName`、`technique`、`defines`、`states` 四个字段。
- 公开只读属性：`effectAsset`、`effectName`、`technique`、`passes`、`hash`、`parent`、`owner`。
- 公开方法：`initialize(info)`、`reset(info)`、`destroy()`、`recompileShaders(overrides)`、`overridePipelineStates(overrides)`、`onLoaded()`、`resetUniforms(clearPasses?)`、`setProperty(name, val, passIdx?)`、`getProperty(name, passIdx?)`、`copy(mat, overrides?)`。
- `MaterialInstance`（L13476）在 `renderer` 命名空间以 `MaterialInstance extends Material` 导出，代表组件拥有的独立材质实例。
- 静态方法：`Material.getHash(material)`。

## 常用属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `effectAsset` | `EffectAsset \| null` | 当前使用的 EffectAsset，只读 |
| `effectName` | `string` | 当前 EffectAsset 名，只读 |
| `technique` | `number` | 当前 technique 索引，只读 |
| `passes` | `renderer.Pass[]` | 当前正在使用的 Pass 数组，只读 |
| `hash` | `number` | 材质 hash，只读 |
| `parent` | `Material \| null` | 父材质（材质实例时返回原始材质），只读 |
| `owner` | `Renderer \| null` | 该材质归属的渲染组件，只读 |

## 常用方法

| 方法 | 说明 |
|------|------|
| `initialize(info: IMaterialInfo)` | 根据所给信息初始化材质 |
| `reset(info: IMaterialInfo)` | 使用指定信息重置材质 |
| `setProperty(name, val, passIdx?)` | 设置材质 uniform 参数的统一入口 |
| `getProperty(name, passIdx?)` | 获取指定 uniform 值 |
| `copy(mat, overrides?)` | 复制目标材质到当前实例 |
| `recompileShaders(overrides, passIdx?)` | 重新编译 Shader（仅材质实例可用） |
| `overridePipelineStates(overrides, passIdx?)` | 重载管线状态（仅材质实例可用） |
| `resetUniforms(clearPasses?)` | 重置所有 uniform 为 EffectAsset 默认值 |

## Material 与 EffectAsset 的关系

- **EffectAsset** 是 Shader 程序的资源载体，定义了一组 technique（每个 technique 包含多个 pass）、uniform 声明和默认值。
- **Material** 引用一个 EffectAsset，并将具体的 uniform 值、宏定义、管线状态写入到每个 pass 中，形成可渲染的材质。
- 一个 EffectAsset 可以被多个 Material 引用；同一个 Material 可以被多个 Renderer 组件共享。
- `material.effectAsset` 返回当前 Material 引用的 EffectAsset；`material.effectName` 返回 EffectAsset 名称。

## Shared Material 与 Material Instance 的边界

- **共享材质（shared material）**：通过 `Renderer.sharedMaterials` 或 `Renderer.setSharedMaterial()` 设置。修改共享材质会影响所有使用同一材质资源的组件实例，适用于不希望每个组件拥有独立材质副本的场景。
- **材质实例（material instance）**：通过 `Renderer.materials`、`Renderer.material`、`Renderer.getMaterialInstance()` 访问时自动创建。材质实例是 `renderer.MaterialInstance` 类型，继承自 `Material`，但修改只影响当前组件实例。创建材质实例会影响合批。
- 默认情况下渲染组件使用共享材质，材质实例不会自动创建。仅在用户通过 `material`/`materials`/`getMaterialInstance()` 接口获取时才创建材质实例。
- 材质实例的 `parent` 指向原始共享材质，`owner` 指向所属渲染组件。

## 高频代码

### 创建并初始化新材质

```ts
import { Material, EffectAsset } from 'cc';

const mat = new Material();
mat.initialize({
  effectName: 'builtin-standard',
  defines: { USE_INSTANCING: true },
});
```

### 修改材质属性（推荐用于运行时一次性设置）

```ts
import { MeshRenderer, Color } from 'cc';

// 获取 MeshRenderer 的材质实例，修改不会影响其他组件
const renderer = this.getComponent(MeshRenderer);
const matInst = renderer!.material; // 自动创建材质实例
matInst!.setProperty('mainColor', new Color(255, 0, 0, 255));
matInst!.setProperty('mainTexture', someTexture);
```

### 每帧更新 uniform（高性能方案）

```ts
import { Vec4 } from 'cc';

const pass = mat!.passes[0];
const handle = pass.getBinding('albedo');
pass.setUniform(handle, new Vec4(1, 0, 0, 1));
```

### 复制材质并覆写

```ts
import { Material } from 'cc';

const newMat = new Material();
newMat.copy(existingMat, { effectName: 'builtin-standard' });
```

### 材质实例创建方法

```ts
import { renderer } from 'cc';

const matInst = new renderer.MaterialInstance({
  parent: sharedMaterial,
  owner: rendererComponent,
  subModelIdx: 0,
});
```

## 常见错误

**属性设置不生效**：使用 `setProperty` 时属性名必须与 Effect 中 uniform 声明完全匹配（包括大小写），否则不会报错但不会生效。

**属性名不匹配 Shader 声明**：`setProperty` 的第一个参数是 uniform 名称，不是 JS 字段名。需要查看 EffectAsset 的 Shader 源码中 uniform 块的定义。

**运行时新实例的影响**：通过 `renderer.material` 或 `getMaterialInstance()` 获取材质实例后，渲染组件会使用材质实例而非共享材质。如果节点数量多，大量材质实例会导致合批失败（每个实例生成不同的 Pass 对象），增加 DrawCall。

**直接修改 `passes` 内部对象**：`passes` 数组只读返回，不应直接修改内部 Pass 对象。修改 uniform 应使用 `setProperty` 或 `Pass.setUniform`。

**材质实例上调用 `initialize`/`reset`**：材质实例（`MaterialInstance`）继承自 `Material`，但 `initialize`/`reset` 方法不可在材质实例上调用。应当使用 `setProperty` 或 `recompileShaders`/`overridePipelineStates` 修改。

## 关联任务

- 熟悉 EffectAsset 概念：`api-reference/effect-asset.md`
- 3D 模型材质操作：`api-reference/mesh-renderer.md`
- 运行时修改材质属性：`recipes/change-material-property.md`
- 材质修改不更新排查：`troubleshooting/material-not-updated.md`

## 来源

- cc-engine 3.8 公开类型声明
- Cocos Creator 3.8 官方文档 - 材质系统
