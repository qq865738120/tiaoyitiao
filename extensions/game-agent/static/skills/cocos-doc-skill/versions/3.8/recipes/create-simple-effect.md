---
id: cocos-3.8-recipes-create-simple-effect
version: "3.8"
category: recipes
title: 创建简单 Effect — 自定义着色器入门
keywords:
  - 创建 Effect
  - 自定义着色器
  - 自定义 Shader
  - .effect 文件
  - 创建材质
  - 绑定材质
  - setProperty
  - 属性暴露
  - Uniform
  - Material.setProperty
related_docs:
  - concepts/effect-shader-overview.md
  - ui-2d/sprite.md
  - ui-2d/draw-call-batching.md
  - troubleshooting/shader-compile-failed.md
  - troubleshooting/material-breaks-batching.md
related_api:
  - EffectAsset
  - Material
  - Sprite
  - MeshRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - Shader（着色器）：自定义着色器、YAML 101、着色器语法、2D 精灵着色器 Gradient"
  verified-against:
    - "cc-engine 3.8 公开类型声明 (EffectAsset, Material, Pass)"
    - "cc-engine 3.8 内置着色器源码 (builtin-sprite.effect)"
  supplement:
    - "工程建议：初次尝试时从内置 Shader 复制修改，不要从零写"
    - "工程建议：编译失败时先检查 YAML 缩进和 Property/Uniform 名称一致性"
status: draft
updated: 2026-06-17
---

# 创建简单 Effect — 自定义着色器入门

## 目标

创建一个自定义 Effect（.effect 文件），暴露一个可由 Material 控制的颜色属性，将其绑定到 Sprite 组件上，并在运行时通过 TypeScript 代码修改该属性。

## 推荐做法

1. 从内置 Shader 复制修改，而非从零编写。内置 Shader 存放在编辑器资源管理器 `internal/effects/` 目录下，2D 推荐复制 `builtin-sprite.effect`，3D 推荐复制 `builtin-unlit.effect`。
2. 在 `CCEffect` 的 `properties` 段声明新属性——这样它就会出现在 Material 的 Inspector 面板上。
3. 在 `CCProgram` 中增加对应 `Uniform`——引擎通过名称自动关联 Property 与 Uniform。
4. 创建引用该 Effect 的 Material 资源（`.mtl`），然后将 Material 赋给渲染组件。
5. 运行时使用 `Material.setProperty` 修改属性值。

## 示例代码

### Step 1：创建 Effect 文件

在编辑器 **资源管理器** 中右键 → **创建 → 着色器**，或复制 `internal/effects/builtin-sprite.effect` 到 `assets/` 下并重命名为 `my-effect.effect`。

在 `CCEffect` 的 `properties` 段添加自定义属性：

```yaml
# 在 properties: 段内添加
glowColor: { value: [1.0, 0.5, 0.0, 1.0], editor: { type: color } }
glowIntensity: { value: 0.5 }
```

在 `CCProgram sprite-fs` 中添加对应 Uniform：

```glsl
uniform MyUniforms {
  vec4 glowColor;
  float glowIntensity;
};
```

### Step 2：创建 Material 资源

- 在 **资源管理器** 右键 → **创建 → 材质**，命名为 `my-material`。
- 选中该材质，在 Inspector 中 Effect 下拉框选择 `my-effect`。
- 材质面板上应该能看到 `glowColor` 和 `glowIntensity` 输入框。

### Step 3：绑定到 Sprite

- 选中场景中的 Sprite 节点。
- 在 Sprite 组件的 `CustomMaterial` 属性中，拖入或选中 `my-material`。

### Step 4：运行时修改属性

```ts
import { _decorator, Component, Sprite, Material, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('EffectControl')
export class EffectControl extends Component {
  private _sprite: Sprite | null = null;
  private _elapsed: number = 0;

  start() {
    this._sprite = this.getComponent(Sprite);
  }

  update(dt: number) {
    if (!this._sprite?.customMaterial) return;

    this._elapsed += dt;
    // 让颜色随时间变化（仅在需要时调用，避免每帧触发）
    if (this._elapsed % 1.0 < dt) {
      const r = Math.sin(this._elapsed) * 0.5 + 0.5;
      this._sprite.customMaterial.setProperty(
        'glowColor',
        new Color(r * 255, 128, 64, 255)
      );
    }
  }
}
```

> **注意**：`Material.setProperty` 的数值类型应当与 Effect 中 Uniform 的类型匹配。`Color` 会转换为 `vec4`，`number` 会转换为 `float`。

## 操作步骤

1. **复制内置 Shader**：从 `internal/effects/builtin-sprite.effect` 复制到 `assets/` 目录下。
2. **修改 CCEffect**：在 `properties` 段添加新属性。
3. **修改 CCProgram**：在片元着色器中添加对应的 Uniform 声明，并在 `frag()` 中使用它们。
4. **保存 effect 文件**：编辑器会自动为改动过的 `.effect` 文件刷新资源。
5. **创建 Material**（.mtl）：选择刚创建的 Effect。
6. **赋给组件**：将 Material 拖拽到 Sprite 的 `CustomMaterial` 属性。
7. **脚本控制**：使用 `sprite.customMaterial.setProperty()` 运行时修改。

## 验证方式

- Material 的 Inspector 面板中出现新添加的属性输入框，且修改后 Sprite 渲染效果发生变化。
- 运行预览时，脚本中 `setProperty` 修改的参数实时反应到画面。
- 编辑器的 Console 无 Shader 编译报错。

## 常见错误

- **编译失败**：YAML 缩进错误、缺少冒号后的空格、缺少逗号。检查 Console 中的编译错误信息。
- **属性不显示**：Property 名称和 Uniform 名称不一致。引擎按名称匹配，不一致则属性值不会传入 Shader。
- **自定义材质不影响 2D 组件**：2D 组件必须使用 `CustomMaterial` 属性（而非 `materials` 数组）。
- **合批被打断**：使用自定义材质的 Sprite 节点会打断 UI 合批。详见 [材质破坏合批排查](../troubleshooting/material-breaks-batching.md)。
- **Material.setProperty 无效**：确认 Effect 中对应的 Uniform 已正确声明。2D 材质的 Uniform 必须放在 `uniform Constant { ... }` 块内，且 Property 名称与 Uniform 名称一致。

## 相关文档

- [Effect / Shader 概念概览](../concepts/effect-shader-overview.md)
- [Shader 编译失败排查](../troubleshooting/shader-compile-failed.md)
- [材质破坏合批排查](../troubleshooting/material-breaks-batching.md)
- [2D 合批优化](../ui-2d/draw-call-batching.md)
- 2D 渲染对象自定义材质用法详见官方文档"2D 精灵着色器 Gradient"章节
