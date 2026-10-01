# jump/core（阶段01）

职责：无 `cc` 依赖的规则契约、配置单一来源、确定性随机数、生命周期/状态迁移与固定 tick 时钟。阶段01不实现平台生成、弹道求解、碰撞分类或奖励公式。

## 接口

- `types.ts`：GameConfig、PlatformSpec（判别联合）、RunState、JumpPlan、DomainEvent、ReplayRecord。世界坐标 X/Z 平面、Y 向上，逻辑脚底/台面独立于 Visual。
- `config.ts`：`DEFAULT_GAME_CONFIG` 为唯一运行数值源；`createGameConfig` 校验、复制并冻结配置，零 seed 归一为 1。修改有效玩法数值时必须更新 configVersion 和对比条件。
- `random.ts`：`Xorshift32.nextUint32/next`，平台流与视觉流应各用实例；初始两平台不得消费平台随机流。
- `state-machine.ts`：`RunStateMachine.dispatch` 返回接受/拒绝、快照与本次事件；`advanceTick` 只推进未暂停的有效局。`start` 新建 run，`home` 废止 run；jumpId 在每个新 run 从 1 起，必须连同 runId 使用。`launch` 接受阶段02计算的 plan，不计算距离。旧 run/jump、非拥有者、非法阶段拒绝且不产生事件。
- `JumpEventBoundary`：每个活动 jump 的 Scored/Failed 各最多一次。机器 `claimJumpEvent` 只预留得分发布资格，不计算奖励、不更新 score/streak；阶段02须将资格申请、分数更新、Scored 发布合并成原子业务操作，不能把此骨架当成计分实现。Failed 在 finishFall 中自动去重发布。
- `clock.ts`：`FixedTickClock.advanceFrame(deltaSeconds,onTick)` 每帧最多 5 tick。积压超过限额时本帧零 tick 并冻结，保留全部待处理时间。显式 resume 后，以每帧最多 5 tick 排空既有积压，排空期间忽略新墙钟时间。普通 pause 保留小数余量；resume 忽略首帧 delta，禁止补后台时间。onTick 中可同步 pause（例如状态暂停时）。
- `index.ts`：统一出口。表现/适配层只持有快照与回调 token，不改写状态。

## 状态和集成约束

menu → ready → charging → airborne → landing → recentering → ready；current 落点经 finishLanding 直接 ready；airborne → falling → gameover。暂停使用 paused 包装状态；charging 暂停先取消并把恢复态设为 ready，其他活动阶段保存原态。所有局内命令携带 runId，异步落地/相机/失败命令另携 jumpId。回主页与新局清除输入、plan 和去重记录。

应用需同时调用机器 pause/resume 和时钟 pause/resume，重开时 clock.reset；绑定音频/Tween 清理仍属 adapters/view。`guardCallback` 拒绝暂停与旧代际，但不能替代 dispatch 的阶段检查。台面分类及新平台 ids 均由阶段02注入。场景逻辑 topY 不由模型包围盒推断。

## 测试

从工程根按 `tests/jump/README.md` 独立编译和运行。测试只覆盖阶段01契约，不证明 Creator 预览、完整跳跃、几何碰撞或奖励算法通过。
