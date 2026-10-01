---
id: cocos-3.8-assets-cache-manager
version: "3.8"
category: assets
title: CacheManager — 远程资源缓存
keywords:
  - CacheManager
  - 缓存管理器
  - 远程资源缓存
  - 资源缓存
  - 缓存不更新
  - 小游戏缓存
  - assetManager.cacheManager
  - clearCache
  - LRU
  - 缓存更新
  - MD5 Cache
  - autoClear
  - deleteInterval
  - cachedFiles
related_docs:
  - assets/asset-bundle.md
  - assets/dynamic-loading.md
  - assets/subpackage.md
  - assets/release.md
  - troubleshooting/hot-update-failed.md
  - api-reference/asset-manager.md
related_api:
  - assetManager.cacheManager
  - AssetManager.CacheManager
source:
  official: "Cocos Creator 3.8 官方文档 - 缓存管理器"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：缓存管理器行为因平台差异大，以真机测试为准"
status: needs-review
updated: 2026-06-18
---

# CacheManager — 远程资源缓存

> **此文档标记为 needs-review**：缓存管理器在小游戏和原生平台的行为差异较大（缓存大小限制、LRU 策略、临时目录行为各有不同），实际排查时应以目标平台官方文档和真机测试为准。

> **关键区分：CacheManager（缓存管理器）与热更新（AssetsManager）是两个独立机制。**
> - `assetManager.cacheManager`：管理从远程服务器下载的**单个资源文件**的缓存生命周期，适用于小游戏和原生平台的远程 Asset Bundle 资源。通过 LRU 策略管理缓存空间，配合 MD5 Cache 实现版本控制。
> - `native.AssetsManager`：用于**原生平台**整包热更新，通过 manifest 版本比对下载差异文件。
> - **MD5 Cache 兼容性**：构建面板的 MD5 Cache 选项**兼容** CacheManager 的缓存机制（改变文件名使旧缓存自然失效），但与热更新 AssetsManager **冲突**（会使 manifest 路径不匹配）。

## 用途

说明 Cocos Creator 3.8 中缓存管理器（CacheManager）的基本心智模型，帮助智能体处理"远程资源下载后缓存不更新""小游戏资源缓存异常"等排查问题。

## 核心结论

- **CacheManager 只在存在文件系统的平台生效**：小游戏平台（微信/抖音/OPPO/vivo 等）和原生平台。Web 平台由浏览器管理缓存，引擎不介入。
- **资源下载与缓存路径**：
  1. 先查是否在游戏包内（Bundle） —— 在则直接使用。
  2. 不在包内则查本地缓存目录 —— 在则使用缓存。
  3. 不在缓存则查临时目录（小游戏平台） —— 在则使用。
  4. 都不在则从远程服务器下载，下载到临时目录后立即使用。
  5. 后台缓慢将临时目录中的资源写入缓存目录。
- **缓存容量控制**：小游戏平台缓存空间有限，占满后使用 LRU 策略删除较久远的资源。原生平台无大小限制，不自动清理。
- **版本管理**：勾选 **MD5 Cache** 后，文件 URL 随内容改变，旧缓存自然失效。

> 平台限制说明：缓存管理器在小游戏和原生平台的行为差异较大（缓存大小限制、LRU 策略、临时目录行为各有不同），markdown 格式的文档难以穷举所有平台差异。实际排查时应以目标平台的官方文档和真机测试为准。

## 关键 API

