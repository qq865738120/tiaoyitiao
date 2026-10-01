---
id: cocos-3.8-troubleshooting-ui-not-visible
version: "3.8"
category: troubleshooting
title: UI 不显示
keywords:
  - UI 不显示
  - 节点看不见
  - 子节点不渲染
  - Sprite 不显示
related_docs:
  - troubleshooting/button-not-clickable.md
  - api-reference/ui-transform.md
  - api-reference/sprite.md
  - api-reference/label.md
  - recipes/create-node-and-component.md
related_api:
  - UITransform
  - Sprite
  - Label
  - Node
  - Widget
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：UI 节点默认 ContentSize 为 0 导致不可见是常见陷阱"
status: draft
updated: 2026-06-17
---

# UI 不显示

## 现象

在场景中添加了 UI 节点（Sprite、Label、Button 等），运行时该节点在游戏画面中看不到。控制台无报错，节点树上可以找到该节点。

## 最可能原因

1. **节点 ContentSize 为零** — 新建的 UI 节点默认 `contentSize` 为 `(0, 0)`。没有设置 `contentSize` 或未绑定图片/文本时，节点不会渲染出任何可视内容。

2. **节点位置在屏幕可见区域之外** — 节点坐标超出 Canvas 的可见范围。尤其是作为子节点时，如果子节点坐标是相对坐标但偏移太大，可能移出父节点的裁剪区域。

3. **节点或其父节点 active = false** — 当节点或其任意祖先节点的 `active` 属性为 `false` 时，节点及其所有子节点都不会参与渲染。

4. **Canvas 组件或层叠顺序问题** — 节点没有被正确添加到 Canvas 下，或者节点的 `zIndex` / 层级小于其父节点中的其他节点，被遮挡。

5. **SizedBy 设置不当** — 使用了 Widget 组件或 Layout 组件自动调整大小，导致节点尺寸被压缩为 0 或被推离可见区域。

## 快速检查

- [ ] 在编辑器中选择该节点，检查 Inspector 面板中的 `ContentSize` 是否为 `(0, 0)`。
- [ ] 检查节点 `Position`，确认在 Canvas 可见范围内（默认 Canvas 尺寸为 `(960, 640)`，可通过场景编辑器 2D 视角目视确认）。
- [ ] 检查节点及其所有父节点的 `active` 属性是否都是 `true`。
- [ ] 确认节点是 Canvas 的子节点或孙子节点，而不是场景根节点的直接子节点（Canvas 之外的节点不属于 UI 渲染层级）。
- [ ] 如果使用了 Widget 组件，检查是否有过大的边距（margin）设置或对齐选项导致尺寸异常。

## 解决方案

1. 设置 `contentSize`：
   ```ts
   const uiTransform = this.node.getComponent(UITransform);
   if (uiTransform) {
     uiTransform.setContentSize(200, 100);
   }
   ```

2. 确认节点位置在 Canvas 范围内，或使用 Widget 组件来定位：
   ```ts
   const widget = this.node.addComponent(Widget);
   widget.isAlignCenter = true;
   widget.isAlignMiddle = true;
   ```

3. 确保节点挂载在 Canvas 节点下作为子节点（Canvas 是默认创建的 UI 根节点）。

4. 为 Sprite 组件设置有效的 `spriteFrame` 资源，为 Label 组件设置非空字符串。

## 仍未解决时

- 在场景编辑器中进入运行模式，用层级管理器（Hierarchy）确认节点是否存在且激活。
- 使用 `console.log(this.node.getComponent(UITransform)?.contentSize)` 在代码中打印 UTTransform 的尺寸。
- 检查是否有脚本在 `start()` 或 `update()` 中误修改了节点的 `active` 或 `position`。
- 切换到 3D 视角确认节点是否被意外旋转到了不与摄像机正对的方向。

## 相关文档

- [UITransform API 卡片](../api-reference/ui-transform.md)
- [Sprite API 卡片](../api-reference/sprite.md)
- [Label API 卡片](../api-reference/label.md)
- [Button 点击不生效](../troubleshooting/button-not-clickable.md)
