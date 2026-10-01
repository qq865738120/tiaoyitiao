# 参考驱动视觉搭建

## 适用场景

适用于由效果图、截图、概念图、样例场景或指定素材集合驱动的 Scene、Prefab、UI、2D/3D 搭建。首次写入前必须证明模型看过参考和所有相关候选，并建立视觉到真实结构的映射。

## 决策规则

1. 用 `Read` 实际查看参考像素，记录可用尺寸、宽高比、分区、层级、遮挡、对齐线和交互区域；无法获得精确尺寸时明确标记未知。
2. 用 `AssetSearch` 建立参考相关候选集，再用 `AssetInspect` 核对身份。每个候选继续用 `Read` 读取像素并标记 `visual-read`，或基于证据标记 `excluded(reason)`；不得把 `identity-only` 当完成。
3. 为每个参考区域确定素材、组合方式、真实语义父节点、直接子节点、Prefab/模板/普通节点策略、Layout/Widget/Transform/UITransform/Sprite/Label 的唯一尺寸所有者。
4. 参考、候选、目标树或尺寸所有权任一缺失时，只允许继续只读取证；不得开始正式写入。

## 视觉里程碑

视觉里程碑按[验证清单](verification-checklist.md)选择必要证据。新建或调整结构时，用 `CreatorInspect` 比较受影响的计划树与实际树；有未保存修改时用 `DocumentSave`。缺少当前目标画面证据时，用 `PreviewOpen` 连接或复用 Preview，以 `PreviewObserve` 观察。交互与日志只在目标或改动涉及相应语义、风险时补查；修正后保留不受影响的通过证据。

记录“期望 → 实际 → 差异 → 根因 → 修正动作 → 复验”。没有发现差异也要保留画面、viewport 与已取得的相关日志事实；记录已有证据不要求新增检查。

## 推荐结构

证据表至少包含参考区域、视觉目标、候选素材、证据状态、已知尺寸/透明边界、组合方式、目标父节点和布局/尺寸所有者。差异表绑定实际 `PreviewObserve` 画面或 ArtifactRef。

## 反模式

- 只看参考，不看实现素材；或只读取最终选中的一个候选。
- 根据文件名、UUID、类型或目录直接决定素材用途。
- 先创建大量节点，再补证据表和目标树。
- 把 mutation receipt、无日志或编辑器静态结构当成视觉完成。
- 不能启动 Preview 且没有等价视觉观察时仍宣称效果已完成。

## 验证清单

- [ ] 参考像素和画布事实已读取。
- [ ] 候选集完整，全部为 `visual-read` 或 `excluded(reason)`。
- [ ] 每个区域已映射到素材、组合、真实父节点和尺寸所有者。
- [ ] 当前里程碑已有目标画面及受影响结构、保存、行为或日志的必要证据，无关证据未被要求重新采集。
- [ ] 差异已归因与复验；无法观察时保持未完成或阻塞。

## 适用条件

大型素材库按参考区域分批读取，但不能降低相关候选必须读取或明确排除的要求。图片被缩放时可做内容分析，精确尺寸和透明边界仍以可信元数据为准。

## 一手来源

- [Scene Editing](https://docs.cocos.com/creator/3.8/manual/en/concepts/scene/scene-editing.html)
- [Prefab](https://docs.cocos.com/creator/3.8/manual/en/asset/prefab.html)
- [UI 适配与 Widget](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/widget.html)
- Game Agent：`Read`、`AssetSearch`、`AssetInspect`、`CreatorInspect`、`PreviewOpen`、`PreviewObserve`、`DebugInspect`
