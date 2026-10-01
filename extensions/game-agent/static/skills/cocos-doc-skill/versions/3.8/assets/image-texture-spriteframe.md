---
id: cocos-3.8-assets-image-texture-spriteframe
version: "3.8"
category: assets
title: 图片、纹理与 SpriteFrame
keywords:
  - 图片
  - 纹理
  - Texture2D
  - SpriteFrame
  - ImageAsset
  - 精灵帧
  - 动态换图
  - 设置图片
  - spriteFrame
  - 子资源
related_docs:
  - assets/asset-workflow.md
  - assets/dynamic-loading.md
  - assets/resources-folder.md
  - assets/prefab.md
  - api-reference/sprite.md
  - recipes/load-resource-dynamically.md
related_api:
  - SpriteFrame
  - Texture2D
  - ImageAsset
  - Sprite
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 图像资源 / SpriteFrame"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：子资源路径 /spriteFrame 和 /texture 的选择是高频困惑点"
status: draft
updated: 2026-06-17
---

# 图片、纹理与 SpriteFrame

## 用途

说明 Cocos Creator 中图片资源的内部结构（ImageAsset → Texture2D / SpriteFrame）、如何在脚本中引用和动态加载图片，以及三种子资源的区别与选择。

## 核心结论

- **一个图片文件生成三个子资源**：`ImageAsset`（源数据）、`Texture2D`（贴图）、`SpriteFrame`（精灵帧，含裁剪和九宫格信息）。
- **2D/UI 渲染用 SpriteFrame**：这是最常用的入口，直接赋值给 `Sprite.spriteFrame`。
- **3D 材质用 Texture2D**：材质中的贴图属性需要 Texture2D。
- **加载子资源时路径要加后缀**：`'images/icon/spriteFrame'` 加载的是 SpriteFrame，`'images/icon/texture'` 加载的是 Texture2D。

## 什么时候使用

- 需要在脚本中动态更换 Sprite 显示的图片。
- 需要区分 ImageAsset、Texture2D、SpriteFrame 三种子资源的使用场景。
- 需要了解图片导入设置（Type: texture / sprite-frame）的影响。

## 图片资源的内部结构

```text
assets/resources/images/
└─ icon.png                  ← 原始图片文件
   ├─ ImageAsset             ← icon 本身（源数据，通常不直接使用）
   ├─ SpriteFrame            ← icon/spriteFrame（含裁剪、九宫格，2D/UI 使用）
   └─ Texture2D              ← icon/texture（原始像素数据，3D 使用）
```

图片导入后，**属性检查器的 Type 属性**决定默认生成的子资源类型：

| Type 设置 | 作用 | 生成子资源 |
|---|---|---|
| **texture**（默认） | 通用贴图，可被材质使用 | ImageAsset + Texture2D |
| **sprite-frame** | 2D 精灵帧，含裁剪/九宫格信息 | ImageAsset + Texture2D + SpriteFrame |
| **normal map** | 法线贴图，用于 3D | ImageAsset + Texture2D |
| **raw** | 原始图片，不做处理 | ImageAsset |

## 关键 API / 组件

| API / 组件 | 作用 | 常用入口 |
|---|---|---|
| `Sprite` | 2D/UI 精灵渲染组件 | `sprite.spriteFrame = sf` |
| `SpriteFrame` | 精灵帧资源，管理裁剪和九宫格信息 | `resources.load('.../spriteFrame', SpriteFrame, ...)` |
| `Texture2D` | 2D 贴图资源 | `resources.load('.../texture', Texture2D, ...)` |
| `ImageAsset` | 图像源资源，可从中创建 SpriteFrame | `SpriteFrame.createWithImage(imageAsset)` |

## 最小示例

### 动态换图（设置 SpriteFrame）

```ts
import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ChangeImageDemo')
export class ChangeImageDemo extends Component {
  @property(Sprite)
  targetSprite: Sprite | null = null;

  // 换为 resources/images/avatar.png 的精灵帧
  changeImage() {
    if (!this.targetSprite) return;

    resources.load('images/avatar/spriteFrame', SpriteFrame, (err, sf) => {
      if (err || !sf) {
        console.error('图片加载失败:', err);
        return;
      }
      this.targetSprite!.spriteFrame = sf;
    });
  }
}
```

### 从 ImageAsset 手动创建 SpriteFrame

```ts
import { _decorator, Component, Sprite, SpriteFrame, ImageAsset, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CreateSFFromImage')
export class CreateSFFromImage extends Component {
  @property(Sprite)
  targetSprite: Sprite | null = null;

  start() {
    // 加载 ImageAsset（而非 SpriteFrame）
    resources.load('images/avatar', ImageAsset, (err, imageAsset) => {
      if (err || !imageAsset) return;

      // 手动创建 SpriteFrame
      const sf = SpriteFrame.createWithImage(imageAsset);

      if (this.targetSprite) {
        this.targetSprite.spriteFrame = sf;
      }
    });
  }
}
```

### 图集（SpriteAtlas）中获取 SpriteFrame

```ts
import { _decorator, Component, Sprite, SpriteAtlas, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AtlasDemo')
export class AtlasDemo extends Component {
  @property(Sprite)
  targetSprite: Sprite | null = null;

  start() {
    // 加载图集
    resources.load('images/ui-atlas', SpriteAtlas, (err, atlas) => {
      if (err || !atlas) return;

      // 从图集中按名称获取指定帧
      const frame = atlas.getSpriteFrame('btn_normal');
      if (this.targetSprite && frame) {
        this.targetSprite.spriteFrame = frame;
      }
    });
  }
}
```

## 常见错误

1. **直接加载图片路径不指定子资源**：`resources.load('images/icon', ...)` 加载到的是 `ImageAsset`，不是 `SpriteFrame`。如果要用于 Sprite，路径应为 `'images/icon/spriteFrame'`。
2. **加载 SpriteFrame 未指定类型**：`resources.load('images/icon/spriteFrame', (err, asset) => ...)` 返回类型为 Asset，应加上类型参数 `SpriteFrame`。
3. **图集加载后直接赋值**：图集（SpriteAtlas）不能直接赋值给 `sprite.spriteFrame`，需通过 `atlas.getSpriteFrame('frameName')` 获取具体帧。
4. **Type 设置不影响已有加载代码**：在编辑器中修改图片的 Type（如从 texture 改为 sprite-frame）后，已生成的子资源路径不变，但之前可能没有 spriteFrame 子资源。

## 关联文档

- [动态加载资源](./dynamic-loading.md)
- [resources 目录使用指南](./resources-folder.md)
- [Sprite API 卡片](../api-reference/sprite.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 图像资源 / SpriteFrame
- 已交叉验证：cc-engine 3.8 公开类型声明（`SpriteFrame extends Asset`、`ImageAsset extends Asset`）
- 补充：工程经验——子资源路径选择和图集加载是最常见的图片相关问题
