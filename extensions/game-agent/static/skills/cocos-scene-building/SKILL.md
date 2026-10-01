---
name: cocos-scene-building
description: Cocos Creator 3.7 及以上版本 Scene、Prefab、UI 与 2D/3D 节点树的创建、改造、审查和真实 Preview 验收；纯 API 查询、脚本语法和非场景知识改用 cocos-doc-skill。
metadata:
  game-agent-display-name: "Cocos 场景搭建"
  game-agent-invocation: "auto"
  game-agent-version: "3.1.0"
---
# Cocos 场景搭建

把 Scene/Prefab 搭建视为“证据 → 结构计划 → 原子 mutation → 写后复验”，不要把工具成功等同于视觉完成。

先核对实际 Creator 版本。参考资料仍保留 3.8 官方文档、3.8.4 源码与模板的来源标签；在 3.7 项目中通过宿主目录、ComponentDescribe、保存重开和 Preview 验证能力，不假定较新组件或配置存在。

## 按任务规模读取

简单唯一 UI、已知节点的小修改可直接执行下述基本流程，无需先读取重复通用资料或撰写复用报告。已确认目标、可用组件合同和验证方式后停止调查并实施；同一有效上下文中不重复查询相同合同。

复杂改造或陌生项目读 [预检与复用](references/preflight-and-reuse.md)，需要展开验收时读 [验证清单](references/verification-checklist.md)。稳定重复结构或已有原型复用，必须在首次大量节点写入前读取 [Prefab 策略](references/prefab-strategy.md)。其它页面只读取当前任务命中的主题，使用 Skill 返回的可见 `package_root` 与 `Read`。

2D 小游戏、Canvas、Graphics/Label 的首次可见结构应核对 UITransform、Canvas/RenderRoot2D 父链、节点 Layer 与 Camera Visibility。新建 Camera 还要明确投影、相机位置和裁剪范围：仅添加 cc.Camera 组件的默认节点不保证能看到 z=0 的 UI。优先复用项目已有且可见的 UI 相机；自行创建时通过 ComponentDescribe 确认字段，再配置正交投影和面向 UI 的位置。多渲染根、排序、Mask 或复杂组合再读 [2D 场景组合](references/2d-scene-composition.md)。首次结构完成即看真实画面，再扩展玩法。

混合背景 Sprite 与 Graphics 时，优先让 Background、Gameplay、HUD 成为按绘制顺序排列的兄弟节点。普通2D遍历先提交父节点渲染组件，再遍历子节点；不透明背景子节点会盖住父Graphics，`setSiblingIndex(0)`仅调整子节点间顺序。导入背景后立即确认道路、角色或棋子与操作控件仍清晰可见；数值变化不能替代这些画面检查。

新建屏幕 UI 可直接复用内置 Canvas：`CreatorCatalogSearch(catalog="node_templates",query="Canvas")` → `AssetInspect(ref=返回的asset_ref)` → `PrefabInstantiate(prefab_asset_uuid=真实UUID,unlink_prefab=true)`。这条路径会保留模板内的 Canvas、Widget 和 Camera 绑定；随后定点读取并在其下创建内容。不要先徒手重造默认 Canvas/Camera 再补黑屏。目录中有匹配的2D版本时优先选它，无需把其它同名模板全部展开。

难触发弹框、独立 Prefab 预览或定量效果图核对，按需激活 `Skill({ skillId: "builtin:cocos-ui-preview-testing" })`。复用仍有效的真实画面，无需为形式重建测试场景；夹具视觉通过不替代自然触发路径或玩法验收。

## 1. 预检与证据

