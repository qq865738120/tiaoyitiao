---
id: cocos-3.8-api-reference-node-pool
version: "3.8"
category: api-reference
title: NodePool
keywords:
  - NodePool
  - 对象池
  - 节点池
  - 子弹池
  - 怪物复用
  - put
  - get
  - 节点复用
related_docs:
  - api-reference/prefab.md
  - api-reference/instantiate.md
  - recipes/use-node-pool.md
related_api:
  - NodePool
  - instantiate
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本指南 - 对象池"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-18
---

# NodePool

## 用途

`NodePool` 是 Cocos Creator 提供的**用户态**节点对象池工具，用于管理可复用的 `Node` 实例。通过复用节点避免频繁创建和销毁带来的性能开销，适用于子弹、怪物、掉落物等需要大量重复创建和销毁的游戏对象。

> **重要区分**：引擎内部 `render-scene` 中存在同名的渲染缓冲池，与本卡片的用户态 `NodePool`（位于 `extensions/ccpool`）是完全不同的两个概念。本卡片仅讨论面向用户的 `NodePool`。

## 所属模块

```ts
import { NodePool } from 'cc';
```

## 公开导出结论

- `NodePool` 在 `cc` 模块以 `export class NodePool` 公开导出（已验证）。
- `NodePool` 由 `extensions/ccpool/node-pool.ts` 实现，并作为 `NodePool` 类型从 `cc` 导出（已验证）。
- 构造函数：`new NodePool(poolHandlerComp?: Constructor<IPoolHandlerComponent> | string)`，可选参数指定回收/取出时自动调用的处理组件类型或名称。
- 内部实现简单：核心数据为 `_pool: Node[]` 数组。
- 所有方法签名与行为均通过引擎源码交叉验证。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `get(...args)` | 从池中取出一个可用节点（LIFO），池空返回 `null`。取出后调用 handler 的 `reuse()` | 获取复用节点 |
| `put(obj: Node)` | 将节点回收到池中：自动 `removeFromParent()`（不 cleanup）、调用 handler 的 `unuse()`、防重复检查 | 回收节点复用 |
| `size()` | 返回池中当前缓存的节点数量 | 查看池状态 |
| `clear()` | 销毁池中所有缓存的节点（调用 `destroy()`）并清空数组 | 场景切换/组件销毁时清理 |

### put() 行为细节（已验证，基于引擎源码）

1. 检查 `obj` 是否存在且不在池中（防重复）：`this._pool.indexOf(obj) === -1`。
2. 调用 `obj.removeFromParent()` 将节点从场景树移除（不会执行 cleanup）。
3. 如果构造函数传入了 `poolHandlerComp`，获取节点上的处理组件并调用其 `unuse()` 方法。
4. 将节点推入 `_pool` 数组末尾。

**关键**：`put()` **不会**自动设置 `active = false`。若需要隐藏节点，应在 handler 的 `unuse()` 中手动设置。

### get() 行为细节（已验证，基于引擎源码）

1. 从 `_pool` 数组末尾弹出（LIFO）最后一个节点。
2. 如果构造函数传入了 `poolHandlerComp`，获取节点上的处理组件并调用其 `reuse(args)` 方法。
3. 返回节点。如果池空返回 `null`。

**关键**：`get()` **不会**自动设置 `active = true` 或 `setParent()`。取出的节点 `parent` 为 null（因 `put()` 中已 `removeFromParent`），需手动调用 `setParent()` 重新加入场景树。若需要激活节点，应在 handler 的 `reuse()` 或 get 调用后手动设置。

### clear() 行为细节（已验证，基于引擎源码）

`clear()` 会遍历池中所有节点，**逐个调用 `destroy()`**，然后清空内部数组。这意味着：
- `clear()` **会销毁**池中缓存的节点。
- 场景切换时如有对象池引用，必须在组件的 `onDestroy()` 中调用 `pool.clear()`，否则已销毁节点会残留在池中。

## 高频代码

### 基础对象池使用（含 PoolHandler）

