---
id: cocos-3.8-troubleshooting-material-breaks-batching
version: "3.8"
category: troubleshooting
title: 材质破坏合批排查
keywords:
  - 材质合批
  - 自定义材质打断合批
  - DrawCall 高
  - 合批失败
  - 材质实例
  - Material Instance
  - 共享材质
  - Sprite 自定义材质
  - UI 合批
  - 运行时创建材质
related_docs:
  - ui-2d/draw-call-batching.md
  - ui-2d/sprite.md
  - ui-2d/common-recipes.md
  - concepts/effect-shader-overview.md
  - recipes/create-simple-effect.md
  - troubleshooting/performance-issues.md
  - troubleshooting/shader-compile-failed.md
related_api:
  - Material
  - Sprite
  - SpriteFrame
  - RenderableComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 材质系统 / UI 系统 - 合批优化 / 2D 渲染对象自定义材质"
  verified-against:
    - "cc-engine 3.8 公开类型声明 (Material, Sprite RenderableComponent)"
  supplement:
    - "工程经验：合批要求材质引用完全一致（同一个引用），而非值相等"
    - "工程经验：运行时 `getMaterialInstance()` 或 `.material` getter 会创建新材质实例，可能破坏合批"
status: draft
updated: 2026-06-17
---

# 材质破坏合批排查

## 现象

在使用了自定义材质或脚本中动态修改材质后，DrawCall 数量明显上升。场景中大量相同图片、相同材质的节点本应合批，但实际渲染时每节点一个 DrawCall。

## 排查步骤

### 1. 先用 Profiler / DrawCall 观察

在编辑器中依次点击 **开发者 → Stats** 打开渲染统计面板，观察 **DrawCall** 数值。

- 场景中 10 个相同 Sprite，DrawCall 应为 1（合批后），若为 10 说明完全未合批。
- 打开 **开发者 → 渲染调试 → Batch** 模式，可以观察每个 UI 节点的合批情况。
- 按需使用 Chrome DevTools 的 Performance 面板录制帧数据，确认 DrawCall 数量。

### 2. 确认合批的基本条件

Cocos Creator 3.8 中，合批要求相邻渲染节点的**材质引用完全一致**。这里的"一致"指**同一个 `Material` 实例引用**，而非"值相同"。

合批打断的常见原因按影响面排序：

1. **自定义材质**：使用了自定义 Material 的节点打断 UI 合批。即使多个节点使用同一个自定义材质文件，只要材质引用指向同一资源文件，这些节点之间可以合批，但它们与使用内置材质的节点无法合批。
2. **不同纹理**：相邻节点引用不同图集（Texture）的 SpriteFrame 会打断合批。
3. **不同材质实例**：多个节点各自持有了不同的材质实例对象。
4. **渲染状态不同**：混合模式、深度测试、渲染队列等不一致。
5. **渲染类型交叉**：Sprite、Label、RichText 等不同组件类型之间无法合批。

### 3. 重点检查：运行时创建材质实例

这是最常见的运行时合批破坏原因。

```ts
import { Material, Color, Sprite } from 'cc';

// 反例：每个循环创建一个新 Material，导致每个节点独立材质
// （即使材质值相同，引用不同对象 = 无法合批）
for (let i = 0; i < 10; i++) {
  const mat = new Material();
  mat.initialize({ effectName: 'builtin-sprite' });
  mat.setProperty('mainColor', new Color(255, 0, 0, 255));
  spriteArray[i].getComponent(Sprite)!.customMaterial = mat;
}
```

```ts
import { Material, Color } from 'cc';

// 正例：复用同一个 Material 实例
const sharedMat = new Material();
sharedMat.initialize({ effectName: 'builtin-sprite' });
sharedMat.setProperty('mainColor', new Color(255, 0, 0, 255));

for (let i = 0; i < 10; i++) {
  spriteArray[i].getComponent(Sprite)!.customMaterial = sharedMat;
}
```

**关键注意点**：

- `RenderableComponent.material` 的 getter 会创建材质实例——每次调用返回一个新实例（除非已缓存过）。
- `RenderableComponent.sharedMaterial` 返回共享材质，不会创建新实例。
- `RenderableComponent.getMaterialInstance(index)` 也会创建材质实例。
- 2D 组件的 `customMaterial` 直接赋值 `Material` 对象，不需要调用 getter。

### 4. Sprite customMaterial 与 UI 合批的关系

2D 和 UI 组件的合批规则在[2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md)中有详细说明。使用 `customMaterial` 的 Sprite 节点：

- **可以与使用同一自定义材质的相邻 Sprite 节点合批**（原理同上：材质引用一致）。
- **无法与未使用自定义材质的 Sprite 节点合批**（内置材质 vs 自定义材质，材质引用不同）。
- **无法与 Label、RichText 等其他 UI 组件合批**（渲染类型不同）。
- 2D 渲染组件不支持多材质，自定义材质数量最多为一个。

### 5. 其他排查方向

| 可能原因 | 说明 |
|---|---|
| `material` getter 调用频繁 | `renderable.material` 每调用一次就可能创建一个新材质实例。使用 `renderable.sharedMaterial` 或缓存引用。 |
| Texture 不一致 | 即使材质相同，相邻节点使用不同 Texture 也无法合批。确认所有节点 SpriteFrame 来自同一图集。 |
| 渲染状态不一致 | 检查材质的 Pass 中混合模式、深度测试等是否一致。 |
| 动态 `setProperty` | 每帧修改材质属性虽然不会创建新实例，但会频繁触发渲染状态更新。 |
| 宏定义不一致 | 即使使用同一 Effect，不同宏组合也会产生不同 Shader 变体，打断合批。 |

## 快速检查清单

- [ ] 打开 Stats 面板确认 DrawCall 是否异常高
- [ ] 确认受影响的节点使用同一材质资源（引用相同）
- [ ] 检查代码中是否使用了 `.material` getter（应改用 `.sharedMaterial`）
- [ ] 检查代码中是否创建了多个 `new Material()` 实例（应复用）
- [ ] 确认所有 UI 节点 SpriteFrame 来自同一图集
- [ ] 确认自定义材质节点之间的 Effect 和宏配置一致

## 仍未解决时

- 将场景简化为 2-3 个 Sprite 节点，逐个添加观察 DrawCall 变化。
- 尝试去除自定义材质，使用内置材质观察合批是否恢复（确认是否是材质本身导致）。
- 查阅 2D 合批优化文档深入了解合批机制。
- 在官方论坛搜索具体的合批场景描述。

## 相关文档

- [2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md)
- [Sprite 图片显示组件](../ui-2d/sprite.md)
- [Effect / Shader 概念概览](../concepts/effect-shader-overview.md)
- [创建简单 Effect 步骤](../recipes/create-simple-effect.md)
- [性能问题分诊](./performance-issues.md)
