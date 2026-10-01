---
id: cocos-3.8-api-reference-node
version: "3.8"
category: api-reference
title: Node
keywords:
  - Node
  - 节点
  - 场景节点
  - 节点操作
related_docs:
  - api-reference/component.md
  - api-reference/ui-transform.md
  - scene-node-component/node.md
related_api:
  - Node
  - instantiate
  - find
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - 节点"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Node

## 用途

Node 是 Cocos Creator 场景中所有对象的基类容器。每个节点都拥有坐标变换（位置、旋转、缩放），可挂载组件，可包含子节点形成层级树。

## 所属模块

```ts
import { Node } from 'cc';
```

## 公开导出结论

- `Node` 在 `cc` 模块以 `export class Node extends CCObject` 公开导出。
- 构造函数 `constructor(name?: string)` 继承自 `CCObject`，参数为可选节点名。
- 公开 getter/setter 属性：`name`、`active`、`activeInHierarchy`、`parent`、`children`、`components`、`scene`、`uuid`。
- 公开方法：`addChild`、`removeChild`、`removeFromParent`、`removeAllChildren`、`getChildByName`、`getChildByPath`、`getChildByUuid`、`getSiblingIndex`、`setSiblingIndex`、`getParent`、`setParent`、`isChildOf`、`walk`、`attr`、`addComponent`、`getComponent`、`getComponents`、`getComponentInChildren`、`getComponentsInChildren`、`destroy`、`destroyAllChildren`、`on`、`off`、`once`、`emit`、`dispatchEvent`、`hasEventListener`、`targetOff`。
- 静态属性：`Node.EventType`（节点内置事件类型枚举）、`Node.NodeSpace`（坐标空间枚举）。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `name` | 节点名称 | 查找/识别节点 |
| `active` | 自身激活状态 | 显示/隐藏节点 |
| `activeInHierarchy` | 节点在场景中是否实际激活（含父节点影响） | 判断节点是否真正可见 |
| `parent` | 父节点（可为 null） | 移动节点层级 |
| `children` | 子节点数组（只读） | 遍历子节点 |
| `components` | 已附加组件列表（只读） | 检查已有组件 |
| `scene` | 节点所属场景（只读） | 判断节点归属 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `addChild(child)` | 添加子节点 | 构建节点树 |
| `removeFromParent()` | 从父节点移除自身 | 解绑节点 |
| `getChildByName(name)` | 按名称查找子节点 | 获取已知子节点 |
| `getComponent(classConstructor)` | 获取节点上指定类型的组件 | 获取组件引用 |
| `addComponent(classConstructor)` | 添加组件 | 动态挂载组件 |
| `on(type, callback, target)` | 注册节点事件监听 | 监听触摸/鼠标/自定义事件 |
| `off(type, callback, target)` | 移除事件监听 | 清理事件 |
| `destroy()` | 销毁节点（延迟到帧末执行） | 移除节点 |

## 高频代码

### 创建节点并添加组件

```ts
import { _decorator, Component, Node, Sprite } from 'cc';

const { ccclass } = _decorator;

@ccclass('NodeExample')
export class NodeExample extends Component {
  start() {
    // 创建节点
    const node = new Node('MyNode');
    // 添加到场景
    this.node.addChild(node);
    // 添加组件
    const sprite = node.addComponent(Sprite);
  }
}
```

### 查找子节点与获取组件

```ts
import { _decorator, Component, Label } from 'cc';

const { ccclass } = _decorator;

@ccclass('FindChildExample')
export class FindChildExample extends Component {
  start() {
    // 按名称查找子节点
    const child = this.node.getChildByName('ScoreLabel');
    if (!child) return;

    // 获取组件
    const label = child.getComponent(Label);
    if (label) {
      label.string = '100';
    }
  }
}
```

## 常见错误

1. **getComponent 返回 null 未检查**：节点上不存在该组件时返回 null，使用前必须判断。
2. **addComponent 重复添加**：编辑器模式下若组件被 `@disallowMultiple` 装饰器标注，重复添加会被检查并阻止；运行时默认允许多次挂载同类型组件。即便如此，业务上一般应先 `getComponent` 检查，避免逻辑上重复挂载导致状态紊乱。
3. **节点 destroy 后仍使用引用**：`destroy()` 是延迟执行（帧末），但之后不应再访问节点属性，需用 `isValid(node)` 判断。
4. **active 与 activeInHierarchy 混淆**：`active = true` 但父节点 `active = false` 时，`activeInHierarchy` 仍为 false。

## 关联任务

- [创建节点与组件](../recipes/create-node-and-component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - 节点
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
