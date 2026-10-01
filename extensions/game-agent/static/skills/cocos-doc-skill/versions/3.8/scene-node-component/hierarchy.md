---
id: cocos-3.8-scene-node-component-hierarchy
version: "3.8"
category: scene-node-component
title: 节点层级与父子关系
keywords:
  - 节点层级
  - 父子节点
  - parent
  - children
  - addChild
  - removeChild
  - 节点树
  - 层级结构
  - siblingIndex
  - setParent
related_docs:
  - api-reference/node.md
  - scene-node-component/node.md
  - scene-node-component/transform.md
  - scene-node-component/destroy-lifecycle.md
related_api:
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - 节点层级"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：层级操作会影响坐标变换；setSiblingIndex 决定同级渲染顺序"
status: draft
updated: 2026-06-17
---

# 节点层级与父子关系

## 用途

说明如何管理节点的父子关系：添加/移除子节点、改变层级关系、调整兄弟节点顺序，以及层级变化对坐标变换和渲染顺序的影响。

## 核心结论

- **每个节点可以包含多个子节点**，形成树状层级结构。
- 父节点的 `position`、`rotation`、`scale` 会影响所有子节点的世界坐标。
- `setParent` 的 `keepWorldTransform` 参数控制切换父节点时是否保持世界坐标不变。
- `setSiblingIndex` 调整同级子节点在数组中的顺序，影响渲染层级（2D）。

## 添加与移除子节点

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('HierarchyExample')
export class HierarchyExample extends Component {
  start() {
    const child = new Node('Child');

    // 添加子节点（默认加到 children 数组末尾）
    this.node.addChild(child);

    // 从父节点移除自己
    child.removeFromParent();

    // 重新添加
    this.node.addChild(child);

    // 移除所有子节点
    // this.node.removeAllChildren();
  }
}
```

## 改变父节点（重新挂载）

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('ReparentExample')
export class ReparentExample extends Component {
  reparentNode(child: Node, newParent: Node) {
    // 方式一：用 setParent
    // keepWorldTransform = true: 保持世界坐标不变（推荐）
    child.setParent(newParent, true);

    // keepWorldTransform = false: 保持本地坐标不变
    // child.setParent(newParent, false);

    // 方式二：从旧父节点移除再添加
    // child.removeFromParent();
    // newParent.addChild(child);
  }
}
```

**`keepWorldTransform` 参数**：
- `true`（默认）：切换父节点后节点在屏幕上的位置保持不变。引擎自动调整本地坐标。
- `false`：本地坐标不变，但因为父节点不同，世界坐标可能变化。

## 遍历子节点

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('WalkChildrenExample')
export class WalkChildrenExample extends Component {
  // 遍历所有直接子节点
  printAllChildren() {
    for (const child of this.node.children) {
      console.log(child.name);
    }
  }

  // 递归遍历所有后代节点
  printAllDescendants() {
    this.node.walk((child) => {
      console.log(`visiting: ${child.name}`);
    });
  }
}
```

## 调整同级顺序

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('SiblingOrderExample')
export class SiblingOrderExample extends Component {
  start() {
    // 获取当前在同级中的索引
    const idx = this.node.getSiblingIndex();
    console.log(`当前索引: ${idx}`);

    // 设为第一个子节点（渲染在最底层）
    this.node.setSiblingIndex(0);

    // 设为最后一个子节点（渲染在最上层）
    const lastIdx = this.node.parent!.children.length - 1;
    this.node.setSiblingIndex(lastIdx);
  }
}
```

**2D 渲染层级规则**：
- Canvas 下同级节点按 `siblingIndex` 从小到大排列，**索引越大渲染越靠上**（后渲染覆盖先渲染）。
- 不同父节点下的子节点，由父节点的层级决定。
- z 轴 `position.z` 也参与排序，但优先级低于 `siblingIndex`。

## 检查父子关系

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CheckHierarchyExample')
export class CheckHierarchyExample extends Component {
  @property(Node)
  suspectedParent: Node | null = null;

  start() {
    // 判断某节点是否是自己的子节点
    if (this.node.isChildOf(this.suspectedParent)) {
      console.log('是子节点');
    }

    // 判断某节点是否是自己的父节点
    if (this.suspectedParent === this.node.parent) {
      console.log('是直接父节点');
    }
  }
}
```

## 层级与坐标变换

**子节点的世界坐标 = 父节点的世界变换 × 子节点的本地坐标。**

这意味着：
- 父节点移动，所有子节点跟着移动。
- 父节点旋转，子节点围绕父节点旋转。
- 父子节点的缩放**累积**：父节点 scale 为 2，子节点 scale 为 1.5，子节点实际缩放为 3。

```ts
// 示例：将节点从 Canvas 移到 GameWorld 节点下，保持屏幕位置不变
child.setParent(gameWorldNode, true);  // keepWorldTransform = true
```

## 常见错误

1. **移除后继续使用节点引用**：`removeFromParent()` 不清除引用，如果之后又 `destroy()` 了该节点，引用将变为无效。使用 `isValid(node)` 检查。
2. **忘记 `keepWorldTransform`**：切换父节点时默认 `keepWorldTransform = true`，如果希望本地坐标不变，需要显式传 `false`。
3. **直接修改 `children` 数组**：`children` 是只读属性，不能直接 push/splice。必须通过 `addChild` / `removeFromParent` / `removeAllChildren` 操作。
4. **循环引用**：不能将节点设为自身或后代节点的子节点。

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [Node 开发用法](./node.md)
- [Transform 变换](./transform.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - 节点层级
- 已交叉验证：cc-engine 3.8 公开类型声明
