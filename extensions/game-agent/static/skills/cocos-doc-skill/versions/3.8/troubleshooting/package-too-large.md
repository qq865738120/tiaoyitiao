---
id: cocos-3.8-troubleshooting-package-too-large
version: "3.8"
category: troubleshooting
title: 包体过大排查
keywords:
  - 包体太大
  - 包体优化
  - 构建包体大
  - 首包过大
  - 资源体积
  - 纹理压缩
  - 图集
  - Bundle
  - 分包
  - 未使用资源
  - 重复资源
  - 平台构建设置
  - 变小
related_docs:
  - assets/texture-compression.md
  - assets/auto-atlas-dynamic-atlas.md
  - assets/subpackage.md
  - assets/asset-bundle.md
  - assets/release.md
  - troubleshooting/build-errors.md
related_api:
  - assetManager
  - AssetManager.Bundle
  - Texture2D
  - SpriteAtlas
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 / Asset Bundle / 压缩纹理"
  verified-against: []
  supplement:
    - "工程经验：包体优化不是单一手段，需要按优先级逐步排查各个维度"
status: draft
updated: 2026-06-18
---

# 包体过大排查

## 现象

构建后的发布包（或小游戏上传包）体积超过平台限制（如微信小游戏主包超 4MB），或远大于预期。

## 排查顺序

按检查成本从低到高、收益从高到低排序。

### 1. 资源体积构成分析

**目的**：确认哪类资源占用了最大空间。

**操作**：
- 查看构建输出目录（`build/{platform}/`），按文件夹分析大小排名。
- 重点关注 `assets/`（Bundle 资源目录）、`raw-assets/`（原生资源目录）、`subpackages/`（分包目录）。
- 根据类型评估：**纹理（图片）**通常是包体最大贡献者，其次是模型/音频，JSON 配置通常很小。

### 2. 纹理压缩

**目的**：直接减少纹理资源的包体大小。

**操作**：
- 对 UI、场景中使用的图片资源配置压缩纹理（详见 [纹理压缩](../assets/texture-compression.md)）。
- 优先使用 ASTC 格式（压缩率高，画质好），并配置 PNG/JPG 作为兜底格式。
- 检查是否有大量 PNG/JPG 未压缩直接打包。
- 注意：压缩纹理仅对**构建产物**生效，编辑器预览时仍使用原图。

### 3. 图集策略

**目的**：减少重复的纹理数据，降低包体和 DrawCall。

**操作**：
- 使用自动图集（AutoAtlas）将 UI 碎图合并为一张大图（详见 [自动图集与动态图集](../assets/auto-atlas-dynamic-atlas.md)）。
- 检查图集大小是否合理（建议不超过 2048x2048，视目标设备而定）。
- 不要将图集文件夹直接配置为 Bundle——否则会同时打包原始小图和图集大图，导致包体膨胀。
- 确认自动图集的"剔除未使用的图片"选项已勾选。

### 4. Bundle / 分包

**目的**：将非首屏资源拆分出去，减少首包体积。

**操作**：
- 将所有非首屏必须的资源移入自定义 Bundle（详见 [Asset Bundle 使用指南](../assets/asset-bundle.md)）。
- 小游戏平台将 Bundle 压缩类型设为"小游戏分包"（详见 [小游戏分包](../assets/subpackage.md)）。
- 检查内置 Bundle 的配置：
  - `main` Bundle 是否包含了过多非首屏资源。
  - `resources` 目录是否放置了大量非必要资源。resources 目录下所有资源都会打包进 `resources` Bundle。
- 使用构建面板的 **初始场景分包** 将首场景分离出 main Bundle。

### 5. 未使用资源、重复资源与平台构建设置

**目的**：清理无用的体积负担。

**操作**：
- **未使用资源**：检查项目中是否有被移除但未删除的资源文件。Cocos 构建时按依赖引用打包，未被任何场景、Prefab、脚本引用的资源不会被打包入 Bundle，但如果资源在 resources 目录下则会被无条件打包。
- **重复资源**：检查是否有同名或同内容的资源被重复引用。不同 Bundle 中如果优先级相同，共享资源会被复制多份。
- **平台构建设置**：
  - 检查是否勾选了不必要的引擎模块（项目设置 -> 模块设置），移除不用的模块可减少引擎体积。
  - 确认构建发布面板中是否开启了 **MD5 Cache**（对包体大小无影响，但影响资源更新策略）。
  - 检查是否配置了过量的场景参与构建。

## 仍未解决时

- 使用第三方工具（如源文件分析）查看构建输出中哪些文件最大。
- 检查是否有大尺寸音频文件未被压缩（音频格式建议使用 mp3/aac 而非 wav）。
- 确认是否引用了大量第三方库代码导致脚本体积膨胀。
- 考虑使用远程资源（配置为远程包）将大资源托管至 CDN。
- 查看 Cocos Creator 3.8 官方文档中关于包体优化的进阶方案。

## 相关文档

- [纹理压缩 — 包体、显存与画质的平衡](../assets/texture-compression.md)
- [自动图集与动态图集](../assets/auto-atlas-dynamic-atlas.md)
- [小游戏分包与子包](../assets/subpackage.md)
- [Asset Bundle 使用指南](../assets/asset-bundle.md)
- [资源释放](../assets/release.md)
- [构建失败分诊](build-errors.md)
