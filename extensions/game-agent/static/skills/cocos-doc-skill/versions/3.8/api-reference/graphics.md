---
id: cocos-3.8-api-reference-graphics
version: "3.8"
category: api-reference
title: Graphics
keywords:
  - Graphics
  - 画线
  - 画圆
  - 画矩形
  - 绘制
  - 画图形
  - GraphicsComponent
related_docs:
  - api-reference/ui-transform.md
  - ui-2d/draw-call-batching.md
related_api:
  - Graphics
  - UIRenderer
  - UITransform
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Graphics 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Graphics

## 用途

Graphics 组件用于在 UI 层程序化绘制 2D 图形，包括线段、矩形、圆形、弧线、多边形和贝塞尔曲线。它不依赖外部图片资源，适合绘制血条边框、瞄准线、小地图轮廓、自定义形状等动态图形。

## 所属模块

```ts
import { Graphics } from 'cc';
```

## 公开导出结论

- `Graphics` 在 `cc` 模块以 `export class Graphics extends UIRenderer` 公开导出，别称 `GraphicsComponent`。
- 继承自 UIRenderer 的属性：`color`（线条填充色）。
- 线条属性：`lineWidth`、`lineCap`、`lineJoin`、`miterLimit`。
- 填充/描边：`fillColor`、`strokeColor`。
- 绘制方法：`moveTo`、`lineTo`、`rect`、`circle`、`arc`、arcTo、`ellipse`、poly、`roundRect`、`bezierCurveTo`、`quadraticCurveTo`。
- 渲染方法：`fill`、`stroke`、`clear`。
- 静态枚举：`Graphics.LineCap`（BUTT / ROUND / SQUARE）、`Graphics.LineJoin`（BEVEL / ROUND / MITER）。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `lineWidth` | 线段宽度（像素） | 边框厚度 |
| `lineCap` | 线段端点样式（BUTT / ROUND / SQUARE） | 圆润线条端点 |
| `lineJoin` | 线段连接点样式（BEVEL / ROUND / MITER） | 圆角折线 |
| `fillColor` | 填充颜色（`Color` 类型） | 填充矩形/圆形 |
| `strokeColor` | 描边颜色（`Color` 类型） | 边框颜色 |
| `color` | 继承自 UIRenderer 的叠加色 | 整体色调调整 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `moveTo(x, y)` | 移动画笔到指定坐标 | 起始点定位 |
| `lineTo(x, y)` | 从当前点画线段到目标点 | 折线、多边形 |
| `rect(x, y, w, h)` | 绘制矩形路径 | 矩形框 |
| `circle(cx, cy, r)` | 绘制圆形路径 | 圆点标记 |
| `arc(cx, cy, r, startAngle, endAngle, counterclockwise)` | 绘制弧线 | 扇形、仪表盘 |
| `roundRect(x, y, w, h, r)` | 绘制圆角矩形路径 | 圆角按钮背景 |
| `bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)` | 绘制贝塞尔曲线 | 平滑曲线 |
| `quadraticCurveTo(cpx, cpy, x, y)` | 绘制二次贝塞尔曲线 | 简单曲线 |
| `poly(points)` | 绘制多边形 | 自定义形状 |
| `fill()` | 根据当前路径填充 | 实心图形 |
| `stroke()` | 根据当前路径描边 | 空心图形 |
| `clear()` | 清除所有绘制内容 | 重绘前清空 |

> 坐标是相对于 Graphics 节点本地空间的，基于节点 UITransform 的 anchorPoint。

## 高频代码

### 绘制一个红色矩形

```ts
import { _decorator, Component, Graphics, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GraphicsExample')
export class GraphicsExample extends Component {
  @property(Graphics)
  graphics: Graphics | null = null;

  start() {
    if (!this.graphics) return;

    // 绘制填充矩形
    this.graphics.fillColor = new Color(255, 0, 0, 255);
    this.graphics.rect(-50, -50, 100, 100);
    this.graphics.fill();

    // 绘制边框
    this.graphics.strokeColor = new Color(0, 0, 0, 255);
    this.graphics.lineWidth = 2;
    this.graphics.rect(-50, -50, 100, 100);
    this.graphics.stroke();
  }
}
```

### 绘制圆形血条边框

```ts
import { _decorator, Component, Graphics, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CircleBorder')
export class CircleBorder extends Component {
  @property(Graphics)
  graphics: Graphics | null = null;

  private _progress: number = 1;

  start() {
    this.drawBorder();
  }

  setProgress(p: number) {
    this._progress = Math.max(0, Math.min(1, p));
    this.drawBorder();
  }

  drawBorder() {
    if (!this.graphics) return;
    this.graphics.clear();

    // 背景圆环
    this.graphics.strokeColor = new Color(100, 100, 100, 255);
    this.graphics.lineWidth = 6;
    this.graphics.circle(0, 0, 50);
    this.graphics.stroke();

    // 进度弧
    const endAngle = this._progress * Math.PI * 2 - Math.PI / 2;
    this.graphics.strokeColor = new Color(0, 255, 0, 255);
    this.graphics.arc(0, 0, 50, -Math.PI / 2, endAngle);
    this.graphics.stroke();
  }
}
```

## 常见错误

1. **忘记调用 `fill()` / `stroke()`**：只调用 `rect()` / `circle()` 等方法仅构建路径，必须调用 `fill()` 或 `stroke()` 才会实际渲染。
2. **未调用 `clear()` 导致重叠绘制**：每一帧重新绘图前必须先调用 `clear()` 清除上一帧内容，否则新图形会叠加到旧图形之上。
3. **每帧新创建 Graphics 实例**：不需要反复 `addComponent(Graphics)`，应重用已有组件，仅调用 `clear()` + 重新绘制。
4. **坐标理解错误**：Graphics 的坐标是相对节点本地坐标系的，受 anchorPoint 影响；如果节点 anchor 在 (0.5, 0.5)，`circle(0, 0, r)` 以节点中心为圆心。
5. **过度绘制性能**：每帧大量绘制复杂路径（如数百个多边形）可能影响渲染性能，建议结合合批优化。
6. **GC 压力**：每帧 `new Color()` 或 `new Vec2()` 都会产生垃圾回收压力，推荐缓存对象复用。

## 关联任务

- [UITransform API 卡片](ui-transform.md)（坐标基于节点本地空间）
- [Draw Call 合批优化](../ui-2d/draw-call-batching.md)（Graphics 合批策略）

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Graphics 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
