---
id: cocos-3.8-assets-release
version: "3.8"
category: assets
title: 资源释放
keywords:
  - 资源释放
  - 释放资源
  - 引用计数
  - addRef
  - decRef
  - 自动释放
  - 手动释放
  - releaseAsset
  - 内存管理
  - 场景自动释放
related_docs:
  - assets/dynamic-loading.md
  - assets/resources-folder.md
  - assets/asset-bundle.md
  - assets/common-pitfalls.md
  - api-reference/asset-manager.md
  - api-reference/resources.md
  - recipes/release-resource.md
related_api:
  - assetManager
  - Asset
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - 资源释放"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：引用计数管理和自动释放是资源管理最核心的机制"
status: draft
updated: 2026-06-17
---

# 资源释放

## 用途

说明 Cocos Creator 中资源释放的三种机制（自动释放、引用计数、手动释放）及其适用场景，帮助正确管理内存避免泄漏和误释放。

## 核心结论

- **加载的资源缓存在 `assetManager` 中**：不释放会持续占用内存，需要在适当时机回收。
- **资源之间有依赖关系**：释放一个资源会连锁释放其直接依赖（引用计数归零时）。
- **推荐优先使用自动释放 + addRef/decRef**：手动 `releaseAsset` 应作为最后手段。
- **动态引用不会自动统计**：通过代码设置的资源引用需要手动 `addRef`/`decRef`。

## 什么时候使用

- 场景切换时需要释放旧场景的资源。
- 动态加载的资源不再使用时。
- 排查内存泄漏或资源释放不掉的问题。
- 理解引用计数的机制和工作原理。

## 三种释放方式

### 方式一：场景自动释放（首选）

在编辑器场景属性中勾选"自动释放资源"，切换场景时引擎自动释放该场景的静态依赖资源。

```text
层级管理器 → 选中场景 → 属性检查器 → 勾选"自动释放资源" → 点击"应用"
```

**适用**：大多数场景（除高频进出场景如主界面）。

**限制**：只释放场景的**静态依赖**（场景中直接引用的资源），不处理运行时动态加载的资源。

### 方式二：引用计数管理（推荐用于动态资源）

引擎自动维护**静态引用**的计数（编辑器中配置的资源引用）。**动态引用**需手动管理。

```ts
import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RefCountDemo')
export class RefCountDemo extends Component {
  @property(Sprite)
  targetSprite: Sprite | null = null;

  private _loadedFrame: SpriteFrame | null = null;

  start() {
    resources.load('images/avatar/spriteFrame', SpriteFrame, (err, sf) => {
      if (err || !sf) return;

      this._loadedFrame = sf;
      // 动态引用必须手动 addRef
      sf.addRef();

      if (this.targetSprite) {
        this.targetSprite.spriteFrame = sf;
      }
    });
  }

  onDestroy() {
    // 释放动态引用——addRef 和 decRef 必须成对
    if (this._loadedFrame) {
      this._loadedFrame.decRef();
      this._loadedFrame = null;
    }
  }
}
```

### 方式三：手动释放（谨慎使用）

```ts
import { _decorator, Component, assetManager, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('ManualReleaseDemo')
export class ManualReleaseDemo extends Component {
  private _cachedFrames: SpriteFrame[] = [];

  clearCache() {
    // 手动释放每一个资源
    this._cachedFrames.forEach((sf) => {
      assetManager.releaseAsset(sf);
    });
    this._cachedFrames = [];
  }
}
```

**注意**：`releaseAsset` 直接释放资源，不检查引用计数。只有确定资源不再被任何地方使用时才调用。

## 释放机制对比

| 方式 | 触发方式 | 安全度 | 适用场景 |
|---|---|---|---|
| 场景自动释放 | 场景切换时自动 | ⭐⭐⭐ 高（引擎检查依赖） | 场景静态资源 |
| addRef/decRef | 手动管理引用计数 | ⭐⭐⭐ 高（有计数保护） | 动态加载的资源 |
| releaseAsset | 手动调用 | ⭐ 低（可能误释放） | 精确释放特定资源 |
| bundle.releaseAll | 手动调用 | ⭐ 低（批量释放） | Bundle 整体卸载 |

## 引用计数机制详解

```text
加载资源时的自动行为：
1. 加载 Prefab A → A 的直接依赖（材质、贴图）引用计数 +1
   A 自身引用计数 = 0
2. 加载 Prefab B → B 的直接依赖（材质、贴图）引用计数 +1
3. 同一个贴图被 A 和 B 都依赖 → 引用计数 = 2

释放检查流程：
1. 资源的引用计数 == 0 → 直接释放
2. 资源引用计数 > 0 → 循环引用检查
   - 如果循环引用检查后仍 > 0 → 不释放（被其他地方引用）
   - 如果循环引用后 == 0 → 释放
3. 资源释放后 → 其直接依赖的引用计数 -1 → 触发递归释放检查
```

### 静态引用 vs 动态引用

| 引用类型 | 如何产生 | 引用计数谁管 | 示例 |
|---|---|---|---|
| 静态引用 | 编辑器中配置（拖拽资源到属性） | 引擎自动统计 | 场景中 Sprite 的 SpriteFrame |
| 动态引用 | 代码中赋值 | **开发者手动** addRef/decRef | `resources.load` 然后设置给组件 |

## 常见错误

1. **动态加载后未 addRef**：代码中 `resources.load` 加载资源并设置到组件后，引擎不会自动跟踪此引用。如果不 `addRef`，资源可能在场景释放时被误回收。
2. **addRef 和 decRef 不成对**：每对 addRef/decRef 必须匹配，不成对会导致引用计数泄漏（永不释放）或负计数（提前释放）。
3. **手动释放正在使用的资源**：`releaseAsset` 不检查引用计数，释放正在渲染中的资源会导致黑块或崩溃。
4. **releaseAll 误伤共享资源**：`resources.releaseAll()` 会释放所有 resources 下的缓存资源，可能影响其他脚本持有的资源。
5. **decRef 后未置 null**：资源被释放后变量仍持有引用，后续访问已释放资源会出错。应立即 `this.asset = null`。
6. **混淆 removeFromParent 和 destroy**：`removeFromParent` 只从场景树移除节点，不释放内存。应调用 `destroy()` 销毁节点。

## 关联文档

- [动态加载资源](./dynamic-loading.md)
- [常见资源陷阱](./common-pitfalls.md)
- [释放资源 Recipe](../recipes/release-resource.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源释放
- 已交叉验证：cc-engine 3.8 公开类型声明（`Asset.addRef`、`Asset.decRef`、`assetManager.releaseAsset`）
- 补充：工程经验——引用计数管理是资源管理中最容易出错的环节
