---
id: cocos-3.8-recipes-play-video
version: "3.8"
category: recipes
title: 播放视频（剧情视频/广告视频）
keywords:
  - 播放视频
  - 播放剧情视频
  - VideoPlayer使用
  - 视频播放完成
  - 怎么播放视频
  - 视频播放
  - 远程视频
  - 本地视频
related_docs:
  - api-reference/video-player.md
  - api-reference/web-view.md
  - api-reference/ui-transform.md
  - troubleshooting/video-webview-not-working.md
related_api:
  - VideoPlayer
  - VideoClip
  - VideoPlayer.EventType
  - WebView
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - VideoPlayer 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：VideoPlayer 节点必须有 UITransform 且尺寸大于 0；Web 平台自动播放需在用户交互回调中触发"
status: draft
updated: 2026-06-17
---

# 播放视频（剧情视频/广告视频）

## 目标

在游戏中通过 VideoPlayer 组件播放本地或远程视频，包括剧情过场视频、广告视频等场景。实现播放控制（播放/暂停/停止）和事件监听（播放完成、出错等）。

## 推荐做法

1. **本地视频**：将视频导入项目为 VideoClip 资源，赋值给 VideoPlayer 的 `clip` 属性，`resourceType` 设为 `LOCAL`；
2. **远程视频**：设置 `resourceType` 为 `REMOTE`，通过 `remoteURL` 指定视频 URL；
3. **Web 平台特别注意**：因浏览器 Autoplay Policy，`playOnAwake` 在首次用户交互前无效，必需在 Button 点击等用户操作回调中调用 `play()`；
4. **事件监听**：在节点上通过 `node.on(VideoPlayer.EventType.XXX, callback, target)` 监听播放事件；
5. **资源清理**：在 `onDestroy` 中调用 `stop()` 并移除事件监听。

## 前置条件

1. VideoPlayer 所在的节点**必须**有 `UITransform` 组件，且 `width` / `height` 大于 0（否则视频渲染区域为 0，画面不可见）；
2. 节点及其所有父节点的 `active` 必须为 `true`；
3. VideoPlayer 组件的 `enabled` 必须勾选；
4. 本地视频：VideoClip 资源已导入项目；
5. 远程视频：URL 可访问，视频格式受目标平台支持（推荐 MP4 / H.264）；
6. Web 平台：首次播放必须在用户交互事件（`TOUCH_END`、`MOUSE_UP`）回调中调用 `play()`。

## 示例代码

### 播放本地视频并监听完成事件

```ts
import { _decorator, Component, VideoPlayer, VideoClip, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayLocalVideo')
export class PlayLocalVideo extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  start() {
    if (!this.videoPlayer) return;

    // 绑定事件
    this.node.on(VideoPlayer.EventType.PLAYING, this.onPlaying, this);
    this.node.on(VideoPlayer.EventType.COMPLETED, this.onCompleted, this);
    this.node.on(VideoPlayer.EventType.ERROR, this.onError, this);

    // 配置本地视频
    this.videoPlayer.resourceType = VideoPlayer.ResourceType.LOCAL;
    // clip 需要在编辑器中绑定，或通过 resources.load 加载后赋值
    this.videoPlayer.playOnAwake = false;
  }

  // 此方法绑定到 UI 按钮点击
  onPlayButtonClick() {
    if (!this.videoPlayer) return;
    this.videoPlayer.play();
  }

  onPlaying() {
    console.log('剧情视频开始播放');
  }

  onCompleted() {
    console.log('剧情视频播放完毕，可以继续游戏逻辑');
  }

  onError() {
    console.error('视频播放出错，请检查视频文件和路径');
  }

  onDestroy() {
    if (this.videoPlayer) {
      this.videoPlayer.stop();
    }
    this.node.off(VideoPlayer.EventType.PLAYING, this.onPlaying, this);
    this.node.off(VideoPlayer.EventType.COMPLETED, this.onCompleted, this);
    this.node.off(VideoPlayer.EventType.ERROR, this.onError, this);
  }
}
```

### 远程广告视频播放

