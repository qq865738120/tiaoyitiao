---
id: cocos-3.8-recipes-load-resource-dynamically
version: "3.8"
category: recipes
title: 动态加载资源
keywords:
  - 动态加载
  - 资源加载
  - resources.load
  - assetManager
  - 加载图片
  - 加载音频
  - 加载 Prefab
  - 运行时加载
related_docs:
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - api-reference/prefab.md
  - recipes/instantiate-prefab.md
  - recipes/release-resource.md
related_api:
  - resources
  - assetManager
  - AssetManager.Bundle
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 动态加载资源"
  verified-against: []
  supplement:
    - "工程经验：resources.load 路径不加扩展名；加载 SpriteFrame 子资源时路径需加 /spriteFrame 后缀"
status: draft
updated: 2026-06-17
---

# 动态加载资源

## 目标

在运行时动态加载图片、音频、Prefab、动画剪辑等资源，支持从 `resources` 目录或自定义 Bundle 加载。

## 推荐做法

### 加载入口选择

| 场景 | 使用 API | 路径说明 |
|---|---|---|
| 加载 `assets/resources/` 下的资源 | `resources.load(path, type, callback)` | 相对 `resources/`，不带扩展名 |
| 加载自定义 Bundle 的资源 | `bundle.load(path, type, callback)` | 相对 Bundle 根目录，不带扩展名 |
| 加载远程 URL 资源 | `assetManager.loadRemote(url, callback)` | 完整 URL 或本地绝对路径 |
| 预加载（提前下载） | `resources.preload(path, type)` | 与 load 路径规则相同 |

### 路径规则

- **不带扩展名**：`resources.load('images/icon', SpriteFrame, ...)` 而非 `'images/icon.png'`
- **子资源路径**：加载图片的 SpriteFrame 子资源时路径为 `'images/icon/spriteFrame'`，类型指定 `SpriteFrame`
- **图集（SpriteAtlas）**：先加载图集，再通过 `atlas.getSpriteFrame('frameName')` 获取帧

## 示例代码

### 加载 SpriteFrame（图片）

```ts
import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('LoadImageExample')
export class LoadImageExample extends Component {
  start() {
    // 加载图集子资源
    resources.load('icons/avatar/spriteFrame', SpriteFrame, (err, spriteFrame) => {
      if (err) {
        console.error('加载失败:', err);
        return;
      }

      const sprite = this.node.getComponent(Sprite);
      if (sprite && spriteFrame) {
        sprite.spriteFrame = spriteFrame;
      }
    });
  }
}
```

### 加载 AudioClip（音频）

```ts
import { _decorator, Component, AudioClip, AudioSource, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('LoadAudioExample')
export class LoadAudioExample extends Component {
  playBGM() {
    resources.load('audio/bgm', AudioClip, (err, clip) => {
      if (err || !clip) return;

      const audioSource = this.node.getComponent(AudioSource);
      if (!audioSource) return;

      audioSource.clip = clip;
      audioSource.loop = true;
      audioSource.play();
    });
  }
}
```

### 加载 AnimationClip（动画）

```ts
import { _decorator, Component, Animation, AnimationClip, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('LoadAnimExample')
export class LoadAnimExample extends Component {
  playAnimation() {
    resources.load('animations/idle', AnimationClip, (err, clip) => {
      if (err || !clip) return;

      const anim = this.node.getComponent(Animation);
      if (!anim) return;

      anim.addClip(clip, 'idle');
      anim.play('idle');
    });
  }
}
```

### 批量加载

```ts
import { _decorator, Component, SpriteFrame, Prefab, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('BatchLoadExample')
export class BatchLoadExample extends Component {
  start() {
    // 加载目录下所有 SpriteFrame
    resources.loadDir('icons', SpriteFrame, (err, frames) => {
      if (err) {
        console.error('批量加载失败:', err);
        return;
      }
      console.log(`加载了 ${frames.length} 个 SpriteFrame`);
    });
  }
}
```

### 从自定义 Bundle 加载

```ts
import { _decorator, Component, Prefab, instantiate, assetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('BundleLoadExample')
export class BundleLoadExample extends Component {
  start() {
    const bundle = assetManager.getBundle('dlc-assets');
    if (!bundle) return;

    bundle.load('characters/boss', Prefab, (err, prefab) => {
      if (err || !prefab) return;
      const boss = instantiate(prefab);
      this.node.addChild(boss);
    });
  }
}
```

## 操作步骤

1. 将需要动态加载的资源放入 `assets/resources/` 目录（或自定义 Bundle 目录）；
2. 确定加载的资源类型（`SpriteFrame`、`Prefab`、`AudioClip` 等）；
3. 使用 `resources.load(path, Type, callback)` 加载，路径不带扩展名；
4. 在回调中判空（err 和 asset），然后使用加载的资源；
5. 不使用的资源及时释放（参考 [释放资源](./release-resource.md)）。

## 验证方式

- 运行场景后资源正确显示/播放（图片显示、音频播放、Prefab 出现等）；
- 加载失败时控制台输出错误信息；
- 批量加载完成后所有资源可用；
- 检查加载的资源路径在 `assets/resources/` 下确实存在。

## 常见错误

1. **路径带扩展名**：`resources.load('icon.png', ...)` 应改为 `resources.load('icon', Texture2D, ...)`。
2. **resources 目录未创建**：`assets/resources/` 目录需要手动在 assets 根目录下创建。
3. **资源不在 resources 目录**：`resources.load` 只能加载 `assets/resources/` 下的资源，其他目录的资源不会有导出配置。
4. **加载 SpriteFrame 路径错误**：图片导入后生成的是 `ImageAsset`，要加载 SpriteFrame 子资源需要路径加 `/spriteFrame`，如 `'images/icon/spriteFrame'`。
5. **回调为 null 不处理**：加载失败时 asset 参数可能为 null，必须同时检查 err 和 asset。
6. **未指定类型参数**：同名但不同类型的资源（如 `player.clip` 和 `player.psd`）需指定类型参数区分。

## 相关文档

- [resources API 卡片](../api-reference/resources.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)
- [实例化 Prefab](./instantiate-prefab.md)
- [释放资源](./release-resource.md)
