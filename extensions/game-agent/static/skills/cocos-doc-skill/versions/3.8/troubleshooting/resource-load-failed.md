---
id: cocos-3.8-troubleshooting-resource-load-failed
version: "3.8"
category: troubleshooting
title: resources.load 加载不到资源
keywords:
  - resources.load 加载不到资源
  - 资源加载失败
  - 资源找不到
  - resources.load null err
  - 动态加载资源失败
related_docs:
  - troubleshooting/prefab-instantiate-failed.md
  - api-reference/resources.md
  - api-reference/asset-manager.md
  - recipes/load-resource-dynamically.md
  - recipes/release-resource.md
related_api:
  - resources.load
  - resources
  - assetManager
  - Asset
  - Prefab
  - SpriteFrame
source:
  official: "Cocos Creator 3.8 官方文档 - 资源系统 - 动态加载"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：资源路径、目录命名、类型匹配是加载失败的高频原因"
status: draft
updated: 2026-06-17
---

# resources.load 加载不到资源

## 现象

调用 `resources.load(path, type, callback)` 时回调返回错误，或 `resources.load` 返回的 `Promise` 被拒绝，资源加载失败。常见表现是 `err` 不为 `null`，或加载到的资源为 `undefined`。

## 最可能原因

1. **资源路径错误** — 资源路径不以 `resources/` 开头（调用 `resources.load` 时路径应相对于 `assets/resources` 目录，不包含 `resources/` 前缀），或路径中的大小写、分隔符有误。Cocos Creator 3.8 中资源路径使用 `/` 作为分隔符。

2. **资源未放入 resources 目录** — 只有放在 `assets/resources/` 目录（或其子目录）下的资源才能通过 `resources.load` 动态加载。放在 `assets/` 其他位置（如 `assets/scenes/`、`assets/textures/`）的资源无法被 `resources.load` 找到，只能通过引用绑定或 `assetManager` 远程加载。

3. **类型参数不匹配** — `resources.load` 的第二个参数 `type` 指定的类型与资源实际类型不一致。例如图片资源加载时指定了 `Prefab` 类型，或使用了 `SpriteFrame` 但实际资源是 `Texture2D`。

4. **异步时序问题** — 在场景 `start()` 中使用 `resources.load` 时没有通过 Promise 或回调等待加载完成，就直接使用返回的资源。

5. **资源依赖未自动加载** — 某些资源（如 `.prefab`、`.fire`）依赖其他资源，当依赖资源未打包入同一个 Bundle 时，可能导致加载失败。

## 快速检查

- [ ] 确认资源文件确实在 `assets/resources/` 目录下。
- [ ] 检查 `resources.load` 的路径参数，以 `resources/` 为根写相对路径，例如资源在 `assets/resources/images/hero.png`，则路径参数为 `images/hero`。
- [ ] 确认资源路径中不使用文件扩展名（如 `.png`、`.prefab`）。
- [ ] 确认 `type` 参数正确，例如加载 Prefab 时传 `Prefab`，加载 SpriteFrame 时传 `SpriteFrame`。
- [ ] 确认资源已放入 Build 的 Bundle 中（编辑器构建面板中检查资源是否被排除）。

## 解决方案

```ts
import { _decorator, Component, resources, Prefab, Node, instantiate } from 'cc';

const { ccclass } = _decorator;

@ccclass('ResourceLoader')
export class ResourceLoader extends Component {
  start() {
    // 正确用法：路径相对于 assets/resources，不加扩展名
    resources.load('prefabs/Enemy', Prefab, (err: Error | null, prefab: Prefab | null) => {
      if (err) {
        console.error('加载失败:', err.message);
        return;
      }
      if (!prefab) return;
      const node = instantiate(prefab);
      this.node.addChild(node);
    });
  }
}
```

路径验证清单：

| 资源位置 | 正确路径 | 错误路径 |
|---|---|---|
| `assets/resources/prefabs/Enemy.prefab` | `prefabs/Enemy` | `resources/prefabs/Enemy` 或 `Enemy` |
| `assets/resources/images/hero.png` | `images/hero` | `images/hero.png` |
| `assets/scenes/Game.fire` | 无法用 `resources.load` | 需要在 `director.loadScene` 或绑定引用 |

## 仍未解决时

- 执行编辑器菜单 `开发者 -> 打开调试工具 (DevTools)`，在网络面板查看资源加载请求是否成功。
- 检查编辑器 Console 是否有资源导入失败的提示。
- 使用 `assetManager` 的 `loadAny` 或 `loadRemote` 作为替代方案。
- 确认构建时资源是否被正确打包（查看 `build/{platform}/assets/` 目录或 Bundle 目录）。

## 相关文档

- [resources API 卡片](../api-reference/resources.md)
- [assetManager API 卡片](../api-reference/asset-manager.md)
- [动态加载资源任务](../recipes/load-resource-dynamically.md)
- [Prefab 实例化失败](../troubleshooting/prefab-instantiate-failed.md)
