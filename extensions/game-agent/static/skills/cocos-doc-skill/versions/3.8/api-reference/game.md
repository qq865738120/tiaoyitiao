---
id: cocos-3.8-api-reference-game
version: "3.8"
category: api-reference
title: game
keywords:
  - game
  - 暂停游戏
  - 恢复游戏
  - 帧率设置
  - 游戏生命周期
  - 常驻节点
  - 游戏重启
  - 游戏事件
related_docs:
  - api-reference/director.md
  - api-reference/node.md
  - concepts/lifecycle-overview.md
related_api:
  - game
  - Game
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - Game"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-18
---

# game

## 用途

`game` 是 Cocos Creator 游戏应用生命周期核心单例，提供游戏暂停/恢复、帧率控制和全局事件监听等功能。与 `director` 不同，`game` 控制的是整个应用进程层面（游戏主循环），`director` 控制的是场景逻辑层面。

## 所属模块

```ts
import { game } from 'cc';
```

## 公开导出结论

- `game` 在 `cc` 模块以 `export const game: Game` 公开导出。
- `Game` 类在 `cc` 模块以 `export class Game extends EventTarget` 公开导出。
- 已验证的 `Game` 静态事件常量（基于 cc-engine 3.8 公开类型声明与引擎源码）：
  - `EVENT_HIDE`（游戏进入后台）、`EVENT_SHOW`（回到前台）—— Web 平台不保证 100% 触发。
  - `EVENT_LOW_MEMORY`—— 仅 iOS/Android 原生平台触发。
  - `EVENT_GAME_INITED`（游戏初始化完成）、`EVENT_ENGINE_INITED`（引擎初始化完成）、`EVENT_RENDERER_INITED`（渲染器初始化完成）。
  - `EVENT_PRE_BASE_INIT` / `EVENT_POST_BASE_INIT`（基础模块初始化前后）。
  - `EVENT_PRE_INFRASTRUCTURE_INIT` / `EVENT_POST_INFRASTRUCTURE_INIT`（基础设施初始化前后）。
  - `EVENT_PRE_SUBSYSTEM_INIT` / `EVENT_POST_SUBSYSTEM_INIT`（子系统初始化前后）。
  - `EVENT_PRE_PROJECT_INIT` / `EVENT_POST_PROJECT_INIT`（项目数据初始化前后）。
  - `EVENT_RESTART`（调用 restart 后触发）、`EVENT_PAUSE`（暂停）、`EVENT_RESUME`（恢复）、`EVENT_CLOSE`（游戏关闭）。
- 渲染器类型常量：`RENDER_TYPE_CANVAS`(0)、`RENDER_TYPE_WEBGL`(1)、`RENDER_TYPE_OPENGL`(2)、`RENDER_TYPE_HEADLESS`(3)。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `frameRate` | 目标帧率（可读写，number | string） | 设置/读取游戏帧率 |
| `deltaTime` | 上一帧到当前帧的时间间隔（秒，只读） | 帧无关移动/动画 |
| `totalTime` | 从游戏开始经过的总时间（毫秒，只读） | 游戏计时 |
| `frameStartTime` | 当前帧开始的时间戳（ms，只读） | 帧时间基准 |
| `config` | 当前游戏配置对象（只读，初始化后修改无效） | 读取游戏配置 |
| `renderType` | 当前渲染器后端类型（只读） | 判断渲染后端 |
| `canvas` | 游戏画布 HTMLCanvasElement | Web 平台画布访问 |
| `inited` | 引擎与渲染器是否已完成初始化（只读） | 判断引擎就绪 |

> **已弃用属性（3.4.0+）**：`frame`（游戏画布外框）、`container`（游戏画布容器），请使用 `screen` 模块替代。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `pause()` | 暂停游戏主循环（逻辑+渲染+事件派发*） | 暂停菜单/切后台 |
| `resume()` | 恢复被暂停的游戏主循环 | 恢复游戏 |
| `isPaused()` | 返回游戏是否处于暂停状态 | 判断暂停状态 |
| `step()` | 单步执行一帧（以固定帧间隔） | 逐帧调试 |
| `restart()` | 重新启动游戏，返回 Promise（异步操作） | 游戏重开 |
| `end()` | 关闭游戏窗口 | 退出游戏 |
| `on(type, callback, target, once?)` | 监听游戏事件 | 监听显示/隐藏/初始化完成 |
| `once(type, callback, target)` | 单次监听游戏事件 | 一次性事件处理 |
| `off(type, callback, target)` | 移除事件监听 | 清理事件监听 |
| `addPersistRootNode(node)` | ~~标记节点为常驻节点~~ **已弃用（3.6.0+）** → 请用 `director.addPersistRootNode` | 跨场景保持节点 |
| `removePersistRootNode(node)` | ~~取消常驻标记~~ **已弃用（3.6.0+）** → 请用 `director.removePersistRootNode` | 恢复节点随场景销毁 |
| `setFrameRate(frameRate)` | ~~设置游戏帧率~~ **已弃用（3.3.0+）** → 请用 `game.frameRate = val` | — |
| `getFrameRate()` | ~~获取帧率~~ **已弃用（3.3.0+）** → 请用 `game.frameRate` | — |

