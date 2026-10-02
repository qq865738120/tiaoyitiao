# jump/core（阶段02）

职责：无 `cc` 依赖的唯一配置、随机平台、蓄力/解析弹道、台面几何、原子计分、生命周期及固定 tick 模拟。逻辑脚底独立于 Visual，不读取墙钟或模型包围盒。

## 接口

- 保留阶段01 `types/config/random/clock/state-machine` 出口和语义。`claimJumpEvent` 仍只预留资格且不更新分数；实际业务必须用机器 `score` 命令（token + center:boolean）一次完成资格、奖励及 Scored 发布，不可先 claim 再 score。
- `motion.ts`：`chargeDistance(holdSeconds,config?)`、`sampleJump(plan,t,config?)`、`descendingLandingTime(startY,topY,config?)`。释放时从实际 foot 向目标中心锁定方向，同高度飞行0.6秒。
- `geometry.ts`：安全内缩 rect/circle 判定、中心判定、目标优先/当前/失败分类、射线安全距离区间及实际脚底可达检查；只有 current/target 参与分类。
- `platforms.ts`：`PlatformGenerator(seed,config?)` 的 `initial()` 返回0/1且不消费随机流；`next(previous)` 固定方向→scale→gap→model四次消费。返回平台带冻结几何，生成时检查当前中心可达；Gameplay另检查实际脚底。
- `gameplay.ts`：`JumpGameplay(config=DEFAULT_GAME_CONFIG)`；`start(seed=config.seed):boolean`、`home():boolean`、`press(source):boolean`、`release(source):boolean`、`cancel(source?,reason?):boolean`、`pause(reason='pause'):boolean`、`resume():boolean`、`step():boolean`（一个模拟tick）。短按release返回true表示已处理取消，不表示起跳。非拥有者、重复/忙碌输入返回false且不缓存。start无效seed返回false且保持旧局；不可达配置明确抛RangeError，不静默改变随机流或分数。
- getters：`state:Readonly<RunState>`、`foot:FootPosition`、`platforms:readonly PlatformSpec[]`、`current/target:PlatformSpec|undefined`、`holdSeconds:number`（封顶）、`results:readonly ReplayResult[]`；`drainEvents():DomainEvent[]` 消费本局事件。只读快照不向外暴露可写状态机器。
- 平台起局0/1及一个预告；成功后旧target成为current，旧预告成为target并生成新预告；池不超过配置上限8。落回current保留实际脚底和streak。landing固定1tick、recentering为ceil(cameraMoveSeconds/step)=15tick、falling以弹道触地时的下降速度继续竖直下落（XZ保持落空位置），ceil(flightTime/step)=36tick后finishFall。暂停不推进这些阶段。

## 生命周期与集成

状态流保留阶段01：menu→ready→charging→airborne→landing→recentering→ready；current经landing直接ready；miss→falling→gameover。暂停charging先取消，恢复ready；飞行保存plan与foot。start/home清输入、plan、事件、结果、阶段计时器并废止旧run/jump。外部异步回调必须携带runId/jumpId，并用机器guardCallback/dispatch验证；Gameplay完全同步，不依赖回调推进。

应用配对调用Gameplay和FixedTickClock的pause/resume，重开clock.reset；clock恢复首帧忽略后台delta，积压冻结时由应用同步暂停Gameplay并提示。Visual取state.jumpPlan解析采样，不改逻辑脚底。场景音频、Tween、模型池材质重置属于父级adapters/view；此处不宣称其已验证。

## 测试

按 `tests/jump/README.md` 编译和执行阶段01回归及阶段02规则/回放入口。测试使用独立验收基准，1000平台及实际偏脚底射线检查，至少20跳同tick跨30/60/120 FPS回放；证据只表示纯逻辑，不表示Creator/触摸/视觉验收。
