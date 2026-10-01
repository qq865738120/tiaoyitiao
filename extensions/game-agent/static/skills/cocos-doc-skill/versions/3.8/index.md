# Cocos Creator 3.8 知识索引

本目录是 `cocos-doc-skill` 的默认版本知识入口，面向 Cocos Creator 3.8。

路由优先级规则详见 SKILL.md 与 routing/index.md。

## 目录列表

- `routing/`：智能体路由入口与映射索引。
- `concepts/`：跨主题概念说明。
- `scene-node-component/`：场景、节点与组件主题知识。
- `scripting/`：脚本系统主题知识。
- `assets/`：资源系统主题知识。
- `ui-2d/`：2D UI 主题知识。
- `recipes/`：任务型做法文档。
- `troubleshooting/`：错误现象与排查文档。
- `api-reference/`：高频 API 知识卡片。
- `architecture/`：架构原理、模式选择、职责边界与 Cocos 落地。
- `gameplay-systems/`：可复用游戏系统设计与组合。
- `case-studies/`：跨多个模块的完整游戏开发案例。

## 高频任务入口

| 任务类型 | 推荐文档 |
|---|---|
| 创建节点 / 挂组件 | `recipes/create-node-and-component.md` |
| 修改 Label 文案 | `recipes/change-label-text.md` |
| Button 点击事件绑定 | `recipes/button-click.md` |
| 动态加载资源 | `recipes/load-resource-dynamically.md` |
| 实例化 Prefab | `recipes/instantiate-prefab.md` |
| 释放资源 / 防止内存泄漏 | `recipes/release-resource.md` |
| 场景切换 | `recipes/load-scene.md` |
| UI 屏幕适配 | `recipes/screen-adaptation.md` |
| 播放动画 | `recipes/play-animation.md` |
| 切换动画状态 | `recipes/switch-animation-state.md` |
| 播放音频 | `recipes/play-audio.md` |
| 播放视频 | `recipes/play-video.md` |
| 2D 碰撞检测 | `recipes/detect-collision-2d.md` |
| 3D 射线检测 | `recipes/raycast-3d.md` |
| 相机跟随目标 | `recipes/camera-follow-target.md` |
| 修改材质属性 | `recipes/change-material-property.md` |
| 触摸与键盘输入 | `recipes/handle-touch-and-keyboard.md` |
| 使用对象池 | `recipes/use-node-pool.md` |
| HTTP / WebSocket 请求 | `recipes/http-websocket-request.md` |
| 本地数据存储 | `recipes/local-data-storage.md` |
| 命令行构建 | `recipes/command-line-build.md` |
| 降低 DrawCall | `recipes/reduce-draw-calls.md` |
| 优化 update 循环 | `recipes/optimize-update-loop.md` |
| 动画事件回调 | `recipes/animation-event-callback.md` |
| 音频管理器模式 | `recipes/audio-manager-pattern.md` |
| 物理约束 | `recipes/use-physics-constraint.md` |
| 后处理效果 | `recipes/post-processing-effect.md` |
| 大型 3D 场景优化 | `recipes/optimize-large-3d-scene.md` |
| 多语言国际化 | `recipes/i18n-multi-language.md` |
| WebSocket 心跳重连 | `recipes/websocket-reconnect-heartbeat.md` |

## 文档状态

- `draft`：初稿，可用于常规参考，建议结合官方文档复核。
- `verified`：已完成事实核对，可作为推荐答案。
- `needs-review`：存在冲突、不确定或待复核信息，回答时必须提示用户复核。
