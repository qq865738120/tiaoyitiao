---
id: cocos-3.8-troubleshooting-collision-not-triggered
version: "3.8"
category: troubleshooting
title: 碰撞检测未触发
keywords:
  - 碰撞检测未触发
  - onCollisionEnter 不执行
  - 碰撞回调未响应
  - Collider2D 不工作
  - 物理碰撞没反应
related_docs:
  - api-reference/collider-2d.md
  - api-reference/rigid-body-2d.md
  - recipes/detect-collision-2d.md
  - concepts/physics-filtering-and-collision-matrix.md
related_api:
  - Collider2D
  - Collider2D.onCollisionEnter
  - RigidBody2D
  - Contact2DType
  - PhysicsSystem2D
source:
  official: "Cocos Creator 3.8 官方文档 - 2D 物理系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：Group 和 Mask 不匹配、Collider 无 RigidBody 是最高频原因"
status: draft
updated: 2026-06-17
---

# 碰撞检测未触发

## 现象

两个节点都添加了 Collider2D 组件（如 BoxCollider2D、CircleCollider2D），运行时两个节点相交但 `onCollisionEnter`、`onCollisionStay`、`onCollisionExit` 回调函数未被调用。

## 最可能原因

1. **缺少 RigidBody2D 组件** — 在 Cocos Creator 3.8 的 2D 物理系统中，参与碰撞的物体至少需要一个 RigidBody2D 组件。仅添加 Collider2D 没有 RigidBody2D 时，物体默认是"静态"的，不会与其他物体产生碰撞回调，除非至少一方有 RigidBody2D。

2. **碰撞分组（Group）和掩码（Mask）不匹配** — Collider2D 的 `group` 和碰撞矩阵共同决定了哪些组之间可以碰撞。如果两个碰撞体的 group 在碰撞矩阵中没有勾选交集，物理引擎不会检测它们的碰撞。2D 物理中 `mask` 由碰撞矩阵全局控制，碰撞体组件上只暴露 `group` 属性。详见 [物理过滤与碰撞矩阵](../concepts/physics-filtering-and-collision-matrix.md)。

3. **回调方法签名不正确** — `onCollisionEnter` 等方法名称拼写错误（注意大小写），或参数类型错误。Cocos Creator 3.8 中回调接收 `ICollisionEvent` 类型参数，而非 Cocos 2.x 的 `Collision` 类型。

4. **物理系统被禁用或休眠** — `PhysicsSystem2D.enable = false` 导致物理引擎完全不工作。或者 RigidBody2D 的 `allowSleep` 为 `true` 且物体处于休眠状态时，不会产生碰撞回调。调用 `wakeUp()` 可以唤醒。

5. **节点 active = false 或 Scale 为 0** — 碰撞体所在节点或其父节点被禁用，或节点缩放（scale）为 0，物理组件不会生效。另外，节点的 `group`（层级）设置为 `default` 以上的自定义层级时，需确认摄像机的 `cullingMask` 包含该层级（非物理问题，但可能导致看似碰撞不生效）。

## 检查项（至少 5 项）

- [ ] 确认两个节点都添加了 Collider2D 组件（如 BoxCollider2D/BoxCollider2D）。
- [ ] 确认至少一个节点同时添加了 RigidBody2D 组件。
- [ ] 确认函数名正确书写为 `onCollisionEnter`、`onCollisionStay`、`onCollisionExit`（首字母 `o` 小写，驼峰格式）。
- [ ] 检查 Collider2D 的 `group` 属性在 Inspector 中是否正确配置（两个碰撞体的 group 在碰撞矩阵中必须有交集）。
- [ ] 检查 **项目设置 → 物理 → 碰撞矩阵**，确认两个分组之间的交叉格已勾选。
- [ ] 确认 `PhysicsSystem2D.instance.enable` 为 `true`（在代码中打印验证）。
- [ ] 确认两个节点及其全部父节点 `active = true`。
- [ ] 确认 RigidBody2D 不是 `type = Static` 且 `allowSleep = true` 且处于休眠状态（可以尝试 `rigidBody.wakeUp()`）。

## 解决方案

```ts
import { _decorator, Component, Collider2D, Contact2DType, ICollisionEvent } from 'cc';

const { ccclass } = _decorator;

@ccclass('CollisionDetector')
export class CollisionDetector extends Component {
  start() {
    const collider = this.node.getComponent(Collider2D);
    if (!collider) {
      console.warn('Collider2D 组件不存在，请添加');
      return;
    }

    // 注册碰撞回调
    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: ICollisionEvent | null) {
    console.log(`与 ${otherCollider.node.name} 开始碰撞`);
  }

  onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: ICollisionEvent | null) {
    console.log(`与 ${otherCollider.node.name} 结束碰撞`);
  }
}
```

### 逐步排查路径

1. 确认两个节点均有 Collider2D 且至少一方有 RigidBody2D。
2. 开启物理调试绘制：`PhysicsSystem2D.instance.debugDraw = true`，查看编辑器或构建运行时是否有碰撞边界框绘制。
3. 检查组和掩码配置：使用编辑器 Collider2D Inspector 中显示的分组信息，或打印 `collider.group`。打开 **项目设置 → 物理 → 碰撞矩阵** 确认对应分组已勾选。
4. 确认 RigidBody2D 类型不为 `Static`（如果双方都是静态物体，碰撞不会触发回调）。
5. 使用事件注册方式（`collider.on(Contact2DType.BEGIN_CONTACT, ...)`）代替生命周期回调方法，可绕过方法名拼写问题。

## 仍未解决时

- 查看编辑器 Console 是否有物理引擎初始化报错。
- 检查是否在项目设置中启用了物理系统（`Project Settings -> 物理 -> 启用物理系统`）。
- 尝试使用 `cc.director.getPhysics2DManager().enabled = true` 启用物理系统（3.8 兼容写法）。
- 对于需要精确碰撞处理的场景，查阅官方文档中关于碰撞矩阵和物理材质的使用说明。

## 相关文档

- [Collider2D API 卡片](../api-reference/collider-2d.md)
- [RigidBody2D API 卡片](../api-reference/rigid-body-2d.md)
- [检测 2D 碰撞任务](../recipes/detect-collision-2d.md)
- [物理过滤与碰撞矩阵](../concepts/physics-filtering-and-collision-matrix.md)
