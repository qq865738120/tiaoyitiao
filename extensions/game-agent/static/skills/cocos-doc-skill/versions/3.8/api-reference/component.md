---
id: cocos-3.8-api-reference-component
version: "3.8"
category: api-reference
title: Component
keywords:
  - Component
  - 组件
  - 组件生命周期
  - 组件基类
related_docs:
  - api-reference/node.md
  - scripting/component-lifecycle.md
related_api:
  - Component
  - _decorator
  - ccclass
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# Component

## 用途

Component 是所有挂载在 Node 上的组件的基类。它管理组件的生命周期（onLoad → start → update → onDestroy），提供定时器调度（schedule）和事件接口。

## 所属模块

```ts
import { Component } from 'cc';
```

## 公开导出结论

- `Component` 在 `cc` 模块以 `export class Component extends CCObject` 公开导出。
- 核心公开属性：`node`（所属节点）、`enabled`（启用状态）、`enabledInHierarchy`（实际启用状态，只读）、`name`、`uuid`。
- 公开方法：`getComponent`、`getComponents`、`getComponentInChildren`、`getComponentsInChildren`、`addComponent`、`schedule`、`scheduleOnce`、`unschedule`、`unscheduleAllCallbacks`、`destroy`。
- 生命周期回调（protected，可被子类覆盖）：`onLoad`、`start`、`update(dt)`、`lateUpdate(dt)`、`onEnable`、`onDisable`、`onDestroy`。
- `addComponent` 方法在 Component 和 Node 上同时存在，行为一致。
- `Component.EventHandler` 为静态工具类，用于编辑器事件绑定。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `node` | 组件附加的节点引用 | 操作所属节点 |
| `enabled` | 组件启用状态 | 临时禁用组件 |
| `enabledInHierarchy` | 组件是否实际启用（只读） | 判断组件是否工作 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `getComponent(classConstructor)` | 获取节点上指定类型组件 | 获取同节点其他组件 |
| `schedule(callback, interval)` | 定时重复回调 | 倒计时/周期检测 |
| `scheduleOnce(callback, delay)` | 定时单次回调 | 延迟执行 |
| `unschedule(callback)` | 取消定时回调 | 停止倒计时 |
| `unscheduleAllCallbacks()` | 取消所有定时回调 | 清理 |

## 高频代码

### 基础组件生命周期

```ts
import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
  @property(Label)
  label: Label | null = null;

  onLoad() {
    // 初始化逻辑，在所有 start 之前执行
  }

  start() {
    // 首次启用时执行，所有 onLoad 之后
    if (this.label) {
      this.label.string = 'Ready';
    }
  }

  update(dt: number) {
    // 每帧执行，dt 为帧间隔秒数
  }

  onDestroy() {
    // 组件销毁时清理
  }
}
```

### 使用定时器

```ts
import { _decorator, Component, log } from 'cc';

const { ccclass } = _decorator;

@ccclass('TimerExample')
export class TimerExample extends Component {
  private _callback: (() => void) | null = null;

  start() {
    // 每秒回调一次，重复 5 次后停止
    this.schedule(() => {
      log('tick');
    }, 1, 5);

    // 延迟 2 秒执行一次
    this.scheduleOnce(() => {
      log('delayed');
    }, 2);
  }

  onDisable() {
    this.unscheduleAllCallbacks();
  }
}
```

## 常见错误

1. **忘记调用 `super` 方法**：生命周期回调（onLoad、start、update 等）如果覆盖了基类方法，必须在子类中显式调用 `super.onLoad?.()` 等（Cocos 3.x 中生命周期方法通过原型链自动调用，一般不需要手动调 super，但自定义组件不应覆盖引擎内置组件的生命周期且忽略原有逻辑）。
2. **getComponent 返回 null 不检查**：当节点上没有该组件时返回 null，必须做防御判断。
3. **schedule 回调中访问已销毁对象**：组件销毁后定时器仍可能执行回调，需在 `onDestroy` 中 `unscheduleAllCallbacks()`。
4. **错误使用 `this.node.addComponent(MyComponent)` 重复添加**：编辑器模式下若组件被 `@disallowMultiple` 装饰器标注，重复添加会被检查并阻止；运行时默认允许多次挂载同类型组件。即便如此，业务上一般应先 `getComponent` 检查，避免逻辑上重复挂载导致状态紊乱。

## 关联任务

- [创建节点与组件](../recipes/create-node-and-component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本系统 - 组件生命周期
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