1. 用 `CreatorInspect` 确认当前文档的 none/untitled/persisted 状态、类型、dirty 和节点树。只有 persisted 提供 asset UUID；未保存根 UUID 不能当作资产身份。
2. 根据目标查询相关资产；路径或 UUID 已明确时直接 `AssetInspect`，需要发现候选才用 `AssetSearch`。简单唯一结构在有限查询足以支持实施后停止，不穷举无关资源。复杂复用任务再按名称、同义词、类型与用途分轮查询，并记录返回数、截断、停止理由与未覆盖范围。查询失败记录为 `search-failed(reason)`，不得解释为零候选。
3. 未知组件/项目脚本用 `CreatorCatalogSearch` 发现 `cid`；已知内置组件可直接 `ComponentDescribe` 验证合同，不必再次搜索同名目录。需要内置模板时才查询 node_templates。
4. 需要写组件属性时，先用 `ComponentDescribe` 获取属性 shape、默认值、引用类型与约束。新建场景任务先用 `DocumentCreate` 建立目标文档，再描述组件、构造节点；无需在干净 Untitled 中先做缺少实例的组件预检。
5. 对参考图或生成图，用 `Read` 读取像素对应的 MediaPart；资产名、UUID 和路径只能证明身份，不能替代视觉证据。

参考驱动任务还必须通过 `Read` 读取 [参考驱动视觉搭建](references/reference-driven-visual-building.md)，建立“参考区域 → 候选素材 → 目标父节点 → 布局/尺寸所有者 → 验证画面”映射。相关候选仍是 identity-only 时，不得开始正式写入。

## 2. 结构计划

包含玩法时，先列出实际存在的状态、玩家输入与预期变化，再实施控制器。多步骤游戏将关键验收项写入 canonical Task 并持续更新；按玩法结果拆分，不按工具调用建单。静态场景无需玩法状态表。

写入前明确：

- 当前可复用资产与目标节点树；每个相关候选标记 `adopted(reason)`、`excluded(reason)` 或 `identity-only`，查询成功且全部不合格时才记录 `no-qualified-candidate(reason)`；
- 每个语义容器真实拥有的直接子节点；
- 有实际复用需要时按已有项目 Prefab → variant/nested Prefab → 第三方/挂载资产 → Creator 内置模板 → 新 Prefab → 一次性节点评估；唯一标签、控制器或临时原型可以直接用普通节点，无需逐层写跳过理由；
- Layout、Widget、Transform、UITransform、Label/Sprite 尺寸的唯一所有者；
- 预期组件 `cid`、属性来源、资源引用和最终复验方式。

## 3. 文档与节点 mutation

- 新建文档用 `DocumentCreate`；切换文档用 `DocumentOpen`；保存时传权威文档身份给 `DocumentSave`。
- 连贯的新结构优先一次调用 `NodeCreate` blueprint。blueprint 内用 `key/ref` 表达同调用生成节点、组件和资源之间的引用，不先创建空壳再逐字段修补。
- 普通空节点挂到 Canvas 下不会仅因父子关系自动添加 `UITransform`；UI 节点应使用受控模板或显式声明所需组件。
- `NodeCreate` 前必须让全部节点模板、组件和属性通过 preflight；无法预验证的字段不得混入同一 blueprint。
- 现有节点的名称、Transform、父子关系或顺序用 `NodeUpdate`；复制用 `NodeDuplicate`；删除子树用 `NodeDelete`。
- 已有组件的 add/update/reorder/reset/remove 用 `ComponentManage`。reset/remove 会覆盖状态，必须保留审批与 Undo 边界。

## 4. Prefab lifecycle

1. 普通节点树转资产：`PrefabCreateFromNode`。
2. 复用资产：`PrefabInstantiate`，保持 Creator Prefab 实例语义。
3. 实例修改写回资产：`PrefabApply`。
4. 丢弃本地覆盖：`PrefabRevert`，执行前说明会失去哪些覆盖。
5. 解除关联：`PrefabUnpack` 必须显式选择 `recursive=false` 只解除 outer，或 `recursive=true` 同时解除 nested association。

结构性重复内容优先 Prefab-first；不要用通用文件工具改写 Creator 托管的 Scene、Prefab、节点、组件或 AssetDB 状态。

## 5. 写后复验