```ts
import { _decorator, Component, VideoPlayer } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AdVideoPlayer')
export class AdVideoPlayer extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  start() {
    if (!this.videoPlayer) return;

    // 配置远程视频
    this.videoPlayer.resourceType = VideoPlayer.ResourceType.REMOTE;
    this.videoPlayer.remoteURL = 'https://example.com/ad-video.mp4';
    this.videoPlayer.playOnAwake = false;

    // 广告通常不循环
    this.videoPlayer.loop = false;

    // 监听完成事件
    this.node.on(VideoPlayer.EventType.COMPLETED, this.onAdCompleted, this);
    this.node.on(VideoPlayer.EventType.ERROR, this.onAdError, this);
  }

  // 广告播放按钮
  playAd() {
    if (!this.videoPlayer) return;
    this.videoPlayer.play();
  }

  skipAd() {
    if (!this.videoPlayer) return;
    this.videoPlayer.stop();
    this.onAdCompleted();
  }

  onAdCompleted() {
    console.log('广告播放完成或跳过，继续游戏');
  }

  onAdError() {
    console.error('广告视频加载失败');
  }

  onDestroy() {
    if (this.videoPlayer) {
      this.videoPlayer.stop();
    }
    this.node.off(VideoPlayer.EventType.COMPLETED, this.onAdCompleted, this);
    this.node.off(VideoPlayer.EventType.ERROR, this.onAdError, this);
  }
}
```

### 动态加载本地视频

```ts
import { _decorator, Component, VideoPlayer, VideoClip, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DynamicVideoLoader')
export class DynamicVideoLoader extends Component {
  @property(VideoPlayer)
  videoPlayer: VideoPlayer | null = null;

  loadAndPlay(videoPath: string) {
    if (!this.videoPlayer) return;

    resources.load(videoPath, VideoClip, (err, clip) => {
      if (err || !clip) {
        console.error('视频资源加载失败:', err);
        return;
      }

      this.videoPlayer.resourceType = VideoPlayer.ResourceType.LOCAL;
      this.videoPlayer.clip = clip;
      this.videoPlayer.play();
    });
  }
}
```

## 操作步骤

1. 在场景中创建空节点，添加 `UITransform` 组件并设置 `width` / `height` 大于 0；
2. 在该节点上添加 `VideoPlayer` 组件；
3. 确定视频来源：
   - **本地视频**：在编辑器的 `Clip` 属性中拖入 VideoClip 资源，`ResourceType` 设为 `LOCAL`；
   - **远程视频**：`ResourceType` 设为 `REMOTE`，通过代码或编辑器设置 `RemoteURL`；
4. 按需配置 `playOnAwake`、`loop`、`volume` 等属性；
5. 编写脚本，在节点上监听 `VideoPlayer.EventType` 事件（`PLAYING` / `COMPLETED` / `ERROR` 等）；
6. 调用 `play()` 播放视频；
7. 在 `onDestroy` 中调用 `stop()` 并移除事件监听。

## 验证方式

- 场景运行后能看到视频画面正常渲染；
- 视频播放时能听到对应音频（未静音且音量大于 0）；
- `COMPLETED` 事件在视频播放完毕后正确触发；
- 暂停/恢复/停止功能正常工作；
- `isPlaying` 在播放时返回 `true`；
- Web 平台在用户交互回调中触发首次播放，无浏览器拦截警告。

## 常见错误

1. **视频画面不显示** — 最常见原因是节点没有 `UITransform` 组件或尺寸为 0；其次是 VideoPlayer 组件的 `enabled` 未勾选。
2. **本地远程路径混淆** — 本地视频用 `clip` + `ResourceType.LOCAL`，远程视频用 `remoteURL` + `ResourceType.REMOTE`，不能混用。
3. **Web 平台自动播放失败** — 浏览器安全策略阻止非用户交互触发的视频播放。必须在 `TOUCH_END` / `MOUSE_UP` 事件回调中首次调用 `play()`。
4. **视频格式不支持** — 不同平台支持的视频编码不同。Web 平台推荐 MP4（H.264），原生平台建议测试确认兼容性。
5. **resources.load 路径错误** — 加载路径不带文件扩展名：`resources.load('video/intro', VideoClip, callback)`。

## 相关文档

- [VideoPlayer API 卡片](../api-reference/video-player.md)
- [WebView API 卡片](../api-reference/web-view.md)
- [视频/网页不工作排查](../troubleshooting/video-webview-not-working.md)
