---
id: cocos-3.8-assets-subpackage
version: "3.8"
category: assets
title: 小游戏分包与子包 — 按需加载与包体优化
keywords:
  - 分包
  - 子包
  - subpackage
  - 小游戏分包
  - 微信小游戏分包
  - 抖音小游戏分包
  - 资源分包
  - Bundle 分包
  - 分包大小限制
  - 资源找不到
  - subpackages
  - 首包过大
  - 主包超过4M
  - 平台分包差异
related_docs:
  - assets/cache-manager.md
  - assets/asset-bundle.md
  - assets/resources-folder.md
  - assets/dynamic-loading.md
  - assets/release.md
  - troubleshooting/package-too-large.md
related_api:
  - assetManager
  - assetManager.loadBundle
  - AssetManager.Bundle
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - 小游戏分包 / Asset Bundle"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：各平台分包限制可能随版本变化，以目标平台最新官方文档和真机测试为准"
status: needs-review
updated: 2026-06-18
---

# 小游戏分包与子包 — 按需加载与包体优化

> **此文档标记为 needs-review**：各平台分包大小限制及审核政策可能随平台版本变更，以目标平台最新官方文档和真机测试为准。

## 用途

说明小游戏平台分包/子包的适用场景、配置方法、Bundle/resources/远程资源的边界，以及分包资源找不到等常见错误的排查路径。

## 核心结论

- **小游戏分包**是部分小游戏平台（微信、抖音、淘宝、vivo 等）提供的功能，将资源拆分到独立包中，首包只下载主包，分包按需加载，减少首次启动时间。
- Cocos Creator 中的分包通过 **Asset Bundle** 实现，将 Bundle 的压缩类型设为"小游戏分包"即可。
- **Bundle、resources、远程资源的边界**：
  - `Bundle` 是资源模块化的通用单位，可以放本地、远程服务器、或小游戏分包中。
  - `resources` 是内置 Bundle，对应 `assets/resources/` 目录下的资源。
  - 远程资源（配置为远程包的 Bundle）与分包互斥：**小游戏分包只能放本地**，不能同时配置为远程包。
  - 分包用 `assetManager.loadBundle('bundleName', cb)` 加载，与加载普通 Bundle API 一致。
- **平台限制**：各小游戏平台的分包大小、命名规则、支持的基础库版本各不相同，下文列出常见限制作为参考，应以各平台官方文档和真机测试为准。
- **首包整治原则**：应把非首屏必需的资源全部划入分包。以下资源容易被打入主包，需要主动检查：
  - 未被手动配置为 Bundle 的 `assets/` 下资源默认打入 main Bundle。
  - 首场景引用的所有直接/间接依赖资源。
  - 在 `resources/` 目录下但首场景即加载的资源。
  - 大型纹理、音频、Spine/DragonBones 动画文件若在首屏使用，应考虑预加载策略或压缩。

> 注：各平台分包大小限制可能随版本更新变化，以下数据基于 Creator 3.8 文档，实际以目标平台最新官方文档为准。**平台政策（如审核规则、域名白名单要求）不在本文覆盖范围内，需单独查阅。**

## 常见平台分包大小限制（参考）

| 平台 | 主包限制 | 总分包限制 | 单个分包限制 |
|---|---|---|---|
| 微信小游戏 | 4MB | 30MB | 不限 |
| 抖音小游戏 | 4MB | 20MB | 20MB |
| 淘宝小游戏 | 4MB | 20MB | 5MB |
| vivo 小游戏 | 4MB | 20MB（主包+分包） | — |

### 各平台配置文件差异

不同小游戏平台的分包配置写入不同的配置文件，排查分包不生效时需要确认对应平台的文件是否正确生成：

| 平台 | 配置写入文件 | 备注 |
|---|---|---|
| 微信小游戏 | 发布包根目录 `game.json` | 基础库 2.1.0+ 支持分包 |
| 抖音小游戏 | 发布包根目录 `game.json` | 字段含义参考抖音小游戏配置文档 |
| 淘宝小游戏 | 发布包根目录 `setting.json` | 与其他平台不同 |
| vivo 小游戏 | 发布包 `vivo-mini-game/src/manifest.json` | 分包输出在 `src/` 目录下，非 `subpackages/` |
| OPPO 小游戏 | 发布包 `manifest.json` | 类似 vivo |
| 华为快游戏 | 发布包 `manifest.json` | 类似 vivo |

> 平台差异风险：各平台的配置文件格式、支持的基础库版本、分包能力上限均由平台方控制，引擎构建工具只是生成适配当前平台版本的配置。排查非微信/抖音平台的分包问题时，必须查阅对应平台的最新官方文档。

## 配置步骤

