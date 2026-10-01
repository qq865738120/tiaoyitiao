---
id: cocos-3.8-recipes-animation-event-callback
version: "3.8"
category: recipes
title: 动画事件与回调
keywords:
  - 动画事件
  - 动画帧事件
  - 事件回调
  - Animation Event
  - 动画帧回调
  - Animation.EventType
  - 攻击命中
  - 脚步声
  - 特效触发
  - 粒子特效
related_docs:
  - api-reference/animation.md
  - api-reference/animation-controller.md
  - concepts/animation-blending.md
  - concepts/animation-graph.md
  - troubleshooting/animation-event-not-fired.md
  - recipes/play-animation.md
  - recipes/switch-animation-state.md
related_api:
  - Animation
  - Animation.EventType
  - AnimationController
  - AnimationClip
  - StateMachineComponent
source:
  official: "Cocos Creator 3.8 官方文档 - 动画系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "动画帧事件仅在 Animation 组件（非 AnimationController）下触发"
    - "Animation.EventType 事件从 node 派发，不是从 Animation 组件实例派发"
    - "事件不触发时优先检查函数名拼写和组件挂载位置"
status: draft
updated: 2026-06-18
---

# 动画事件与回调

## 验证方式

- 动画播放到事件帧时，控制台输出回调日志（在回调方法中添加日志确认）。
- 系统事件（FINISHED/PLAY/STOP）在对应生命周期触发时正确输出。
- 取消事件监听后不再触发回调。
- 使用 `console.trace()` 确认回调调用栈来自引擎动画系统。
