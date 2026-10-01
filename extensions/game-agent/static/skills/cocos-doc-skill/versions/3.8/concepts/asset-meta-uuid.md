---
id: cocos-3.8-concepts-asset-meta-uuid
version: "3.8"
category: concepts
title: 资源 .meta 文件与 UUID
keywords:
  - .meta 文件
  - UUID
  - 资源身份
  - 资源引用
  - 导入配置
  - 子资源
  - 资源 UUID 变化
related_docs:
  - concepts/project-structure.md
  - assets/meta-uuid.md
  - assets/asset-workflow.md
  - api-reference/asset-manager.md
related_api:
  - assetManager
source:
  official: "Cocos Creator 3.8 官方文档 - 资源 - Meta 文件"
  verified-against: []
  supplement: []
status: draft
updated: 2026-08-03
---

# 资源 .meta 文件与 UUID

## 用途

解释 `.meta` 保存什么、UUID 如何维持资产身份，以及为什么资源引用不能只按文件路径理解。资源丢失、恢复、迁移和团队协作排错由 [.meta 与 UUID 实战要点](../assets/meta-uuid.md) 负责。

## 核心结论

- `assets/` 中的资源或目录导入后通常配有 `.meta`。
- `.meta` 保存资源 UUID、导入配置及子资源元数据；不同资源类型的实际字段由对应 importer 决定。
- Creator 的资产引用依赖 UUID 或子资源身份，而不是只依赖当前文件路径。
- 丢失、损坏或非预期重建既有 `.meta` 可能改变资产身份并破坏已有引用，但不能脱离现场事实断言所有引用必然失效。
- 资源和对应 `.meta` 应作为同一身份单元保持同步；确切版本控制集合服从当前仓库规则。

## 什么时候使用

- 询问 `.meta` 文件的作用或内容。
- 理解为什么改路径和改资产身份不是同一件事。
- 理解图片、模型等导入后为何会出现子资源。
- 分析 Scene、Prefab 或组件属性中的资源引用为何与 UUID 相关。

## 身份模型

### 主资源 UUID

`.meta` 中的主 UUID 标识 AssetDB 中的资产身份。路径是资源的位置，UUID 是引用资产时使用的身份；两者相关但不能互相替代。

### 导入配置

图片、音频、模型等资源由 importer 读取 `.meta` 中的配置并生成编辑器可用数据。字段名称和含义随资源类型变化，不应凭通用规则猜测。

### 子资源元数据

一份源文件可能导入为多个 AssetDB 对象，例如图片的 ImageAsset、Texture2D 和 SpriteFrame。`subMetas` 等元数据用于维持这些子资源的身份与配置；引用可能指向主资源，也可能指向某个子资源。

## 引用连续性

- 资源位置发生变化时，是否保持引用取决于 AssetDB 是否保留并识别原身份，不能只看文件名或路径。
- 既有 `.meta` 被重新生成时，UUID 或子资源身份可能变化；受影响范围应通过当前 Scene、Prefab、AssetDB 和版本控制事实确认。
- `library/` 是导入派生数据，不是替代 `.meta` 身份信息的来源；重建派生数据不能自动恢复已经丢失的原身份。

## 边界

- 本文不提供删除、移动、复制或批量文件操作步骤。
- 本文不定义 `assetUuid`、节点/组件实例 `uuid` 与组件类 `cid` 的工具字段契约。
- 需要恢复或迁移资源时，读取 [.meta 与 UUID 实战要点](../assets/meta-uuid.md)，并以编辑器、AssetDB 工具和仓库历史为准。

## 关联文档

- [项目结构](./project-structure.md)
- [.meta 与 UUID 实战要点](../assets/meta-uuid.md)
- [资源导入与工作流](../assets/asset-workflow.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)

## 来源

- Cocos Creator 3.8 官方文档：[资源 Meta 文件](https://docs.cocos.com/creator/3.8/manual/zh/asset/meta.html)
- Cocos Creator 3.8 官方文档：[资源工作流程](https://docs.cocos.com/creator/3.8/manual/zh/asset/asset-workflow.html)
