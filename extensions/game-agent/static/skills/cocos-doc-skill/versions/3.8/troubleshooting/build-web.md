---
id: cocos-3.8-troubleshooting-build-web
version: "3.8"
category: troubleshooting
title: Web 构建失败
keywords:
  - Web 构建失败
  - Web 打包
  - Web Mobile 构建
  - Web Desktop 构建
  - 浏览器运行报错
  - 构建产物无法访问
  - 白屏
  - 资源加载 404
related_docs:
  - troubleshooting/build-errors.md
  - troubleshooting/performance-issues.md
  - recipes/command-line-build.md
related_api: []
source:
  official: "Cocos Creator 3.8 官方文档 - 构建发布 - 发布到 Web 平台"
  verified-against: []
  supplement:
    - "工程经验：Web 构建失败需从日志位置、构建配置、浏览器控制台、资源路径和浏览器兼容性五个维度排查"
status: draft
updated: 2026-06-18
---

# Web 构建失败

## 现象

在 Cocos Creator 编辑器中构建 Web Mobile 或 Web Desktop 平台时，构建过程报错中断，或构建产物在浏览器中打开后出现白屏、资源加载失败、功能异常。

## 最可能原因

1. **构建配置错误** — 资源服务器地址、主包压缩类型、MD5 缓存设置不当。
2. **资源引用丢失** — 场景或 Prefab 中引用的资源已被移动或删除。
3. **浏览器兼容性** — 使用了目标浏览器不支持的 API 或 WebGPU 特性。
4. **代码编译错误** — TypeScript 类型错误或模块导入失败。
5. **包体过大** — 未合理分包，首次加载时间过长。

## 快速检查

### 1. 检查构建日志位置

构建失败时，先确认错误发生在哪个阶段：

- **编辑器构建面板日志**：构建面板底部的输出栏或构建任务页面的红色提示。点击构建任务下方的日志按钮（带文档图标）可打开完整日志文件。
- **浏览器 DevTools Console**：构建产物运行时在浏览器中按 F12 打开开发者工具，查看 Console 和 Network 面板。
- **编辑器 Console 面板**：打开编辑器底部 Console 面板，筛选 Error 级别日志。

### 2. 检查构建面板关键配置

在 **项目 -> 构建发布** 面板中检查：

- **发布平台**：确认选择了正确的平台（Web Mobile / Web Desktop）。
- **资源服务器地址（remoteServerAddress）**：如果填写了远程地址，构建后需手动将 `remote` 目录上传到该服务器；否则 `remote` 目录会打包到游戏包中。
- **主包压缩类型**：设为 `merge_dep` 或 `zip` 时可能影响资源加载。
- **MD5 缓存**：开启后若资源加载 404，检查是否通过 `assetManager` 加载。
- **Polyfills**：Web Mobile 支持 async Functions 和 coreJs，按目标浏览器需求勾选。
- **参与构建场景**：去除不需要的场景可减少包体。

### 3. 检查资源路径和包体

- 构建产物在 `build/<任务名>/` 目录下，检查 `assets/` 和 `remote/` 目录内容。
- **资源引用 404**：检查资源是否被正确打包，可通过浏览器 Network 面板确认请求路径。
- **包体过大**：开启 MD5 缓存后资源文件名会变化，确认 CDN 或服务器已同步新文件。
- **分包**：如果配置了 Asset Bundle，确认 Bundle 的构建状态和路径正确。

### 4. 浏览器控制台检查

按 F12 打开浏览器 DevTools，检查：

- **Console**：是否有未捕获的异常、资源加载 404、或 `cc.xxx is not a function` 类型错误。
- **Network**：首屏加载时是否有资源请求失败（红色状态）。
- **Application / Storage**：检查 Local Storage 或 IndexedDB 中是否有冲突的缓存数据。
- **Performance**：首次加载时间过长的瓶颈点。

### 5. 资源服务器地址与远程资源

- 如果设置了 `资源服务器地址`，构建后 `remote/` 目录不会包含在构建包中。必须将 `remote/` 目录手动上传到服务器对应路径。
- 上传后通过浏览器 Network 面板确认资源请求是否指向正确的远程地址。
- 使用 CDN 时确认 CORS 头已正确配置。

### 6. 浏览器兼容性

- Cocos Creator 3.8 在桌面端测试的浏览器：Chrome、Firefox、QQ 浏览器。移动端：Safari（iOS）、Chrome（Android）、QQ 浏览器（Android）、UC 浏览器（Android）。
- 如果启用了 WebGPU，仅指定版本的 Chromium 支持。
- 避免使用未在 Polyfills 中勾选的高级 JavaScript 特性。
- 对于旧设备，确认支持 WebGL 1.0 / 2.0。

## 解决方案

### 构建失败

1. 阅读编辑器 Console 面板中的详细错误栈。
2. 点击构建任务的 **清空构建缓存** 按钮，然后重新构建。
3. 确认所有参与构建的场景都已保存且无脚本错误。
4. 尝试在 **项目设置 -> 功能裁剪** 中只保留必要的引擎模块。
5. 检查是否有第三方构建插件冲突，依次禁用排查。

### 构建成功但白屏

1. 打开浏览器 DevTools Console，查看是否有报错。
2. 检查 `index.html` 中引用的 JS 文件路径是否正确。
3. 确认远程资源地址可访问且 CORS 配置正确。
4. 禁用浏览器插件（如广告拦截器）测试。

### 资源加载 404（MD5 缓存开启时）

```ts
import { assetManager } from 'cc';

// 转换 URL 以匹配 MD5 缓存后的文件名
const uuid = assetManager.utils.getUuidFromURL(url);
const correctUrl = assetManager.utils.getUrlWithUuid(uuid);
```

### 包体过大

- 在 **构建发布** 面板中，取消勾选不需要的 **参与构建场景**。
- 在 **项目设置 -> 功能裁剪** 中裁剪不需要的引擎模块。
- 配置 Asset Bundle 进行分包。
- 使用纹理压缩减少图片体积。

## 仍未解决时

- 在浏览器中检查是否有 Service Worker 缓存了旧版本资源，尝试清空缓存或使用无痕模式。
- 检查 Web 服务器配置（Nginx / Apache / IIS）是否限制了文件大小或请求类型。
- 参考官方文档：[发布到 Web 平台](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-web.html)。
- 在 Cocos 官方论坛搜索同版本类似问题。

## 相关文档

- [构建失败错误分诊](../troubleshooting/build-errors.md)
- [性能问题分诊](../troubleshooting/performance-issues.md)
- [命令行构建](../recipes/command-line-build.md)
