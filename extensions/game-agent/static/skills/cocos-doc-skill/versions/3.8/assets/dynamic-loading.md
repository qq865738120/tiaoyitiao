---
id: cocos-3.8-assets-dynamic-loading
version: "3.8"
category: assets
title: 动态加载资源
keywords:
  - 动态加载
  - 异步加载
  - resources.load
  - bundle.load
  - 路径规则
  - 类型参数
  - 加载失败
  - 回调
  - loadDir
related_docs:
  - assets/resources-folder.md
  - assets/asset-bundle.md
  - assets/preload.md
  - assets/release.md
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - recipes/load-resource-dynamically.md
related_api:
  - resources
  - assetManager
  - AssetManager.Bundle
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 动态加载资源"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：路径规则和类型参数是动态加载的高频错误点"
status: draft
updated: 2026-06-17
---

# 动态加载资源

## 用途

说明 Cocos Creator 3.8 中动态加载资源的完整体系：加载入口选择、路径规则、类型参数、回调处理，以及 resources 加载与 Bundle 加载的区别。

## 核心结论

- **两种加载入口**：`resources.load()` 加载 resources 目录资源，`bundle.load()` 加载自定义 Bundle 资源。
- **路径不带扩展名**：所有 load 接口的路径都不含扩展名（如 `'prefabs/enemy'` 而非 `'enemy.prefab'`）。
- **类型参数提高可靠性**：推荐传入类型参数（如 `Prefab`、`SpriteFrame`），避免重名资源匹配错误。
- **必须处理加载失败**：回调中 `err` 和 `asset` 都可能为空，需同时判空。
- **加载是异步的**：回调在资源加载完成后才执行，不要在 load 之后立即使用资源。

## 什么时候使用

- 运行时才能确定需要加载哪个资源（如按关卡 ID 加载配置、按玩家选择加载皮肤）。
- 需要在 resources 和自定义 Bundle 之间选择正确的加载入口。
- 排查 `resources.load` 加载失败或返回类型不对的问题。

## 加载入口对比

| 入口 | 路径基准 | 使用方式 |
|---|---|---|
| `resources.load(path, type, cb)` | `assets/resources/` | `resources.load('prefabs/enemy', Prefab, cb)` |
| `resources.loadDir(dir, type, cb)` | `assets/resources/` | 加载目录下所有资源 |
| `bundle.load(path, type, cb)` | Bundle 根目录 | 先获取 bundle 再 load |
| `assetManager.loadBundle(name, cb)` | 远程或本地 Bundle | 加载整个 Bundle |
| `assetManager.loadRemote(url, cb)` | 远程 URL | 加载网络图片/音频 |

## 路径规则详解

```text
# 基础规则：不带扩展名
正确：resources.load('prefabs/enemy', Prefab, cb)
错误：resources.load('prefabs/enemy.prefab', Prefab, cb)

# 子资源路径：加载图片的 SpriteFrame
正确：resources.load('images/icon/spriteFrame', SpriteFrame, cb)
      → 加载 icon.png 的 SpriteFrame 子资源
错误：resources.load('images/icon', SpriteFrame, cb)
      → 加载到的是 ImageAsset，类型不匹配

# 子资源路径：加载图片的 Texture2D
正确：resources.load('images/icon/texture', Texture2D, cb)

# 图集资源：需指定类型
正确：resources.load('images/ui-atlas', SpriteAtlas, cb)
      然后通过 atlas.getSpriteFrame('name') 获取具体帧
```

## 加载流程与错误处理

```ts
import { _decorator, Component, Prefab, instantiate, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('DynamicLoadDemo')
export class DynamicLoadDemo extends Component {
  loadPrefab(path: string) {
    // 步骤 1：加载资源（异步）
    resources.load(path, Prefab, (err, prefab) => {
      // 步骤 2：必须同时检查 err 和资源
      if (err) {
        console.error('加载失败:', err.message || err);
        return;
      }
      if (!prefab) {
        console.error('加载返回的资源为空');
        return;
      }

      // 步骤 3：使用资源
      const instance = instantiate(prefab);
      instance.setParent(this.node);
    });
  }
}
```

## resources.load 与 bundle.load 的区别

| 对比维度 | resources.load | bundle.load |
|---|---|---|
| 资源位置 | `assets/resources/` | 自定义 Bundle 目录（可配置为远程） |
| 获取 Bundle | 全局 `resources` 变量直接用 | 需先 `assetManager.loadBundle()` 或 `getBundle()` |
| 加载时机 | 应用启动时 resources Bundle 已预加载 | Bundle 按需加载，首次需下载（远程包） |
| 适用场景 | 小项目、少量动态资源 | 大型项目、分包、热更新、DLC |
| 构建后位置 | 随主包或 resources 包 | 可配置为远程包或本地包 |

## 批量加载

```ts
import { _decorator, Component, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('BatchLoadDemo')
export class BatchLoadDemo extends Component {
  start() {
    // 加载目录下所有 SpriteFrame
    resources.loadDir('icons', SpriteFrame, (err, frames) => {
      if (err) {
        console.error('批量加载失败:', err);
        return;
      }
      // frames 是 SpriteFrame[]，但可能包含 null
      const validFrames = frames.filter((f): f is SpriteFrame => f !== null);
      console.log(`成功加载 ${validFrames.length} 个精灵帧`);
    });
  }
}
```

## 常见错误

1. **路径带扩展名**：`resources.load('enemy.prefab', ...)` → 去掉 `.prefab`。
2. **resources 目录不存在或路径错误**：`assets/resources/` 需要手动创建，路径区分大小写。
3. **未指定类型参数导致重名冲突**：同一路径下有 `player.png` 和 `player.atlas`，需 `resources.load('player', SpriteAtlas, cb)` 明确类型。
4. **加载失败未判空**：回调中 `err` 不为 null 或 `asset` 为 null 时没有 return，后续代码崩溃。
5. **在回调外使用资源**：load 是异步的，回调执行之前资源不可用。
6. **加载非 resources 目录资源**：`resources.load` 只能加载 `assets/resources/` 下的资源，其他目录需用 Bundle API。

## 关联文档

- [resources 目录使用指南](./resources-folder.md)
- [Asset Bundle](./asset-bundle.md)
- [预加载资源](./preload.md)
- [资源释放](./release.md)
- [动态加载资源 Recipe](../recipes/load-resource-dynamically.md)
- [resources API 卡片](../api-reference/resources.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - 动态加载 resources
- 已交叉验证：cc-engine 3.8 公开类型声明（`resources: AssetManager.Bundle`、Bundle.load 方法签名）
- 补充：工程经验——路径规则和异步回调是最常见的动态加载陷阱
