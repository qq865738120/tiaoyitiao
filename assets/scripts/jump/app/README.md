# app：阶段04单人声画闭环组合根

GameBootstrap组合JumpGameplay、FixedTickClock、InputAdapter、AvatarView、PlatformPool与CameraFollow。配置只有core权威来源。引用通过Creator Inspector绑定，不运行时猜路径加载GLB，不改原资源。

场景静态阶段01平台保留为校准资源但在运行时禁用，Avatar复用实际实例；平台动态池复用包装Prefab并显式替换10白名单导入子Prefab。World/Avatar/Camera/UI/标签引用由场景拥有，不硬编码节点UUID。

启动进入menu；唯一JumpGameplay状态驱动Home/HUD/Pause/GameOver页面，没有第二游戏控制器。P暂停/继续、R仅游戏中重开、Escape返回主页。Button监听仅绑定一次；页面切换立即锁按钮和世界输入0.18秒，锁按真实UI时间解除不推进模拟。新局/home清输入、回调、Tween/池和旧runId。解锁直接由update消耗真实UI时间，没有延迟回调；generation仅用于观测切换计数。

最高分由无cc依赖StorageAdapter注入sys.localStorage，namespace为本工程package UUID；终局记录真实分数，不因写失败阻塞重开。num.ttf用于HUD/本局/最高数字，中文默认字体。DEBUG F8重置存档，F9保留正常press/release整数tick24跳开发夹具，F10正常输入一跳中心后反复最小有效蓄力（可能落回当前台，不保证终局）；本轮结算使用最大蓄力正常落空验证；均不直接改坐标/分数。可选Bridge发布真实状态，不是玩法依赖。

每帧最多5 tick，积压冻结并显示暂停。pause配对机器/时钟，resume忽略首帧墙钟时间；新局reset、清输入owner/旧计划/池状态和回放。失焦/后台不自动恢复。

阶段04：Inspector显式绑定13核心AudioClip、7背景Texture2D及既有Gradient Sprite。AudioAdapter首次玩家开始/按键/蓄力手势启用，按唯一DomainEvent消费；取消输入即时drainEvents，避免下一帧才停。newRun/home/destroy停止旧声，runId重置防旧intro回调复活。不加载perfect/pop/fall_2、缺失store/water，无背景音乐。音量是保守初值而非已试听结论。声学试听与真实音频状态/计数分别记录。

表现接入：AvatarView/JumpUI逐事件消费，render使用固定tick+插值的模拟秒，暂停不追加墙钟；只控制Visual与HUD，逻辑脚底仍来自core。BackgroundView构造时创建7个运行SpriteFrame，固定序列5/0/1/2/3/4/6，每4个唯一Scored切换；home/newRun回5，destroy恢复原帧并释放7帧。HUD只拥有1个CenterFlash Graphics，投影绑定WorldCamera，0.35秒单圆环、0.45秒分数脉冲；无Tween/粒子/延迟任务。每局clear/reset避免旧run反馈；原平台阴影不叠加，角色复用独立ContactShadow。DEBUG F7仅发正常Game.EVENT_HIDE供桌面后台路径检查，不冒充物理OS切后台。F6在下个真实中心Scored后、F5在下个真实airborne达到0.20模拟秒后，仅director.pause冻结渲染供短瞬间截图；恢复用Runtime control resume。它们不设置玩法分数/坐标，不能当正常P暂停/音频清理证据。Bridge的playedClips只在实际AudioSource.playing=true时追加有限16条摘要，不等同主观试听。

测试：tests/jump规则与回放入口；仅jump模块strict/noEmit宿主类型检查；Creator保存重开与鼠标/空格、至少20跳预览。可选Bridge仅发布真实状态副本/检查点，不能作为玩法实现依赖。
