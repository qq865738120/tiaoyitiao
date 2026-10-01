---
id: cocos-3.8-api-reference-edit-box
version: "3.8"
category: api-reference
title: EditBox
keywords:
  - EditBox
  - 输入框
  - 文本输入
  - 输入结束
  - 账号输入
related_docs:
  - api-reference/button.md
  - api-reference/label.md
  - troubleshooting/build-android.md
related_api:
  - EditBox
  - EditBoxComponent
  - EventHandler
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - EditBox 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "不同平台（iOS/Android/小游戏）对输入法、键盘类型、输入限制的实现存在差异，需在目标平台充分测试"
status: needs-review
updated: 2026-06-18
---
# EditBox

## 用途

EditBox 组件用于输入文本，适用于昵称输入、账号登录、兑换码、搜索框等单行/多行文本输入场景。

## 所属模块

```ts
import { EditBox } from 'cc';
```

## 公开导出结论

- `EditBox` 在 `cc` 模块以 `export class EditBox extends Component` 公开导出。
- 公开属性：`string`、`placeholder`、`textLabel`、`placeholderLabel`、`backgroundImage`、`inputFlag`、`inputMode`、`returnType`、`maxLength`、`tabIndex`。
- 事件数组：`editingDidBegan`、`textChanged`、`editingDidEnded`、`editingReturn`，均为 `EventHandler[]` 类型。
- 静态枚举：`EditBox.InputFlag`（PASSWORD / SENSITIVE / INITIAL_CAPS_WORD / INITIAL_CAPS_SENTENCE）、`EditBox.InputMode`（ANY / EMAIL_ADDR / URL / NUMERIC / PHONE_NUMBER / DECIMAL / SINGLE_LINE）、`EditBox.KeyboardReturnType`（DEFAULT / DONE / SEND / SEARCH / GO / NEXT）、`EditBox.EventType`。
- 公开方法：`setFocus()` / `focus()`（获得焦点）、`blur()`（失去焦点）、`isFocused()`（判断是否有焦点，仅 Web 可用）。
- 无类型声明、源码、官方文档之间的冲突。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `string` | 输入框的当前输入内容 | 获取/设置输入文本 |
| `placeholder` | 占位符文本 | 空输入时的提示文字 |
| `maxLength` | 最大允许字符数（`< 0` 不限制，`0` 禁止输入） | 账号/密码长度限制 |
| `inputMode` | 输入模式（单行/多行/数字/URL/邮箱/电话） | 不同输入场景 |
| `inputFlag` | 输入标志（密码/敏感/首字母大写） | 密码输入 |
| `returnType` | 移动端键盘回车键样式 | 登录/搜索键盘优化 |

## 事件数组

| 事件数组 | 说明 | 高频场景 |
|---|---|---|
| `editingDidBegan` | 开始编辑时触发 | 清空提示/记录 |
| `textChanged` | 文本变化时触发 | 实时校验/计数 |
| `editingDidEnded` | 编辑结束时触发 | 提交/验证最终值 |
| `editingReturn` | 按下回车键时触发（Windows 不支持） | 搜索/登录快捷操作 |

## 高频代码

### 获取输入框内容并监听事件

```ts
import { _decorator, Component, EditBox } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('EditBoxExample')
export class EditBoxExample extends Component {
  @property(EditBox)
  inputBox: EditBox | null = null;

  start() {
    if (!this.inputBox) return;

    // 设置初始占位符
    this.inputBox.placeholder = '请输入昵称';
    this.inputBox.maxLength = 20;
  }

  onSubmit() {
    if (!this.inputBox) return;
    console.log('当前输入内容：', this.inputBox.string);
  }

  /** 需要配合 Editor 的 EventHandler 或 Node 事件使用 */
  onEditingDidEnded(text: string) {
    console.log('输入结束：', text);
  }
}
```

### 通过代码监听 EditBox 事件（Node 级别）

