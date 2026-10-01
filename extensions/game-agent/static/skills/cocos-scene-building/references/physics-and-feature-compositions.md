# 物理与功能组件组合

## 适用场景

用于 2D/3D 碰撞、刚体、触发器、约束、恒力、角色交互、可拾取物、传感区域和物理驱动 Prefab。

## 决策规则

1. 先判断使用 2D 还是 3D 物理系统；两套组件、坐标含义和事件 API 不应混用。
2. 静态环境通常只需 Collider；需要由物理世界驱动运动、受力或参与动态响应的对象再添加 RigidBody。
3. Collider 定义形状，RigidBody 定义物理运动状态；两者职责不同。
4. Constraint、ConstantForce 等功能组件依赖 3D RigidBody 时，应按依赖顺序创建并复核同节点组件。
5. Trigger/Sensor 用于事件检测而非实体阻挡；事件监听、碰撞分组和掩码必须共同验证。
6. 复杂可复用物体应封装成 Prefab，根节点负责物理主体，视觉、特效、挂点和交互区作为稳定子节点。
7. Collider 形状优先简单、稳定、贴合玩法；不要默认使用高复杂度网格碰撞。

## 推荐结构

```text
Crate.prefab
├─ CrateRoot                # RigidBody + BoxCollider + gameplay script
│  ├─ Visual               # MeshRenderer / Sprite
│  ├─ InteractionTrigger   # 独立 trigger collider（需要时）
│  ├─ VFXAnchor
│  └─ AudioAnchor
```

```text
LevelPhysics
├─ StaticColliders          # Collider，无需为每块静态地面添加 RigidBody
├─ DynamicActors            # RigidBody + Collider Prefab 实例
└─ Triggers                 # Trigger Collider + 事件脚本
```

## 反模式

- 认为所有 Collider 都必须配 RigidBody。
- 添加 RigidBody 却没有 Collider，然后期待发生接触。
- 同一玩法对象混用 2D Collider 与 3D RigidBody。
- 只创建 Constraint/ConstantForce，不检查其 RigidBody 依赖。
- 用可见模型的全部三角面直接做动态碰撞形状。
- 只测试“能看到组件”，不测试分组、掩码、Trigger 和事件回调。

## 验证清单

- [ ] 已明确使用 2D 或 3D 物理系统。
- [ ] 静态、运动学、动态和触发器角色分类正确。
- [ ] 需要接触的双方 Collider、分组和掩码互相匹配。
- [ ] 依赖 RigidBody 的组件位于正确节点且引用完整。
- [ ] Collider 尺寸、中心、旋转和缩放与玩法一致。
- [ ] Prefab 实例的物理参数与必要覆盖已复核。
- [ ] 进入/保持/离开事件、睡眠、重生和高速运动边界已实测。

## 适用条件

- 适用于 Creator 3.8.x 内置 2D/3D 物理组件。
- 不同物理后端、时间步长和 CCD 支持可能影响结果；高风险交互必须在项目实际后端和目标帧率下验证。

## 一手来源

- [3D RigidBody](https://docs.cocos.com/creator/3.8/manual/en/physics/physics-rigidbody.html)
- [3D 物理组件](https://docs.cocos.com/creator/3.8/manual/en/physics/physics-component.html)
- [2D Collider](https://docs.cocos.com/creator/3.8/manual/en/physics-2d/physics-2d-collider.html)
