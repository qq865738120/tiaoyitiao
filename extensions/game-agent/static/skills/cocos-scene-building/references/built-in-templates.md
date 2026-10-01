# Creator 内置节点模板与默认绑定

## 适用场景

适用于通过 Hierarchy 创建 Camera、Canvas、Button、ScrollView、PageView、ProgressBar、Slider、Toggle、EditBox、灯光、探针、粒子和 3D 基础体等标准结构。

## 决策规则

- 创建前先查询 `CreatorCatalogSearch` 的 `node_templates`，只使用返回的受控模板名。
- 标准控件优先模板，因为模板同时提供节点层级、组件、默认资源和序列化引用。
- 工具消费链：CreatorCatalogSearch(node_templates) 的 asset_ref → AssetInspect(ref) 的真实 cc.Prefab UUID → PrefabInstantiate。普通副本设置 unlink_prefab=true；不把 URL 直接传入 prefab_asset_uuid。Creator 3.8.8 已实测此路径生成 Canvas/UITransform/Widget 与子 Camera，保留相机绑定，避免手工重造默认相机。
- 模板创建后仍需查询实际结果；内置模板是高质量起点，不是验证豁免。
- 模板与用户已有设计系统冲突时，优先复用项目 Prefab。

### Creator 3.8.4 复合 UI 模板矩阵

| 模板 | 默认结构与组件 | 关键引用 |
|---|---|---|
| Canvas | `Canvas(UITransform, Canvas, Widget) / Camera(Camera)` | `Canvas._cameraComponent -> Camera` |
| Button | `Button(UITransform, Sprite, Button) / Label(UITransform, Label)` | `Button._target -> Button` |
| ScrollView | 根 `UITransform/Sprite/ScrollView`，含 `view(Mask)/content/item` 与 `scrollBar/bar` | `ScrollView._content`、`_verticalScrollBar`；`ScrollBar._scrollView`、`_handle` |
| PageView | 根 `UITransform/Sprite/PageView`，含 `view(Mask)/content(Layout)/page*` 与 `indicator` | `PageView._content`、`_indicator` |
| ProgressBar | 根 `UITransform/Sprite/ProgressBar`，子节点 `Bar(Sprite)` | `ProgressBar._barSprite -> Bar.Sprite` |
| Slider | 根 `UITransform/Sprite/Slider`，子节点 `Handle(Sprite, Button)` | `Slider._handle -> Handle.Sprite` |
| Toggle | 根 `UITransform/Sprite/Toggle`，子节点 `Checkmark(Sprite)` | `Toggle._checkMark -> Checkmark.Sprite` |
| ToggleContainer | 容器与三个 Toggle 模板实例 | 每个 Toggle 的 `_toggleGroup -> ToggleContainer` |
| EditBox | 根 `UITransform/Sprite/EditBox`，含文本与占位 Label | 创建后核对文本/占位引用与输入配置 |

### 其它模板类别

- 3D：Camera、Cube、Sphere、Capsule、Cylinder、Cone、Plane、Quad、Torus、Terrain。
- 灯光：Directional、Ranged Directional、Sphere、Spot、Point、Light Probe Group、Reflection Probe。
- 2D/UI：Label、Sprite、RichText、Graphics、Mask、Layout、Widget、VideoPlayer、WebView、ParticleSystem2D。

## 推荐结构

```text
项目 Prefab 可用？
├─ 是：实例化项目 Prefab
└─ 否：内置模板匹配？
   ├─ 是：模板创建 → 定向修改 → 验证引用
   └─ 否：普通节点 → 按依赖顺序添加组件
```

复合模板应作为一个整体创建；不要先建空根节点，再试图逐项复刻模板。

## 反模式

- 手工创建 ScrollView 的所有子节点，却漏绑 content、ScrollBar 或 handle。
- 创建 ProgressBar/Slider 后只看到组件存在，就不检查 `_barSprite`/`_handle`。
- 认为模板节点下所有值都适合项目，跳过尺寸、Layer、资源和方向调整。
- 使用未在 `node_templates` 目录返回的猜测模板名。
- 把 3.8.4 模板精确结构当成未来版本永久 ABI。

## 验证清单

- [ ] 模板名来自当前 `node_templates` 目录。
- [ ] 节点层级和默认组件符合用途。
- [ ] 关键序列化引用非空且指向正确对象。
- [ ] Layer、UITransform、尺寸、锚点和默认资源已检查。
- [ ] 项目特有脚本和事件引用已绑定。
- [ ] 保存重开后引用仍然存在。

## 适用条件

- 表中精确结构来自 Creator 3.8.4 内置 `default_prefab`，其它 3.8.x 使用前应查询和复核。
- 普通空节点模板本身不包含 UITransform；把它放到 Canvas 下不会改变这一点。
- 模板只解决编辑期初始结构，不替代运行时数据、对象池或业务状态初始化。

## 一手来源

- Creator 3.8.4 内置 `editor/assets/default_prefab` 模板序列化数据
- [Canvas Component Reference](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/canvas.html)
- [Layout Component Reference](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/layout.html)
