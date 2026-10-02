# 阶段02 Creator 预览与持久化证据

本报告由主会话按实际工具观察整理，不是自动化测试输出，也不是截图推断规则。工程 `/Users/zhengwenjun/tiaoyitiao`，package UUID `4856b445-bfe4-49c2-8933-59e229f06792`，Creator/引擎3.8.8、Game Agent package0.4.0。配置jump-learning-1.0，seed20260930、tick1/60、每帧上限5。

## 预览方法与观察边界

使用当前Creator Preview的Browser helper，1280×720桌面viewport，内部iPhone XR模拟竖屏区域约414×680（x433—847）。这是桌面引擎预览，不是真机触摸、微信或发布包。纯规则三帧率确定性另见阶段02规则测试/回放JSON，人工墙钟按压不作确定性证据。

预先视觉目标：浅黄渐变、有贴图的角色/当前台/下一目标完整可见，Visual独立压缩不移动规则脚底；两方向成功后相机跟随，避免白模/关键裁切/脚底漂移/遮挡。历史/预告台允许裁切，开发FPS叠层不是游戏HUD。没有做参考图相似度测量。

## 真实输入与后态

| 事件时间（UTC） | 操作 | 实际后态与结论 |
| --- | --- | --- |
| 06:20:59.508 | P继续→Space保持约700ms→P暂停 | run2、tick87、jump1飞行暂停；计划distance14.2321428571/startTick69/T.6；规则foot(7.1160714,9.1,0)，相对台面最高3.6。press26/release69为43tick。jumps1，未重复启动。 |
| 06:21:59.603 | P继续飞行，等待后P暂停 | tick176、current1/target2、foot(14.2321428571,5.5,0)、score2/streak1、counts1/1/0。暂停期间tick87没有随思考时长推进，继续后正常落地。相机X=-14.58678944。 |
| 06:22:47.753—06:23:08.413 | viewport(700,600)鼠标按住700ms释放，随后P | 桌面Creator模拟touch:0先获owner；唯一jump2，distance13.9642857143。后态current2/target3、score6/streak2、counts2/2/0、pool5。证明实际鼠标操作，不标物理触摸设备通过。 |
| 06:24:39.727 | 语义点击CorePauseControl | paused→ready，score6/counts未改，owner为空，只有resume记录、无charge press；UI点击未穿透蓄力。 |
| 06:25:05—06:25:07.537 | 鼠标长按2秒，在1.5秒采样后释放 | 采样charging、hold1.2、jumps仍2、规则与renderedFoot(28.1964285714,5.5,0)不动、VisualY=.72；封顶不自动起跳。释放唯一jump3/distance22；miss→gameover、failed1、score6；最终footY=-23.3。 |
| 06:41:07.416 | R新局→Space保持10ms→等待→P | 新局run3，真实press tick0/release tick2，score0/jumps0，paused-ready、脚底(0,5.5,0)。不足.08s取消、不起跳。 |
| 06:42:14.219 | P继续→保持Space过程中P暂停 | tick31 press、tick40 pause/cancel(space)，paused-ready，owner/plan空、jumps0、脚底未动、VisualY恢复1；物理释放没有补起跳。 |
| 06:44:19.104 | R新局→Space保持1.5秒→等失败 | run5/tick161、jump1/start89/distance22，miss tick125；gameover、counts1/0/1、score0、foot(22,-23.3,0)，checkpoint phase02-gameover。 |
| 06:45:16.872 | gameover语义点击CoreRestartControl | run5→run6、ready/tick0、score/streak/counts全0、foot(0,5.5,0)、owner/plan空、inputs/results空，池保留8包装但旧状态已清；UI重开未穿透charge。 |

失焦/后台的真实OS切换未执行；game-hide/window-blur/document-hidden的配对、取消、解绑和持键隔离由14项InputAdapter mock及纯规则pause测试证明，不冒充OS实测。实际设备触摸未执行。飞行输入不缓存、竞争/旧回调由真实core与adapter测试证明。当前开发控件高度约30px，阶段03完整触屏UI尚未实施。

## 至少20次Creator连续跳

F9是仅DEBUG的固定tick开发夹具，只调用同一JumpGameplay.press/release，不注入位置/分数、不修改随机或物理参数；它在Creator引擎中渲染、平台池回收、落点和相机均实际运行。不是24次人工按压，也不替代前述真实鼠标/空格验证。

- 首次30秒wait未匹配：实际18跳后因simulation-backlog在tick1703安全暂停；score232/streak18、counts18/18/0、pool8、autoReplay仍true。不是失败或外部阻塞。
- P从原状态恢复，06:35:59.703匹配 `phase02-24-jumps`，等待9.444秒；06:35:59.708完整jump后态：run3、tick2263、paused-ready、current24/target25、score328/streak24、counts24/24/0、pool8、autoReplay=false；foot(152.12335021889135,5.5,184.702078418626)。相机(122.76193992176559,37.74,156.20210208022036)。
- 逐结果数组达到24项时工具仅交付前20项（truncated_keys），不能声称取得完整24项逐跳细节；完整最终计数/状态及checkpoint独立证明24跳。纯规则另有完整24跳JSON回放。
- 06:43:02.492只为修布局后三位数字/双方向截图启动新局，18.5秒后暂停第12跳飞行，score120。这是视觉补证，不为重复核心/24跳验收。
- 06:43:45.093继续.9秒后冻结ready：current12/target13，score136、12/12/0；current/target均X=84.46342854，Z87.70449214→100.25837214（+Z）；相机Z65.48143214。目标13完整可见。

