---
id: cocos-3.8-scene-node-component-scene-loading
version: "3.8"
category: scene-node-component
title: 场景加载：设计与流程
keywords:
  - 场景加载
  - loadScene
  - preloadScene
  - 场景切换
  - 常驻节点
  - 场景管理
related_docs:
  - api-reference/director.md
  - recipes/load-scene.md
  - concepts/scene-node-component-model.md
  - scene-node-component/destroy-lifecycle.md
related_api:
  - director
  - Director
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 加载和切换场景"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：场景必须加入构建列表；常驻节点用于场景间数据传递"
status: draft
updated: 2026-06-17
---

# 场景加载：设计与流程

## 用途

说明 Cocos Creator 中场景切换的机制、前置条件和常用流程设计。切换场景的详细步骤见 [切换场景 Recipe](../recipes/load-scene.md)。

## 核心结论

- **场景由 `director` 管理**，通过 `director.loadScene()` 切换场景。
- **场景必须先加入构建列表**（项目设置 → 场景管理）才能通过名称加载。
- **`preloadScene` 预加载资源**但不切换，可实现后台静默加载、减少切换卡顿。
- **常驻节点**（`director.addPersistRootNode`）在场景切换时不被销毁，用于保存场景间共享数据。
- 场景切换是**异步**的，加载期间旧场景节点仍存在。

## 场景切换的前置条件

1. 目标场景文件已创建并保存在 `assets/` 目录下。
2. 目标场景已添加到 **项目设置 → 场景管理** 列表中（勾选）。
3. `loadScene` 使用场景文件名（不含 `.scene` 扩展名）。

```ts
// 如果场景文件名为 "Level2.scene"，调用时用：
director.loadScene('Level2');
```

## 场景切换流程

```
当前场景运行 → loadScene('TargetScene') → 异步加载资源 → 销毁当前场景节点
                                                              ↓
                                        常驻节点保留 ←─ 非持久节点被销毁
                                                              ↓
                                          新场景初始化 → onLoad → start → update
```

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('SceneLoader')
export class SceneLoader extends Component {
  // 基本切换，带回调
  goToLevel(levelName: string) {
    director.loadScene(levelName, (err) => {
      if (err) {
        console.error(`场景 ${levelName} 加载失败:`, err);
        return;
      }
      console.log(`已进入 ${levelName}`);
    });
  }
}
```

## 预加载策略

对于较大的场景，先 `preloadScene` 再 `loadScene` 可减少切换时的卡顿：

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('ScenePreloader')
export class ScenePreloader extends Component {
  private _nextReady = false;

  start() {
    // 进入当前场景后立即预加载下一个场景的资源
    director.preloadScene('Level2', () => {
      this._nextReady = true;
    });
  }

  goToNextLevel() {
    // loadScene 会等待预加载完成后自动切换
    director.loadScene('Level2');
  }
}
```

## 常驻节点：场景间数据传递

场景切换时，所有非持久节点都会被销毁。需要在场景间保持数据的节点必须标记为常驻：

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager | null = null;
  public playerScore = 0;

  static get instance(): GameManager | null {
    return GameManager._instance;
  }

  onLoad() {
    // 单例：重复创建时销毁自身
    if (GameManager._instance) {
      this.node.destroy();
      return;
    }
    GameManager._instance = this;

    // 标记为常驻节点
    director.addPersistRootNode(this.node);

    // 注意：常驻节点必须是场景根节点的直接子节点
  }
}
```

**常驻节点注意事项**：
- 只有场景根节点的直接子节点才能被 `addPersistRootNode` 标记。
- 常驻节点在切换场景时不会触发 `onDestroy`。
- 不再需要时应调用 `director.removePersistRootNode` 并手动销毁。

## 设计权衡

| 问题 | 建议 |
|---|---|
| 单场景 vs 多场景 | 简单游戏可用单场景 + Prefab 切换；复杂游戏用多场景分离逻辑 |
| 同步切换 vs 预加载 | 大场景必须预加载；小场景可直接 loadScene |
| 数据传递方式 | 常驻节点单例（推荐）、全局变量、本地存储 |

## 关联文档

- [切换场景（Recipe）](../recipes/load-scene.md)
- [director API 卡片](../api-reference/director.md)
- [场景、节点与组件模型（概念）](../concepts/scene-node-component-model.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本系统 - 加载和切换场景
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——场景必须加入构建列表；常驻节点用于场景间数据传递；单例防重复创建
