---
id: cocos-3.8-scene-node-component-common-node-compositions
version: "3.8"
category: scene-node-component
title: 常用节点组合
keywords:
  - 节点组合
  - 节点树模板
  - 场景搭建
  - 按钮
  - 滚动列表
  - 弹窗
  - 玩家
  - 相机
  - 瓦片地图
  - 音频
  - 加载界面
  - HUD
related_docs:
  - scene-node-component/node.md
  - scene-node-component/component.md
  - scene-node-component/common-patterns.md
  - scene-node-component/hierarchy.md
  - scene-node-component/prefab.md
  - ui-2d/button.md
  - ui-2d/scroll-view.md
  - ui-2d/layout.md
  - ui-2d/sprite.md
  - ui-2d/label.md
related_api:
  - Node
  - Component
  - UITransform
  - Button
  - Sprite
  - Label
  - ScrollView
  - Layout
  - Mask
  - ProgressBar
  - Camera
  - AudioSource
source:
  official: "Cocos Creator 3.8 官方文档 - 节点与组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：成熟的节点组合是快速搭建场景的关键"
status: draft
updated: 2026-07-24
---

# 常用节点组合

## 用途

提供可直接用于搭建场景的节点树模板，说明为何这样组合、各组件之间的引用关系以及可选变化。每个模板包含节点树结构、组件列表和组件间引用关系。

## 核心结论

- **节点组合模板是场景搭建的积木**，使用标准模板可减少编辑器操作失误。
- **组件引用优先通过编辑器拖拽绑定**（`@property`），避免运行时查找。
- **根节点负责逻辑**，子节点负责视觉展示和子模块。
- **2D/UI 可渲染节点需要位于 RenderRoot2D 子树**；Canvas 是最常用的屏幕 UI 根，但不是唯一合法根。

---

## 关联文档

- [Node 开发用法与模式](./node.md)
- [Component 开发用法](./component.md)
- [常见模式与最佳实践](./common-patterns.md)
- [节点层级与父子关系](./hierarchy.md)
- [Prefab 开发用法与设计权衡](./prefab.md)
- [Button 按钮详解](../ui-2d/button.md)
- [ScrollView 滚动视图详解](../ui-2d/scroll-view.md)
- [Layout 自动布局](../ui-2d/layout.md)
- [Widget 适配对齐](../ui-2d/widget.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 节点与组件
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——成熟的节点组合是快速搭建场景的关键；模板自带引用应复核，业务引用优先通过 @property 绑定
