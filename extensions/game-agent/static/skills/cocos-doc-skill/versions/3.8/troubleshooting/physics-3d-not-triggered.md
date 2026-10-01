---
id: cocos-3.8-troubleshooting-physics-3d-not-triggered
version: "3.8"
category: troubleshooting
title: 3D 物理碰撞/触发不触发
keywords:
  - 3D物理不触发
  - onCollisionEnter 不执行
  - onTriggerEnter 不回调
  - Collider 没反应
  - 3D碰撞不触发
  - 物理系统不工作
related_docs:
  - api-reference/collider.md
  - api-reference/rigid-body.md
  - api-reference/physics-system.md
  - recipes/raycast-3d.md
related_api:
  - Collider
  - RigidBody
  - PhysicsSystem
  - ITriggerEvent
  - ICollisionEvent
  - CollisionEventType
  - TriggerEventType
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 - 3D 物理系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "工程经验：3D 物理不触发的最高频原因是误用 2D 组件、缺少 Collider、事件名拼写错误"
status: draft
updated: 2026-06-17
---

# 3D 物理碰撞/触发不触发

## 现象

已经在节点上添加了碰撞体和刚体组件，但运行时 `onCollisionEnter`、`onTriggerEnter` 等回调没有被执行。或者两个物体明明重叠但没有产生物理反应。

## 最可能原因

1. **使用了 2D 组件而不是 3D 组件** — 错用了 `Collider2D` / `RigidBody2D` 而不是 `Collider` / `RigidBody`。2D 组件由 `PhysicsSystem2D` 管理，而 3D 场景中的碰撞检测使用的是 `PhysicsSystem`。两个系统互不兼容。
2. **缺少 Collider 组件** — 只添加了 RigidBody 但没有添加 Collider（BoxCollider、SphereCollider 等），物理引擎无法检测碰撞。
3. **Collider 和 RigidBody 不在同一节点** — Collider 通过 `attachedRigidBody` 查找所在节点是否有 RigidBody。两者必须在同一节点上或 Collider 在子节点（通过组件链关联）。
4. **碰撞矩阵不通** — 两个物体的 Group/Mask 设置没有交集，导致物理引擎跳过碰撞检测。
5. **事件类型字符串错误** — 3D Collider 使用字符串事件名（如 `"onCollisionEnter"`）。拼写错误（如 `"oncollisionenter"`、`"OnCollisionEnter"`）不会报错但事件不会触发。
6. **物理系统未启用** — `PhysicsSystem.instance.enable = false` 时整个物理系统不工作。
7. **节点 active 或 scale 异常** — 碰撞体所在节点或父节点 `active = false`，或者 `scale` 为 0 时，碰撞体无效。

## 按优先级排查

### 第一层：基础组件检查

- [ ] 确认使用了 **3D 组件**，而不是 2D 组件：
  - Collider（而不是 Collider2D）
  - RigidBody（而不是 RigidBody2D）
  - PhysicsSystem（而不是 PhysicsSystem2D）
- [ ] 确认节点上**同时有 Collider 和 RigidBody**（或至少 Collider）。
- [ ] 确认 Collider 子类已选（BoxCollider、SphereCollider、CapsuleCollider 等），且形状参数不为零。
- [ ] 确认 Collider 和 RigidBody 在**同一节点**上（或 Collider 在挂载了 RigidBody 的节点下）。

### 第二层：Trigger / Collision 配置

- [ ] 确认 Trigger/Collision 模式选择正确：
  - 需要物理力（推/反弹）→ `isTrigger = false`，注册 `onCollisionEnter` 事件
  - 只需要检测重叠 → `isTrigger = true`，注册 `onTriggerEnter` 事件
- [ ] 确认事件字符串拼写正确：
  - Trigger 事件：`"onTriggerEnter"`、`"onTriggerStay"`、`"onTriggerExit"`
  - Collision 事件：`"onCollisionEnter"`、`"onCollisionStay"`、`"onCollisionExit"`
- [ ] 如果使用 Builtin 后端，确认 `isTrigger` 始终为 true（Builtin 后端只有触发器模式，无物理碰撞力）。

### 第三层：Group / Mask

- [ ] 检查两个碰撞体的 Group 是否有交集：`(groupA & maskB) !== 0 && (groupB & maskA) !== 0`
- [ ] 检查项目设置中的碰撞矩阵（**项目设置 -> 碰撞矩阵**）是否允许这两个分组碰撞。
- [ ] 如果 RigidBody 也设置了 Group/Mask，检查其是否与 Collider 的 Group/Mask 一致：

```ts
import { _decorator, Component, Collider, RigidBody } from 'cc';
const { ccclass } = _decorator;

@ccclass('CheckPhysicsGroupMask')
class CheckPhysicsGroupMask extends Component {
  start() {
    const collider = this.node.getComponent(Collider);
    if (collider) {
      console.log('Collider Group:', collider.getGroup(), 'Mask:', collider.getMask());
    }
    const rb = this.node.getComponent(RigidBody);
    if (rb) {
      console.log('RigidBody Group:', rb.getGroup(), 'Mask:', rb.getMask());
    }
  }
}
```

### 第四层：物理系统启用

- [ ] 确认 `PhysicsSystem.instance.enable` 为 `true`：

