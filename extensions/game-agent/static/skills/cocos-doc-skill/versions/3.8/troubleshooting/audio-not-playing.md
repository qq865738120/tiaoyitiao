---
id: cocos-3.8-troubleshooting-audio-not-playing
version: "3.8"
category: troubleshooting
title: 音频不播放
keywords:
  - 音频不播放
  - 声音没出来
  - AudioSource 不播放
  - play 没声音
  - 音乐不响
  - 音效无法播放
related_docs:
  - api-reference/audio-source.md
  - recipes/play-audio.md
related_api:
  - AudioSource
  - AudioClip
  - AudioSource.play
  - AudioSource.clip
source:
  official: "Cocos Creator 3.8 官方文档 - 音频系统"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：AudioSource.clip 未赋值、节点未激活是最高频原因"
status: draft
updated: 2026-06-17
---

# 音频不播放

## 现象

调用 `AudioSource.play()` 后没有听到声音，没有报错，或播放时无声。有时在编辑器预览中有声音，但构建后没有。

## 最可能原因

1. **AudioSource 未绑定 AudioClip** — AudioSource 组件的 `clip` 属性为空，调用 `play()` 时没有可播放的音频资源。

2. **节点或其父节点 active = false** — 节点非激活时，AudioSource 组件不工作，`play()` 调用后无效果。

3. **音量（volume）为 0 或 AudioSource 被静音（mute）** — `volume` 属性默认为 1，但可能在脚本中被误设为 0；或 `mute` 属性被设置为 `true`。

4. **浏览器或平台自动播放策略限制** — 桌面浏览器和移动端浏览器普遍要求用户交互后才能播放音频。在 `start()` 或场景加载完成时直接调用 `play()` 会被浏览器阻止。这是构建到 Web 平台时最高频的音频问题。

5. **音频格式或编码不受支持** — 在某些平台（尤其是小游戏和原生平台）上，特定的音频格式（如 `.ogg`）可能不被支持。建议使用多种格式提供后备资源。

## 检查项（至少 5 项）

- [ ] 检查 AudioSource 组件的 `Clip` 属性是否已绑定一个有效的 `AudioClip` 资源。
- [ ] 检查 AudioSource 所在节点的 `active` 及其所有父节点的 `active` 属性。
- [ ] 确认 `volume > 0` 且 `mute === false`（在编辑器 Inspector 或代码 `console.log(audioSource.volume)` 检查）。
- [ ] 在浏览器 Console 中查看是否有音频自动播放被拦截的报错（如 `DOMException: play() failed`）。
- [ ] 确认音频文件格式是目标平台支持的类型（建议使用 `.mp3` 或 `.aac`，兼容性最广）。
- [ ] 尝试在 Button 点击等用户交互事件回调中调用 `play()`，排除自动播放策略问题。
- [ ] 确认 AudioClip 资源在编辑器中可以正常 Preview 播放。

## 解决方案

```ts
import { _decorator, Component, AudioSource, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AudioPlayer')
export class AudioPlayer extends Component {
  @property(AudioSource)
  audioSource: AudioSource | null = null;

  start() {
    const audio = this.audioSource || this.node.getComponent(AudioSource);
    if (!audio) {
      console.warn('AudioSource 组件不存在');
      return;
    }
    if (!audio.clip) {
      console.warn('AudioClip 未绑定');
      return;
    }

    // 延迟一帧播放，避免浏览器自动播放策略
    this.scheduleOnce(() => {
      audio.play();
    }, 0.1);
  }

  // 在用户交互回调中播放最可靠
  onUserTap() {
    if (this.audioSource && this.audioSource.clip) {
      this.audioSource.play();
    }
  }
}
```

### 逐步排查路径

1. 确认 AudioSource 组件存在且 clip 已绑定。
2. 确认节点全链路激活（`activeInHierarchy = true`）。
3. 检查音量与静音设置。
4. 若不是在用户交互中触发，改为在 Button 点击事件中播放。
5. 检查平台差异：先在小游戏/原生模拟器中测试，确认格式兼容性。
6. 确认音频资源是否已正确导入（编辑器资源管理器中波纹图标可见）。

## 仍未解决时

- 尝试使用 `AudioSource.playOneShot(clip, volume)` 播放不需要持续引用的短音效。
- 检查构建设置中音频资源的压缩选项是否为 `disable`（太高的压缩比可能导致播放失败）。
- 在原生平台检查设备是否处于静音模式。
- 查看 Cocos Creator 3.8 官方音频文档中关于各平台音频格式支持的信息。

## 相关文档

- [AudioSource API 卡片](../api-reference/audio-source.md)
- [播放音频任务](../recipes/play-audio.md)
