# 固定纯色抠图算法 v1

产品公共 Python 算法闭包，使用 Pillow/NumPy。入口 processor.py 消费一个宿主JSON请求，写入固定PNG与JSON报告；核心 matting.py 只计算像素，不读取Workflow/Provider/Skill状态。

原生透明区域RGBA保持；全不透明纯色输入采用实际采样底色、连续Alpha、保边细化和正则去混合；不使用Alpha64全局截断。可疑Alpha、复杂背景和低置信度结果返回review_required。空图须调用方预先许可。

closure.json 覆盖入口、模块、profile、requirements.lock及LICENSES.md。更改任何闭包文件后更新摘要并运行闭包/金标测试。算法实现由本项目编写，研究资料仅参考数学方法，不复制第三方keyer源码。坐标使用存储像素，输出不旋转或缩放。
