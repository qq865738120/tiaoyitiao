---
id: cocos-3.8-api-reference-particle-system
version: "3.8"
category: api-reference
title: ParticleSystem（3D 粒子系统）
keywords:
  - ParticleSystem
  - 粒子系统
  - 3D粒子
  - 粒子特效
  - 粒子播放
  - 粒子循环
  - 粒子性能
related_docs:
  - api-reference/particle-system-2d.md
related_api:
  - ParticleSystem
  - ParticleSystem2D
  - ModelRenderer
source:
  official: "Cocos Creator 3.8 官方文档 - 粒子系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# ParticleSystem（3D 粒子系统）

## 用途

ParticleSystem 是 Cocos Creator 3D 粒子系统组件，用于创建和渲染 3D 空间中的粒子特效，如火焰、烟雾、水花、爆炸、魔法效果等。它基于 GPU/CPU 混合架构，支持丰富的粒子生命周期控制。

## 所属模块

```ts
import { ParticleSystem, ParticleSystemComponent } from 'cc';
```

## 公开导出结论

- `ParticleSystem` 在 `cc` 模块以 `export class ParticleSystem extends ModelRenderer` 公开导出。
- 别名 `ParticleSystemComponent` 指向同一类型。
- 粒子系统包含多个模块：MainModule（主模块）、ShapeModule（发射器）、Renderer（渲染器）、ColorModule（颜色）、SizeModule（大小）、VelocityModule（速度）等，通过粒子系统属性的模块对象访问。
- 所有粒子模块均为粒子系统组件的嵌套属性，不是独立组件。
- 粒子系统依赖 `Material` 粒子材质和粒子预设资源。
- 关键方法：`play()`、`stop()`、`pause()`、`clear()`、`getParticleCount()`。
- 关键属性：`duration`、循环播放、`prewarm`、`playOnAwake`、`emissionRate`、`rateOverTime`、`capacity`、`useGPU`、`particleCount`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `playOnAwake` | 是否在组件启动时自动播放粒子 | 自动播放特效 |
| `looping` | 是否循环播放 | 持续性特效（火焰、烟雾） |
| `duration` | 粒子系统单次持续时间（秒） | 控制爆炸等一次性特效时长 |
| `prewarm` | 是否预预热（仅在 looping 时有效） | 让循环粒子一开始就是满状态 |
| `emissionRate` / `rateOverTime` | 每秒/单位时间发射的粒子数量 | 控制粒子密度 |
| `capacity` | 粒子最大容量 | 控制粒子总数上限 |
| `useGPU` | 是否使用 GPU 渲染器 | 优化大量粒子性能 |
| `particleCount` | 当前存活粒子数量（只读） | 调试时查看粒子数 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `play()` | 开始播放粒子系统 | 播放特效 |
| `stop()` | 停止播放，剩余粒子继续运行到生命周期结束 | 停止发射新粒子 |
| `pause()` | 暂停所有粒子的运动和生命周期 | 暂停特效 |
| `clear()` | 立即清除所有粒子并停止 | 重启粒子前清理 |
| `getParticleCount()` | 获取当前活跃粒子数量 | 性能监控 |

## 高频代码

### 播放和停止粒子

```ts
import { _decorator, Component, ParticleSystem } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ParticleExample')
export class ParticleExample extends Component {
  @property(ParticleSystem)
  explosionParticle: ParticleSystem | null = null;

  playExplosion() {
    if (!this.explosionParticle) return;

    // 先清理可能残留的粒子再播放
    this.explosionParticle.clear();
    this.explosionParticle.play();
  }

  stopEffect() {
    if (!this.explosionParticle) return;
    this.explosionParticle.stop();
  }
}
```

### 运行时获取并控制粒子

```ts
import { _decorator, Component, ParticleSystem } from 'cc';

const { ccclass } = _decorator;

@ccclass('DynamicParticleControl')
export class DynamicParticleControl extends Component {
  start() {
    const ps = this.getComponent(ParticleSystem);
    if (!ps) return;

    // 自动播放（playOnAwake = true 时 start 中不需要再调用 play）
    // 监听粒子播放结束（非循环时有效）
  }

  restartIfFinished() {
    const ps = this.getComponent(ParticleSystem);
    if (!ps) return;

    // 非循环模式下判断是否播放完毕
    if (!ps.looping && !ps.playOnAwake) {
      ps.play();
    }
  }
}
```

### 通过代码创建粒子节点

```ts
import { _decorator, Component, Node, ParticleSystem, instantiate, Prefab, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('SpawnParticle')
export class SpawnParticle extends Component {
  spawnEffect() {
    resources.load('effects/explosion', Prefab, (err, prefab) => {
      if (err || !prefab) return;

      const effectNode = instantiate(prefab);
      effectNode.setParent(this.node);
      effectNode.setPosition(0, 0, 0);

      // 可选：自动移除
      const ps = effectNode.getComponent(ParticleSystem);
      if (ps) {
        if (!ps.playOnAwake) ps.play();
      }
    });
  }
}
```

## 常见错误

1. **粒子不播放**：
   - `getComponent(ParticleSystem)` 返回 null，必须判空。
   - `playOnAwake = false` 但未在代码中调用 `play()`。
   - `playOnAwake = true` 但组件的 `enabled = false`，不会自动播放。
   - 粒子材质（ParticleMaterial）未设置或使用错误的 effect（CPU 粒子需 `builtin-particle`，GPU 粒子需 `builtin-particle-gpu`）。

2. **粒子看不见**：
   - 节点不在相机视野内，或节点的 Layer 与相机 Layer 不匹配。
   - 粒子的 `capacity` 为 0 或发射率（emissionRate）过低。
   - 粒子大小（StartSize）设置过小。
   - 使用了 GPU 模式但 GPU 不支持相关特性，降级失败。

3. **平台性能差**：
   - CPU 粒子数量过多（超过几百个就需要考虑 GPU 模式）。
   - 使用了过多的粒子材质切换导致 DrawCall 上涨。
   - 3D 粒子会走 3D 渲染管线，大量粒子对移动端 GPU 压力大，建议控制 `capacity` 和 `emissionRate`。
   - 透明排序：多层次的粒子堆叠会导致 overdraw 问题，需要控制粒子层次。

4. **粒子系统重复播放未清理**：
   - 在 `start()` 中调用 `play()` 且 `playOnAwake = true` 会导致重复播放，建议二选一。
   - 启用 `prewarm` 而未设置 `looping` 时不会预热。

5. **自定义材质命名不对**：
   - CPU 粒子材质名称必须包含 `particle-cpu`（如 `my-particle-cpu`）。
   - GPU 粒子材质名称必须包含 `particle-gpu`（如 `custom-particle-gpu`）。

## 关联任务

- [2D 粒子系统 API 卡片](particle-system-2d.md)（与 3D 粒子对比）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 粒子系统 - 3D 粒子
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
