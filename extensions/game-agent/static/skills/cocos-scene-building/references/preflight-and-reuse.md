# 场景预检与复用决策

## 适用场景

用于复杂场景改造、陌生项目或多种候选资源的复用决策。简单唯一 UI 和已知节点的小修改使用 SKILL.md 中的基本流程；在身份、组件合同与验收方式足够时即可实施，无需展开本页的完整候选台账。

## 决策规则

1. 用 `CreatorInspect` 确认当前文档是 Scene 还是 Prefab，记录 `asset_uuid`、dirty 状态、根节点和 compact 树。文档切换后旧节点 UUID 失效，必须重查。
2. 用 `AssetSearch` 按名称、语义同义词、类型和用途分轮搜索，再用 `AssetInspect` 核对候选身份、依赖和必要 meta；候选按项目 `db://assets/` → 第三方/挂载来源 → 内置 `db://internal/` 闭合。显式 `pattern` 不会自动扩展范围：先完成项目候选台账，确需 fallback 时再显式查询下一来源。每轮记录来源范围、查询词、返回数量、截断、停止理由和未覆盖范围，不得只搜一个精确名称，也不得把首屏没有某来源结果解释为该来源不存在。
3. 用 `CreatorCatalogSearch(catalog="node_templates")` 查受控内置模板；组件用 components/classes catalog，并以返回的 `cid`、`asset_uuid` 或 `asset_ref` 为准。
4. 参考驱动任务对每个相关候选使用 `Read` 查看像素，记录 `visual-read`、`identity-only` 或 `excluded(reason)`。AssetDB 身份不等于视觉证据。
5. 为每个相关候选记录 `adopted(reason)`、`excluded(reason)` 或 `identity-only`。查询未成功时记录 `search-failed(reason)`，不得当作没有候选；只有查询成功、未留下截断导致的未决覆盖且相关候选均有排除理由时，才记录 `no-qualified-candidate(reason)`。
6. 按重复度、职责独立性、生命周期、变体成本、外部依赖和结构所有权，依次评估已有项目 Prefab、variant/nested Prefab、第三方/挂载资产、Creator 内置模板、新 Prefab 和一次性普通节点；跳过任一适用层必须记录理由。

## 首次写入边界

- 绿地稳定重复结构优先复用项目 Prefab；无候选时先构建并保存新 Prefab，再实例化到 Scene。
- 已有普通原型需要复用时，在第二份普通副本出现前停止；用 `PrefabCreateFromNode` 从已核验节点树抽取 Prefab 并按请求保留首实例，再用 `CreatorInspect` 复核实际源节点 UUID、资产和关联。
- 一次性、唯一、强 Scene 耦合或结构未稳定的内容可说明理由后保留普通节点。
- 参考像素、候选视觉证据、真实父子树或布局/尺寸所有者不完整时不得正式 mutation。

## 推荐结构

记录当前文档身份与风险、搜索范围/轮次/数量/截断/停止理由/未覆盖范围、项目资产候选状态、内置模板、普通素材、采用/排除理由、目标父节点、尺寸所有者，以及写后 `CreatorInspect` 和 Preview 验证点。

## 反模式

- 只看当前节点，不查项目 Prefab 和 AssetDB。
- 把 `AssetSearch` 失败、截断结果、单次精确搜索为空或首屏没有某来源解释为没有相关候选。
- 把名称、UUID、类型或路径当成已经看过像素。
- 猜组件 `cid`、模板名或资源引用。
- 先复制多份普通节点，再补做 Prefab 计划。
- 不得用通用文件工具读取序列化资产旁路，也不得用 `Write/Edit/Bash` 改写 Creator 托管序列化资产。

## 验证清单

- [ ] 当前文档类型、身份、dirty 状态和节点树已确认。
- [ ] 项目 Prefab、相关 Scene、资源、适用的第三方/挂载来源和内置模板已按来源闭合。
- [ ] 搜索范围、轮次、返回数、截断、停止理由和未覆盖范围已记录；不存在未处理的 `search-failed`。
- [ ] 参考相关候选不存在 `identity-only`。
- [ ] 每个候选有 adopted/excluded/identity-only 状态与理由；`no-qualified-candidate` 只来自成功且覆盖闭合的搜索。
- [ ] 已按项目 Prefab → variant/nested → 第三方/挂载资产 → 内置模板 → 新 Prefab → 一次性节点评估复用路径。
- [ ] 目标树、组件 shape、资源引用、尺寸所有者和写后验证点明确。

## 适用条件

Prefab Inspector 预览从 Creator 3.8.5 才提供；3.8.0 基线使用结构化工具与 Preview 证据，不假设 Inspector 能预览。工具不可用时只能报告待检查项，不能包装成项目事实。

## 一手来源

- [Prefab](https://docs.cocos.com/creator/3.8/manual/en/asset/prefab.html)
- [Scene Editing](https://docs.cocos.com/creator/3.8/manual/en/concepts/scene/scene-editing.html)
- Game Agent：`CreatorInspect`、`AssetSearch`、`AssetInspect`、`CreatorCatalogSearch`、`ComponentDescribe`、`PrefabCreateFromNode`、`PrefabInstantiate`
