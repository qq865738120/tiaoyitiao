---
id: cocos-3.8-assets-texture-compression
version: "3.8"
category: assets
title: 纹理压缩 — 包体、显存与画质的平衡
keywords:
  - 纹理压缩
  - 压缩纹理
  - ASTC
  - ETC1
  - ETC2
  - PVRTC
  - 包体优化
  - 显存占用
  - GPU 压缩
  - 纹理格式
  - 黑图
  - 花屏
  - 格式不支持
  - useCompressTexture
  - 压缩纹理预设
related_docs:
  - assets/image-texture-spriteframe.md
  - assets/auto-atlas-dynamic-atlas.md
  - assets/asset-bundle.md
  - troubleshooting/package-too-large.md
  - ui-2d/draw-call-batching.md
related_api:
  - Texture2D
  - SpriteFrame
  - macro.SUPPORT_TEXTURE_FORMATS
  - ImageAsset
source:
  official: "Cocos Creator 3.8 官方文档 - 压缩纹理"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：压缩纹理的格式选择直接影响包体、显存、加载速度和画质，需在四者间权衡"
status: draft
updated: 2026-06-18
---

# 纹理压缩 — 包体、显存与画质的平衡

## 用途

说明纹理压缩的作用、常见格式的适用范围、压缩配置方法，以及黑图/花屏/格式不支持的排查方向。帮助智能体处理"包体太大""纹理内存高""图片显示异常"等问题。

## 核心结论

- 纹理压缩影响四个维度：**包体体积、显存占用、加载速度、画质**。同一张图片在这四个维度上需要权衡，不存在万能的压缩格式。
- **SpriteFrame 与 Texture2D 的关系**：一个图片文件导入后生成 `ImageAsset`（源数据）、`Texture2D`（GPU 贴图）、`SpriteFrame`（精灵帧，附加裁剪/九宫格信息）。纹理压缩作用于底层的 `Texture2D`，`SpriteFrame` 本身不存储像素数据。
- 引擎在构建时根据压缩纹理预设生成多种格式的纹理文件，运行时根据 `macro.SUPPORT_TEXTURE_FORMATS` 选择匹配的格式加载。配置时建议额外加入 PNG/JPG 作为兜底格式，防止不支持 GPU 压缩格式的设黑白屏。
- 常见 GPU 压缩格式：ASTC、ETC1、ETC2、PVRTC。**对不支持格式直接写死平台完整表存在过时风险**，应按以下思路分诊：
  - 新项目首选 **ASTC**（2012 年发布，移动端已接近 100% 支持），兼顾画质与压缩率。
  - Android 旧设备可考虑 ETC1（不支持透明通道）/ ETC2（支持透明通道，需硬件支持）。
  - iOS 旧设备可考虑 PVRTC。
  - WEBP 是非 GPU 压缩格式，仅减少包体，不影响运行时显存。

## 压缩配置流程

1. 在 **资源管理器** 选中图片或自动图集，**属性检查器** 勾选 `useCompressTexture`。
2. 选择 `presetId`（压缩纹理预设），预设可在 **项目设置 -> 压缩纹理** 中自定义。
3. 预设中配置多种格式（含兜底 PNG/JPG），构建时会按各平台支持情况智能剔除不支持的格式。
4. 构建后引擎按 `macro.SUPPORT_TEXTURE_FORMATS` 中的顺序选择加载的格式。

## 常见错误

### 1. 黑图 / 花屏

**现象**：部分设备上图片显示为黑块或颜色异常。

**最可能原因**：构建时只生成了当前设备不支持的 GPU 压缩格式，没有包含 PNG/JPG 等通用格式作为兜底。

**检查与修复**：
- 检查压缩纹理预设中是否包含至少一种通用格式（PNG 或 JPG）。
- 在预设中添加 PNG/JPG 作为 fallback。
- 真机测试而非依赖模拟器——模拟器可能跳过硬件格式校验。

### 2. 压缩后图片反而变大

**原因**：`sharp` 库压缩率在某些场景下低于原始格式，或对待压缩的小图效果不明显。

**检查**：对比构建输出目录中图片的实际大小与原始大小。若变大，可考虑改用自定义纹理压缩插件或外部工具（如 tinypng）预处理。

### 3. 透明通道丢失

**现象**：图片透明区域变成纯黑或纯色块。

**原因**：使用了不支持透明通道的格式（如 ETC1 RGB）。注意在预设中同时配置 RGB 和 RGBA 类型时，构建会根据图片是否带透明通道自动择优选择合适的类型。

### 4. 编辑器中正常，构建后不显示

**原因**：纹理压缩在编辑器预览时默认不生效，仅在构建后生效。部署到真机时压缩格式不兼容导致显示异常。

**检查**：使用构建后的包在目标平台真机测试。

## 关联文档

- [图片、纹理与 SpriteFrame](image-texture-spriteframe.md)
- [自动图集与动态图集](auto-atlas-dynamic-atlas.md)
- [Asset Bundle 使用指南](asset-bundle.md)
- [包体过大排查](../troubleshooting/package-too-large.md)
- [2D 合批优化 — DrawCall 为什么高](../ui-2d/draw-call-batching.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 压缩纹理
- 已交叉验证：cc-engine 3.8 公开类型声明（`macro.SUPPORT_TEXTURE_FORMATS`、`Texture2D`）
- 补充：工程经验——压缩纹理需兼顾包体、显存、加载速度、画质四者，不存在万能格式
