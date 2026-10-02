# view：角色、平台、相机与阶段04反馈

AvatarView逻辑根为脚底，Visual基准offset=-rawFootY。蓄力压缩/空中旋转只作用Visual，根位置来自解析规则渲染插值；脚底局部补偿随压缩保持接触。ContactShadow停留于台面并随高度缩放，不用于碰撞。

PlatformView按PlatformSpec设置台面根/scale/矩形或圆元数据。PlatformPool复用阶段01包装，按精确Prefab引用替换模型，最多8包装，保留有限历史与预告；回收清metadata、Tween/回调、局部变换与材质实例，未使用共享材质修改。原GLB只读。

CameraFollow成功落地后按模拟tick在0.25秒平移，充能与飞行保持相机不变。对角正交角度/缩放固定，构图以当前/目标中点加既有offset；预告不要求全部可见。UI由场景Canvas负责。阶段03JumpUI仅消费唯一Gameplay的phase/score/best，拥有四页面显隐、数字字体与7个Button监听的bind/unbind；无第二状态机，不改规则。Shade的Widget拥有尺寸，Graphics按真实UITransform绘制暗罩；页面内容Widget锚定，图片RAW尺寸+等比scale；不写工具合同readonly尺寸字段。

## 阶段04接口与所有权

`FeedbackTimeline.ts`无cc依赖，仅消费DomainEvent、模拟秒与只读比例。时间：蓄力起始ease 0.08秒、起跳舒展0.12秒、落地缓冲0.18秒、中心闪光0.35秒、分数脉冲0.45秒。翻转绕与锁定水平跳向垂直的水平轴完成一圈；Visual同时旋转rawFootY补偿，以逻辑脚底为pivot，head/body原GLB不改。无Tween、timeout、粒子池或新增节点；每事件类型仅保存一个最大jumpId，拒绝重复与旧run。

组合根（父级集成）在同一drainEvents循环调用`avatar.consume(e, state.runId)`、`ui.consume(e, state.runId, gameplay.foot)`、`background.consume(e, state.runId)`。追加渲染参数：`avatar.render(foot,q,flightRatio,topY,simulationSeconds,plan?.directionXZ)`，`ui.render(phase,score,best,firstJump,storageError,simulationSeconds)`。秒采用`(tick+alpha)*fixedStepSeconds`，事件tick默认1/60秒；paused不要追加宿主dt/alpha，Timeline也通过Paused固定采样秒。旧四/五参数render保留可编译，但未传模拟秒无法启用阶段04时间动画。

newRun与home需**显式**调用`avatar.resetFeedback(runId)`、`ui.resetFeedback(runId)`、`background.reset(runId)`，因为Gameplay.home会清空事件队列，不能指望Returned到达视图。清理调用`avatar.clear()`、`ui.clearFeedback()`及`background.destroy()`；JumpUI.disconnect/onDestroy自动复位分数与清闪光。reset不是销毁背景帧。

JumpUI复用score Label节点已有scale；connect捕获基准，不改文字位置/监听数量。中心光环需要父级通过领域工具在HUD中创建/绑定**一个**Graphics+UITransform子节点至`centerFlash`，绑定现有WorldCamera至`worldCamera`；不能运行时addComponent/new Node。consume Scored时提供真实落地foot副本，每帧由实际Camera.convertToUINode投影，不假定宿主栏/屏幕尺寸。没有这两个引用则不绘制中心反馈，不代表中心预览通过。

`new BackgroundView(gradientSprite, textures)`：textures必须按gradient_0..6的**Texture2D子资源**顺序绑定。构造只创建7个运行时SpriteFrame，不写Asset或改变源图导入。首色5，每4个唯一Scored按[5,0,1,2,3,4,6]循环；无PRNG接口。reset保留7帧；clear/destroy为幂等终结清理、恢复原SpriteFrame并释放自己帧，不销毁Texture。gradient沿用既有RAW/CUSTOM尺寸与Widget布局，需Creator预览核对。

ContactShadow沿用已有节点，仅高度缩放与位置补偿；无新增平台阴影。未取得该renderer材质实际effect/property及实例接口合同，**未实施随高度alpha**，不得猜uniform或修改共享材质；父级需解除Inspector阻塞后核实并集成。

验证：`sh tests/jump/run-stage04-view-tests.sh '<当前授权scratch>/stage04-view-test' --evidence`，复跑去掉`--evidence`，仅cc mock+真实core，JSON为`docs/验收证据/阶段04视图测试.json`，第一次独占创建，不覆盖历史。覆盖30/60/120模拟秒、pause/旧run/20reset、7帧释放、Visual脚底补偿、R11千平台历史hash及真实core落点一致。测试不证明Creator渲染/材质透明度/灯光/节点引用正确；真实Preview、保存重开与截图由父级执行。
