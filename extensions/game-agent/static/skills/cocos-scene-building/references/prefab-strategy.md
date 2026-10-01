# Prefab 复用、覆盖与嵌套

## 适用场景

适用于重复 UI 条目、敌人、角色、特效、交互物、关卡块、弹窗、可池化对象，以及现有 Prefab 实例改造。

## 决策规则

复用阶梯依次是：已有项目 Prefab、少量实例覆盖、稳定嵌套 Prefab、第三方/挂载资产、Creator 内置模板、新 Prefab、一次性普通节点。选择时同时检查职责闭环、重复度、生命周期、变体成本、外部依赖与结构所有权；重复度只是复用证据之一。

### 新建与转换

- 绿地稳定重复结构可用 `NodeCreate` blueprint 在权威文档中原子建立完整树，再 `PrefabCreateFromNode` 生成 Prefab；保存、重读后用 `PrefabInstantiate` 添加实例。
- 已有普通原型需要复用时，在第二份复制前停止，读取完整子树、组件、引用、Layer、局部 Transform 和可见结果；满足抽取条件后用 `PrefabCreateFromNode`，不要手写 `.prefab`。
- `PrefabCreateFromNode` 接收源节点 `node_uuid`，默认保留其结构与视觉结果并把实际节点作为第一 Prefab 实例；Creator 可能替换节点 UUID，因此必须消费返回身份并重查关联。原普通子树结构默认保持不变，但关联语义会按 `replace_source_with_instance` 明确变化。
- `PrefabApply` 把实例覆盖写回资产；`PrefabRevert` 丢弃本地覆盖；`PrefabUnpack` 解除关联。三者先说明影响范围并保留审批；当前 `rollback_supported=false`，transactionId 供审计，不能承诺 Undo 恢复原实例身份。
- 一次性、临时、唯一、强 Scene 耦合或结构未稳定时保留普通节点。

### 结构所有权

Prefab 根或语义容器必须真实拥有职责范围内的直接子节点。不要留下空命名容器，却把视觉与交互节点散落到 Scene/Canvas 根。外部场景关系使用根组件显式属性，不写死脆弱路径。

### 嵌套与覆盖

少量文本、颜色、资源、数值和启用状态适合实例覆盖；大量删除、重排或替换说明 Prefab 边界错误。嵌套只用于有独立复用价值的稳定子模块，禁止自嵌套并避免无价值深层嵌套。

## 推荐结构

```text
Enemy.prefab
├─ VisualRoot
│  ├─ ModelOrSprite
│  └─ Shadow
├─ Hitbox
└─ WorldUI
   └─ HealthBar.prefab
```

## 反模式

- 每个节点都做 Prefab，或为场景唯一装饰创建 Prefab。
- 稳定重复结构先复制多份普通节点。
- 在实例上堆积大量结构覆盖，却仍称其与模板同概念。
- 解关联后仍把节点当作可同步实例。
- 用 `Write/Edit/Bash` 修改 Prefab 序列化文件。

## 验证清单

- [ ] Prefab 资产与实例关联、覆盖和 nested association 符合预期。
- [ ] 默认资源、Layer、组件、禁用状态和外部引用正确。
- [ ] 语义容器拥有计划中的直接子节点。
- [ ] 保存重开后关联与覆盖一致。
- [ ] 转换、Apply、Revert、Unpack 均有 receipt、审批/Undo 与 `CreatorInspect` 复验。

## 适用条件

Prefab Inspector 预览不是 Creator 3.8.0 基线能力。动态大量生成时，Prefab 只解决结构复用，仍需对象池和资源生命周期设计。

## 一手来源

- [Prefab](https://docs.cocos.com/creator/3.8/manual/en/asset/prefab.html)
- [Instantiate Prefab](https://docs.cocos.com/creator/3.8/manual/en/scripting/create-destroy.html)
- Game Agent：`NodeCreate`、`PrefabCreateFromNode`、`PrefabInstantiate`、`PrefabApply`、`PrefabRevert`、`PrefabUnpack`
