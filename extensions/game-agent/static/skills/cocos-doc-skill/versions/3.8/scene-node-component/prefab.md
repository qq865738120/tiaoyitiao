---
id: cocos-3.8-scene-node-component-prefab
version: "3.8"
category: scene-node-component
title: Prefab 开发用法与设计权衡
keywords:
  - Prefab
  - 预制体
  - 实例化
  - 预制件
  - 模板
  - 设计权衡
related_docs:
  - api-reference/prefab.md
  - recipes/instantiate-prefab.md
  - scene-node-component/node.md
  - scene-node-component/destroy-lifecycle.md
related_api:
  - Prefab
  - instantiate
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - Prefab"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：instantiate 后必须设置 parent；修改实例不影响原始 Prefab"
status: draft
updated: 2026-06-17
---

# Prefab 开发用法与设计权衡

## 用途

说明 Prefab 在游戏开发中的设计权衡——什么时候应该做成 Prefab，什么时候不需要。实例化的步骤详见 [实例化 Prefab Recipe](../recipes/instantiate-prefab.md)。

## 核心结论

- **Prefab 是可复用的节点树资产**：将一组节点及其组件配置序列化为 `.prefab` 资源，运行时通过 `instantiate()` 创建实例。
- **实例化后的节点与手动搭建的节点完全等价**：可以像普通节点一样修改、添加组件、设置层级。
- **修改实例不影响原始 Prefab 资源**：`instantiate` 创建的是副本。
- **不是所有节点都需要做成 Prefab**：只在需要批量生成或跨场景复用时才制作 Prefab。

## Prefab 的本质

```
编辑器搭建的节点树 → 保存为 .prefab 资产 → instantiate() → 运行时克隆的新节点树
```

- Prefab 是 **Asset 子类**，存储在 `assets/` 目录下。
- `instantiate(prefab)` 返回一个 **独立的 Node**，其层级结构和组件配置与原始 Prefab 一致。
- 实例化后的节点 **parent 为 null**，必须手动添加到场景树。

## 什么时候应该使用 Prefab

| 场景 | 理由 |
|---|---|
| 重复生成的游戏对象（子弹、敌人、道具） | 一处定义，多次复用 |
| 跨场景共用的 UI 元素（弹窗、提示、菜单） | 避免重复搭建 |
| 需要动态加载并生成的复杂节点树 | 比代码逐层构建更高效、更可维护 |
| 需要美术/策划独立编辑的模板 | 编辑器可视化编辑，程序代码只负责实例化 |

## 什么时候不需要 Prefab

| 场景 | 理由 | 替代方案 |
|---|---|---|
| 场景中唯一且不变的对象 | 无复用需求 | 直接放在场景中 |
| 动态创建的简单节点（单一文本、图标） | Prefab 加载有异步开销 | `new Node()` + `addComponent` |
| 频繁变化且不需要模板化的对象 | 维护 Prefab 本身有成本 | 代码动态构建 |

## 实例化的三种方式

三种方式的具体实现代码见 [实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md)：

## 优化策略

`Prefab.OptimizationPolicy` 提供三种策略：

| 策略 | 含义 | 适用场景 |
|---|---|---|
| `AUTO`（默认） | 引擎自动选择 | 通用场景 |
| `SINGLE_INSTANCE` | 针对单实例优化 | 场景中只生成一个实例的 Prefab |
| `MULTI_INSTANCE` | 批量生成优化 | 大量生成的 Prefab（如子弹） |

可在编辑器 Prefab 资源属性面板中设置优化策略，或在代码中通过 `prefab.optimizationPolicy = Prefab.OptimizationPolicy.MULTI_INSTANCE` 设置。

常见错误排查见 [实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md)。

## 关联文档

- **实例化代码 →** [实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md)
- **资源链路 →** [Prefab 资源体系与加载链路](../assets/prefab.md)
- **API →** [Prefab API 卡片](../api-reference/prefab.md)
- [动态加载资源（Recipe）](../recipes/load-resource-dynamically.md)
- [Node 开发用法](./node.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 资源系统 - Prefab
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——instantiate 后必须设置 parent；修改实例不影响 Prefab 资源
