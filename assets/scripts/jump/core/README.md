# jump/core（阶段01）

职责：不依赖 `cc` 的共同配置、数据契约、生命周期状态机、确定性随机流与固定步长时钟。参数以 `docs/游戏设计文档.md` 为准，唯一默认值在 `config.ts`；落点容差 1e-6，验收基准文件的通用比较容差 1e-5 不替代规则。

公共入口 `index.ts`：GameConfig/PlatformSpec/RunState/JumpPlan/DomainEvent/ReplayRecord；DEFAULT_GAME_CONFIG、validateGameConfig；RunMachine；Xorshift32；FixedTickClock。

- RunMachine.startNewRun() 生成递增 runId；dispatch(runId, command) 返回 accepted/reason/events。advanceTick(runId) 只推进活跃且未暂停的局。jumpId 在机器实例内跨局递增。状态为只读快照；事件只在成功操作返回，不保留无限历史。
- 输入拥有者是 adapter 提供的不透明 source 字符串。Charge/Release/Cancel 必须匹配，短于最小蓄力取消，Pause 中断蓄力并以 ready 恢复。外部异步工作必须携带 runId 和 jumpId；回主页、新局、终局后无效。
- Land 接收阶段02提供的 target/current/miss 分类；Award 接收阶段02计算的 points/streak，本阶段仅验证上下文和去重，不实现几何、弹道、平台生成或奖励公式。target 必须先 Award 再 CompleteLanding；current 不可得分。
- 固定时钟 advanceFrame(deltaSeconds) 每次最多5tick；超过预算则整个帧冻结，保留 pendingSeconds。resume() 仅解除暂停并忽略下一帧 delta（背景时间），不清积压；积压通过 stepPending() 在显式暂停下逐批处理后再恢复。reset() 仅用于中止旧局并清空时钟。
- 表现层消费 DomainEvent，不可反向改写快照、JumpPlan 或逻辑坐标。JumpPlan 由后续规划器创建并冻结；此阶段只定义结构。

验证：`tests/jump/README.md` 的独立严格 TS 编译与 Node 断言，不依赖项目构建或 Creator。父级适配器新局应同时 reset 时钟并清理输入/动画/音频；本模块不宣称已做 Creator 运行或视觉验证。
