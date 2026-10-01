---
id: cocos-3.8-assets-asset-taxonomy-and-lifecycle
version: "3.8"
category: assets
title: 资产分类与生命周期
keywords:
  - 资产分类
  - 资产生命周期
  - 源资源
  - 导入资源
  - 子资源
  - UUID
  - 引用计数
  - 释放
  - Bundle
  - resources
  - 资产类型
  - 资源管理
related_docs:
  - assets/asset-workflow.md
  - assets/meta-uuid.md
  - assets/resources-folder.md
  - assets/asset-bundle.md
  - assets/dynamic-loading.md
  - assets/release.md
  - assets/common-pitfalls.md
  - assets/image-texture-spriteframe.md
related_api:
  - Asset
  - assetManager
  - resources
  - SpriteFrame
  - Texture2D
  - Prefab
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：将分散的资源类型、工作流、生命周期知识整合为单一完整的资产模型"
status: draft
updated: 2026-06-18
---

# 资产分类与生命周期

## 用途

建立"源文件 → 导入资源 → 子资源 → 场景引用 → Bundle → 运行时实例 → 释放"的完整资产模型，统一说明所有资源类型的分类、生命周期阶段、加载方式选择和释放策略。

## 核心结论

- **资源从源文件到运行时实例经历多个阶段**：源资源（raw 文件）→ 导入资源（引擎内部格式）→ 子资源（从导入资源提取）→ 场景引用 → Bundle 加载 → 运行时实例 → 释放回收。
- **Asset 是共享引用，而非实例数据**：修改 Asset 属性会影响所有引用它的组件和节点。
- **UUID 是引擎引用资源的唯一标识**：场景、预制体、组件属性中存储的都是 UUID，而非文件路径。
- **引用计数是资源释放的核心机制**：静态引用由引擎管理，动态引用需要开发者手动 `addRef`/`decRef`。

## 第四部分：常见问题

### 资源加载后什么时候释放？

原则：**不再使用时释放**。具体时机：
- 场景静态资源：场景切换时由引擎自动释放（需勾选场景"自动释放资源"）。
- 动态加载资源：在 `onDestroy` 中 `decRef`（如果之前调用了 `addRef`），或确保场景释放时该资源无其他引用。
- Bundle 资源：调用 `bundle.releaseAll()` + `assetManager.removeBundle(bundle)`。

### 场景切换内存不释放？

重点排查：
1. **场景是否勾选"自动释放资源"**（属性检查器 → 场景）。
2. **动态加载后是否持有 `addRef` 未 `decRef`**：每个 `addRef` 必须有对应 `decRef`。
3. **是否有常驻节点保留资源引用**：`game.addPersistRootNode()` 可使节点跨越场景切换。
4. **事件监听/定时器/闭包是否持有资源引用**：`onDestroy` 中清理所有监听和定时器。
5. **Asset Bundle 未释放**：加载的 Bundle 使用完后须 `releaseAll` + `removeBundle`。

### 修改 SpriteFrame 影响所有 Sprite？

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 关联文档

- [资源导入与工作流](./asset-workflow.md)
- [.meta 与 UUID 实战要点](./meta-uuid.md)
- [resources 目录使用指南](./resources-folder.md)
- [Asset Bundle 使用指南](./asset-bundle.md)
- [动态加载资源](./dynamic-loading.md)
- [资源释放](./release.md)
- [常见资源陷阱](./common-pitfalls.md)
- [图片、纹理与 SpriteFrame](./image-texture-spriteframe.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统
- 已交叉验证：cc-engine 3.8 公开类型声明（`Asset`、`SpriteFrame`、`Texture2D`、`SpriteAtlas`、`Mesh`、`Material`、`AnimationClip`、`AudioClip`、`Prefab`、`SceneAsset`、`JsonAsset`、`TextAsset`、`TTFFont`、`SkeletonData`、`TiledMapAsset`、`ParticleAsset`）
- 补充：工程经验——将分散的资源类型、工作流、生命周期知识整合为单一完整的资产模型
