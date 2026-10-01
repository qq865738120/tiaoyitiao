---
id: cocos-3.8-assets-spine-dragonbones
version: "3.8"
category: assets
title: Spine / DragonBones 骨骼动画资产
keywords:
  - Spine
  - DragonBones
  - 龙骨
  - 骨骼动画
  - 第三方运行时
  - Skeleton
  - ArmatureDisplay
  - sp.Skeleton
  - dragonBones.ArmatureDisplay
  - .json
  - .skel
  - .atlas
  - 动画播放
  - 换装
related_docs:
  - api-reference/skeletal-animation.md
  - api-reference/animation.md
  - recipes/play-animation.md
  - troubleshooting/animation-not-playing.md
related_api:
  - SkeletalAnimation
  - sp.Skeleton
  - dragonBones.ArmatureDisplay
  - sp.SkeletonData
  - dragonBones.DragonBonesAsset
source:
  official: "Cocos Creator 3.8 官方文档 - 资源 - Spine / DragonBones"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：Spine/DragonBones 与引擎内置骨骼动画（SkeletalAnimation）在概念上容易混淆，需强调底层实现差异"
status: draft
updated: 2026-06-17
---

# Spine / DragonBones 骨骼动画资产

## 用途

说明 Spine 和 DragonBones 两类第三方骨骼动画资源在 Cocos Creator 中的导入方式、资产组成、组件挂载和基本使用流程。这两类资源与引擎内置的 SkeletalAnimation 组件无关，是独立于引擎的第三方运行时。

## 核心结论

- **Spine 和 DragonBones 是通过独立运行时导入的第三方骨骼动画方案**，各自有独立的渲染组件：`sp.Skeleton`（Spine）和 `dragonBones.ArmatureDisplay`（DragonBones）。
- **这两者与引擎内置的 `SkeletalAnimation` 组件完全无关**，底层渲染路径和运行时机制不同。
- 两者都属于 2D 渲染体系，必须在 Canvas 或 RenderRoot2D 的子节点下才能正常显示。
- 编辑器导入后生成的资源包括骨骼数据、纹理图集和 Atlas 索引，三者缺一不可。

## 关键组件/API

| 概念 | Spine | DragonBones |
|---|---|---|
| 组件 | `sp.Skeleton`（别名 `Skeleton`） | `dragonBones.ArmatureDisplay` |
| 骨骼数据资源 | `sp.SkeletonData`（.json/.skel） | `dragonBones.DragonBonesAsset`（.json/.dbbin） |
| 图集资源 | 内嵌在 .atlas 中 | `dragonBones.DragonBonesAtlasAsset`（.json） |
| 导入路径 | `sp` 模块 | `dragonBones` 模块 |
| 导入声明 | `import { sp } from 'cc'` | `import { dragonBones } from 'cc'` |

## 导入资源的组成

### Spine 导入资源文件清单

- `.json`（骨骼数据，文本格式）或 `.skel`（骨骼数据，二进制格式，体积更小）
- `.atlas`（图集索引数据）
- `.png`（图集纹理图片）
- 三者缺一不可，缺少任一文件导入后无法正常使用。

### DragonBones 导入资源文件清单

- `.json`（骨骼数据）或 `.dbbin`（骨骼数据，二进制格式）
- `.json`（图集数据，与骨骼数据同名不同目录或同目录下）
- `.png`（图集纹理图片）
- 同样三者缺一不可，且需分别绑定到 `DragonAsset` 和 `DragonAtlasAsset` 属性上。

## 常见任务

### 1. 创建 Spine 骨骼动画

1. 导入 Spine 资源（.json/.skel + .atlas + .png）。
2. 在层级管理器创建一个节点。
3. 添加组件：`添加组件 -> Spine -> Skeleton`。
4. 将导入的骨骼资源拖拽到 `SkeletonData` 属性上。

### 2. 创建 DragonBones 骨骼动画

