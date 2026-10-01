# Routing

本目录存放智能体根据 API 符号、组件名、错误现象和自然语言关键词选择文档的路由入口。

## 文件清单

| 文件 | 职责 |
|---|---|
| `api-symbol-map.json` | API 符号（如 `Label`、`director`）→ API 卡片路径映射 |
| `component-map.json` | 组件类名（`Button`、`Collider2D`）→ 主题文档 / API / recipes |
| `error-map.json` | 错误现象 / 异常信息 → 排错文档路径 |
| `keyword-map.json` | 中文 / 英文自然语言关键词 → 文档路径聚合映射 |
| `task-router.md` | 兜底分诊：上述映射都未命中时按任务类型分类引导 |

路由读取优先级详见 SKILL.md 的"路由优先级"节。

## 路由分片结构

`keyword-map.json`、`api-symbol-map.json`、`error-map.json` 是模型读取的聚合文件，分别由对应分片目录自动合并生成。

### keyword-map 分片

由 `keyword-map/` 目录下 9 个主题分片自动合并生成：

| 分片文件 | 主题范围 |
|---|---|
| `keyword-map/core.json` | 运行时基础：director、game、Node、Component、input、sys、isValid |
| `keyword-map/ui.json` | UI 体系：Label、Sprite、Button、UITransform、Widget、EditBox、ScrollView、Toggle、Slider、Mask、Canvas |
| `keyword-map/assets.json` | 资源系统：assetManager、resources、Prefab、AssetBundle、Texture、Atlas |
| `keyword-map/scripting.json` | 脚本系统：生命周期、decorator、async/await、编码陷阱 |
| `keyword-map/scene-node-component.json` | 场景节点组件：创建节点、挂组件、场景切换、destroy |
| `keyword-map/rendering.json` | 渲染/Effect/材质/后处理：Material、Effect、Shader、PostProcessing |
| `keyword-map/animation-physics-audio.json` | 动画/物理/音频：Animation、Collider、RigidBody、AudioSource |
| `keyword-map/platform-native.json` | 平台/原生/构建：Android、iOS、小游戏、JSB、热更新 |
| `keyword-map/performance-troubleshooting.json` | 性能与排错：帧率、内存、DrawCall、Profiler |

### api-symbol-map 分片

由 `api-symbol-map/` 目录下 10 个主题分片自动合并生成：

| 分片文件 | 主题范围 |
|---|---|
| `api-symbol-map/runtime.json` | 运行时基础：director、game、sys、view、Director、isValid |
| `api-symbol-map/scene-node.json` | 场景层：Node、Component、Prefab、instantiate、_decorator |
| `api-symbol-map/ui.json` | UI 组件：Label、Sprite、Button、UITransform、Widget、ScrollView 等 |
| `api-symbol-map/asset.json` | 资源系统：resources、assetManager、AssetBundle、Asset、Texture 等 |
| `api-symbol-map/animation.json` | 动画：Animation、AnimationClip、tween、sp.Skeleton 等 |
| `api-symbol-map/physics-2d.json` | 2D 物理：Collider2D、RigidBody2D、Contact2DType |
| `api-symbol-map/physics-3d.json` | 3D 物理：PhysicsSystem、RigidBody、Collider 等 |
| `api-symbol-map/render-3d.json` | 3D 渲染：Camera、Light、MeshRenderer、Material 等 |
| `api-symbol-map/input-event.json` | 输入事件：input、Input、EventTouch、EventMouse 等 |
| `api-symbol-map/util-math.json` | 数学工具：Vec2、Vec3、Quat、Color、Size、Rect |

### error-map 分片

由 `error-map/` 目录下 8 个主题分片自动合并生成：

| 分片文件 | 主题范围 |
|---|---|
| `error-map/ui.json` | UI 排错：不显示、按钮点击、点击穿透、Canvas、Layout |
| `error-map/asset.json` | 资源排错：资源加载、Prefab、AssetBundle、meta、纹理 |
| `error-map/animation.json` | 动画排错：动画不播放、事件不触发、状态切换 |
| `error-map/physics.json` | 物理排错：碰撞不触发、3D 物理不响应、刚体设置 |
| `error-map/build.json` | 构建排错：构建失败、Web/Android/iOS/小游戏 |
| `error-map/native.json` | 原生排错：JSB、热更新、原生通信 |
| `error-map/runtime.json` | 运行时排错：内存泄漏、性能、帧率、渲染异常 |
| `error-map/input-event.json` | 输入排错：事件不触发、坐标转换、事件穿透 |

模型只读聚合文件（`keyword-map.json`、`api-symbol-map.json`、`error-map.json`），不直接读取分片文件。新增 alias/API 时按主题归属写入对应分片，由构建脚本合并入聚合文件。

### 分片间约束

1. **全局唯一**：每条 key 在同类型分片中全局唯一，不允许在不同分片出现相同的 key。
2. **文档去重**：同一 key 对应的文档列表内部去重。
3. **归属优先**：变体优先放在用户最可能搜索的分片，避免随机分布。
4. **构建校验**：`npm run cocos-doc-skill:build-routing:all` 会校验全部三类分片无重复 key，不一致时报错。

## 论坛来源 alias 的证据要求

论坛来源的 alias 在分片文件中必须附带证据记录：

1. 新增论坛来源 alias 时，在 `routing/keyword-map/forum-evidence-ledger.json` 中登记原始论坛帖子 URL、日期和交叉验证状态。
2. 暂时无法核实来源的 alias，在对应分片文件开头顶部标注 `// needs-forum-evidence`，并在 `forum-evidence-ledger.json` 中标记 `"crossVerified": false`。
3. 没有证据标注的论坛来源 alias，模型在路由命中时建议以 `status: needs-review` 对待，提示用户复核。
4. 论坛来源 alias 只能作为补充证据，不能替代官方文档或公开类型声明。

## 分类知识目录

以下分类面向架构级/系统级问题，当前无路由分片，由 `task-router.md` 兜底分诊：

| 分类 | 目录 | 职责 |
|---|---|---|
| 架构原理 | `architecture/` | 模式选择、边界、数据流、代价 |
| 游戏系统 | `gameplay-systems/` | 可复用系统职责、接口、组合 |
| 开发案例 | `case-studies/` | 跨模块完整案例：场景树、组件、数据流 |

这些分类尚未建立 keyword-map 分片，命中文档路由后按 `status` 规则提供答案。

## 维护规则

- 新增 alias 优先写入对应主题分片，不直接修改 `keyword-map.json`。
- 归属不明确时优先放入 `keyword-map/core.json`。
- 执行 `npm run cocos-doc-skill:build-routing` 从分片重新生成聚合文件。
