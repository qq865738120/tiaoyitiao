---
id: cocos-3.8-api-reference-asset-manager
version: "3.8"
category: api-reference
title: assetManager
keywords:
  - assetManager
  - 资源管理器
  - Asset Bundle
  - 资源包
  - 远程资源
  - 资源释放
related_docs:
  - api-reference/resources.md
  - api-reference/prefab.md
  - recipes/load-resource-dynamically.md
  - recipes/release-resource.md
  - assets/asset-bundle.md
related_api:
  - assetManager
  - AssetManager
  - AssetManager.Bundle
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - Asset Manager"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# assetManager

## 用途

`assetManager` 是 `AssetManager` 类的全局单例，是 Cocos Creator 3.x 资源管理系统的核心入口。它管理所有资源加载管线、资源包（Bundle）的注册与切换、资源缓存与释放，以及远程资源加载。

## 所属模块

```ts
import { assetManager } from 'cc';
```

## 公开导出结论

- `assetManager` 在 `cc` 模块以 `export const assetManager: AssetManager` 公开导出。
- `AssetManager` 类在 `cc` 模块以 `export class AssetManager` 公开导出。
- `AssetManager.Bundle` 在 `AssetManager` 命名空间中公开导出。
- `AssetManager` 关键公开属性：`bundles`（已加载 Bundle 集合）、`assets`（已加载资源集合）、`pipeline`（加载管线）、`fetchPipeline`（下载管线）、`downloader`、`parser`、`cacheAsset`（是否缓存）、`allowImageBitmap`。
- `AssetManager` 关键公开方法：`getBundle(name)`、`removeBundle(bundle)`、`loadAny(requests, ...)`、`preloadAny(requests, ...)`、`loadRemote(url, ...)`、`loadBundle(nameOrUrl, ...)`、`releaseAsset(asset)`、`releaseAll()`。
- 内置 Bundle 可通过 `assetManager.main`（main 包）和 `assetManager.resources`（resources 包）直接访问。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `main` | 内置 main 包 | 访问主包资源 |
| `resources` | 内置 resources 包 | 与 `resources` 变量等价 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `getBundle(name)` | 按名称获取已加载的 Bundle | 加载非 resources 目录资源 |
| `loadBundle(nameOrUrl, options, callback)` | 加载 Bundle 包 | 加载远程/自定义 Bundle |
| `loadRemote(url, options, callback)` | 加载远程资源（图片/音频等） | 加载网络图片 |
| `releaseAsset(asset)` | 释放指定资源 | 精确释放 |
| `loadAny(requests, ...)` | 通用资源加载接口 | 按 uuid 或 url 加载 |
| `removeBundle(bundle)` | 移除 Bundle | 卸载资源包 |

## 高频代码

### 获取并加载自定义 Bundle 中的资源

```ts
import { _decorator, Component, Prefab, instantiate, assetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('BundleExample')
export class BundleExample extends Component {
  start() {
    // 获取已加载的自定义 bundle
    const bundle = assetManager.getBundle('my-assets');
    if (!bundle) return;

    // 加载 bundle 中的 prefab
    bundle.load('characters/hero', Prefab, (err, prefab) => {
      if (err || !prefab) return;
      const node = instantiate(prefab);
      this.node.addChild(node);
    });
  }
}
```

### 加载远程图片

```ts
import { _decorator, Component, Sprite, assetManager, SpriteFrame, Texture2D } from 'cc';

const { ccclass } = _decorator;

@ccclass('RemoteImageExample')
export class RemoteImageExample extends Component {
  start() {
    assetManager.loadRemote('https://example.com/avatar.png', (err, texture) => {
      if (err || !texture) {
        console.error('加载远程图片失败:', err);
        return;
      }

      const sprite = this.node.getComponent(Sprite);
      if (!sprite) return;

      // 使用加载的纹理创建 SpriteFrame
      const sf = new SpriteFrame();
      sf.texture = texture;
      sprite.spriteFrame = sf;
    });
  }
}
```

### 释放资源

```ts
import { _decorator, Component, assetManager, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('ReleaseExample')
export class ReleaseExample extends Component {
  releaseSpecificAsset() {
    // 加载后释放特定资源
    resources.load('icons/avatar', SpriteFrame, (err, sf) => {
      if (err || !sf) return;

      // 使用资源...

      // 精确释放
      assetManager.releaseAsset(sf);
    });
  }
}
```

## 常见错误

1. **getBundle 返回 null 未检查**：传入的 Bundle 名称不存在或未加载时返回 null，必须判空。
2. **依赖 `loader` 旧 API**：Cocos 3.x 中 `loader` 已废弃，全部使用 `assetManager` 和 `resources`。
3. **资源释放过度**：错误释放正在使用的资源会导致运行时资源丢失。推荐使用场景自动释放（`autoReleaseAssets`）而非手动 `releaseAsset`。
4. **远程 Bundle 版本未更新**：加载远程 Bundle 时如果未传 `version` 参数，可能使用本地缓存旧版本。
5. **loadRemote 不带扩展名时出错**：如果远程 URL 没有文件扩展名，需在 `options.ext` 中指定，例如 `{ ext: '.png' }`。
6. **assetManager.resources 与 resources 是同一实例**：两者指向同一个 Bundle 对象，释放时互相影响。

## 关联任务

- [动态加载资源](../recipes/load-resource-dynamically.md)
- [释放资源](../recipes/release-resource.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - Asset Manager
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
