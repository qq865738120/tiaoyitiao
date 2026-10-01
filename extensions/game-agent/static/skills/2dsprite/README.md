# builtin:2dsprite

Cocos Creator 3.8.x 专用 2D 图片资产技能，覆盖透明角色/道具/动作/FX 与完整不透明静态背景。CJS 拥有 run/revision/digest/批准/发布状态，Python 只执行锁定依赖下的确定性栅格或像素算法。技能包必须在生产 ZIP 中自包含，不依赖兄弟目录、系统 Python 包或仓库源码。

静态单帧的权威输出是唯一 PNG，不生成 `cocos-sprite-manifest.json`；动画、多帧、atlas 或用户明确要求 manifest 时，权威输出是 loose PNG frames 并由 manifest 闭合。atlas、contact sheet 和布局图均为派生诊断资产。技能不代表 Creator 导入或动画播放已经验证。

图片 Provider 的 1K 画布只是源图。技能必须先记录 `renderMode=raster|pixel-art`：只有用户明确要求像素风，或参考图/上下文具有清晰像素画证据时才选择 `pixel-art`；其余情况默认 `raster`，保留连续色、半透明抗锯齿和非像素轮廓。像素模式才使用完整 cell 的整数倍 nearest、共享无抖动色板和二值 Alpha。receipt 的模型与目录身份只消费 `AgentWait.result.imageProvenance`。

布局意图与 render mode 正交。request 必须记录 `layout.marginMode=tight|safe`：按钮、标签和面板装饰使用 `tight`，以 target 为最大边界并裁到主体加最小透明边；图标、角色、FX、动画或证据不足时使用 `safe`，保持 exact target 与版本化安全区。所有缩放必须等比；约束冲突时失败，不允许把完整 Provider 画布非等比拉伸到 target。

供 Cocos 导入的启动页、菜单页或场景完整静态背景使用显式 `assetKind=background + transparencyMode=opaque + renderMode=raster`。该分支只接受 `1×1` 单帧与 exact target，保留完整画布且不执行色键、Alpha bbox、透明 margin、anchor、atlas 或 Manifest；源图与 target 宽高比必须一致。它仍经过 materialization、Python report、CJS 复验、视觉批准、`static-single-frame` pack 与 Session intake，不允许脚本旁路。

生成图主链路使用 CJS `begin-game-asset`：模型从 `AgentWait.result.images[]` 取得 `assetId/memberId/contentRevision/contentDigest`，经 AI 索引解析 public `readPath`，脚本再复验统一资产 authority、成员路径、PNG 摘要和可信 Session/用户消息范围后复制到 run 输入目录。模型不得写 `.gameagent/.data/game-assets/v1`、传 sessionId、猜路径或在陈旧引用后继承旧 run；AgentWait 完成表示图片资产已发布，不代表技能处理完成。

源格 QC 失败可在 `materialized` 且尚无任何输出的边界内，用新 checkpoint 原子替换源图；旧 source/receipt 仅保留摘要审计。报告、批准或包一旦存在，替换继续 fail closed。

`pack` 原子发布后会调用 invocation-bound package intake，把静态单 PNG 闭包或 loose frames + manifest 闭包登记为当前会话中的一个复合资产；内部文件不生成独立卡片。`packageStatus=published` 与 `projectionStatus=complete|pending|failed` 是两层独立事实；projection 失败不得重跑 pack 或生成新 run，只能在同一会话中对同一 run/digest 执行 `asset_pipeline.cjs intake` 重试。源 `.gameagent` package 始终只读。

Python 环境通过 PythonRuntime check/install/check 准备。两个操作均只提交技能目标，接受 2dsprite 或 builtin:2dsprite 并统一内部身份；主进程拥有计划和授权，Windows/macOS 缺解释器时使用固定受管供应。


素材开发任务需要直接用于场景时，pack/projection 完成后用 AssetManage.import_generated(asset_id, directory, base_name) 导入完整素材，读取返回的成员与 SpriteFrame 身份，再进行场景引用和真实预览验收。Skill 脚本仍不直接写 AssetDB 或 .meta；导入成功也不自动提升 creatorVerified/playbackVerified。

Session owner引用在消费跨技能源包前持久登记，登记前后复验deleting标记。Session删除将owner标记released，仍有其它run引用/lease或尚未独立进入GameAsset的published源继续保留；后续消费者释放时可复验并回收最后引用。未知owner与损坏证明均保留。