按交付目标、实际改动与依赖选择以下证据维度，连贯修改可合并验证；它们不是每批 mutation 的固定流水线。修正后只复验失败及受影响项，保留其他有效证据；阶段与最终完成可复用同一结果。明确要求的完整验收仍须执行。

1. 需要核对结构或引用时，用 `CreatorInspect` 定点查询受影响节点、组件与引用；工具已验证的字段结果可支持对应结构事实，不代替视觉或玩法结论。
2. 有待保存修改时用 `DocumentSave` 保存，检查返回的文档身份与 dirty 验证；缺少必要事实才补查，要求持久化证明时再 save/reopen。
3. 视觉结果需要补证时，用 `PreviewOpen` 连接当前 Creator Preview 或复用本轮运行，再用 `PreviewObserve` 查看目标画面。运行身份已清理时重新 open，不能把失效身份用于后续操作。
4. 交互或运行态语义需要证据时，用 `PreviewInteract`、`RuntimeInspect`、`RuntimeInteract`、`RuntimeWait`。对交付范围内新增或受影响的状态转换记录“前态 → 玩家输入 → 实际后态”。初始开始、暂停后继续、结束后重开是候选检查项；修改共享状态或输入逻辑时覆盖受影响的键盘与屏幕按钮分支，检查相关分数、位置和按钮文字。完整游戏交付仍覆盖其实际存在的关键分支，不能用一条分支替代另一条；局部颜色或布局修改不自动触发完整玩法回归。实时游戏先用正常暂停冻结前态，确认按键有效后，将恢复、操作、再次暂停合并为同一 keyboard batch，再读取结果，避免思考间隔继续下落或移动。
5. 存在相关异常、加载风险或验收要求时，用 `DebugInspect`/`DebugDiagnose` 核对相应日志、网络或性能问题；必要时 `ArtifactManage` 引用截图/诊断产物。

需要规划落子、路径或连锁行为时，先用 RuntimeInspect 获取足以判断的业务状态，再计算下一批真实输入并核对结果。状态不足时按 RuntimeInspect 的 `test_state` 发布协议补充只读观测；连续尝试未达目标应调整观测或策略，不把本地尚未解决的验收方法直接记为外部阻塞。

导入图片时用 `AssetInspect` 核对实际 importer 和 SpriteFrame 等子资产，再按真实目录和子资源路径加载；SVG 设计源或普通 Asset 不等于可用纹理。资源相关 warning、组件引用和真实画面都要核对，不能只看 error 日志为空。

Preview 不可用时，视觉任务必须保持未完成或明确阻塞；先按工具错误恢复运行，只有确实依赖当前无法获得的宿主或用户输入时才记录阻塞和解除条件。结构查询、保存 receipt 和无报错不能替代真实画面。

## 按需读取路由

| 任务 | 读取 |
|---|---|
| UI / Layout / Widget | `references/ui-layout-and-adaptation.md`、`references/2d-scene-composition.md` |
| 内置节点模板 | `references/built-in-templates.md` |
| 组件依赖与引用 | `references/component-dependencies.md` |
| 2D 小游戏、Graphics/Label、Canvas、2D 世界与渲染 | `references/2d-scene-composition.md` |
| 3D 世界、相机、灯光 | `references/3d-scene-composition.md`、`references/rendering-camera-lighting-postprocess.md` |
| 物理与碰撞 | `references/physics-and-feature-compositions.md` |
| Prefab 复用/嵌套 | `references/prefab-strategy.md` |
| 参考图驱动 | `references/reference-driven-visual-building.md` |
| 性能与场景审查 | `references/performance-lifecycle-and-scene-splitting.md` |
| 证据适用性与交付边界 | `references/evidence-and-applicability.md` |

## 完成输出

分别报告：预检范围与查询轮次、候选台账和采用/排除理由、截断/停止/未覆盖状态、最终节点/Prefab 结构、mutation transaction/Undo、CreatorInspect 复验、Preview/Runtime/Debug 证据，以及未运行的 Creator GUI、save/reopen、真机、部署或视觉验收。不得把自动化测试冒充这些证据。
