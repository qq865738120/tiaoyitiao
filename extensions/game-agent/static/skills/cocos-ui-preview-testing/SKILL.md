---
name: cocos-ui-preview-testing
description: Cocos Creator 中难触发弹框、页面或 UI Prefab 的独立真实预览，以及对照效果图的定量核对。建立或复用公共测试场景，注入合法固定数据，截图、计算相似度并视觉复核；不用于纯 API 查询、无参考图的普通场景修改或完整玩法验收。
compatibility: Creator 3.8.0+；PythonRuntime 管理的 CPython 3.11–3.13、Pillow 12.0.0、NumPy 2.4.1。
metadata:
  game-agent-display-name: "Cocos UI 独立预览与核对"
  game-agent-invocation: "auto"
  game-agent-version: "1.0.0"
---
# Cocos UI 独立预览与核对

目标：在真实 Creator Preview 中呈现目标 UI 的正确状态，与用户效果图比较。默认未舍入相似度 **≥80/100**；用户明确指定时使用该阈值并记录来源。完成必须同时满足有效数值达标与实际看图后的视觉复核通过。分数是固定图像指标，不是主观“还原百分比”。

## 1. 确定本次用例

先看效果图像素，确认目标 Prefab、状态、必要背景、比较范围、分辨率和用户是否授权修复。没有参考图可以报告实际预览，但不能声称通过效果图验收。复用仍有效的场景、截图和测量；目标、依赖、状态、参考图或采集合同变化时只重跑受影响部分。

激活结果的 `package_root` 是本包的唯一定位依据。首次准备夹具读 [场景与状态](references/fixture-workflow.md)，首次截图评分读 [采集与脚本](references/capture-and-comparison.md)，出结论前读 [视觉复核与证据](references/acceptance-and-evidence.md)。只在缺少对应场景知识时再激活 `builtin:cocos-scene-building`。

## 2. 建立或复用专用夹具

固定约定（相对游戏项目根）：

| 路径 | 用途 |
|---|---|
| `assets/__agent_preview_testing/__AgentPreviewTesting.scene` | 公共测试场景 |
| `assets/__agent_preview_testing/scripts/AgentPreviewTesting.ts` | 测试控制器；适配项目公开展示接口 |
| `assets/__agent_preview_testing/cases/` | 必需的运行时夹具资源 |
| `__agent_preview_testing/manifest.json` | 归属、场景 UUID、用例与证据索引 |
| `__agent_preview_testing/temp/<case-id>/<run-id>/` | 本轮配置、截图、状态、评估与复核；不进入 AssetDB |

先核查现有目录归属及当前文档 dirty 状态，再通过 Creator 专用工具建立/打开/保存/复读场景。真实实例化源 Prefab，使用合法数据和实际 `bind` / `show` / `render` 路径；弹框保留必要底层页面与遮罩，动态内容必须实际生成。核对正式挂载父节点及适配职责，保留页面与弹框各自的缩放/安全区域，不能把弹框误放进缩放页面容器。隔离玩家存档，等待资源、布局、字体和目标动画时点就绪。不能画静态仿品或直接改写 Scene/Prefab JSON。无需向源 Prefab Apply 测试覆盖。

## 3. 取得真实截图并评估

1. 启动专用场景的 Creator Preview，`PreviewOpen` 确认 active。`RuntimeInspect` 核对当前 case、ready、真实目标状态；`PreviewObserve` 取得画面。复用连接不能证明场景已切换。
2. 用 `ArtifactManage` 取得本轮截图的普通可读路径并复制精确原字节至本轮目录。保留 artifact/run/场景身份，不能把编辑器截图、效果图或以前的成功图冒充 actual。
3. 冻结测量配置和原图 hash；只依据确定的游戏边界裁剪宿主栏、依据已知 DPR 做等比例归一化。无法确认对应关系时报告 `not_comparable`，不要猜裁剪框。
4. `PythonRuntime.check(skill_id="builtin:cocos-ui-preview-testing")` ready 后，使用返回的 `project_python` 和本次 `package_root` 执行 `scripts/compare_ui.py`。not-ready 按工具返回的准备计划处理；获准安装后仍须 check。禁止自行 pip、系统 Python 或借别的技能身份安装。
5. 读取结构化结果及图像，依据下节输出结论。脚本退出0仅表示评估完成；低分仍是失败。

## 4. 双门槛与迭代

读取原始参考/实际图和对照图，检查主体、文字、按钮/列表是否缺失、状态、比例、位置、遮挡、层级、背景、留白及明确的项目差异。固定网格、颜色/边缘差异只辅助定位，不能替换主分数。即使分数≥阈值，错字、空白页、缺关键控件或错误状态也必须视觉失败；收到路径或 JSON 不算看到了像素。

保存绑定本轮报告 hash 的 `visual-review.json`。只有 `evaluated && metric_pass && visual.status == passed`，且来源/状态证据有效，才可完成。`error`、`not_comparable`、媒体不可用、超时/取消、低分或主观估分均不得写“达到要求”。

授权包含修复时，按差异修正真实 UI 并重新采集受影响用例；只要求核对时，报告未通过与原因，不擅自改正式 UI。禁止降低阈值、替换参考、删除失败用例、拉伸/模糊/涂色、裁去缺陷或多算法择最高分。合理更改测量合同须新建版本，保留原结果。

最终逐项报告：case、参考与 actual 身份、测量版本、有效分数/阈值、视觉结论、主要差异、证据路径及未验证范围。夹具通过只证明该状态的视觉表现；不代表自然触发路径、玩法、构建或真机通过。
