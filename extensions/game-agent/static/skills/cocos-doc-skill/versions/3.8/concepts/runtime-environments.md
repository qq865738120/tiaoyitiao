---
id: cocos-3.8-concepts-runtime-environments
version: "3.8"
category: concepts
title: 运行环境
keywords:
  - 运行环境
  - 编辑器扩展
  - 游戏运行时
  - Web 预览
  - 小游戏
  - 原生平台
  - API 差异
  - 平台兼容
  - JSB
related_docs:
  - concepts/engine-overview.md
  - concepts/project-structure.md
related_api: []
source:
  official: "Cocos Creator 3.8 官方文档 - 关于 Cocos Creator（架构特色）、原生开发概述"
  verified-against: []
  supplement:
    - "工程经验：编辑器与运行时 API 可用性差异是开发编辑器扩展时的常见陷阱"
status: draft
updated: 2026-06-17
---

# 运行环境

## 用途

说明 Cocos Creator 3.8 中代码可能运行的五种环境及其 API 可用性差异，帮助避免"在这个环境能用、那个环境不能用"的问题。

## 核心结论

- **编辑器扩展环境**运行在 Electron 中，可以用 Node.js API（`fs`、`path`、`child_process` 等），也可以用编辑器 API 操作场景和资源。
- **游戏运行时环境**运行在目标平台的 JS 引擎上（浏览器 V8/JavaScriptCore/小游戏 SDK），**不能使用 Node.js API**。
- **Web 预览**本质是在浏览器中运行引擎，只能使用浏览器提供的 Web API。
- **小游戏平台**在微信、字节等宿主环境运行，引擎通过 JSB 调用原生能力，部分 Web API 不可用或行为不同。
- **原生平台**（iOS/Android/PC）通过 JSB（JavaScript Binding）桥接 C++ 引擎核心，可调用平台原生能力（通过反射/桥接机制），但不能直接用 Node.js 或浏览器 DOM API。

## 什么时候使用

- 判断某个 API 能否在目标环境中使用。
- 开发编辑器扩展时，理解为什么能用 `fs` 读写文件。
- 排查"编辑器预览正常、构建后运行崩溃"的问题。
- 理解为什么小游戏不支持某些 Web API（如 `localStorage` 可能有容量限制）。

## 五种环境对比

| 环境 | 底层运行时 | Node.js API | Web DOM API | 引擎 JS API | 原生平台 API |
|---|---|---|---|---|---|
| **编辑器扩展** | Electron (Node.js + Chromium) | ✅ 完全可用 | ✅ 可用 | ✅ 可用 | ❌ 不可直接使用 |
| **Web 预览** | 浏览器 | ❌ 不可用 | ✅ 可用 | ✅ 可用 | ❌ 不可用 |
| **小游戏** | 平台 SDK（微信/字节等） | ❌ 不可用 | ⚠️ 受限（无 DOM，部分 Web API 受限） | ✅ 可用 | ⚠️ 通过平台 SDK |
| **原生 iOS/Android** | JSB + JavaScriptCore/V8 | ❌ 不可用 | ❌ 不可用 | ✅ 可用（JSB 桥接） | ✅ 通过 JsbBridge 反射调用 |
| **原生 PC** | JSB + V8 | ❌ 不可用 | ❌ 不可用 | ✅ 可用（JSB 桥接） | ✅ 通过 JsbBridge 反射调用 |

## API 可用性差异详解

### 编辑器扩展环境

- 运行在 Electron 主进程或渲染进程。
- 可以调用 `Editor` 命名空间下的所有 API（如 `Editor.Message`、`Editor.Profile`）。
- 可以读写项目文件系统。
- **但引擎的渲染、物理、动画等模拟不在编辑器中实时运行**（除非在场景编辑器的预览模式）。

### Web 预览

- 本质是启动本地 HTTP 服务器，在浏览器中加载引擎。
- 可用 `console`、`fetch`、`localStorage`、`WebSocket` 等浏览器 API。
- 性能接近最终 Web 发布版本，但不能完全代表原生平台行为。

### 小游戏

- 代码运行在平台 SDK 提供的 JS 引擎中（如微信的 JavaScriptCore）。
- **无 DOM**：不能用 `document`、`window`（部分平台提供 mock）、`HTMLCanvasElement`。
- `localStorage` 可能可用但容量受平台限制。
- 网络请求需使用平台 SDK 提供的 API（或引擎封装的 `XMLHttpRequest` 兼容层）。
- 文件系统操作受严格沙箱限制。

### 原生平台

- 引擎 C++ 核心通过 JSB 自动绑定暴露为 JS API，脚本中通过 `cc` 模块调用的 API 与 Web 预览一致。
- 需要调用平台原生能力时（如调用 Java/ObjC 方法），使用：
  - **JsbBridge**：JS 与原生代码双向通信；
  - **原生反射**：Java 反射（Android）、Objective-C 反射（iOS）、ArkTS 反射（HarmonyOS）。
- 不能用 `fs`、`path` 等 Node.js 模块；文件操作走引擎的 `assetManager` / `resources`。

## 最小示例

无需代码示例——本文为概念说明。

## 常见错误

- **在游戏脚本中使用 Node.js API**：游戏运行时不包含 Node.js 运行时，`require('fs')` 会直接报错。
- **在 Web 预览中没有问题，但小游戏上 API 不可用**：例如使用 `document.createElement` 动态创建元素，小游戏环境没有 DOM。
- **在原生平台上使用 `fetch` 而没有做兼容处理**：旧版原生运行时的 JS 引擎可能不支持 fetch，应使用引擎封装的网络 API 或 XMLHttpRequest。
- **混淆编辑器 API 和引擎 API**：`Editor.xxx` 只在编辑器扩展中可用，游戏脚本不能使用。

## 关联文档

- [引擎与编辑器概览](./engine-overview.md)
- [项目结构](./project-structure.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 关于 Cocos Creator（架构特色）、原生开发概述
- 补充：工程经验 — 编辑器扩展与游戏运行时 API 差异是多环境开发的常见迷惑点
