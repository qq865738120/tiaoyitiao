---
id: cocos-3.8-api-reference-sprite
version: "3.8"
category: api-reference
title: Sprite
keywords:
  - Sprite
  - 精灵
  - 图片
  - spriteFrame
  - 图片显示
related_docs:
  - api-reference/ui-transform.md
  - recipes/change-label-text.md
  - ui-2d/sprite.md
related_api:
  - Sprite
  - SpriteFrame
  - SpriteAtlas
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Sprite 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Sprite

## 用途

Sprite 组件用于在场景中显示 2D 图片。它通过 SpriteFrame 资源引用渲染图片，支持单图、图集、九宫格（SLICED）、平铺（TILED）、填充（FILLED）等多种渲染模式。

## 所属模块

```ts
import { Sprite } from 'cc';
```

## 公开导出结论

- `Sprite` 在 `cc` 模块以 `export class Sprite extends UIRenderer` 公开导出。
- 公开属性：`spriteFrame`、`spriteAtlas`、`type`、`fillType`、`fillCenter`、`fillStart`、`fillRange`、`trim`、`grayscale`、`sizeMode`。
- 继承自 UIRenderer 的属性：`color`（图片颜色叠加）。
- 静态枚举：`Sprite.Type`（SIMPLE/SLICED/TILED/FILLED/GRID）、`Sprite.SizeMode`（CUSTOM/RAW/TRIMMED）、`Sprite.FillType`（HORIZONTAL/VERTICAL/RADIAL）。
- `Sprite.EventType` 为私有内置事件类型，不对外公开推荐；具体监听节点触摸事件应使用 `Node.EventType`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `spriteFrame` | 精灵帧资源 | 更换图片 |
| `spriteAtlas` | 精灵图集 | 从图集中获取图片 |
| `type` | 渲染类型（SIMPLE/SLICED/TILED/FILLED/GRID） | 九宫格缩放 |
| `sizeMode` | 尺寸模式（CUSTOM/RAW/TRIMMED） | 控制图片显示尺寸 |
| `trim` | 是否裁剪透明区域 | 精确碰撞检测 |
| `grayscale` | 是否灰度渲染 | 置灰效果 |
| `color` | 颜色叠加（继承自 UIRenderer） | 改变图片颜色 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `changeSpriteFrameFromAtlas(name)` | 从图集中按名称切换 SpriteFrame | 图集 animation |

## 高频代码

### 修改 Sprite 图片

```ts
import { _decorator, Component, Sprite, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SpriteExample')
export class SpriteExample extends Component {
  @property(Sprite)
  iconSprite: Sprite | null = null;

  @property(SpriteFrame)
  newIcon: SpriteFrame | null = null;

  start() {
    if (this.iconSprite && this.newIcon) {
      // 更换 SpriteFrame
      this.iconSprite.spriteFrame = this.newIcon;
    }
  }
}
```

### 通过代码获取 Sprite 并修改

```ts
import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('DynamicSpriteExample')
export class DynamicSpriteExample extends Component {
  start() {
    const sprite = this.node.getComponent(Sprite);
    if (!sprite) return;

    // 动态加载图片资源
    resources.load('icon/weapon/sword/spriteFrame', SpriteFrame, (err, sf) => {
      if (err) return;
      sprite.spriteFrame = sf;
    });
  }
}
```

## 常见错误

1. **spriteFrame 为 null 未检查**：未设置时图片显示空白，`getComponent(Sprite).spriteFrame` 可能为 null。
2. **路径后缀混淆**：`resources.load` 加载 SpriteFrame 时路径末尾加 `/spriteFrame` 后缀（非 `.png`），引用资源的 `spriteFrame` 子资源。
3. **九宫格配置不生效**：`type = Sprite.Type.SLICED` 但 SpriteFrame 未设置九宫格边框值时表现与 SIMPLE 一致。
4. **频繁换图性能**：高频率更换 `spriteFrame` 可能导致 Draw Call 增加，推荐使用图集合并。

## 关联任务

- [修改 Label 文案](../recipes/change-label-text.md)（类似组件操作模式）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Sprite 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
