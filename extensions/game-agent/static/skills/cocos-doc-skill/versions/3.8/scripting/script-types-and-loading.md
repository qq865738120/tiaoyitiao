---
id: cocos-3.8-scripting-script-types-and-loading
version: "3.8"
category: scripting
title: 脚本分类与加载
keywords:
  - 脚本分类
  - 组件脚本
  - 插件脚本
  - ESM 模块
  - 编辑器扩展脚本
  - 原生绑定
  - JSB
  - 加载顺序
  - 加载时机
  - 循环依赖
  - import
  - 全局变量
  - 第三方库
  - IIFE
related_docs:
  - scripting/module-import.md
  - scripting/ccclass-property.md
  - scripting/typescript-basics.md
  - scripting/coding-pitfalls.md
  - concepts/native-jsb-overview.md
  - scene-node-component/component.md
related_api:
  - Component
  - _decorator
  - ccclass
  - property
  - native.JsbBridge
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本基础、模块规范与示例、插件脚本、语言支持、编辑器扩展"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：脚本分类决策树、加载顺序踩坑、循环依赖解决方案"
status: draft
updated: 2026-06-18
---

# 脚本分类与加载

## 用途

清晰区分 Cocos Creator 3.8 中六类脚本（组件脚本、普通项目类、ESM 模块、插件脚本、编辑器扩展脚本、原生绑定代码）的用途、执行环境和加载时机，帮助开发者决定“某个逻辑应该写成哪种脚本”。

## 核心结论

- **挂节点的逻辑必须写成组件脚本**（`@ccclass` + `extends Component`）。
- **纯数据/工具逻辑用普通类或 ESM 模块**，不能挂节点但可通过 import 复用。
- **插件脚本仅支持 JavaScript**，在引擎初始化后、场景加载前执行，通过全局变量通信。
- **编辑器扩展脚本仅在编辑器中运行**，不进入游戏运行时。
- **原生绑定（JSB）是 C++ 到 JS 的桥接**，开发者一般不需要手动编写 JSB 绑定代码。
- **第三方库推荐使用 ESM import**，避免使用插件脚本引入（全局污染、无法 tree-shaking）。

## 关联文档

- [模块导入与组织](./module-import.md)
- [@ccclass 与 @property 详解](./ccclass-property.md)
- [TypeScript 脚本基础](./typescript-basics.md)
- [常见编码陷阱与避坑指南](./coding-pitfalls.md)
- [原生平台 / JSB 开发概述](../concepts/native-jsb-overview.md)
- [组件基础](../scene-node-component/component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本基础、模块规范与示例、插件脚本、语言支持、编辑器扩展
- 已交叉验证：cc-engine 3.8 公开类型声明（`Component`、`_decorator`、`native.JsbBridge` 均在 `cc` 模块公开导出）
- 补充：工程经验——循环依赖、顶层副作用、路径大小写和脚本类型误用等踩坑总结
