---
id: cocos-3.8-api-reference-color
version: "3.8"
category: api-reference
title: Color
keywords:
  - Color
  - 颜色
  - RGBA
  - 透明度
  - 颜色设置
  - UI颜色
related_docs:
  - api-reference/sprite.md
  - api-reference/label.md
  - api-reference/vec3.md
related_api:
  - Color
  - Sprite
  - Label
source:
  official: "Cocos Creator 3.8 官方文档 - 颜色"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Color

## 用途

Color 用于表示 RGBA 颜色值，适用于节点颜色设置、Sprite 颜色叠加、Label 文字颜色、粒子颜色等场景。Color 各分量的取值范围为 **0-255 整数**（非 0-1 浮点数）。

## 所属模块

```ts
import { Color } from 'cc';
```

## 公开导出结论

- `Color` 在 `cc` 模块以 `export class Color extends ValueType` 公开导出。
- 构造函数 `constructor(r?: number, g?: number, b?: number, a?: number)`，默认值为 `(255, 255, 255, 255)`。
- 公开属性：`r`、`g`、`b`、`a`（类型均为 `number`，范围 0-255）。
- 公开静态常量：`Color.WHITE`、`Color.RED`、`Color.GREEN`、`Color.BLUE`、`Color.BLACK`、`Color.YELLOW`、`Color.ORANGE`、`Color.CYAN`、`Color.MAGENTA`、`Color.TRANSPARENT`、`Color.GRAY`。
- 所有运算方法均为静态方法，通过 `out` 参数接收结果。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `r` | 红色分量 (0-255) | 设置/读取红色值 |
| `g` | 绿色分量 (0-255) | 设置/读取绿色值 |
| `b` | 蓝色分量 (0-255) | 设置/读取蓝色值 |
| `a` | 透明度分量 (0-255, 0=全透明, 255=不透明) | 设置透明度 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `Color.clone(c)` | 克隆颜色 | 复制颜色值 |
| `Color.set(out, r, g, b, a)` | 设置颜色分量 | 复用 Color 对象赋新值 |
| `Color.fromHEX(hex, out)` | 从 HEX 字符串解析颜色 | 从 Web 色值设置颜色 |
| `Color.toHEX(c)` | 转换为 HEX 字符串 `#RRGGBB` | 导出颜色值 |
| `Color.toCSS(c)` | 转换为 CSS 字符串 `#RRGGBB` | 调试输出 |
| `Color.add(a, b, out)` | 颜色分量相加 | 颜色叠加效果 |
| `Color.lerp(from, to, ratio, out)` | 颜色线性插值 | 渐变过渡动画 |
| `Color.equals(a, b)` | 判断颜色近似相等 | 颜色到达判定 |
| `Color.hexToColor(out, hexString)` | 将 HEX 字符串转换为 Color | 从外部数据设置颜色 |

## 高频代码

### 创建和设置颜色

```ts
import { _decorator, Component, Color, Sprite } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ColorCreateExample')
export class ColorCreateExample extends Component {
  start() {
    // 构造函数创建
    const red = new Color(255, 0, 0);       // 纯红色 (完全透明)
    const semiTransparent = new Color(255, 0, 0, 128); // 50% 透明红色

    // 使用预定义常量
    const white = Color.WHITE.clone();
    const black = Color.BLACK.clone();
    const transparent = Color.TRANSPARENT.clone();

    // 从 HEX 字符串
    const hexColor = new Color();
    Color.fromHEX(hexColor, '#FF8800');
  }
}
```

### 修改 Sprite 和 Label 颜色

```ts
import { _decorator, Component, Color, Sprite, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ColorUISetExample')
export class ColorUISetExample extends Component {
  @property(Sprite)
  iconSprite: Sprite | null = null;

  @property(Label)
  titleLabel: Label | null = null;

  setHighlight(highlight: boolean) {
    if (highlight) {
      // 设置精灵颜色叠加
      if (this.iconSprite) {
        this.iconSprite.color = Color.YELLOW;
      }
      // 设置标签颜色
      if (this.titleLabel) {
        this.titleLabel.color = new Color(255, 200, 0);
      }
    } else {
      if (this.iconSprite) {
        this.iconSprite.color = Color.WHITE;
      }
      if (this.titleLabel) {
        this.titleLabel.color = Color.WHITE;
      }
    }
  }
}
```

### 颜色渐变（lerp）

```ts
import { _decorator, Component, Color, Sprite } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ColorLerpExample')
export class ColorLerpExample extends Component {
  private _elapsed = 0;
  private _tempColor = new Color();

  @property(Sprite)
  progressSprite: Sprite | null = null;

  update(dt: number) {
    if (!this.progressSprite) return;

    this._elapsed += dt * 0.5;
    const t = (Math.sin(this._elapsed) + 1) / 2; // 0-1 来回

    // 红色到绿色渐变，复用 _tempColor
    Color.lerp(Color.RED, Color.GREEN, t, this._tempColor);
    this.progressSprite.color = this._tempColor;
  }
}
```

### 设置透明度（渐隐效果）

```ts
import { _decorator, Component, Color, Sprite } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ColorFadeExample')
export class ColorFadeExample extends Component {
  private _fadeProgress = 1;
  private _tempColor = new Color();

  @property(Sprite)
  fadeSprite: Sprite | null = null;

  update(dt: number) {
    if (!this.fadeSprite) return;

    this._fadeProgress -= dt * 0.5;
    if (this._fadeProgress <= 0) {
      this._fadeProgress = 0;
    }

    // 从完全不透明到全透明：a 从 255 到 0
    const alpha = Math.floor(this._fadeProgress * 255);
    Color.set(this._tempColor, 255, 255, 255, alpha);
    this.fadeSprite.color = this._tempColor;
  }
}
```

## 常见错误

1. **颜色范围混淆（0-255 非 0-1）**：Color 的 `r/g/b/a` 取值范围是 0-255 整数。如果将 0-1 的浮点数直接赋值，颜色会异常（值太小导致几乎全黑）。
   ```ts
   // ❌ 错误：0.5 会被当作 0，导致黑色
   color.r = 0.5;

   // ✅ 正确：0-255 范围
   color.r = 128;  // 大约 50% 红色
   ```

2. **忘记 `clone()` 导致意外共享引用**：从常量（如 `Color.WHITE`）直接赋值不复制，修改会污染常量。
   ```ts
   // ❌ 错误：修改了 Color.WHITE 全局常量
   this.node.color = Color.WHITE;
   this.node.color.r = 100;  // 其他引用了 Color.WHITE 的地方也变了

   // ✅ 正确：克隆后再修改
   const c = Color.WHITE.clone();
   c.r = 100;
   this.node.color = c;
   ```

3. **HEX 字符串格式不对**：`Color.fromHEX()` 要求 `#RRGGBB` 或 `RRGGBB` 格式，不包含透明度（`#RRGGBBAA` 不支持，需手动设置 a）。

4. **对象复用不当**：Color 也是值类型，需要复用临时对象避免 GC 压力，特别是在 `update` 循环中。

## 关联任务

- [Sprite API 卡片](./sprite.md)
- [Label API 卡片](./label.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 颜色
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
