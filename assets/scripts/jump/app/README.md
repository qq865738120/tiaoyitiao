# app：阶段01组装边界

GameBootstrap 是 Creator 场景生命周期空壳；只核验配置与声明引用，不实现阶段02跳跃或阶段03UI。
core 的配置、状态、事件由纯TS模块拥有；app不改变规则数值。场景/Prefab/相机由Creator编辑器工具保存。

测试：tests/jump 的纯规则入口；Creator预览 JumpMain 场景核对模型、相机与保存重开。原始GLB与UUID只读，禁止运行时直接load GLB。