### pause() 跨平台关键边界

来自类型声明注释（已验证）：

- **原生平台（iOS/Android/Windows/Mac）**：`pause()` 暂停逻辑执行、渲染、事件派发全部三项。
- **Web 和小游戏平台**：`pause()` 暂停逻辑执行和渲染，但**不暂停输入事件派发**。这是引擎显式声明的不一致行为。
- `director.pause()` 只暂停逻辑执行，不影响渲染和事件；`game.pause()` 范围更大。
- 恢复游戏时 `resume()` 一并恢复逻辑、渲染、事件、背景音乐和音效。

### restart() 跨平台关键边界

- `restart()` 返回 `Promise<void>`，是异步操作。调用后触发 `EVENT_RESTART` 事件。
- 各平台行为差异大、缺乏官方文档，请关注实际平台表现。

## 高频代码

### 监听游戏显示/隐藏事件（切后台处理）

```ts
import { _decorator, Component, game, Game } from 'cc';

const { ccclass } = _decorator;

@ccclass('GameEventExample')
export class GameEventExample extends Component {
  onEnable() {
    game.on(Game.EVENT_HIDE, this.onGameHide, this);
    game.on(Game.EVENT_SHOW, this.onGameShow, this);
  }

  onDisable() {
    game.off(Game.EVENT_HIDE, this.onGameHide, this);
    game.off(Game.EVENT_SHOW, this.onGameShow, this);
  }

  private onGameHide() {
    // 注意：Web 平台不保证 100% 触发此事件
    console.log('游戏进入后台');
  }

  private onGameShow() {
    console.log('游戏回到前台');
  }
}
```

### 设置游戏帧率

```ts
import { _decorator, Component, game } from 'cc';

const { ccclass } = _decorator;

@ccclass('FrameRateExample')
export class FrameRateExample extends Component {
  setLowFrameRate() {
    // 3.3.0+ 推荐直接设置 frameRate 属性，替代已弃用的 setFrameRate()
    game.frameRate = 15;
  }

  setHighFrameRate() {
    game.frameRate = 60;
  }
}
```

### 常驻节点（跨场景不销毁）—— 使用 director API（推荐 3.6.0+）

```ts
import { _decorator, Component, Node, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('PersistNodeExample')
export class PersistNodeExample extends Component {
  start() {
    // 3.6.0+ 推荐使用 director.addPersistRootNode 替代 game.addPersistRootNode
    director.addPersistRootNode(this.node);
  }
}
```

### 暂停/恢复游戏

```ts
import { _decorator, Component, game } from 'cc';

const { ccclass } = _decorator;

@ccclass('PauseExample')
export class PauseExample extends Component {
  pauseGame() {
    game.pause();
    console.log('是否暂停:', game.isPaused()); // true
    // 注意：Web/小游戏平台输入事件不会被暂停
  }

  resumeGame() {
    game.resume();
  }

  async restartGame() {
    // restart 是异步操作
    await game.restart();
    console.log('游戏已重启');
  }
}
```

## 常见错误

1. **误用 game.pause 导致动画/音频全部暂停**：`game.pause()` 暂停整个游戏主循环，包括动画、音频、物理。如果只需暂停某个系统（如物理），应使用 `director.pause()` 或单独控制组件。
2. **在 Web/小游戏平台期望 pause 暂停输入**：引擎明确声明 Web 和小游戏平台上 `game.pause()` 不暂停输入事件派发，应通过业务逻辑自行处理。
3. **使用已弃用 API**：`game.addPersistRootNode`（3.6.0 弃用）→ 用 `director.addPersistRootNode`；`game.setFrameRate/getFrameRate`（3.3.0 弃用）→ 用 `game.frameRate`；`game.frame/container`（3.4.0 弃用）→ 用 `screen` 模块。
4. **未处理 restart 异步**：`game.restart()` 返回 Promise，不应假设调用后立即完成。在 restart 完成前访问引擎功能可能出错。
5. **编辑器预览和构建后 platform 不同**：编辑器预览时 `game.frameRate` 可能受编辑器帧率限制，构建到目标平台后帧率行为可能不同。

## 关联任务

- [场景管理](../api-reference/director.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - Game
- 已交叉验证：cc-engine 3.8 公开类型声明、引擎源码（cocos/game/game.ts）
- 注意：Game 类无独立官方文档，本卡片基于类型声明和引擎行为整理。restart() 跨平台行为因缺乏官方文档覆盖，仍需用户在实际目标平台上验证。
