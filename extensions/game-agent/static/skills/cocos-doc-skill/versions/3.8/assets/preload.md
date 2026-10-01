---
id: cocos-3.8-assets-preload
version: "3.8"
category: assets
title: 预加载资源
keywords:
  - 预加载
  - preload
  - 提前下载
  - 加载优化
  - 资源预热
  - preloadScene
  - 加载性能
related_docs:
  - assets/dynamic-loading.md
  - assets/asset-bundle.md
  - assets/release.md
  - api-reference/resources.md
  - api-reference/asset-manager.md
related_api:
  - resources
  - assetManager
  - AssetManager.Bundle
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 加载与预加载"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：preload 与 load 的区别和配合使用是最常见的性能优化手段"
status: draft
updated: 2026-06-17
---

# 预加载资源

## 用途

说明 `preload` 与 `load` 的本质区别、预加载的使用场景、如何在游戏中利用预加载优化体验，以及与普通加载的配合方式。

## 核心结论

- **预加载只下载不解析**：`preload` 仅下载资源文件到本地缓存，不做解析和初始化，因此性能开销小。
- **预加载后仍需 load**：预加载完成后，调用 `load` 时引擎会复用已下载的缓存，跳过下载步骤，大幅缩短加载时间。
- **预加载优先级更低**：预加载的下载任务排在普通加载之后，不会抢占关键资源的带宽。
- **预加载不返回可用资源**：回调中无资源参数，预加载后无法直接使用资源。

## 什么时候使用

- **加载界面期间**：在玩家看加载动画时预加载下一场景的资源。
- **游戏空闲时**：在游戏中网络空闲时预加载后续可能用到的资源。
- **预测性加载**：根据玩家行为预测（如走到地图边界时预加载相邻区域资源）。
- **大型资源预热**：大体积的 Prefab、图集、音频等提前下载。

## preload vs load 对比

| 维度 | preload | load |
|---|---|---|
| 下载 | ✅ 下载资源文件 | ✅ 下载（如果未缓存） |
| 解析/初始化 | ❌ 不解析 | ✅ 解析并初始化 |
| 返回可用资源 | ❌ 不返回资源 | ✅ 回调中返回 Asset |
| 网络优先级 | 低（排在其他下载之后） | 正常 |
| 并发限制 | 更严格 | 正常 |
| 性能开销 | 小（仅网络 I/O） | 大（含解析和初始化） |
| 后续 load 效果 | load 可复用预下载的缓存 | 正常加载 |

## 最小示例

### 基本预加载模式

```ts
import { _decorator, Component, Prefab, instantiate, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('PreloadDemo')
export class PreloadDemo extends Component {
  private _isPreloaded = false;

  start() {
    // 步骤 1：提前预加载（不解析）
    this.preloadAssets();
  }

  preloadAssets() {
    // 预加载多个资源
    resources.preload('prefabs/enemy', Prefab);
    resources.preload('prefabs/boss', Prefab);
    resources.preload('images/bg/spriteFrame', SpriteFrame);

    this._isPreloaded = true;
  }

  // 稍后需要使用时加载（复用预下载缓存，快速完成）
  spawnEnemy() {
    resources.load('prefabs/enemy', Prefab, (err, prefab) => {
      if (err || !prefab) return;
      // 此时资源已预下载，load 只需解析，速度快
      const enemy = instantiate(prefab);
      enemy.setParent(this.node);
    });
  }
}
```

### 预加载场景

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('PreloadSceneDemo')
export class PreloadSceneDemo extends Component {
  start() {
    // 预加载下一场景（只下载不加载）
    director.preloadScene('Level2', (err) => {
      if (err) {
        console.error('场景预加载失败:', err);
        return;
      }
      console.log('Level2 预加载完成，可以快速切换');
    });
  }

  goToNextLevel() {
    // 此时 loadScene 会复用预下载缓存，切换速度快
    director.loadScene('Level2');
  }
}
```

### Bundle 预加载

```ts
import { _decorator, Component, Prefab, assetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('BundlePreloadDemo')
export class BundlePreloadDemo extends Component {
  start() {
    const bundle = assetManager.getBundle('dlc-content');
    if (!bundle) return;

    // 预加载 Bundle 中的资源
    bundle.preload('characters/boss', Prefab);
    bundle.preload('characters/hero', Prefab);
  }

  // 后续 load 时快速完成
  spawnBoss() {
    const bundle = assetManager.getBundle('dlc-content');
    if (!bundle) return;

    // 已预下载，load 速度快
    bundle.load('characters/boss', Prefab, (err, prefab) => {
      if (err || !prefab) return;
      const boss = instantiate(prefab);
      boss.setParent(this.node);
    });
  }
}
```

## 最佳实践

1. **预加载 + load 配对使用**：先 `preload` 下载，后 `load` 解析，不要只 preload 不 load。
2. **预加载时机**：加载界面、游戏空闲期、场景切换前。
3. **不要同时预加载过多资源**：预加载有并发限制，过多预加载请求会排队。
4. **预加载量力而行**：根据目标设备内存和网络状况控制预加载量，移动端尤其要谨慎。
5. **预加载完成后 load 不需要等待**：即使预加载还没完成，`load` 也可以提前调用，引擎会自动处理。

## 常见错误

1. **预加载后直接使用资源**：`preload` 不返回 Asset 对象，预加载完成后必须再调用 `load` 获取可用资源。
2. **预加载时机过晚**：在需要使用时才 preload，等于没预加载。应在玩家进入"可能需要"的状态前提前触发。
3. **预加载过多导致网络拥堵**：同时预加载大量资源会占用带宽，影响当前必须加载的资源。
4. **预加载路径错误**：`preload` 的路径规则与 `load` 完全一致（不带扩展名、子资源路径加后缀）。
5. **只预加载不清理**：预加载的资源也会进入缓存，不再需要时应正常释放。

## 关联文档

- [动态加载资源](./dynamic-loading.md)
- [Asset Bundle](./asset-bundle.md)
- [资源释放](./release.md)
- [resources API 卡片](../api-reference/resources.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - 加载与预加载
- 已交叉验证：cc-engine 3.8 公开类型声明（Bundle.preload 方法签名）
- 补充：工程经验——预加载是游戏性能优化的核心手段，但使用不当反而影响体验
