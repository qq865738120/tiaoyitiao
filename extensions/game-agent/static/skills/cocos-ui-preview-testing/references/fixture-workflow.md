# 公共场景、状态与隔离

## 归属和复用

先读取项目规则并用 CreatorInspect 确认文档类型、persisted/untitled、dirty、资产 UUID。用户未保存的修改不能被静默丢弃；不要把 untitled 根节点 UUID 当作场景资产。场景切换会丢数据且没有授权处理时，保留现场并说明需要用户决定什么。

通过 AssetSearch / AssetInspect 发现专用场景和目标 Prefab。目录存在不代表归属本技能。manifest 推荐字段：

```json
{
  "schema": "game-agent.ui-preview-fixture/v1",
  "owner": "builtin:cocos-ui-preview-testing",
  "scene": {"path": "db://assets/__agent_preview_testing/__AgentPreviewTesting.scene", "uuid": "真实场景UUID"},
  "controller": "assets/__agent_preview_testing/scripts/AgentPreviewTesting.ts",
  "cases": [{"id": "settings", "prefab_uuid": "真实PrefabUUID", "measurement_id": "settings-v1", "last_run": null}]
}
```

manifest 不是资产真相。重用前复验 UUID、控制器和文件归属；无 manifest、有同名用户内容或 UUID 冲突时不要覆盖/删除。根据工具证据恢复归属，无法恢复则说明冲突并选明确隔离的替代位置，记录偏离原因。

## 场景与控制器

用 DocumentCreate / DocumentOpen、PrefabInstantiate、NodeCreate、ComponentManage、DocumentSave 等实际工具。先复用真实可见的 Canvas、Camera、Layer、设计分辨率与适配策略。不得因为截图尺寸不同就改项目设计分辨率。普通 TypeScript 可 Write/Edit，再通过 AssetDB 刷新和 ComponentDescribe 确认编译/挂载合同；Scene/Prefab/meta 只能经 Creator 工具。

准备前查看项目真实打开页面/弹框的代码与宿主层级，分别记录 pageHost、modalHost/dialogContent、背景、遮罩的父节点、世界缩放、UITransform、安全区域、适配组件，以及遮罩颜色/透明度和层级。Prefab身份正确不代表显示合同正确：正式弹框若独立挂在未缩放的安全区域，就不能为方便复用页面的缩放容器；也不能在已适配的祖先和子节点重复缩放。用运行态祖先/目标变换及边界核对这些关系。夹具改变了关系时，先修正夹具并只重采受影响用例，保留旧失败证据；不能把夹具差异归因于正式UI，也不能挑得分更高的挂载方式。

测试控制器按项目公开接口适配，避免一个假定所有 UI 都支持的通用 `show()` 模板。建议把每个用例拆为：

1. `cleanup`：销毁旧实例、取消 timer/tween、解除本用例事件和数据订阅，恢复测试环境。
2. `prepare`：创建合法内存档案/服务、加载真实资源和依赖，固定时间、随机种子和动画采集时点。
3. `mount`：实例化真实页面、弹框和真实背景，调用实际展示/绑定接口；保留其依赖列表、列表项 Prefab、字体及 SpriteFrame。
4. `ready`：等待资源/字体/布局完成和预期动态项数成立，公布只读 `caseId`、`ready`、`stateVersion`、预期与实际项数。优先项目现有观测接口；需要扩展时遵循 RuntimeInspect 的 test_state 合同。
5. `capture`：状态与像素同时成立后截图。延时若无条件保证，不等同于 ready。

最小隔离示意（不是可直接挂载的项目实现）：

```ts
// 具体类型、资源引用、接口必须来自项目与 ComponentDescribe。
await previousCase?.cleanup();
const fixture = makeLegalInMemoryProfile(caseConfig);
const page = instantiate(realPagePrefab);
projectCompatiblePageHost.addChild(page); // 父节点及适配职责已对照正式挂载路径确认。
page.getComponent(ProjectPageView).bind(fixture, callbacks);
await waitForProjectResourcesAndLayout();
assertExpectedDynamicItems();
publishReadOnlyTestState({ caseId, ready: true, stateVersion });
```

不得通过改私有字段绕过初始化、删除真实依赖或关掉本应显示的节点来迎合效果图。授权允许的固定数据可进入真实展示接口；必须说明这验证的是展示状态，不是苛刻条件的自然触发。

## 存档和生命周期

优先纯内存 ProfileStorage。确需持久化时使用本 run 专有命名空间，记录创建内容；不加载/重置玩家真实存档。只清理自己创建且身份可证的状态，切换、取消、异常时都解除监听。重复 R02/R14 等动态用例应显示新配置，而不是上次剩余列表。

场景/脚本留作下次复用。temp 位于 assets 外，避免截图被导入和进入构建。不要将测试场景加入正式入口/构建列表；项目已有自动收集规则时核查是否需要排除测试资产，不能自行改发布配置。清理 Creator 资产用 AssetManage；不以 Bash 删除正文留下 meta。保留验收证据直到用户明确要求清理。

## 证据复用与影响范围

source Prefab、依赖、测试状态、测量合同和 actual 原字节均未变化时，可复用已有有效结果。只改报告说明不要求重新运行整个游戏。修改共享字体/布局/控制器会影响多个用例，应扩展到受影响项。save/reopen、自然触发、真机等要求各自留证，不能由单张截图推断。
