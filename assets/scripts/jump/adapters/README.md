# adapters：输入与本地存储边界（阶段02—03）

InputAdapter统一触摸、鼠标左键、空格为press/release/cancel。物理down集合用于拒绝重复按下，单owner只有core接受press后才获得；竞争输入释放不会释放owner。暂停/新局清owner但保留仍按下键的隔离状态，必须真实松开再按下。解绑清全部。

全局input不依赖节点传播，所以按下先显式命中UI Button/EditBox/BlockInputEvents的UITransform；不得以BlockInputEvents会阻止全局input为假设。全屏模态可由blocked回调阻断键盘。浏览器表单焦点阻断空格。当前app只提供阶段02开发控制，不实现阶段03完整页面。

失焦、visibilitychange、Game.EVENT_HIDE统一通知app暂停；蓄力取消，飞行冻结，恢复由玩家P/开发控制显式触发。生命周期bind/unbind一一配对，不启动外部服务、不引用微信/Three。

验证：tests/jump规则owner/取消/暂停测试；Creator真实鼠标/键盘/浏览器触摸输入和UI区域验证。未实测的物理触摸终端单列，不以代码通过冒充。

## StorageAdapter（阶段03）

职责：无cc依赖、无网络的本工程整数最高分；仅访问固定key `jump:4856b445-bfe4-49c2-8933-59e229f06792:best:v1`，不复制其他工程存档。`StoragePort`提供同步`getItem(key):string|null`、`setItem(key,value):void`、`removeItem(key):void`；父级以`new StorageAdapter(sys.localStorage)`注入，不在模块内访问全局存储。

接口：只读`key`、`best:number`、`lastError:string|null`；`record(score):boolean`、`reset():boolean`。存档格式为JSON number（写出十进制整数），缺失返回0；损坏、JSON字符串/对象/数组、负数、非有限或非整数回退0。读取异常被捕获并暴露固定错误码，不带外部异常正文。无效record返回false，不改变最高分；有效record取max，已持久化且未增加时返回true且不写入。

写失败返回false、不throw；本次内存最高分保留，并标记待写，下次有效record（即使较低）重试写最高分。重开不依赖写入成功；内存分只在同一Adapter实例内保留，重新加载前未写入的值不能保证持久化。`lastError`在成功写入/重置后清空，无写入的record保留上一错误。

reset仅移除此key；remove成功才清内存best/待写标记，失败返回false并保留原最高分与待写状态，便于重试。调试入口是否仅开发模式可见由父级负责。

测试：`tests/jump/stage03-tests.ts`用可注入故障StoragePort执行R13和core生命周期R12；编译/执行命令见tests README。真实sys.localStorage跨Preview存档、UI、输入监听/Tween/音频清理由父级另行实测；阶段03没有音频验收。
