---
id: cocos-3.8-recipes-change-material-property
version: "3.8"
category: recipes
title: 修改材质属性
keywords:
  - 修改材质
  - 材质属性
  - Material 属性
  - setProperty
  - 材质实例
  - customMaterial
  - 运行时修改材质
  - 换色
  - 替换贴图
  - 材质不生效
related_docs:
  - api-reference/material.md
  - api-reference/effect-asset.md
  - api-reference/mesh-renderer.md
  - troubleshooting/material-not-updated.md
related_api:
  - Material
  - EffectAsset
  - MeshRenderer
  - Sprite
  - UIRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - 材质系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：运行时修改共享材质会污染其他实例，应优先使用材质实例"
status: draft
updated: 2026-06-17
---

# 修改材质属性

## 目标

在运行时修改 3D 模型（MeshRenderer）或 2D UI（Sprite）的材质属性，实现换色、替换贴图、调整渲染参数等效果。

## 推荐做法

### 1. 修改 MeshRenderer 材质属性

#### 获取材质实例（推荐，不污染共享资源）

```ts
import { MeshRenderer, Color } from 'cc';

@ccclass('ModifyMaterial')
export class ModifyMaterial extends Component {
  start() {
    const renderer = this.getComponent(MeshRenderer)!;
    // 通过 .material 获取材质实例，自动创建，修改只影响该组件
    const matInst = renderer.material;
    if (matInst) {
      matInst.setProperty('mainColor', new Color(255, 0, 0, 255));
    }
  }
}
```

#### 替换整个材质（更换不同的 Effect）

```ts
import { MeshRenderer, Material, resources } from 'cc';

@ccclass('ReplaceMaterial')
export class ReplaceMaterial extends Component {
  start() {
    const renderer = this.getComponent(MeshRenderer)!;
    resources.load('materials/new-material', Material, (err, mat) => {
      if (err) return;
      renderer.setSharedMaterial(mat, 0);
    });
  }
}
```

### 2. 修改 Sprite 的 customMaterial

Sprite 继承自 UIRenderer，提供 `customMaterial` 属性：

```ts
import { Sprite, Material, Color } from 'cc';

@ccclass('ModifySpriteMaterial')
export class ModifySpriteMaterial extends Component {
  start() {
    const sprite = this.getComponent(Sprite)!;

    // 设置自定义材质
    resources.load('materials/sprite-custom', Material, (err, mat) => {
      if (err) return;
      sprite.customMaterial = mat;
    });

    // 如果已有 customMaterial，可以获取并修改属性
    const customMat = sprite.customMaterial;
    if (customMat) {
      customMat.setProperty('mainColor', new Color(255, 0, 0, 255));
    }
  }
}
```

### 3. 在不污染共享资源的情况下创建/使用材质实例

```ts
import { MeshRenderer, Material, renderer } from 'cc';

@ccclass('SafeMaterialModify')
export class SafeMaterialModify extends Component {
  start() {
    const renderer = this.getComponent(MeshRenderer)!;

    // 方式 A：通过 .material（自动创建实例，推荐）
    const matInst = renderer.material;
    matInst!.setProperty('albedoScale', 1.5);

    // 方式 B：手动创建 MaterialInstance
    const sharedMat = renderer.sharedMaterials[0];
    if (sharedMat) {
      const manualInst = new renderer.MaterialInstance({
        parent: sharedMat,
        owner: renderer,
        subModelIdx: 0,
      });
      manualInst.setProperty('albedoScale', 1.5);
      renderer.setMaterialInstance(manualInst, 0);
    }
  }
}
```

### 4. 批量修改相同材质且不破坏合批

如果多个模型使用相同共享材质且需要统一修改，直接修改共享材质（而非创建实例）：

```ts
// 修改共享材质本身（影响所有引用该材质的模型，不破坏合批）
sharedMat.setProperty('mainColor', new Color(255, 255, 255, 255));

// 但注意：此修改是运行时的，不保存到资源文件
```

## 操作步骤

1. **获取目标组件**：`getComponent(MeshRenderer)` 或 `getComponent(Sprite)`。
2. **决定修改范围**：是否影响其他模型？
   - 仅影响当前组件 → 使用 `.material` 或 `getMaterialInstance()` 获取材质实例。
   - 统一影响所有相同材质的模型 → 使用 `sharedMaterials` 获取共享材质。
3. **获取或创建材质**：通过 `resources.load` 加载材质资源，或通过 `renderer.material` 自动创建材质实例。
4. **修改属性**：使用 `material.setProperty(propertyName, value)`。
5. **验证效果**：确认属性名与 Effect 中定义的 uniform 名称一致。

## 验证方式

- 修改后在场景中观察材质效果是否更新。
- 使用 `material.getProperty('mainColor')` 读取属性值确认设置是否正确。
- 检查 Effect 源码（`.effect` 文件）中 uniform 声明确认属性名：
  ```
  // 示例：effect 文件中定义的 uniform
  CCTexture2D mainTexture;
  vec4 mainColor;
  ```
- 调用 `material.getProperty('mainColor')` 验证返回值是否为预期值。
- 通过控制台打印属性值判断是否写入成功。

## 常见错误

**属性名大小写不匹配**：`setProperty` 的属性名必须与 `.effect` 文件中 uniform 声明的名称完全一致（包括大小写）。例如 uniform 声明为 `mainColor` 则必须使用 `'mainColor'`。

**修改的是共享材质**：直接修改 `sharedMaterials[0]` 会影响所有使用该材质的组件。如果不希望影响其他模型，应使用 `material` 属性获取材质实例。

**通过 customMaterial 设置后未看见效果**：Sprite 默认使用内置材质，`customMaterial` 生效需要 Sprite 组件的 `customMaterial` 不为 null。如果 `customMaterial` 为 null，Sprite 使用内置默认材质，此时设置 Sprite 的 `color` 属性即可。

**异步资源引用为空**：`resources.load` 是异步的，在加载完成前访问材质会得到 `null`。需要确保在回调中操作材质。

**实例化后合批被破坏**：每创建一个 `MaterialInstance` 都会生成独立的 Pass 对象，导致该渲染组件的模型无法与其他使用相同 Effect 的模型合批。

## 失败时转排错

如果材质属性修改后没有生效，请按照以下顺序排查：

1. 组件或材质引用是否为空 → `troubleshooting/material-not-updated.md` 第一步
2. 属性名是否与 Effect uniform 匹配 → 检查 `.effect` 文件
3. 修改的是共享材质还是实例 → 使用 `.material` 而非 `sharedMaterials`
4. 是否被后续代码覆盖 → 检查执行顺序
5. 平台或 Shader 编译问题 → 跨平台测试

## 相关文档

- Material API 文档：`api-reference/material.md`
- EffectAsset API 文档：`api-reference/effect-asset.md`
- MeshRenderer API 文档：`api-reference/mesh-renderer.md`
- 材质不更新排查：`troubleshooting/material-not-updated.md`
