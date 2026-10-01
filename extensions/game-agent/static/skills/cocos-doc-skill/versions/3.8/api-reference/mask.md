---
id: cocos-3.8-api-reference-mask
version: "3.8"
category: api-reference
title: Mask
keywords:
  - Mask
  - 遮罩
  - 裁剪
  - 头像圆角
  - 圆形遮罩
  - 遮罩不生效
  - MaskComponent
related_docs:
  - api-reference/ui-transform.md
  - api-reference/sprite.md
related_api:
  - Mask
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Mask 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Mask

## 用途

Mask 组件用于将子节点限定在遮罩形状的可视区域之内。它通过设置裁剪区域（矩形、圆形或图片模板），使子节点的渲染仅在该区域内可见，常用于制作圆角头像、望远镜效果、遮罩动画等。

## 所属模块

```ts
import { Mask } from 'cc';
```

## 公开导出结论

- `Mask` 在 `cc` 模块以 `export class Mask extends Component` 公开导出，别称 `MaskComponent`。
- 公开属性：`type`、`alphaThreshold`、`inverted`、`spriteFrame` 等。
- 静态枚举：`Mask.Type`（RECT / ELLIPSE / IMAGE_STENCIL）。
- 遮罩形状基于节点 UITransform 的尺寸计算。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `type` | 遮罩类型（RECT / ELLIPSE / IMAGE_STENCIL） | 矩形裁切、圆形头像、图片模板 |
| `alphaThreshold` | 透明度阈值（IMAGE_STENCIL 时有效，0-1） | 按图片 alpha 通道裁剪 |
| `inverted` | 是否反转遮罩区域 | 挖空效果、望远镜周围变暗 |
| `spriteFrame` | 模板图片（IMAGE_STENCIL 时使用） | 异形遮罩 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|

Mask 没有需要手动调用的公开方法，核心逻辑通过组件属性配置。

## 高频代码

### 圆形头像遮罩

```ts
import { _decorator, Component, Mask, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MaskExample')
export class MaskExample extends Component {
  @property(Mask)
  mask: Mask | null = null;

  start() {
    if (!this.mask) return;

    // 设置为圆形遮罩
    this.mask.type = Mask.Type.ELLIPSE;

    // 确保 UITransform 有宽高（否则遮罩不生效）
    const uiTransform = this.mask.node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.setContentSize(100, 100);
    }
  }
}
```

### 图片模板遮罩

```ts
import { _decorator, Component, Mask, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ImageStencilMask')
export class ImageStencilMask extends Component {
  @property(Mask)
  mask: Mask | null = null;

  @property(SpriteFrame)
  stencilSprite: SpriteFrame | null = null;

  start() {
    if (!this.mask || !this.stencilSprite) return;

    this.mask.type = Mask.Type.IMAGE_STENCIL;
    this.mask.spriteFrame = this.stencilSprite;
  }
}
```

## 常见错误

1. **Mask 节点无 UITransform 尺寸**：遮罩节点必须存在 UITransform 且 `contentSize` 大于 0，否则遮罩区域为空，子节点完全不可见。
2. **子节点超出遮罩范围不显示**：遮罩裁剪是基于父子关系的，子节点被遮罩节点的裁剪区域限定，超出部分不可见。如需全屏遮罩，父节点需覆盖完整区域。
3. **IMAGE_STENCIL 未设置 spriteFrame**：使用 `IMAGE_STENCIL` 时必须提供有效的 `spriteFrame`，否则遮罩退化为透明区域。
4. **多级遮罩嵌套性能**：多个 Mask 组件嵌套会触发多次 Stencil 操作，对 Draw Call 有显著影响，应避免多层嵌套。
5. **Mask 与 RenderTexture 配合**：如果 Mask 内部有使用 RenderTexture 的节点，需要确认渲染顺序正确，否则可能出现遮罩失效。

## 关联任务

- [UITransform API 卡片](ui-transform.md)（遮罩依赖节点尺寸）
- [Sprite API 卡片](sprite.md)（遮罩模板图片资源）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Mask 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
