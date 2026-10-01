---
id: cocos-3.8-troubleshooting-hot-update-search-paths
version: "3.8"
category: troubleshooting
title: 热更新 — 搜索路径与资源更新机制
keywords:
  - 搜索路径
  - searchPaths
  - 热更搜索路径
  - 热更新不生效
  - 热更新重启
  - 热更搜索路径
  - 热更新原生边界
  - 资源服务器
related_docs:
  - troubleshooting/hot-update-failed.md
  - troubleshooting/hot-update-manifest.md
related_api:
  - native.AssetsManager
  - native.fileUtils
source:
  official: "Cocos Creator 3.8 官方文档 - 热更新教程"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：搜索路径注入时机和顺序是热更新生效的关键"
status: draft
updated: 2026-06-18
---

# 热更新 — 搜索路径与资源更新机制

## 现象

热更新下载完成后，游戏内容还是旧版本，或更新后游戏启动崩溃。

## 快速检查

### 搜索路径理解

Manifest 中的 `searchPaths` 字段记录热更新下载的资源目录路径：

- **搜索路径优先级**：`native.fileUtils` 维护搜索路径数组，热更新目录被添加到数组最前面，优先命中。
- **注入时机**：搜索路径必须在 `main.js` 中、`require` 引擎脚本之前设置好，否则已加载的旧脚本会按旧路径加载资源。
- **多条路径冲突**：多个 Asset Bundle 使用不同存储目录时，确保搜索路径顺序正确，避免旧版本资源被错误匹配。
- **`setSearchPaths` 与 `addSearchPath`**：`setSearchPaths` 会覆盖所有已有路径；`addSearchPath` 在数组末尾追加。热更新路径通常应通过 `unshift` 插入到最前面。

### 原生环境边界

- **引擎核心代码不可热更**：只能更新 JS 脚本、资源配置和 Asset Bundle，不能更新原生 .so / .a 库和引擎核心代码。
- **引擎版本兼容性**：`engineVersion` 记录构建时引擎版本，跨版本热更新可能导致不兼容。
- **多 Bundle 热更新**：每个 Asset Bundle 有独立的 Manifest，需分别管理版本号和更新逻辑。
- **重启生效**：热更新完成后必须重启游戏，新的 JS 脚本和资源配置需要干净的执行上下文。
- **存储空间**：确保设备有足够的存储空间下载和解压资源。

### 网络与权限

- **[ ] 原生设备是否能正常联网？在 `onerror` 回调中打印错误信息。
- **[ ] Android 是否有 `INTERNET` 权限？`<uses-permission android:name="android.permission.INTERNET" />`。
- **[ ] iOS 是否被 ATS 阻止 HTTP？使用 HTTP 时需在 Info.plist 添加 `NSAppTransportSecurity` 例外。
- **[ ] 下载路径是否有足够的磁盘空间？

## 解决方案

### 更新完成后不生效

**必须重启游戏**：热更新完成后，JS 脚本需要新的干净环境。搜索路径必须在 `main.js` 中、require 其他脚本之前设置：

```ts
import { NATIVE } from 'cc/env';
if (NATIVE) {
  const assetsManager = new native.AssetsManager(manifestUrl, storagePath);
  const hotUpdateSearchPaths = assetsManager.getLocalManifest().getSearchPaths();
  const searchPaths = native.fileUtils.getSearchPaths();
  Array.prototype.unshift.apply(searchPaths, hotUpdateSearchPaths);
  native.fileUtils.setSearchPaths(searchPaths);
}
```

不要混用热更新路径和 CacheManager 的缓存路径，两者是独立的存储目录。

### 资源下载失败

使用事件监听获取下载详情和错误码：

```ts
import { native, sys } from 'cc';

function startHotUpdate(manifestUrl: string, storagePath: string) {
  if (!sys.isNative) {
    console.warn('非原生环境，热更新不可用');
    return;
  }
  const assetsManager = new native.AssetsManager(manifestUrl, storagePath);

  assetsManager.setEventCallback((event: native.EventAssetsManager) => {
    switch (event.getEventCode()) {
      case native.EventAssetsManager.ERROR_UPDATING:
        console.error(`更新错误: ${event.getMessage()}, assetId: ${event.getAssetId()}`);
        break;
      case native.EventAssetsManager.UPDATE_FAILED:
        console.error(`更新失败: ${event.getMessage()}`);
        assetsManager.downloadFailedAssets();
        break;
      case native.EventAssetsManager.UPDATE_FINISHED:
        console.log('更新完成，需要重启游戏');
        break;
      case native.EventAssetsManager.UPDATE_PROGRESSION:
        console.log(`进度: ${event.getDownloadedFiles()}/${event.getTotalFiles()}`);
        break;
    }
  });

  assetsManager.setMaxConcurrentTask(10);
  assetsManager.checkUpdate();
}
```

### 完整性校验

通过 `assetsManager.setVerifyCallback()` 对下载后的每个文件进行额外校验，校验失败将重新下载。

## 相关文档

- [热更新失败排错（主入口）](./hot-update-failed.md)
- [热更新 — Manifest 配置与版本管理](./hot-update-manifest.md)
- [原生 / JSB 概述](../concepts/native-jsb-overview.md)
- [CacheManager — 远程资源缓存](../assets/cache-manager.md)