1. 导入 DragonBones 资源（.json/.dbbin + .json 图集 + .png）。
2. 在层级管理器创建一个节点。
3. 添加组件：`添加组件 -> DragonBones -> ArmatureDisplay`。
4. 将骨骼数据拖拽到 `DragonAsset`，图集数据拖拽到 `DragonAtlasAsset`。

### 3. 通过代码播放动画

#### Spine 播放动画

```ts
import { _decorator, Component, sp } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SpineAnimPlay')
export class SpineAnimPlay extends Component {
  @property({ type: sp.Skeleton })
  skeleton: sp.Skeleton | null = null;

  start() {
    if (!this.skeleton) return;

    // 设置动画：trackIndex, 动画名称, 是否循环
    this.skeleton.setAnimation(0, 'walk', true);
  }

  playAttack() {
    if (!this.skeleton) return;

    // 在轨道 0 上添加攻击动画（与行走叠加）
    this.skeleton.setAnimation(0, 'attack', false);

    // 设置完成回调
    this.skeleton.setCompleteListener((trackEntry) => {
      console.log(`动画 ${trackEntry.animation.name} 播放完成`);
      this.skeleton.setAnimation(0, 'walk', true); // 切回行走
    });
  }
}
```

#### DragonBones 播放动画

```ts
import { _decorator, Component, dragonBones } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DragonBonesAnimPlay')
export class DragonBonesAnimPlay extends Component {
  @property({ type: dragonBones.ArmatureDisplay })
  armatureDisplay: dragonBones.ArmatureDisplay | null = null;

  start() {
    if (!this.armatureDisplay) return;

    // 播放动画：动画名称, 播放次数（0 无限循环）
    this.armatureDisplay.playAnimation('run', 0);
  }

  playAttack() {
    if (!this.armatureDisplay) return;

    // 播放攻击动画一次
    this.armatureDisplay.playAnimation('attack', 1);
  }
}
```

### 4. 缓存模式选择

两者都支持三种渲染模式（通过 `Animation Cache Mode` 属性设置）：
- **REALTIME**（默认）：实时运算，支持所有功能（融合、叠加、换装、顶点效果），性能最差。
- **SHARED_CACHE**：共享缓存模式，适合 N>=3 个相同的骨骼+相同动画的场景，较高性能但仅支持开始/结束事件。
- **PRIVATE_CACHE**：私有缓存模式，适合有换装需求的场景，不共享贴图，有性能优势但比 SHARED_CACHE 占用更多内存。

## 常见错误

1. **资源文件缺失**：Spine 需要 .json/.skel + .atlas + .png 三个文件且都正确导入；DragonBones 需要 骨骼数据 + 图集数据 + 图集纹理。缺少任一文件渲染不显示。
2. **组件挂载错误**：Spine 使用 `sp.Skeleton`，DragonBones 使用 `dragonBones.ArmatureDisplay`，不能互换或混用。
3. **层级显示问题**：两者都属于 2D 渲染组件，节点必须是 Canvas 或 RenderRoot2D 的子节点才能显示。
4. **版本兼容性**：Cocos Creator 3.8 支持 Spine 3.8 版本（原生平台不支持 v3.8.75），DragonBones 支持 v5.6.3 及以下。使用不兼容的版本可能导致崩溃或显示异常。
5. **与 SkeletalAnimation 混淆**：Spine/DragonBones 动画与引擎内置的骨骼动画（SkeletalAnimation）是两条不同的技术路线，前者通过第三方运行时渲染，后者使用引擎原生骨骼系统，API 和资产格式完全不同，无法互相替代。

## 关联文档

- [SkeletalAnimation API 卡片](../api-reference/skeletal-animation.md)（引擎内置 3D 骨骼动画，与 Spine/DragonBones 无直接关系）
- [Animation API 卡片](../api-reference/animation.md)
- [播放动画](../recipes/play-animation.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源 - Spine / DragonBones
- 官方：Cocos Creator 3.8 官方文档 - 编辑器组件 - Spine / DragonBones
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——Spine/DragonBones 与 SkeletalAnimation 的概念混淆是最常见的问题
