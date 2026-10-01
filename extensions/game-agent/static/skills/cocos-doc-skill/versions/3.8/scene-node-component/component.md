---
id: cocos-3.8-scene-node-component-component
version: "3.8"
category: scene-node-component
title: Component 开发用法与模式
keywords:
  - Component
  - 组件
  - 获取组件
  - 添加组件
  - getComponent
  - addComponent
  - 组件引用
  - 空引用
related_docs:
  - api-reference/component.md
  - api-reference/node.md
  - scene-node-component/node.md
  - scene-node-component/active-enabled.md
  - scene-node-component/destroy-lifecycle.md
  - recipes/create-node-and-component.md
related_api:
  - Component
  - Node
  - _decorator
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：空引用是最常见 bug 来源"
status: draft
updated: 2026-06-17
---

# Component 开发用法与模式

## 用途

说明在游戏开发中如何获取组件、添加组件、修改组件属性，以及常见的组件访问模式和空引用问题。本文聚焦**开发用法**，Component 的完整 API 列表见 [Component API 卡片](../api-reference/component.md)。

## 核心结论

- **Component 是功能体**，挂载到 Node 上赋予行为。一个 Node 可以有多个 Component。
- 获取同节点上的其他组件：`this.node.getComponent(SomeClass)`。
- 添加组件：`node.addComponent(SomeClass)`，**重复添加会抛异常**。
- **空引用是最高频 bug**：`getComponent` 返回 `null` 时未判断就使用。

## 获取组件

### 获取同节点上的其他组件

```ts
import { _decorator, Component, Label, Sprite } from 'cc';

const { ccclass } = _decorator;

@ccclass('GetComponentExample')
export class GetComponentExample extends Component {
  start() {
    // 获取同节点上的 Label 组件
    const label = this.node.getComponent(Label);
    if (!label) {
      console.warn('节点上没有 Label 组件');
      return;
    }
    label.string = 'Hello';

    // 获取所有同类型组件
    const allLabels = this.node.getComponents(Label);
  }
}
```

### 获取子节点上的组件

```ts
import { Label } from 'cc';

// 深度优先搜索子节点中的第一个匹配组件
const label = this.node.getComponentInChildren(Label);
if (label) label.string = 'Found in child';

// 获取所有子节点中的匹配组件
const allLabels = this.node.getComponentsInChildren(Label);
```

## 添加组件

```ts
import { _decorator, Component, Node, Label, UITransform } from 'cc';

const { ccclass } = _decorator;

@ccclass('AddComponentExample')
export class AddComponentExample extends Component {
  createLabelNode(text: string) {
    const node = new Node('LabelNode');
    this.node.addChild(node);

    // 先检查是否已存在，避免重复添加异常
    let label = node.getComponent(Label);
    if (!label) {
      label = node.addComponent(Label);
    }
    label.string = text;

    // UI 组件通常需要 UITransform
    if (!node.getComponent(UITransform)) {
      node.addComponent(UITransform);
    }

    return node;
  }
}
```

**要点**：
- `addComponent` 返回的组件引用可直接使用，无需再 `getComponent`。
- 同一节点上不能添加两个同类型组件（会抛异常），必须先 `getComponent` 检查。
- `@property` 声明的组件引用由编辑器赋值，脚本中应始终判空。

## 修改组件属性

```ts
import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ModifyComponentExample')
export class ModifyComponentExample extends Component {
  @property(Label)
  scoreLabel: Label | null = null;  // 编辑器绑定

  @property(SpriteFrame)
  iconFrame: SpriteFrame | null = null;

  public updateScore(score: number) {
    // 通过编辑器绑定的引用修改组件属性（推荐）
    if (!this.scoreLabel) return;
    this.scoreLabel.string = `分数: ${score}`;
  }

  public changeIcon() {
    // 通过 getComponent 获取后修改（运行时动态获取）
    const sprite = this.node.getComponent(Sprite);
    if (sprite && this.iconFrame) {
      sprite.spriteFrame = this.iconFrame;
    }
  }
}
```

**优先级**：
1. `@property` 编辑器绑定（性能最优，无需查找）
2. `getComponent` 在 `onLoad` 中获取并缓存（一次查找，多次使用）
3. 避免在 `update` 中频繁 `getComponent`（每帧查找开销大）

## 常见空引用问题

| 场景 | 原因 | 解决 |
|---|---|---|
| `getComponent` 返回 `null` | 节点上不存在该组件 | 使用前判空 `if (!comp) return;` |
| `@property` 属性为 `null` | 未在编辑器中拖拽绑定 | 声明类型为 `null` 可空，运行时判空 |
| `getComponentInChildren` 返回 `null` | 子节点中无该组件 | 确认子节点已挂载组件且 active 为 true |
| `this.node` 在构造函数中为 `null` | 组件尚未附加到节点 | 初始化代码放在 `onLoad` 或 `start` 中 |

```ts
import { _decorator, Component, Label } from 'cc';
const { ccclass } = _decorator;

// 推荐的空安全写法
@ccclass('SafeComponent')
export class SafeComponent extends Component {
  private _label: Label | null = null;

  onLoad() {
    // 在 onLoad 中获取并缓存
    this._label = this.node.getComponent(Label);
  }

  setText(text: string) {
    // 每次使用前判空
    if (!this._label) return;
    this._label.string = text;
  }
}
```

## 关键 API / 组件

- `node.getComponent(Class)` — 获取指定类型组件
- `node.getComponents(Class)` — 获取所有同类型组件
- `node.getComponentInChildren(Class)` — 深度搜索子节点
- `node.addComponent(Class)` — 添加组件（重复添加抛异常）
- `this.node` — 从组件访问所属节点
- `component.enabled` — 组件启用/禁用

详见 [Component API 卡片](../api-reference/component.md)。

## 关联文档

- [Component API 卡片](../api-reference/component.md)
- [Node 开发用法](./node.md)
- [active 与 enabled 区别](./active-enabled.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)
- [创建节点与组件（Recipe）](../recipes/create-node-and-component.md)
- [常见模式与最佳实践](./common-patterns.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本系统 - 组件
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——空引用是最高频 bug；addComponent 重复添加问题已修正，详见 api-reference/node.md 常见错误第 2 条
