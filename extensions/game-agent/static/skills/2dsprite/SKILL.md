---
name: 2dsprite
description: 为 Cocos Creator 3.8.x 生成可实际导入的 2D 角色、道具、动作帧、特效与完整静态背景资产；场景地图、碰撞与区域布局改用 2dmap，一般插画、3D、Scene/Prefab mutation 与 API 问答不适用。
metadata:
  game-agent-display-name: "Cocos 2D 精灵资产"
  game-agent-invocation: "auto"
  game-agent-version: "3.2.0"
---
# Cocos 2D 精灵资产

目标不是交付一张概念图，而是交付可复现、可审计、可供 Cocos Creator 3.8.x 后续导入的静态单 PNG 或 loose-frame 权威资产包。Skill 不写 AssetDB、`.meta`、Scene、Prefab 或 AnimationClip；没有真实导入与播放证据时，`creatorVerified` 与 `playbackVerified` 必须保持 `false`。

## 必读资料

激活后以 Skill 返回的 `package_root` 为唯一脚本根目录；必须逐字复用该绝对值，禁止从 `GAME_AGENT_PROJECT_ROOT`、当前目录、仓库结构或 Skill 名称拼接/猜测脚本位置。先用 `Read` 实际读取：

1. [运行与证据合同](references/workflow.md)
2. [Cocos asset profile](references/cocos-asset-profile.json)
3. [精灵清单与质量门禁](references/sprite-contract.md)

不得引用兄弟 Skill、用户级技能目录或仓库源码路径。

## 强制链路

