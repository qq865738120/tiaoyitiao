# Cocos UI 独立预览与核对

负责通过真实 Prefab、隔离数据与现有 Preview 核对效果图；不实现 Creator 工具、UI 框架或业务状态注入。入口为 SKILL.md，详细编排、截图合同和失败恢复在 references 中按需读取。

夹具须保留正式挂载路径的显示合同：页面、弹框、背景和遮罩各自的父节点、缩放、SafeArea与适配职责不能因统一测试根而改变。真实Prefab和ready只是必要条件；夹具引入的尺寸偏差应先修正并重采，不能归因于正式UI。

scripts/compare_ui.py 是离线确定性图片评估器，只读源图/配置，新建独占输出目录；不修改 Scene、Prefab、项目设置或玩家存档，不联网。默认评分80，用户有效阈值优先；脚本永不宣告最终视觉通过，完成还必须有模型实际看图的复核。

PythonRuntime 每次复验后提供解释器；依赖为锁定 Pillow12.0.0 / NumPy2.4.1，支持 CPython3.11–3.13。不使用系统pip，不依赖其它技能目录。许可证见 THIRD_PARTY_NOTICES.md。

修改入口、算法、测量配置或报告合同须同步参考页、合成fixture/eval、脚本单元测试和发布闭包。验证：skills:validate、UI图片脚本单测、PythonRuntime及发现/发布测试；真实Provider、Creator、保存重开与效果图验收独立记录。
