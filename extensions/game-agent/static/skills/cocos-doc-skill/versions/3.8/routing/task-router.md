# Routing 兜底分诊

当 `api-symbol-map.json`、`component-map.json`、`error-map.json` 和 `keyword-map.json` 都未命中时，按本文件判断用户问题最接近的任务类型。所有路径均相对 `versions/3.8/`。

下列分类不重复 JSON 映射已覆盖的简单别名查询，而是保留需要跨文档串连、分诊判断或包含额外注意事项的兜底任务类型。

## 节点 / 组件操作（兜底分诊）

如果用户问题涉及创建节点、查找子节点、添加组件、或者 Node 与 Component 关系等基础概念，但 JSON 映射未命中：

- 先判断用户问的是"怎么做"（recipe）还是"是什么"（concept）还是排查报错（troubleshooting）。
- 推荐阅读：`recipes/create-node-and-component.md`、`scene-node-component/node.md`、`scene-node-component/component.md`
- 必要 API：`api-reference/node.md`、`api-reference/component.md`
- 排错入口：`troubleshooting/null-component.md`

## 性能问题分诊

性能问题涉及面广，不宜直接跳转到单个排错文档。按以下顺序排查：

1. **UI 性能**：DrawCall 是否异常 → `ui-2d/draw-call-batching.md`、`ui-2d/list-virtualization.md`
2. **帧率 / 卡顿**：`troubleshooting/frame-rate-low.md`、`troubleshooting/performance-issues.md`
3. **内存相关**：内存泄漏 → `troubleshooting/memory-leak.md`；释放资源 → `recipes/release-resource.md`
4. **3D 场景**：大型场景优化 → `recipes/optimize-large-3d-scene.md`、`concepts/profiler-workflow.md`
5. **update 循环**：`recipes/optimize-update-loop.md`
6. Profiler 使用 → `concepts/profiler-workflow.md`

## 平台 / 构建排错

平台相关问题首先判断目标平台：

- **Web**：白屏 / 构建失败 → `troubleshooting/build-web.md`，通用构建入口 `troubleshooting/build-errors.md`
- **Android**：Gradle / NDK / targetSdk → `troubleshooting/build-android.md`
- **iOS**：Xcode / CocoaPods → `troubleshooting/build-ios.md`
- **微信小游戏**：`troubleshooting/build-wechat-game.md`
- **命令行构建**：`recipes/command-line-build.md`

平台相关排错文档多有 `needs-review` 标记（平台版本差异大），回答时必须提示复核。

## 渲染 / 材质 / Effect

3D 渲染问题先查看是否能看到模型：

- **模型不可见** → `troubleshooting/3d-object-not-visible.md`
- **材质不生效** → `troubleshooting/material-not-updated.md`
- **Shader 编译失败** → `troubleshooting/shader-compile-failed.md`
- **自定义材质打断合批** → `troubleshooting/material-breaks-batching.md`
- **Effect / Shader 入门** → `concepts/effect-shader-overview.md`、`recipes/create-simple-effect.md`
- **后处理 / 渲染管线版本** → `recipes/post-processing-effect.md`、`concepts/render-pipeline-version-boundary.md`

## 原生 / JSB

- **JSB 通信不生效** → `troubleshooting/jsb-bridge-failed.md`
- **JsbBridge / sendToNative 用法** → `concepts/native-jsb-overview.md`
- **热更新不生效** → `troubleshooting/hot-update-failed.md`（同时参考 `concepts/native-jsb-overview.md` 了解原生搜索路径）

## 异步回调与节点销毁

关键词：异步加载后节点销毁、`isValid` 使用时机、`await` 后节点有效性、回调回来组件已销毁。

- 推荐阅读：`scripting/coding-pitfalls.md`（陷阱三：异步完成后节点已销毁）、`scene-node-component/destroy-lifecycle.md`
- 核心模式：每个 `await` 之后访问 `this`/`this.node` 前必须 `isValid` 检查；使用取消标志在 `onDestroy` 中通知异步任务中止。

## 音频管理器模式

- 分层控制 BGM 与音效 → `recipes/audio-manager-pattern.md`
- 平台兼容（iOS Safari / Web Audio） → `troubleshooting/audio-format-compat.md`

## 动画事件回调与混合

- 帧事件回调 → `recipes/animation-event-callback.md`
- 动画混合与分层 → `concepts/animation-blending.md`
- 动画图 → `concepts/animation-graph.md`

## 多语言国际化（i18n）

Cocos 3.8 无内置 i18n 系统，该条目为方案级 recipe。

- 推荐阅读：`recipes/i18n-multi-language.md`

## WebSocket 心跳保活与断线重连

- 推荐阅读：`recipes/websocket-reconnect-heartbeat.md`、`recipes/http-websocket-request.md`
- 注意：微信小游戏 WebSocket 最多 2 个并发连接，需配置服务器域名白名单。

## 包体大小与资源优化

- 包体过大 → `troubleshooting/package-too-large.md`
- 纹理压缩 → `assets/texture-compression.md`
- 自动图集 / 动态图集 → `assets/auto-atlas-dynamic-atlas.md`
- 分包 → `assets/subpackage.md`、`assets/asset-bundle.md`

## 架构设计决策

当用户询问模式选择、分层策略、模块职责边界、数据流方向等问题时：

- **通用架构原则与分层** → `architecture/foundations.md`：节点组件模型下的游戏架构原则、分层映射、使用场景区分
- **游戏主循环与执行顺序策略** → `architecture/game-loop-and-execution-order.md`：三种初始化/更新顺序策略对比
- **服务、事件与依赖管理** → `architecture/services-events-and-dependencies.md`：服务范围划分、依赖管理方式、事件通信规范
- **ECS 与节点组件模型** → `architecture/ecs-and-node-component.md`：ECS 概念、Cocos Component 对比、混合架构
- **状态机与数据驱动设计** → `architecture/state-machines-and-data-driven-design.md`：四种状态机方案、四类状态职责边界
- **对象池与帧内任务调度** → `architecture/pooling-and-task-scheduling.md`：NodePool 策略、分帧/时间片/节流调度
- **游戏数据与存档架构** → `architecture/game-data-and-save-architecture.md`：四类数据区分、存档 DTO、版本迁移
- **网格与双网格瓦片系统** → `architecture/grid-and-dual-grid-tile-systems.md`：坐标基础、位掩码邻接、A* 前提

## 游戏系统设计

当用户询问可复用的游戏功能模块设计（生命值、技能、拾取等）：

- **生命值与伤害系统** → `gameplay-systems/health-and-damage.md`：DamageData、无敌帧、死亡流程、Shield 模式
- **技能与冷却系统** → `gameplay-systems/skills-and-cooldowns.md`：CooldownManager、施法流程、Effect 分发、GCD
- **生成与拾取系统** → `gameplay-systems/spawning-and-pickups.md`：Spawner 对象池集成、Pickup 触发、波次、掉落表

## 跨模块开发案例

当用户询问跨多个 Cocos 子系统的完整实现案例时：

- **角色控制器案例** → `case-studies/character-controller.md`：2D/3D 方案选择、场景树、组件表、数据流
- **相机跟随与反馈系统** → `case-studies/camera-follow-and-feedback-system.md`：平滑跟随、死区、震屏、多相机
- **瓦片地图渲染与碰撞** → `case-studies/tiled-map-rendering-and-collision.md`：图层命名、节点树、ObjectGroup、分块加载
- **动画系统工程化设计** → `case-studies/animation-design-and-control.md`：动画组件区分、状态机转换表、数据流解耦
