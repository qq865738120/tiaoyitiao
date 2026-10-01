---
id: cocos-3.8-scene-node-component-component-dependencies-and-combinations
version: "3.8"
category: scene-node-component
title: 组件依赖规则与常见组件组合
keywords:
  - 组件依赖
  - requireComponent
  - disallowMultiple
  - 组件组合
  - 自动补组件
  - 依赖检查
  - 冲突组件
  - RigidBody2D
  - Collider2D
  - UITransform
  - UIRenderer
  - Animation
  - AudioSource
  - Button
  - ScrollView
  - Label
  - Sprite
  - Camera
  - Widget
related_docs:
  - scene-node-component/component.md
  - scene-node-component/node.md
  - scene-node-component/common-patterns.md
  - scene-node-component/transform.md
  - scene-node-component/active-enabled.md
  - ui-2d/button.md
  - ui-2d/scroll-view.md
  - ui-2d/ui-transform.md
  - ui-2d/widget.md
  - ui-2d/label.md
  - ui-2d/sprite.md
related_api:
  - Component
  - Node
  - _decorator
  - requireComponent
  - disallowMultiple
  - getComponent
  - addComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 组件依赖与常见组合"
  verified-against:
    - "cc-engine 3.8 源码装饰器声明"
    - "cc-engine 3.8 require-component 测试用例"
  supplement:
    - "工程经验：组件缺失是最常见的编辑器报错来源"
status: draft
updated: 2026-06-18
---

# 组件依赖规则与常见组件组合

## 用途

说明 Cocos Creator 3.8 中组件之间的依赖关系、装饰器约束、自动补充机制，以及游戏开发中常见的组件组合清单。帮助智能体在搭建场景节点时正确选择和搭配组件。

## 核心结论

- **@requireComponent** 声明组件依赖，添加组件时自动补充缺失依赖，但删除时不会级联删除。
- **@disallowMultiple** 禁止同一节点添加多个同类型组件。
- 运行时仍需调用 `getComponent` 检查依赖组件是否存在，不能依赖装饰器保证。
- **UITransform** 是所有 2D UI 组件的基础依赖，几乎每个 UI 组件都要求它存在。

---
