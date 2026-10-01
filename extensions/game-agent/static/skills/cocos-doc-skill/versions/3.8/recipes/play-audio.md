---
id: cocos-3.8-recipes-play-audio
version: "3.8"
category: recipes
title: 播放音效和背景音乐
keywords:
  - 播放音频
  - 音效
  - 背景音乐
  - AudioSource
  - AudioClip
  - playOneShot
  - 播放声音
related_docs:
  - api-reference/audio-source.md
  - api-reference/resources.md
  - troubleshooting/audio-not-playing.md
related_api:
  - AudioSource
  - AudioClip
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - 音频系统 - AudioSource"
  verified-against: []
  supplement:
    - "工程经验：Web 平台首次自动播放需在用户交互事件回调中调用 play() 绕过浏览器策略"
status: draft
updated: 2026-06-17
---

# 播放音效和背景音乐

## 目标

在运行时通过 AudioSource 组件播放音效和背景音乐，包括控制播放、暂停、停止和音量。

## 推荐做法

1. **背景音乐**：设置 `loop = true`，使用 `play()` 播放，`pause()`/`resume()` 控制暂停恢复，`stop()` 停止；
2. **短音效**：使用 `playOneShot(clip, volumeScale)` 独立播放，不影响当前 `play()` 播放的音频；
3. **编辑器绑定**：将 AudioClip 拖入 AudioSource 的 `Clip` 属性，适合不需要动态切换的音频；
4. **动态加载**：通过 `resources.load('path', AudioClip, callback)` 加载后赋值 `audioSource.clip` 再播放；
5. **Web 平台特别注意**：首次音频播放必须在用户交互事件（Button 点击等）回调中触发，`playOnAwake` 在首次交互前无效。

## 前置条件

1. 播放音频的节点上必须有 AudioSource 组件；
2. AudioSource 的 `clip` 属性必须设置为有效的 AudioClip 资源（编辑器绑定或代码加载）；
3. 通过 `resources.load` 动态加载音频时，AudioClip 资源必须放在 `assets/resources/` 目录下；
4. **Web 平台**：浏览器禁止首次自动播放音频，`playOnAwake` 在首次用户交互前无效。必须在用户点击/触摸事件的回调中调用 `play()`；
5. 如果节点上已有其他使用 `play()` 播放的 AudioSource，同时播放新音效应使用 `playOneShot` 方法或额外的 AudioSource 组件。

## 示例代码

### 播放背景音乐（循环）

```ts
import { _decorator, Component, AudioSource, AudioClip, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BGMPlayer')
export class BGMPlayer extends Component {
  private _audioSource: AudioSource | null = null;

  start() {
    this._audioSource = this.node.getComponent(AudioSource);
  }

  playBGM() {
    if (!this._audioSource || !this._audioSource.clip) return;

    this._audioSource.loop = true;   // 背景音乐循环播放
    this._audioSource.volume = 0.8;  // 音量 80%
    this._audioSource.play();
  }

  pauseBGM() {
    if (!this._audioSource) return;
    this._audioSource.pause();
  }

  resumeBGM() {
    if (!this._audioSource) return;
    this._audioSource.play(); // 已暂停时调用 play() 会恢复播放
  }

  stopBGM() {
    if (!this._audioSource) return;
    this._audioSource.stop();
  }
}
```

### 播放短音效（playOneShot）

```ts
import { _decorator, Component, AudioSource, AudioClip, resources } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SFXPlayer')
export class SFXPlayer extends Component {
  @property(AudioSource)
  sfxSource: AudioSource | null = null;

  playHitSound() {
    // 动态加载音效资源
    resources.load('sfx/hit', AudioClip, (err, clip) => {
      if (err || !clip) {
        console.error('音效加载失败:', err);
        return;
      }

      // playOneShot 独立播放，不受当前 play() 状态影响
      if (this.sfxSource) {
        this.sfxSource.playOneShot(clip, 1.0); // 第二个参数为音量缩放
      }
    });
  }
}
```

