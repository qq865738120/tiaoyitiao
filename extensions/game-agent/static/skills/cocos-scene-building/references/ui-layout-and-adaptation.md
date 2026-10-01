# UI 布局与适配

## 适用场景

用于列表、网格、HUD、弹窗、背包、商店、滚动区、安全区和多分辨率 UI。目标不是消灭坐标，而是明确哪个系统负责写入每个轴的位置与尺寸。

## 决策规则

1. 规则排列的同级元素优先由父节点 `Layout` 管理；`Layout` 只处理直接子节点。
2. 当前节点需要贴边、居中或随父节点拉伸时使用 `Widget`。
3. 同一节点同一轴只保留一个主要写入者。Layout、Widget、Label 溢出、Sprite Size Mode、动画和脚本都可能改位置或尺寸。
4. `Layout.ResizeMode.NONE` 表示 Layout 不改容器和子项尺寸，不是裁剪；裁剪应使用 `Mask` 或 ScrollView 模板中的 View/Mask。
5. Grid 的主推进方向由 `startAxis` 决定；不要使用不存在的 `axisDirection`。
6. Label：
   - `Overflow.NONE` 会按文本调整包围盒；
   - `CLAMP` 在固定区域内裁切；
   - `RESIZE_HEIGHT` 固定宽度并调整高度。
7. Sprite：
   - `TRIMMED` / `RAW` 会依据 SpriteFrame 改写 UITransform 尺寸；
   - `CUSTOM` 保留人工或布局系统给出的尺寸。
8. 屏幕 UI 的设计分辨率与适配策略在项目设置中统一配置；不要把不存在的 Canvas 设计分辨率字段写入组件。

### 通用结构所有权

以下规则先约束真实节点树，再决定是否使用具体 UI 组件：

1. **父子所有权**：顶部栏、侧栏、底部导航、弹窗区、列表区等语义容器必须真实拥有对应直接子节点；空容器加 Canvas 直系内容不算完成分区。
2. **排列所有权**：规则列表、网格和序列由实际父容器的 Layout 或等价组织机制管理；Layout 只影响真实直接子节点。
3. **锚定所有权**：贴边、居中、拉伸和安全区适配由实际需要锚定的节点负责。
4. **自由构图所有权**：装饰、动画或不规则构图使用父级局部坐标，不用 Canvas 全局绝对坐标伪造层级。
5. **尺寸所有权**：原生素材尺寸、父 Layout、Widget、Label/Sprite、动画/脚本或显式 `CUSTOM` 中只保留一个主要尺寸写入者。

这些不变量也适用于不使用 Layout/Widget 的 2D/3D 节点树；具体 UI 组件只在 UITransform 父链中使用。

## 推荐结构

```text
Canvas
└─ SafeAreaRoot              # Widget：跟随可用屏幕区域
   ├─ TopHUD                 # Widget：顶边与左右边
   │  └─ ResourceRow         # Layout：横向排列直接子节点
   ├─ ContentRoot            # Widget：四边拉伸
   │  └─ ScrollView          # 内置模板
   │     └─ view
   │        └─ content       # Layout：纵向或网格排列
   └─ PopupLayer
      └─ Dialog              # Widget：居中；内部 Layout 分区
```

布局所有权示例：

| 节点/轴 | 位置所有者 | 尺寸所有者 |
|---|---|---|
| `SafeAreaRoot` X/Y | Widget | Widget |
| `ResourceRow` 子项 X | 父 Layout | 子项 UITransform |
| 多行文本 Y 尺寸 | 父 Layout 排序 | Label `RESIZE_HEIGHT` |
| 九宫格背景宽高 | Widget 或脚本 | Sprite `CUSTOM` |

## 反模式

- 用几十个固定坐标模拟规则列表或网格。
- 在父 Layout 改子项位置的同时，又给子项同轴 Widget 对齐。
- 把 `ResizeMode.NONE` 当作隐藏溢出内容。
- 使用 Sprite `TRIMMED` 后又假设手工宽高永久不变。
- 用 Label `NONE` 放入固定尺寸卡片，却不接受其尺寸会随文本变化。
- 每个分辨率写一套坐标分支，而不是先统一设计分辨率、Widget 和安全区。
- 创建语义容器后仍把区域内容直接放在 Canvas 根，用全局坐标模拟分区。
- Sprite 使用默认或 `CUSTOM` 尺寸，却没有记录尺寸由素材、布局还是脚本负责。

## 验证清单

- [ ] Layout 的直接子节点是否就是期望被排列的集合。
- [ ] 每个语义容器是否真实拥有目标树中计划的直接子节点。
- [ ] 每个轴的位置和尺寸是否只有一个主要写入者。
- [ ] 自由构图节点是否使用父级局部坐标，未泄漏到 Canvas 根。
- [ ] ScrollView 是否来自模板，并保留 content、Mask、ScrollBar 引用。
- [ ] 长文本、本地化文本、空文本和极端宽高比是否实测。
- [ ] Sprite Size Mode 是否与布局尺寸所有权一致。
- [ ] 安全区、横竖屏、刘海屏和最小/最大设计宽高是否验证。
- [ ] 禁用/启用子项后 Layout 是否按预期重新排布。

## 适用条件

- 适用于 Creator 3.8.x UI 系统。
- 自由拖拽、世界空间动画、曲线路径或一次性视觉构图可以使用显式坐标。
- Layout 与 Widget 可以同时存在，但必须避免对同一节点同一轴产生竞争写入。

## 一手来源

- [Layout 组件](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/layout.html)
- [Widget 组件](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/widget.html)
- [Label 排版](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/engine/label-layout.html)
- [Sprite 组件](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/sprite.html)
- [Canvas 组件](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/canvas.html)
