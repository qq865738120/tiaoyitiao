---
id: cocos-3.8-scripting-async-and-promise
version: "3.8"
category: scripting
title: 异步加载与 Promise 封装
keywords:
  - 异步
  - Promise
  - resources.load
  - 资源加载
  - 回调
  - async
  - await
  - assetManager
  - 节点销毁
  - 异步安全
related_docs:
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - scripting/coding-pitfalls.md
  - scripting/component-lifecycle.md
related_api:
  - resources
  - assetManager
  - Asset
  - Prefab
  - SpriteFrame
source:
  official: "Cocos Creator 3.8 官方文档 - 获取和加载资源、动态加载资源"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：Promise 封装与异步完成后节点有效性检查"
status: draft
updated: 2026-06-17
---

# 异步加载与 Promise 封装

## 用途

说明如何将 `resources.load` 等回调式 API 封装为 Promise，以及异步操作中的安全实践——特别是异步完成后节点/组件已销毁的处理。

## 核心结论

- `resources.load` 原生是**回调风格**，可封装为 Promise 以使用 `async/await`。
- **异步完成后必须检查节点/组件有效性**：`isValid(this.node)` 是最低门槛。
- `assetManager` 是更底层的 API，支持远程资源和更细粒度控制。

## 回调 → Promise 封装

### 标准封装

```ts
import { _decorator, Component, resources, Prefab, SpriteFrame } from 'cc';
const { ccclass } = _decorator;

@ccclass('AsyncExample')
export class AsyncExample extends Component {
  // 封装 resources.load 为 Promise
  private loadPrefab(path: string): Promise<Prefab> {
    return new Promise((resolve, reject) => {
      resources.load(path, Prefab, (err, prefab) => {
        if (err) {
          reject(err);
        } else {
          resolve(prefab);
        }
      });
    });
  }

  async start() {
    try {
      const prefab = await this.loadPrefab('prefabs/Enemy');
      // ✅ 使用前检查节点是否仍然有效
      if (!this.node || !this.node.isValid) return;
      console.log('Prefab loaded:', prefab.name);
    } catch (err) {
      console.error('Load failed:', err);
    }
  }
}
```

### 封装多个资源并行加载

```ts
import { resources, SpriteFrame } from 'cc';

async loadAllAssets() {
  try {
    const [prefab, spriteFrame] = await Promise.all([
      this.loadPrefab('prefabs/Player'),
      this.loadSpriteFrame('textures/icon/spriteFrame'),
    ]);

    if (!this.node || !this.node.isValid) return;

    // 安全使用加载结果
    console.log('All assets loaded');
  } catch (err) {
    console.error('Asset load failed:', err);
  }
}

private loadSpriteFrame(path: string): Promise<SpriteFrame> {
  return new Promise((resolve, reject) => {
    resources.load(path, SpriteFrame, (err, sf) => {
      if (err) reject(err);
      else resolve(sf);
    });
  });
}
```

## 异步完成后节点已销毁

这是最常见的异步陷阱：场景切换或节点销毁发生在资源加载回调之前。

```ts
import { instantiate } from 'cc';

async start() {
  // ⚠️ 加载耗时资源
  const prefab = await this.loadPrefab('prefabs/LargeEnemy');

  // ✅ 必须检查有效性
  if (!this.node || !this.node.isValid) {
    console.warn('Node destroyed during async load, aborting');
    return;
  }

  // 安全使用
  const instance = instantiate(prefab);
  this.node.addChild(instance);
}
```

### 完整的安全模式

```ts
import { _decorator, Component, instantiate } from 'cc';
const { ccclass } = _decorator;

@ccclass('SafeAsyncComponent')
export class SafeAsyncComponent extends Component {
  private _loading = false;

  async loadAndInstantiate(path: string) {
    if (this._loading) return;  // 防止重复加载
    this._loading = true;

    try {
      const prefab = await this.loadPrefab(path);

      if (!this.node || !this.node.isValid) return;
      if (!prefab) return;

      const instance = instantiate(prefab);
      this.node.addChild(instance);
    } catch (err) {
      if (this.node && this.node.isValid) {
        console.error('Load failed:', err);
      }
    } finally {
      this._loading = false;
    }
  }

  onDestroy() {
    // 清理加载状态
    this._loading = false;
  }
}
```

## assetManager（远程/原生资源）

`resources.load` 只适用于 `assets/resources/` 目录内的资源。远程资源和设备本地资源使用 `assetManager.loadRemote`：

```ts
import { assetManager, SpriteFrame, Texture2D, ImageAsset } from 'cc';

// 远程图片
assetManager.loadRemote<ImageAsset>('https://example.com/icon.png', (err, imageAsset) => {
  if (err) return console.error(err);
  const spriteFrame = new SpriteFrame();
  const texture = new Texture2D();
  texture.image = imageAsset;
  spriteFrame.texture = texture;
  // 使用 spriteFrame
});
```

## 常见错误

1. **异步回调中直接使用 this.node 不判空**：`isValid(this.node)` 检查不可省略。
2. **忘记 reject**：Promise 封装中 err 分支不 reject 会导致 await 永远等不到结果。
3. **在 update 中触发异步加载**：每帧都触发加载请求，应加 `_loading` 锁或放 `onLoad`/`start`。
4. **路径包含扩展名**：`resources.load('prefabs/Enemy.prefab')` 错误，应去掉扩展名 `'prefabs/Enemy'`。
5. **图片直接加载**：`resources.load('images/icon', SpriteFrame)` 错误，正确路径是 `'images/icon/spriteFrame'`。

## 关联文档

- [resources API 卡片](../api-reference/resources.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)
- [常见编码陷阱](./coding-pitfalls.md)
- [onLoad 与 start 实战选择](./component-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 获取和加载资源、动态加载资源
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——Promise 封装模式；isValid 检查必要性
