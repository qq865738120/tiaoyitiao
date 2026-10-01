---
id: cocos-3.8-case-studies-animation-design-and-control
version: "3.8"
category: case-studies
title: 动画设计与控制
keywords:
  - 动画系统
  - Animation
  - AnimationClip
  - AnimationState
  - AnimationController
  - Animation Graph
  - 状态机
  - 动画设计
  - 解耦
  - crossFade
  - 动画事件
  - 根运动
related_docs:
  - concepts/animation-graph.md
  - concepts/animation-blending.md
  - recipes/play-animation.md
  - recipes/switch-animation-state.md
  - recipes/animation-event-callback.md
  - architecture/state-machines-and-data-driven-design.md
  - architecture/ecs-and-node-component.md
related_api:
  - Animation
  - AnimationClip
  - AnimationState
  - AnimationController
  - animation.VariableType
  - StateMachineComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "核心原则：玩法状态写变量，动画系统消费变量，动画事件只做时序通知"
    - "旧动画系统（Animation 组件）与新动画系统（AnimationController + Animation Graph）并存"
    - "Animation Graph 不派发 Animation.EventType 事件"
status: draft
updated: 2026-06-18
---

# 动画设计与控制

## 场景树

```
Canvas/
├── Player (player prefab)
│   ├── Sprite          (角色精灵)
│   ├── Animation       (旧动画系统)
│   ├── AnimationController (新动画系统，可选二选一)
│   ├── RigidBody2D     (物理组件，可选)
│   ├── Collider2D      (物理组件，可选)
│   └── PlayerController (自定义脚本)
│
└── UIController (UI控制)
```

## 组件表

| 节点路径 | 组件 | 用途 |
|---|---|---|
| Canvas/Player | Sprite | 角色渲染 |
| Canvas/Player | Animation | 旧动画系统：播放/管理 AnimationClip |
| Canvas/Player | AnimationController | 新动画系统：驱动 Animation Graph 状态机 |
| Canvas/Player | RigidBody2D | 物理运动（可选） |
| Canvas/Player | Collider2D | 碰撞检测（可选） |
| Canvas/Player | PlayerController | 玩法逻辑：读取输入、计算移动速度、更新动画变量 |

## 数据流

<!-- 长示意图已压缩：保留上文结构与下文决策规则。 -->

### 为什么不能双向耦合

**错误模式**（双向耦合）：
```
玩法逻辑 ──→ 播放动画 ──→ 动画事件 ──→ 修改玩法状态
   ↑                                       │
   └───────────────────────────────────────┘
```
这种模式下，读代码时需要同时追踪 PlayController 和 Animation Graph 才能理解完整的攻击流程。任何一个改动都可能影响另一端。

**正确模式**（单向驱动）：
```
玩法逻辑 ──→ 设置变量 ──→ Animation Graph 自动决策 ──→ 动画事件（仅时序通知）
```
玩法逻辑只负责"声明需求"（我跑了、我跳了、我攻击了），Animation Graph 负责"执行动画"（播放哪个片段、过渡多长时间），动画事件只负责"时机性副作用"（判定帧、脚步声）。

## 关键实现

### 1. 播放/切换动画

**旧动画系统（Animation 组件）**：

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**新动画系统（AnimationController + Animation Graph）**：

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 2. Crossfade（交叉淡入淡出）

旧系统中通过 `crossFade()` 实现平滑过渡，过渡期间两个动画同时播放并根据权重混合。

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**过渡时间选择建议**：

| 过渡类型 | 建议时间 | 原因 |
|---|---|---|

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 验证

### 1. 单元测试角度

- 测试 PlayerController 的 `speed` / `isGrounded` / `velocityY` 计算逻辑是否正确
- 测试动画变量 `setValue()` 后 AnimationController 状态是否切换
- 模拟不同输入组合验证状态机转换表全部覆盖

### 2. 手动验证步骤

1. **待机→跑步**：角色静止时展示 Idle 动画，按方向键后平滑切换到 Run 动画
2. **跑步→跳跃→落地**：按跳跃键后切换到 Jump_Up，上升至顶点自动切换到 Jump_Down，落地后回到 Idle
3. **攻击判定**：按下攻击键后播放 Attack 动画，在攻击帧事件触发时检查碰撞体是否启用
4. **受伤打断**：在攻击动画中让角色受伤，检查是否切换到 Hit 动画（Animation Graph 中配置 Attack → Hit 的过渡）
5. **死亡**：HP 降为 0 后进入 Die 动画，检查是否不再响应其他输入（Die 状态无出口过渡）
6. **销毁清理**：销毁角色节点后，检查是否有残留的事件监听（无报错、无泄漏）
7. **循环动画帧事件**：Run 动画循环播放时检查脚步声事件是否按预期频率触发

### 3. 边界条件验证

- speed 恰好等于 0.1（阈值边界）：动画状态应为 Idle 还是 Run？
- 同时按下攻击和跳跃：Animation Graph 中 Attack 和 Jump 哪个优先级更高？

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 失败路径

| 错误操作 | 预期表现 | 排查方向 |
|---|---|---|
| 在 `onFrameEvent` 中修改 `speed` 变量 | 可能导致状态机在同一帧内多次切换 | 将状态修改逻辑移到 `update()` 中 |
| 动画事件回调中调用 `play()` | 可能导致无限循环或状态混乱 | 动画事件只做时序副作用，不驱动动画切换 |
| 忘记 `onDestroy` 中取消事件监听 | 销毁后仍触发回调，报空引用错误 | 在 `onDestroy` 中调用 `node.off()` |
| Animation Graph 所有过渡都启用 Has Exit Time | 动画必须播放到指定帧才能过渡，手感延迟 | 关键动作（攻击、受伤）关闭 Has Exit Time |
| 旧系统 `play()` 后立即 `getState()` | `getState()` 返回的是之前的状态，新状态可能尚未就绪 | 在 `PLAY` 事件回调中获取状态 |
| `addClip()` 使用已存在的名称 | 旧的动画剪辑被覆盖，引用丢失 | 检查名称唯一性或先 `removeClip()` |
| Trigger 类型变量在 `update()` 中每帧 `setValue(true)` | 动画状态机可能在第一帧触发后无法再次触发 | Trigger 只在事件发生时设置一次 |
| Animation Graph 没有 Any State → Idle 过渡 | 角色可能卡在非 Idle 状态无法退出 | 为每个叶节点状态添加回 Idle 的过渡 |
| 忘记停止动画就销毁节点 | 可能出现资源泄漏或引擎报错 | `onDestroy()` 中调用 `anim.stop()` |
