---
id: cocos-3.8-recipes-change-label-text
version: "3.8"
category: recipes
title: 修改 Label 文案
keywords:
  - 修改文字
  - 修改文本
  - Label
  - label.string
  - 更改文字
  - 设置文本
  - 修改Label
related_docs:
  - api-reference/label.md
  - api-reference/node.md
  - api-reference/ui-transform.md
related_api:
  - Label
  - Node
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Label 组件"
  verified-against: []
  supplement:
    - "工程经验：高频修改 string 时建议使用 cacheMode = BITMAP 减少重排开销"
status: draft
updated: 2026-06-17
---

# 修改 Label 文案

## 目标

在运行时动态修改 Label 组件显示的文字内容、字号、颜色等属性。

## 推荐做法

1. 获取 Label 组件引用（通过 `@property` 编辑器绑定或 `getComponent(Label)` 查找）；
2. 直接赋值 `label.string` 修改文本内容；
3. 修改前必须判空：`getComponent(Label)` 在节点上不存在该组件时返回 null；
4. 高频修改（如倒计时、分数更新）时考虑 `cacheMode = Label.CacheMode.BITMAP` 减少重排性能开销。

## 示例代码

### 通过编辑器绑定修改

```ts
import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ChangeLabelExample')
export class ChangeLabelExample extends Component {
  @property(Label)
  scoreLabel: Label | null = null;

  private _score = 0;

  start() {
    this.updateScore(0);
  }

  updateScore(score: number) {
    if (!this.scoreLabel) return;
    this._score = score;
    this.scoreLabel.string = `得分: ${this._score}`;
  }

  addScore(points: number) {
    this.updateScore(this._score + points);
  }
}
```

### 通过代码查找并修改

```ts
import { _decorator, Component, Label, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('FindLabelExample')
export class FindLabelExample extends Component {
  start() {
    // 按名称查找子节点
    const titleNode = this.node.getChildByName('TitleLabel');
    if (!titleNode) return;

    // 获取 Label 组件
    const label = titleNode.getComponent(Label);
    if (!label) return;

    // 修改文本属性
    label.string = '游戏开始';
    label.fontSize = 36;
    label.color = { r: 255, g: 215, b: 0, a: 255 };
  }
}
```

### 动态修改颜色

```ts
import { _decorator, Component, Label, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LabelColorExample')
export class LabelColorExample extends Component {
  @property(Label)
  warningLabel: Label | null = null;

  showWarning(message: string) {
    if (!this.warningLabel) return;
    this.warningLabel.string = message;
    // 设置为红色
    this.warningLabel.color = new Color(255, 0, 0, 255);
  }

  hideWarning() {
    if (!this.warningLabel) return;
    this.warningLabel.string = '';
  }
}
```

## 操作步骤

1. 在场景中创建带有 Label 组件的节点（编辑器操作）或通过代码动态创建；
2. 在脚本中声明 `@property(Label)` 属性并在编辑器中拖拽绑定，或通过 `getComponent(Label)` 获取；
3. 使用前判断 Label 引用是否为 null；
4. 通过 `label.string` 赋值新文本；
5. 可选：修改 `fontSize`、`color`、`horizontalAlign` 等其他属性。

## 验证方式

- 运行场景后，Label 显示的文字与代码中设置的 `string` 值一致；
- 修改 `fontSize` 后文本大小明显变化；
- 修改 `color` 后文本颜色变化正确；
- 如果 Label 不显示，检查节点 `active` 和父节点 `activeInHierarchy` 是否都为 true。

## 常见错误

1. **getComponent 返回 null**：节点不存在 Label 组件或节点名称查找失败，必须判空。
2. **修改 string 无效果**：Label 节点的父节点 `active = false` 时，虽然组件正常但渲染不可见，检查 `activeInHierarchy`。
3. **文本超出不显示**：节点 UITransform 尺寸小于文本需要的空间且 `overflow = NONE` 时文字被裁剪。设置 `overflow = Label.Overflow.SHRINK` 或 `overflow = Label.Overflow.RESIZE_HEIGHT`。
4. **高频修改性能下降**：每帧修改 `string` 会触发文本重排和渲染重建，高帧率更新时建议 `cacheMode = Label.CacheMode.BITMAP`。
5. **修改颜色使用对象字面量**：`label.color = { r: 255, g: 0, b: 0, a: 255 }` 是标准写法，不要直接修改 `label.color.r`。

## 相关文档

- [Label API 卡片](../api-reference/label.md)
- [创建节点与组件](./create-node-and-component.md)
