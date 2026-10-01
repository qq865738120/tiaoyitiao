---
id: cocos-3.8-scripting-node-component-access
version: "3.8"
category: scripting
title: 脚本中访问节点与组件
keywords:
  - 访问节点
  - 获取组件
  - getComponent
  - this.node
  - 属性绑定
  - 查找子节点
  - 跨组件引用
  - addComponent
related_docs:
  - scene-node-component/node.md
  - scene-node-component/component.md
  - scripting/ccclass-property.md
  - scripting/component-lifecycle.md
  - api-reference/node.md
  - api-reference/component.md
related_api:
  - Node
  - Component
  - getComponent
  - addComponent
  - find
  - _decorator
source:
  official: "Cocos Creator 3.8 官方文档 - 访问节点和组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：null 检查是跨组件访问的第一要务"
status: draft
updated: 2026-06-17
---

# 脚本中访问节点与组件

## 用途

说明在脚本中获取节点、组件和跨节点引用的推荐方式与优先级。本文聚焦**脚本编写者的实践决策**，节点和组件的完整操作见 [Node 开发用法](../scene-node-component/node.md) 和 [Component 开发用法](../scene-node-component/component.md)。

## 核心结论

- 访问组件和节点的方式有优先级：**`@property` 编辑器绑定 > `onLoad` 中查找并缓存 > 临时 `getComponent` > `find()` 全局搜索**。
- **`this.node`** 是组件访问所属节点的唯一入口，onLoad 起可用。
- **`getComponent` 必须判空**：返回 null 时直接使用会抛出 TypeError。
- **访问其他组件的时机**：`onLoad` 中获取引用是最安全的，`start` 中保证所有引用已就绪。

## 访问方式优先级

| 优先级 | 方式 | 适用场景 | 性能 |
|---|---|---|---|
| ⭐⭐⭐ | `@property` 编辑器拖拽绑定 | 固定结构的引用 | 最优（零运行时查找） |
| ⭐⭐ | `onLoad` 中 `getComponent` 缓存 | 运行时动态获取一次 | 好（仅查找一次） |
| ⭐ | `getChildByName` / `getChildByPath` | 按名称/路径查找子节点 | 中等 |
| ❌ | `find()` 全局搜索 | 应急场景 | 差（避免频繁调用） |
| ❌ | `update` 中每次 `getComponent` | — | 极差（每帧查找） |

## 三种推荐模式

### 模式一：编辑器绑定（最优）

```ts
import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BindingExample')
export class BindingExample extends Component {
  @property(Node)
  enemyNode: Node | null = null;

  @property(Label)
  scoreLabel: Label | null = null;

  start() {
    // 编辑器在 onLoad 之后、start 之前完成赋值
    if (this.scoreLabel) {
      this.scoreLabel.string = 'Score: 0';
    }
  }
}
```

### 模式二：onLoad 中获取并缓存

```ts
import { _decorator, Component, Label, Sprite } from 'cc';
const { ccclass } = _decorator;

@ccclass('CacheExample')
export class CacheExample extends Component {
  private _label: Label | null = null;
  private _sprite: Sprite | null = null;

  onLoad() {
    // 获取同节点上的其他组件并缓存引用
    this._label = this.node.getComponent(Label);
    this._sprite = this.node.getComponent(Sprite);
  }

  setText(text: string) {
    if (!this._label) return;  // ← 判空是习惯，不是可选项
    this._label.string = text;
  }
}
```

### 模式三：运行时获取子节点组件

```ts
import { _decorator, Component, Node, Label } from 'cc';
const { ccclass } = _decorator;

@ccclass('ChildAccessExample')
export class ChildAccessExample extends Component {
  getChildLabel(childName: string): Label | null {
    const child = this.node.getChildByName(childName);
    if (!child) return null;
    return child.getComponent(Label);
  }

  updateScore(childName: string, score: number) {
    const label = this.getChildLabel(childName);
    if (label) {
      label.string = `Score: ${score}`;
    }
  }
}
```

## 何时访问其他组件更安全

| 时机 | 安全性 | 说明 |
|---|---|---|
| `onLoad` | ⭐⭐⭐ | 所有节点的 onLoad 已执行，引用可用 |
| `start` | ⭐⭐⭐ | 所有 onLoad 和 onEnable 已完成，最安全 |
| `update` 首次 | ⭐⭐ | 可以，但应缓存引用不在每帧查找 |
| 构造函数 | ❌ | `this.node` 为 undefined |
| `onDestroy` 中 | ⚠️ | 其他节点可能已销毁，需 `isValid` 检查 |

## 常见空引用处理

```ts
import { _decorator, Component, Label } from 'cc';
const { ccclass } = _decorator;

@ccclass('SafeAccessExample')
class SafeAccessExample extends Component {
  private _target: any = null;

  onLoad() {
    const label = this.node.getComponent(Label);
    if (!label) {
      console.warn(`${this.node.name}: Label component missing`);
      return;  // 优雅降级，不抛异常
    }
    label.string = 'Ready';
  }

  // isValid 检查（节点销毁后）
  update() {
    if (this._target && this._target.isValid) {
      // 安全操作 target
    }
  }
}
```

## 常见错误

1. **getComponent 不判空**：直接 `this.getComponent(Label).string = 'x'`，组件不存在时 TypeError。
2. **在 update 中频繁 getComponent**：每帧查找开销大，应 onLoad 中缓存。
3. **用 `find()` 做常规查找**：全局深度搜索 O(n)，应改用 @property 绑定或 getChildByName。
4. **addComponent 前不检查**：重复添加同一类型组件抛异常，应先 `getComponent` 判断。
5. **异步回调中访问已销毁节点的组件**：回调中先用 `isValid(this.node)` 检查。

## 关联文档

- [Node 开发用法与模式](../scene-node-component/node.md)
- [Component 开发用法与模式](../scene-node-component/component.md)
- [@ccclass 与 @property 详解](./ccclass-property.md)
- [onLoad 与 start 实战选择](./component-lifecycle.md)
- [常见编码陷阱](./coding-pitfalls.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 访问节点和组件
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——三种引用模式优先级、空引用判空模式
