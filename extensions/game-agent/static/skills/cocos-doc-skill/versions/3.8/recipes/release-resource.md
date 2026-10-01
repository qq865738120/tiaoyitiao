---
id: cocos-3.8-recipes-release-resource
version: "3.8"
category: recipes
title: 释放资源
keywords:
  - 释放资源
  - 资源释放
  - 内存管理
  - releaseAsset
  - decRef
  - addRef
  - 引用计数
  - 自动释放
related_docs:
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - recipes/load-resource-dynamically.md
related_api:
  - assetManager
  - resources
  - Asset
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 资源释放"
  verified-against: []
  supplement:
    - "工程经验：推荐优先使用场景自动释放 + addRef/decRef 管理动态引用，避免手动 releaseAsset 误释放"
status: draft
updated: 2026-06-17
---

# 释放资源

## 目标

正确释放不再使用的动态加载资源，避免内存泄漏或误释放正在使用的资源。

## 推荐做法

### 三种释放方式（优先级从高到低）

1. **场景自动释放**（推荐首选）：在编辑器场景属性中勾选"自动释放资源"，场景切换时引擎自动释放该场景的依赖资源；
2. **引用计数管理**（推荐用于动态引用）：通过 `asset.addRef()` / `asset.decRef()` 管理动态资源的引用计数，引擎自动回收引用计数归零的资源；
3. **手动释放**（谨慎使用）：通过 `assetManager.releaseAsset(asset)` 精确释放单个资源及其依赖。

**不建议**手动释放正在场景中使用的资源，也不建议调用 `resources.releaseAll()`（会误释放其他脚本仍引用的资源）。

## 示例代码

### 引用计数管理（推荐方式）

```ts
import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RefCountExample')
export class RefCountExample extends Component {
  @property(Sprite)
  targetSprite: Sprite | null = null;

  private _loadedFrame: SpriteFrame | null = null;

  start() {
    resources.load('icons/avatar/spriteFrame', SpriteFrame, (err, sf) => {
      if (err || !sf) return;

      this._loadedFrame = sf;
      // 动态引用需手动增加引用计数
      sf.addRef();

      if (this.targetSprite) {
        this.targetSprite.spriteFrame = sf;
      }
    });
  }

  onDestroy() {
    // 释放动态引用
    if (this._loadedFrame) {
      this._loadedFrame.decRef();
      this._loadedFrame = null;
    }
  }
}
```

### 手动释放单个资源

```ts
import { _decorator, Component, assetManager, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('ManualReleaseExample')
export class ManualReleaseExample extends Component {
  private _cachedFrames: SpriteFrame[] = [];

  loadAndCache(paths: string[]) {
    let loaded = 0;
    paths.forEach((path) => {
      resources.load(path, SpriteFrame, (err, sf) => {
        if (err || !sf) return;
        this._cachedFrames.push(sf);
        loaded++;
      });
    });
  }

  clearCache() {
    // 释放所有缓存的资源
    this._cachedFrames.forEach((sf) => {
      assetManager.releaseAsset(sf);
    });
    this._cachedFrames = [];
  }
}
```

### 释放 Bundle 中的资源

```ts
import { _decorator, Component, assetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('ReleaseBundleExample')
export class ReleaseBundleExample extends Component {
  releaseBundle(bundleName: string) {
    const bundle = assetManager.getBundle(bundleName);
    if (!bundle) return;

    // 释放整个 Bundle 的资源
    bundle.releaseAll();
    // 移除 Bundle
    assetManager.removeBundle(bundle);
  }
}
```

## 操作步骤

### 使用引用计数（推荐）

1. 在动态加载资源后，调用 `asset.addRef()` 增加引用计数；
2. 在不再使用该资源时（如 `onDestroy` 中），调用 `asset.decRef()` 减少引用计数；
3. 引擎在资源引用计数归零且通过释放检查后自动销毁资源。

### 手动释放

1. 确认该资源不再被任何场景节点或脚本引用；
2. 调用 `assetManager.releaseAsset(asset)` 释放；
3. 将引用设为 null，避免后续访问已释放资源。

### 场景自动释放

1. 在编辑器层级管理器中选中场景；
2. 在属性检查器中勾选"自动释放资源"；
3. 点击右上角"应用"保存；
4. 切换场景时引擎自动释放该场景依赖的资源。

## 验证方式

- 释放资源后通过内存分析工具确认内存/显存下降；
- 释放后再次访问该资源时，`isValid(asset)` 返回 false；
- 使用引用计数方式时，最终 `decRef` 后资源被正确回收；
- 场景切换后旧场景的资源被自动释放（如果开启了自动释放）。

## 常见错误

1. **动态加载后未 addRef 导致资源被意外释放**：通过代码动态加载并设置到组件的资源，引擎不会自动统计引用，必须手动 `addRef`。
2. **decRef 后未置 null**：资源引用计数归零被释放后，变量仍持有引用，再次访问会出错。应立即 `this.asset = null`。
3. **手动释放正在使用的资源**：`releaseAsset` 直接释放资源不检查引用计数，释放正在场景中使用的资源会导致渲染异常。
4. **releaseAll 误释放共享资源**：`resources.releaseAll()` 释放所有 resources 目录下的资源缓存，可能误释放其他脚本仍在使用的资源。
5. **混淆 removeFromParent 和 destroy**：`removeFromParent` 不从内存释放节点，应用 `destroy()` 销毁节点，引擎自动处理关联资源的释放检查。
6. **忘记 decRef 导致内存泄漏**：每次 `addRef` 必须有对应的 `decRef`，否则资源永远不会被释放。

## 相关文档

- [assetManager API 卡片](../api-reference/asset-manager.md)
- [resources API 卡片](../api-reference/resources.md)
- [动态加载资源](./load-resource-dynamically.md)
