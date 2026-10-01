---
id: cocos-3.8-ui-2d-screen-adaptation
version: "3.8"
category: ui-2d
title: 屏幕适配心智模型 — Canvas / Widget / UITransform 协同
keywords:
  - 屏幕适配
  - 分辨率适配
  - 设计分辨率
  - 适配模式
  - Canvas
  - Widget
  - 不同屏幕适配
  - FIXED_WIDTH
  - FIXED_HEIGHT
  - SHOW_ALL
related_docs:
  - ui-2d/canvas.md
  - ui-2d/widget.md
  - ui-2d/ui-transform.md
  - recipes/screen-adaptation.md
  - troubleshooting/ui-not-visible.md
related_api:
  - Canvas
  - Widget
  - UITransform
  - ResolutionPolicy
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - 多分辨率适配"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程建议：Canvas + Widget 是推荐适配方案"
status: draft
updated: 2026-06-17
---

# 屏幕适配心智模型 — Canvas / Widget / UITransform 协同

## 用途

解释 Cocos Creator 3.8 的屏幕适配机制：Canvas 如何将设计分辨率映射到实际屏幕，Widget 和 UITransform 如何协同实现 UI 在不同屏幕比例下正确显示。

## 核心结论

- 三层分工协作：
  - **Canvas**：定设计分辨率和适配策略，建立 UI 坐标系与屏幕的映射。
  - **UITransform**：定每个 UI 节点的逻辑尺寸，是 Widget 百分比约束的参考基准。
  - **Widget**：将节点锚定到父容器边界，按像素或百分比控制边距，自动适应父节点尺寸变化。
- **适配流程**：Canvas 按 `fitMode` 缩放 UI 坐标系 → 每个 UI 节点的 UITransform 保持逻辑尺寸不变（缩放后物理像素变化）→ Widget 按父节点 UITransform 的当前缩放后尺寸重算位置。
- 父子节点尺寸影响：父节点 UITransform 变化会使子节点 Widget 百分比边距自动重新计算。
- 选择适配模式的核心是确定哪一维度需要完整可见：
  - `FIXED_WIDTH`：固定宽度，高度自适应。适合上下可滚动的内容。
  - `FIXED_HEIGHT`：固定高度，宽度自适应。适合左右可滑动的内容。
  - `SHOW_ALL`：完整显示设计分辨率，可能出现黑边。
  - `NO_BORDER`：填满屏幕，可能裁剪内容。

## 什么时候使用

- 需要 UI 在所有目标设备上正确显示时。
- 回答"如何适配不同屏幕？""UI 位置为什么不对？"等问题。
- 项目初期确定设计分辨率和适配策略。

## 关键 API / 组件

- `Canvas.fitMode`：适配模式，类型 `ResolutionPolicy`。
- `Canvas.designResolution`：设计分辨率，类型 `Size`。
- `Widget.left / right / top / bottom`：边距值，绝对像素或百分比。
- `Widget.isAbsoluteLeft` 等：控制边距单位类型。
- `Widget.updateAlignment()`：手动刷新对齐。

## 最小示例

```ts
import { _decorator, Component, Canvas, ResolutionPolicy } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AdaptationConfig')
export class AdaptationConfig extends Component {
  start() {
    const canvas = this.getComponent(Canvas);
    if (!canvas) return;
    // 设计分辨率 1334x750（iPhone 6/7/8 逻辑尺寸）
    canvas.designResolution = { width: 1334, height: 750 };
    // 固定高度模式：宽度自适应
    canvas.fitMode = ResolutionPolicy.FIXED_HEIGHT;
  }
}
```

## 常见错误

- 不同屏幕下 UI 被裁剪或出现黑边：`fitMode` 选择不当。如果内容必须全屏可见，考虑 `SHOW_ALL`；如果必须无黑边，用 `NO_BORDER`。
- Widget 百分比约束不生效：未在父节点上设置正确的 UITransform `contentSize`，或者百分比值总和异常。
- 运行时动态改变 Canvas 设计分辨率后 UI 闪烁：调用顺序问题。先修改 Canvas 参数，再调用 Widget 的 `updateAlignment()`。
- 只修改了 Canvas 参数但 UI 布局未跟随变化：Widget 在场景加载时自动对齐一次；运行时需要手动触发对齐。

## 关联文档

- [Canvas — UI 渲染根节点](canvas.md)
- [Widget — 自动对齐与边距](widget.md)
- [UITransform — UI 节点尺寸与布局基础](ui-transform.md)
- [UI 适配完整步骤](../recipes/screen-adaptation.md)
- [UI 显示不出来排查](../troubleshooting/ui-not-visible.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - 多分辨率适配
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
- 补充：工程建议——Canvas + Widget 是推荐适配方案