1. 明确资产类型（`character`、`prop`、`action`、`fx` 或 `background`）、目标尺寸、透明意图和风格约束，并在生成前确定 `renderMode`。角色、道具、动作与 FX 继续使用透明分支：明确帧数/FPS/loop、anchor 与 `layout.marginMode=tight|safe`，透明 Prompt 默认要求纯洋红 `#FF00FF` 色键背景。只有用户明确要求像素风，或参考图/当前上下文具有清晰像素画证据时，才选择 `pixel-art`；其余情况必须选择 `raster` 并使用 `renderReason=default-raster`。只有当用户要交付供 Cocos 导入的启动页、菜单页或场景完整静态背景时，才使用 `assetKind="background" + transparencyMode="opaque" + renderMode="raster"`；Prompt 明确要求完整不透明画布且不得要求色键，request 只允许 `1×1` 单帧 grid 与 exact target，不得携带 `chromaKey`、`pixelArt`、`layout`、`anchor`、atlas、Manifest、FPS 或 loop。spec 和 request 必须放在按本次 `assetId` 隔离的 run 外工作目录；目标 run 目录只能由 `prepare` 或 `begin-game-asset` 内部创建，禁止复用固定临时文件或预建 run 目录。
2. 使用目录中 `model:"image:auto"` 的 `builtin:image-generation`，按当前工具 Schema 调用 `Agent(assignments:[{agent_id:"builtin:image-generation", objective:"...", image_request:{prompt:"...", background:"transparent", model_selection_id:"image:<provider>:<model>"}}])`。角色、道具、动作与 FX 必须显式提交 `background:"transparent"`；完整静态背景提交 `background:"opaque"`。`model_selection_id` 必须从当前图片目录显式选择；禁止默认首项或语言模型凭证回退。
3. 用 `AgentWait` 等待完成，从 `result.images[]` 取得权威 `assetId`、`memberId`、`contentRevision`、`contentDigest`，并从 `result.imageProvenance` 取得 `resolvedModel`、Provider 与目录摘要。用 `Glob` 查找 `.gameagent/.data/game-assets/v1/index/ai/*.ndjson`，再以 `Grep(assetId)` 定位并 `Read` 对应 public `readPath` 做视觉检查；执行前复核引用未陈旧。AgentWait 只表示图片资产已发布，不表示技能处理完成。
4. 在同一次 `Bash` 调用中把 public `readPath` 解析为项目内普通只读源，并立即调用 `scripts/asset_pipeline.cjs begin-game-asset --source "$GAME_AGENT_PROJECT_ROOT/<readPath>" --run-label <semantic-label> --project-root "$GAME_AGENT_PROJECT_ROOT" --spec <assetId-scoped-spec.json> --asset-id <assetId> --member-id <memberId> --content-revision <contentRevision> --content-digest <contentDigest> --resolved-model <resolvedModel> --provider-id <providerId> --provider-model-id <providerModelId> --capability-version <capabilityVersion> --catalog-digest <catalogDigest>`。控制脚本会复验 authority manifest、成员路径、revision、digest、PNG 本体与当前 Session/消息范围，再复制到独立 run 输入目录。不得写受管资产根、手写 receipt、跨调用复用 source 或猜测成员路径。若返回 `RUN_ALREADY_EXISTS`、`RUN_SCOPE_MISMATCH` 或 `GAME_ASSET_REFERENCE_STALE`，必须停止并重新解析当前引用。
5. 环境缺失且可准备时调用 `PythonRuntime(operation:"install", skill_id:"2dsprite")`，成功后重新 check；不要提交计划字段。每一次 Python 调用前先执行 `PythonRuntime(operation:"check", skill_id:"builtin:2dsprite")`。只有 `status=ready` 且返回 `project_python` 时，才在 Bash 中以 `GAME_AGENT_PROJECT_ROOT` 为根组合绝对解释器路径，加上 `-B` 禁止改写解释器字节码缓存，再运行 `scripts/process_sprite.py`。不得从 `project_venv` 猜测、使用系统 pip、`source`/activate、任意安装命令或未锁定依赖。
6. 用 `asset_pipeline.cjs report` 绑定 Python report，再执行 `approve`。批准前必须用 `Read` 查看处理后的 contact sheet 或权威 frame，不能只看 Provider 源图。透明资产记录透明边界、杂色、主体宽高比、四边留白、帧稳定、anchor 与循环反证；不透明背景直接检查唯一权威 frame，记录完整画布、四边内容、标题/UI 安全区、exact target、无拉伸且没有意外透明像素。`pixel-art` 额外检查整数像素、有限色板和零半透明，透明 `raster` 检查连续色与半透明抗锯齿。同一 revision 下同一路径只读取一次。
7. `pack` 只接受当前 revision 的通过报告与视觉批准，原子发布 Cocos 导入包。静态单帧且未要求动画、atlas 或 manifest 时，Python 报告 `delivery.kind=static-single-frame`，发布 `game-agent.cocos-2dsprite-static-frame-package/v1`，闭包只含一个权威 PNG 和证明文件，不生成 `cocos-sprite-manifest.json`；多帧、FPS/loop、atlas 或显式 manifest 请求继续发布 loose frames + manifest 闭包。atlas/contact sheet 仅为派生或诊断文件。随后必须检查返回的 `packageStatus=published` 与 `projection.projectionStatus=complete`；若 projection 为 `pending/failed`，不得重跑 pack 或换 runId，只能对同一 run 执行 `asset_pipeline.cjs intake`。

## 生成约束

