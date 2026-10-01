---
id: cocos-3.8-api-reference-mesh-renderer
version: "3.8"
category: api-reference
title: MeshRenderer
keywords:
  - MeshRenderer
  - ModelComponent
  - 网格渲染器
  - 3D 模型
  - Mesh
  - 材质
  - 模型组件
  - 阴影
  - 形变网格
  - morph
related_docs:
  - api-reference/material.md
  - api-reference/effect-asset.md
  - assets/image-texture-spriteframe.md
  - recipes/change-material-property.md
  - troubleshooting/material-not-updated.md
  - troubleshooting/3d-object-not-visible.md
related_api:
  - MeshRenderer
  - ModelComponent
  - Material
  - Mesh
  - Renderer
  - Model
source:
  official: "Cocos Creator 3.8 官方文档 - 3D 渲染 - 模型组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "官方文档无 MeshRenderer 独立页面，渲染管线深层行为（合批破坏条件、材质实例化对 DrawCall 影响、特定平台上不可见原因）仍需人工复核"
status: needs-review
updated: 2026-06-18
---

# MeshRenderer

> **此文档标记为 needs-review**：合批破坏条件、材质实例化对 DrawCall 影响、特定渲染管线配置下不可见原因需在目标平台人工复核。

## 用途

`MeshRenderer`（别名 `ModelComponent`）是 Cocos Creator 3D 渲染的核心组件，用于在场景中显示网格模型。它管理模型的 Mesh 数据、材质、阴影以及形变网格（morph target）。

## 所属模块

```ts
import { MeshRenderer } from 'cc';
```

## 公开导出结论

- `MeshRenderer` 在 `cc` 模块以 `export class MeshRenderer extends ModelRenderer` 公开导出（已验证）。
- 继承层次：`Component` → `Renderer` → `ModelRenderer` → `MeshRenderer`（全部为 `cc` 公开导出）。
- `ModelComponent` 是 `MeshRenderer` 的历史别名，保留用于向后兼容。
- 已验证的公开属性与方法（基于 cc-engine 3.8 公开类型声明与引擎源码）：
  - 静态枚举：`ShadowCastingMode`（OFF/ON）、`ShadowReceivingMode`（OFF/ON）。
  - 属性：`mesh`、`model`（只读，`renderer.scene.Model | null`）、`shadowBias`、`shadowNormalBias`、`shadowCastingMode`、`receiveShadow`、`enableMorph`、`isGlobalStandardSkinObject`、`bakeSettings`。
  - 材质接口（继承自 Renderer，已验证）：`sharedMaterial`、`sharedMaterials`、`material`、`materials`、`setSharedMaterial()`、`getMaterialInstance()`、`setMaterialInstance()`、`getRenderMaterial()`。
  - 形变网格方法：`getWeight()`、`setWeights()`、`setWeight()`。
  - 反射探针方法：`updateProbeCubemap()`、`updateProbeBlendCubemap()`、`updateProbePlanarMap()`、`updateReflectionProbeDataMap()`、`updateReflectionProbeId()`。
  - `setInstancedAttribute()` 方法。
- 以下行为**已验证可确定**：Mesh/Material/Shadow API 的属性类型、读写特性和方法签名。
- 以下行为**仍需人工复核（故保留 needs-review）**：合批（batching）破坏的确切条件、材质实例化对 DrawCall 的具体影响、特定渲染管线配置下模型不可见的深层原因。

## 常用属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `mesh` | `Mesh \| null` | 获取或设置模型的网格数据。设置时所有形变目标权重将归零 |
| `model` | `renderer.scene.Model \| null` | 获取渲染场景中对应的 Model，只读 |
| `shadowCastingMode` | `number` | 阴影投射方式（OFF=0 / ON=1） |
| `receiveShadow` | `number` | 是否接收阴影（OFF=0 / ON=1） |
| `shadowBias` | `number` | 局部的阴影偏移 |
| `shadowNormalBias` | `number` | 局部的阴影法线偏移 |
| `enableMorph` | `boolean` | 是否启用形变网格渲染 |

## 材质操作（已验证 API）

MeshRenderer 继承自 `Renderer`，提供多层材质接口：

| 方法/属性 | 类型 | 说明 |
|-----------|------|------|
| `sharedMaterials` | `(Material \| null)[]` | 所有子网格的共享材质（修改会影响所有引用同一材质资源的组件） |
| `material` | `Material \| renderer.MaterialInstance \| null` | 默认材质实例（访问时自动创建实例，修改仅影响当前组件） |
| `materials` | `(Material \| renderer.MaterialInstance \| null)[]` | 所有子网格的材质（访问时自动创建实例） |
| `setSharedMaterial(material, index)` | — | 设置指定子网格的共享材质（v3.8.1+ 推荐，替代已弃用的 `setMaterial`） |
| `getMaterialInstance(idx)` | `renderer.MaterialInstance \| null` | 获取指定子网格的材质实例 |
| `setMaterialInstance(matInst, index)` | — | 设置指定子网格的材质实例 |
| `getRenderMaterial(index)` | `Material \| null` | 获取实际用于渲染的材质 |