| 成员 | 类型 | 作用 |
|---|---|---|
| `cacheManager.getCache(originUrl)` | 方法 → `string` | 查询资源的缓存路径 |
| `cacheManager.getTemp(originUrl)` | 方法 → `string` | 查询资源的临时路径（仅小游戏平台有效） |
| `cacheManager.clearCache()` | 方法 → `void` | 清除所有缓存（谨慎使用，建议在游戏启动前调用） |
| `cacheManager.clearLRU()` | 方法 → `void` | 使用 LRU 策略清理部分缓存（小游戏空间满时自动调用） |
| `cacheManager.removeCache(originUrl)` | 方法 → `void` | 清除单个缓存资源 |
| `cacheManager.cacheEnabled` | 属性 `boolean` | 控制是否缓存，可设为 `false` 禁用 |
| `cacheManager.cacheInterval` | 属性 `number` | 缓存写入间隔，默认 `500` ms |
| `cacheManager.autoClear` | 属性 `boolean` | 是否在存储满后自动清理缓存（仅小游戏平台有效） |
| `cacheManager.deleteInterval` | 属性 `number` | 清理资源的间隔时间，单位 ms |
| `cacheManager.cachedFiles` | 属性 `Cache<...>` | 所有缓存文件列表，包含 `bundle`、`url`、`lastTime` 信息 |
| `cacheManager.cacheDir` | 属性 `string` | 缓存目录的名称 |

## 公开导出结论

- `AssetManager.CacheManager` 在 `cc` 模块公开导出，为抽象类。
- `assetManager.cacheManager` 在 `cc` 模块公开导出，为 `CacheManager | null` 类型（Web 平台为 null）。
- 所有列出的属性/方法均在类型声明中公开，且与引擎源码行为一致。
- `cacheEnabled`、`autoClear`、`cacheInterval`、`deleteInterval` 仅在小游戏平台有效；原生平台由引擎内部管理，无缓存大小限制。

## 常见错误

### 1. 缓存不更新

**现象**：远程资源更新后，游戏中加载的仍是旧版本。

**最可能原因**：未开启 **MD5 Cache**，浏览器或缓存管理器用旧缓存文件覆盖了新的请求。

**检查与修复**：
- 在构建发布面板勾选 **MD5 Cache**。开启后资源文件名随内容变化，旧缓存自然失效。
- 加载远程 Bundle 时传入版本号：`assetManager.loadBundle('https://...', { version: '1.0.2' }, cb)`。
- 手动清除缓存：`assetManager.cacheManager.clearCache()`。微信小游戏也可以在开发者工具中 **工具 -> 清除缓存 -> 全部清除**。
- 升级引擎版本后，旧版本缓存的资源可能与新引擎不兼容，需手动清空。

### 2. 小游戏资源下载失败

**现象**：远程资源在真机上无法下载，开发者工具中正常。

**原因**：开发者工具没有缓存大小限制，真机有。缓存空间占满后新资源无法保存，只能使用临时目录——退出小游戏后临时目录被清理。

**检查与修复**：
- 在真机（而非开发者工具）中测试缓存行为。
- 调用 `assetManager.cacheManager.clearLRU()` 手动触发生效的 LRU 清理。
- 检查 `cacheManager.autoClear` 是否为 `true`（小游戏平台默认为 true）。
- 考虑将非热点资源改为按需下载而非全量缓存。

### 3. 加载远程 Bundle 失败

**原因**：
- 未在构建面板配置 **资源服务器地址**。
- 远程服务器跨域限制。
- 小游戏平台需要配置域名白名单。

**修复**：确保资源服务器地址正确，小游戏平台在开发者后台配置服务器域名白名单。

## 关联文档

- [Asset Bundle 使用指南](asset-bundle.md)
- [动态加载资源](dynamic-loading.md)
- [分包与小游戏分包](subpackage.md)
- [资源释放](release.md)
- [热更新失败排错（不同于 CacheManager）](../troubleshooting/hot-update-failed.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 缓存管理器
- 已交叉验证：cc-engine 3.8 公开类型声明（`AssetManager.CacheManager` 抽象类及其 10 个公开成员）；cc-engine 3.8 引擎源码（`cache-manager.ts` 确认抽象类设计、`autoClear` 和 `deleteInterval` 存在）
- 补充：工程经验——缓存管理器行为因平台差异大，小游戏真机测试与开发者工具表现不同
