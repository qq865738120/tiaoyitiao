# builtin:2dmap

Cocos Creator 3.8.x 专用地图资产技能。`tile_mode` 发布 PNG + 外部 TSX + TMX + manifest；`layered_mode` 发布分层 PNG + JSON handoff。CJS 拥有运行状态和发布，Python 只执行确定性图片/地图格式算法。技能不写 Creator 托管资产。

Provider 高分辨率 tile palette 必须用显式 `sourceGrid` 以整数倍 nearest、无抖动有限色板与二值 Alpha 归一化到目标 `tileSize`；receipt 的模型与目录身份只消费 `AgentWait.result.imageProvenance`。

生成图主链路使用 CJS `begin-game-asset`：模型从 `AgentWait.result.images[]` 取得 `assetId/memberId/contentRevision/contentDigest`，经 AI 索引解析 public `readPath`，脚本再复验统一资产 authority、成员路径、PNG 摘要和可信 Session/用户消息范围后复制到 run 输入目录。模型不得写 `.gameagent/.data/game-assets/v1`、传 sessionId、猜路径或在陈旧引用后继承旧 run；AgentWait 完成表示图片资产已发布，不代表地图处理完成。

源格 QC 失败可在 `materialized` 且尚无任何输出的边界内，用新 checkpoint 原子替换源图；旧 source/receipt 仅保留摘要审计。报告、批准或包一旦存在，替换继续 fail closed。

`pack` 原子发布后会调用 invocation-bound package intake：tile 模式把 PNG/TSX/TMX/manifest 完整闭包登记为当前会话中的一个复合资产，layered 模式同样把 layers PNG/JSON handoff 作为一个资产的内部文件；内部文件不生成独立卡片。`packageStatus=published` 与 `projectionStatus` 独立；pending/failed 只能在同一会话中用同一 run/digest 的 `asset_pipeline.cjs intake` 重试，禁止重跑 pack。源 `.gameagent` package 始终只读。

Python 环境通过 PythonRuntime check/install/check 准备。两个操作均只提交技能目标，接受 2dmap 或 builtin:2dmap 并统一内部身份；主进程拥有计划和授权，Windows/macOS 缺解释器时使用固定受管供应。激活其它技能使用 Skill 的 skillId 字段。


素材开发任务需要直接用于场景时，pack/projection 完成后用 AssetManage.import_generated(asset_id, directory, base_name) 导入完整素材，读取返回的成员与 SpriteFrame 身份，再进行场景引用和真实预览验收。Skill 脚本仍不直接写 AssetDB 或 .meta；导入成功也不自动提升 creatorVerified/playbackVerified。

Session owner引用在消费跨技能源包前持久登记，登记前后复验deleting标记。Session删除将owner标记released，仍有其它run引用/lease或尚未独立进入GameAsset的published源继续保留；后续消费者释放时可复验并回收最后引用。未知owner与损坏证明均保留。
