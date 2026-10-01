---
id: cocos-3.8-api-reference-vec3
version: "3.8"
category: api-reference
title: Vec3
keywords:
  - Vec3
  - 向量
  - 坐标
  - 位置
  - 距离
  - 插值
  - 移动
related_docs:
  - recipes/camera-follow-target.md
  - troubleshooting/coordinate-conversion-wrong.md
  - api-reference/camera.md
related_api:
  - Vec3
  - Vec2
  - Vec4
  - Quat
  - Mat4
source:
  official: "Cocos Creator 3.8 官方文档 - 向量计算"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Vec3

## 用途

Vec3 是 Cocos Creator 3D 空间中最重要的向量类型，用于表示位置、方向、缩放等三维坐标信息。Vec3 是**值类型**（赋值是复制不是引用），所有运算都不改变输入对象本身，而是通过 `out` 参数返回结果。

## 所属模块

```ts
import { Vec3 } from 'cc';
```

## 公开导出结论

- `Vec3` 在 `cc` 模块以 `export class Vec3 extends ValueType` 公开导出。
- 构造函数 `constructor(x?: number, y?: number, z?: number)`，默认值为 `(0, 0, 0)`。
- 公开属性：`x`、`y`、`z`（类型均为 `number`）。
- 公开静态常量：`Vec3.ZERO`、`Vec3.ONE`、`Vec3.UP`、`Vec3.RIGHT`、`Vec3.FORWARD`。
- 所有运算方法均为静态方法，通过 `out` 参数接收结果。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `x` | X 轴分量 | 横向位置/方向 |
| `y` | Y 轴分量 | 纵向位置/方向 |
| `z` | Z 轴分量 | 深度位置/方向 |
| `length()` | 向量长度（实例方法） | 计算距离/向量模长 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `Vec3.set(out, x, y, z)` | 设置向量分量 | 复用 Vec3 对象赋新值 |
| `Vec3.clone(a)` | 克隆向量 | 复制向量值 |
| `Vec3.add(a, b, out)` | 向量加法 `out = a + b` | 位置偏移计算 |
| `Vec3.subtract(a, b, out)` | 向量减法 `out = a - b` | 方向/距离计算 |
| `Vec3.multiplyScalar(a, s, out)` | 向量数乘 `out = a * s` | 缩放方向向量 |
| `Vec3.negate(a, out)` | 向量取反 `out = -a` | 反向方向 |
| `Vec3.normalize(a, out)` | 向量归一化 `out = a/|a|` | 获取单位方向向量 |
| `Vec3.cross(a, b, out)` | 向量叉乘 `out = a x b` | 计算垂直向量 |
| `Vec3.dot(a, b)` | 向量点乘 | 计算夹角/投影 |
| `Vec3.distance(a, b)` | 两点间距离 | 判断到达/追击距离 |
| `Vec3.lerp(a, b, t, out)` | 线性插值 `out = a + (b-a)*t` | 平滑移动/跟随 |
| `Vec3.angle(a, b)` | 两向量夹角（弧度） | 方向判断 |
| `Vec3.equals(a, b)` | 判断向量近似相等 | 位置到达判定 |
| `Vec3.zero()` | 将向量置零（实例方法） | 重置位置 |

## 高频代码

### 创建 Vec3

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('Vec3CreateExample')
export class Vec3CreateExample extends Component {
  start() {
    // 通过构造函数
    const pos = new Vec3(1, 2, 3);

    // 使用常量
    const zero = Vec3.ZERO.clone();    // (0, 0, 0)
    const one = Vec3.ONE.clone();      // (1, 1, 1)
    const up = Vec3.UP.clone();        // (0, 1, 0)

    // 从节点获取位置
    const worldPos = this.node.worldPosition.clone();
  }
}
```

### 位置偏移（移动节点）

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('Vec3MoveExample')
export class Vec3MoveExample extends Component {
  update(dt: number) {
    // 获取当前位置
    const curPos = this.node.position;

    // 计算偏移量：向右前方移动（复用临时对象避免 GC）
    const offset = new Vec3(1, 0, 1);
    Vec3.multiplyScalar(offset, offset, dt * 5); // 速度 5 单位/秒

    // 设置新位置
    const newPos = new Vec3();
    Vec3.add(newPos, curPos, offset);
    this.node.setPosition(newPos);
  }
}
```

### 距离判断

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Vec3DistanceExample')
export class Vec3DistanceExample extends Component {
  @property
  target: Vec3 = new Vec3(0, 0, 0);

  update(dt: number) {
    const dist = Vec3.distance(this.node.worldPosition, this.target);
    if (dist < 2.0) {
      // 已经接近目标
      console.log('Reached target!');
    }
  }
}
```

### Vec3 对象复用（性能优化）

```ts
import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('Vec3PoolExample')
export class Vec3PoolExample extends Component {
  // 声明为成员变量，避免每帧创建新对象
  private _tempVec3 = new Vec3();

  update(dt: number) {
    // 复用 _tempVec3，不产生新对象
    Vec3.set(this._tempVec3, 1, 0, 0);
    Vec3.multiplyScalar(this._tempVec3, this._tempVec3, dt * 10);

    const newPos = new Vec3();
    Vec3.add(newPos, this.node.position, this._tempVec3);
    this.node.setPosition(newPos);
  }
}
```

## 关联类型说明

Cocos 中还有其他向量/变换类型（本卡片不展开详述）：

| 类型 | 用途 | 说明 |
|---|---|---|
| **Vec2** | 2D 坐标、UI 坐标 | Vec3 的二维版本，用于 UI 系统和 2D 场景 |
| **Vec4** | 四维向量 | 颜色 RGBA 存储、齐次坐标等 |
| **Quat** | 四元数旋转 | 表示 3D 旋转，避免万向锁 |
| **Mat4** | 4x4 变换矩阵 | 组合位置/旋转/缩放的变换矩阵 |

## 常见错误

1. **每帧 `new Vec3()` 导致 GC 压力**：在 `update` 中每帧创建新的 `Vec3` 会产生大量临时对象，触发 GC 卡顿。**应该将 Vec3 声明为成员变量复用**。

2. **误认为 Vec3 是引用类型**：Vec3 是**值类型**，以下写法无效：
   ```ts
   // ❌ 错误：pos 只是拷贝，不会影响节点位置
   const pos = this.node.position;
   pos.x = 10;

   // ✅ 正确：需要 set 或者将新值赋回
   const pos = this.node.position.clone();
   pos.x = 10;
   this.node.setPosition(pos);
   ```

3. **忘记使用 `clone()` 导致意外修改**：直接赋值 `const a = b` 在普通对象中是引用，但 Vec3 的赋值行为可能让开发者误以为已复制。使用 `clone()` 确保安全复制。

4. **`out` 参数传入 null/undefined**：所有静态方法的 `out` 参数必须是非 null 的 Vec3 实例。

5. **`equals()` 使用浮点数比较**：`equals()` 使用默认的浮点容差比较，如需严格相等直接比较 `x/y/z`。

## 关联任务

- [相机跟随目标](../recipes/camera-follow-target.md)
- [坐标转换错误排查](../troubleshooting/coordinate-conversion-wrong.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 向量计算
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
