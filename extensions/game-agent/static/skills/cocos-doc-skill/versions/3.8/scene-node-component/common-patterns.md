---
id: cocos-3.8-scene-node-component-common-patterns
version: "3.8"
category: scene-node-component
title: 常见模式与最佳实践
keywords:
  - 最佳实践
  - 性能优化
  - 缓存节点
  - find
  - getComponent
  - 属性绑定
  - 单例模式
  - 对象池
related_docs:
  - scene-node-component/node.md
  - scene-node-component/component.md
  - scene-node-component/transform.md
  - scene-node-component/destroy-lifecycle.md
  - scene-node-component/node-events.md
related_api:
  - Node
  - Component
  - find
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本开发最佳实践"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：缓存引用、避免 update 中大量计算、对象池是高性能游戏的基础"
status: draft
updated: 2026-06-17
---

# 常见模式与最佳实践

## 用途

汇集游戏开发中 Node/Component 操作的常见模式、性能优化推荐和代码组织建议。

## 核心结论

- **不要在其他生命周期回调中执行高开销操作**（查找、遍历、频繁创建）。
- **缓存引用**：`getComponent`、`getChildByName`、`find` 的结果应在 `onLoad` 中获取并保存。
- **对象池优于频繁 create/destroy**：对频繁创建销毁的对象（子弹、粒子）使用对象池。
- **@property 绑定优于代码查找**：能通过编辑器拖拽绑定的引用就不在代码中查找。
- **单例模式用常驻节点**：全局管理器放在场景根节点，用 `director.addPersistRootNode` 保持跨场景存在。

## 不要在其他生命周期回调中频繁查找节点

```ts
import { _decorator, Component, Node, Label } from 'cc';

const { ccclass } = _decorator;

@ccclass('BadPatternExample')
export class BadPatternExample extends Component {
  private _scoreLabel: Label | null = null;

  // ❌ 错误：在 update 中每帧查找
  // update(dt: number) {
  //   const label = this.node.getChildByName('ScoreLabel');
  //   if (label) {
  //     const comp = label.getComponent(Label);
  //     if (comp) comp.string = '100';
  //   }
  // }

  // ✅ 正确：在 onLoad 中查找并缓存
  onLoad() {
    const labelNode = this.node.getChildByName('ScoreLabel');
    if (labelNode) {
      this._scoreLabel = labelNode.getComponent(Label);
    }
  }

  updateScore(score: number) {
    if (!this._scoreLabel) return;
    this._scoreLabel.string = `${score}`;
  }
}
```

## 节点引用缓存

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CachePatternExample')
export class CachePatternExample extends Component {
  // 方式一：编辑器绑定（最佳）
  @property(Node)
  uiRoot: Node | null = null;

  // 方式二：代码缓存
  private _children: Node[] = [];

  onLoad() {
    // 缓存子节点数组（避免反复访问 children 属性）
    this._children = [...this.node.children];
  }

  someMethod() {
    // 使用缓存而非 this.node.children
    for (const child of this._children) {
      if (!child || !child.isValid) continue;  // 销毁后判空
      // ...
    }
  }
}
```

## 对象池模式

频繁创建和销毁节点会产生 GC 压力。使用对象池复用节点：

```ts
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SimplePool')
export class SimplePool extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  private _pool: Node[] = [];

  // 获取一个节点
  acquire(): Node | null {
    if (!this.bulletPrefab) return null;

    let node = this._pool.pop();
    if (!node) {
      // 池中无可用，创建新的
      node = instantiate(this.bulletPrefab);
    }
    node.active = true;
    return node;
  }

  // 回收节点
  release(node: Node) {
    node.active = false;
    node.removeFromParent();
    this._pool.push(node);
  }
}
```

## 单例模式与常驻节点

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('GlobalManager')
export class GlobalManager extends Component {
  private static _instance: GlobalManager | null = null;

  static get instance(): GlobalManager | null {
    return GlobalManager._instance;
  }

  onLoad() {
    // 防止重复
    if (GlobalManager._instance) {
      this.node.destroy();
      return;
    }
    GlobalManager._instance = this;
    director.addPersistRootNode(this.node);
  }

  onDestroy() {
    if (GlobalManager._instance === this) {
      GlobalManager._instance = null;
    }
  }
}
```

## @property 声明最佳实践

```ts
import { _decorator, Component, Node, Label, Prefab } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PropertyPatternExample')
export class PropertyPatternExample extends Component {
  // ✅ 引用类型声明为可空（TypeScript 严格模式）
  @property(Node)
  targetNode: Node | null = null;

  @property(Label)
  titleLabel: Label | null = null;

  @property(Prefab)
  enemyPrefab: Prefab | null = null;

  // ✅ 值类型可以有默认值
  @property
  speed: number = 100;

  @property
  maxEnemies: number = 5;

  start() {
    // 使用前始终判空
    if (this.targetNode) {
      this.targetNode.setPosition(0, 0, 0);
    }

    if (this.titleLabel) {
      this.titleLabel.string = 'Game Start';
    }
  }
}
```

**规则**：
- 引用类型（Node、Label、Prefab 等）声明为 `Type | null` 并初始化为 `null`。
- 值类型（number、string、boolean）给合理的默认值。
- 使用前判空。

## 性能速查

| 操作 | 性能 | 建议 |
|---|---|---|
| `@property` 绑定 | ⭐⭐⭐ | 最推荐 |
| `getComponent` 缓存 | ⭐⭐⭐ | onLoad 中获取一次 |
| `getChildByName` 缓存 | ⭐⭐ | onLoad 中获取一次 |
| `getComponent` 每帧 | ⭐ | 避免 |
| `find()` 每帧 | ⭐ | 严禁 |
| `new Node + destroy` 频繁 | ⭐ | 用对象池替代 |
| `worldPosition` 每帧 | ⭐⭐ | 必要时缓存结果 |

## 关联文档

- [Node 开发用法](./node.md)
- [Component 开发用法](./component.md)
- [Transform 变换](./transform.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本开发最佳实践
- 补充：工程经验——缓存引用、避免 update 中大量查找、对象池是高性能游戏的基础模式
