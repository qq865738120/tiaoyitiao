---
id: cocos-3.8-api-reference-instantiate
version: "3.8"
category: api-reference
title: instantiate
keywords:
  - instantiate
  - 实例化
  - 克隆节点
  - 复制节点
  - 生成对象
  - 预制体生成
related_docs:
  - api-reference/prefab.md
  - api-reference/node.md
  - api-reference/node-pool.md
  - recipes/instantiate-prefab.md
related_api:
  - instantiate
  - Node
  - Prefab
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 实例化"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-17
---

# instantiate

## 用途

`instantiate` 是 Cocos Creator 中用于复制/实例化节点和对象的函数。最常见的用途是从 `Prefab` 资源动态创建节点实例，也可用于克隆任意 `Node` 和部分 JavaScript 对象。实例化后的对象需要手动设置 `parent` 才能出现在场景树中。

## 所属模块

```ts
import { instantiate } from 'cc';
```

## 公开导出结论

- `instantiate` 在 `cc` 模块以独立函数公开导出。
- 有 2 个重载签名：
  - `instantiate(prefab: Prefab): Node` — 从 Prefab 资源实例化节点
  - `instantiate<T>(original: T): T` — 克隆节点或对象
- `instantiate` 在 `cc` 模块还有命名空间扩展，但核心使用为上述两个签名。
- 对应的 `NodePool` 配合使用可有效提升局部频繁创建/销毁场景的性能。

## 常用方法

| 签名 | 说明 | 高频场景 |
|---|---|---|
| `instantiate(prefab: Prefab): Node` | 从 Prefab 实例化新节点 | 加载 Prefab 后动态创建 |
| `instantiate<T>(original: T): T` | 克隆 Node 或对象 | 复制已有节点 |

## 高频代码

### 从 Prefab 实例化节点

```ts
import { _decorator, Component, Prefab, instantiate, resources, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('InstantiatePrefabExample')
export class InstantiatePrefabExample extends Component {
  start() {
    resources.load('enemies/Enemy', Prefab, (err, prefab) => {
      if (err) {
        console.error('加载失败:', err);
        return;
      }
      if (!prefab) return;

      // 从 Prefab 实例化节点
      const enemy = instantiate(prefab);
      // 必须设置 parent，否则节点不在场景中
      enemy.setParent(this.node);
      enemy.setPosition(100, 100, 0);
    });
  }
}
```

### 克隆已有节点

```ts
import { _decorator, Component, instantiate, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CloneNodeExample')
export class CloneNodeExample extends Component {
  @property(Node)
  templateNode: Node | null = null;

  start() {
    if (!this.templateNode) return;

    // 克隆场景中已有的节点
    const clone = instantiate(this.templateNode);
    this.node.addChild(clone);
    clone.setPosition(200, 0, 0);
  }
}
```

### 配合对象池使用

```ts
import { _decorator, Component, NodePool, Prefab, instantiate, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PooledSpawnExample')
export class PooledSpawnExample extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  private _pool = new NodePool();

  spawnBullet(): Node | null {
    // 优先从对象池取
    let bullet = this._pool.get();

    if (!bullet) {
      // 池空则实例化
      if (!this.bulletPrefab) return null;
      bullet = instantiate(this.bulletPrefab);
    }

    bullet.setParent(this.node);
    return bullet;
  }

  despawnBullet(bullet: Node) {
    bullet.removeFromParent();
    this._pool.put(bullet);
  }

  onDestroy() {
    this._pool.clear();
  }
}
```

## 常见错误

1. **未设置 parent 导致节点不可见**：`instantiate` 创建的节点不在场景树中，必须调用 `setParent` 或 `addChild` 后节点才会显示和参与渲染。
2. **资源未加载完成就实例化**：`Prefab` 需要先通过 `resources.load` 或编辑器绑定加载完成，在未完成的回调中尝试 `instantiate(prefab)` 会出错。
3. **传入 null**：`instantiate(null)` 在运行时可能返回 `null` 或报错，调用前应检查参数不为空。
4. **频繁 instantiate + destroy 导致性能问题**：对频繁创建/销毁的场景（如子弹、怪物），应使用 `NodePool` + `instantiate` 结合复用。
5. **instantiate 后修改 Prefab 本身**：`instantiate` 返回的是克隆实例，不应把对实例的修改反映到原始 Prefab 资源上。

## 关联任务

- [使用对象池管理节点](../recipes/use-node-pool.md)
- [动态加载资源](../recipes/load-resource-dynamically.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - 实例化
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
