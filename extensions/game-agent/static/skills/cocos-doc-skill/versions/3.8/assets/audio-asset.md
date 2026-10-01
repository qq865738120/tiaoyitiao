---
id: cocos-3.8-assets-audio-asset
version: "3.8"
category: assets
title: 音频资源（AudioClip）
keywords:
  - 音频
  - AudioClip
  - AudioSource
  - 音效
  - 背景音乐
  - 音频格式
  - mp3
  - ogg
  - 播放音频
  - 动态加载音频
related_docs:
  - assets/asset-workflow.md
  - assets/dynamic-loading.md
  - assets/resources-folder.md
  - api-reference/audio-source.md
  - recipes/play-audio.md
related_api:
  - AudioClip
  - AudioSource
source:
  official: "Cocos Creator 3.8 官方文档 - 音频资源 / AudioSource 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：音频格式选择和 AudioSource 组件配置是常见问题"
status: draft
updated: 2026-06-17
---

# 音频资源（AudioClip）

## 用途

说明 AudioClip 作为资源在 Cocos Creator 中的导入、格式选择、加载链路，以及通过 AudioSource 组件播放的完整流程。

## 核心结论

- **AudioClip 是音频资源的 Asset 子类**（`class AudioClip extends Asset`），拖拽音频文件到资源管理器即可导入。
- **AudioSource 是音频播放组件**：AudioClip 只是数据，播放需要通过 AudioSource 组件。
- **音频分两类**：音乐（长音频，BGM）和音效（短音频，SFX），在 AudioSource 组件中分别处理。
- **格式兼容性**：`.mp3` 通用性最好，`.ogg` 文件更小音质好但 iOS 不支持。

## 什么时候使用

- 需要在脚本中动态加载和播放音频（BGM 或音效）。
- 需要了解不同音频格式的跨平台兼容性。
- 需要理解 AudioClip 资源和 AudioSource 组件的关系。

## 音频格式与平台兼容性

| 格式 | 特点 | 兼容性 |
|---|---|---|
| `.mp3` | 主流、通用、有损压缩 | 全平台支持 |
| `.ogg` | 文件更小、音质好、开源 | **iOS 不支持** |
| `.wav` | 无损、文件大 | 全平台支持 |
| `.mp4` / `.m4a` | 高压缩比、音质好 | 全平台支持 |

**建议**：BGM 用 `.mp3`，短音效用 `.ogg` 或 `.mp3`。如果需兼容 iOS，避免使用 `.ogg`。

## 加载与播放链路

```text
音频文件（.mp3/.ogg/.wav）
→ 拖入 assets/resources/
→ 引擎导入为 AudioClip 资源
→ resources.load('audio/bgm', AudioClip, callback)
→ 获取 AudioClip 对象
→ audioSource.clip = clip
→ audioSource.play()
```

## 关键 API / 组件

| API / 组件 | 作用 |
|---|---|
| `AudioClip` | 音频资源类型，仅数据，不负责播放 |
| `AudioSource` | 音频播放组件，挂载在 Node 上，控制播放/暂停/停止/音量/循环 |
| `resources.load(path, AudioClip, cb)` | 动态加载音频资源 |
| `audioSource.play()` / `pause()` / `stop()` | 播放控制 |

## 最小示例

### 动态加载并播放 BGM

```ts
import { _decorator, Component, AudioClip, AudioSource, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('PlayBGMDemo')
export class PlayBGMDemo extends Component {
  start() {
    // 确保节点上有 AudioSource 组件
    let audioSource = this.node.getComponent(AudioSource);
    if (!audioSource) {
      audioSource = this.node.addComponent(AudioSource);
    }

    resources.load('audio/bgm', AudioClip, (err, clip) => {
      if (err || !clip) {
        console.error('音频加载失败:', err);
        return;
      }

      audioSource!.clip = clip;
      audioSource!.loop = true;    // BGM 通常循环播放
      audioSource!.volume = 0.8;   // 音量 0~1
      audioSource!.play();
    });
  }
}
```

### 播放短音效

```ts
import { _decorator, Component, AudioClip, AudioSource, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('PlaySFXDemo')
export class PlaySFXDemo extends Component {
  // 音效通常不循环，播放一次即可
  playSFX(clipPath: string) {
    resources.load(clipPath, AudioClip, (err, clip) => {
      if (err || !clip) return;

      const audioSource = this.node.getComponent(AudioSource);
      if (!audioSource) return;

      // playOneShot 不影响当前正在播放的 BGM
      audioSource.playOneShot(clip, 1.0);
    });
  }
}
```

## 常见错误

1. **忘记添加 AudioSource 组件**：AudioClip 只是数据，节点上必须有 AudioSource 组件才能播放。
2. **iOS 上 OGG 音频无声**：iOS 不支持 `.ogg` 格式，需使用 `.mp3` 或 `.mp4`。
3. **路径带扩展名**：`resources.load('audio/bgm.mp3', AudioClip, ...)` → 应去掉扩展名。
4. **playOneShot 与 play 冲突**：`play()` 用于 BGM（会中断当前 BGM），`playOneShot()` 用于叠加音效。
5. **未判空导致崩溃**：加载失败时 AudioClip 为 null，`audioSource.clip = null` 后调用 `play()` 会报错。

## 关联文档

- [动态加载资源](./dynamic-loading.md)
- [resources 目录使用指南](./resources-folder.md)
- [AudioSource API 卡片](../api-reference/audio-source.md)
- [播放音频（Recipe）](../recipes/play-audio.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 音频资源 / AudioSource 组件
- 已交叉验证：cc-engine 3.8 公开类型声明（`class AudioClip extends Asset`）
- 补充：工程经验——格式兼容性和 AudioSource 组件使用是最常见的音频问题
