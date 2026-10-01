---
id: cocos-3.8-api-reference-particle-system-2d
version: "3.8"
category: api-reference
title: ParticleSystem2D（2D 粒子系统）
keywords:
  - ParticleSystem2D
  - 2D粒子
  - 粒子特效
  - 粒子播放
  - Plist粒子
  - 粒子循环
related_docs:
  - api-reference/particle-system.md
  - api-reference/sprite.md
  - api-reference/ui-transform.md
related_api:
  - ParticleSystem2D
  - ParticleSystem
  - UIRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - 粒子系统 - 2D 粒子"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# ParticleSystem2D（2D 粒子系统）

## 用途

ParticleSystem2D 组件用于在 2D 空间中创建和渲染粒子特效，支持通过 `.plist` 格式的粒子配置文件加载粒子的各项属性，适用于 UI 特效、2D 爆炸、雪花、星光等场景。

## 所属模块

```ts
import { ParticleSystem2D } from 'cc';
```

## 公开导出结论

- `ParticleSystem2D` 在 `cc` 模块以 `export class ParticleSystem2D extends UIRenderer` 公开导出。
- 继承自 `UIRenderer`，因此属于 2D UI 渲染体系，必须挂载在 Canvas 或 RenderRoot2D 下才能正常显示。
- 粒子数据来源为 `.plist` 文件（ParticleDesigner/Starling 格式），通过 file 属性引用。
- 关键方法：`play()`、`stop()`、`pause()`、`resetSystem()`、`getParticleCount()`。
- 关键属性：`playOnLoad`（启动自动播放）、`autoRemoveOnFinish`（播放完自动销毁节点）、`duration`（持续时间，-1 表示持续发射 `）、`emissionRate`（发射率）、`totalParticles`（最大粒子数）、`life`（粒子生命周期）、`file`（plist 文件引用）、`spriteFrame`（自定义粒子贴图）。
- 支持两种发射模式：`GRAVITY`（重力模式）和 `RADIUS`（径向模式），通过 `emitterMode` 设置。
- 独立于 3D 粒子系统（ParticleSystem），两者无继承关系，底层渲染体系不同。

## 与 ParticleSystem（3D）的区别

| 对比项 | ParticleSystem2D | ParticleSystem |
|---|---|---|
| 继承体系 | UIRenderer（2D UI 体系） | ModelRenderer（3D Mesh 体系） |
| 数据来源 | `.plist` 配置文件 | ParticleEffectAsset + Material |
| 渲染层级 | 2D 渲染顺序（UI 层） | 3D 渲染管线（透明排序） |
| Canvas 依赖 | 必须是 Canvas 或 RenderRoot2D 的子节点 | 无需 Canvas，受相机控制 |
| 适用场景 | UI 特效、2D 游戏 | 3D 场景特效 |
| 模块化 | 单组件内置参数 | 多模块系统（MainModule/ShapeModule/Renderer 等） |
| 性能特点 | 更适合少量 2D 特效 | 支持 GPU 烘焙，适合大量 3D 粒子 |

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `playOnLoad` | 是否在组件加载时自动播放粒子 | 进入场景自动出现 |
| `autoRemoveOnFinish` | 粒子播放完毕后是否自动销毁节点 | 一次性特效自动回收 |
| `file` | 引用的 `.plist` 粒子配置文件 | 加载预设粒子参数 |
| `spriteFrame` | 粒子的纹理贴图 | 更换粒子外观 |
| `duration` | 粒子系统持续时间（-1 为持续发射） | 控制特效时长 |
| `emissionRate` | 每秒发射粒子数量 | 调整粒子密度 |
| `totalParticles` | 粒子最大数量上限 | 控制性能消耗 |
| `life` | 粒子生存时间 | 控制粒子飞行距离 |
| `emitterMode` | 发射器模式（GRAVITY / RADIUS） | 切换粒子运动类型 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `play()` | 开始播放粒子 | 手动触发播放 |
| `stop()` | 停止发射新粒子，已有粒子继续运行 | 停止发射但让残影消退 |
| `pause()` | 暂停所有粒子运动 | 暂停特效 |
| `resetSystem()` | 重置整个粒子系统（清除所有粒子并重新开始） | 重新播放 |
| `getParticleCount()` | 获取当前活跃粒子数量 | 性能监控 |

## 高频代码

### 播放和停止 2D 粒子

```ts
import { _decorator, Component, ParticleSystem2D } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Particle2DExample')
export class Particle2DExample extends Component {
  @property(ParticleSystem2D)
  particleEffect: ParticleSystem2D | null = null;

