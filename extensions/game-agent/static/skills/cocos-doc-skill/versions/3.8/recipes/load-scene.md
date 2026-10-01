---
id: cocos-3.8-recipes-load-scene
version: "3.8"
category: recipes
title: 切换场景
keywords:
  - 场景切换
  - 加载场景
  - loadScene
  - 场景跳转
  - 场景管理
  - 预加载场景
related_docs:
  - api-reference/director.md
  - api-reference/resources.md
  - concepts/scene-node-component-model.md
related_api:
  - director
  - Director
  - director.loadScene
  - director.preloadScene
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 加载和切换场景"
  verified-against: []
  supplement:
    - "工程经验：场景必须加入构建列表才能通过 loadScene 加载；常驻节点用于场景间数据传递"
status: draft
updated: 2026-06-17
---

# 切换场景

## 目标

在运行时从一个场景切换到另一个场景，支持场景预加载和场景间参数传递。

## 推荐做法

1. 使用 `director.loadScene(sceneName, onLaunched?)` 进行场景切换；
2. 场景名称是编辑器中的场景文件名（不含 `.scene` 扩展名）；
3. 场景必须先添加到 **项目设置 → 场景管理** 列表中才能通过 `loadScene` 加载；
4. 需要场景间保持数据的节点使用 `director.addPersistRootNode(node)` 标记为常驻节点；
5. 需要提前加载场景时先用 `director.preloadScene(sceneName)` 预加载。

## 示例代码

### 基本场景切换

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('SceneSwitcher')
export class SceneSwitcher extends Component {
  goToGameScene() {
    director.loadScene('GameScene', (err) => {
      if (err) {
        console.error('场景加载失败:', err);
        return;
      }
      console.log('已切换到 GameScene');
    });
  }

  goToMainMenu() {
    director.loadScene('MainMenu');
  }
}
```

### 预加载场景

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('ScenePreloader')
export class ScenePreloader extends Component {
  private _nextSceneReady = false;

  start() {
    // 后台静默预加载下一场景
    director.preloadScene('Level2', () => {
      this._nextSceneReady = true;
      console.log('Level2 预加载完成');
    });
  }

  goToNextLevel() {
    // 即使预加载未完成也可以调用 loadScene，会等待预加载完成后自动切换
    director.loadScene('Level2');
  }
}
```

### 常驻节点实现场景间数据传递

```ts
import { _decorator, Component, director, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager | null = null;
  public playerScore = 0;

  static get instance(): GameManager | null {
    return GameManager._instance;
  }

  onLoad() {
    if (GameManager._instance) {
      this.node.destroy();
      return;
    }
    GameManager._instance = this;

    // 标记为常驻节点，场景切换时不销毁
    director.addPersistRootNode(this.node);
  }

  switchToResultScene() {
    director.loadScene('ResultScene');
  }
}
```

## 操作步骤

1. 确认目标场景已在 **项目设置 → 场景管理** 中添加；
2. 调用 `director.loadScene('场景名')` 进行切换；
3. 如需切换后执行初始化，传入回调函数作为第二个参数；
4. 如果场景较大或需要无缝切换，先用 `director.preloadScene` 预加载，需要时再 `loadScene`；
5. 如需在场景间保持数据，将管理节点标记为常驻节点（`director.addPersistRootNode`）。

## 验证方式

- 调用 `loadScene` 后场景正确切换，原场景节点被销毁；
- 预加载后调用 `loadScene` 无明显卡顿；
- 常驻节点在场景切换后仍存在于场景中；
- 切换后通过 `director.getScene()` 可获取当前场景对象。

## 常见错误

1. **场景未加入构建列表**：必须在 **项目设置 → 场景管理** 中勾选目标场景，否则 `loadScene` 无法找到该场景。
2. **场景名称错误**：名称需与编辑器中的场景文件名一致（不含 `.scene`），区分大小写。
3. **preloadScene 后忘记 loadScene**：`preloadScene` 只预加载资源，不会自动切换场景，必须再调用 `loadScene`。
4. **异步加载期间操作旧场景节点**：场景切换是异步的，加载过程中旧场景节点仍存在但切换后会被销毁，需注意时序。
5. **常驻节点未放在根节点**：`addPersistRootNode` 只对场景根节点的直接子节点有效，非根层级子节点设置无效。
6. **常驻节点重复添加**：场景间切换时如果重复创建同名单例，应在 `onLoad` 中检查并销毁重复实例。

## 相关文档

- [director API 卡片](../api-reference/director.md)
- [动态加载资源](./load-resource-dynamically.md)
