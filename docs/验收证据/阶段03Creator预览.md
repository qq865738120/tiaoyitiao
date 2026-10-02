# 阶段03 Creator预览与验收记录

日期：2026-10-02。本工程 `/Users/zhengwenjun/tiaoyitiao`，package UUID `4856b445-bfe4-49c2-8933-59e229f06792`；Creator及实际预览引擎3.8.8、Game Agent扩展package0.4.0。仅当前工程；未访问另一工程、未构建发布。截图不能代替规则测试。

## 条件与证据边界

- 配置保持 `jump-learning-1.0`、seed20260930、模拟tick1/60、每帧最多5tick；未修改生产core或InputAdapter。
- 实际游戏尺寸以Runtime页面screenRect核实，不以浏览器窗口大小推断。414×736：设计分辨率设备、浏览器414×786，页面rect(0,50,414,736)。375×667：375宽设备、浏览器375×715，页面rect(0,48,375,667)。宿主工具栏不是游戏UI。
- 下列截图是Preview工具实际PNG的逐字节副本，**没有裁剪、重绘或拉伸**。文件名414/375指游戏内容宽度，完整PNG分别为414×786、375×715；大分数补充PNG为414×784，游戏区域近似414×734，只作为大字排版补充，不冒充精确尺寸验收。
- 像素观察：两尺寸首页白色标题/带字开始按钮、紫色角色与两台；HUD左上数字、右上暂停、底部中文新手提示；暂停三项中文分离；结算大分数、主页图标、再玩图片按钮、历史最高分全部可见，无空排行榜框/排除入口/统计面板遮挡。原图片含文字，未叠重复Label。num.ttf数字完整，中文用默认字体。

## 实际交互与状态

时间为工具返回UTC；未保留精确时间的早期动作按区间记录。

| 场景/时间 | 输入 | 实际结果 |
| --- | --- | --- |
| 首轮07:47附近 | 首页开始→暂停→继续按钮 | ready→paused→ready，暂停tick1317保持，按钮没有产生Jump；修复绑定后1Bootstrap、7UI监听。此轮设备/窗口非最终指定尺寸，仅保留行为证据。 |
| 08:00:08 | 双击开始 | 仅一次newRun：run2→3、重开计数0→1，score0/jumps0、owner/plan为空，UI锁生效。 |
| 08:01附近—08:03:34 | DEBUG F9正常整数tick press/release回放24跳；继续/暂停；P继续+Space1250ms | 24次Scored实际得328，streak24、pool8；HUD显示328且新手提示隐藏。随后第25跳distance22落空，gameover score328、best328、failed1、storageError=null。F9没有设置分数/位置。 |
| 08:05:05 | 双击结算再玩 | 仅一次newRun：run4→5、重开2→3；score0/jumps0，最高分328不降。 |
| 08:05:33 | 连续20条R，每条后等待250ms | run5→25、重开3→23，恰+20；最终score0、jumps/scored/failed=0、owner/plan=null、locked=false；监听7、Bootstrap1、pool8不增长。纯R12的20循环另覆盖charging/airborne/landing/falling/paused中断。 |
| 08:06—08:07 | 暂停菜单重新开始→暂停→回到主页 | run26 ready→run27 menu；旧owner/plan/计数清理，主页画面只有两校准台，不启用回收池壳。 |
| 375×667，08:16:35—08:17:12 | 暂停按钮→继续按钮 | paused tick6099→ready同tick6099；score0/jumps0，UI点击不触发蓄力/跳跃。 |
| 375×667，08:17:29—08:17:50 | Space700ms后正常落地，再独立Space1250ms | 第1跳中心+2；第2跳distance22落空，gameover score2/best2、failed1。 |
| 375×667，08:18:41—08:19:39 | 结算再玩→暂停→菜单主页 | run4 ready/score0/jumps0→run5 menu，best2保留；返回主页后4个动态Platform根active=false（查询后续子树有截断，不外推全树）。 |
| 375×667，08:20附近 | 页面reload | 初始化menu新run2，best2仍为2，无storageError，监听7/Bootstrap1。是真实sys.localStorage同浏览器上下文的重新启动证据。首轮此前reload亦保留best3。 |
| 精确414×736，08:21—08:24:54 | 开始→暂停→P继续→最大蓄力失败→结算主页 | 页面/HUD rect精确414×736；暂停时jumps0/owner=null；终局score0、best2不降低；蓝色主页图标点击进入menu、计数清空。再玩按钮行为沿用前轮有效结果，不为截图重复计分。 |

