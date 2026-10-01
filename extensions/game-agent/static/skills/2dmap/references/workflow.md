# 地图工作流与职责

运行目录为 `<project>/.gameagent/.data/cocos-2d-assets/2dmap/runs/<runId>`，由 CJS 维护 owner、versioned spec/profile、revision、receipt、报告、批准与包 digest。脚本根只能逐字使用本次 `Skill` 结果的绝对 `package_root`。生成图主链路用 `begin-game-asset` 原子创建 run；最终 runId 由可信的当前 Session、用户消息、memberId 与语义 label 派生。素材必须来自当前图片 Agent 发布的 `GameAssetV1`：从 `AgentWait.result.images[]` 取得稳定引用，经 AI NDJSON 索引解析 public `readPath` 并用 Read 检查像素，再由控制脚本复验 authority manifest、成员 realpath、revision、digest、PNG 本体与当前消息范围。禁止写受管根、手写 receipt、猜测路径、跨调用复用 source 或在陈旧引用后继承旧 run。

地图基础结构 owner：画布、foundation/terrain、层序、平台/墙、collision、spawn、zone、occluder 和 map format。2dsprite owner：跨地图复用的 character、prop、action、FX。调用 2dsprite 时，只能消费其 `status=published` 且 visual approval 有效的包，并在 map spec 中记录 package digest、manifest digest 和用途。

Python 前总是执行 PythonRuntime check。`not_ready` 只能通过 PythonRuntime 的不可变 install plan 和明确批准恢复；Bash 不得安装环境。`ready` 后只使用结果中的 `project_python`，并以 Bash 内部 `GAME_AGENT_PROJECT_ROOT` 为根组合绝对解释器，不得猜测平台路径。Python report 只描述确定性产物，CJS 重新检查 realpath、常规文件、摘要、预算、format roundtrip 和 profile parity。

视觉批准必须查看 composite preview 与单层/tileset 像素，记录边缘是否无缝、前景遮挡是否合理、碰撞是否贴合可见地面、spawn/zone 是否在界内、角色与地图尺度/光向/色板是否一致。自动解析通过不能替代视觉证据。

`tile_mode` 的方形 Provider 源图必须以显式 `sourceGrid` 归一化为目标 `tileSize`；report 和 manifest 记录源尺寸、源格、目标 tile、normalized size 与 nearest 重采样。缺少源格时只接受已经处于目标 tile 网格的输入，不能把高分辨率 Provider 画布默认为大量目标 tiles。

发布使用同级 staging + 原子 rename。不得写 AssetDB、`.meta`、Scene、Prefab；import-ready 与 Creator/runtime verified 是不同证据层。

原子发布后，控制脚本通过调用级 intake bridge 只提交 skill、runId 与 packageDigest。main 从当前项目派生并复验源包，tile 只纳管 PNG→TSX→TMX→manifest 必要闭包，layered 只纳管 layers PNG→JSON handoff；QC、receipt、approval、composite preview 不进入 Catalog。package published 与 projection complete 是两层事实；projection pending/failed 只能对同一 run 执行 `asset_pipeline.cjs intake`，不得重跑 pack、复制 package 或创建重复 run。历史 `.gameagent` package 不扫描，projection 删除永不触碰源包。

源图 QC 失败恢复只允许发生在状态机的 `materialized` 阶段：失败尝试不得留下输出；新图片资产必须重新解析 public `readPath`、Read，并再次调用 `register-game-asset`，由控制脚本复验 authority 后重建 receipt。控制脚本只在不存在 report/approval/package 且 `outputs` 不存在或为空时执行原子替换，并把旧 source/receipt 摘要追加到 `sourceReplacements`。任何非空输出或更晚状态都必须拒绝替换。
