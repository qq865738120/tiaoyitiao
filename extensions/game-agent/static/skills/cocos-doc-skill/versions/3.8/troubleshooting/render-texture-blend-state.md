---
id: cocos-3.8-troubleshooting-render-texture-blend-state
version: "3.8"
category: troubleshooting
title: RenderTexture 原生端报错（blendState / _onPassesUpdated）
keywords:
  - RenderTexture 报错
  - blendState
  - _onPassesUpdated
  - RenderTexture Android
  - RenderTexture 场景切换
  - targetTexture 报错
  - SpriteFrame 加载报错
  - RenderTexture 崩溃
  - RenderTexture 不显示
related_docs:
  - api-reference/camera.md
  - api-reference/sprite.md
  - api-reference/material.md
  - troubleshooting/3d-object-not-visible.md
  - concepts/render-pipeline-version-boundary.md
related_api:
  - RenderTexture
  - Camera.targetTexture
  - SpriteFrame.texture
  - Sprite.spriteFrame
  - Material
source:
  official: ""
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "论坛来源：3.8.7/3.8.8 原生 Android 场景切换后 RenderTexture + SpriteFrame 加载纹理时出现 blendState / _onPassesUpdated 报错。来源：forum.cocos.org（ev-411）"
    - "此结论待复核 — blendState 报错需在目标平台人工复现"
status: needs-review
updated: 2026-06-18
---

# RenderTexture 原生端报错（blendState / _onPassesUpdated）

> **注意**：本文档结论待复核。RenderTexture blendState 报错需在 3.8.7/3.8.8 原生 Android 平台人工复现确认。建议结合当前 Cocos Creator 版本和官方引擎发布说明核实。

## 现象

在 Cocos Creator 3.8.7 / 3.8.8 原生 Android 平台，使用 `RenderTexture` + `Camera.targetTexture` + `SpriteFrame` 的组合时出现以下一种或多种现象：

- `blendState` 相关报错或运行时崩溃。
- `_onPassesUpdated` 方法内部报错。
- 场景切换后 `RenderTexture` 创建的纹理无法正常加载到 `SpriteFrame`。
- 原生 Android 端出现渲染异常或闪退，Web 预览正常。

## 最可能原因

1. **引擎 3.8.7 / 3.8.8 原生端渲染管线 Bug** — 该报错在特定版本的原生 Android 平台出现，与 `RenderTexture` 内部渲染状态（`blendState`）的跨场景生命周期管理有关。Web 预览不受影响。
2. **场景切换后 RenderTexture 资源生命周期未处理** — 场景切换时 `RenderTexture` 对象被销毁或在 GPU 端失效，但 `SpriteFrame.texture` 仍持有旧引用。
3. **材质更新缓存未刷新** — `_onPassesUpdated` 内部逻辑在特定条件下缓存了失效的 Pass 状态，导致切换场景后触发断言或空指针。

## 快速检查

- [ ] 确认问题只在原生 Android 平台出现，Web 预览是否正常（如果 Web 也报错，问题更可能在用法层面）。
- [ ] 确认 Cocos Creator 版本是否为 3.8.7 或 3.8.8（更早或更晚版本可能不涉及此 Bug）。
- [ ] 确认是否是在场景切换（`director.loadScene` / `director.runScene`）后触发的报错。
- [ ] 检查 `Camera.targetTexture` 是否在场景切换时被重置为 `null` 或未重新分配新的 `RenderTexture`。
- [ ] 检查 `SpriteFrame.texture` 在场景切换后是否仍指向旧的 `RenderTexture` 实例。

## 解决方案

### 1. 提供最小复现 Demo

由于此问题为特定版本的原生渲染层 Bug，**官方响应表明需要提交 GitHub Issue + 最小复现 Demo**。在提交前：

```ts
import { _decorator, Component, RenderTexture, Camera, SpriteFrame, Sprite } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RenderTextureRepro')
export class RenderTextureRepro extends Component {
    @property(Camera)
    captureCamera: Camera | null = null;

    @property(Sprite)
    displaySprite: Sprite | null = null;

    start() {
        // 创建 RenderTexture（示例用法）
        const rt = new RenderTexture();
        rt.initialize({
            width: 256,
            height: 256,
        });

        if (this.captureCamera) {
            this.captureCamera.targetTexture = rt;
        }

        if (this.displaySprite) {
            const sf = new SpriteFrame();
            sf.texture = rt;
            this.displaySprite.spriteFrame = sf;
        }
    }
}
```

如果场景切换后复现报错，将该代码放入最小 Demo 项目并提交到 GitHub Issue。

### 2. 场景切换时重新创建 RenderTexture

在场景切换（`director.on('sceneChange')`）后重新创建 `RenderTexture` 并重新赋值：

```ts
import { _decorator, Component, RenderTexture, Camera, SpriteFrame, Sprite, director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RenderTextureManager')
export class RenderTextureManager extends Component {
    @property(Camera)
    captureCamera: Camera | null = null;

    @property(Sprite)
    displaySprite: Sprite | null = null;

    private _rt: RenderTexture | null = null;

    onLoad() {
        this.initRenderTexture();
        director.on('sceneChange', this.onSceneChange, this);
    }

    onDestroy() {
        director.off('sceneChange', this.onSceneChange, this);
        this.releaseRenderTexture();
    }

    private initRenderTexture() {
        this.releaseRenderTexture();

        this._rt = new RenderTexture();
        this._rt.initialize({ width: 256, height: 256 });

        if (this.captureCamera) {
            this.captureCamera.targetTexture = this._rt;
        }

        if (this.displaySprite) {
            const sf = new SpriteFrame();
            sf.texture = this._rt;
            this.displaySprite.spriteFrame = sf;
        }
    }

    private releaseRenderTexture() {
        if (this.captureCamera) {
            this.captureCamera.targetTexture = null;
        }
        if (this._rt) {
            this._rt.destroy();
            this._rt = null;
        }
    }

    private onSceneChange() {
        // 场景切换后重新初始化
        this.initRenderTexture();
    }
}
```

### 3. 降级方案

- 如果 `RenderTexture` + `SpriteFrame` 的渲染到纹理需求在原生 Android 端强烈受阻，可考虑改用**多相机渲染到不同显示区域**的方案（不经过 `RenderTexture` 中转）。
- 单机游戏场景可尝试升级到修复版本（需关注 GitHub Issue 修复情况）。

## 仍未解决时

- 在 Cocos 论坛搜索 `RenderTexture blendState` 和 `_onPassesUpdated` 查看最新的官方修复进展。
- 提交最小复现项目到 [Cocos Engine GitHub Issues](https://github.com/cocos/cocos-engine/issues) 并附上完整的复现步骤、平台信息和版本号。
- 确认是否使用了自定义渲染管线或后处理效果，这些可能加重了渲染状态生命周期管理问题。
- 尝试在更早的 3.8.x 版本（如 3.8.5）上测试，确认是否是 3.8.7/3.8.8 引入的回归。

## 相关文档

- [Camera API 卡片 - targetTexture](../api-reference/camera.md)
- [Sprite API 卡片](../api-reference/sprite.md)
- [3D 对象不可见排查](3d-object-not-visible.md)
- [材质不更新](material-not-updated.md)
- [渲染管线版本边界](../concepts/render-pipeline-version-boundary.md)
