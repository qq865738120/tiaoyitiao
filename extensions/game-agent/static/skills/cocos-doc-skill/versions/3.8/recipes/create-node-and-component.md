---
id: cocos-3.8-recipes-create-node-and-component
version: "3.8"
category: recipes
title: 创建节点并添加组件
keywords:
  - 创建节点
  - 添加组件
  - 动态创建
  - new Node
  - addComponent
  - 脚本挂载
related_docs:
  - api-reference/node.md
  - api-reference/component.md
  - api-reference/ui-transform.md
related_api:
  - Node
  - Component
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 创建和销毁节点"
  verified-against: []
  supplement:
    - "工程经验：创建节点后必须设置 parent 才能出现在场景中"
status: draft
updated: 2026-06-17
---

# 创建节点并添加组件

## 目标

在运行时动态创建一个新节点，并为其添加组件（如 UITransform、Label、Sprite 等），使其在场景中可渲染和交互。

## 推荐做法

1. 使用 `new Node(name)` 创建节点，**必须为节点设置 parent**（`addChild` 或 `setParent`）才会出现在场景中；
2. 使用 `node.addComponent(ComponentClass)` 添加组件；
3. 如需设置尺寸，使用 `node.getComponent(UITransform)` 获取 UITransform 并设置 `width`/`height`；
4. 组件添加前先用 `getComponent` 检查是否已存在，避免重复添加导致异常。

## 示例代码

### 创建带 Label 的节点

```ts
import { _decorator, Component, Node, Label, UITransform } from 'cc';

const { ccclass } = _decorator;

@ccclass('CreateLabelNode')
export class CreateLabelNode extends Component {
  start() {
    // 1. 创建节点
    const labelNode = new Node('DynamicLabel');

    // 2. 添加到当前节点下
    this.node.addChild(labelNode);

    // 3. 添加 UITransform 组件（UI 节点必须）
    const uiTransform = labelNode.addComponent(UITransform);
    uiTransform.width = 200;
    uiTransform.height = 40;

    // 4. 添加 Label 组件
    const label = labelNode.addComponent(Label);
    label.string = '动态创建的文本';
    label.fontSize = 24;
  }
}
```

### 创建带 Sprite 的节点

```ts
import { _decorator, Component, Node, Sprite, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CreateSpriteNode')
export class CreateSpriteNode extends Component {
  @property(SpriteFrame)
  spriteFrame: SpriteFrame | null = null;

  start() {
    if (!this.spriteFrame) return;

    const spriteNode = new Node('DynamicSprite');
    this.node.addChild(spriteNode);

    const uiTransform = spriteNode.addComponent(UITransform);
    uiTransform.width = 100;
    uiTransform.height = 100;

    const sprite = spriteNode.addComponent(Sprite);
    sprite.spriteFrame = this.spriteFrame;
  }
}
```

## 操作步骤

1. 使用 `new Node('节点名')` 创建节点实例；
2. 使用 `parentNode.addChild(node)` 将节点加入场景层级树；
3. 使用 `node.addComponent(ComponentClass)` 挂载所需组件；
4. 对组件属性进行初始化（如 Label.string、UITransform.contentSize、Sprite.spriteFrame）；
5. 如需设置位置，使用 `node.setPosition(x, y, z)`。

## 验证方式

- 运行场景后，在 **层级管理器** 中应能看到动态创建的节点；
- 在 **场景编辑器** 中节点可见（Label 显示文字，Sprite 显示图片）；
- 通过 `console.log(node.name)` 可打印节点名称确认创建成功。

## 常见错误

1. **创建节点后忘记添加到场景**：`new Node()` 创建的节点 `parent` 默认为 null，必须调用 `addChild` 或 `setParent` 才能出现在场景中。
2. **UI 节点未添加 UITransform**：Label、Sprite 等 UI 组件依赖 UITransform 组件提供尺寸信息，缺少时渲染异常。
3. **重复添加同一组件**：编辑器模式下若组件被 `@disallowMultiple` 标注，重复添加会被阻止；运行时默认允许多次挂载。建议先用 `getComponent` 检查，避免逻辑上重复挂载。
4. **在 onLoad 中通过 getComponent 获取刚添加的组件**：`addComponent` 返回的引用可直接使用，不需要再 `getComponent`。

## 相关文档

- [Node API 卡片](../api-reference/node.md)
- [Component API 卡片](../api-reference/component.md)
- [UITransform API 卡片](../api-reference/ui-transform.md)
- [修改 Label 文案](./change-label-text.md)
