---
id: cocos-3.8-concepts-profiler-workflow
version: "3.8"
category: concepts
title: 性能分析工作流 — Profiler 使用与诊断流程
keywords:
  - Profiler
  - 性能分析
  - FPS
  - DrawCall
  - 脚本耗时
  - Creator Profiler
  - Chrome Performance
  - 性能诊断
  - dispatch
  - 性能瓶颈定位
related_docs:
  - troubleshooting/frame-rate-low.md
  - troubleshooting/memory-leak.md
  - recipes/reduce-draw-calls.md
  - recipes/optimize-update-loop.md
  - ui-2d/draw-call-batching.md
  - troubleshooting/performance-issues.md
related_api:
  - profiler
  - Component.update
  - director
  - NodePool
source:
  official: "Cocos Creator 3.8 官方文档 - 场景性能优化 - Profiler"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：先采样再优化，避免凭感觉改代码后才发现瓶颈不在此处"
status: draft
updated: 2026-06-18
---

# 性能分析工作流 — Profiler 使用与诊断流程

## 用途

说明 Cocos Creator 3.8 性能分析的标准工作流：先定位热点再优化，避免盲目改代码。介绍 Creator Profiler、Chrome Performance 和平台工具的分工，以及如何将 FPS、DrawCall、内存、脚本耗时等指标分流到对应的优化方向。

## 核心结论

- **先采样，再优化**：不要凭感觉猜瓶颈。先通过 Profiler 采集数据，确认瓶颈在脚本、渲染、资源还是内存方向，再针对性地改。
- **三个工具层次**：
  - **Creator Profiler**（编辑器 `开发者 -> 打开 Profiler`）：实时查看 FPS、DrawCall、顶点数、三角面数、引擎各模块耗时，适合快速判断是否有明显异常。
    - **平台限制**：Creator Profiler 当前**仅限原生平台**（iOS/Android）工作。Web 平台或小游戏平台不能依赖此功能。
    - 提供 CoreStats（核心帧统计）、ObjectStats（对象统计）、MemoryStats（内存统计）、PerformanceStats（性能统计）等分类数据。
    - Profiler 面板本身有额外开销，不要在开启 Profiler 的环境下做帧率基准测试。
  - **Chrome DevTools Performance**（Web 平台）：录制帧火焰图，精确分析 JavaScript 堆栈耗时、GC 停顿、函数调用频率。适合定位脚本热点和内存泄漏。
    - **Web / 预览版可用**：当 Creator Profiler 不可用时（非原生平台），Chrome DevTools 是首选替代工具。
    - 可录制内存分配时间线（Allocation instrumentation timeline）查看函数级分配来源。
  - **平台 Profiler 工具**：Android Studio Profiler / Xcode Instruments / 微信开发者工具 Performance 面板，用于原生平台或小游戏平台的深度分析。
    - 覆盖 Creator Profiler 无法触及的系统级指标（GPU 负载、线程调度、I/O 等待）。
    - Xcode Instruments 的 GPU 帧捕获可直接查看着色器占用、顶点处理时间。
- **发布包与编辑器性能差异**：
  - 编辑器环境和 Profiler 面板开启时帧率会比发布包低 20%-50%。**性能基线测试必须在发布包上执行**。
  - 预览模式（Web 预览）也是参考值，不代表原生发布包的真实性能。
  - 仅当发布包上也出现帧率问题时，才需要深入优化。
- **常见指标解读**：
  - **FPS**：稳定 30 以上可玩，60 为目标值。突然掉帧说明某个操作触发了高开销，持续低帧说明有常驻热点。
  - **DrawCall**：移动端建议控制在 100-200 以内。超过时可排查合批条件，参考 `ui-2d/draw-call-batching.md`。
  - **内存**：场景切换后内存不回落说明资源未释放。`Creator Profiler -> Memory` 面板可查看各类型内存占用。
  - **脚本耗时（dispatch / update）**：Profiler 中 `dispatch` 或 `update` 耗时高说明脚本逻辑过重，需要优化 update 循环（见 `recipes/optimize-update-loop.md`）。
- **分流决策树**：
  - 脚本耗时高于渲染耗时 → 排查 update 循环、缓存引用、对象复用、避免高频创建临时对象 → `recipes/optimize-update-loop.md`。
  - DrawCall 明显偏高 → 排查合批打断、图集使用、Label/RichText/Mask 影响 → `recipes/reduce-draw-calls.md` 和 `ui-2d/draw-call-batching.md`。
  - 内存持续增长 → 排查资源未释放、事件监听未清理、对象池只进不出 → `troubleshooting/memory-leak.md`。
  - FPS 低但以上指标正常 → 排查粒子数、材质复杂度、Shader 开销、平台性能、节点总数 → `troubleshooting/frame-rate-low.md`。

## 什么时候使用

- 游戏运行时帧率未达标，需要知道从哪里入手优化。
- Profiler 显示某个指标异常（如 DrawCall 高、脚本耗时高、内存不回落），需要进一步诊断。
- 在社区看到优化建议，想判断是否适用于当前项目的实际瓶颈。

## 关键 API / 组件

- `profiler`：Creator Profiler 面板使用的内置性能统计模块。
- `Component.update`：最常出现性能热点的生命周期方法。
- `director`：场景切换相关释放逻辑。
- `NodePool`：对象复用，减少 GC 和实例化开销。

## 最小示例

```ts
import { _decorator, Component, profiler } from 'cc';

const { ccclass } = _decorator;

@ccclass('ProfilerToggle')
export class ProfilerToggle extends Component {
  start() {
    // 运行时通过按键打开/关掉 Profiler
    // 按 P 键切换 Profiler 显示
  }

  update(dt: number) {
    // 怀疑某段逻辑是热点时，用 console.time 粗测
    // console.time('myLogic');
    // ... 待排查的代码 ...
    // console.timeEnd('myLogic');
  }
}
```

## 常见错误

- **先改代码再分析**：没看 Profiler 就改逻辑、换图集、加对象池，结果瓶颈在别处。
- **在编辑器或开启 Profiler 下测帧率**：编辑器本身会占用性能，Profiler 面板也有额外开销。应在发布包或预览模式下做性能基准测试。
- **只看平均 FPS**：掉帧通常发生在瞬时峰值，需要看帧率曲线或帧耗时分布。
- **把 Chrome Performance 的 JS 堆栈和 Creator Profiler 的数据混为一谈**：Creator Profiler 看到的是引擎模块耗时，Chrome Performance 看到的是 V8 堆栈。两者互补，不冲突。
- **社区案例照搬**：每个项目的场景复杂度、设备性能、版本号都不同。社区优化代码必须结合当前项目的 Profiler 数据判断是否适用。

## 关联文档

- [帧率低排查](../troubleshooting/frame-rate-low.md)
- [内存泄漏排查](../troubleshooting/memory-leak.md)
- [减少 DrawCall](../recipes/reduce-draw-calls.md)
- [优化 update 循环](../recipes/optimize-update-loop.md)
- [2D 合批优化](../ui-2d/draw-call-batching.md)
- [性能问题分诊](../troubleshooting/performance-issues.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景性能优化 - Profiler
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
- 补充：工程经验——先采样再优化，避免凭感觉改代码后才发现瓶颈不在此处
