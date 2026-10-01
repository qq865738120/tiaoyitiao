---
id: cocos-3.8-scripting-typescript-basics
version: "3.8"
category: scripting
title: TypeScript 脚本基础
keywords:
  - TypeScript
  - 脚本
  - 标准写法
  - 类型
  - null
  - 脚本模板
related_docs:
  - scripting/ccclass-property.md
  - scripting/module-import.md
  - scripting/component-lifecycle.md
  - scripting/coding-pitfalls.md
  - concepts/scene-node-component-model.md
  - concepts/lifecycle-overview.md
related_api:
  - Component
  - _decorator
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本基础、语言支持"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：标准脚本模板是入门第一道坎"
status: draft
updated: 2026-06-17
---

# TypeScript 脚本基础

## 用途

说明 Cocos Creator 3.8 中 TypeScript 脚本的标准写法、类型约定和基本规范。本文是脚本开发入口，覆盖所有组件脚本通用规则。

## 核心结论

- **脚本文件以 `.ts` 结尾**，一个文件一个类，文件名与类名建议一致。
- **组件必须继承 `Component`** 并使用 `@ccclass` 装饰，否则无法挂载到节点。
- **所有 API 从 `cc` 模块导入**，不写相对路径引引擎内部文件。
- **属性引用一律声明为可空**（`Type | null`），使用前判空。
- **不推荐在构造函数中访问 `this.node`**——此时组件尚未附加到节点。

## 标准脚本模板

```ts
import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
  @property
  speed: number = 100;

  onLoad() {
    // 初始化：可安全访问 this.node 和场景中其他节点
  }

  start() {
    // 第一次 update 前执行，初始化中间状态
  }

  update(deltaTime: number) {
    // 每帧调用，放游戏主逻辑
  }
}
```

**关键规则**：
- `import` 必须从 `cc` 导入，这是 3.x 唯一入口。
- `_decorator` 是命名空间，从中解构 `ccclass`、`property` 等装饰器。
- 类名传给 `@ccclass('...')` 必须是**全局唯一**的字符串，不同目录下同名类也会冲突。

## TypeScript 类型约定

### 属性声明与 null

```ts
import { _decorator, Component, Node, Label, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TypeExample')
export class TypeExample extends Component {
  // ✅ 正确：对象属性声明为可空
  @property(Node)
  target: Node | null = null;

  @property(Label)
  label: Label | null = null;

  // ✅ 正确：值类型直接用字面量默认值
  @property
  hp: number = 100;

  @property
  name: string = 'default';

  // 避免用 null! 掩盖未绑定引用；业务逻辑中显式判空
  @property(Node)
  optionalNode: Node | null = null;

  start() {
    // ✅ 使用前判空
    if (this.target) {
      console.log(this.target.name);
    }
  }
}
```

### 类型推导

- `number` 默认值 → 编辑器识别为浮点数（CCFloat）。
- `string` 默认值 → 编辑器识别为字符串（CCString）。
- `boolean` 默认值 → 编辑器识别为布尔值（CCBoolean）。
- 对象类型（Node、Label、SpriteFrame 等）**必须显式声明 type 参数**，否则编辑器显示 `Type(Unknown)`。

## 什么时候使用

- 新建任何组件脚本时必须遵循这个模板。
- 需要理解 why `import from 'cc'` 而不是 from 具体文件。
- 新手入门：搞清楚 @ccclass、@property 和类型声明关系。

## 关键 API / 组件

- `Component` — 所有组件基类
- `_decorator` — 装饰器命名空间
- `ccclass` — 声明 cc 类
- `property` — 声明编辑器可见属性

## 常见错误

1. **忘记 `@ccclass`**：不加这个装饰器，类不能作为组件挂载。
2. **`this.node` 在构造函数中使用**：构造函数执行时组件尚未附加到节点，`this.node` 为 undefined。
3. **类型不声明**：对象属性不指定 type，编辑器无法识别，拖拽赋值也无效。
4. **类名重复**：不同文件中的两个 `@ccclass('MyComponent')` 会冲突。
5. **从非 `cc` 路径导入引擎 API**：不要写 `import { Component } from 'cc/dist/...'`，统一从 `cc` 导入。

## 关联文档

- [@ccclass 与 @property 详解](./ccclass-property.md)
- [模块导入规则](./module-import.md)
- [组件生命周期](./component-lifecycle.md)
- [常见编码陷阱](./coding-pitfalls.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本基础、脚本使用
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——标准模板、null 安全检查模式
