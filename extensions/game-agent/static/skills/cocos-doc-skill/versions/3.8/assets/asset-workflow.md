---
id: cocos-3.8-assets-asset-workflow
version: "3.8"
category: assets
title: 资源导入与工作流
keywords:
  - 资源导入
  - 资源工作流
  - 资源管理
  - AssetDB
  - library
  - 资源类型
  - 子资源
related_docs:
  - concepts/project-structure.md
  - concepts/asset-meta-uuid.md
  - assets/meta-uuid.md
  - assets/resources-folder.md
  - assets/dynamic-loading.md
  - assets/asset-bundle.md
related_api:
  - assetManager
source:
  official: "Cocos Creator 3.8 官方文档 - 资源工作流程"
  verified-against: []
  supplement: []
status: draft
updated: 2026-08-03
---

# 资源导入与工作流

## 用途

概览外部文件或 Creator 原生资产进入 AssetDB 后，如何形成可引用的主资源、子资源和派生数据。本文只说明高层链路，并把具体概念、加载方式和排错路由到对应专题。

## 核心结论

- 资源进入 `assets/` 后由 AssetDB 和对应 importer 识别，而不是仅凭文件扩展名直接成为运行时对象。
- 导入通常会生成或更新 `.meta`，其中保存 UUID、导入配置和子资源元数据。
- importer 根据源资源和配置生成 `library/` 中的派生数据；`library/` 不是原始资产身份的替代来源。
- Scene、Prefab 和组件属性可以引用主资源或子资源身份；资源位置和资产身份不能只按路径等同。
- 资源是否进入某个 Bundle、如何动态加载或何时释放，分别由对应专题负责，不在本文展开。

## 什么时候使用

- 理解资源从源文件到 AssetDB 可引用对象的基本链路。
- 区分源资源、`.meta`、子资源和 `library/` 派生数据。
- 判断某个问题应继续查看 Meta/UUID、资源目录、动态加载还是 Asset Bundle 专题。

## 高层导入链路

```text
源资源或 Creator 原生资产
→ AssetDB 发现并选择 importer
→ 生成或读取 .meta（UUID、导入配置、子资源元数据）
→ importer 生成 library 派生数据
→ 资源管理器、Scene、Prefab 和组件属性按资产身份引用
→ 构建系统根据场景、Bundle 和项目配置收集需要发布的资源
```

具体 importer、资源类型和项目配置可能改变链路细节；应查询当前编辑器与 AssetDB 事实，而不是根据这张概览图猜测字段或输出。

## 主资源与子资源

同一源文件可能产生多个可引用对象。例如图片可对应源图、纹理和 SpriteFrame，模型可产生网格、材质或动画等子资源。不同对象拥有各自的 AssetDB 身份；需要判断具体引用时，应查询资源和子资源，而不是只看源文件路径。

## 目录角色

- `assets/`：当前项目资源源，对应 `db://assets/`。
- `.meta`：资产身份、导入配置和子资源元数据。
- `library/`：由源资源和导入配置生成的派生数据。
- `build/`：执行构建后可能产生的输出，不属于资源导入事实源。

目录的详细分类、可选空态及插件资源库边界见 [项目结构](../concepts/project-structure.md)。“派生”只说明来源，不代表当前任务已获准删除或重建。

## 问题分流

| 问题 | 继续阅读 |
|---|---|
| `.meta` 保存什么、UUID 和子资源如何标识 | [资源 .meta 文件与 UUID](../concepts/asset-meta-uuid.md) |
| `.meta` 丢失、引用恢复、迁移或协作冲突 | [.meta 与 UUID 实战要点](./meta-uuid.md) |
| `assets/`、`library/`、`extensions/` 或 `db://` 来源 | [项目结构](../concepts/project-structure.md) |
| `resources.load` 与 `assets/resources/` | [resources 目录使用指南](./resources-folder.md) |
| 运行时按需加载 | [动态加载资源](./dynamic-loading.md) |
| Bundle、分包和构建收集 | [Asset Bundle](./asset-bundle.md) |
| 资源加载失败 | [资源加载失败排查](../troubleshooting/resource-load-failed.md) |

## 常见误判

- 把 `library/` 当作可以替代源资源与 `.meta` 的备份。
- 只凭路径或文件名判断 Scene/Prefab 引用的资产身份。
- 把导入、运行时加载、Bundle 划分和资源释放混成同一个流程。
- 因为目录可派生就直接执行删除或重建。

## 关联文档

- [项目结构](../concepts/project-structure.md)
- [资源 .meta 文件与 UUID](../concepts/asset-meta-uuid.md)
- [.meta 与 UUID 实战要点](./meta-uuid.md)
- [resources 目录使用指南](./resources-folder.md)
- [动态加载资源](./dynamic-loading.md)
- [Asset Bundle](./asset-bundle.md)

## 来源

- Cocos Creator 3.8 官方文档：[资源工作流程](https://docs.cocos.com/creator/3.8/manual/zh/asset/asset-workflow.html)
