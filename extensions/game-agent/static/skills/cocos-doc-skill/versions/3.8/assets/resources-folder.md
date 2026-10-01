---
id: cocos-3.8-assets-resources-folder
version: "3.8"
category: assets
title: resources 目录使用指南
keywords:
  - resources
  - resources目录
  - 动态加载
  - 资源目录
  - assets/resources
  - resources.load
  - 路径规则
  - 构建导出
related_docs:
  - assets/asset-workflow.md
  - assets/dynamic-loading.md
  - assets/asset-bundle.md
  - assets/release.md
  - api-reference/resources.md
  - api-reference/asset-manager.md
related_api:
  - resources
  - assetManager
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 动态加载 resources"
  verified-against: []
  supplement:
    - "工程经验：resources 目录的路径规则和构建行为是新手高频问题"
status: draft
updated: 2026-06-17
---

# resources 目录使用指南

## 用途

说明 `assets/resources/` 目录的特殊性：何时使用、路径规则、构建行为，以及与其他加载方式的选择。

## 核心结论

- **`resources` 是 Cocos 的"动态加载专用目录"**：只有此目录（及其子目录）下的资源才能通过 `resources.load()` 动态加载。
- **路径相对 `resources/`，不带扩展名**：`resources.load('prefabs/enemy', Prefab, ...)` 加载的是 `assets/resources/prefabs/enemy.prefab`。
- **构建时全部导出**：`resources` 目录下的所有资源及其依赖都会被导出，即使未在场景中引用。
- **不应滥用 resources**：只把需要动态加载的资源放入；静态引用的资源放其他目录即可。

## 什么时候使用

| 场景 | 做法 | 原因 |
|---|---|---|
| 需要动态加载的资源（运行时决定的 Prefab、图片、配置等） | 放入 `resources/` | 唯一支持 `resources.load()` 动态加载 |
| 场景中已拖拽引用的资源 | **不要**放入 `resources/` | 场景引用已保证资源导出；放入会重复打包 |
| 只需要被其他 resources 资源依赖的资源 | **不要**放入 `resources/` | 依赖会自动导出；放入会增大 `config.json` |
| 需要按需加载的大批量资源 | 考虑 **Asset Bundle** 替代 | Bundle 支持远程加载、分包，更灵活 |

### resources vs Asset Bundle 选择

| 对比维度 | resources | Asset Bundle |
|---|---|---|
| 创建难度 | 简单：手动建目录即可 | 需在编辑器配置 |
| 加载 API | `resources.load()` | `bundle.load()` |
| 远程加载 | 不支持（除非主包配置为远程） | 原生支持 |
| 分包 | 不支持 | 支持小游戏分包 |
| 按需加载 | 全部打包，无法拆分 | 可按 Bundle 拆分加载 |
| 推荐场景 | 小项目、少量动态资源 | 中大型项目、DLC、远程更新 |

## 路径规则

```text
assets/
└─ resources/               ← resources 根目录（手动创建）
   ├─ prefabs/
   │  └─ enemy.prefab       → resources.load('prefabs/enemy', Prefab, ...)
   ├─ images/
   │  └─ icon.png
   │     ├─ ImageAsset      → resources.load('images/icon', ImageAsset, ...)
   │     ├─ SpriteFrame     → resources.load('images/icon/spriteFrame', SpriteFrame, ...)
   │     └─ Texture2D       → resources.load('images/icon/texture', Texture2D, ...)
   └─ data/
      └─ config.json        → resources.load('data/config', JsonAsset, ...)
```

关键规则：

- 路径**不带扩展名**：`'prefabs/enemy'` 而非 `'prefabs/enemy.prefab'`。
- 子资源路径**加后缀**：加载图片的 SpriteFrame 用 `'images/icon/spriteFrame'`。
- **区分大小写**：`'Prefabs/Enemy'` 与 `'prefabs/enemy'` 不同（取决于文件名）。

## 最小示例

```ts
import { _decorator, Component, Prefab, instantiate, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('ResourcesDemo')
export class ResourcesDemo extends Component {
  start() {
    // 加载 resources/prefabs/enemy.prefab
    resources.load('prefabs/enemy', Prefab, (err, prefab) => {
      if (err || !prefab) {
        console.error('加载失败，请检查：\n1. resources 目录是否存在\n2. 路径是否正确\n3. 资源文件是否存在', err);
        return;
      }

      const instance = instantiate(prefab);
      this.node.addChild(instance);
    });
  }
}
```

## 构建行为

构建时，`resources` 目录的处理规则：

1. `resources` 下所有资源及依赖**全部导出**（无论是否被引用）。
2. 如果某资源仅被 `resources` 内的资源依赖，不在 `resources` 目录本身，也会被**连带导出**。
3. `resources` 目录外的资源，如果没有被任何场景或 resources 资源引用，则被**自动剔除**。
4. 过多无用资源放入 `resources` 会导致包体增大、`config.json` 膨胀。

## 常见错误

1. **路径带扩展名**：`resources.load('enemy.prefab', ...)` → 应去掉扩展名。
2. **resources 目录未创建**：`assets/resources/` 不会自动生成，需要手动在 `assets/` 根目录下创建。
3. **resources 目录名拼写错误**：必须是 `resources`（全小写），`Resources` 无效。
4. **加载非 resources 目录资源**：`resources.load()` 只能加载 `assets/resources/` 下的资源。
5. **滥用 resources 导致包体过大**：静态引用的资源不应放入 resources，应放在其他目录通过场景/组件属性引用。
6. **路径大小写错误**：文件名区分大小写，开发期 Mac 上不区分但构建后真机上可能区分。

## 关联文档

- [资源导入与工作流](./asset-workflow.md)
- [动态加载资源](./dynamic-loading.md)
- [Asset Bundle](./asset-bundle.md)
- [资源释放](./release.md)
- [resources API 卡片](../api-reference/resources.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - 动态加载 resources
- 补充：工程经验——resources 目录的路径规则、构建行为是最常见的资源加载困惑来源
