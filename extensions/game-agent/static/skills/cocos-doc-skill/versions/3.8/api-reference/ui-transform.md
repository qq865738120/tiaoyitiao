---
id: cocos-3.8-api-reference-ui-transform
version: "3.8"
category: api-reference
title: UITransform
keywords:
  - UITransform
  - UI 变换
  - 内容尺寸
  - 锚点
  - 节点大小
related_docs:
  - api-reference/node.md
  - api-reference/component.md
  - ui-2d/ui-transform.md
related_api:
  - UITransform
  - Component
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - UITransform"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# UITransform

## 用途

UITransform 是 UI 节点的尺寸变换组件，提供内容尺寸（contentSize）和锚点（anchorPoint）控制。所有带 UI 交互的节点（Label、Sprite、Button 等）都依赖此组件定义布局区域。

## 所属模块

```ts
import { UITransform } from 'cc';
```

## 公开导出结论

- `UITransform` 在 `cc` 模块以 `export class UITransform extends Component` 公开导出。
- 公开属性（全部 getter/setter）：`contentSize`（`Readonly<Size>`）、`width`、`height`、`anchorPoint`（`Readonly<Vec2>`）、`anchorX`、`anchorY`。
- 已废弃属性 `priority`（v3.1 起废弃）、`visibility`（v3.0 起废弃），不在 API 卡片中推荐使用。
- `cameraPriority`（只读）为渲染相机优先级。
- `UITransform.EventType` 继承自 `NodeEventType`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `contentSize` | 内容尺寸（Size 对象，含 width/height） | 获取/设置节点大小 |
| `width` | 节点宽度 | 单独修改宽 |
| `height` | 节点高度 | 单独修改高 |
| `anchorPoint` | 锚点位置（Vec2，默认 (0.5, 0.5)） | 调整对齐方式 |
| `anchorX` | 锚点 X（0~1，0=左，1=右） | 水平对齐 |
| `anchorY` | 锚点 Y（0~1，0=下，1=上） | 垂直对齐 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| 无独立公开方法 | 所有操作通过属性设置 | 直接赋值宽高/锚点 |

## 高频代码

### 修改 UI 节点尺寸

```ts
import { _decorator, Component, UITransform } from 'cc';

const { ccclass } = _decorator;

@ccclass('UIResizeExample')
export class UIResizeExample extends Component {
  start() {
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) return;

    // 单独设置宽高
    uiTransform.width = 200;
    uiTransform.height = 100;

    // 使用 contentSize 设置
    uiTransform.contentSize = { width: 200, height: 100 };
  }
}
```

### 获取节点实际渲染区域

```ts
import { _decorator, Component, UITransform, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GetSizeExample')
export class GetSizeExample extends Component {
  @property(Label)
  debugLabel: Label | null = null;

  start() {
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) return;

    if (this.debugLabel) {
      this.debugLabel.string = `节点尺寸: ${uiTransform.width} x ${uiTransform.height}`;
    }
  }
}
```

## 常见错误

1. **在非 UI 节点上获取 UITransform**：非 UI 节点（如纯 3D 节点）可能没有 UITransform，使用前应 `getComponent(UITransform)` 并检查 null。
2. **误解锚点对位置的影响**：锚点 (0,0) 表示节点左下角为原点，(0.5,0.5) 表示中心为原点，不同于 CSS 默认左上角。
3. **contentSize 只影响 UI 变换，不影响 3D 节点**：3D 节点的变换由 Transform 组件管理，与 UITransform 无关。

## 关联任务

- [创建节点与组件](../recipes/create-node-and-component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - UITransform
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
