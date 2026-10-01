# Case Studies

本目录存放跨多个模块的完整游戏开发案例：场景结构、组件组合、数据流、关键实现、验证与失败路径。

## 分类说明

### 是什么

- 横跨**多个 Cocos 子系统**（如 UI + 动画 + 物理 + 脚本）的完整案例
- 展示真实的**场景树结构**与**组件表**
- 描述**数据如何在模块间流动**
- 展示关键代码实现片段，配合架构说明
- 说明**如何验证**功能正确，以及**典型的失败路径**

### 不是什么

- API 百科全书（罗列全部属性而不说明为什么这样组合）
- 只展示代码不说明架构意图
- 单模块的简单用法（属于 `recipes/` 或对应主题目录）
- 纯理论讨论不含可运行代码片段

## 文档列表

| 文档 | 说明 |
|---|---|---|
| [character-controller.md](./character-controller.md) | 角色控制器完整案例：2D 平台跳跃 / 2D 俯视角 / 3D CharacterController 方案选择、场景树、组件表、数据流、关键实现、失败排查 |
| [相机跟随与反馈系统](./camera-follow-and-feedback-system.md) | 平滑跟随、死区、前视、边界约束、多来源震屏叠加、正交缩放、多目标取景、RenderTexture 迷你地图、UI 相机分离等完整 2D 相机系统 |
| [tiled-map-rendering-and-collision.md](./tiled-map-rendering-and-collision.md) | 2D 瓦片地图渲染与碰撞：图层命名约定、节点树结构、渲染层级与角色排序、ObjectGroup 对象层用法（出生点/碰撞区域/触发器）、坐标转换、碰撞矩阵配合、资源管理与分块加载方案 |
| [animation-design-and-control](./animation-design-and-control.md) | 角色动画系统工程化设计：Animation/AnimationController/AnimationGraph 组件区分、状态机转换表、数据流解耦、事件监听、动画加载与常见问题诊断 |

## 进入条件

创建 case-studies 文档前，确认：

- 案例**跨至少 2 个 Cocos 子系统**（如动画 + UI、物理 + 脚本 + 渲染）
- 包含**场景树结构**（节点层级图或文字描述）
- 包含**组件表**（每个关键节点挂载了什么组件）
- 包含**数据流图**或文字描述（数据从哪里来、经过谁、到哪里去）
- 有**关键实现**代码片段，并解释为什么这样做
- 说明了**验证方式**（如何测试功能正确）和**典型失败路径**

## 排除条件

以下内容不适合放入 case-studies/：

- 只用到一个 Cocos 子系统的简单操作（如 "如何使用 Label 组件"）
- 只有代码清单，没有架构意图和设计选择的说明
- 纯引擎概念说明不含实际案例（属于 `concepts/`）
- 属于特定项目保密业务逻辑

## 必含章节

每个 case-studies 文档**必须**包含以下章节：

1. **场景概览**：案例目标、交互流程简述
2. **场景树结构**：节点层级图（文字树形或 ASCII 图），标注关键节点
3. **组件表**：每个关键节点的组件清单

   | 节点路径 | 组件 | 用途 |
   |---|---|---|
   | Canvas/Player | Sprite / Animation / RigidBody2D | 角色渲染、动画与物理 |

4. **数据流图**：数据产生、传递、消费路径的文字描述或 ASCII 图
5. **关键实现**：核心代码片段 + 为什么这样做的说明
6. **验证方式**：如何手动或自动验证功能正确
7. **失败路径**：常见错误操作、预期表现与排查方向
8. **可改进方向**（可选）：当前方案的已知局限与改进思路

## ID 格式

```
cocos-3.8-case-studies-{slug}
```

示例：`cocos-3.8-case-studies-character-controller`

## related_docs 约定

使用相对于 `versions/3.8/` 的路径，应交叉引用相关的主题文档和 API 文档：

```yaml
related_docs:
  - case-studies/character-controller.md
  - scripting/input-system.md
  - physics-2d/collision-detection.md
```
