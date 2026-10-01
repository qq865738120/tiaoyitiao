---
id: cocos-3.8-troubleshooting-hot-update-failed
version: "3.8"
category: troubleshooting
title: 热更新失败排错
keywords:
  - 热更新失败
  - 热更新
  - 热更
  - hot update
  - 资源更新
  - 热更不生效
  - manifest
  - 版本管理
  - 资源服务器
  - remoteUrl
  - Asset Bundle 更新
  - AssetsManager
  - 热更新重启
  - UPDATE_FAILED
related_docs:
  - troubleshooting/hot-update-manifest.md
  - troubleshooting/hot-update-search-paths.md
  - concepts/native-jsb-overview.md
  - assets/cache-manager.md
  - troubleshooting/build-errors.md
  - troubleshooting/performance-issues.md
related_api:
  - native.AssetsManager
  - native.EventAssetsManager
  - native.Manifest
source:
  official: "Cocos Creator 3.8 官方文档 - 热更新教程、热更新管理器 AssetsManager、Manifest 结构"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：热更新涉及平台合规、版本管理和服务器配置，默认 needs-review"
status: needs-review
updated: 2026-06-18
---

# 热更新失败排错

> 注意：热更新涉及平台合规政策（iOS App Store / Google Play / 小游戏平台），不同平台对热更的允许范围不同。本文档仅做技术排查，**不做热更新合规承诺**。默认标记为 `needs-review`。

> **关键区分：热更新（AssetsManager）与缓存管理（CacheManager）是两个独立机制。**
> - `native.AssetsManager`：用于**原生平台**（iOS/Android）的整包资源热更新，通过 manifest 版本比对下载差异文件。
> - `assetManager.cacheManager`：用于**小游戏/原生平台**的远程资源缓存控制（如远程 Asset Bundle），通过 LRU 策略管理缓存空间。
> - 两者不可混用，排查时先确认使用的是哪种机制。

## 现象

游戏发布到原生平台后，希望在不重新发版的情况下更新资源，但：
- 启动时没有触发资源下载。
- 下载完成后资源没更新。
- 下载过程中报错（网络错误、解压失败）。
- 更新后游戏崩溃。
- 只有部分资源被更新。

## 一级分诊路径（按大概率到小概率排序）

1. **平台是否支持**：`native.AssetsManager` 仅在原生平台（iOS / Android）可用。Web、小游戏、HarmonyOS 不支持。
2. **构建时误勾选 MD5 Cache**：导致 manifest 文件路径与构建产物不匹配，热更新无效。
3. **manifest 配置错误**：`version`、`packageUrl`、`remoteManifestUrl` 等字段不正确。
4. **资源服务器地址错误**：远程 URL 不可达或路径不对。
5. **版本号未递增**：本地版本 >= 远程版本，不执行更新。
6. **manifest md5 校验不匹配**：文件发生了变更但未触发更新。
7. **资源路径权限**：更新后的资源写入目录被系统保护。
8. **代码热更限制**：iOS 禁止原生代码热更新，不能更新 .so/.a 库和引擎核心代码。

## 快速检查

### 平台支持

- [ ] 使用 `sys.isNative` 判断当前运行在原生平台：
  ```ts
  import { sys } from 'cc';
  if (!sys.isNative) {
    console.warn('native.AssetsManager 仅在原生平台可用');
    return;
  }
  ```
- [ ] **Web 平台**不支持热更新。
- [ ] **小游戏平台**不支持，使用 `assetManager.cacheManager` 管理远程资源缓存。
- [ ] **HarmonyOS** 热更新支持情况需查阅最新引擎版本文档。

### MD5 Cache 冲突

- [ ] **构建时未勾选 MD5 Cache**（最重要检查）。勾选后资源文件名变化，manifest 路径不匹配。
- [ ] 如已勾选并发布过，必须取消勾选并重新构建后再上传热更新资源。

### 日志检查

- [ ] **原生日志**：iOS → Xcode 控制台；Android → `adb logcat -s CocosJS`。
- [ ] **热更新事件日志**：通过 `assetsManager.setEventCallback()` 监听 `ERROR_NO_LOCAL_MANIFEST`、`ERROR_DOWNLOAD_MANIFEST`、`UPDATE_FAILED` 等事件码。

### 版本与资源路径

- [ ] 远程 version > 本地版本（引擎默认分段数值比较）。
- [ ] `packageUrl`、`remoteManifestUrl`、`remoteVersionUrl` 在浏览器中可访问。
- [ ] URL 以 `https://` 或 `http://` 开头，推荐以 `/` 结尾。

## 仍未解决时

确认问题类别后，进入对应子页获取详细步骤：

- **manifest 配置、版本号管理** → [hot-update-manifest.md](./hot-update-manifest.md)
- **搜索路径注入、资源更新机制、下载失败处理** → [hot-update-search-paths.md](./hot-update-search-paths.md)
- **需要人工复核的最新平台限制** → 查阅各平台最新审核政策

常规排查：
1. 检查构建产物中 `version.manifest` 和 `project.manifest` 的版本和 URL 字段。
2. 使用 `adb logcat -s CocosJS`（Android）或 Xcode 控制台（iOS）查看详细日志。
3. 用 Charles / Fiddler 抓包确认网络请求是否发出。
4. 查阅官方文档中 Hot Update 最新章节。
5. 尝试使用全新的、干净的构建环境重新打包测试。

## 相关文档

- [热更新 Manifest 配置与版本管理](./hot-update-manifest.md)
- [热更新 搜索路径与资源更新机制](./hot-update-search-paths.md)
- [原生 / JSB 概述](../concepts/native-jsb-overview.md)
- [CacheManager — 远程资源缓存（不同于热更新）](../assets/cache-manager.md)
- [构建错误分诊](./build-errors.md)
