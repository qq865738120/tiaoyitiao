---
id: cocos-3.8-api-reference-audio-source
version: "3.8"
category: api-reference
title: AudioSource
keywords:
  - AudioSource
  - 音频
  - 音效
  - 播放音频
  - 背景音乐
related_docs:
  - api-reference/resources.md
  - recipes/play-audio.md
related_api:
  - AudioSource
  - AudioClip
source:
  official: "Cocos Creator 3.8 官方文档 - 音频系统 - AudioSource"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# AudioSource

## 用途

AudioSource 组件用于播放音频（背景音乐和音效），支持播放、暂停、停止、循环、音量控制等功能。一个节点上可以挂载多个 AudioSource 实现多音源播放。

## 所属模块

```ts
import { AudioSource, AudioClip } from 'cc';
```

## 公开导出结论

- `AudioSource` 在 `cc` 模块以 `export class AudioSource extends Component` 公开导出。
- 关键属性（全部 getter/setter）：`clip`、`loop`、`playOnAwake`、`volume`、`currentTime`（get/set）、`duration`（只读）。
- 关键公开方法：`play()`、`pause()`、`stop()`、`playOneShot(clip, volumeScale?)`、`getPCMData(channelIndex)`、`getSampleRate()`、`getCurrentState()`。
- `AudioSource.EventType` 类型为 `typeof __private._cocos_audio_audio_source__AudioSourceEventType`，包含 `PLAYED`、`STOPPED`、`PAUSED`、`RESUMED`、`ENDED` 等事件类型。
- `AudioSource.maxAudioChannel` 为静态只读属性，表示最大音频通道数。
- `AudioSource.AudioState` 枚举值为 `PLAYING`、`PAUSED`、`STOPPED`。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `clip` | 播放的音频资源（AudioClip） | 设置播放内容 |
| `loop` | 是否循环播放 | 背景音乐 |
| `playOnAwake` | 是否在组件激活时自动播放 | 自动播放 |
| `volume` | 音量（0.0 ~ 1.0） | 控制音量大小 |
| `currentTime` | 当前播放进度（秒） | 跳转到指定位置 |
| `duration` | 音频总时长（秒，只读） | 进度条最大值 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `play()` | 开始播放（已播放则重播，已暂停则恢复） | 播放音效 |
| `pause()` | 暂停播放 | 暂停/恢复切换 |
| `stop()` | 停止播放 | 停止音频 |
| `playOneShot(clip, volumeScale?)` | 播放一次音频（与当前播放独立） | 短促音效 |

## 高频代码

### 播放与暂停音频

```ts
import { _decorator, Component, AudioSource } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AudioExample')
export class AudioExample extends Component {
  @property(AudioSource)
  bgmAudio: AudioSource | null = null;

  playBGM() {
    if (!this.bgmAudio) return;
    this.bgmAudio.loop = true;
    this.bgmAudio.play();
  }

  pauseBGM() {
    if (!this.bgmAudio) return;
    this.bgmAudio.pause();
  }

  stopBGM() {
    if (!this.bgmAudio) return;
    this.bgmAudio.stop();
  }
}
```

### 动态加载并播放音效

```ts
import { _decorator, Component, AudioSource, AudioClip, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DynamicAudioExample')
export class DynamicAudioExample extends Component {
  @property(AudioSource)
  sfxSource: AudioSource | null = null;

  playHitSound() {
    resources.load('sfx/hit', AudioClip, (err, clip) => {
      if (err || !clip) return;

      if (this.sfxSource) {
        // 短促音效使用 playOneShot，不受 loop 影响
        this.sfxSource.playOneShot(clip, 1.0);
      }
    });
  }
}
```

### 通过代码获取 AudioSource 组件

```ts
import { _decorator, Component, AudioSource } from 'cc';

const { ccclass } = _decorator;

@ccclass('GetAudioExample')
export class GetAudioExample extends Component {
  start() {
    const audioSource = this.node.getComponent(AudioSource);
    if (!audioSource || !audioSource.clip) return;

    audioSource.play();
  }
}
```

## 常见错误

1. **Web 平台自动播放被拦截**：浏览器 Autoplay Policy 禁止首次自动播放，`playOnAwake` 可能无效。需在用户交互事件（`TOUCH_END`、`MOUSE_UP`）的回调中调用 `play()`。
2. **clip 为 null**：未设置音频资源时 `play()` 无任何输出，需先设置 `clip` 属性。
3. **playOneShot 叠加音量**：`playOneShot` 的最终音量为 `audioSource.volume * volumeScale`，两者都设为 1 时音量最大。
4. **多音源冲突**：一个 AudioSource 一次只能播放一个音频，多个音效同时播放需使用多个 AudioSource 组件或 `playOneShot`。
5. **加载音频路径错误**：`resources.load` 加载 AudioClip 时路径不加 `.mp3` 等扩展名。

## 关联任务

- [播放音频](../recipes/play-audio.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 音频系统 - AudioSource
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