1. 在资源管理器选中目标文件夹，属性检查器勾选"配置为 Bundle"。
2. 将 **目标平台** 设为对应的小游戏平台。
3. 将 **压缩类型** 设为 **小游戏分包**（此时"配置为远程包"自动锁定不可勾选）。
4. 在构建发布面板中将 **主包压缩类型** 也设为 **小游戏分包**。
5. 构建后 Bundle 会输出到发布包 `subpackages/` 目录下。

## 加载分包

```ts
import { _decorator, Component, Prefab, instantiate, assetManager } from 'cc';

const { ccclass } = _decorator;

@ccclass('SubpackageDemo')
export class SubpackageDemo extends Component {
  start() {
    // 加载分包（与加载普通 Bundle 一致）
    assetManager.loadBundle('level2', (err, bundle) => {
      if (err) {
        console.error('分包加载失败:', err);
        return;
      }
      // 加载分包中的资源
      bundle.load('prefabs/enemy-boss', Prefab, (err, prefab) => {
        if (err || !prefab) return;
        const boss = instantiate(prefab);
        this.node.addChild(boss);
      });
    });
  }
}
```

## 常见错误

### 1. 分包资源找不到

**现象**：`bundle.load(...)` 返回错误，提示资源不存在。

**可能原因**：
- Bundle 名称写错（区分大小写）。
- 资源路径使用了 assets 下的完整路径而非 Bundle 的相对路径。Bundle 内部的 `load` 应使用相对于 Bundle 根目录的路径。
- Bundle 尚未加载完成就调用 `getBundle`（返回 null）。
- 分包被配置为远程包（互斥关系，小游戏分包不能同时为远程包）。

**检查步骤**：
1. 确认 Bundle 名称与配置中的 Bundle 名称一致。
2. 调用 `bundle.loadDir` 枚举 Bundle 中实际包含的资源。
3. 确认 `assetManager.getBundle('name')` 返回非 null。
4. 在构建输出目录的 `subpackages/` 下检查 Bundle 文件夹是否正确生成。

### 2. 分包加载后场景不显示

**现象**：分包中的场景加载后节点不显示或报错。

**原因**：分包中的场景依赖的资源可能位于其他 Bundle 中，如果依赖的 Bundle 未提前加载，资源会缺失。

**修复**：使用 `bundle.loadScene('sceneName', cb)` + `director.runScene(scene)` 加载场景，或确保所有依赖 Bundle 已提前加载。

### 3. 首包超过 4MB

**现象**：微信/抖音等小游戏提示主包超过 4MB。

**原因**：大量资源未被分包，默认全部打入 main Bundle。

**排查与修复**：
- 在构建面板查看各 Bundle 的大小分布，定位哪些资源占用主包空间。
- 将所有非首屏必需的资源划分到自定义 Bundle 中，配置为小游戏分包。
- 将首场景也配置为 Asset Bundle，使用构建面板的 **初始场景分包** 分离出主包。
- 检查 `resources/` 目录——该目录下的资源默认参与主包构建，如果不需要在首屏使用应当移入自定义 Bundle。
- 大型纹理资源优先使用压缩格式（如 ASTC/ETC2），减少文件体积。
- 合并使用相同纹理图集的 UI 元素，减少碎片资源文件。

### 4. 分包大小超限

**原因**：单个分包或总包超过目标平台限制（具体限制见上文平台对照表）。

**修复**：
- 将过大的分包进一步拆分到多个 Bundle 中（每个 Bundle 是一个独立文件夹）。
- 将部分非核心资源改为远程加载（配置为远程包，配合 `assetManager.cacheManager` 管理缓存）。
- 抖音平台单个分包限制 20MB，特别注意不要将过多资源放入一个 Bundle。

### 5. 分包配置正常但构建未生效

**原因**：目标平台设置不一致（如 Bundle 配置为微信平台但实际构建抖音平台）。

**修复**：检查 Bundle 的 **目标平台** 设置是否与当前构建面板中的 **发布平台** 一致。不同平台的 Bundle 可以分别配置不同压缩类型。

## 关联文档

- [CacheManager — 远程资源缓存](cache-manager.md)
- [Asset Bundle 使用指南](asset-bundle.md)
- [resources 目录使用指南](resources-folder.md)
- [动态加载资源](dynamic-loading.md)
- [资源释放](release.md)
- [包体过大排查](../troubleshooting/package-too-large.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 小游戏分包 / Asset Bundle / 各平台分包加载
- 已交叉验证：cc-engine 3.8 公开类型声明（`assetManager.loadBundle`、`AssetManager.Bundle`）；各平台配置文件差异已验证官方文档（微信 game.json、抖音 game.json、淘宝 setting.json、vivo manifest.json）
- 补充：工程经验——各平台分包限制及审核政策可能随平台版本变更，以目标平台最新官方文档和真机测试为准
