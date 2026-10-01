# 组件强依赖、模板引用与组合顺序

## 适用场景

适用于添加或删除组件、使用 UI/物理/后处理模板、修复缺失引用，以及审查“组件存在但功能不工作”的节点。

## 决策规则

### 先区分三类关系

1. **同节点强依赖**：源码 `@requireComponent(X)`；添加组件时引擎会补齐缺失的 X。
2. **模板序列化引用**：Prefab 把字段指向子节点或其它组件；手工加组件不会自动生成这些目标。
3. **功能组合**：没有装饰器强制，但要实现完整行为仍需其它组件、资源、Layer 或项目设置。

验证时必须分别检查，不能把“组件自动补齐”误当成“所有引用已绑定”。

### 已交叉验证的强依赖

| 组件 | 强依赖 | 说明 |
|---|---|---|
| `RenderRoot2D` | `UITransform` | Canvas 继承 RenderRoot2D，因此模板和添加组件会具备 UITransform |
| `Layout` | `UITransform` | Layout 需要容器尺寸 |
| UI 渲染组件 | 通常为 `UITransform` | 以当前组件源码/添加结果为准，不从父节点推断 |
| `PostProcessSetting` | `PostProcess` | `BlitScreen` 继承它，旧后处理路径添加时会补 PostProcess |
| Constant Force / 3D Constraint | `RigidBody` 功能依赖 | 先确认装饰器与当前物理后端，再验证节点结果 |

### 模板引用示例

- Button：`Button._target`。
- ScrollView：`_content`、滚动条；ScrollBar：`_scrollView`、`_handle`。
- ProgressBar：`_barSprite`。
- Slider：`_handle`。
- Toggle：`_checkMark`、可选 `_toggleGroup`。
- PageView：`_content`、`_indicator`。

这些引用来自模板序列化数据；在空节点上手工添加同名组件不会自动创建完整层级。

### 添加顺序

1. 确认模板是否已提供完整组合。
2. 无模板时先添加基础数据/Transform 依赖。
3. 添加渲染、碰撞或容器组件。
4. 创建并绑定引用目标。
5. 最后添加业务脚本、事件与动态资源。

## 推荐结构

```text
交互按钮
ButtonRoot [UITransform, Sprite, Button, BusinessScript]
└─ Label [UITransform, Label]

旧管线自定义后处理
PostProcessRoot [PostProcess, BlitScreen]
└─ BlitScreen.materials[] -> 后处理材质
```

在 3.8.4+ 新 Builtin Pipeline 中，后处理通常配置在 Camera 的 `BuiltinPipelineSettings`，不要照搬第二个结构。

## 反模式

- 看到依赖组件被自动添加，就假设子节点引用也已绑定。
- 认为 Canvas 的所有后代自动获得 UITransform。
- 删除依赖组件后不检查依赖者；`@requireComponent` 不代表删除会级联修复所有状态。
- 为静态碰撞体无条件添加 RigidBody。
- 同时添加旧 PostProcess 组件和新 BuiltinPipelineSettings，却不确认当前管线。

## 验证清单

- [ ] 每个依赖结论已区分强依赖、模板引用或功能组合。
- [ ] 强依赖组件位于同一节点且启用状态正确。
- [ ] 序列化引用非空并指向预期 Node/Component/Asset。
- [ ] 业务脚本使用前对可空引用有保护。
- [ ] 组件删除、禁用或复制后重新验证引用。
- [ ] 当前渲染/物理后端与组合匹配。

## 适用条件

- 组件装饰器可能随 3.8.x 补丁变化；精确强依赖以目标安装版本源码和实际添加结果为准。
- `BlitScreen -> PostProcess` 适用于旧 Full-Screen Post Process 路径；3.8.4+ Builtin Pipeline 优先检查 `BuiltinPipelineSettings`。
- 只有 Collider 的 3D 节点可作为静态刚体参与碰撞，不必为所有静态环境添加 RigidBody。

## 一手来源

- Creator 3.8.4 引擎源码：`render-root-2d.ts`、`layout.ts`、`post-process-setting.ts`、`blit-screen.ts`
- Creator 3.8.4 内置 UI Prefab 模板
- [RenderRoot2D](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/renderroot2d.html)
- [Full-Screen Post Process](https://docs.cocos.com/creator/3.8/manual/en/render-pipeline/post-process/)
- [Physics Components](https://docs.cocos.com/creator/3.8/manual/en/physics/physics-component.html)

