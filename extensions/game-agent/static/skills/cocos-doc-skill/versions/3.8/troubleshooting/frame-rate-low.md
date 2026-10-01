---
id: cocos-3.8-troubleshooting-frame-rate-low
version: "3.8"
category: troubleshooting
title: 帧率低排查 — FPS 不达标时的有序检查路径
keywords:
  - 掉帧
  - 帧率低
  - FPS 低
  - 卡顿
  - 游戏卡
  - 不流畅
  - 性能低
related_docs:
  - troubleshooting/performance-issues.md
  - concepts/profiler-workflow.md
  - recipes/reduce-draw-calls.md
  - recipes/optimize-update-loop.md
  - ui-2d/draw-call-batching.md
related_api:
  - profiler
  - Component.update
  - SpriteAtlas
  - Material
source:
  official: "Cocos Creator 3.8 官方文档 - 场景性能优化 - 渲染性能"
  verified-against: []
  supplement:
    - "工程经验：大多数帧率问题可以被 Profiler 的分流逻辑定位，无需全量排查"
status: draft
updated: 2026-06-18
---

# 帧率低排查 — FPS 不达标时的有序检查路径

## 现象

游戏运行时帧率明显低于目标（例如 60 FPS 目标但只有 20-30 FPS），或出现间歇性卡顿、掉帧。

## 最可能原因

帧率低的原因按检查成本从低到高排列如下：

1. **在编辑器或开启 Profiler 下测试**：编辑器环境和 Profiler 面板本身有额外开销，会导致帧率偏低。应先跑发布包或预览模式做基线测试。
2. **脚本 update 热点**：`update` 中每帧执行 find、getComponent、instantiate、resources.load 等高开销操作，或存在耗时循环/大量数学运算。参考 `recipes/optimize-update-loop.md`。
3. **DrawCall / 合批被打断**：UI 节点使用不同图集、材质、组件类型交错排列，导致 DrawCall 数量过高。参考 `recipes/reduce-draw-calls.md` 和 `ui-2d/draw-call-batching.md`。
4. **节点数量和层级过深**：数百个节点即使不渲染也有遍历开销。层级过深导致变换矩阵计算累积。
5. **粒子、材质、Shader、平台性能**：粒子系统数量过多、材质 Shader 复杂度高、纹理过大导致带宽压力；特定平台（低端 Android / 微信小游戏）的计算和纹理限制更严格。

## 快速检查

- [ ] 先在发布包或预览模式下测试，确认不是在编辑器或 Profiler 开启下的假低帧。
- [ ] 打开 Creator Profiler（`开发者 -> 打开 Profiler`），查看 `dispatch` 或 `update` 耗时：如果脚本耗时占比最高，走脚本优化方向。
- [ ] 查看 Profiler 中的 DrawCall 数量：如果明显偏高（移动端 > 150），走 DrawCall 优化方向。
- [ ] 在 Chrome DevTools Performance（Web 发布）中录制一段帧，确认是否有 GC 停顿或单帧过长函数。
- [ ] 检查场景中是否堆叠了大量节点（尤其是不可见但 active 的节点）。
- [ ] 检查是否开启了大量粒子系统，或使用了高复杂度的材质/Shader。
- [ ] 在目标设备上（尤其是低端 Android 或小游戏平台）单独测试。

## 解决方案

### 1. 确认基线环境

- 在编辑器中关掉 Profiler 面板和 Stats 面板再测一次。
- 使用 `构建发布` 打一个 Web 或原生包，在目标设备上运行测帧率。
- 编辑器的场景视图预览模式可跑基线，但不代表最终性能。

### 2. 优化脚本

- 每帧只做必须做的事。把非必要逻辑移入 `schedule` 或事件回调。
- 缓存 `find` / `getComponent` 结果，不在 update 中重复查找。
- 使用 `tween` 代替手动每帧修改属性。
- 高频创建和销毁的对象走 `NodePool` 对象池复用。

### 3. 降低 DrawCall

- 把 UI 图片打包到同一图集，确保相邻节点使用同一纹理。
- 按组件类型归类节点层级（Sprite 放一起、Label 放一起）。
- 减少使用 RichText；每段 RichText 的每个样式片都会产生独立绘制命令。
- 避免在同一层级中不同图集的节点交错排列。
- 减少自定义材质的使用，或增加合批兼容的逻辑（如动态图集合并）。

### 4. 管理节点数量和层级

- 不可见的节点设置 `active = false` 而非仅隐藏。
- 远离摄像机的对象关闭自动剔除或手动管理可见性。
- 长列表使用虚拟列表（只创建可见区域的节点）。
- 控制层级深度，避免每帧进行深层变换链计算。

### 5. 控制渲染开销

- 减少粒子系统数量，降低粒子发射率、生命周期和同时存活上限。
- 材质 Shader 优先使用内置的 Sprite/Label/Spine 等标准 Shader，自定义 Effect 在 Pixel/Vertex 阶段应尽量简化。
- 检查纹理尺寸是否过大。移动设备建议单张纹理不超过 2048x2048。
- 原生平台使用 GPU Profiler（Android Studio GPU 追踪 / Xcode GPU Frame Capture）进一步分析 GPU 瓶颈。

## 仍未解决时

- 使用 Chrome DevTools Performance 录制完整帧剖面，查看具体哪个函数调用栈耗时最高。
- 原生平台使用 Android Studio Profiler 或 Xcode Instruments，查看线程耗时和 GPU 负载。
- 在 Cocos 官方社区或论坛搜索同版本相似问题（注意版本差异）。
- 对照官方性能优化文档做系统性的场景简化或逻辑重设计。

## 相关文档

- [Profiler 工作流](../concepts/profiler-workflow.md)
- [减少 DrawCall](../recipes/reduce-draw-calls.md)
- [优化 update 循环](../recipes/optimize-update-loop.md)
- [性能问题分诊](../troubleshooting/performance-issues.md)
- [2D 合批优化](../ui-2d/draw-call-batching.md)
