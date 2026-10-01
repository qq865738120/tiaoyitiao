---
id: cocos-3.8-scripting-module-import
version: "3.8"
category: scripting
title: 模块导入与组织
keywords:
  - import
  - 模块
  - ESM
  - cc 模块
  - 跨脚本引用
  - 导入
  - 导出
related_docs:
  - scripting/typescript-basics.md
  - scripting/ccclass-property.md
  - scripting/node-component-access.md
  - concepts/project-structure.md
related_api:
  - _decorator
  - Component
source:
  official: "Cocos Creator 3.8 官方文档 - 模块规范与示例、脚本基础"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：cc 是保留标识符，不可作为全局变量名"
status: draft
updated: 2026-06-17
---

# 模块导入与组织

## 用途

说明 Cocos Creator 3.8 中模块导入的规则、ESM 规范、`cc` 模块的特殊地位，以及脚本间引用和模块组织的推荐方式。

## 核心结论

- **引擎 API 统一从 `cc` 模块导入**，这是 3.x 唯一公开入口。
- **使用 ES Module（ESM）语法**：`import { ... } from 'cc'`，不用 CommonJS。
- **`cc` 是全局保留标识符**——不能用 `cc` 做变量名或用 `import * as cc from 'cc'`。
- **项目内脚本通过相对路径 `import`** 引用对方导出的类/变量。
- 模块加载顺序：引擎 `cc` 最先，然后是插件脚本，最后是普通脚本（按 import 依赖图并发）。

## 从 cc 模块导入

```ts
// ✅ 正确：从 cc 导入
import { _decorator, Component, Node, Label, Vec3, director, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ImportExample')
export class ImportExample extends Component {
  start() {
    const pos = new Vec3(0, 0, 0);
    this.node.setPosition(pos);
  }
}
```

```ts
// ❌ 错误：不要导入引擎内部路径
// import { Component } from 'cc/dist/cocos/core/components/component';
```

## 项目内脚本引用

### 导入其他脚本的组件类

```ts
// Player.ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('Player')
export class Player extends Component {
  hp: number = 100;

  takeDamage(damage: number) {
    this.hp -= damage;
  }
}
```

```ts
// Enemy.ts
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;
import { Player } from './Player';  // 相对路径导入

@ccclass('Enemy')
export class Enemy extends Component {
  @property({ type: Player })
  player: Player | null = null;  // 编辑器绑定引用

  attack() {
    if (this.player) {
      this.player.takeDamage(10);
    }
  }
}
```

### 全局管理脚本模式

```ts
// GameManager.ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager | null = null;

  static get instance(): GameManager | null {
    return this._instance;
  }

  score: number = 0;

  onLoad() {
    GameManager._instance = this;
  }

  onDestroy() {
    if (GameManager._instance === this) {
      GameManager._instance = null;
    }
  }

  addScore(points: number) {
    this.score += points;
  }
}
```

```ts
// 任何脚本中访问
import { GameManager } from './GameManager';

// 使用单例
if (GameManager.instance) {
  GameManager.instance.addScore(10);
}
```

## cc 保留标识符

```ts
// ❌ 错误：cc 是保留字，不能做变量名
// const cc = {};           // 隐式冲突
// import * as cc from 'cc'; // 不要这样做

// ✅ 正确：其他名称随意
import * as engineModules from 'cc';  // 可以

// cc 在局部作用域中可用
function foo() {
  const cc = { x: 0 };  // ✅ 正确：局部变量
}
```

## 什么时候使用

- 需要跨脚本引用另一个组件类。
- 需要用单例模式共享全局状态（GameManager、EventBus 等）。
- 需要理解为何不能 `import * as cc`。
- 排查"import 失败"或"加载顺序"相关问题时。

## 模块加载顺序

1. `cc` 引擎模块最先加载。
2. 插件脚本按依赖关系顺序执行。
3. 普通脚本按 import 依赖图并发加载。

**结论**：不要在 onLoad 中假设其他脚本的 import 已完成（引擎模块除外），访问其他组件走 `getComponent` 或 `@property` 绑定。

## 常见错误

1. **`import * as cc from 'cc'`**：cc 是全局保留标识符，会导致未定义行为。
2. **忘记 `export`**：类前不加 `export`，其他文件无法 import。
3. **循环依赖**：A import B，B import A，可能导致运行时拿到 undefined。解决方案：提取公共接口或使用事件解耦。
4. **import 路径写错大小写**：文件名大小写敏感，`./Player` 和 `./player` 不同。
5. **从引擎内部路径导入**：如 `import ... from 'cc/...'` 不可靠，引擎内部结构可能变化。

## 关联文档

- [TypeScript 脚本基础](./typescript-basics.md)
- [@ccclass 与 @property 详解](./ccclass-property.md)
- [访问节点和组件](./node-component-access.md)
- [项目结构](../concepts/project-structure.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 模块规范与示例、脚本基础
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——cc 保留标识符、循环依赖陷阱