暂停按钮设计宽48、设计高60.48；375缩放后的CSS宽43.48，不等同设计像素下限44违规。其他按钮设计点击框均大于44×44；图片比例由RAW+等比scale保持，页面铺满/相对锚定由Widget拥有，Label NONE拥有文本尺寸。

## 存档与清理

key：`jump:4856b445-bfe4-49c2-8933-59e229f06792:best:v1`，保存JSON数值。异常/损坏/负数/非整数/非有限值回退0并标错误；写异常保留内存max及pendingWrite，不throw、不阻塞新局，后续可重试；remove失败不假称重置。DEBUG F8仅移除本key，不清本局。

最高分真实更新：首轮3→328；新隔离测试浏览器上下文0→2→reload2。关闭并重建helper会创建独立上下文，本轮未证明两个helper上下文共享存档，也不将新上下文best0判为游戏存储错误。真正持久用户浏览器/真机重启未实测。

新局/主页重置InputAdapter物理down/owner、规则runId/旧计划/事件、回放/计数，unscheduleAllCallbacks，停止表现Tween，池clear递归停Tween并复位材质/视图。校准平台与动态池分别管理；poolCount是保留槽数，非活动台数。没有新增音频，不能据此宣称旧声音/叠音实测通过。

## 纯逻辑、类型与源码审计

- [阶段03纯逻辑测试.json](阶段03纯逻辑测试.json)：17/17，8501断言；R13十三项、R12四项，含20循环和旧run/jump回调拒绝。真实cc/UI/音频不在纯测试覆盖内。
- 宿主TypeScript4.9.5，jump模块strict/noEmit/ES2015、skipLibCheck，最近源码修复后退出0；不是全仓扩展类型检查，也不是打包构建。
- 独立只读审计核验报告所列12项sourceHashes全部一致，故复用已过测试不重跑。报告未包含clock/Bootstrap/UI/InputAdapter全部依赖，不能单凭哈希扩称完整集成通过；新增UI/组合根由上述实际Preview覆盖。
- 新增/修改jump脚本只引用cc及本地模块，未发现fetch/XHR/WebSocket/wx/http/friend业务接口；网络最近100项窗口仅loopback资源200/304，但结果截断，**没有完整网络审计结论**。
- 保存JumpMain、切Avatar Prefab再回JumpMain：页面/资源/17UI绑定及Bootstrap引用保留，文档dirty=false；Prefab仅保存，无本阶段新增结构。最新Creator warn/error查询为空；最终浏览器增量日志仅11条初始化info、无warn/error、无截断、early_errors为空。历史失败未抹除。

## 失败、修正与未执行

- PNG AssetDB copy四次不支持image profile；改为外部staging+import_external 4/4成功，随后通过领域工具设置SpriteFrame；原PNG/GLB/UUID未改。四副本与原图字节一致。
- UI未绑定时热重载出现一次references incomplete；绑定并保存/reload后恢复。早期两次误判短跳会终局的等待超时：实际落回当前/普通命中，不篡改规则；最终最大蓄力正常失败通过。
- 统计面板遮挡提示/结算：经宿主公开profiler.hideStats处理，最新画面无遮挡。
- 预览设备/CSS全屏与Browser viewport不一致曾造成暂停点击无状态变化；重新选择正确设备并核实rect后通过。误选浏览器全屏导致两次setViewport RPC拒绝，close/open恢复；不把失败调用写成通过。F10短跳夹具不保证失败，README已更正。
- 未执行：物理触摸/真机、真实OS后台、用户持久浏览器跨进程存档、音频清理、全素材/Library哈希校验、阶段01曾撤销的材质深度/UV校准、其他分辨率、全仓扩展测试、构建/发布。没有声称这些通过；本阶段没有需用户执行的阻塞。

## 持久截图

| 精确内容尺寸 | 首页 | HUD | 暂停 | 结算 |
| --- | --- | --- | --- | --- |
| 414×736 | [首页](阶段03/414-首页.png) | [HUD](阶段03/414-HUD.png) | [暂停](阶段03/414-暂停.png) | [结算](阶段03/414-结算.png) |
| 375×667 | [首页](阶段03/375-首页.png) | [HUD](阶段03/375-HUD.png) | [暂停](阶段03/375-暂停.png) | [结算](阶段03/375-结算.png) |

大数字补充：[真实328结算](阶段03/大分数328-结算补充.png)。三态及暂停证据都已实际观察；截图只证明外观，对应计分/点击结果以上表和纯测试为准。
