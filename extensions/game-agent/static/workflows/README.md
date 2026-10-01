# static/workflows

发布包内置工作流目录。每个子目录是一个独立 package，入口固定为 `workflow.json`；定义只引用同一 package 内显式列入资源闭包的相对文件。

- `workflow.schema.json`：由 `source/domain/workflows/schema.ts` 生成的 draft-2020-12 结构合同，不手工编辑。
- `ui-image-to-prefab/`：V2 内置工作流；以意图识别、四象限合成图、视觉树解析、Python 切割/透明拆分和确定性 Creator 3.8 Prefab 编译完成 UI 生成。目录只保留 V2 脚本与 Pillow/NumPy 锁文件，不随包携带旧 OCR/LPIPS/ONNX/字体或 Node 私有依赖。

修改定义结构后运行 `npm run workflow:schema`，并用 `npm run workflow:schema:check` 验证生成物零差异。
