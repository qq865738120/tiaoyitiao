# 2D 场景组合

## 适用场景

用于屏幕 UI、2D 世界、TileMap、角色与特效、世界空间 UI、Sorting2D、Mask 和 2D 批处理问题。

## 决策规则

1. 2D 可渲染组件需要 `UITransform`，并位于 `RenderRoot2D` 子树。`Canvas` 是常用的屏幕 UI 根，但不是唯一 RenderRoot2D。
2. 普通空节点成为 Canvas 后代不会仅因父子关系自动获得 UITransform；应通过 UI 模板或显式添加需要它的组件建立依赖。
3. 节点 `Layer` 必须包含在目标 Camera 的 Visibility 中，否则结构正确也不会显示。
4. 同一 RenderRoot2D 下，优先通过层级和兄弟顺序组织稳定绘制顺序；跨层级精确排序再使用 `Sorting2D`。
5. 将世界、交互、特效、HUD 和弹窗拆成职责稳定的根节点，避免脚本依赖易变的深层路径。
6. 共享材质、纹理图集和连续层级有利于 UI 合批；Mask、Graphics、自定义材质和 UIMeshRenderer 等会形成批次边界。

## Sprite 背景与 Graphics 混合

Creator 3.8.8普通2D遍历会先提交当前节点的渲染组件，再依次遍历子节点。不透明Sprite放在带Graphics的父节点下时，会覆盖父Graphics；对背景执行`setSiblingIndex(0)`只影响兄弟之间的顺序。将背景、玩法Graphics和HUD放在独立兄弟层，再调整兄弟顺序。使用Sorting2D、Mask或定制管线时应复核实际排序，不能直接套用普通遍历结论。

素材加载后做一次可见性验收：至少出现一个真实角色/棋子/塔与相应道路或棋盘，操作控件在背景上清晰可读；核对实际位置与业务状态一致。背景显示、建塔扣款或对象计数增加都不能单独证明玩法图形可见。

## 推荐结构

```text
Scene
├─ World2DRoot               # RenderRoot2D / Canvas，按项目用途选择
│  ├─ Background
│  ├─ Terrain
│  ├─ Actors
│  ├─ GameplayEffects
│  └─ WorldUI
├─ ScreenCanvas              # 屏幕空间 UI
│  ├─ HUD
│  ├─ Panels
│  └─ ModalLayer
└─ Systems                   # 不参与显示的场景级控制节点
```

重复的敌人、掉落物、特效和世界提示应优先使用 Prefab；高频对象再配合节点池。

## 反模式

- 把“UI 必须在 Canvas 下”当作绝对规则。
- 只检查节点 active，不检查 Layer 与 Camera Visibility。
- 为每个 Sprite 创建独立材质实例，导致本可连续的批次被拆散。
- 依靠大量 Z 坐标猜测 2D 绘制顺序，却不检查层级、兄弟顺序和 Sorting2D。
- 把所有世界对象、HUD 和系统脚本堆在一个扁平根节点下。
- 为规则重复对象复制整棵节点树而不抽取 Prefab。

## 验证清单

- [ ] 每个 2D Renderable 的父链是否到达 RenderRoot2D。
- [ ] 关键节点是否具有 UITransform。
- [ ] 节点 Layer 与目标 Camera Visibility 是否相交。
- [ ] 绘制顺序是否通过层级/兄弟顺序或 Sorting2D 明确表达。
- [ ] Mask 与滚动裁剪是否只包围必要区域。
- [ ] 相邻 UI 是否共享可合批的纹理和材质。
- [ ] 高频实例是否使用 Prefab/节点池，而不是运行时反复深度创建销毁。

## 适用条件

- 适用于 Creator 3.8.x 2D/UI 渲染。
- 多 Camera、跨 RenderRoot2D 或定制渲染管线下，排序与合批需要结合实际 DrawCall 和 Frame Debugger 复核。

## 一手来源

- [2D 渲染基础](https://docs.cocos.com/creator/3.8/manual/en/2d-object/2d-render/index.html)
- [RenderRoot2D](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/renderroot2d.html)
- [Sorting2D](https://docs.cocos.com/creator/3.8/manual/en/engine/rendering/sorting-2d.html)
- [UI 合批](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/engine/ui-batch.html)

- Creator 3.8.8 引擎源码：`cocos/2d/renderer/batcher-2d.ts` 的 `Batcher2D.walk`，普通分支先 `_handleUIRenderer` 再遍历 `children`；Sorting2D分支另行收集排序。