- 动作图要求固定视角、构图、角色尺度、轮廓和光向；每格只含一个完整主体，留足透明边界，禁止格线、文字、阴影地板或跨格肢体。
- Provider 原生输出尺寸是源图尺寸，不是最终 loose-frame 尺寸。目标为四帧且当前模型只支持方形画幅时，必须在 Prompt 中明确请求无格线的 `2×2` 四帧布局，并向 Python 传 `grid={columns:2,rows:2,count:4}` 与独立 `target=[64,64]`；1024×1024 源图本身不构成返工理由。
- request 必须显式传 `renderMode` 与 `renderReason`。`pixel-art` 才允许传 `pixelArt={paletteColors:64,alphaThreshold:128,sourceGridFidelityMin:0.5,sourceGridColorTolerance:16}`，并执行整数倍 nearest、共享无抖动色板和二值 Alpha 门禁；`raster` 禁止携带 `pixelArt`，使用高质量栅格缩放，允许并保留半透明抗锯齿，不量化色板，同时仍清除全透明像素中的残余 RGB 杂色。
- 透明分支必须显式传 `layout={marginMode,marginReason}`。`tight` 把 `target` 当作最大边界，`safe` 保持 exact target 与版本化透明安全区。`background + opaque` 不使用透明 layout 或 anchor：处理器保留完整画布，只在源图与 target 宽高比一致时以 Lanczos 等比缩放到 exact target；不一致就停止，禁止拉伸、裁切或补透明边。
- 多帧必须用联合主体尺寸计算共同 scale 与共享画布；不得逐帧独立放大或改变输出尺寸。`preserveScale` 默认开启并同时约束 raster/pixel-art。
- 透明素材必须同时提交 API `background:"transparent"`、在 Prompt 中保留纯洋红 `#FF00FF` 回退约束，并在 Python request 显式填写 `chromaKey={rgb:[255,0,255],tolerance:64,feather:18,alphaCutoff:64}`。处理器始终先验证 original Alpha：可信 Alpha 使用 `source-alpha-v1` 并跳过 chroma；全不透明才执行 `image-wide-chroma-v2`；可疑部分 Alpha或边界证据不足必须停止。`background + opaque` 必须省略 `chromaKey`。
- 不透明背景 QC 必须记录 `transparencyMode=opaque`、`method=full-canvas-raster-v1`、源/目标尺寸、统一 scale、`fullyOpaque=true`、`fullCanvasPreserved=true`、`exactTarget=true`、零透明/半透明像素和预算。opaque 与透明 raster/pixel-art QC 字段不得串线。
- `preserve-scale` 默认开启；跨动作共享同一 scale profile。角色默认脚底 anchor，道具/FX 可选择中心或显式 anchor。
- 静态单帧最终包必须只以一个 PNG 作为运行时权威入口，并包含 QC report、visual approval 和 receipt；不得包含 `cocos-sprite-manifest.json`。动画/多帧/atlas/显式 manifest 包必须包含 manifest、loose frames 与同样的证明文件；两类闭包不得混用。
    - 若 Python 在生成任何输出前以源格保真门禁拒绝 Provider 源图，必须明确返工图片。当前 run 仍为 `materialized`、没有 Python report/视觉批准/发布包且 `outputs` 不存在或为空时，可用新 Game Asset 引用再次调用 `register-game-asset`；控制脚本会复验新 authority、原子替换源图、递增 revision，并保留旧 source/receipt 摘要。存在任何输出或已进入 `qc-passed` 之后禁止替换。

## 脚本入口

```text
node <package_root>/scripts/asset_pipeline.cjs begin-game-asset --run-label <label> --project-root <root> --spec <assetId-scoped-spec.json> --source <public-read-path> --asset-id <assetId> --member-id <memberId> --content-revision <n> --content-digest <sha256> --resolved-model <model> --provider-id <provider> --provider-model-id <provider-model> --capability-version <version> --catalog-digest <sha256>
<python> -B <package_root>/scripts/process_sprite.py --request <request.json> --report <report.json>
node <package_root>/scripts/asset_pipeline.cjs report --run-id <id> --project-root <root> --report <report.json>
node <package_root>/scripts/asset_pipeline.cjs approve --run-id <id> --project-root <root> --expected-revision <n> --note <pixel-facts>
node <package_root>/scripts/asset_pipeline.cjs pack --run-id <id> --project-root <root> --expected-revision <n>
node <package_root>/scripts/asset_pipeline.cjs intake --run-id <id> --project-root <root>
```

所有路径、revision、digest、预算或 schema 不一致均停止，不猜测、不降级。已知 JSON、图片或脚本文件只用 `Read(file_path=...)`；不得用 `Grep` 搜索单文件，也不得在输入模板已经给出时读取脚本源码反推合同。失败恢复规则见 [运行与证据合同](references/workflow.md)。


素材开发任务需要直接用于场景时，pack/projection 完成后用 AssetManage.import_generated(asset_id, directory, base_name) 导入完整素材，读取返回的成员与 SpriteFrame 身份，再进行场景引用和真实预览验收。Skill 脚本仍不直接写 AssetDB 或 .meta；导入成功也不自动提升 creatorVerified/playbackVerified。