```ts
import { _decorator, Component, NodePool, Prefab, instantiate, Node } from 'cc';

const { ccclass, property } = _decorator;

// PoolHandler 组件：在节点回收/取出时管理状态
@ccclass('Bullet')
export class Bullet extends Component {
  unuse() {
    // 当节点被 put 回对象池时调用
    // 在此重置状态并隐藏节点
    this.node.active = false;
    this.node.setPosition(0, 0, 0);
  }

  reuse(...args: any[]) {
    // 当节点被 get 从对象池取出时调用
    // 在此初始化并激活节点
    this.node.active = true;
  }
}

@ccclass('BasicPoolExample')
export class BasicPoolExample extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  // 传入处理组件名称，put/get 时自动调用 unuse/reuse
  private _pool = new NodePool('Bullet');

  getBullet(): Node | null {
    let bullet = this._pool.get();
    if (!bullet) {
      if (!this.bulletPrefab) return null;
      bullet = instantiate(this.bulletPrefab);
    }
    // 取出后手动设置 parent 加入场景树
    bullet.setParent(this.node);
    // active 状态由 reuse() 管理，此处无需再设
    return bullet;
  }

  recycleBullet(bullet: Node) {
    // put 会自动 removeFromParent 并调用 unuse()
    this._pool.put(bullet);
  }

  onDestroy() {
    // 组件销毁时清空对象池，销毁所有缓存节点
    this._pool.clear();
  }
}
```

### 不使用 PoolHandler 的简化用法

```ts
import { _decorator, Component, NodePool, Prefab, instantiate, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SimplePoolExample')
export class SimplePoolExample extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  // 不传 PoolHandler，手动管理 active/parent
  private _pool = new NodePool();

  getBullet(): Node | null {
    let bullet = this._pool.get();
    if (!bullet) {
      if (!this.bulletPrefab) return null;
      bullet = instantiate(this.bulletPrefab);
    }
    bullet.active = true;
    bullet.setParent(this.node);
    return bullet;
  }

  recycleBullet(bullet: Node) {
    bullet.active = false;  // 手动隐藏
    this._pool.put(bullet); // 自动 removeFromParent
  }

  onDestroy() {
    this._pool.clear();
  }
}
```

## 常见错误

1. **误以为 put/get 自动管理 active**：`NodePool` **不会**自动设置节点的 `active` 状态。`put()` 仅调用 `removeFromParent()` 和 `unuse()`，`get()` 仅调用 `reuse()`。请通过 PoolHandler 的 `unuse`/`reuse` 方法管理 active，或在调用 put/get 后手动设置。

2. **重复 put 同一节点**：`put()` 有防重复检查（indexOf），重复 put 会被忽略。但仍建议业务层自行避免重复 put。

3. **已销毁节点回收**：节点调用 `destroy()` 后再 `put`，`removeFromParent()` 操作可能异常。put 前应用 `isValid(node)` 检查。

4. **回收前未清理状态**：位置、数据引用等不清除会导致下次取出时残留。应使用 handler 的 `unuse` 方法重置，或在 put 前手动清理。

5. **场景切换时未 clear**：`clear()` 会销毁所有池中节点。但场景切换时如果持有对象池引用的组件未 `onDestroy`，池中引用可能失效。应在 `onDestroy` 中调用 `pool.clear()`。

6. **取出后未设 parent**：`get()` 取出的节点 `parent` 已在 `put()` 时被清空，取出后需手动调用 `setParent()` 加入场景树。

7. **混淆用户态 NodePool 与引擎内部渲染池**：`extensions/ccpool/node-pool.ts` 是面向用户的对象池工具，而引擎渲染管线内部另有同名的 NodePool 用于渲染缓冲。两者语义完全不同，不要混用或交叉引用。

## 关联任务

- [使用对象池管理节点](../recipes/use-node-pool.md)
- [实例化 Prefab](../api-reference/prefab.md)
- [实例化 API](../api-reference/instantiate.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本指南 - 对象池
- 已交叉验证：cc-engine 3.8 公开类型声明、引擎源码（extensions/ccpool/node-pool.ts）
- 注意：本卡片的 put/get/clear 行为描述基于 `extensions/ccpool/node-pool.ts` 源码逐行验证，与引擎内部渲染管线的同名 NodePool 严格区分。
