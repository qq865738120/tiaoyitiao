---
id: cocos-3.8-api-reference-prefab
version: "3.8"
category: api-reference
title: Prefab
keywords:
  - Prefab
  - 预制体
  - 实例化
  - instantiate
  - 预制件
related_docs:
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - recipes/instantiate-prefab.md
related_api:
  - Prefab
  - instantiate
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - Prefab"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Prefab

## 用途

Prefab 是预先制作并保存为资源的节点模板。通过 `instantiate(prefab)` 可动态创建 Prefab 实例，用于运行时动态生成场景对象。

## 所属模块

```ts
import { Prefab, instantiate } from 'cc';
```

## 公开导出结论

- `Prefab` 在 `cc` 模块以 `export class Prefab extends Asset` 公开导出。
- 核心属性和方法：`data`（根节点数据）、`optimizationPolicy`（实例化优化策略）、`createNode(callback)`（创建节点）。
- `Prefab.OptimizationPolicy` 静态对象包含 `AUTO`、`SINGLE_INSTANCE`、`MULTI_INSTANCE` 三种策略值。
- `instantiate(prefab: Prefab): Node` 和 `instantiate<T>(original: T): T` 在 `cc` 模块公开导出为独立函数。
- `Prefab.PrefabInstance` 和 `Prefab.PrefabInfo` 在命名空间中公开，但属于编辑器/内部用途，不推荐在运行时代码中使用。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `data` | Prefab 根节点数据 | 直接操作预制体节点结构（仅编辑器操作） |
| `optimizationPolicy` | 实例化优化策略（AUTO/SINGLE_INSTANCE/MULTI_INSTANCE） | 性能优化 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `instantiate(prefab)`（独立函数） | 克隆 Prefab 创建新节点 | 动态创建预制体实例 |
| `createNode(callback)` | 异步创建节点 | 编辑器/特殊场景 |

## 高频代码

### 动态加载并实例化 Prefab

```ts
import { _decorator, Component, Prefab, instantiate, resources, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('PrefabExample')
export class PrefabExample extends Component {
  start() {
    resources.load('enemies/EnemyShip', Prefab, (err, prefab) => {
      if (err) return;
      if (!prefab) return;

      // 实例化预制体
      const instance = instantiate(prefab);
      instance.setParent(this.node);
      instance.setPosition(0, 0, 0);
    });
  }
}
```

### 在场景中实例化预置节点

```ts
import { _decorator, Component, instantiate, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('InstantiateExample')
export class InstantiateExample extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  fire() {
    if (!this.bulletPrefab) return;

    const bullet = instantiate(this.bulletPrefab);
    this.node.addChild(bullet);
  }
}
```

## 常见错误

1. **路径不带扩展名**：`resources.load` 加载 Prefab 时不加 `.prefab` 扩展名。
2. **使用了 `new Prefab()`**：PreFab 只能通过 `resources.load` 加载或编辑器绑定获取，不能 `new Prefab()` 创建。
3. **忘记 `resources.load` 回调检查 null**：加载失败时 `prefab` 参数为 null，需先判断再使用。
4. **实例化后未设置 parent**：`instantiate(prefab)` 创建的节点不在场景中，需手动指定 parent。
5. **修改 Prefab 本身而非实例**：`instantiate` 后的修改应在实例上进行，不要直接修改加载的 Prefab 资源对象。

## 关联任务

- [实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md) — 三种实例化方式的完整可运行代码与常见错误排查
- [动态加载资源](../recipes/load-resource-dynamically.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - Prefab
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