```ts
import { _decorator, Component, EditBox, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('EditBoxEventExample')
export class EditBoxEventExample extends Component {
  private editBox: EditBox | null = null;

  onEnable() {
    this.editBox = this.node.getComponent(EditBox);
    if (!this.editBox) return;

    this.node.on('editing-did-began', this.onEditBegan, this);
    this.node.on('text-changed', this.onTextChanged, this);
    this.node.on('editing-did-ended', this.onEditEnded, this);
    this.node.on('editing-return', this.onEditReturn, this);
  }

  onDisable() {
    if (!this.editBox) return;

    this.node.off('editing-did-began', this.onEditBegan, this);
    this.node.off('text-changed', this.onTextChanged, this);
    this.node.off('editing-did-ended', this.onEditEnded, this);
    this.node.off('editing-return', this.onEditReturn, this);
  }

  private onEditBegan(text: string) {
    console.log('开始编辑');
  }

  private onTextChanged(text: string) {
    console.log('文本变化：', text);
  }

  private onEditEnded(text: string) {
    console.log('编辑结束，最终内容：', text);
  }

  private onEditReturn(text: string) {
    console.log('用户按下了回车键');
  }

  onDestroy() {
    this.node.off('editing-did-began', this.onEditBegan, this);
    this.node.off('text-changed', this.onTextChanged, this);
    this.node.off('editing-did-ended', this.onEditEnded, this);
    this.node.off('editing-return', this.onEditReturn, this);
  }
}
```

### 密码输入框

```ts
import { _decorator, Component, EditBox } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PasswordInputExample')
export class PasswordInputExample extends Component {
  @property(EditBox)
  passwordBox: EditBox | null = null;

  start() {
    if (!this.passwordBox) return;

    this.passwordBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    this.passwordBox.inputFlag = EditBox.InputFlag.PASSWORD;
    this.passwordBox.placeholder = '请输入密码';
    this.passwordBox.maxLength = 16;
  }

  getPassword(): string {
    return this.passwordBox ? this.passwordBox.string : '';
  }
}
```

## 常见错误

1. **未检查 EditBox 是否为 null**：`getComponent(EditBox)` 或 `@property(EditBox)` 绑定时可能为 null，使用前须检查。
2. **移动端输入法兼容性问题**：不同平台（iOS / Android / 小游戏）对输入法、键盘类型、输入限制的实现存在差异，建议在目标平台充分测试。
3. **事件数组使用在编辑器绑定**：`editingDidEnded` / `textChanged` 等是 `EventHandler[]`，在编辑器 Inspector 中绑定回调更直观；代码监听应使用 Node 事件名（`'editing-did-ended'` 等）。
4. **`maxLength` 的理解**：设为 0 时禁止输入任何字符，设为负数时不限制长度，而不是无限制。
5. **聚焦/失焦控制不生效**：`focus()` / `blur()` 在某些平台（如小游戏）可能不完全支持，需要确认目标平台能力。
6. **`isFocused()` 仅 Web 可用**：其他平台上调用可能始终返回 false。

## Android 平台兼容性说明（needs-review）

> Android 不同版本的输入法行为存在差异，以下内容基于 Cocos Creator 3.8 及官方 Android 工程升级文档，实际结果以目标设备测试为准。

### targetSdk 对 EditBox 的影响

- **targetSdk 升级到 35（Android 15）**：Google Play 要求新应用 targetSdk 版本持续更新，但较高版本可能引入软键盘弹出策略变更，导致 EditBox 输入框弹不出或输入法不兼容。
- **排查路径**：
  1. 确认当前 targetSdk 版本（构建面板 → 发布选项 → target API Level）。
  2. 参考 [Cocos Creator v3.8 Android 工程升级文档](https://docs.cocos.com/creator/3.8/manual/zh/release-notes/upgrade-3.8-android.html) 检查引擎对当前 targetSdk 的适配情况。
  3. 如存在兼容问题，可临时降级 targetSdk 到已验证版本。
  4. 检查是否需要修改 Android 原生模板中的 EditBox 子类适配代码。
- **targetSdk 不是唯一原因**：输入框弹不出可能由 UI 配置、焦点管理、厂商输入法定制等多种原因导致。详细信息参见 [Android 构建失败 - EditBox 输入框弹不出/输入法异常排查](../troubleshooting/build-android.md)。

### compileSdk 与 Gradle 版本

- **compileSdk**：决定编译时可用 API。compileSdk 过高可能导致 Android Studio 编译警告，但通常不影响运行时输入法行为。
- **Gradle / AGP 版本**：过新的 Gradle 版本可能引入构建系统的 API 变更，间接影响 EditBox 原生控件的编译路径。

**建议**：在修改 targetSdk/compileSdk/Gradle 版本前，先在测试设备上验证 EditBox 行为，确认无误后再发版。

## 关联任务

- [按钮](../api-reference/button.md)
- [文本](../api-reference/label.md)
- [Android 构建失败 - EditBox 输入框弹不出](../troubleshooting/build-android.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - EditBox 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
