# adapters：Creator输入边界（阶段02）

InputAdapter统一触摸、鼠标左键、空格为press/release/cancel。物理down集合用于拒绝重复按下，单owner只有core接受press后才获得；竞争输入释放不会释放owner。暂停/新局清owner但保留仍按下键的隔离状态，必须真实松开再按下。解绑清全部。

全局input不依赖节点传播，所以按下先显式命中UI Button/EditBox/BlockInputEvents的UITransform；不得以BlockInputEvents会阻止全局input为假设。全屏模态可由blocked回调阻断键盘。浏览器表单焦点阻断空格。当前app只提供阶段02开发控制，不实现阶段03完整页面。

失焦、visibilitychange、Game.EVENT_HIDE统一通知app暂停；蓄力取消，飞行冻结，恢复由玩家P/开发控制显式触发。生命周期bind/unbind一一配对，不启动外部服务、不引用微信/Three。

验证：tests/jump规则owner/取消/暂停测试；Creator真实鼠标/键盘/浏览器触摸输入和UI区域验证。未实测的物理触摸终端单列，不以代码通过冒充。