### 编辑器绑定 AudioClip 直接播放

```ts
import { _decorator, Component, AudioSource, AudioClip } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SimpleAudioExample')
export class SimpleAudioExample extends Component {
  @property(AudioClip)
  bgmClip: AudioClip | null = null;

  private _audioSource: AudioSource | null = null;

  start() {
    this._audioSource = this.node.getComponent(AudioSource);
    if (!this._audioSource) return;

    // 设置音频剪辑
    if (this.bgmClip) {
      this._audioSource.clip = this.bgmClip;
    }
  }

  // 此方法应绑定到 Button 点击事件（由用户交互触发）
  onButtonClick() {
    if (!this._audioSource) return;

    this._audioSource.loop = true;
    this._audioSource.play();
  }
}
```

### 控制音量

```ts
import { _decorator, Component, AudioSource } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('VolumeControl')
export class VolumeControl extends Component {
  @property(AudioSource)
  bgmSource: AudioSource | null = null;

  @property(AudioSource)
  sfxSource: AudioSource | null = null;

  setBGMVolume(volume: number) {
    if (!this.bgmSource) return;
    // volume 范围 0.0 ~ 1.0
    this.bgmSource.volume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number) {
    if (!this.sfxSource) return;
    this.sfxSource.volume = Math.max(0, Math.min(1, volume));
  }
}
```

## 操作步骤

1. 在编辑器中为节点添加 AudioSource 组件；
2. 将 AudioClip 资源拖入 AudioSource 的 `Clip` 属性（编辑器配置），或通过 `resources.load` 加载后赋值；
3. 对于背景音乐，设置 `loop = true` 并调用 `play()`；
4. 对于短音效，使用 `playOneShot(clip, volumeScale)` 独立播放，不与当前播放冲突；
5. 通过 `volume` 属性控制音量（0.0~1.0）；
6. **Web 平台特别注意**：在 `TOUCH_END` 或 `MOUSE_UP` 等用户交互事件的回调中首次调用 `play()`。

## 验证方式

- 调用 `play()` 后能正常听到音频输出；
- `loop = true` 时音频循环播放不中断；
- `pause()` / `resume()` 控制播放暂停和恢复；
- `stop()` 后音频完全停止；
- `playOneShot` 播放短音效时不影响当前背景音乐。

## 常见错误

1. **Web 平台自动播放被拦截**：浏览器 Autoplay Policy 阻止首次自动播放，`playOnAwake` 可能无效。必须在用户交互事件（点击/触摸）的回调中调用 `play()`。
2. **clip 为 null**：AudioSource 没有设置 `clip` 属性时 `play()` 无任何输出，也不报错。使用前检查 `clip` 是否已赋值。
3. **playOneShot 音量叠加**：`playOneShot(clip, volumeScale)` 的最终音量为 `audioSource.volume * volumeScale`，两个参数都设为 1.0 是最大音量。
4. **一个 AudioSource 播放多个音频**：一个 AudioSource 同一时间只能播放一个音频（`play()` 会替换当前播放）。如需同时播放多个音频，使用多个 AudioSource 组件或 `playOneShot`。
5. **加载音频路径带扩展名**：`resources.load('sfx/hit.mp3')` 错误，应为 `resources.load('sfx/hit', AudioClip, ...)`。
6. **stop 后 play 重头播放**：`stop()` 后调用 `play()` 会从头开始播放；`pause()` 后 `play()` 从暂停位置恢复。
7. **渠道包体限制**：微信等平台要求首次音频播放必须在用户输入事件的回调中触发，延迟播放可能被平台拦截。

## 相关文档

- [AudioSource API 卡片](../api-reference/audio-source.md)
- [音频不播放排查](../troubleshooting/audio-not-playing.md)
- [动态加载资源](./load-resource-dynamically.md)
