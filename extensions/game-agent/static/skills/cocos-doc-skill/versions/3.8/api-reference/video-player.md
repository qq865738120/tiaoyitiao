---
id: cocos-3.8-api-reference-video-player
version: "3.8"
category: api-reference
title: VideoPlayer
keywords:
  - VideoPlayer
  - 视频播放
  - 播放视频
  - 视频组件
  - 视频不播放
  - 暂停视频
  - 视频事件
related_docs:
  - api-reference/ui-transform.md
  - recipes/play-video.md
related_api:
  - VideoPlayer
  - VideoClip
  - VideoPlayer.EventType
  - VideoPlayer.ResourceType
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - VideoPlayer 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# VideoPlayer

## 用途

VideoPlayer 组件用于在游戏中播放视频，支持本地视频文件（VideoClip）和远程视频 URL。Web 和原生平台各有后端实现，不同平台支持程度有差异。

## 所属模块

```ts
import { VideoPlayer, VideoClip } from 'cc';
```

## 公开导出结论

- `VideoPlayer` 在 `cc` 模块以 `export class VideoPlayer extends Component` 公开导出。
- 资源类型通过 `VideoPlayer.ResourceType` 静态对象区分：`REMOTE`（远程 URL）和 `LOCAL`（本地文件路径）。
- 事件类型通过 `VideoPlayer.EventType` 静态属性暴露，等同于 `_cocos_video_video_player_enums__EventType` 枚举。
- 公开属性（全部 getter/setter）：`resourceType`、`remoteURL`、`clip`、`playOnAwake`、`playbackRate`、`volume`、`mute`、`loop`、`keepAspectRatio`、`fullScreenOnAwake`、`stayOnBottom`、`currentTime`（get/set）、`duration`（只读）、`state`（只读）、`isPlaying`（只读）、`nativeVideo`（只读）。
- 公开方法：`play()`、`resume()`、`pause()`、`stop()`。
- 公开事件回调数组：`videoPlayerEvent`（`EventHandler[]` 类型，通过编辑器或代码绑定回调）。
- 基础资源类型：`VideoClip extends Asset`，包含 `_duration` 和 `_nativeAsset` 属性。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `clip` | 本地视频文件（VideoClip） | 播放项目内的本地视频 |
| `remoteURL` | 远程视频 URL | 播放网络视频流 |
| `resourceType` | 视频来源类型（REMOTE / LOCAL） | 区分本地/远程来源 |
| `playOnAwake` | 加载后是否自动播放 | 自动播放剧情视频 |
| `loop` | 是否循环播放 | 循环背景视频 |
| `volume` | 音量（0.0 ~ 1.0） | 控制音量大小 |
| `mute` | 是否静音 | 静音开关 |
| `playbackRate` | 播放速率（0.0 ~ 10.0） | 快放/慢放 |
| `currentTime` | 当前播放进度（秒，get/set） | 跳转到指定时间点 |
| `duration` | 视频总时长（秒，只读） | 进度条最大值 |
| `isPlaying` | 是否正在播放（只读） | 播放状态判断 |
| `keepAspectRatio` | 是否保持原始宽高比 | 避免画面拉伸 |
| `fullScreenOnAwake` | 是否全屏播放 | 全屏视频播放 |
| `stayOnBottom` | 是否始终在游戏视图最底层（仅 Web） | 视频作为背景层 |
| `nativeVideo` | 原始 HTMLVideoElement 对象（只读） | 高级定制 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `play()` | 开始播放；已播放则重播，已暂停则恢复 | 播放/恢复视频 |
| `resume()` | 继续播放（暂停后恢复） | 暂停后继续播放 |
| `pause()` | 暂停播放 | 暂停视频 |
| `stop()` | 停止播放 | 停止视频 |

## 事件类型（VideoPlayer.EventType）

| 事件 | 值 | 说明 |
|---|---|---|
| `PLAYING` | `"playing"` | 视频播放中 |
| `PAUSED` | `"paused"` | 视频暂停中 |
| `STOPPED` | `"stopped"` | 视频停止中 |
| `COMPLETED` | `"completed"` | 视频播放完毕 |
| `META_LOADED` | `"meta-loaded"` | 视频元数据加载完毕 |
| `READY_TO_PLAY` | `"ready-to-play"` | 视频加载完毕可播放 |
| `ERROR` | `"error"` | 处理视频时出错 |
| `CLICKED` | `"clicked"` | 视频被点击 |

