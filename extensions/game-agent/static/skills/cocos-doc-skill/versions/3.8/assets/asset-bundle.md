---
id: cocos-3.8-assets-asset-bundle
version: "3.8"
category: assets
title: Asset Bundle 使用指南
keywords:
  - Asset Bundle
  - Bundle
  - 资源分包
  - 远程资源
  - 热更新
  - DLC
  - 资源按需加载
  - bundle配置
  - loadBundle
related_docs:
  - assets/resources-folder.md
  - assets/dynamic-loading.md
  - assets/preload.md
  - assets/release.md
  - api-reference/asset-manager.md
  - api-reference/resources.md
related_api:
  - assetManager
  - AssetManager.Bundle
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - Asset Bundle"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：Bundle 配置、优先级、压缩类型的选择直接影响包体大小和加载性能"
status: draft
updated: 2026-06-17
---

# Asset Bundle 使用指南

## 用途

说明 Asset Bundle 作为资源模块化工具的作用、配置方法、加载流程，以及与 resources 目录的对比选择。

## 核心结论

- **Asset Bundle 用于资源模块化**：将资源按功能/场景拆分成独立包，按需加载，减少首包体积。
- **四个内置 Bundle**：`main`（主包）、`resources`（resources 目录）、`start-scene`（首场景分包）、`internal`（引擎内置）。
- **支持远程部署**：自定义 Bundle 可配置为远程包，部署到 CDN，实现热更新和按需下载。
- **优先级控制共享资源归属**：被多个 Bundle 引用的资源会归属到优先级最高的 Bundle 中。

## 什么时候使用

| 场景 | 推荐方案 |
|---|---|
| 少量动态资源（几个 Prefab/图片） | `resources` 目录即可 |
| 大型 DLC/资料片内容 | 独立 Asset Bundle，配置为远程包 |
| 首屏优化（减少初始下载量） | 非首屏资源放入自定义 Bundle |
| 小游戏分包（微信/字节等） | 压缩类型设为"小游戏分包" |
| 多团队并行开发 | 按模块拆分 Bundle，各自独立维护 |

## Bundle 配置

### 创建自定义 Bundle

1. 在资源管理器中选中目标文件夹。
2. 属性检查器中勾选"配置为 Bundle"。
3. 配置选项：

| 配置项 | 说明 |
|---|---|
| Bundle 名称 | 构建后的名称，默认使用文件夹名。**不要用内建名称**（main/resources/start-scene/internal） |
| Bundle 优先级 | 1-20，越大越优先。共享资源归属到高优先级 Bundle |
| 压缩类型 | 合并依赖 / 无压缩 / 合并所有 JSON / 小游戏分包 / Zip |
| 配置为远程包 | 勾选后构建产物放 `remote/` 目录，需部署到服务器 |
| 目标平台 | 不同平台可使用不同配置方案 |

### 四个内置 Bundle

| Bundle | 内容 | 优先级 |
|---|---|---|
| `main` | 参与构建场景及其依赖 | 7 |
| `resources` | `assets/resources/` 下所有资源 | 8 |
| `start-scene` | 首场景（需勾选"初始场景分包"） | 20 |
| `internal` | 引擎内置默认资源 | 21（最高） |

## 加载链路

```text
# 本地 Bundle
assetManager.loadBundle('bundle-name', (err, bundle) => {
  bundle.load('path/to/asset', Type, (err, asset) => { ... });
});

# 远程 Bundle
assetManager.loadBundle('https://cdn.example.com/remote-bundle', (err, bundle) => {
  bundle.load('path/to/asset', Type, (err, asset) => { ... });
});
```

### 完整加载示例

```ts
import { _decorator, Component, Prefab, instantiate, assetManager } from 'cc';
import { AssetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('BundleDemo')
export class BundleDemo extends Component {
  start() {
    // 方式 1：加载已配置的本地 Bundle
    assetManager.loadBundle('dlc-content', (err, bundle) => {
      if (err) {
        console.error('Bundle 加载失败:', err);
        return;
      }

      // Bundle 加载成功后，加载其中资源
      bundle.load('characters/boss', Prefab, (err, prefab) => {
        if (err || !prefab) return;
        const boss = instantiate(prefab);
        boss.setParent(this.node);
      });
    });
  }

  // 方式 2：获取已加载的 Bundle（不会触发加载）
  useLoadedBundle() {
    const bundle = assetManager.getBundle('dlc-content');
    if (!bundle) {
      console.error('Bundle 未加载，请先调用 loadBundle');
      return;
    }
    // 直接使用...
  }

  // 方式 3：加载远程 Bundle
  loadRemoteBundle() {
    assetManager.loadBundle('https://cdn.example.com/game/dlc-content', {
      version: '1.0.1'  // 可选：版本号，用于缓存更新
    }, (err, bundle) => {
      if (err) {
        console.error('远程 Bundle 加载失败:', err);
        return;
      }
      console.log('远程 Bundle 加载成功');
    });
  }
}
```

## 共享资源与优先级

当资源被多个 Bundle 引用时：

- **不同优先级**：资源归入优先级**最高**的 Bundle。低优先级 Bundle 只存记录，依赖高优先级 Bundle。
- **相同优先级**：资源在每个 Bundle 各复制一份，Bundle 间无依赖关系。

**建议**：公共资源（Texture、SpriteFrame、AudioClip 等）所在的 Bundle 设置较高优先级，让更多低优先级 Bundle 共享，减少包体。

## 压缩类型选择

| 压缩类型 | 说明 | 适用场景 |
|---|---|---|
| 合并依赖 | 资源及其依赖打包在一起 | 独立功能的 Bundle |
| 无压缩 | 资源不合并，保持原始格式 | 调试阶段 |
| 合并所有 JSON | 将所有 JSON 合并为大文件 | 减少网络请求数 |
| 小游戏分包 | 符合平台分包规范 | 微信/字节等小游戏 |
| Zip | 整体压缩 | 远程包（需搭配"配置为远程包"） |

## 释放 Bundle

```ts
import { _decorator, Component, assetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('ReleaseBundleDemo')
export class ReleaseBundleDemo extends Component {
  releaseBundle() {
    const bundle = assetManager.getBundle('dlc-content');
    if (!bundle) return;

    // 释放 Bundle 中所有资源
    bundle.releaseAll();
    // 从 assetManager 中移除 Bundle
    assetManager.removeBundle(bundle);
  }
}
```

## 常见错误

1. **Bundle 名称与内置名称冲突**：自定义 Bundle 不要命名为 `main`、`resources`、`start-scene`、`internal`。
2. **加载远程 Bundle 未处理网络错误**：必须处理 `loadBundle` 的回调错误，网络不稳定时可能超时。
3. **getBundle 返回 null**：Bundle 未加载或名称错误时返回 null，必须判空。
4. **低优先级 Bundle 依赖高优先级 Bundle**：使用低优先级 Bundle 前必须先加载其依赖的高优先级 Bundle。
5. **远程 Bundle 版本未更新**：更新远程 Bundle 后需修改 version 参数，否则可能使用旧缓存。
6. **releaseAll 误释放共享资源**：一个 Bundle 的 `releaseAll` 可能影响其他 Bundle 共享的资源。

## 关联文档

- [动态加载资源](./dynamic-loading.md)
- [预加载资源](./preload.md)
- [resources 目录使用指南](./resources-folder.md)
- [资源释放](./release.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - Asset Bundle
- 已交叉验证：cc-engine 3.8 公开类型声明（`AssetManager.loadBundle`、`Bundle.load` 方法签名）
- 补充：工程经验——Bundle 配置和优先级选择直接影响项目架构和包体
