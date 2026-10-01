---
id: cocos-3.8-case-studies-character-controller
version: "3.8"
category: case-studies
title: 案例百科：角色控制器
keywords:
  - 角色控制器
  - CharacterController
  - 2D平台跳跃
  - 2D俯视角
  - 3D角色
  - 地面检测
  - 跳跃缓冲
  - 土狼时间
  - 无敌帧
  - 受伤状态
  - 死亡处理
  - 碰撞层
  - RigidBody2D
  - RigidBody
  - 物理步进
  - 状态机
  - 动画控制
  - 攻击判定
  - 输入处理
  - 移动控制
related_docs:
  - api-reference/character-controller.md
  - api-reference/rigid-body-2d.md
  - api-reference/rigid-body.md
  - architecture/state-machines-and-data-driven-design.md
  - architecture/game-loop-and-execution-order.md
  - architecture/foundations.md
related_api:
  - CharacterController
  - RigidBody2D
  - RigidBody
  - PhysicsSystem2D
  - Collider2D
  - Animation
  - SkeletalAnimation
  - Sprite
  - UITransform
  - Vec2
  - Vec3
source:
  official: "Cocos Creator 3.8 官方文档 - 物理 2D/3D、角色控制器、动画系统"
  supplement:
    - "游戏开发经典模式：Platformer Controller、Top-Down Controller、Third-Person Controller"
    - "工程经验：跳跃缓冲、土狼时间、无敌帧、受击反馈、死亡流程的完整实现"
status: draft
updated: 2026-06-18
---

# 案例百科：角色控制器

## 场景树

无论 2D 还是 3D，角色节点树推荐以下分层：

```
Player (PlayerController)                    ← 根节点：挂载控制器脚本
├── Visual (Sprite / SkeletalAnimation)      ← 视觉层：渲染/动画
│   ├── BodyShadow (Sprite)                  ← 脚下阴影（可选）
│   └── WeaponSlot (空节点)                  ← 武器挂点（可选）
├── GroundCheck (空节点)                     ← 地面检测点，位置在脚底
│   └── (脚本：GroundCheckHelper)            ← 射线/碰撞检测逻辑
├── Collider (Collider2D / Collider)         ← 物理碰撞体（跟随角色本体的碰撞器）
├── AttackHitBox (Collider2D / Collider, 初始 disable)  ← 攻击判定区域
└── Audio (AudioSource)                      ← 音效播放
```

**关键设计意图**：

- **Visual 子节点独立**：动画播放只操作 Visual 层的 transform/scale（如翻转朝向），不影响物理碰撞体位置。
- **GroundCheck 独立节点**：放在脚底精确位置，避免用角色中心点做地面检测导致误判。
- **AttackHitBox 独立 Collider**：攻击判定与受击判定分离，可在攻击时动态启用/禁用。
- **Audio 子节点**：方便统一管理音效，可用 `playOneShot` 播放不受 AudioSource 状态限制。

## 组件表

| 组件/脚本 | 所在节点 | 职责 |
|---|---|---|
| PlayerController | Player | 输入处理、状态管理、移动控制、生命周期协调 |
| RigidBody2D / RigidBody | Player | 提供物理移动能力（Kinematic 模式下由代码驱动 velocity） |
| Collider2D / Collider | Player | 本体碰撞区域（受击判定、地形碰撞） |
| Sprite / SkeletalAnimation | Visual | 角色视觉渲染、动画播放 |
| GroundCheckHelper | GroundCheck | 地面检测（射线/碰撞检测），返回 isGrounded |
| Collider2D / Collider (disable) | AttackHitBox | 攻击时启用的判定区域 |
| AudioSource | Audio | 播放移动/跳跃/受伤/攻击音效 |

**2D 平台跳跃额外组件**

| 组件/脚本 | 所在节点 | 职责 |
|---|---|---|
| WallSlide (可选) | Player | 墙壁滑行/蹬墙跳逻辑 |
| DoubleJump (可选) | Player | 二段跳逻辑 |

**3D 角色额外组件**

| 组件/脚本 | 所在节点 | 职责 |

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 数据流

<!-- 长示意图已压缩：保留上文结构与下文决策规则。 -->