事件绑定通过节点的 `node.on(VideoPlayer.EventType.XXX, callback, target)` 方式注册（与 Button 等组件规则一致，事件从节点派发），或在编辑器 `videoPlayerEvent` 数组中配置 `EventHandler`。

## 资源类型（VideoPlayer.ResourceType）

```ts
VideoPlayer.ResourceType = {
  REMOTE: number, // 远程视频 URL
  LOCAL: number,  // 本地视频路径
};
```

## 高频代码

### 播放本地视频

```ts
import { _decorator, Component, VideoPlayer } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LocalVideoExample')
export class LocalVideoExample extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  start() {
    if (!this.videoPlayer) return;

    // 本地视频使用 clip 属性
    // 需要在编辑器中直接将 VideoClip 资源拖入 Clip 属性
    // 或代码中通过 resources.load 加载后赋值

    // 绑定事件
    this.node.on(VideoPlayer.EventType.PLAYING, this.onPlaying, this);
    this.node.on(VideoPlayer.EventType.COMPLETED, this.onCompleted, this);
    this.node.on(VideoPlayer.EventType.ERROR, this.onError, this);

    this.videoPlayer.play();
  }

  onPlaying() {
    console.log('视频开始播放');
  }

  onCompleted() {
    console.log('视频播放完毕');
  }

  onError() {
    console.error('视频播放出错');
  }

  onDestroy() {
    this.node.off(VideoPlayer.EventType.PLAYING, this.onPlaying, this);
    this.node.off(VideoPlayer.EventType.COMPLETED, this.onCompleted, this);
    this.node.off(VideoPlayer.EventType.ERROR, this.onError, this);
  }
}
```

### 播放远程视频

```ts
import { _decorator, Component, VideoPlayer } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RemoteVideoExample')
export class RemoteVideoExample extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  start() {
    if (!this.videoPlayer) return;

    // 远程视频使用 remoteURL
    this.videoPlayer.resourceType = VideoPlayer.ResourceType.REMOTE;
    this.videoPlayer.remoteURL = 'https://example.com/video.mp4';
    this.videoPlayer.play();
  }
}
```

### 暂停/恢复/停止视频

```ts
import { _decorator, Component, VideoPlayer } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('VideoControlExample')
export class VideoControlExample extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  pauseVideo() {
    if (!this.videoPlayer) return;
    this.videoPlayer.pause();
  }

  resumeVideo() {
    if (!this.videoPlayer) return;
    this.videoPlayer.resume();
  }

  stopVideo() {
    if (!this.videoPlayer) return;
    this.videoPlayer.stop();
  }
}
```

### 检查视频播放状态

```ts
import { _decorator, Component, VideoPlayer } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('VideoStatusExample')
export class VideoStatusExample extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  checkStatus() {
    if (!this.videoPlayer) return;

    if (this.videoPlayer.isPlaying) {
      console.log(`当前进度: ${this.videoPlayer.currentTime} 秒`);
      console.log(`总时长: ${this.videoPlayer.duration} 秒`);
    }
  }
}
```

## 常见错误

1. **路径混淆：本地视频用 `remoteURL`，远程视频用 `clip`** — 本地视频必须将 VideoClip 资源赋值给 `clip` 属性，`resourceType` 设为 `LOCAL`；远程视频需要通过 `remoteURL` 设置 URL，`resourceType` 设为 `REMOTE`。两者不能混用。

2. **未设置 UITransform 尺寸** — VideoPlayer 节点必须有 `UITransform` 组件且 `width`/`height` 大于 0，否则视频渲染区域为 0，画面不可见。

3. **自动播放被浏览器拦截** — Web 平台浏览器 Autoplay Policy 会阻止 `playOnAwake` 自动播放。必须在用户交互事件（点击/触摸）的回调中调用 `play()`。

4. **组件 enabled 未勾选** — VideoPlayer 组件的 `enabled` 属性必须为 `true`，否则组件不工作。

5. **视频格式不支持** — 各平台支持的视频格式不同。Web 平台推荐使用 MP4（H.264 编码），原生平台可能需要其他格式。建议在目标平台上充分测试。

6. **全屏播放影响用户体验** — `fullScreenOnAwake = true` 时视频会全屏播放，用户可能无法操作游戏，需谨慎使用。

## 关联任务

- [播放视频](../recipes/play-video.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - VideoPlayer 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
