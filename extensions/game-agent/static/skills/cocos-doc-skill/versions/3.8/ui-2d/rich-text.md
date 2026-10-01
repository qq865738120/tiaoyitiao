---
id: cocos-3.8-ui-2d-rich-text
version: "3.8"
category: ui-2d
title: RichText — 富文本显示组件
keywords:
  - RichText
  - 富文本
  - inline-style
  - 文本样式
  - 内联图片
  - 合批性能
  - Label 对比
related_docs:
  - ui-2d/label.md
  - ui-2d/sprite.md
  - recipes/change-label-text.md
  - troubleshooting/ui-not-visible.md
related_api:
  - RichText
  - Label
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - RichText"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# RichText — 富文本显示组件

## 用途

RichText 在 UI 中渲染带内联样式的富文本，支持指定片段颜色、字号、加粗、斜体、下划线以及内嵌图片。适合聊天消息、描述文本、多态文本展示。

## 核心结论

- RichText 使用类 HTML 的标签语法：`<color=#ff0000>红色文字</color>`、`<size=36>大字号</size>`、`<b>加粗</b>`、`<i>斜体</i>`、`<u>下划线</u>`。
- 内嵌图片使用 `<img src='sprite-frame-uuid' />` 标签，引用的必须是 SpriteFrame 资源的 UUID。仅支持 BMFont 位图字体的合批阈值内的小图片。
- RichText 与 Label 核心差异：
  - Label：纯文本，合批友好，性能好，支持 BMFont。
  - RichText：支持内联样式和图片，但每个片段产生独立的渲染请求，容易打断合批，性能不如 Label。
- RichText 不支持 BMFont 字体，仅使用系统字体或 TTF 字体。
- RichText 的自动尺寸可能不精确；推荐指定 `maxWidth` 让文本换行，减少自动计算引起的布局抖动。

## 什么时候使用

- 需要同一段文本内不同颜色、字号混排。
- 需要文本行内插入小图标（例如聊天表情）。
- 不需要极致合批性能的静态说明文本。

## 关键 API / 组件

- `RichText.string`：富文本字符串，包含标签标记。
- `RichText.maxWidth`：最大宽度，超出自动换行。
- `RichText.lineHeight`：行高。
- `RichText.fontSize`、`RichText.font`：基础字体设置，标签内的 `<size>`、`<color>` 会覆盖基础设置。
- `RichText.horizontalAlign`：水平对齐方式。

## 最小示例

```ts
import { _decorator, Component, RichText } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RichTextDemo')
export class RichTextDemo extends Component {
  start() {
    const rt = this.getComponent(RichText);
    if (!rt) return;
    rt.maxWidth = 300;
    rt.string = '<color=#ff0000>红色</color>普通<size=36>大字</size>';
  }
}
```

## 常见错误

- RichText 不显示：检查 `string` 格式是否正确、标签是否闭合、节点是否在 Canvas 子树下。
- 内嵌图片不显示：检查 `<img>` 标签的 `src` 是否为有效的 SpriteFrame UUID；图片所在的图集合批可能被 RichText 打断。
- 文本位置与预期不同：RichText 行高计算可能与 Label 不同，需显式设置 `lineHeight`。
- 合批被严重打乱：RichText 中每个样式片段产生独立渲染命令，插入图片后合批进一步碎裂。优化方案：减少 RichText 使用数量，静态内容用多个 Label 拼装。

## 关联文档

- [Label — 纯文本显示组件](label.md)
- [Sprite — 图片显示组件](sprite.md)
- [修改文本内容步骤](../recipes/change-label-text.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)
- [DrawCall 合批优化](draw-call-batching.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - RichText
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
