---
id: cocos-3.8-scene-node-component-node
version: "3.8"
category: scene-node-component
title: Node 开发用法与模式
keywords:
  - Node
  - 节点
  - 创建节点
  - 查找节点
  - 节点操作
  - 动态创建节点
  - 节点树
related_docs:
  - api-reference/node.md
  - api-reference/component.md
  - scene-node-component/component.md
  - scene-node-component/hierarchy.md
  - scene-node-component/destroy-lifecycle.md
  - recipes/create-node-and-component.md
related_api:
  - Node
  - find
  - instantiate
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：创建节点后必须设置 parent 才能出现在场景中"
status: draft
updated: 2026-06-17
---

# Node 开发用法与模式

## 用途

说明在游戏开发中如何创建、查找和使用 Node，以及常见的节点操作模式。本文聚焦**开发用法**，Node 的完整 API 列表见 [Node API 卡片](../api-reference/node.md)。

## 核心结论

- **Node 是场景中一切对象的容器**，负责层级关系和空间变换。每个 Node 可以挂载多个 Component。
- 创建节点用 `new Node(name)`，**必须**通过 `addChild` 或 `setParent` 添加到场景树才会生效。
- 查找节点优先用 `getChildByName` / `getChildByPath`，避免用 `find()`（全局搜索性能差）。
- `@property(Node)` 是编辑器绑定节点引用最推荐的方式，无需运行时查找。

## 什么时候使用

- 需要运行时动态创建游戏对象（子弹、敌人、UI 弹窗等）。
- 需要在脚本中访问场景中的其他节点。
- 需要操作节点的层级关系（移动子节点、改变父节点）。

## 创建节点

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('CreateNodeExample')
export class CreateNodeExample extends Component {
  start() {
    // 方式一：纯代码创建
    const node = new Node('MyNode');
    this.node.addChild(node);  // ← 必须添加到场景树

    // 方式二：从 Prefab 实例化
    // const instance = instantiate(this.myPrefab);
    // this.node.addChild(instance);
  }
}
```

**关键要点**：
- `new Node()` 创建的节点 `parent` 为 `null`，不进入场景树。
- 如果只创建节点不设置 parent，该节点占用的内存不会被释放（将成为游离对象）。

## 查找节点

| 方式 | 适用场景 | 性能 |
|---|---|---|
| `@property(Node)` 编辑器绑定 | 已知固定节点 | ⭐⭐⭐ 最优 |
| `getChildByName(name)` | 查找直接子节点 | ⭐⭐ 好 |
| `getChildByPath('A/B/C')` | 查找深层子节点 | ⭐⭐ 好 |
| `find('Canvas/UI/Button')` | 全局搜索 | ⭐ 差，应避免频繁调用 |

```ts
import { _decorator, Component, Node, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('FindNodeExample')
export class FindNodeExample extends Component {
  @property(Node)
  uiRoot: Node | null = null;  // ← 推荐：编辑器拖拽绑定

  start() {
    // 按名称查找子节点
    const child = this.node.getChildByName('ScoreLabel');
    if (!child) return;

    // 按路径查找深层子节点
    const deep = this.node.getChildByPath('UI/Panel/Button');
    if (deep) {
      const label = deep.getComponent(Label);
      if (label) label.string = 'Found';
    }
  }
}
```

## 关键 API / 组件

- `new Node(name)` — 创建节点
- `node.addChild(child)` — 添加到场景树
- `node.getChildByName(name)` — 按名称查找
- `node.getChildByPath(path)` — 按路径查找
- `node.removeFromParent()` — 从父节点移除
- `node.destroy()` — 销毁节点（延迟到帧末）
- `find(path)` — 全局查找（仅初始化时用）
- `node.active` — 激活/隐藏
- `node.parent` — 父节点
- `node.children` — 子节点数组

详见 [Node API 卡片](../api-reference/node.md)。

## 常见错误

1. **创建节点后忘记 addChild**：`new Node()` 创建的节点不在场景树中，不可见、组件生命周期不执行。
2. **在 update 中频繁 `find()`**：`find()` 是全局深度搜索，开销大。应缓存查找结果或使用 `@property` 绑定。
3. **节点 destroy 后仍使用引用**：`destroy()` 延迟到帧末执行，之后访问会返回无效数据。使用 `isValid(node)` 判断。
4. **`node.active` 与 `node.activeInHierarchy` 混淆**：`active = true` 但父节点 `active = false` 时，`activeInHierarchy` 仍为 `false`。

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [Component 开发用法](./component.md)
- [节点层级操作](./hierarchy.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)
- [创建节点与组件（Recipe）](../recipes/create-node-and-component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - 节点
- 补充：工程经验——节点创建后必须设置 parent；find 性能陷阱