**详细数据传递**：

1. **Input → Controller**：`input.on(Input.EventType.KEY_DOWN, ...)` 或 `EventSystem` 收集键盘/触摸输入，转为方向向量、跳跃意图布尔值。
2. **Controller → State Machine**：根据当前状态和输入意图判断状态转换（如 Idle→Run、Run→Jump）。
3. **State Machine → Movement**：状态决定移动参数（如 Walk Speed vs Run Speed）、是否允许转向、是否响应输入。
4. **Movement → Physics**：计算后的速度写入 `RigidBody2D.linearVelocity`（2D）或调用 `CharacterController.move()`（3D）。
5. **State Machine → Animation**：状态切换时播放对应动画 clip（idle/run/jump/attack/death），或通过 AnimationController 设置参数。
6. **Movement/Animation → Feedback**：移动时播放脚步声、跳跃时播放跳跃音效、攻击时播放攻击特效——这些在状态机的 enter 回调中触发。

## 关键实现

### 5.1 地面检测

**2D 射线检测方案**（推荐，精确且性能好）：

GroundCheck 节点放在角色脚底位置（`y = -colliderHalfHeight`），脚本向下发射短射线。

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

**3D CharacterController 自带方案**：

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 5.2 跳跃缓冲（Jump Buffer）

玩家按下跳跃后 0.1 秒内，即使走到平台边缘也允许跳跃。解决"手感差"问题。

<!-- TypeScript 模板已压缩：按本节 API 组合实现，示例需从 cc 显式 import 并做 null check。 -->

### 5.3 土狼时间（Coyote Time）

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 验证

### 手动验证清单

| 测试项 | 操作 | 预期结果 |
|---|---|---|
| 左右移动 | 持续按 A/D 或 方向键 | 角色匀速平滑移动，松开后停止 |
| 跳跃 | 按空格键 | 角色垂直跳起，受重力回落 |
| 二段跳 | 空中再次按空格 | 角色二次跳起，着地后重置次数 |
| 跳跃缓冲 | 走到边缘前一瞬间按空格 | 角色在边缘处跳起（不坠落） |
| 土狼时间 | 走出平台后 0.1 秒内按空格 | 角色在空中跳出 |
| 受击 | 让敌人攻击到角色 | 角色播放受击动画、hp 减少、进入无敌 |
| 无敌帧 | 受击后立刻再次接触伤害 | 不重复扣血 |
| 死亡 | hp 降至 0 | 播放死亡动画、禁用操作、触发 GameOver |
| 场景切换 | 死亡后复活 | 控制器引用有效，无 null 报错 |

### 自动化测试建议

- **地面检测**：在不同 Y 坐标放置角色，验证 `isGrounded` 返回值。
- **跳跃高度**：记录跳跃期间最高 Y 坐标，验证与 `jumpForce` 计算一致。
- **无敌帧**：连续施加伤害，断言只触发一次 `takeDamage`。
- **碰撞回调**：用测试 Collider 接触角色，验证 `onBeginContact` 触发。

## 失败路径

### 1. "角色移动卡顿/穿墙"

**现象**：角色运动忽快忽慢，或穿越碰撞体。

**排查**：
- 检查 Collider 类型是否正确（2D 不要错用 3D Collider，反之亦然）。
- 检查 Collider 是否挂载在正确节点上（应在 Player 根节点，而非 Visual 子节点）。
- 检查 Collision Matrix 中 Player 和障碍物的 mask 是否已勾选。
- 检查是否在代码中手动修改 `node.position`——Kinematic RigidBody 应由 `linearVelocity` 驱动。

### 2. "跳跃不触发"

**现象**：按下跳跃键无反应，或在空中无法跳跃。

**排查**：
- 检查地面检测距离是否过短（射线长度 < 角色脚到 Collider 底部的距离）。
- 检查 GroundCheck 节点位置是否校准到脚底（`y = -colliderHalfHeight - smallOffset`）。
- 检查是否缺少跳跃缓冲（Jump Buffer），导致玩家在边缘按下但未及时触地。
- 检查是否缺少土狼时间（Coyote Time），导致刚离开平台就"无效"的跳跃输入。

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。
