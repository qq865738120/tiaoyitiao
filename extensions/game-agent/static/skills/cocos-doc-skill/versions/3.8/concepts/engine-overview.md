---
id: cocos-3.8-concepts-engine-overview
version: "3.8"
category: concepts
title: Cocos Creator 与引擎概览
keywords:
  - Cocos Creator 是什么
  - Cocos Engine
  - 引擎与编辑器关系
  - 游戏引擎架构
  - Creator 功能特性
related_docs:
  - concepts/project-structure.md
  - concepts/runtime-environments.md
related_api:
  - director
source:
  official: "Cocos Creator 3.8 官方文档 - 关于 Cocos Creator"
  verified-against: []
  supplement: []
status: draft
updated: 2026-06-17
---

# Cocos Creator 与引擎概览

## 用途

帮助理解 Cocos Creator 编辑器与 Cocos Engine（引擎）的关系，以及整个开发方案的架构定位。

## 核心结论

- **Cocos Creator 是一体化开发工具**，包含编辑器、引擎、资源管理、预览、构建发布全套功能。
- **编辑器由 Electron 驱动**，引擎负责运行时渲染、物理、动画、脚本等游戏核心能力。
- **编辑器和引擎是分离但协作的两个系统**：编辑器在 Electron 环境中运行，可以调用 Node.js API；引擎在游戏运行时环境中运行，仅可使用 Web/原生 API。
- **引擎底层由 C++ 内核实现**，通过 JavaScript 绑定（JSB）暴露给 TypeScript/JavaScript 层使用。
- Cocos Creator 3.8 采用**组件化架构**（Entity-Component），以组合而非继承构建游戏对象。

## 什么时候使用

- 刚接触 Cocos Creator，需要理解它与传统"纯引擎"（如 Unity 裸引擎）的区别。
- 需要区分哪些 API 在编辑器中可用但游戏运行时不可用。
- 理解为什么编辑器插件能使用 Node.js 而游戏脚本不能。

## 关键 API / 组件

- `director`：场景管理与游戏主循环控制，是引擎运行时的核心入口。

## 最小示例

无需代码示例——本文为概念说明。

## 常见错误

- 在游戏脚本中调用 Node.js API（如 `fs`、`path`）——游戏运行在纯浏览器/原生环境，不支持 Node.js。
- 混淆编辑器和引擎：编辑器扩展运行在 Electron 中，游戏脚本运行在引擎环境中，两者 API 可用性完全不同。

## 关联文档

- [项目结构](./project-structure.md)
- [运行环境](./runtime-environments.md)
- [节点组件模型](./scene-node-component-model.md)
- [生命周期概览](./lifecycle-overview.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 关于 Cocos Creator（产品定位、工作流程说明、架构特色）
