---
id: cocos-3.8-recipes-instantiate-prefab
version: "3.8"
category: recipes
title: 实例化 Prefab
keywords:
  - Prefab
  - 预制体
  - 实例化
  - instantiate
  - 动态创建
  - 预制件
related_docs:
  - api-reference/prefab.md
  - api-reference/resources.md
  - api-reference/node.md
  - recipes/load-resource-dynamically.md
related_api:
  - Prefab
  - instantiate
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - Prefab"
  verified-against: []
  supplement:
    - "工程经验：instantiate 创建的节点 parent 为 null，必须手动设置 parent"
status: draft
updated: 2026-06-17
---

# 实例化 Prefab

## 目标

在运行时动态加载 Prefab 资源并实例化为场景中的节点。

## 推荐做法

Prefab 实例化有三种方式：

1. **编辑器绑定 Prefab**：用 `@property(Prefab)` 声明属性，编辑器拖拽绑定，代码中 `instantiate(prefab)` 实例化；
2. **resources.load 动态加载**：将 Prefab 放在 `assets/resources/` 目录下，运行时 `resources.load` 加载后实例化；
3. **自定义 Bundle 加载**：通过 `assetManager.getBundle('bundleName')` 获取 Bundle，再 `bundle.load` 加载并实例化。

**不论哪种方式**，`instantiate(prefab)` 返回的节点 `parent` 为 null，必须手动设置 parent（`addChild` 或 `setParent`）才能出现在场景中。

## 示例代码

### 方式一：编辑器绑定 Prefab（最常用）

```ts
import { _decorator, Component, Prefab, instantiate, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PrefabSpawner')
export class PrefabSpawner extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  @property(Node)
  spawnPoint: Node | null = null;

  fire() {
    if (!this.bulletPrefab || !this.spawnPoint) return;

    const bullet = instantiate(this.bulletPrefab);
    bullet.setParent(this.node);
    bullet.setPosition(this.spawnPoint.position);
  }
}
```

### 方式二：resources.load 动态加载

```ts
import { _decorator, Component, Prefab, instantiate, resources, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('DynamicPrefabLoader')
export class DynamicPrefabLoader extends Component {
  spawnEnemy(enemyType: string) {
    // 路径相对于 assets/resources，不带扩展名
    const path = `enemies/${enemyType}`;

    resources.load(path, Prefab, (err, prefab) => {
      if (err) {
        console.error('Prefab 加载失败:', err);
        return;
      }
      if (!prefab) return;

      const instance = instantiate(prefab);
      this.node.addChild(instance);
      instance.setPosition(0, 0, 0);
    });
  }
}
```

### 方式三：自定义 Bundle 加载

```ts
import { _decorator, Component, Prefab, instantiate, assetManager, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('BundlePrefabLoader')
export class BundlePrefabLoader extends Component {
  loadFromBundle(bundleName: string, prefabPath: string) {
    const bundle = assetManager.getBundle(bundleName);
    if (!bundle) {
      console.error('Bundle 未加载:', bundleName);
      return;
    }

    bundle.load(prefabPath, Prefab, (err, prefab) => {
      if (err || !prefab) return;

      const instance = instantiate(prefab);
      this.node.addChild(instance);
    });
  }
}
```

## 操作步骤

1. 在编辑器中制作 Prefab（右键节点 → 创建预制体）；
2. 将 Prefab 资源放在 `assets/resources/` 下（动态加载时），或直接在脚本中 `@property(Prefab)` 声明并通过编辑器绑定；
3. 在运行时通过 `resources.load`、`bundle.load` 或直接使用编辑器绑定的引用获取 Prefab；
4. 调用 `instantiate(prefab)` 创建实例节点；
5. 将实例节点添加到场景中（`parentNode.addChild(instance)`）；
6. 设置实例节点的位置、旋转等属性。

## 验证方式

- 运行场景后，实例化的 Prefab 节点出现在层级管理器中；
- 实例节点在场景中正确显示，其子节点和组件与原始 Prefab 一致；
- 多次调用 `instantiate` 创建多个独立的实例，互不影响；
- 修改实例节点的属性（如位置、颜色）不影响原始 Prefab 资源。

## 常见错误

1. **路径带扩展名**：`resources.load('enemy/EnemyShip.prefab')` 错误，应为 `resources.load('enemy/EnemyShip', Prefab, ...)`。
2. **实例化后未设置 parent**：`instantiate` 创建的节点不在场景树中，必须使用 `setParent` 或 `addChild` 后才能渲染。
3. **修改 Prefab 资源本身**：`resources.load` 返回的 Prefab 对象是共享缓存对象，修改它会影响后续所有 `instantiate`。应在实例节点上进行修改，而非 Prefab 资源对象。
4. **混淆"加载"与"实例化"**：`resources.load` 或 `bundle.load` 得到的是 Prefab 资源对象，不调用 `instantiate` 不会创建场景节点。
5. **忘记回调判空**：加载失败时回调中 prefab 参数为 null，必须先判断再使用，否则 `instantiate(null)` 会导致运行时错误。
6. **resources 目录错误**：`resources.load` 只能加载 `assets/resources/` 下的资源，放在其他目录的资源无法加载。
7. **使用 new Prefab()**：Prefab 不能通过 `new` 创建，只能通过加载资源获取。

## 相关文档

- [Prefab API 卡片](../api-reference/prefab.md)
- [动态加载资源](./load-resource-dynamically.md)
- [释放资源](./release-resource.md)
- [创建节点与组件](./create-node-and-component.md)