  start() {
    // 确保未自动播放时手动调用
    if (this.particleEffect && !this.particleEffect.playOnLoad) {
      this.particleEffect.play();
    }
  }

  stopEffect() {
    if (!this.particleEffect) return;
    this.particleEffect.stop();
  }
}
```

### 运行时获取组件控制粒子

```ts
import { _decorator, Component, ParticleSystem2D } from 'cc';

const { ccclass } = _decorator;

@ccclass('UIParticleControl')
export class UIParticleControl extends Component {
  start() {
    const ps2d = this.node.getComponent(ParticleSystem2D);
    if (!ps2d) return;

    // 自动播放已开启，无需额外操作
    // 通过 emissionRate 实时调节粒子密度
    ps2d.emissionRate = 50;
  }

  resetParticle() {
    const ps2d = this.node.getComponent(ParticleSystem2D);
    if (!ps2d) return;

    // 完全重置粒子系统（清空并重新播放）
    ps2d.resetSystem();
  }
}
```

### 一次性特效自动销毁

```ts
import { _decorator, Component, ParticleSystem2D } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('OneShotParticle')
export class OneShotParticle extends Component {
  @property(ParticleSystem2D)
  burstParticle: ParticleSystem2D | null = null;

  fire() {
    if (!this.burstParticle) return;

    // 设置一次性爆炸参数
    this.burstParticle.duration = 0.5; // 0.5 秒持续发射
    this.burstParticle.autoRemoveOnFinish = true; // 播放完自动销毁
    this.burstParticle.resetSystem();
  }
}
```

## 常见错误

1. **粒子不播放**：
   - `getComponent(ParticleSystem2D)` 返回 null，必须判空。
   - `playOnLoad = false` 且未在代码中调用 `play()` 或 `resetSystem()`。
   - `.plist` 文件路径未正确设置到 `File` 属性中。
   - `duration = -1`（持续发射）时，不会自动结束，初次调用 play 后才开始。

2. **粒子看不见**：
   - 节点必须是 Canvas 或 RenderRoot2D 的子节点（因为是 2D 渲染组件）。
   - 粒子的 `totalParticles` 或 `emissionRate` 太低，看不到效果。
   - 粒子大小（StartSize）为 0 或过小。
   - 粒子的 alpha 值（颜色）为 0，完全透明。
   - 节点位置超出屏幕范围，或锚点设置导致偏移。

3. **渲染层级不对**：
   - ParticleSystem2D 继承自 UIRenderer，渲染顺序由节点在 Canvas 下的层级和 `priority` 决定。
   - 在 3D 粒子（ParticleSystem）和 2D 粒子（ParticleSystem2D）混用时，两者的渲染管线不同，层级可能错乱。

4. **plist 资源加载失败**：
   - `.plist` 文件必须和对应的纹理图片放在同一目录，一起导入。
   - 不支持依赖远程加载 plist 和图片的常见组合，建议使用编辑器拖拽。

5. **性能注意**：
   - 2D 粒子数量过多（超过几百个）会影响帧率，控制 `totalParticles`。
   - 频繁创建和销毁带粒子的节点不如复用。

## 关联任务

- [3D 粒子系统 API 卡片](particle-system.md)（了解两者区别）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 粒子系统 - 2D 粒子
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
