# adapters：输入、本地存储与音频边界（阶段02—04）

InputAdapter统一触摸、鼠标左键、空格为press/release/cancel。物理down集合用于拒绝重复按下，单owner只有core接受press后才获得；竞争输入释放不会释放owner。暂停/新局清owner但保留仍按下键的隔离状态，必须真实松开再按下。解绑清全部。

全局input不依赖节点传播，所以按下先显式命中UI Button/EditBox/BlockInputEvents的UITransform；不得以BlockInputEvents会阻止全局input为假设。全屏模态可由blocked回调阻断键盘。浏览器表单焦点阻断空格。阶段03 app已提供完整单人页面闭环，实际接线与验证见`docs/交接记录/阶段03.md`；InputAdapter仍仅负责输入边界。

失焦、visibilitychange、Game.EVENT_HIDE统一通知app暂停；蓄力取消，飞行冻结，恢复由玩家P/开发控制显式触发。生命周期bind/unbind一一配对，不启动外部服务、不引用微信/Three。

验证：tests/jump规则owner/取消/暂停测试；Creator真实鼠标/键盘/浏览器触摸输入和UI区域验证。未实测的物理触摸终端单列，不以代码通过冒充。

## StorageAdapter（阶段03）

职责：无cc依赖、无网络的本工程整数最高分；仅访问固定key `jump:4856b445-bfe4-49c2-8933-59e229f06792:best:v1`，不复制其他工程存档。`StoragePort`提供同步`getItem(key):string|null`、`setItem(key,value):void`、`removeItem(key):void`；父级以`new StorageAdapter(sys.localStorage)`注入，不在模块内访问全局存储。

接口：只读`key`、`best:number`、`lastError:string|null`；`record(score):boolean`、`reset():boolean`。存档格式为JSON number（写出十进制整数），缺失返回0；损坏、JSON字符串/对象/数组、负数、非有限或非整数回退0。读取异常被捕获并暴露固定错误码，不带外部异常正文。无效record返回false，不改变最高分；有效record取max，已持久化且未增加时返回true且不写入。

写失败返回false、不throw；本次内存最高分保留，并标记待写，下次有效record（即使较低）重试写最高分。重开不依赖写入成功；内存分只在同一Adapter实例内保留，重新加载前未写入的值不能保证持久化。`lastError`在成功写入/重置后清空，无写入的record保留上一错误。

reset仅移除此key；remove成功才清内存best/待写标记，失败返回false并保留原最高分与待写状态，便于重试。调试入口是否仅开发模式可见由父级负责。

测试：`tests/jump/stage03-tests.ts`用可注入故障StoragePort执行R13和core生命周期R12；编译/执行命令见tests README。真实sys.localStorage跨Preview存档、UI、输入监听/Tween/音频清理由父级另行实测；阶段03没有音频验收。

## AudioAdapter（阶段04）

职责：普通class消费core DomainEvent，不修改规则、不绑定全局输入或场景；父级注入owner Node及13个Inspector AudioClip：`{intro,loop,success,combos:[combo1,...,combo8],fall,start}`。只使用这组核心音效，不使用fall_2/perfect/pop，不加载整个resources。

接口：`new AudioAdapter(owner, clips)`；`enableFromGesture():void`在真实玩家手势回调调用（UI开始/重开及世界输入均由父级接线），仅开启音频门、不补播旧事件；`reset(runId):void`在新局同步清旧音；`consume(event,currentRunId):void`按权威runId隔离；`stopAll():void`供失焦/隐藏/停用；`destroy():void`销毁前调用，幂等；`snapshot()`返回纯JSON观测（请求音效不代表已听到声音）。enable不是浏览器AudioContext权限已获准的证明，须真实Preview验证。

两条独占声道（charge、feedback），最多2个已挂载AudioSource；反馈不堆叠。Charge begin：intro ENDED且源身份/run/代际仍有效才切loop；Jump/cancel取消蓄力；Paused/Returned/Failed/reset/stopAll/destroy停止所有旧音。普通Scored播放success，streak>=1按min(streak,8)选择combo；以单调jumpId水位去重，Failed每run唯一，失败/主页后拒绝旧计分和Charge。Paused后Resumed不恢复蓄力。Started每run一次，首手势前事件不补播。core的Returned带旧runId而当前状态已加1，适配器先同步权威currentRunId清旧音，再过滤事件；旧Returned不得停止新局。

初始音量charge0.35、success/combo0.55、fall0.5、start0.45，**尚未真实试听/调音**。不调用playOneShot。Creator3.8.8 audio-source.ts表明load是异步，stop在加载前只入队，clip=null使晚到player失效；同source立刻重设同clip会产生ABA身份竞态。因此每次声道播放新建专属Node/AudioSource，退役时解绑ENDED、volume=0、stop、clip=null、摘除并destroy，不复用旧source。挂载声道有硬上限，退役Node/Component由Creator帧末销毁；未完成load promise可能保留旧实例至resolve/reject，此为引擎异步生命周期，不声称网络加载已被取消。静音先于stop，防止底层播放排队阶段的迟到音。

独立测试：`sh tests/jump/audio-mocks/run.sh '<当前授权scratch>/stage04-audio-test'`。只编译真实AudioAdapter与独立cc mock、不改共享adapter mock、不构建项目；引擎加载/底层播放队列与延迟销毁模型、旧ENDED、重复事件、20新局及销毁清理均独立验证。首次证据独占写`docs/验收证据/阶段04音频测试.json`，已有报告不覆盖。mock不证明真实声学、首手势权限、失焦或Preview结果。

本轮独立执行：实际Creator声明严格noEmit检查通过；独立mock编译/执行20/20、466断言通过，首次证据已创建。初次scratch配置因相对types路径报TS2688，改为本工程绝对声明路径后通过，失败及恢复已保留在报告。未执行真实试听/Preview/Inspector接线。

父级调用顺序示例（需在组合根实现，本模块没有代为接线）：
```ts
const audio = new AudioAdapter(owner, { intro, loop, success, combos, fall, start });
// 必须来自真实玩家输入回调，先于Started/Charge事件消费；不调用于自动update。
audio.enableFromGesture();
audio.reset(gameplay.state.runId); // 新局创建后、事件消费前
audio.consume(event, gameplay.state.runId); // 每个drainEvents事件仅一次
// 失焦/切后台/停用先停止；onDestroy最终释放。
audio.stopAll();
audio.destroy();
```
`JumpGameplay.state`是已核实的只读getter；gameplay为父级实例变量示意。owner/clips由父级真实Inspector引用提供，不以变量名猜资源身份。
