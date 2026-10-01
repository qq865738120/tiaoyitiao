---
id: cocos-3.8-api-reference-collider-2d
version: "3.8"
category: api-reference
title: Collider2D
keywords:
  - Collider2D
  - 碰撞体
  - 2D碰撞
  - BoxCollider2D
  - CircleCollider2D
  - PolygonCollider2D
  - 碰撞检测
related_docs:
  - api-reference/rigid-body-2d.md
  - recipes/detect-collision-2d.md
  - troubleshooting/collision-not-triggered.md
related_api:
  - Collider2D
  - BoxCollider2D
  - CircleCollider2D
  - PolygonCollider2D
  - Contact2DType
  - ECollider2DType
  - PhysicsSystem2D
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 2D - 碰撞体"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Collider2D

## 用途

Collider2D 是 2D 物理碰撞体的基类，定义碰撞体的形状和物理材质属性（摩擦、弹性等）。碰撞体需要与 RigidBody2D 配合使用才能产生物理碰撞响应，或单独作为传感器（sensor）检测重叠。

有 3 种内置碰撞体类型：`BoxCollider2D`（矩形）、`CircleCollider2D`（圆形）、`PolygonCollider2D`（多边形）。

## 所属模块

```ts
import { Collider2D, BoxCollider2D, CircleCollider2D, PolygonCollider2D, Contact2DType } from 'cc';
```

## 公开导出结论

- `Collider2D` 在 `cc` 模块以 `export class Collider2D extends Component` 公开导出。
- 公开属性：`tag`（标签）、`group`（分组）、`density`（密度）、`sensor`（传感器模式）、`friction`（摩擦系数）、`restitution`（弹性系数）、`offset`（位置偏移）、`body`（关联的 RigidBody2D，只读）、`worldAABB`（世界包围盒，只读）、`TYPE`（碰撞体类型枚举）。
- 公开方法：`apply()`（应用修改到物理引擎）。
- 继承的碰撞体子类：
  - `BoxCollider2D`：新增 `size`（Size）、`worldPoints`（世界坐标四个点）。
  - `CircleCollider2D`：新增 `radius`（半径）、`worldPosition`、`worldRadius`。
  - `PolygonCollider2D`：新增 `threshold`、`points`（顶点数组）、`worldPoints`。
- `ECollider2DType` 枚举在 `cc` 模块公开导出：`None`、`BOX`、`CIRCLE`、`POLYGON`。
- `Contact2DType` 对象在 `cc` 模块公开导出，包含：`None`、`BEGIN_CONTACT`（`'begin-contact'`）、`END_CONTACT`（`'end-contact'`）、`PRE_SOLVE`（`'pre-solve'`）、`POST_SOLVE`（`'post-solve'`）。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `sensor` | 是否为传感器模式（只检测不产生物理碰撞） | 触发器区域 |
| `group` | 碰撞分组 | 碰撞过滤 |
| `friction` | 摩擦系数 [0, 1] | 滑动摩擦 |
| `restitution` | 弹性系数 [0, 1] | 弹跳效果 |
| `offset` | 碰撞体位置偏移 | 调整碰撞区域 |
| `density` | 密度 | 物理质量计算 |
| `tag` | 自定义标签 | 区分多个碰撞体 |
| `body` | 关联的刚体（只读） | 获取刚体引用 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `apply()` | 应用碰撞体修改（Box2D 引擎时需要） | 动态修改碰撞体属性后更新 |

## 高频代码

### 碰撞回调监听

```ts
import { _decorator, Component, Collider2D, Contact2DType } from 'cc';

const { ccclass } = _decorator;

@ccclass('CollisionExample')
export class CollisionExample extends Component {
  start() {
    const collider = this.node.getComponent(Collider2D);
    if (!collider) return;

    // 监听碰撞事件
    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    console.log('碰撞开始');
  }

  onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    console.log('碰撞结束');
  }

  onDestroy() {
    const collider = this.node.getComponent(Collider2D);
    if (collider) {
      collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }
}
```

### 设置传感器（Trigger 区域）

```ts
import { _decorator, Component, Collider2D, Contact2DType } from 'cc';

const { ccclass } = _decorator;

@ccclass('TriggerExample')
export class TriggerExample extends Component {
  start() {
    const collider = this.node.getComponent(Collider2D);
    if (!collider) return;

    // 设置为传感器 - 只检测重叠，不产生物理碰撞
    collider.sensor = true;

    collider.on(Contact2DType.BEGIN_CONTACT, (self, other) => {
      console.log('触发区域进入');
    });
  }
}
```

## 常见错误

1. **`enabledContactListener` 未开启**：RigidBody2D 的 `enabledContactListener` 必须设为 `true`，碰撞回调才会触发。
2. **碰撞体与刚体不匹配**：Static 刚体搭配传感器无效时，检查碰撞体是否依附在正确的节点上。
3. **sensor 模式下仍期望物理碰撞**：`sensor = true` 的碰撞体只触发回调，不会产生力或位移。
4. **忘记调用 `apply()`**：动态修改碰撞体属性（size、offset 等）后，需调用 `apply()` 使修改生效（Box2D 引擎）。

## 关联任务

- [检测 2D 碰撞](../recipes/detect-collision-2d.md)
- [碰撞未触发排查](../troubleshooting/collision-not-triggered.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 物理 2D - 碰撞体
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
