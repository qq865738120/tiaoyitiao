# jump 模块

仅单人核心玩法，分阶段实施；原 assets/resources/jump 只读，不依赖微信/Three.js。

- core：无 cc 的配置、类型、状态机、随机、固定tick与事件生命周期；纯测试在 tests/jump。
- app：GameBootstrap 组装和销毁边界；阶段01只静态场景空壳，不绑定蓄力玩法。
- view：脚底/台面与Visual分离，模型映射与材质引用属于表现，不从阴影计算碰撞。
- adapters：未来输入、时钟、音频和本地存储的Creator适配；当前不实现。
- scenes/JumpMain.scene：World、正交WorldCamera、分层UI根；必须通过Creator保存重开与Preview检查。
- prefabs/jump：角色及平台包装；materials/jump：独立材质副本，禁止覆盖原GLB。

规则验证使用 tests/jump/README.md 所述命令；场景验证必须另行Creator Preview，纯测试不能代替外观。
