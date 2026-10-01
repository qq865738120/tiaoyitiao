---
id: cocos-3.8-concepts-project-structure
version: "3.8"
category: concepts
title: 项目结构
keywords:
  - 项目目录结构
  - assets 目录
  - settings 目录
  - extensions 目录
  - package.json
  - AssetDB
  - db://assets
  - db://internal
  - 项目文件夹
related_docs:
  - concepts/asset-meta-uuid.md
  - concepts/engine-overview.md
  - assets/asset-workflow.md
related_api: []
source:
  official: "Cocos Creator 3.8 官方文档 - 项目结构与扩展资源数据库"
  verified-against: []
  supplement: []
status: draft
updated: 2026-08-03
---

# 项目结构

## 用途

说明 Cocos Creator 3.8 项目根、常见目录及 AssetDB 资源库边界。本文只做结构分类，不给出删除、重建或版本控制授权。

## 核心结论

- 同时存在 `assets/` 和 `package.json` 是识别 Creator 项目根的基本标志；不要把 `assets/` 子目录、`library/` 或 `build/` 当作项目根。
- `assets/` 是当前项目的 AssetDB 资源根，对应 `db://assets/`；`db://internal/` 是引擎内置资源库。
- `extensions/` 是插件目录，通常不属于游戏项目资源。插件可以挂载自带资源库并使用独立 `db://<插件包名>/...` 协议；这些资源不属于 `db://assets/`。
- `library/`、`temp/`、`local/` 和 `build/` 分别属于派生数据、临时状态、本机状态或条件生成输出，不能作为项目源文件的默认事实来源。
- 常见目录可能因项目状态和配置而不存在；缺失本身不等于项目损坏。

## 什么时候使用

- 判断给定路径是否是 Creator 项目根。
- 区分项目资源、引擎内置资源和插件挂载资源。
- 判断目录属于源数据、项目配置、派生数据、临时状态还是构建输出。
- 排查“目录不存在”是否真的意味着项目损坏。

## 常见目录和文件

| 目录/文件 | 分类 | 说明 |
|---|---|---|
| `assets/` | 项目资源源 | 游戏资源、脚本和项目内第三方资源的 AssetDB 根，对应 `db://assets/` |
| `settings/` | 项目配置 | Creator 项目设置 |
| `package.json` | 项目标志/配置 | 与 `assets/` 一起构成项目根的基本标志 |
| `extensions/` | 插件层 | 可选插件目录；不是游戏项目资源根，插件资源可挂载为独立 DB |
| `library/` | 导入派生数据 | 由资源和导入配置生成的编辑器数据，不是资产身份的唯一事实源 |
| `temp/` | 临时状态 | 编辑器运行过程中产生的临时数据 |
| `local/` | 本机状态 | 本机日志、布局或其它不应推断为跨机器项目事实的状态 |
| `build/` | 条件构建输出 | 只有执行相应构建后才可能存在 |
| `profiles/` | 编辑器配置 | 是否存在及其内容取决于 Creator 状态和配置 |

## AssetDB 资源库边界

资源管理器可同时显示多个数据库来源：

- `db://assets/...`：当前游戏项目 `assets/` 下的资源。
- `db://internal/...`：Creator 引擎内置资源。
- `db://<插件包名>/...`：插件注册并挂载的自带资源库；实际协议名和能力以插件及 AssetDB 事实为准。

因此，“资源管理器中可见”不等于“属于项目 `assets/`”，也不能据此推断资源可写。

## 与 `.meta` 的关系

`assets/` 下导入的资源或目录通常配有 `.meta`，用于保存 UUID、导入配置和子资源元数据。资源身份细节见 [资源 .meta 文件与 UUID](./asset-meta-uuid.md)；资源丢失或恢复问题见 [.meta 与 UUID 实战要点](../assets/meta-uuid.md)。

## 常见误判

- 仅因某个目录名叫 `assets` 就把它当成项目根。
- 把 `library/` 中的派生内容当作资源源文件。
- 把 `extensions/` 下插件自带资源归入 `db://assets/`。
- 因为 `build/`、`temp/` 或 `local/` 不存在就判定项目损坏。
- 从“派生目录”直接推导出“可以删除或重建”；实际操作必须服从当前任务授权、仓库规则和编辑器状态。

## 关联文档

- [资源 .meta 文件与 UUID](./asset-meta-uuid.md)
- [资源导入与工作流](../assets/asset-workflow.md)
- [引擎与编辑器概览](./engine-overview.md)

## 来源

- Cocos Creator 3.8 官方文档：[项目结构](https://docs.cocos.com/creator/3.8/manual/zh/getting-started/project-structure/index.html)
- Cocos Creator 3.8 官方文档：[扩展资源数据库](https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/contributions-database.html)
