---
id: cocos-3.8-api-reference-director
version: "3.8"
category: api-reference
title: director
keywords:
  - director
  - 场景管理
  - 场景切换
  - 加载场景
  - Director
related_docs:
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - recipes/load-scene.md
related_api:
  - director
  - Director
  - Scene
source:
  official: "Cocos Creator 3.8 官方文档 - 场景与节点 - Director"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: verified
updated: 2026-06-18
---

# director

## 用途

`director` 是 Cocos Creator 场景管理核心单例，提供场景加载/切换、游戏暂停/恢复、帧事件监听等功能。所有场景管理操作都通过 `director` 完成。

## 所属模块

```ts
import { director } from 'cc';
```

## 公开导出结论

- `director` 在 `cc` 模块以 `export const director: Director` 公开导出。
- `Director` 类在 `cc` 模块以 `export class Director extends EventTarget` 公开导出。
- 关键公开方法：`loadScene(sceneName, onLaunched)`、`preloadScene(sceneName, ...)`、`runSceneImmediate(scene, ...)`、`getScene()`、`pause()`、`resume()`、`end()`。
- `Director` 静态常量：`EVENT_INIT`、`EVENT_RESET`、`EVENT_BEFORE_SCENE_LOADING`、`EVENT_BEFORE_SCENE_LAUNCH`、`EVENT_AFTER_SCENE_LAUNCH`、`EVENT_BEFORE_UPDATE`、`EVENT_AFTER_UPDATE`、`EVENT_BEFORE_DRAW`、`EVENT_AFTER_DRAW`、`EVENT_BEFORE_PHYSICS`、`EVENT_AFTER_PHYSICS`、`EVENT_BEGIN_FRAME`、`EVENT_END_FRAME` 等。
- `Director.instance` 可获取单例（等价于 `director`）。
- `director.on(eventName, callback)` 可监听场景事件。

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `loadScene(sceneName, onLaunched?)` | 按场景名称加载并切换场景 | 场景切换 |
| `preloadScene(sceneName, ...)` | 预加载场景资源 | 提前加载场景减少卡顿 |
| `getScene()` | 获取当前运行的场景 | 获取场景根节点 |
| `pause()` | 暂停游戏逻辑 | 暂停菜单 |
| `resume()` | 恢复游戏逻辑 | 恢复游戏 |
| `end()` | 结束 director 执行 | 退出 |

## 高频代码

### 切换场景

```ts
import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('SceneExample')
export class SceneExample extends Component {
  goToGameScene() {
    // 切换到指定场景（场景名在编辑器构建后生效）
    director.loadScene('GameScene', (err) => {
      if (err) {
        console.error('场景加载失败:', err);
      }
    });
  }

  preloadNextScene() {
    // 预加载下一场景
    director.preloadScene('Level2', () => {
      console.log('Level2 预加载完成');
    });
  }
}
```

### 获取当前场景并遍历节点

```ts
import { _decorator, Component, director, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('CurrentSceneExample')
export class CurrentSceneExample extends Component {
  start() {
    const scene = director.getScene();
    if (!scene) return;

    // 查找 Canvas 节点
    const canvas = scene.getChildByName('Canvas');
    if (canvas) {
      console.log('Canvas 节点找到');
    }
  }
}
```

## 常见错误

1. **场景名称错误**：`loadScene` 参数是编辑器中的场景文件名（不带 `.scene`），而非场景中某个节点的名称。
2. **异步加载未处理完成回调**：`loadScene` 是异步操作，加载完成前的节点引用会在场景切换后失效。
3. **未在场景列表中注册**：只有添加到 `Project Settings -> Scene Management` 的场景才能通过 `loadScene` 加载。
4. **preloadScene 后未调用 loadScene**：`preloadScene` 只预加载资源，仍需调用 `loadScene` 才能完成场景切换。

## 关联任务

- [加载场景](../recipes/load-scene.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 场景与节点 - Director
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
