---
id: cocos-3.8-troubleshooting-memory-leak
version: "3.8"
category: troubleshooting
title: 内存泄漏排查 — 内存持续增长的有序检查路径
keywords:
  - 内存泄漏
  - 内存上涨
  - 内存不释放
  - 资源未释放
  - 内存占用高
  - 内存溢出
  - 闪退
related_docs:
  - troubleshooting/performance-issues.md
  - concepts/profiler-workflow.md
  - recipes/release-resource.md
  - recipes/use-node-pool.md
  - scripting/scheduler-timer.md
  - api-reference/director.md
  - assets/release.md
related_api:
  - assetManager
  - director
  - NodePool
  - resources
  - EventTarget
  - schedule
  - tween
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 资源释放"
  verified-against: []
  supplement:
    - "工程经验：内存泄漏最常见的原因是场景切换后旧场景资源和事件监听未被清理"
status: draft
updated: 2026-06-18
---

# 内存泄漏排查 — 内存持续增长的有序检查路径

## 现象

游戏运行时内存占用持续增长，切换场景后内存不回落，最终触发系统 OOM 或被操作系统强制关闭（闪退）。在 Creator Profiler Memory 面板或浏览器 DevTools Memory 面板中可观察到只涨不降的趋势。

## 最可能原因

按从高频到低频、从简单到复杂的顺序排查：

1. **资源引用未释放**：`resources.load` 动态加载的资源没有在不需要时调用 `assetManager.releaseAsset` 或 `resources.release` 释放。切换场景后旧场景的纹理、材质、SpriteFrame 等资源仍被引用计数保留。
2. **事件监听、schedule、tween 未清理**：组件销毁时，如果手动 `node.on` 监听的事件、`schedule` 定时任务或 `tween` 动画未在 `onDestroy` 中清理，回调会持续持有对已销毁组件的引用，导致对象无法被 GC。
3. **对象池只进不出**：`NodePool` 的对象回收量远大于实际复用需求量，导致对象池中堆积了大量未被使用的节点。或者对象池本身被一个长期存活的节点持有，池中对象无法释放。
4. **临时对象和数组持续增长**：在 `update` 或高频回调中不断创建新数组、对象（如 `Vec3`、`Color`），或将数据不断 `push` 到未限长的数组，导致 V8 堆不断扩张。
5. **场景切换后旧节点仍被引用**：旧场景的节点或组件被跨场景的全局变量、单例或 `EventTarget` 长期引用，导致引擎在场景切换时无法自动销毁整棵节点树。

## 快速检查

- [ ] 打开 Creator Profiler（`开发者 -> 打开 Profiler`），切换到 `Memory` 面板，观察场景切换前后内存是否明显回落。如果不回落，说明有资源或对象未被释放。
- [ ] 在 Chrome DevTools Memory（Web 发布版）中录制堆快照（Heap Snapshot），对比切换前后的对象保留情况。查找 Detached DOM 节点和未被释放的 cc 对象。
- [ ] 检查 `resources.load` 和 `assetManager` 相关代码，确认加载的资源是否在不需要时调用了 `release`。
- [ ] 检查每个组件 `onDestroy` 中是否做了 `node.off`、`this.unscheduleAllCallbacks`、`tween(this.node).destroy()` 等清理工作。
- [ ] 检查全局变量、单例或常驻场景（`director.addPersistRootNode`）是否引用了临时场景的节点或组件。
- [ ] 检查 `update` 或高频回调中是否有未限制大小的数组 `push` 操作。

## 解决方案

### 1. 释放不需要的资源

```ts
import { _decorator, Component, resources, assetManager, SpriteFrame } from 'cc';

const { ccclass } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {
  // 动态加载后，不再需要时释放
  loadAndReleaseExample() {
    resources.load('icons/icon-a/spriteFrame', SpriteFrame, (err, spriteFrame) => {
      if (err) return;
      // 使用 spriteFrame ...
      // 不需要时释放
      assetManager.releaseAsset(spriteFrame);
    });
  }
}
```

### 2. 清理事件和定时器

```ts
import { _decorator, Component, Node, tween } from 'cc';

const { ccclass } = _decorator;

@ccclass('MyCleanComponent')
export class MyCleanComponent extends Component {
  private _tweenObj: any = null;

  onLoad() {
    // 事件监听
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    // 定时器
    this.schedule(this.myTimer, 1);
    // Tween
    this._tweenObj = tween(this.node).by(1, { position: { x: 100 } }).repeatForever().start();
  }

  onDestroy() {
    // 清理事件
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    // 清理 schedule
    this.unscheduleAllCallbacks();
    // 清理 tween
    if (this._tweenObj) {
      this._tweenObj.destroy();
      this._tweenObj = null;
    }
  }

  private onTouchEnd() { /* ... */ }
  private myTimer() { /* ... */ }
}
```

### 3. 控制对象池大小

```ts
import { _decorator, Component, NodePool, instantiate, Prefab } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null;

  private _pool: NodePool = new NodePool();
  private readonly MAX_POOL_SIZE = 50;

  spawnBullet(): any {
    let bullet = this._pool.get();
    if (!bullet) {
      bullet = instantiate(this.bulletPrefab!);
    }
    return bullet;
  }

  despawnBullet(bullet: any) {
    if (this._pool.size() >= this.MAX_POOL_SIZE) {
      // 超出上限则直接销毁
      bullet.destroy();
    } else {
      this._pool.put(bullet);
    }
  }
}
```

### 4. 避免临时对象累积

- 在 `update` 中复用临时变量，而不是每次创建新的 `Vec3`、`Color`、`Mat4`。
- 对持续增长的数组设置上限，或改用固定长度的环形缓冲区。
- 高频数据传递使用对象池复用对象。

### 5. 跨场景引用的清理

- `director.addPersistRootNode` 注册的常驻节点不要引用非驻留场景的节点。
- 全局单例或工具类持有临时节点的引用时，在场景切换时手动置 `null`。
- 使用 `director.getScene().destroy()` 确保旧场景执行销毁流程。

## 仍未解决时

- 在 Chrome DevTools Performance 中录制内存分配时间线（Allocation instrumentation timeline），查看哪些函数分配了最多内存。
- 原生平台使用 Android Studio Memory Profiler / Xcode Memory Diagnostics 查看系统级内存跟踪。
- 对照官方资源系统文档逐段检查释放路径，考虑是否需要使用 `AssetBundle` 的按需加载和释放。

## 相关文档

- [Profiler 工作流](../concepts/profiler-workflow.md)
- [释放资源](../recipes/release-resource.md)
- [使用对象池](../recipes/use-node-pool.md)
- [调度器与定时器](../scripting/scheduler-timer.md)
- [资源释放](../assets/release.md)
- [性能问题分诊](../troubleshooting/performance-issues.md)
