---
id: cocos-3.8-ui-2d-label
version: "3.8"
category: ui-2d
title: Label — UI 文本显示组件
keywords:
  - Label
  - 文本
  - 字体
  - 文本颜色
  - 透明度
  - RichText 对比
  - UI 文本
related_docs:
  - ui-2d/rich-text.md
  - ui-2d/sprite.md
  - api-reference/label.md
  - recipes/change-label-text.md
  - troubleshooting/ui-not-visible.md
related_api:
  - Label
  - RichText
  - Sprite
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Label"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Label — UI 文本显示组件

## 用途

Label 组件在 UI 中渲染文本。它支持系统字体、位图字体（BMFont）和 TTF 字体三种方式，是 UI 中最常用的显示组件之一。

## 核心结论

- Label 在 UI 体系中属于**渲染组件**，必须挂载在 Canvas 子树下的节点上才能被渲染。
- 字体策略选择：
  - **System Font**（系统字体）：不依赖资源，运行时使用设备系统字体，适合占位文本或不需要统一字体风格的情形。
  - **TTF 字体**：自定义字体文件（`.ttf`），支持描边、加粗等效果，需要拖入字体资源。
  - **BMFont 位图字体**：预渲染的图片字体（`.fnt` + `.png`），合批性能最优，适合固定字符集（如数字分数）。
- Label 的颜色和透明度通过节点的 `color` 和 `opacity` 控制，而非 Label 内部属性。
- Label 与 RichText 对比：Label 纯文本渲染、性能更好、合批友好；RichText 支持内联样式和图片，但会打断合批且不支持 BMFont。
- 修改文本内容 → 指向 [recipes/change-label-text.md](../recipes/change-label-text.md)。
- UI 显示不出来 → 先检查节点是否在 Canvas 子树下，再检查 UITransform `contentSize` 是否为零。

## 什么时候使用

- 需要显示普通文本（按钮文字、标题、数值）。
- 不需要内联样式或多段复杂排版。
- 对合批性能和生成批次敏感的场景。

## 关键 API / 组件

- `Label.string`：文本内容，字符串类型。
- `Label.fontSize`：字号，数字类型。
- `Label.font`：字体资源，`Font` 类型（TTF 或 BMFont）。
- `Label.fontFamily`：系统字体名称，仅当 `useSystemFont` 为 `true` 时生效。
- `Label.useSystemFont`：是否使用系统字体。
- `Label.isBold`、`Label.isItalic`：是否加粗、斜体。
- `Label.overflow`：文本溢出处理方式（`CLAMP`、`SHRINK`、`RESIZE_HEIGHT`、`NONE`）。
- `Label.horizontalAlign`、`Label.verticalAlign`：文本对齐方式。

## 最小示例

```ts
import { _decorator, Component, Label, Overflow } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LabelDemo')
export class LabelDemo extends Component {
  start() {
    const label = this.getComponent(Label);
    if (!label) return;
    label.string = 'Hello UI';
    label.fontSize = 32;
    label.overflow = Overflow.SHRINK; // 缩小以适应
  }
}
```

## 常见错误

- Label 不显示：检查节点是否在 Canvas 子树下、UITransform `contentSize` 是否为 0、颜色 alpha 是否为 0。
- 修改 `label.string` 后显示未立即更新：使用 `this.label.string = newValue` 直接赋值会自动刷新。
- 系统字体与预期不同：不同设备上系统字体可能存在差异，建议用 TTF 字体保证一致性。
- BMFont 引用后文字缺失：BMFont 图片中不包含该字符的位图。

## 关联文档

- [RichText — 富文本显示](rich-text.md)
- [Sprite — 图片显示组件](sprite.md)
- [修改 Label 文案步骤](../recipes/change-label-text.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Label
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
