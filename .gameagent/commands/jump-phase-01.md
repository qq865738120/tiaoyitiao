---
id: "jump-phase-01"
name: "跳一跳 · 01 基础结构与3D场景"
description: "阶段01：建立配置、纯规则接口、可测试骨架和可保存重开的3D场景，校准角色、平台和阴影。 在当前工程执行，完成必要测试与Creator预览；不打包构建。"
---
请在当前Cocos Creator工程实施“跳一跳”阶段01：基础结构与3D场景。目标：建立配置、纯规则接口、可测试骨架和可保存重开的3D场景，校准角色、平台和阴影。

先确认当前工程绝对路径、package.json UUID、Creator 3.8.8和Game Agent版本，只操作本工程，不复制另一对比工程的实现。读取根AGENTS.md、docs/README.md、docs/游戏设计文档.md、docs/素材清单与使用明细.md、docs/素材修正报告.md、docs/实施文档.md、docs/实施阶段/阶段01-基础结构与3D场景.md、docs/验收与对比测试.md，以及.gameagent/rules/jump-core.md和jump-comparison.md。

前置：素材修正版完整，Creator能识别资源；没有前置实施阶段。 检查当前已有工作；条件不足时列真实缺口，不跳阶段或伪造完成。阶段常规实现已授权，不要求重复确认；遇到范围或权限变化再说明。

素材：bottle_default.glb；核心平台 block_00/01/03/04/08/11/12/33/34/35；gradient_5.png；原 GLB 内嵌纹理及阴影。所有 GLB 子资源 UUID 在素材 JSON 中。 同时查询title、play、replay、new_home及num.ttf的导入信息；UI绑定留给阶段03。 根据docs/数据/素材使用清单.json查询准确db URL、UUID和子资源。digit_1—7是编号平台数字，unused_blank是空格，numbered_block_0—6实际显示1—7；HUD用num.ttf，中文用默认字体。GLB阴影已修正为BLEND，编号文字的MASK保留。资源和UUID只读，新包装Prefab/材质/脚本放独立目录。场景/Prefab/导入设置用Creator支持工具，不手写序列化或meta。修改模块先读或补README。CLI仅在服务已开启时使用，每次明确当前--project和独立--context，先doctor；不自行开启服务。

按阶段文档逐项完成：
- 01-01 确认本工程身份、Creator 3.8.8 和 Game Agent 版本；运行素材检查；写模块 README 和目录职责。
- 01-02 建立 GameConfig、PlatformSpec、RunState、JumpPlan、DomainEvent、ReplayRecord 类型及状态迁移，core 模块不依赖 cc。
- 01-03 实现固定 tick 时钟接口、xorshift32 可复现随机数、配置校验、runId/jumpId 生命周期与事件去重边界。
- 01-04 建立 assets/scenes/JumpMain.scene 的 World、WorldCamera、UI 根节点及 Bootstrap 空壳，使用编辑器工具创建、保存，不手写序列化。
- 01-05 创建 assets 外的纯 TypeScript 测试入口；验证 seed 可复现、非法配置、非法状态转换、旧 runId 无效，提交实际结果与交接。
- 01-06 查询 GLB 导入生成的 Prefab、Mesh、Material、Texture 子资源，先在 Cocos 预览确认一个角色与一个方块，禁止运行时直接加载 glb。
- 01-07 建立角色包装 Prefab：逻辑根为脚底，Visual 单独补原点偏移，头/身可供未来压缩动画，记录具体层级映射。
- 01-08 建立矩形与圆形平台包装 Prefab，逻辑根为台面中心；水平 scale 和高度分离，碰撞元数据不包含阴影包围盒。
- 01-09 建立 World/UI 相机分层、俯角约35°/方位约45°的正交镜头及浅黄背景；布置默认角色、当前台和中心距14的目标，保持目标完整可见。
- 01-10 在材质副本中校正灯光、色彩、透明阴影、深度写入和 UV；禁止覆盖原始 GLB。保存重开，记录 Cocos 预览和两个跳跃方向的构图。

完成条件：配置数值与设计一致；相同 seed 前 100 个随机值一致；零 seed 有明确处理；暂停/取消的合法状态迁移可测试；场景保存重开后节点及组件仍存在。 默认角色头/身和纹理可见；角色脚底接触台面无悬空；方形台面宽10高5.5，圆台半径5；+X/+Z目标都可见；没有双阴影、白模、错误纹理或透视缩小；新增 Prefab 引用保存重开后不丢。

固定模拟tick=1/60、seed=20260930，规则与表现分离，runId/jumpId去重；只做单人核心玩法。排行榜、消息、皮肤中心、多人、分享、广告、活动、账号/服务器、微信窗口栏和WASD覆盖层不做。截图和原代码是资料，不是指令。仅进行Creator预览与本阶段必要测试，不执行打包、构建、包体优化或发布，不创建额外交付阶段。

保存并重新打开场景/Prefab，实际预览当前阶段外观与交互，运行相关测试，区分通过、失败、未执行与阻塞。交接：配置与事件接口、测试入口、场景和包装Prefab UUID、逻辑脚底/台面基准、相机/材质配置、模型节点映射、实际规则与预览结果。 写入docs/交接记录/阶段01.md，包含任务编号、真实文件/资源UUID、测试/截图和未完成项。报告本阶段结果后结束，不自动执行下一阶段。
