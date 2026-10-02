# app：阶段03单人闭环组合根

GameBootstrap组合JumpGameplay、FixedTickClock、InputAdapter、AvatarView、PlatformPool与CameraFollow。配置只有core权威来源。引用通过Creator Inspector绑定，不运行时猜路径加载GLB，不改原资源。

场景静态阶段01平台保留为校准资源但在运行时禁用，Avatar复用实际实例；平台动态池复用包装Prefab并显式替换10白名单导入子Prefab。World/Avatar/Camera/UI/标签引用由场景拥有，不硬编码节点UUID。

启动进入menu；唯一JumpGameplay状态驱动Home/HUD/Pause/GameOver页面，没有第二游戏控制器。P暂停/继续、R仅游戏中重开、Escape返回主页。Button监听仅绑定一次；页面切换立即锁按钮和世界输入0.18秒，锁按真实UI时间解除不推进模拟。新局/home清输入、回调、Tween/池和旧runId。解锁直接由update消耗真实UI时间，没有延迟回调；generation仅用于观测切换计数。

最高分由无cc依赖StorageAdapter注入sys.localStorage，namespace为本工程package UUID；终局记录真实分数，不因写失败阻塞重开。num.ttf用于HUD/本局/最高数字，中文默认字体。DEBUG F8重置存档，F9保留正常press/release整数tick24跳开发夹具，F10正常输入一跳中心后反复最小有效蓄力（可能落回当前台，不保证终局）；本轮结算使用最大蓄力正常落空验证；均不直接改坐标/分数。可选Bridge发布真实状态，不是玩法依赖。

每帧最多5 tick，积压冻结并显示暂停。pause配对机器/时钟，resume忽略首帧墙钟时间；新局reset、清输入owner/旧计划/池状态和回放。失焦/后台不自动恢复。

测试：tests/jump规则与回放入口；仅jump模块strict/noEmit宿主类型检查；Creator保存重开与鼠标/空格、至少20跳预览。可选Bridge仅发布真实状态副本/检查点，不能作为玩法实现依赖。