```ts
import { _decorator, Component, PhysicsSystem } from 'cc';
const { ccclass } = _decorator;

@ccclass('CheckPhysicsSystem')
class CheckPhysicsSystem extends Component {
  start() {
    console.log('PhysicsSystem enabled:', PhysicsSystem.instance.enable);
    console.log('Gravity:', PhysicsSystem.instance.gravity);
  }
}
```

- [ ] 确认物理后端已编译（在项目设置中选择了物理后端：Builtin / Cannon.js / Bullet / PhysX）。
- [ ] 确认物理调试绘制开启以可视化碰撞体：

```ts
// 在 start 或 onLoad 中启用调试绘制
PhysicsSystem.instance.debugDrawFlags = 1; // 显示碰撞体线框
```

### 第五层：节点和场景

- [ ] 确认碰撞体节点及其所有父节点 `active = true`、`enabled = true`。
- [ ] 确认节点 `scale` 不为 0 且不为负值。
- [ ] 确认两个碰撞体所在场景已激活（`director.getScene()` 非空）。
- [ ] 尝试在两个物体之间添加小空间再运行，或手动移动它们，观察是否触发。

## 解决方案

### 基本排查脚本

将以下脚本挂载到需要检测碰撞的节点上，执行诊断：

```ts
import { _decorator, Component, Collider, RigidBody, PhysicsSystem } from 'cc';

const { ccclass } = _decorator;

@ccclass('PhysicsDiagnostic')
export class PhysicsDiagnostic extends Component {
  start() {
    console.log(`=== 3D 物理诊断：${this.node.name} ===`);

    const collider = this.node.getComponent(Collider);
    const rb = this.node.getComponent(RigidBody);

    if (!collider) {
      console.warn('缺少 Collider 组件');
    } else {
      console.log(`Collider: isTrigger=${collider.isTrigger}, Group=${collider.getGroup()}, Mask=${collider.getMask()}`);
    }

    if (rb) {
      console.log(`RigidBody: type=${rb.type}, mass=${rb.mass}, useGravity=${rb.useGravity}, useCCD=${rb.useCCD}`);
    }

    console.log(`PhysicsSystem: enable=${PhysicsSystem.instance.enable}, gravity=${PhysicsSystem.instance.gravity}`);
    console.log('==============================');
  }
}
```

### 正确注册碰撞回调

```ts
import { _decorator, Component, Collider, ICollisionEvent, ITriggerEvent } from 'cc';

const { ccclass } = _decorator;

@ccclass('PhysicsCallbackExample')
export class PhysicsCallbackExample extends Component {
  start() {
    const collider = this.node.getComponent(Collider);
    if (!collider) {
      console.warn('Collider 组件不存在');
      return;
    }

    // 注册碰撞事件
    collider.on('onCollisionEnter', this.onCollisionEnter, this);
    collider.on('onCollisionExit', this.onCollisionExit, this);

    // 注册触发事件
    collider.on('onTriggerEnter', this.onTriggerEnter, this);
    collider.on('onTriggerExit', this.onTriggerExit, this);
  }

  onCollisionEnter(event: ICollisionEvent | null) {
    if (!event) return;
    console.log(`碰撞: ${event.selfCollider.node.name} <-> ${event.otherCollider.node.name}`);
  }

  onCollisionExit(event: ICollisionEvent | null) {
    if (!event) return;
    console.log(`碰撞结束: ${event.selfCollider.node.name} <-> ${event.otherCollider.node.name}`);
  }

  onTriggerEnter(event: ITriggerEvent | null) {
    if (!event) return;
    console.log(`触发器进入: ${event.otherCollider.node.name}`);
  }

  onTriggerExit(event: ITriggerEvent | null) {
    if (!event) return;
    console.log(`触发器离开: ${event.otherCollider.node.name}`);
  }

  onDestroy() {
    const collider = this.node.getComponent(Collider);
    if (collider) {
      collider.off('onCollisionEnter', this.onCollisionEnter, this);
      collider.off('onCollisionExit', this.onCollisionExit, this);
      collider.off('onTriggerEnter', this.onTriggerEnter, this);
      collider.off('onTriggerExit', this.onTriggerExit, this);
    }
  }
}
```

## 仍未解决时

- 检查 Cocos Creator 编辑器 Console 面板是否有物理引擎初始化相关的报错。
- 确认当前编译目标平台支持所选的物理后端（如 Bullet / PhysX 在 Web 平台可能不可用）。
- **后端和平台差异**：不同物理后端（Builtin / Cannon.js / Bullet / PhysX）行为存在差异。Builtin 是简化版（只有触发器模式），Bullet / PhysX 提供完整的物理模拟。Web 平台建议使用 Cannon.js，原生平台建议使用 Bullet 或 PhysX。
- 尝试在**空场景**中创建两个带有基本 BoxCollider + RigidBody 的立方体，排除其他组件干扰。
- 查阅官方文档中关于碰撞矩阵和物理材质的使用说明。如果仍然无法解决，考虑是否遇到了特定平台或特定物理后端的已知问题。

## 相关文档

- [Collider API 卡片](../api-reference/collider.md)
- [RigidBody API 卡片](../api-reference/rigid-body.md)
- [PhysicsSystem API 卡片](../api-reference/physics-system.md)
- [3D Raycast 任务](../recipes/raycast-3d.md)