## 像素事实与截图

| 归档路径（本目录下阶段02截图/） | 实际像素事实 |
| --- | --- |
| 空格半程.png | 角色高于台面，角色/当前/目标台完整，浅黄渐变；左缘裁切的是预告台，非下一目标。 |
| 封顶释放后单终局.png | “落空·本局6分 / 按R重开”可读，角色已落到画面下方，平台与阴影保留；失败表现不是白屏。 |
| 18跳圆台与Z跟随.png | 角色位于青色圆03顶部、蓝色下一目标完整；历史台部分在下缘。232第一字符贴边，发现HUD缺陷，不能把此图HUD记为通过。 |
| 24跳X跟随-修布局前.png | 绿色当前台上的角色、左上方目标25蓝台、上方预告26均可见；当前24→25沿+X，score328贴左边缘，保留首次缺陷。 |
| 三位分数-布局修正后.png | 120完整，左边距约24px；飞行角色与蓝/绿色目标无遮挡，背景渐变无白模。 |
| Z方向相机跟随.png | 136完整，角色在条纹当前12台，绿色下一目标13与更右上方预告14完整；+Z构图通过。 |
| 最终核心场景.png | 0分与P/R提示完整，角色立于当前台、左上下一目标完整，浅黄渐变和阴影正常；保存后的核心场景可见。 |

HUD修复：CoreScore Widget由ON_WINDOW_RESIZE改ALWAYS，动态字体尺寸变化仍保持left/top24。ComponentManage一字段applied、final assertion applied，事务jY2xebzUTgzk5fiMnVYRe；保存重开query alignMode1/left24/top24，并真实三位数字截图通过。不变更规则/输入/相机，既有24跳和三帧率证据有效。

## 保存重开与引用

全部采用Creator DocumentOpen/Save/ComponentManage/CreatorInspect；没有文件工具读写Scene/Prefab/meta。Prefab重新打开后节点实例UUID改变，按最新树查询，不缓存旧实例身份。

- JumpMain `5b6996b6-d990-41c6-b3fe-1502e1375ef5`：保存ig2fH_ydPIq-vivsZt3o5，返回重开后包装/10模型顺序/World/Avatar/WorldCamera/UI/Labels/font全部有效；HUD保存并切Avatar返回重开，query保持alignMode1/left24/top24；最终已验证保存事务 `bWJ0r5BH1bmmeVB7yHJK1`、dirty=false。持久化事实取DocumentSave/Open及query。
- Avatar `96c83e8c-3118-4a9e-bc1f-a29c309c1c65`：save Cr2rBNWUD5OyxOWS1UX_j，切换返回后visual9eK4ODaRVK94Ol0mhOFui7、head6doR8M+49FT6iYtVeweeMm、body20xvpT9elLR7EYz2f+c7vS分别对应最新实际树，rawFootY.0837。
- Rect00 `690a4303-cbcc-47b3-a992-955510038172`：save2ZUqkGX-dmW9Qyt-sBDcL，重开root20jLgzFWVDI6nhgNGdGquK/visual7aGaL0eRdPd4J8QNkypaeG、model00/rect/height5.5/scale1正确。
- Rect01 `ee8533ee-a937-41c0-8f24-366e0302c4fb`：saveFgbS0VY68ONkoU5WIqc-m，重开root4begZeZBZCfKf/0yyGk2XW/visual909A3Jb05FerviftBKYX8Z、model01/rect/height5.5/scale1正确。
- Circle03 `61e5731c-32c4-41b5-8e6d-d2e01e14bfb0`：savefCJkekBDn91TrSzWZe2pF，重开rootf8r2dAwZ9IxbFcBOTz5Cvr/visual03dyaloJtJs4w9aNH/0nbv、model03/circle/radius5/height5.5正确。

没有新建/覆盖原素材、包装资产或材质；原包装复用，Scene仅新增开发HUD和Bootstrap引用。

## 日志与已修失败

保留初始化引用未齐时的3条 `JumpMain phase02 references incomplete`，不是修复后的新异常。补齐并reload后的增量日志至06:45:37只有Creator初始化info，未新增error/warn；early_errors仍保留旧错误。Creatorconsole按jump/GameBootstrap/PlatformView过滤无结果，不能外推全编辑器所有历史无错。

真实失败修复：TTFFont声明误用Font导致10字段绑定9通过/1拒绝，改TTFFont后只补失败字段；临时typecheck声明路径TS2688和重复seed TS2783修正后宿主strict通过。适配初测P06旋转回收遗漏，修复后仅平台7项复验全部通过，初失败报告不覆盖。

最终场景已保存、Creator当前JumpMain，persisted/dirty=false。普通TS/Markdown/Shell的git diff --check通过；正式报告JSON可解析，文档本地链接0缺失，7张截图已归档；git status针对assets/resources/jump无改动。会话任务日记被运行时标记unavailable，后续未继续修改，持久证据取本报告及交接，不声称该日记已更新。

Browser helper在回复后会清理，不承诺持续活跃。没有构建、打包、发布、真机或阶段03—04实施。
