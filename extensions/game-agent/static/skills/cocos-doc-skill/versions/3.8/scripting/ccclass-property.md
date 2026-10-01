---
id: cocos-3.8-scripting-ccclass-property
version: "3.8"
category: scripting
title: @ccclass 与 @property 详解
keywords:
  - ccclass
  - property
  - 装饰器
  - 属性检查器
  - 暴露属性
  - 序列化
  - 编辑器绑定
  - type 参数
  - visible
related_docs:
  - scripting/typescript-basics.md
  - scripting/module-import.md
  - scripting/node-component-access.md
  - api-reference/component.md
related_api:
  - _decorator
  - Component
  - CCInteger
  - CCFloat
  - CCString
  - CCBoolean
source:
  official: "Cocos Creator 3.8 官方文档 - 装饰器使用"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：type 参数是属性面板正确显示的必备条件"
status: draft
updated: 2026-06-17
---

# @ccclass 与 @property 详解

## 用途

说明 `@ccclass` 和 `@property` 装饰器的作用、参数和使用场景。这两个装饰器是脚本与编辑器交互的桥梁。

## 核心结论

- **`@ccclass` 把普通 class 变成 cc 类**，使其可序列化、可挂载、可通过类名查找。
- **`@property` 把属性暴露到属性检查器**，让策划/美术在编辑器中调整。
- 对象类型属性**必须显式指定 type 参数**，否则编辑器无法识别。
- 属性名以 `_` 开头默认不在面板显示（仍可序列化），除非显式设 `visible: true`。

## @ccclass

### 基本用法

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('MyComponent')  // 类名必须全局唯一
export class MyComponent extends Component { }
```

### 常用组件类装饰器

除了 `@ccclass`，`_decorator` 还提供组件级装饰器：

| 装饰器 | 作用 | 默认值 |
|---|---|---|
| `@executeInEditMode(true)` | 编辑器模式下也执行生命周期回调 | false |
| `@requireComponent(Sprite)` | 添加组件时自动补上依赖组件 | 无 |
| `@executionOrder(-1)` | 控制生命周期执行优先级（越小越先） | 0 |
| `@disallowMultiple(true)` | 同一节点禁止重复添加 | false |
| `@menu('Custom/MyComp')` | 在"添加组件"菜单中显示 | 无 |

```ts
import { _decorator, Component, Sprite } from 'cc';
const { ccclass, executeInEditMode, requireComponent, executionOrder, disallowMultiple, menu } = _decorator;

@ccclass('AdvancedComponent')
@executeInEditMode(true)
@requireComponent(Sprite)
@executionOrder(-1)
@disallowMultiple(true)
@menu('Custom/AdvancedComponent')
export class AdvancedComponent extends Component { }
```

## @property

### 基本用法

```ts
import { _decorator, Component, Node, Label, CCInteger, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PropertyExample')
export class PropertyExample extends Component {
  // 1. 基础类型——可不声明 type，编辑器自动推导
  @property
  speed: number = 100;  // → 识别为 CCFloat

  @property
  name: string = 'hello';  // → 识别为 CCString

  // 2. 对象类型——必须声明 type
  @property(Node)
  target: Node | null = null;

  @property(Label)
  uiLabel: Label | null = null;

  // 3. 强制指定整数
  @property(CCInteger)
  level: number = 1;

  // 4. 完整参数写法
  @property({ type: Node, tooltip: '拖入目标节点' })
  enemy: Node | null = null;
}
```

### 常用参数

| 参数 | 说明 | 示例 |
|---|---|---|
| `type` | 属性类型，对象类型必填 | `@property(Node)` |
| `visible` | 是否在面板显示，覆盖 `_` 规则 | `@property({ visible: false })` |
| `tooltip` | 鼠标悬停提示 | `@property({ tooltip: '说明文字' })` |
| `readonly` | 只读（面板不可编辑） | `@property({ readonly: true })` |
| `serializable` | 是否序列化（默认 true） | `@property({ serializable: false })` |
| `group` | 属性分组 | `@property({ group: { name: '战斗' } })` |
| `override` | 覆盖父类同名属性时必加 | `@property({ override: true })` |

### 数组属性

以下代码片段省略了 `@ccclass` 类壳和 `_decorator` 解构，实际使用时请参考完整示例。

<!-- skip-content-quality: TS_PROPERTY_NO_DESTRUCTURE, TS_MISSING_IMPORT_FROM_CC -->
```ts
// Node 数组
@property({ type: [Node] })
waypoints: Node[] = [];

// 整数数组
@property({ type: [CCInteger] })
scores: number[] = [];
```

### 私有属性可见性

以下代码片段省略了 `@ccclass` 类壳和 `_decorator` 解构，实际使用时请参考完整示例。

<!-- skip-content-quality: TS_PROPERTY_NO_DESTRUCTURE, TS_MISSING_IMPORT_FROM_CC -->
```ts
// 默认：_ 开头不在面板显示，但仍然序列化
@property
_hiddenValue: number = 0;

// 强制显示
@property({ visible: true })
private _shownValue: number = 0;
```

## 什么时候使用

- **`@ccclass`**：每个组件脚本必备。
- **`@property`**：需要编辑器中可视调整的变量。
- **`@property(Node)` / `@property(Label)` 等**：需要编辑器拖拽绑定引用的场景——这是**推荐优先级最高的跨组件引用方式**。
- **`@executionOrder`**：有严格初始化顺序需求时。
- **`@disallowMultiple`**：同一节点不需要重复挂载时。

## 常见错误

1. **对象类型不声明 type**：`@property enemy: Node | null = null` 缺少 `(Node)`，编辑器无法识别。
2. **属性名带 `_` 后困惑为何面板看不见**：前缀 `_` 默认隐藏，应避免用于面板属性。
3. **`@property(String)` 错误使用 JS 构造函数**：应使用 `CCString` 或不声明（`string` 默认值自动推导）。
4. **`override` 缺失**：子类覆盖父类属性时忘记加 `override: true`，触发警告。
5. **`@ccclass` 类名重复**：两个不同文件用同一个类名字符串会导致冲突。

## 关联文档

- [TypeScript 脚本基础](./typescript-basics.md)
- [模块导入规则](./module-import.md)
- [访问节点和组件](./node-component-access.md)
- [Component API 卡片](../api-reference/component.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 装饰器使用
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——type 参数和 null 安全检查模式
