---
id: cocos-3.8-recipes-audio-manager-pattern
version: "3.8"
category: recipes
title: 全局音频管理器 — BGM/SE 通道分离与场景持久化
keywords:
  - AudioManager
  - 全局音频管理器
  - 背景音乐
  - 音效
  - BGM
  - SE
  - addPersistRootNode
  - AudioSource
  - 常驻节点
  - 音量控制
  - 场景切换播放保持
related_docs:
  - api-reference/audio-source.md
  - api-reference/resources.md
  - recipes/play-audio.md
  - troubleshooting/audio-not-playing.md
  - troubleshooting/audio-format-compat.md
  - api-reference/director.md
related_api:
  - AudioSource
  - AudioClip
  - director.addPersistRootNode
  - director.removePersistRootNode
  - resources.load
  - resources.release
  - AudioSource.playOneShot
source:
  official: "Cocos Creator 3.8 官方文档 - 音频系统 - AudioSource"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：全局 AudioManager 单例是中型以上项目的标准做法"
    - "工程经验：AudioSource 实例通过常驻节点避免场景切换时被销毁"
status: draft
updated: 2026-06-18
---

# 全局音频管理器 — BGM/SE 通道分离与场景持久化

## 核心结论

- Cocos Creator **3.x 不再提供全局 `cc.audioEngine`**，所有音频播放统一通过 **AudioSource 组件**完成。这是 3.x 与 2.x 音频系统的根本差异。
- 全局音频管理的标准做法是：创建一个**常驻节点**（通过 `director.addPersistRootNode()`），在该节点上挂载多个 AudioSource 组件分别管理 BGM 和 SE 通道。
- 音量控制通过全局音量系数 × AudioSource.volume 实现分层管理。
- 场景切换时，常驻节点不会被销毁，BGM 可持续播放。

## 验证方式

- 场景切换后 BGM 继续播放，无中断。
- BGM 和 SE 音量可以独立调节。
- 全局音量调节同时影响 BGM 和 SE 通道。
- 动态加载的音频正常播放，释放后不再占用内存。
- Web 平台：首次点击按钮后 BGM 开始播放，之前没有报错。
