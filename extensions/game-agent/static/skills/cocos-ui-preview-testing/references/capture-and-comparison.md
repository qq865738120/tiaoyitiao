# 采集与比较脚本

## 输入与测量合同

script 不联网、不读 Creator 状态，只评估提供的两张普通文件。PreviewObserve 的 canonical MediaPart 用于直接看图；ArtifactManage 取得的普通 path 才可复制给脚本。不解析 opaque ArtifactRef，不调用旧 generated-image materializer，不凭文件名猜 screenshot 路径。无法取得实际截图字节时明确缺少数值证据。

第一次测量前冻结以下 JSON。字段可按需省略；真实验收必须记录 capture、两图 hash 与 measurement_id，ROI 只在确需裁剪时给出。

```json
{
  "measurement_id": "settings-full-game-v1",
  "reference_roi": [0, 88, 794, 1412],
  "geometry_evidence": "示例：逐图确认顶栏为宿主；实际截图为完整游戏视口，无浏览器边框",
  "expected_reference_sha256": "替换为真实64位小写摘要",
  "expected_actual_sha256": "替换为真实64位小写摘要",
  "capture": {"artifact_id": "实际artifact身份", "scene_uuid": "实际测试场景UUID", "viewport": [794, 1412], "dpr": 1}
}
```

这是示例，不可把坐标、视口或说明套用到其它图。ROI `[x,y,width,height]` 使用 EXIF 校正后的像素坐标，必须保留完整目标游戏区域。透明图需明确共同 sRGB 背景 `background:[r,g,b]`；没有可靠背景返回不可比。未知比例、浏览器 chrome、留白或 DPR 不自动猜测，也不寻找“最佳区域”。

尺寸不一致需 geometry_evidence，宽高比例误差仅允许一像素舍入；实际区域尺寸必须符合 capture.viewport×dpr（每轴最多1像素）。固定以参考区域为目标尺寸，最长边最多2048，两图同用 LANCZOS；最短边至少11。不能为提高得分改变策略。

## 调用

先 PythonRuntime.check。ready 才逐字使用返回 `project_python`（相对项目根）及 Skill 返回的绝对 package_root。下例占位符必须替换，不要从项目目录拼接技能根。脚本目录只读，输出目录每轮全新且不得已存在。

sh：

```sh
"$GAME_AGENT_PROJECT_ROOT/<check.project_python>" -B "<Skill.package_root>/scripts/compare_ui.py" --reference "<原图绝对路径>" --actual "<真实截图绝对路径>" --config "<本轮measurement.json>" --output "<项目根>/__agent_preview_testing/temp/settings/run-001/assessment" --case-id settings --run-id run-001 --threshold 80 --threshold-source default
```

cmd（不是 PowerShell）：

```bat
"%GAME_AGENT_PROJECT_ROOT%\<check.project_python>" -B "<Skill.package_root>\scripts\compare_ui.py" --reference "<原图绝对路径>" --actual "<截图绝对路径>" --config "<measurement.json>" --output "<项目根>\__agent_preview_testing\temp\settings\run-001\assessment" --case-id settings --run-id run-001 --threshold 80 --threshold-source default
```

用户明确要求90则 `--threshold 90 --threshold-source user`；记录用户原要求。未指定为80。阈值须有限且在0..100内。case/run ID 为1..100位ASCII字母/数字/下划线/连字符，中文/空格文件路径受支持。运行由 Bash 超时/取消控制，给脚本留60秒以内预算并处理非零终态；不能把 Bash 的进程启动或空输出视为完成。

## 算法与依赖

只依赖 lock 中 Pillow12.0.0、NumPy2.4.1。格式按内容识别，支持单帧 PNG/JPEG/WebP、RGB/灰阶/调色板与 Alpha；多帧须显式选择静帧另建来源。EXIF自动校正；有效ICC转sRGB；无ICC普通RGB/灰阶假设sRGB并记录；CMYK无ICC、坏ICC/损坏/超限图不给分。

`ui-rgb-ssim-v1`：固定11×11 Gaussian（sigma1.5）、K1=.01/K2=.03、data_range255、总体协方差，各RGB通道算SSIM，丢弃5px边界后逐像素/通道等权平均，再 `100*clip(mean,0,1)`。与原始未舍入 score 比较阈值，显示时四舍五入不改变结论。官方 scikit-image0.25.2 的 structural_similarity 固定参数生成 [黄金值](../fixtures/ssim-goldens.json)；开发测试校准，运行时不安装 scikit-image。改公式、窗口、色彩/几何归一化需升级算法版本并重建标定，不能静默换指标。

固定3×3网格SSIM、RGB平均绝对差和边缘差只用于定位；它们不是替代门槛。相似空白、大背景或细小错字可能高分，必须视觉复核。

## 产物与失败

stdout 为单个 JSON，退出码：0=evaluated（可能低分），2=not_comparable，3=error，124=60秒内部超时。进程被取消/杀死或没有完整终态也算未完成。每图≤32MiB、≤1600万像素、单边≤8192；config≤32KiB；比较最长边≤2048；不允许脚本以超大输入无限运行。

新目录内生成：两张原字节副本、两张规范化PNG、左右对照 `comparison.png`、红色差异 `difference.png`、原子发布的 `assessment.json`。后者包括 schema、case/run、algorithm、threshold/source、measurement、配置hash、两图hash/尺寸/格式/变换、capture、分数与metric_pass、诊断和错误stage/code。stdout另带报告原字节 SHA-256；报告自身不自包含该hash。

error/not_comparable 必须 score=null、metric_pass=false。已有输出目录拒绝覆盖，失败新 run 不读取旧成功。超时/取消仅有部分文件时忽略整轮；report写失败时以进程失败为准。检查状态及本轮身份，不能仅检查磁盘存在 assessment.json。误后缀会警告但可按真实内容解码；未知背景、未确认ROI、比例错、来源hash改变都应修复输入合同/重新采集后新建run，不能吞掉错误追分。
