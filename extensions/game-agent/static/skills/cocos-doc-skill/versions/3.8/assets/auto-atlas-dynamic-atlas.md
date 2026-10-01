---
id: cocos-3.8-assets-auto-atlas-dynamic-atlas
version: "3.8"
category: assets
title: 自动图集与动态图集 — 合批优化与资源管理
keywords:
  - 自动图集
  - 动态图集
  - AutoAtlas
  - DynamicAtlas
  - 图集
  - SpriteAtlas
  - 合批
  - DrawCall
  - 图集过大
  - 资源路径
  - SpriteAtlas
  - 图集合批
related_docs:
  - assets/texture-compression.md
  - assets/image-texture-spriteframe.md
  - assets/asset-bundle.md
  - assets/resources-folder.md
  - ui-2d/draw-call-batching.md
  - troubleshooting/performance-issues.md
related_api:
  - SpriteAtlas
  - SpriteFrame
  - DynamicAtlasManager
  - dynamicAtlasManager
  - macro.CLEANUP_IMAGE_CACHE
  - assetManager
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - 自动图集 / 动态合图"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：自动图集是构建期方案，动态图集是运行期方案，两者目的一致但机制完全不同"
status: draft
updated: 2026-06-18
---

# 自动图集与动态图集 — 合批优化与资源管理

## 用途

说明自动图集（AutoAtlas，构建期）和动态图集（DynamicAtlas，运行期）的区别、各自的使用场景、对 UI 合批和加载的影响，以及 SpriteFrame、Bundle、resources 之间的关系。

## 核心结论

- **自动图集（AutoAtlas）** 是**构建期**工具。通过 `auto-atlas.pac` 配置文件，在构建时将一叠碎图打包成一张大图（SpriteAtlas），减少运行时纹理切换。构建后碎图的原 texture/image 会被删除（除非被其他资源直接引用）。
- **动态图集（DynamicAtlas）** 是**运行期**机制。在游戏运行时动态将小尺寸贴图合并到大纹理中，使相邻 DrawCall 能合批。默认在小游戏和原生平台禁用。
- 两者的根本区别：自动图集在**构建时**完成，可控性强；动态图集在**运行期**自动触发，无需人工配置但占用运行时内存和性能。
- **SpriteFrame、Bundle、resources 的关系**：
  - `SpriteFrame` 是 2D 精灵帧资源，引用 `Texture2D` 存储像素数据。
  - 图集（SpriteAtlas）是 SpriteFrame 的集合，自动图集构建后产物即为 SpriteAtlas。
  - Bundle 是资源模块化单位，图集资源可以被放入 Bundle 实现按需加载。
  - `resources` 目录是默认的 Bundle，其中的 SpriteFrame 可通过 `resources.load` 加载。
  - **不建议直接将图集文件夹设为 Bundle**：否则图集大图 Image、小图 Image 等可能被全部打包，导致包体膨胀。

## 自动图集（AutoAtlas）

### 使用方式

1. 在资源管理器创建 **自动图集配置**（`auto-atlas.pac`）。
2. 该配置文件所在文件夹下的所有 SpriteFrame 自动参与打包。
3. 在属性检查器中配置最大宽高、间距、允许旋转、Power of Two 等参数。
4. 构建时自动打包，预览时仍使用碎图。

### 注意事项

- 图集最大尺寸不宜超过 2048x2048（按项目目标设备决定）。
- 避免将自动图集放入 Bundle 文件夹——可能导致包体膨胀（Bundle 会打包原始小图 + 图集大图两份）。
- 自动图集会预置 `useCompressTexture` 选项，可以与纹理压缩共同使用。
- 未参与场景引用的碎图默认不打包（勾选"剔除未使用的图片"）。

## 动态图集（DynamicAtlas）

### 启用/禁用

```ts
import { _decorator, macro, DynamicAtlasManager } from 'cc';

// 强制启用
macro.CLEANUP_IMAGE_CACHE = false;
DynamicAtlasManager.instance.enabled = true;

// 禁用
DynamicAtlasManager.instance.enabled = false;
```

> **注意**：这些代码写在脚本最外层（非 `onLoad`/`start` 等类方法中），确保在项目加载过程中即时生效。

### 适用限制

- 默认只有宽高都小于 **512** 的贴图才能进入动态图集。可通过 `DynamicAtlasManager.instance.maxFrameSize = 512` 调整。
- 动态图集会占用额外显存，在小游戏和原生平台默认禁用。
- 动态图集会在渲染阶段自动执行，对开发者透明，但无法精细控制哪些贴图进入图集。

## SpriteFrame、Bundle、resources 的协作

| 概念 | 作用 | 加载方式 |
|---|---|---|
| `SpriteFrame` | 精灵帧资源，用于 Sprite 组件 | `resources.load('path/spriteFrame', SpriteFrame, cb)` |
| `SpriteAtlas` | 图集资源，包含多个 SpriteFrame | `atlas.getSpriteFrame('frameName')` 获取帧 |
| `Bundle` | 资源模块，按需加载 | `assetManager.loadBundle('name', cb)` 后 `bundle.load(...)` |
| `resources` | 内置 Bundle，固定目录 | `resources.load(...)` 等同于加载 resources Bundle |

## 常见错误

### 1. 合批失败

**原因**：
- 相邻 UI 节点使用了不同图集（不同纹理）的 SpriteFrame。
- Sprite 和 Label 等不同组件类型穿插排列。
- 运行时动态换图使用了来自不同图集的 SpriteFrame。

**检查**：参考 [2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md) 的排查流程。

### 2. 图集过大

**现象**：构建时提示图集超出设备支持最大纹理尺寸。

**原因**：自动图集的"最大宽度/最大高度"设置超出目标设备支持的纹理上限（常见 2048 或 4096），或碎图数量过多导致需要多张图集。

**修复**：降低自动图集的最大尺寸，或将碎图分到多个自动图集配置中。

### 3. 资源路径误解

**现象**：从图集的 Bundle 中加载 SpriteFrame 时找不到资源。

**原因**：图集被打包到 Bundle 后，其内部的 SpriteFrame 路径遵循 bundle 内的相对路径，而非原始 assets 路径。

**检查**：调用 `bundle.loadDir` 确认 Bundle 中实际包含哪些 SpriteFrame。

### 4. 动态图集意外禁用

**现象**：UI DrawCall 数量异常高，排查后发现动态图集未启用。

**检查**：`DynamicAtlasManager.instance.enabled` 状态。注意默认在小游戏和原生平台禁用。

### 5. 图集放入 Bundle 导致包体变大

**原因**：Bundle 内的图集资源会同时保留原始小图 Image + 图集大图 Image 两份数据，显著增大包体。

**建议**：不要直接将图集文件夹设为 Bundle，而是通过 Bundle 内资源的引用来自然打包依赖。

## 关联文档

- [纹理压缩](texture-compression.md)
- [图片、纹理与 SpriteFrame](image-texture-spriteframe.md)
- [Asset Bundle 使用指南](asset-bundle.md)
- [resources 目录使用指南](resources-folder.md)
- [2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md)
- [游戏性能问题分诊](../troubleshooting/performance-issues.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 自动图集 / 动态合图
- 已交叉验证：cc-engine 3.8 公开类型声明（`DynamicAtlasManager`、`SpriteAtlas`、`SpriteFrame`）
- 补充：工程经验——自动图集和动态图集是互补方案，优先使用自动图集
