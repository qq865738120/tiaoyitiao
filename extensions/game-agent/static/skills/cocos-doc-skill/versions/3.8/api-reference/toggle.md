---
id: cocos-3.8-api-reference-toggle
version: "3.8"
category: api-reference
title: Toggle
keywords:
  - Toggle
  - ToggleContainer
  - 开关
  - 复选框
  - 单选
  - 设置开关
related_docs:
  - api-reference/button.md
related_api:
  - Toggle
  - ToggleComponent
  - ToggleContainer
  - ToggleContainerComponent
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - Toggle 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# Toggle

## 用途

Toggle 组件实现开关/复选框功能，配合 ToggleContainer 可组成单选组（RadioButton），用于设置开关、选项选择、权限控制等。

## 所属模块

```ts
import { Toggle, ToggleContainer } from 'cc';
```

## 公开导出结论

- `Toggle` 在 `cc` 模块以 `export class Toggle extends Button` 公开导出，继承了 Button 的所有属性与事件。
- `ToggleContainer` 在 `cc` 模块以 `export class ToggleContainer extends Component` 公开导出。
- Toggle 公开属性：`isChecked`、`checkMark`、`checkEvents`（点击事件数组）。
- Toggle 静态枚举：`Toggle.EventType`（继承自 Button 的 `CLICK`，以及自身事件值）。
- Toggle 公开方法：`setIsCheckedWithoutNotify(value)`——设置选中状态但不触发事件回调。
- ToggleContainer 公开属性：`allowSwitchOff`、`toggleItems`（只读，返回管理的 Toggle 数组）。
- ToggleContainer 公开方法：`activeToggles()`（返回当前选中的 Toggle 数组）、`anyTogglesChecked()`（是否有任意 Toggle 被选中）、`notifyToggleCheck(toggle, emitEvent?)`（刷新指定 Toggle 状态）。
- 无类型声明、源码、官方文档之间的冲突。

## 常用属性

### Toggle 属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `isChecked` | 是否处于选中状态 | 设置/获取开关状态 |
| `checkMark` | 选中态显示的 Sprite 图片 | 勾选标记图片 |
| `checkEvents` | 点击时触发的回调事件数组 | 编辑器绑定切换事件 |

### ToggleContainer 属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `allowSwitchOff` | 是否允许全部取消选中（默认 false） | 单选组至少选一个 |
| `toggleItems` | 管理的 Toggle 列表（只读） | 遍历所有选项 |

## 常用方法

### Toggle 方法

| 方法 | 说明 |
|---|---|
| `setIsCheckedWithoutNotify(value)` | 设置选中状态但不触发 checkEvents 回调 |

### ToggleContainer 方法

| 方法 | 说明 |
|---|---|
| `activeToggles()` | 返回当前所有选中状态的 Toggle 数组 |
| `anyTogglesChecked()` | 返回是否有任意 Toggle 被选中（boolean） |
| `notifyToggleCheck(toggle, emitEvent?)` | 刷新指定 Toggle 的选中状态 |

## 高频代码

### Toggle 开关（单个复选框）

```ts
import { _decorator, Component, Toggle } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ToggleExample')
export class ToggleExample extends Component {
  @property(Toggle)
  soundToggle: Toggle | null = null;

  start() {
    if (!this.soundToggle) return;

    // 默认开启
    this.soundToggle.isChecked = true;
  }

  onSoundToggleChanged() {
    if (!this.soundToggle) return;

    if (this.soundToggle.isChecked) {
      console.log('音效已开启');
    } else {
      console.log('音效已关闭');
    }
  }
}
```

### ToggleContainer 单选组（RadioButton 行为）

```ts
import { _decorator, Component, Toggle, ToggleContainer } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ToggleGroupExample')
export class ToggleGroupExample extends Component {
  @property(ToggleContainer)
  private group: ToggleContainer | null = null;

  start() {
    if (!this.group) return;

    // 不允许全部取消选中（确保始终有一个选项被选中）
    this.group.allowSwitchOff = false;
  }

  /** 获取当前选中的选项 */
  getSelectedToggle(): Toggle | null {
    if (!this.group) return null;
    const active = this.group.activeToggles();
    return active.length > 0 ? active[0] : null;
  }

  /** 遍历所有 Toggle 选项 */
  logAllOptions() {
    if (!this.group) return;
    for (const toggle of this.group.toggleItems) {
      console.log(
        `选项 ${toggle.name}，选中状态：${toggle.isChecked}`
      );
    }
  }
}
```

### 监听 Toggle 事件（通过 checkEvents 或 Node 事件）

```ts
import { _decorator, Component, Toggle, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ToggleEventExample')
export class ToggleEventExample extends Component {
  @property(Toggle)
  toggle: Toggle | null = null;

  onEnable() {
    if (!this.toggle) return;
    this.node.on('toggle', this.onToggle, this);
  }

  onDisable() {
    this.node.off('toggle', this.onToggle, this);
  }

  private onToggle(toggle: Toggle) {
    console.log(`Toggle ${toggle.name} 选中状态：${toggle.isChecked}`);
  }

  onDestroy() {
    this.node.off('toggle', this.onToggle, this);
  }
}
```

## 常见错误

1. **Toggle 直接监听点击事件不够**：`Toggle` 继承自 `Button`，点击事件的监听方式和 Button 相同（从 Node 派发），但 Toggle 特有的勾选状态变化应该监听 `'toggle'` 事件或使用 `checkEvents`。
2. **`allowSwitchOff` 理解错误**：设为 `false` 时，单选组中至少有一个被选中，已选中的 Toggle 无法被取消选中；设为 `true` 时，用户可以取消选中所有选项。
3. **未检查 null**：`getComponent(Toggle)` 或 `@property(Toggle)` 可能为 null。
4. **`setIsCheckedWithoutNotify` 理解**：使用此方法设置 `isChecked` 不会触发 `checkEvents` 回调，适用于初始化场景但需要与用户交互区分时。
5. **ToggleContainer 自动收集子节点**：ToggleContainer 会自动将第一层子节点中带有 Toggle 组件的节点加入管理，避免手动添加。

## 关联任务

- [按钮](../api-reference/button.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - Toggle 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
