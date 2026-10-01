---
id: cocos-3.8-scripting-debugging
version: "3.8"
category: scripting
title: 调试与日志输出
keywords:
  - 调试
  - console.log
  - console.warn
  - console.error
  - 打印日志
  - 浏览器调试
  - DevTools
  - 运行时调试
  - 断点
related_docs:
  - scripting/coding-pitfalls.md
  - scripting/node-component-access.md
related_api:
  - Component
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 预览与调试"
  verified-against: []
  supplement:
    - "工程经验：console 三件套与浏览器 DevTools 是最基础的调试手段"
status: draft
updated: 2026-06-17
---

# 调试与日志输出

## 用途

说明在 Cocos Creator 3.8 开发中常用的调试方法：console 日志、浏览器 DevTools 断点调试，以及调试注意事项。

## 核心结论

- **`console.log` / `console.warn` / `console.error`** 是脚本调试的基本工具。
- **浏览器 DevTools**（F12）是 Web 预览时的主要调试环境，支持断点、调用栈、变量查看。
- **不要在 update 中频繁打 log**——每帧输出严重影响性能和可读性。

## console 日志三件套

```ts
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DebugExample')
export class DebugExample extends Component {
  @property
  testValue: number = 100;

  start() {
    // 普通日志
    console.log('Component started, value:', this.testValue);

    // 警告——用于异常但不致命的场景
    if (this.testValue < 0) {
      console.warn('testValue is negative:', this.testValue);
    }

    // 错误——用于致命问题，红色输出+堆栈追踪
    if (!this.node) {
      console.error('this.node is null!');
    }
  }
}
```

### 常用 console 方法

| 方法 | 用途 | 控制台显示 |
|---|---|---|
| `console.log(...)` | 普通输出 | 默认样式 |
| `console.warn(...)` | 警告 | 黄色背景 |
| `console.error(...)` | 错误 | 红色+堆栈追踪 |
| `console.table(data)` | 数组/对象表格视图 | 表格 |
| `console.group(label)` / `groupEnd()` | 分组折叠输出 | 可折叠组 |
| `console.time(label)` / `timeEnd(label)` | 测量代码执行耗时 | 毫秒数 |
| `console.trace()` | 打印调用堆栈 | 堆栈列表 |

## 浏览器 DevTools 断点

1. 在 Cocos Creator 中点击**预览**（浏览器打开）。
2. 打开浏览器 DevTools（`F12` 或 `Cmd+Option+I`）。
3. 在 **Sources** 面板搜索你的脚本文件名。
4. 点击行号设置断点。
5. 运行时触发断点后，查看变量值、调用栈、单步执行。

```ts
// 代码中插入断点（提交前记得删除）
start() {
  debugger;  // ← 浏览器会在此暂停
  console.log('After debugger');
}
```

## update 中的日志控制

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('UpdateLogExample')
export class UpdateLogExample extends Component {
  private _frameCount: number = 0;

  update(dt: number) {
    this._frameCount++;
    // ✅ 每 60 帧输出一次，而非每帧
    if (this._frameCount % 60 === 0) {
      console.log(`Frame ${this._frameCount}`);
    }
  }
}
```

## 常见调试流程

| 问题 | 调试方法 |
|---|---|
| 生命周期不执行 | 在每个钩子中 `console.log` 确认时机 |
| 节点/属性为 null | `console.log(this.node, this.myProperty)` 打印看值 |
| 事件不触发 | 在回调首行 `console.log(event)` 确认是否进入 |
| 性能瓶颈 | `console.time`/`timeEnd` 测量可疑代码块 |
| 逻辑错误 | 浏览器 DevTools 断点单步跟踪 |
| 值变化追踪 | 多处打印同一变量，对比输出顺序 |

## 常见错误

1. **在 update 中无节制打 log**：每帧输出大量日志拖慢性能、淹没控制台。
2. **忘记删除调试代码**：`debugger;` 和临时 console.log 提交前应清理。
3. **用 alert 调试**：`alert()` 阻塞整个页面，开发调试中绝不要用。
4. **console.log 对象引用陷阱**：`console.log(obj)` 展开时显示当前值而非打印时的值，应使用 `console.log(JSON.parse(JSON.stringify(obj)))` 获取快照。

## 关联文档

- [常见编码陷阱](./coding-pitfalls.md)
- [访问节点和组件](./node-component-access.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 预览与调试
- 补充：工程经验——update 中日志频率控制、debugger 使用注意事项
