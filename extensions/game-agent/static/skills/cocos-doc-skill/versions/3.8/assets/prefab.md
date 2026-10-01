---
id: cocos-3.8-assets-prefab
version: "3.8"
category: assets
title: Prefab 资源体系与加载链路
keywords:
  - Prefab
  - 预制体
  - 预制体资源
  - 预制体加载
  - 资源体系
  - 加载链路
  - 嵌套Prefab
  - Prefab变体
related_docs:
  - assets/asset-workflow.md
  - assets/dynamic-loading.md
  - scene-node-component/prefab.md
  - api-reference/prefab.md
  - recipes/instantiate-prefab.md
related_api:
  - Prefab
  - instantiate
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - 预制件 / Prefab"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：Prefab 加载链路理解不清晰导致加载和实例化混淆"
status: draft
updated: 2026-06-17
---

# Prefab 资源体系与加载链路

## 用途

说明 Prefab 作为资源在 Cocos Creator 资源体系中的位置、从存储到实例化的完整加载链路，以及不同加载方式的选择。设计权衡和实例化实现分别见 [Prefab 开发用法](../scene-node-component/prefab.md) 和 [实例化 Prefab](../recipes/instantiate-prefab.md)。

## 核心结论

- **Prefab 是一种 Asset**（`class Prefab extends Asset`），存储在 `assets/` 目录中。
- **加载 Prefab 资源 ≠ 实例化**：加载得到的是 Prefab 模板对象，`instantiate(prefab)` 才创建运行时节点。
- **三种加载入口**：编辑器属性绑定（最常用）、`resources.load()`、`bundle.load()`。
- **Prefab 实例化后是独立节点树**：修改实例不影响原始 Prefab，反之亦然。

## 什么时候使用

- 需要理解 Prefab 作为资源的存储、加载、实例化的完整链路。
- 需要选择 Prefab 的加载方式（属性绑定 vs 动态加载 vs Bundle 加载）。
- 需要了解嵌套 Prefab 和 Prefab 资源依赖关系。

## Prefab 在资源体系中的位置

```text
编辑期：
  assets/prefabs/bullet.prefab    ← 序列化文件（存储节点树、组件、属性配置）

构建期：
  被引用 → 打包到对应 Bundle（main/resources/自定义Bundle）

运行期：
  .prefab 文件 → Asset 子类 Prefab → instantiate() → Node 实例
```

Prefab 作为 Asset，享有与其他资源相同的生命周期：
- 被 `assetManager` 缓存管理
- 可被引用计数追踪
- 可通过 `resources.load` 或 Bundle API 加载

## 加载链路对比

| 加载方式 | 加载时机 | 适合场景 |
|---|---|---|
| 编辑器属性绑定 | 随场景加载（同步实例化） | 固定使用的 Prefab（如 UI 弹窗、固定子弹） |
| resources.load | 运行时按需异步加载 | 中小项目、少量动态 Prefab |
| Bundle.load | 运行时按需异步加载 | 大型项目、DLC、远程更新内容 |

三种加载方式的具体代码实现见 [实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md)，本文档仅说明资源链路选择策略。

## 常见错误

1. **混淆"加载"与"实例化"**：`resources.load` 得到的是 Prefab 资源对象，不调用 `instantiate` 不会出现节点。
2. **加载的 Prefab 对象被修改**：`resources.load` 返回的 Prefab 是共享缓存对象，修改它会影响后续所有 `instantiate`。应修改实例而非 Prefab 资源。
3. **忘记判空**：加载失败时 `prefab` 为 null，`instantiate(null)` 会导致运行时错误。

> 路径带 `.prefab` 扩展名、实例化后未设置 parent 等错误见 [实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md)。

## 关联文档

- [Prefab 开发用法与设计权衡](../scene-node-component/prefab.md)
- [Prefab API 卡片](../api-reference/prefab.md)
- **[实例化 Prefab（Recipe）](../recipes/instantiate-prefab.md)** — 唯一可运行代码源，包含三种加载方式的完整代码、操作步骤与常见错误排查
- [动态加载资源](./dynamic-loading.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 预制件 / 资源系统 - Prefab
- 已交叉验证：cc-engine 3.8 公开类型声明（`class Prefab extends Asset`、`function instantiate(prefab: Prefab): Node`）
- 补充：工程经验——加载链路和 instantiate 父节点设置是最常见的 Prefab 问题
