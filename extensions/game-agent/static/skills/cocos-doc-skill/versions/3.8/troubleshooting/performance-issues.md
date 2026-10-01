---
id: cocos-3.8-troubleshooting-performance-issues
version: "3.8"
category: troubleshooting
title: 游戏性能问题分诊
keywords:
  - 游戏卡顿
  - 掉帧
  - 性能问题
  - FPS 低
  - 内存泄漏
  - 性能优化
related_docs:
  - troubleshooting/build-errors.md
  - api-reference/node.md
  - api-reference/tween.md
related_api:
  - NodePool
  - director
  - Component.update
source:
  official: "Cocos Creator 3.8 官方文档 - 性能优化"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：update 高频逻辑、频繁创建销毁节点、资源不释放是最常见性能瓶颈"
    - "论坛经验：大型 3D 场景优化从 Profiler 热点定位、CPU/渲染/内存分层、节点层级、事件分发、临时对象复用、对象池、更新节流逐步排查。来源：forum.cocos.org（ev-413）"
status: draft
updated: 2026-06-18
---

# 游戏性能问题分诊

## 现象

游戏运行时出现卡顿、帧率（FPS）明显低于 30、掉帧、加载场景慢、内存占用持续增长直至闪退。

## 一级分诊路径

卡顿问题不要直接找优化方案，先按以下五个维度判断问题类别。

### 1. update 高频逻辑

**如何确认是这一类问题**：
- 在编辑器中开启 `Stats`（**开发者 -> Stats**），观察 FPS 在 `update` 中的行为是否引起掉帧。
- 在 `update(dt)` 方法中打印耗时：`console.time('update')` / `console.timeEnd('update')`，如果单帧超过 5ms 说明逻辑过重。
- 检查 `update` 中是否有每帧执行的 `find`、`getComponent`、`instantiate`、`resources.load` 等高频操作。

**应查看的专题方向**：
- 将 `update` 中的非必要逻辑移入 `schedule` 或 `scheduleOnce`。
- 使用缓存引用代替每帧 `getComponent`。
- 使用 `tween` 代替手动每帧修改属性。

### 2. 资源释放

**如何确认是这一类问题**：
- 内存持续增长，切换场景后内存不回落。
- 使用 `window.performance.memory`（Web 平台）或编辑器 Memory 检查器观察内存趋势。
- 旧场景的资源在切换后未被释放。

**应查看的专题方向**：
- 调用 `assetManager.releaseAsset` 释放不再使用的资源。
- 使用 `director.getScene().destroy()` 清理场景资源。
- 使用资源引用计数机制确认资源是否被不必要地持有。

### 3. UI 合批

**如何确认是这一类问题**：
- 开启编辑器中的 **渲染调试模式**，查看 Draw Call 数量是否过高（移动端建议不超过 100-200）。
- UI 节点之间频繁穿插 Sprite 和 Label，导致批次无法合并。
- 频繁修改 UI 节点层级（`zIndex`、`siblingIndex`）或颜色属性导致合批被打断。

**应查看的专题方向**：
- 合理组织 UI 节点层级，减少渲染批次打断。
- 使用 `cc.Sprite` 的相同 atlas（图集）减少材质切换。
- 使用 Canvas 的 `alignPixel` 减少子像素渲染问题。

### 4. 对象池

**如何确认是这一类问题**：
- 游戏中高频创建和销毁节点（如子弹、怪物、粒子），但没有使用对象池。
- 使用 `NodePool` 回收和复用节点，而不是每次都 `instantiate` + `destroy`。
- 观察是否触发频繁的 GC（卡顿表现为周期性停顿）。

**应查看的专题方向**：
- 使用 `NodePool` 管理可复用节点。
- 控制对象池大小，避免无限增长。
- 减少 `destroy` 调用，改为节点隐藏（`active = false`）后回收。

### 5. 频繁创建销毁节点

**如何确认是这一类问题**：
- 游戏运行时 Hierarchy 面板中的节点数量持续增加或频繁变化。
- 每帧执行 `instantiate` 或 `destroy` 操作（不仅是子弹等高频对象，也可能是 UI 刷新）。
- 编辑器 DevTools 的 Memory 面板中节点数量周期性大幅波动。

**应查看的专题方向**：
- 缓存节点实例，避免在 `update` 中动态创建和销毁。
- 对 UI 列表使用虚拟列表（只渲染可见部分）。
- 使用对象池（NodePool）管理高频复用的节点。

### 6. 大型 3D 场景系统性优化路径

当面临大型 3D 场景（数百个网格、复杂地形、大量动态物体）性能问题时，按以下顺序系统性定位热点：

| 排查维度 | 定位方法 | 常见优化方向 |
|---|---|---|
| CPU 脚本热点 | Creator Profiler `dispatch`/`update` 耗时、Chrome DevTools Performance 火焰图 | update 缓存、schedule 降频、避免高频 getComponent/find |
| 渲染开销 | Creator Profiler DrawCall / 三角面数 | LOD、遮挡剔除、合批、GPU Instancing |
| 内存压力 | Creator Profiler Memory 面板、堆快照 | 纹理压缩、资源释放、对象池限制容量 |
| 资源加载 | 场景切换耗时、Asset Bundle 加载时机 | 分帧加载、预加载、Bundle 分包 |
| 节点层级过深 | updateWorldTransform 耗时、节点树遍历次数 | 合并层级、减少不可见 active 节点 |
| 事件监听过多 | 高频回调（touch/mouse/update）节流 | throttle/debounce、合并同类监听 |

参考文档：[大型 3D 场景优化](../recipes/optimize-large-3d-scene.md)、[Profiler 工作流](../concepts/profiler-workflow.md)、[帧率低排查](frame-rate-low.md)。

## 仍未解决时

- 使用浏览器 Profiler（Chrome DevTools Performance）录制帧数据，分析 CPU 热点。
- **原生平台**：使用 Creator Profiler（编辑器 `开发者 -> 打开 Profiler`）— 此功能当前仅限原生平台。查看 CoreStats、ObjectStats、MemoryStats 等统计项。
- **Web 平台**：使用 Chrome DevTools Performance 录制帧火焰图，分析 JavaScript 堆栈耗时、GC 停顿。
- **发布包测试**：在编辑器或开启 Profiler 下测得的帧率不代表最终发布性能。应始终在发布包上做基准测试。
- 检查是否有过多粒子系统或高性能消耗的 Shader。
- 查看 Cocos Creator 3.8 官方性能优化文档中关于渲染优化、内存优化和代码优化的具体方案。

## 相关文档

- [构建失败分诊](../troubleshooting/build-errors.md)
- [节点 API 卡片](../api-reference/node.md)
- [Tween API 卡片](../api-reference/tween.md)
- [大型 3D 场景优化](../recipes/optimize-large-3d-scene.md)
- [Profiler 工作流](../concepts/profiler-workflow.md)
- [帧率低排查](frame-rate-low.md)
