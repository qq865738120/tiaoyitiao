---
id: cocos-3.8-api-reference-resources
version: "3.8"
category: api-reference
title: resources
keywords:
  - resources
  - 资源加载
  - 动态加载
  - 资源管理
  - resources.load
related_docs:
  - api-reference/asset-manager.md
  - api-reference/prefab.md
  - recipes/load-resource-dynamically.md
  - recipes/release-resource.md
related_api:
  - resources
  - AssetManager.Bundle
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - resources"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# resources

## 用途

`resources` 是内置 `resources` 包的 `AssetManager.Bundle` 单例，提供加载 `assets/resources` 目录下资源的 API。它是运行时动态加载资源最常用的入口。

## 所属模块

```ts
import { resources } from 'cc';
```

## 公开导出结论

- `resources` 在 `cc` 模块以 `export const resources: AssetManager.Bundle` 公开导出。
- `resources` 的类型为 `AssetManager.Bundle`，该类型在 `AssetManager` 命名空间中公开导出。
- `Bundle` 的公开方法：`load`、目录加载、`loadScene`、`preload`、`preloadDir`、`preloadScene`、`release`、`releaseAll`、`getInfoWithPath`、`getDirWithPath`、`getAssetInfo`、`getSceneInfo`。
- `Bundle` 的公开属性：`name`、`deps`、`base`。
- **路径规则**：所有路径相对于 `assets/resources`，不带扩展名。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `load(path, type, callback)` | 加载单个资源 | 动态加载图片/Prefab/音频 |
| `load(paths, type, callback)` | 批量加载资源 | 加载多个同类型资源 |
| `loadDir(dir, type, callback)` | 加载文件夹下所有资源 | 加载一组资源 |
| `loadScene(name, callback)` | 加载场景资源 | 场景预加载 |
| `preload(path, type)` | 预加载资源 | 提前下载 |
| `release(path, type)` | 释放指定资源 | 减少内存占用 |
| `releaseAll()` | 释放所有 `resources` 包中的资源 | 场景切换时清理 |
| `getInfoWithPath(path, type)` | 获取资源信息 | 检查资源是否存在 |

## 高频代码

### 加载图片资源

```ts
import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('LoadImageExample')
export class LoadImageExample extends Component {
  start() {
    resources.load('icons/weapon/sword/spriteFrame', SpriteFrame, (err, sf) => {
      if (err) {
        console.error('资源加载失败:', err);
        return;
      }

      const sprite = this.node.getComponent(Sprite);
      if (sprite) {
        sprite.spriteFrame = sf;
      }
    });
  }
}
```

### 加载 Prefab 并实例化

```ts
import { _decorator, Component, Prefab, instantiate, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('LoadPrefabExample')
export class LoadPrefabExample extends Component {
  start() {
    resources.load('enemies/EnemyShip', Prefab, (err, prefab) => {
      if (err || !prefab) return;

      const node = instantiate(prefab);
      this.node.addChild(node);
    });
  }
}
```

### 使用 Promise 风格的资源加载

```ts
import { resources, Prefab, instantiate } from 'cc';

function loadPrefab(path: string): Promise<Prefab> {
  return new Promise((resolve, reject) => {
    resources.load(path, Prefab, (err, prefab) => {
      if (err) reject(err);
      else resolve(prefab);
    });
  });
}
```

## 常见错误

1. **路径带扩展名**：`resources.load('image.png')` 应改为 `resources.load('image', Texture2D)`。
2. **路径混淆**：`resources.load` 只能加载 `assets/resources` 目录下的资源，其他目录的资源需通过 `assetManager.getBundle('bundleName')` 加载。
3. **回调为 null 不处理**：加载失败时 `err` 不为 null，`asset` 参数可能为 null，需要判断。
4. **SpriteFrame 路径末尾加 `/spriteFrame`**：加载图片的 SpriteFrame 子资源时路径应为 `'path/to/image/spriteFrame'`，类型指定 `SpriteFrame`。
5. **未指定类型导致加载失败**：Cocos 3.x 推荐在 `load` 中传入类型参数，避免类型推断错误。

## 关联任务

- [动态加载资源](../recipes/load-resource-dynamically.md)
- [释放资源](../recipes/release-resource.md)
- [实例化 Prefab](../recipes/instantiate-prefab.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - resources
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
