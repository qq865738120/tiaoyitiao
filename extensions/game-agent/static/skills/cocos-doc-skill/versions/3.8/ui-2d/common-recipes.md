---
id: cocos-3.8-ui-2d-common-recipes
version: "3.8"
category: ui-2d
title: UI 高频任务索引
keywords:
  - UI 任务
  - 高频任务
  - 常见操作
  - 修改文本
  - 修改图片
  - 适配屏幕
  - 按钮点击
  - UI 不显示
  - update 风险
related_docs:
  - ui-2d/label.md
  - ui-2d/sprite.md
  - ui-2d/button.md
  - ui-2d/screen-adaptation.md
  - scene-node-component/common-node-compositions.md
  - recipes/change-label-text.md
  - recipes/button-click.md
  - recipes/screen-adaptation.md
  - troubleshooting/ui-not-visible.md
  - troubleshooting/button-not-clickable.md
related_api:
  - Label
  - Sprite
  - Button
  - Canvas
  - Widget
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程建议：UI 更新尽量在事件回调中，避免每帧 update()"
status: draft
updated: 2026-06-17
---

# UI 高频任务索引

## 用途

为常见 UI 操作提供索引：每个任务指向一个对应的 recipe 文档或排错文档。智能体遇到 UI 相关用户问题时，先在此文档中判断任务类型，然后转发到对应文档。

## 高频任务总览

| 用户问法 | 对应文档 | 分类 |
|---|---|---|
| "如何修改 Label 文字？" | [recipes/change-label-text.md](../recipes/change-label-text.md) | 任务 |
| "如何修改按钮文字？" | → 同 Label 修改方式 | 任务 |
| "如何修改图片显示？" | [ui-2d/sprite.md](sprite.md) → 修改 `spriteFrame` | 主题 |
| "如何设置颜色/透明度？" | [ui-2d/sprite.md](sprite.md) → 节点 `color`/`opacity` | 主题 |
| "Button 怎么绑定点击？" | [recipes/button-click.md](../recipes/button-click.md) | 任务 |
| "Button 点击不生效怎么办？" | [troubleshooting/button-not-clickable.md](../troubleshooting/button-not-clickable.md) | 排错 |
| "如何适配不同屏幕？" | [recipes/screen-adaptation.md](../recipes/screen-adaptation.md) | 任务 |
| "UI 位置不对怎么办？" | [ui-2d/screen-adaptation.md](screen-adaptation.md) | 主题 |
| "UI 显示不出来？" | [troubleshooting/ui-not-visible.md](../troubleshooting/ui-not-visible.md) | 排错 |
| "长列表卡顿怎么优化？" | [ui-2d/list-virtualization.md](list-virtualization.md) | 主题 |
| "UI DrawCall 为什么高？" | [ui-2d/draw-call-batching.md](draw-call-batching.md) | 主题 |
| "ScrollView 滚不动" | [ui-2d/scroll-view.md](scroll-view.md) → 内容节点尺寸 | 主题 |
| "如何动态加载 UI 资源？" | [recipes/load-resource-dynamically.md](../recipes/load-resource-dynamically.md) | 任务 |
| "Label 与 RichText 选哪个？" | [ui-2d/label.md](label.md) + [ui-2d/rich-text.md](rich-text.md) | 主题 |
| "Layout 怎么用？" | [ui-2d/layout.md](layout.md) | 主题 |

## update 中刷新 UI 的风险

**不要在 `update()` 中每帧修改 UI 属性。** 常见反模式：

```ts
// 反例：每帧修改文本/颜色会导致频繁的渲染状态重建
update(dt: number) {
  this.label!.string = `Frame: ${this.frameCount++}`;
  this.node.setPosition(x, this.baseY + Math.sin(t) * 50);
}
```

- 原因：每帧修改 UI 属性会触发 UITransform 重新计算、渲染数据重新上传、合批状态重新判断。
- 推荐：使用事件驱动（回调）或 tween 动画系统处理 UI 变化，仅在变化发生时更新。

```ts
// 正例：使用 tween 做 UI 动画
import { tween } from 'cc';

playBounce() {
  tween(this.node)
    .to(0.3, { scale: new Vec3(1.2, 1.2, 1) })
    .to(0.2, { scale: new Vec3(1, 1, 1) })
    .start();
}
```

## 分类索引

### 修改显示内容
- 修改文本：→ [recipes/change-label-text.md](../recipes/change-label-text.md)
- 修改图片 SpriteFrame：→ [ui-2d/sprite.md](sprite.md)
- 修改颜色/透明度：→ [ui-2d/sprite.md](sprite.md)（节点 `color`/`opacity`）

### 布局与适配
- 屏幕适配配置：→ [recipes/screen-adaptation.md](../recipes/screen-adaptation.md)
- 自动布局：→ [ui-2d/layout.md](layout.md)
- Widget 对齐：→ [ui-2d/widget.md](widget.md)

### 交互
- 按钮点击：→ [recipes/button-click.md](../recipes/button-click.md)
- 点击无效排查：→ [troubleshooting/button-not-clickable.md](../troubleshooting/button-not-clickable.md)

### 性能优化
- 长列表卡顿：→ [ui-2d/list-virtualization.md](list-virtualization.md)
- DrawCall 优化：→ [ui-2d/draw-call-batching.md](draw-call-batching.md)

### 问题排查
- UI 不显示：→ [troubleshooting/ui-not-visible.md](../troubleshooting/ui-not-visible.md)
- 性能问题：→ [troubleshooting/performance-issues.md](../troubleshooting/performance-issues.md)

## 关联文档

- [修改文本步骤](../recipes/change-label-text.md)
- [按钮点击绑定](../recipes/button-click.md)
- [屏幕适配步骤](../recipes/screen-adaptation.md)
- [UI 不显示排查](../troubleshooting/ui-not-visible.md)
- [按钮点击无效排查](../troubleshooting/button-not-clickable.md)
- [性能问题排查](../troubleshooting/performance-issues.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程建议——UI 更新尽量在事件回调中，避免每帧 update()
