---
id: cocos-3.8-ui-2d-ui-transform
version: "3.8"
category: ui-2d
title: UITransform — UI 节点尺寸与布局基础
keywords:
  - UITransform
  - 节点尺寸
  - UI 布局
  - 锚点
  - contentSize
  - 碰撞检测
  - 父子节点尺寸
related_docs:
  - ui-2d/canvas.md
  - ui-2d/widget.md
  - api-reference/ui-transform.md
  - recipes/screen-adaptation.md
related_api:
  - UITransform
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - UITransform"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# UITransform — UI 节点尺寸与布局基础

## 用途

UITransform 是 UI 节点的尺寸与布局组件，控制 UI 节点的**宽高**、**锚点**和**碰撞响应区域**。所有 UI 相关的节点（Canvas、Widget、Button、Label 等）都必须依赖 UITransform 确定自身在 UI 坐标系中的占位。

## 核心结论

- 每个 UI 节点默认挂载一个 UITransform 组件。`contentSize` 决定节点的**逻辑尺寸**（逻辑像素宽高）。
- `anchorPoint`（锚点）取值范围 `(0,0)` 左下到 `(1,1)` 右上，默认 `(0.5,0.5)` 中心。锚点影响定位、旋转和缩放的参考点。
- 父子节点尺寸关系：子节点的位置和百分比尺寸（Widget）参考父节点的 UITransform `contentSize`。
- UITransform 也决定 UI 点击事件的命中检测区域。`contentSize` 为 0 时节点无法接收交互事件。
- UITransform 和 Node 的 `position` / `rotation` / `scale` 共同决定 UI 元素的最终渲染位置。

## 什么时候使用

- 任何 UI 节点都需要了解其 UITransform 的 `contentSize` 和 `anchorPoint`。
- 动态创建 UI 节点后，通过 UITransform 设置尺寸。
- 布局异常时检查父子节点的 UITransform 值。
- 点击不生效时检查 UITransform 的 `contentSize` 是否为零或过小。

## 关键 API / 组件

- `UITransform.contentSize`：节点逻辑尺寸 `Size`。修改后 UI 元素可见范围同步变化。
- `UITransform.anchorPoint`：锚点 `Vec2`。默认 `(0.5, 0.5)`。
- `UITransform.priority`：同一父节点下多个 UITransform 的排序优先级，影响点击事件分发顺序。

## 最小示例

```ts
import { _decorator, Component, UITransform, Vec2, Size } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UITransformDemo')
export class UITransformDemo extends Component {
  start() {
    const uiTransform = this.getComponent(UITransform);
    if (!uiTransform) return;
    // 将当前节点尺寸设为 200x100 逻辑像素
    uiTransform.setContentSize(new Size(200, 100));
    // 锚点设为左下角
    uiTransform.setAnchorPoint(new Vec2(0, 0));
  }
}
```

## 常见错误

- UI 元素显示错位：检查父子节点 UITransform 的 `anchorPoint` 设置。例如子节点使用百分比定位时（Widget），父节点 `contentSize` 变化会导致子节点位置偏移。
- 按钮点击无效：Button 所在节点或其祖先节点的 UITransform 的 `contentSize` 为零。
- 动态创建节点后尺寸异常：未调用 `setContentSize`，UITransform 默认尺寸可能为 `(0, 0)`。
- 多个 UITransform 叠加导致事件错乱：检查 `priority` 属性，高 priority 优先响应点击。

## 关联文档

- [Canvas — UI 渲染根节点](canvas.md)
- [Widget — 自动对齐与边距](widget.md)
- [屏幕适配心智模型](screen-adaptation.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - UITransform
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
