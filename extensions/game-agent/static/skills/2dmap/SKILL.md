---
name: 2dmap
description: 为 Cocos Creator 3.8.x 生成可编辑 2D 地图、分层场景、TileMap、碰撞、出生点与区域 handoff；可复用角色、道具、动作与 FX 必须调用 2dsprite，一般插画、3D、Scene/Prefab mutation 与非 Cocos 引擎不适用。
metadata:
  game-agent-display-name: "Cocos 2D 地图资产"
  game-agent-invocation: "auto"
  game-agent-version: "3.0.0"
---
# Cocos 2D 地图资产

输出 Cocos Creator 3.8.x 可继续导入和编辑的地图资产，不把一张概念图冒充可玩地图。Skill 不写 AssetDB、`.meta`、Scene 或 Prefab；没有真实导入/运行证据时 `creatorVerified=false`。

## 必读资料

激活后以返回的 `package_root` 为唯一资源根目录；必须逐字复用该绝对值，禁止从 `GAME_AGENT_PROJECT_ROOT`、当前目录、仓库结构或 Skill 名称拼接/猜测脚本位置。用 `Read` 实际读取：

1. [地图工作流与职责](references/workflow.md)
2. [Cocos asset profile](references/cocos-asset-profile.json)
3. [TileMap 合同](references/tile-map-contract.md) 或 [分层地图合同](references/layered-map-contract.md)

不得引用兄弟目录、用户级技能目录、仓库源码或其它引擎路线。

## 模式与职责

- `tile_mode`：权威输出为 tileset PNG、外部 TSX、TMX 与 `cocos-map-manifest.json`；碰撞、spawns、zones 使用命名 object groups。
- `layered_mode`：权威输出为 foundation/props/actors/foreground 等分层 PNG 与版本化 `cocos-layered-map.json`，明确原点、Y 轴、层序、sortY、遮挡、碰撞和 zones。
- 地图专用的地面、墙、平台、背景和组合装饰由本技能生成；可复用角色、道具、动作或 FX 必须通过真实 `Skill({"skillId":"builtin:2dsprite"})` 取得已视觉批准且已发布的包，再在 map receipt 中绑定其 digest。禁止复制其脚本或伪造调用。

## 强制链路

1. 先确定地图模式、相机/画布、tile 尺寸或分层尺寸、坐标系、层语义、碰撞/spawn/zone 与预算。spec 和 request 必须放在按本次 `assetId` 隔离的 run 外工作目录（例如 `<project>/.gameagent/.data/cocos-2d-assets/work/<assetId>/`）；目标 run 目录只能由 `prepare` 或 `begin-game-asset` 内部创建，禁止复用固定临时文件或预建 run 目录。
2. 需要生成图时使用目录中 `model:"image:auto"` 的 `builtin:image-generation`，并在 `image_request.model_selection_id` 中显式选择当前图片模型。用 `AgentWait` 等待，从 `result.images[]` 取得 `assetId`、`memberId`、`contentRevision`、`contentDigest`，并从 `result.imageProvenance` 取得模型、Provider 与目录摘要。用 `Glob` 查找 `.gameagent/.data/game-assets/v1/index/ai/*.ndjson`，再以 `Grep(assetId)` 定位并 `Read` public `readPath` 查看像素。AgentWait 只表示图片资产已发布，不表示地图处理完成。
3. 同次 `Bash` 立即调用 `scripts/asset_pipeline.cjs begin-game-asset --source "$GAME_AGENT_PROJECT_ROOT/<readPath>" --run-label <semantic-label> --project-root "$GAME_AGENT_PROJECT_ROOT" --spec <assetId-scoped-spec.json> --asset-id <assetId> --member-id <memberId> --content-revision <contentRevision> --content-digest <contentDigest> --resolved-model <resolvedModel> --provider-id <providerId> --provider-model-id <providerModelId> --capability-version <capabilityVersion> --catalog-digest <catalogDigest>`。控制脚本会复验 authority manifest、成员路径、revision、digest、PNG 本体与当前 Session/消息范围，再复制到独立 run 输入目录。不得写受管资产根、手写 receipt、跨调用复用 source 或猜测成员路径；`RUN_SCOPE_MISMATCH` 或引用陈旧时必须停止并重新解析。
4. 环境缺失且可准备时，调用 `PythonRuntime(operation:"install", skill_id:"2dmap")`，成功后重新 check；不要提交 plan_id 或自行安装依赖。每次 Python 前先调用 `PythonRuntime(operation:"check", skill_id:"builtin:2dmap")`。只有 `status=ready` 且返回 `project_python` 时，才在 Bash 中以 `GAME_AGENT_PROJECT_ROOT` 为根组合绝对解释器路径，加上 `-B` 禁止改写解释器字节码缓存，再运行 `scripts/build_cocos_map.py`；不得从 `project_venv` 猜测、自行 pip install 或调用包管理器。
5. 用 CJS `report` 复核 Python 输出和 digest。`tile_mode` 必须通过脚本内置 TMX/TSX 回读；`layered_mode` 必须通过 JSON schema 与图层尺寸/alpha/顺序检查。
6. 用 `Read` 查看 composite preview 和各层关键像素，记录无缝、遮挡、碰撞对齐、层级与风格反证后执行 `approve`、`pack`。同一 revision 下，成功返回的同一路径只读取一次；除非读取失败或像素证据明确不足，否则不得反复读取相同图片。pack 后必须分别确认 `packageStatus=published` 与 `projection.projectionStatus=complete`；complete 代表整个 package 已作为当前会话中的一个复合资产登记，manifest、地图与图片均是内部文件。projection pending/failed 不回滚包，禁止重跑 pack 或生成重复 run，只能在同一会话中用同一 run 的 `asset_pipeline.cjs intake` 重试。

