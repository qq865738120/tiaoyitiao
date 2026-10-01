# 视觉复核与诚实结论

脚本只能证明给定字节在给定合同下的指标，不能证明 actual 真来自正确场景，也不能证明目标状态正确。用 Creator/Preview/Runtime 证据核查这两件事。

## 复核记录

在实际看到原始参考、实际截图、对照图后，用 Write 保存本轮 `visual-review.json`，与 assessment 并列；不可预填 passed。

```json
{
  "schema": "game-agent.ui-visual-review/v1",
  "case_id": "settings",
  "run_id": "run-001",
  "assessment_sha256": "stdout报告hash",
  "reference_sha256": "报告中的原图hash",
  "actual_sha256": "报告中的实际图hash",
  "measurement_id": "settings-full-game-v1",
  "media_observed": ["实际可见媒体身份或路径"],
  "status": "unavailable",
  "findings": [],
  "known_project_differences": [],
  "unverified": ["自然触发路径"]
}
```

status 仅 `passed` / `failed` / `unavailable`。没有收到像素、来源漂移、缺少目标画面或不确定时 unavailable 并写明原因。findings 记录具体区域/内容/影响，不能只写“整体不错”。未读报告原字节或来源已变不能沿用hash绑定；重新运行并复核新图。

检查项：

- 页面/弹框正确，真实列表项数与状态一致，主要元素完整；空壳、隐藏按钮、错误选中态应失败。
- 文字内容/换行/裁切、关键图标、字体、按钮/滑杆及交互态；细小错字可能不影响总分但影响验收。
- 比例、位置、遮罩覆盖、背景、层级、对齐和留白；不能用局部高分盖过全屏差异。
- 合理学习版/本地化差异有项目依据，仍保留在数值评分中；不复原用户排除的商业功能来追分。

## 最终判定

只有身份/目标状态证据有效、`assessment.status == evaluated`、未舍入score达到实际阈值、`metric_pass == true` 且绑定本报告的 `visual.status == passed` 才能通过。脚本不输出整体 passed 字段，模型负责这条 AND，不允许 OR。

| 情况 | 结论 |
|---|---|
| 分数92，但“回收”按钮缺失 | 视觉失败，整体未通过 |
| 分数79.9999，视觉看起来接近 | 数值未通过，不能按显示80通过 |
| 报告90，但只收到图片路径没有像素 | 视觉不可评估，整体未完成 |
| score=null/超时/依赖缺失，模型觉得约85 | 不得用估分补齐，明确无法评估 |
| 上轮通过，本轮截图/状态已变化 | 上轮失效，重跑受影响部分 |
| 全部用例中有一项失败 | 逐项报告，不能均分或删除用例结案 |

有修复授权则针对差异修正真实实现并继续；仅核对则交付准确未通过报告，列出修复建议。合理修改参考/范围/阈值时说明依据、创建新measurement版本并保留旧结果，不追溯改写失败。

最终报告应能从 case/run 定位 scene/Prefab、状态、参考/实际原图、measurement、assessment、visual-review 与采集证据。分别标明脚本单元测试、真实 Provider 调用、Creator版本、save/reopen、自然触发、build/真机是否实际运行。别把一种证据当成另一种；不为了重复结案而重跑仍有效的证据。
