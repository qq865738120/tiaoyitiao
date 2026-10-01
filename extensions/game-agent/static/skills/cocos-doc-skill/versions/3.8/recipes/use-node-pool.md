---
id: cocos-3.8-recipes-use-node-pool
version: "3.8"
category: recipes
title: 使用对象池管理节点
keywords:
  - 对象池
  - NodePool
  - 子弹池
  - 怪物复用
  - 节点复用
  - 性能优化
  - 回收协议
  - 容量策略
  - 泄漏防护
  - 预热
  - 重置
related_docs:
  - api-reference/node-pool.md
  - api-reference/instantiate.md
  - api-reference/prefab.md
  - architecture/pooling-and-task-scheduling.md
related_api:
  - NodePool
  - instantiate
  - Prefab
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本指南 - 对象池"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement: []
status: draft
updated: 2026-06-17
---

# 使用对象池管理节点

## 验证方式

- 打开 Profile 工具观察 `instantiate` 和 `destroy` 调用次数是否减少
- 检查池化前后的 GC 频率差异（频繁创建/销毁会引起 GC 抖动）
- 确认回收的节点在下次取出时状态已被重置（位置、active 等）
- 确认场景切换后对象池已被清空，无旧节点引用残留
