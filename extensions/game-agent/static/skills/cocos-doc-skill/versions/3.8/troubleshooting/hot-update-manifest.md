---
id: cocos-3.8-troubleshooting-hot-update-manifest
version: "3.8"
category: troubleshooting
title: 热更新 — Manifest 配置与版本管理
keywords:
  - manifest
  - version.manifest
  - project.manifest
  - 版本管理
  - 热更版本号
  - 版本比较
  - remoteUrl
  - remoteManifestUrl
  - 热更版本比较
  - 版本号对比
  - 热更manifest
related_docs:
  - troubleshooting/hot-update-failed.md
  - concepts/native-jsb-overview.md
related_api:
  - native.Manifest
source:
  official: "Cocos Creator 3.8 官方文档 - 热更新教程、Manifest 结构"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：manifest 配置是热更新最常见的出错点"
status: draft
updated: 2026-06-18
---

# 热更新 — Manifest 配置与版本管理

## 现象

游戏启动后没有触发资源下载，或版本号已提高但客户端仍显示已是最新。

## Manifest 关键字段

```
{
  "packageUrl":           // 远程资源的本地缓存根路径
  "remoteVersionUrl":    // [可选] 远程版本文件路径，用于快速判断是否有新版本
  "remoteManifestUrl":   // 远程 Manifest 文件的路径
  "version":             // 资源的版本号，支持 x.x.x.x 格式
  "engineVersion":       // 引擎版本
  "assets": {            // 所有资源列表
    "key": {             // key = 资源相对路径
      "md5": "...",      // md5 值代表资源文件的版本信息
      "compressed": false,
      "size": 1024
    }
  },
  "searchPaths": []      // 需要添加到 FileUtils 中的搜索路径列表
}
```

## 快速检查

### 版本号检查

- **[ ] 远程 `version` 值大于客户端本地版本号**：引擎默认按分段数值逐段比较（如 `1.0.2.0` > `1.0.1.9`）。如需自定义比较，通过 `assetsManager.setVersionCompareHandle()` 注册。
- **[ ] `packageUrl`、`remoteManifestUrl`、`remoteVersionUrl` 在浏览器中可直接访问。
- **[ ] URL 以 `https://` 或 `http://` 开头，推荐以 `/` 结尾。

### 服务器配置

- **[ ] 配置正确的 MIME 类型**：推荐 `application/octet-stream` 或 `text/plain`，避免浏览器缓存干扰。
- **[ ] CORS 配置**：浏览器预览测试时需要；原生平台通常不受限制。

### 版本比较逻辑

内置比对函数按分段数值逐段比较，段数不同时需注意对齐。如需自定义：

```ts
assetsManager.setVersionCompareHandle((versionA: string, versionB: string) => {
  // 返回负数表示 versionA < versionB, 0 相等, 正数 versionA > versionB
  return customCompare(versionA, versionB);
});
```

## 解决方案

### manifest 版本号不对

更新 `version_generator.js` 脚本的 `-v` 参数，或在生成后的 manifest 中更新 `version` 字段。

```json
{
  "packageUrl": "https://cdn.example.com/game/",
  "remoteVersionUrl": "https://cdn.example.com/game/version.manifest",
  "remoteManifestUrl": "https://cdn.example.com/game/project.manifest",
  "version": "1.0.2",
  "engineVersion": "3.8.x",
  "assets": { },
  "searchPaths": []
}
```

客户端本地版本可通过 `assetsManager.getLocalManifest().getVersion()` 查看。

### MD5 Cache 冲突（最易被忽略）

**[ ] 确认构建时未勾选 MD5 Cache**。勾选后资源文件名随内容变化，manifest 中的路径与构建产物不匹配，即使远程版本号更高也无法正确下载和替换文件。

如果已勾选：
1. 取消 MD5 Cache 后重新构建。
2. 重新生成 manifest（使用 `version_generator.js`）。
3. 将新的构建产物和 manifest 重新上传到服务器。

### remoteUrl / packageUrl 不可达

- 确保 URL 以 `https://` 或 `http://` 开头。
- 推荐以 `/` 结尾避免路径拼接问题。
- 检查域名 DNS 是否能正确解析。
- `packageUrl`、`remoteManifestUrl`、`remoteVersionUrl` 三者应保持一致性。

## 相关文档

- [热更新失败排错（主入口）](./hot-update-failed.md)
- [热更新 — 搜索路径与资源更新机制](./hot-update-search-paths.md)
- [原生 / JSB 概述](../concepts/native-jsb-overview.md)
