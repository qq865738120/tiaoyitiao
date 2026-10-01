---
id: cocos-3.8-api-reference-label
version: "3.8"
category: api-reference
title: Label
keywords:
  - Label
  - 文本
  - 文字
  - 标签
  - 字体
related_docs:
  - api-reference/ui-transform.md
  - recipes/change-label-text.md
  - ui-2d/label.md
related_api:
  - Label
  - Font
  - HorizontalTextAlignment
  - VerticalTextAlignment
  - Label.Overflow
  - Label.CacheMode
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Label"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Label

## 用途

Label 组件用于在场景中显示文本，支持系统字体、TTF 字体和 BMFont 位图字体。提供文字对齐、溢出处理、描边、加粗、下划线等效果。

## 所属模块

```ts
import { Label } from 'cc';
```

## 公开导出结论

- `Label` 在 `cc` 模块以 `export class Label extends UIRenderer` 公开导出。
- 核心属性（全部为公开 getter/setter）：`string`、`fontSize`、`lineHeight`、`horizontalAlign`、`verticalAlign`、`overflow`、`enableWrapText`、`spacingX`、`actualFontSize`、`useSystemFont`、`fontFamily`、`font`、`cacheMode`、`isBold`、`isItalic`、`isUnderline`、`underlineHeight`、`enableOutline`、`outlineColor`、`outlineWidth`、`enableShadow`、`shadowColor`、`shadowOffset`、`shadowBlur`，以及斜体角度相关属性。
- 静态枚举：`Label.HorizontalAlign`（LEFT/CENTER/RIGHT）、`Label.VerticalAlign`（TOP/CENTER/BOTTOM）、`Label.Overflow`（NONE/CLAMP/SHRINK/RESIZE_HEIGHT）、`Label.CacheMode`（NONE/BITMAP/CHAR）。
- 继承自 `UIRenderer` 的属性：`color`（文本颜色）。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `string` | 文本内容 | 修改展示文案 |
| `fontSize` | 字体大小 | 调整字号 |
| `lineHeight` | 行高 | 调整行间距 |
| `horizontalAlign` | 水平对齐（LEFT/CENTER/RIGHT） | 文本居中 |
| `verticalAlign` | 垂直对齐（TOP/CENTER/BOTTOM） | 垂直居中 |
| `overflow` | 溢出处理（NONE/CLAMP/SHRINK/RESIZE_HEIGHT） | 文字过多时自适应 |
| `enableWrapText` | 是否自动换行 | 长文本换行 |
| `font` | 字体资源（TTF/BMFont） | 使用自定义字体 |
| `color` | 文本颜色（继承自 UIRenderer） | 修改文字颜色 |
| `useSystemFont` | 是否使用系统字体 | 切换系统/自定义字体 |

## 常用方法

| 方法 | 说明 |
|---|---|
| 无独立公开方法 | 所有操作通过属性赋值 |

## 高频代码

### 修改 Label 文案

```ts
import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LabelExample')
export class LabelExample extends Component {
  @property(Label)
  scoreLabel: Label | null = null;

  start() {
    if (this.scoreLabel) {
      this.scoreLabel.string = '得分: 100';
      this.scoreLabel.fontSize = 24;
      this.scoreLabel.color = { r: 255, g: 255, b: 255, a: 255 };
    }
  }
}
```

### 通过代码获取并修改 Label

```ts
import { _decorator, Component, Label } from 'cc';

const { ccclass } = _decorator;

@ccclass('GetLabelExample')
export class GetLabelExample extends Component {
  start() {
    const label = this.node.getComponent(Label);
    if (!label) return;

    label.string = '动态修改文本';
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
  }
}
```

## 常见错误

1. **Label 组件不存在**：节点上未添加 Label 组件时 `getComponent(Label)` 返回 null，使用前必须判空。
2. **字体文件缺失**：使用自定义字体（`font` 属性）但字体资源未正确导入时，文本显示为空白或方块。
3. **文本溢出不显示**：节点尺寸不足以容纳文本且 `overflow` 设为 NONE 时，超出部分被裁剪。
4. **性能问题**：频繁修改 `string` 会触发文本重排，高帧更新场景中应预分配或使用位图缓存（`cacheMode = BITMAP`）。

## 关联任务

- [修改 Label 文案](../recipes/change-label-text.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Label 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
