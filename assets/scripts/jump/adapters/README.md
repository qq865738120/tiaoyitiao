# adapters：Creator边界

后续承接输入、音频、本地存储及渲染帧到core固定时钟的适配；阶段01不实现玩家输入/UI/音频。固定时钟契约定义于core，无cc依赖；暂停恢复不得追加后台时间。

测试：assets外tests/jump固定tick测试；后续Creator适配需独立真实预览。不得引用微信/Three.js SDK或在线服务。
