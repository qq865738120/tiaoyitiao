# app

GameBootstrap为阶段01组装空壳：校验场景绑定及配置，提供后续生命周期入口，不运行蓄力、弹道或计分。静态节点与Prefab引用由Creator编辑保存，不运行时加载.glb。

接口：编辑器绑定WorldCamera、Avatar、当前/目标平台；阶段01无玩家输入。

测试：纯规则见tests/jump；本模块需Creator注册、挂载、保存重开及真实Preview。后续阶段扩展前重读本README。
