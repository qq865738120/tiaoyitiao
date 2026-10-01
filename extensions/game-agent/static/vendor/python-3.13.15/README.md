# 固定 CPython 供应元数据与许可材料

本目录只随包发布固定供应清单与上游许可文本，不打包开发机 Python、venv、wheel 或缓存。运行时消费者共享 source/tools/base/python-runtime，解释器在用户项目局部准备。

catalog.json 与 TypeScript 产品目录必须一致；closure.json 绑定全部许可/清单文件。更新供应必须重新核验准确 bytes/hash、解包闭包、各消费者 wheel/API 和原生/Creator 矩阵。

来源为 python-build-standalone 固定标签 20260901。upstream-licenses 保留上游提供的完整许可材料（可能包含本目标未链接的库），不将此材料存在等同于已完成所有目标的分发许可审查。
