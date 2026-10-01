---
id: cocos-3.8-troubleshooting-input-not-triggered
version: "3.8"
category: troubleshooting
title: 输入不触发
keywords:
  - 输入不触发
  - 键盘事件没反应
  - 触摸无响应
  - input.on 不触发
  - 鼠标点击无效
  - 事件不回调
  - onEnable 注册
  - BlockInputEvents
  - 点击穿透
related_docs:
  - api-reference/input.md
  - scripting/input-events.md
  - scripting/input-system.md
  - scripting/component-lifecycle.md
  - api-reference/node.md
  - api-reference/ui-transform.md
  - recipes/handle-touch-and-keyboard.md
  - troubleshooting/button-not-clickable.md
related_api:
  - input
  - Input
  - Node
  - UITransform
  - BlockInputEvents
  - EventKeyboard
  - EventTouch
source:
  official: "Cocos Creator 3.8 官方文档 - 输入事件系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：全局 input 事件不触发时，优先检查注册时机和 off 匹配问题"
status: draft
updated: 2026-06-17
---

# 输入不触发

## 现象

注册了 `input.on` 或 `node.on` 后，键盘/触摸/鼠标事件回调没有被调用。

## 排查步骤

按以下顺序逐一排查：

### 1. 确认注册时机

**问题**：在 `start()` 而不是 `onEnable()` 中注册，导致组件 enable/disable 后丢失重新注册的机会。

```ts
import { _decorator, Component, input, Input } from 'cc';
const { ccclass } = _decorator;

@ccclass('InputRegExample')
class InputRegExample extends Component {
  private onKeyDown() {}

  // ❌ 问题代码：start 只执行一次，disable 后再 enable 不会重新注册
  start() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
}

@ccclass('InputRegExampleFixed')
class InputRegExampleFixed extends Component {
  private onKeyDown() {}

  // ✅ 正确代码：onEnable/onDisable 配对，每次 enable 重新注册
  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
}
```

**快速检查**：组件是否被外部设置为 `enabled = false` 然后又重新设为 `enabled = true`？如果是，`start` 不会再次执行。

### 2. 确认 off 使用的函数引用与 on 一致

**问题**：注册和解绑用到的是同一个函数引用吗？

```ts
import { _decorator, Component, input, Input } from 'cc';
const { ccclass } = _decorator;

@ccclass('InputFnRefExample')
class InputFnRefExample extends Component {
  private onKeyDown() {}

  // ❌ 问题代码：匿名函数无法解绑
  onEnable() {
    input.on(Input.EventType.KEY_DOWN, (event) => { /* ... */ }, this);
  }
  onDisable() {
    // 这个 off 没有任何效果——匿名函数引用不同
    input.off(Input.EventType.KEY_DOWN, (event) => { /* ... */ }, this);
  }
}

@ccclass('InputFnRefExampleFixed')
class InputFnRefExampleFixed extends Component {
  private onKeyDown() {}

  // ✅ 正确代码：使用具名函数
  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
}
```

**快速检查**：
- 检查 `input.on` 和 `input.off` 中的回调是否是同一个函数对象。
- 检查 `input.on` 第三个参数 `this` 是否与 `input.off` 第三个参数一致。

### 3. 节点 inactive 或组件 disabled

**问题**（仅节点事件）：节点 `active = false` 或组件 `enabled = false` 时，节点触摸事件不触发。

```ts
// 节点事件（node.on）依赖 activeInHierarchy
this.node.on(Node.EventType.TOUCH_START, this.onTouch, this);

// 如果 this.node.active = false 或任意父节点 active = false
// 则 TOUCH_START 事件不会触发
```

**解决方案**：
- 检查节点及其父节点的 `active` 属性。
- 如需要在组件 disabled 时仍处理触摸，改用全局 `input.on`。
- 确认节点没有 `active = false` 后又依赖触摸事件。

**快速检查**：
- 在编辑器运行场景后，选中节点查看 Inspector 中的 `active` 状态。
- 代码中 `console.log(this.node.activeInHierarchy)` 确认。

### 4. UI 遮挡 / BlockInputEvents / 点击穿透

**问题**（仅节点事件）：目标节点被其他 UI 节点遮盖，事件被上层节点拦截。

```ts
// 弹窗节点添加 BlockInputEvents 后
// 弹窗下层所有节点都无法收到触摸事件
const block = popupNode.addComponent(BlockInputEvents);
```

**解决方案**：
- 检查目标节点上方是否有其他节点覆盖（包括半透明、尺寸为 0 的节点）。
- 检查上层节点是否添加了 `BlockInputEvents` 组件。
- 调整节点在 Hierarchy 中的顺序（靠下的节点在上层）或调整 zIndex。
- 如果目标节点在 ScrollView/ListView 内，检查滚动容器是否拦截了事件。

**快速检查**：
- 在场景编辑器中用 Ctrl/Command + 点击目标区域，确认实际选中的是哪个节点。
- 检查 Hierarchy 中目标节点上方的兄弟节点是否存在 `BlockInputEvents` 组件。

### 5. 平台焦点 / 键盘 / 输入法限制

**问题**（仅键盘事件）：Web 平台需要页面获取焦点才能接收键盘事件；某些键盘事件可能在输入法激活时被拦截。

```ts
// Web 平台：页面失焦后 KEY_DOWN 不触发
// 浏览器控制台输入 document.hasFocus() 检查
if (!document.hasFocus()) {
  console.warn('页面未获取焦点，键盘输入不会触发');
}
```

**解决方案**：
- 确保页面/Canvas 获取了焦点（点击一下页面）。
- 在 Web 平台，部分功能键（F1-F12）可能被浏览器拦截。
- 输入法（IME）激活时，部分 KEY_DOWN / KEY_UP 可能延迟或不触发。
- 原生平台（Windows/macOS/Android/iOS）无需处理焦点问题。

## 详细诊断清单

| 检查项 | 全局 input.on | 节点 node.on | 解决方向 |
|---|---|---|---|
| 注册时机 | 确认在 onEnable | 确认在 onEnable | 改用 onEnable/onDisable 配对 |
| off 匹配 | 检查函数引用和 this | 检查函数引用和 this | 使用具名函数 + 三参数 |
| 节点 active | 不依赖 | 依赖 | 检查 activeInHierarchy |
| UI 遮挡 | 不依赖 | 依赖 | 调整 zIndex / 检查 BlockInputEvents |
| 平台焦点 | 键盘事件依赖 | 不依赖 | 确保页面获得焦点 |
| 组件 enabled | 不依赖（on 已注册） | 依赖 | 存疑时改用全局 input |

## 相关文档

- [input API 卡片](../api-reference/input.md)
- [输入事件与传播](../scripting/input-events.md)
- [输入系统](../scripting/input-system.md)
- [Button 点击不生效](./button-not-clickable.md)
- [组件生命周期](../scripting/component-lifecycle.md)