`tile_mode` 的 Provider 源图尺寸与最终 tile 尺寸分离。方形图片模型应生成明确的无格线方形 tile palette（例如 `2×2` 或 `4×4`），并要求整数像素块、硬边、有限色板、无抗锯齿/抖动。1K/2×2 到 16×16 tile 时，每个逻辑像素应为对齐 quadrant 原点的 `32×32` 同色源像素块。Python request 用 `sourceGrid` 描述源格、`pixelArt={paletteColors:64,alphaThreshold:128,sourceGridFidelityMin:0.5,sourceGridColorTolerance:16}` 描述源图与成品门禁，再以整数倍 nearest 归一化；不得把 1024×1024 原图直接解释成 4096 个 16×16 tile。源格保真不足、半透明像素、分数/非等比缩放或超出色板上限必须失败。

若 Python 在生成任何输出前以 `PIXEL_SOURCE_GRID_FIDELITY_LOW` 拒绝 Provider 源图，必须明确返工图片。当前 run 仍为 `materialized`、没有 Python report/视觉批准/发布包且 `outputs` 不存在或为空时，可用新 Game Asset 引用再次调用 `register-game-asset`；控制脚本会复验新 authority、原子替换 `inputs/source.png`、递增 revision，并在 `sourceReplacements` 中保留旧 source/receipt 摘要。存在任何输出或已进入 `qc-passed` 之后禁止替换。

## 脚本入口

```text
node <package_root>/scripts/asset_pipeline.cjs begin-game-asset --run-label <label> --project-root <root> --spec <assetId-scoped-spec.json> --source <public-read-path> --asset-id <assetId> --member-id <memberId> --content-revision <n> --content-digest <sha256> --resolved-model <model> --provider-id <provider> --provider-model-id <provider-model> --capability-version <version> --catalog-digest <sha256>
<python> -B <package_root>/scripts/build_cocos_map.py --request <request.json> --report <report.json>
node <package_root>/scripts/asset_pipeline.cjs report --run-id <id> --project-root <root> --report <report.json>
node <package_root>/scripts/asset_pipeline.cjs approve --run-id <id> --project-root <root> --expected-revision <n> --note <pixel-facts>
node <package_root>/scripts/asset_pipeline.cjs pack --run-id <id> --project-root <root> --expected-revision <n>
node <package_root>/scripts/asset_pipeline.cjs intake --run-id <id> --project-root <root>
```

任何素材、profile、revision、解析回读、预算或视觉门禁失败均停止；禁止降级为单张 baked image 或宣称 Creator 已验证。已知 JSON、图片或脚本文件只用 `Read(file_path=...)`；不得用 `Grep` 搜索单文件，也不得在输入模板已经给出时读取脚本源码反推合同。


素材开发任务需要直接用于场景时，pack/projection 完成后用 AssetManage.import_generated(asset_id, directory, base_name) 导入完整素材，读取返回的成员与 SpriteFrame 身份，再进行场景引用和真实预览验收。Skill 脚本仍不直接写 AssetDB 或 .meta；导入成功也不自动提升 creatorVerified/playbackVerified。
