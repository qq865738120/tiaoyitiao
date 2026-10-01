# 运行与证据合同

运行目录固定为 `<project>/.gameagent/.data/cocos-2d-assets/2dsprite/runs/<runId>`。脚本根只能逐字使用本次 `Skill` 结果的绝对 `package_root`。生成图主链路用 `begin-game-asset` 原子创建 run 并登记已复验成员；最终 runId 由可信的当前 Session、用户消息、memberId 与语义 label 派生。外部 spec、request 必须先写到按 assetId 隔离的 run 外工作目录，禁止复用固定文件、预建 run 或把 spec 放入 run。`run.json` 是 CJS 唯一状态源，每次变更递增 revision，并绑定 owner、spec、profile、素材 receipt、Python report、QC 和视觉批准摘要。所有非 intake 状态迁移必须属于同一 Session/消息；published intake 可在同一 Session 的后续消息中对同一 digest 幂等重试。`RUN_ALREADY_EXISTS` 或 `RUN_SCOPE_MISMATCH` 不是恢复入口，禁止读取、枚举或继承该 run。任何旧 revision 的批准或报告必须拒绝。

素材必须来自当前图片 Agent 发布的 `GameAssetV1`。`AgentWait.result.images[]` 提供 `assetId/memberId/contentRevision/contentDigest`，`imageProvenance` 提供模型和 Provider 身份；先经 AI NDJSON 索引定位 public `readPath` 并用 Read 检查像素，再在同次 Bash 调用 `asset_pipeline.cjs begin-game-asset`。控制脚本复验 authority manifest、成员 realpath、revision、content digest、成员 SHA-256、PNG 尺寸和当前 Session/消息范围后复制输入。禁止写受管根、手写 receipt、猜测路径、跨调用复用 source 或在 `GAME_ASSET_REFERENCE_STALE` 后继续处理。

源图画幅与最终帧规格分离：Provider 可返回 1K 方形源图，Python 再按显式 `grid` 切格并按 `target` 生成权威 loose frames。四帧方形源图默认使用 `2×2`，不得把 1024×1024 源图误判为 64×64 最终帧失败，也不得在未检查格内主体和边界时盲目切分。像素画必须让完整 cell 以统一整数倍率 nearest 映射到目标画布；不得裁出任意主体 bbox 后做分数缩放。成品使用共享、无抖动有限色板和 0/255 二值 Alpha，QC 对任何半透明像素 fail closed。

完整静态背景是受控例外，不是脚本旁路：request 必须显式使用 `assetKind=background + transparencyMode=opaque + renderMode=raster + 1×1 grid`。Python 保留完整不透明画布，仅在源图与 exact target 宽高比一致时执行 Lanczos 等比缩放；不得携带或运行 chroma、透明 margin/anchor、atlas、FPS、loop 或 Manifest。后续 report、批准、pack 与 intake 仍走同一 run/revision/digest 状态机。

Python 前必须调用 PythonRuntime check。`not_ready` 且 install_available=true 时调用 PythonRuntime(operation="install", skill_id="2dsprite")；计划和有效授权由主进程生成，不复制计划字段。不得将安装命令转交 Bash。完成后重新 check，并只使用 ready 结果的 `project_python`；在 Bash 中以 `GAME_AGENT_PROJECT_ROOT` 为根组合绝对解释器并添加 `-B`，不得从 `project_venv` 猜测平台路径。

Python report 只能引用 run 内输入与输出。透明分支记录真实 alpha、边界透明、色键推断、残余色、布局与 anchor；其全不透明源图必须显式提供纯色 `chromaKey`。显式不透明背景则记录独立 full-canvas QC，必须证明源/输出完全不透明、完整画布、exact target 与统一 Lanczos scale。CJS 再次计算文件摘要并拒绝路径越界、symlink、缺文件、超预算、分支字段串线或报告不一致。

视觉批准必须记录实际像素事实和反证，例如透明资产的边缘污染/越格/anchor，或不透明背景的四边内容、标题/UI 安全区、完整画布、无拉伸与无意外透明。仅写“看起来不错”无效。profile、素材、报告或产物变化都会使批准失效。

发布先写同级 staging 目录，完成摘要后再原子 rename。失败只清理本次 staging；不得删除已发布包、其它 run、Session 或项目资产。最终包不写 Cocos 托管文件，`creatorVerified=false`、`playbackVerified=false`，除非后续独立宿主验收确有证据。

原子 rename 与 `run.status=published` 完成后，控制脚本才提交 package intake。intake 只传 allowlisted skill、runId 与 packageDigest，main 从当前项目派生并复验 package；不传自由路径。最终交付必须同时满足 package published 与 projection complete。projection pending/failed 不得回滚或重建 package，也不得重跑 pack；使用 `asset_pipeline.cjs intake --run-id <id> --project-root <root>` 对同一 digest 幂等重试。管理器投影、tombstone 与 GC 永不写入或删除源 package，历史 package 不会被扫描迁移。

源图 QC 失败恢复只允许发生在状态机的 `materialized` 阶段：失败尝试不得留下输出；新图片资产必须重新解析 public `readPath`、Read，并再次调用 `register-game-asset`，由控制脚本复验 authority 后重建 receipt。控制脚本只在不存在 report/approval/package 且 `outputs` 不存在或为空时执行原子替换，并把旧 source/receipt 摘要追加到 `sourceReplacements`。任何非空输出或更晚状态都必须拒绝替换。