**重要区别（已验证）**：
- `sharedMaterials` 修改共享材质，影响所有使用同一材质资源的组件 → 少用。
- `material`/`materials` 访问时自动创建材质实例，修改仅影响当前组件 → 推荐用于单模型属性调整。
- **注意**：通过 `material`/`materials` 访问会创建材质实例，可能破坏合批（batching）。合批破坏的确切条件因渲染管线配置而异，**此行为仍需人工复核**。

## 与 Model / Mesh / Material 的关系

```
Mesh ──→ MeshRenderer ──→ Material(s)
(网格数据)   (渲染组件)     (材质资源)
                │
                ↓
          renderer.scene.Model
        (引擎内部渲染场景中的模型对象)
```

- **Mesh**：网格几何数据（顶点、索引、法线、UV 等），通过 `meshRenderer.mesh` 设置。
- **MeshRenderer**：渲染组件，使用 Mesh 的几何数据和 Material 的着色参数完成渲染。
- **Material**：决定 Mesh 的渲染外观（Shader、颜色、贴图等），通过材质槽位与 Mesh 的子网格（sub-mesh）对应。
- **renderer.scene.Model**：引擎内部渲染场景对象，通过 `meshRenderer.model` 只读获取。用户不应直接操作。

## 3D 模型换材质最小示例

### 前置条件

场景中有一节点挂载了 MeshRenderer 组件，且在项目 `resources` 文件夹中放置了材质资源 `materials/my-material.mtl`。

```ts
import { MeshRenderer, Material, resources, Color } from 'cc';

@ccclass('MyComponent')
export class MyComponent extends Component {
  start() {
    // 方式一：通过 resources.load 加载材质资源并设置为共享材质（v3.8.1+ 推荐）
    resources.load('materials/my-material', Material, (err, mat) => {
      if (err) return;
      const renderer = this.getComponent(MeshRenderer)!;
      renderer.setSharedMaterial(mat, 0); // 设置第 0 个子网格的共享材质
    });

    // 方式二：获取材质实例，修改仅影响本组件（注意：可能破坏合批）
    const renderer = this.getComponent(MeshRenderer)!;
    const matInst = renderer.material; // 自动创建材质实例
    matInst!.setProperty('mainColor', new Color(255, 0, 0, 255));
  }
}
```

## 常见错误

**模型不可见**：最常见原因是 `mesh` 属性为 null（未指定网格数据）、材质引用的 Effect 未正确加载、或渲染层级/摄像机裁剪设置问题。检查顺序：`mesh` → `renderer.material` → 场景光照和摄像机设置。详见 `troubleshooting/3d-object-not-visible.md`。

**材质槽位错误**：Mesh 可能有多个子网格（sub-mesh），每个子网格对应一个材质槽位。如果模型有多个材质槽，需要为每个槽位设置对应的材质。使用 `sharedMaterials`（复数）一次性设置所有材质。

**共享材质被误改**：通过 `renderer.material` 访问的是材质实例（自动创建），但通过 `renderer.sharedMaterials[0]` 拿到的是共享材质。直接修改共享材质的 uniform 会影响所有使用该材质的模型。优先使用 `material` 属性获取材质实例后进行修改。

**合批被破坏（needs-review）**：访问 `renderer.material`/`renderer.materials` 会自动创建材质实例，导致该组件使用独立材质而无法与其他使用同一共享材质的组件合批。具体破坏条件与渲染管线版本相关，建议在目标平台验证 DrawCall 数量。

**`setMaterial()` 弃用**：Cocos Creator 3.8.1 中 `setMaterial(material, index)` 已弃用，应使用 `setSharedMaterial(material, index)`。

**setProperty 在材质实例上使用 initialize**：创建后直接调用 `initialize` 会覆盖原有材质，应使用 `setProperty`。

**设置 mesh 导致 morph weights 重置**：设置 `mesh` 属性会将所有形变目标权重归零，需在设置 mesh 后重新设置权重。

## 关联任务

- 理解 Material 类型：[api-reference/material.md](../api-reference/material.md)
- 理解 EffectAsset 概念：[api-reference/effect-asset.md](../api-reference/effect-asset.md)
- 运行时修改材质属性：[recipes/change-material-property.md](../recipes/change-material-property.md)
- 材质不更新排查：[troubleshooting/material-not-updated.md](../troubleshooting/material-not-updated.md)
- 3D 模型不显示排查：[troubleshooting/3d-object-not-visible.md](../troubleshooting/3d-object-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 3D 渲染
- 已交叉验证：cc-engine 3.8 公开类型声明、引擎源码
- **needs-review 范围**：合批破坏条件、材质实例化对 DrawCall 影响、特定渲染管线配置下不可见原因——以上行为因涉及渲染管线深层逻辑，需在目标平台人工复核。Mesh/Material/Shadow 的 API 签名和基本用法已验证可确定。
