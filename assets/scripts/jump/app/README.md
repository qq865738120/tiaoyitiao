# app：阶段02组合根

GameBootstrap组合JumpGameplay、FixedTickClock、InputAdapter、AvatarView、PlatformPool与CameraFollow。配置只有core权威来源。引用通过Creator Inspector绑定，不运行时猜路径加载GLB，不改原资源。

场景静态阶段01平台保留为校准资源但在运行时禁用，Avatar复用实际实例；平台动态池复用包装Prefab并显式替换10白名单导入子Prefab。World/Avatar/Camera/UI/标签引用由场景拥有，不硬编码节点UUID。

开始即进入ready（阶段02可玩核心）；P暂停/继续，R新局。仅DEBUG提供F9固定tick连跳回放，用正常press/release入口，不改分数/落点/随机参数。score使用num.ttf，中文默认字体。阶段03菜单/存档/完整页面不在此实现。

每帧最多5 tick，积压冻结并显示暂停。pause配对机器/时钟，resume忽略首帧墙钟时间；新局reset、清输入owner/旧计划/池状态和回放。失焦/后台不自动恢复。

测试：tests/jump规则与回放入口；仅jump模块strict/noEmit宿主类型检查；Creator保存重开与鼠标/空格、至少20跳预览。可选Bridge仅发布真实状态副本/检查点，不能作为玩法实现依赖。
