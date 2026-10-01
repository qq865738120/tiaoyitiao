---
id: cocos-3.8-api-reference-sys
version: "3.8"
category: api-reference
title: sys
keywords:
  - sys
  - 平台判断
  - 微信小游戏
  - 判断平台
  - sys.platform
  - sys.os
  - 语言判断
  - hasFeature
  - 系统信息
related_docs:
  - concepts/runtime-environments.md
related_api:
  - sys
  - sys.Platform
  - sys.OS
  - sys.Language
  - sys.Feature
source:
  official: "Cocos Creator 3.8 官方文档 - 发布 - 平台判断"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-18
---

# sys

## 用途

`sys` 是 Cocos Creator 运行环境信息工具对象，提供平台类型、操作系统、语言、浏览器环境等运行时判断能力。用于在不同发布平台下执行差异化的逻辑。

## 所属模块

```ts
import { sys } from 'cc';
```

## 公开导出结论

- `sys` 在 `cc` 模块以 `export const sys` 公开导出（类型为内联对象类型，非 class 实例）。
- `sys` 同时导出枚举类型构造器：`sys.Platform`、`sys.OS`、`sys.Language`、`sys.BrowserType`、`sys.NetworkType`、`sys.Feature`。
- 所有运行时属性（`platform`、`os`、`language`、`isNative` 等）均为只读运行时常量，不可修改。
- 已验证的 Feature 枚举值：`WEBP`、`IMAGE_BITMAP`、`WEB_VIEW`、`VIDEO_PLAYER`、`SAFE_AREA`、`HPE`、`INPUT_TOUCH`、`EVENT_KEYBOARD`、`EVENT_MOUSE`、`EVENT_TOUCH`、`EVENT_ACCELEROMETER`、`EVENT_GAMEPAD`、`EVENT_HANDLE`、`EVENT_HMD`、`EVENT_HANDHELD`、`WASM`。

## 常用属性

| 属性 | 类型 | 说明 | 典型值 |
|---|---|---|---|
| `sys.platform` | `sys.Platform` 枚举值 | 当前运行平台枚举值 | `sys.Platform.WECHAT_GAME` / `sys.Platform.EDITOR_PAGE` |
| `sys.language` | `sys.Language` 枚举值 | 系统语言枚举值 | `sys.Language.ENGLISH` / `sys.Language.CHINESE` |
| `sys.languageCode` | `string` | ISO 语言代码字符串，格式因平台而异 | `"zh-CN"` / `"en-US"` / `"zh-tw"` |
| `sys.os` | `sys.OS` 枚举值 | 操作系统类型 | `sys.OS.WINDOWS` / `sys.OS.IOS` / `sys.OS.ANDROID` / `sys.OS.OHOS` |
| `sys.osVersion` | `string` | 操作系统版本字符串 | `"15.0"` |
| `sys.osMainVersion` | `number` | 操作系统主版本号 | `15` |
| `sys.isNative` | `boolean` | 是否原生平台（Android/iOS/Windows/Mac 原生包） | `true` / `false` |
| `sys.isBrowser` | `boolean` | 是否浏览器环境（H5 或小游戏 WebView） | `true` / `false` |
| `sys.isMobile` | `boolean` | 是否移动平台 | `true` / `false` |
| `sys.isLittleEndian` | `boolean` | 当前平台是否小端字节序 | `true` |
| `sys.isXR` | `boolean` | 是否 XR 平台 | `true` / `false` |
| `sys.browserType` | `sys.BrowserType` 枚举值 | 浏览器类型 | `sys.BrowserType.WECHAT` / `sys.BrowserType.SAFARI` |
| `sys.browserVersion` | `string` | 浏览器版本字符串 | `"17.4"` |
| `sys.localStorage` | `any` | 平台兼容的 localStorage 实现（接口与 Web localStorage 一致） | — |
| `sys.hasFeature` | `(feature: sys.Feature) => boolean` | 检测平台是否支持特定功能（3.4.0+ 推荐，替代 capabilities） | `sys.hasFeature(sys.Feature.WEBP)` |

> **已弃用属性**：`sys.capabilities`（3.4.0 弃用）→ 请用 `sys.hasFeature()`；`sys.windowPixelResolution`（3.4.0 弃用）→ 请用 `screen.windowSize`。

### sys.Platform 枚举（完整列表）

| 值 | 说明 |
|---|---|
| `sys.Platform.UNKNOWN` | 未知平台 |
| `sys.Platform.EDITOR_PAGE` | 编辑器预览 |
| `sys.Platform.EDITOR_CORE` | 编辑器核心 |
| `sys.Platform.MOBILE_BROWSER` | H5 移动端 |
| `sys.Platform.DESKTOP_BROWSER` | H5 桌面端 |
| `sys.Platform.WIN32` | Windows 原生 |
| `sys.Platform.ANDROID` | Android 原生 |
| `sys.Platform.IOS` | iOS 原生 |
| `sys.Platform.MACOS` | macOS 原生 |
| `sys.Platform.OHOS` | 鸿蒙原生（HarmonyOS） |
| `sys.Platform.OPENHARMONY` | 开源鸿蒙原生（OpenHarmony） |
| `sys.Platform.WECHAT_GAME` | 微信小游戏 |
| `sys.Platform.WECHAT_MINI_PROGRAM` | 微信小程序 |
| `sys.Platform.BAIDU_MINI_GAME` | 百度小游戏 |
| `sys.Platform.XIAOMI_QUICK_GAME` | 小米快游戏 |
| `sys.Platform.ALIPAY_MINI_GAME` | 支付宝小游戏 |
| `sys.Platform.TAOBAO_CREATIVE_APP` | 淘宝创意应用 |
| `sys.Platform.TAOBAO_MINI_GAME` | 淘宝小游戏 |
| `sys.Platform.BYTEDANCE_MINI_GAME` | 抖音小游戏 |
| `sys.Platform.OPPO_MINI_GAME` | OPPO 小游戏 |
| `sys.Platform.VIVO_MINI_GAME` | VIVO 小游戏 |
| `sys.Platform.HUAWEI_QUICK_GAME` | 华为快游戏 |
| `sys.Platform.COCOSPLAY` | Cocos Play |
| `sys.Platform.LINKSURE_MINI_GAME` | Linksure 小游戏 |
| `sys.Platform.QTT_MINI_GAME` | QTT 小游戏 |

> **小版本敏感提示**：3.8.x 小版本可能新增平台枚举值，如遇到未知平台值请参照官方最新 engine 声明。

### sys.OS 枚举

| 值 | 说明 |
|---|---|
| `sys.OS.UNKNOWN` | 未知 |
| `sys.OS.IOS` | iOS |
| `sys.OS.ANDROID` | Android |
| `sys.OS.WINDOWS` | Windows |
| `sys.OS.LINUX` | Linux |
| `sys.OS.OSX` | macOS |
| `sys.OS.OHOS` | 鸿蒙 |
| `sys.OS.OPENHARMONY` | OpenHarmony |

### sys.Language 枚举

| 值 | 说明 |
|---|---|
| `sys.Language.ENGLISH` | 英语 |
| `sys.Language.CHINESE` | 中文 |
| `sys.Language.FRENCH` | 法语 |
| `sys.Language.GERMAN` | 德语 |
| `sys.Language.ITALIAN` | 意大利语 |
| `sys.Language.JAPANESE` | 日语 |
| `sys.Language.KOREAN` | 韩语 |
| `sys.Language.RUSSIAN` | 俄语 |
| `sys.Language.SPANISH` | 西班牙语 |
| `sys.Language.TURKISH` | 土耳其语 |
| `sys.Language.PORTUGUESE` | 葡萄牙语 |
| `sys.Language.ARABIC` | 阿拉伯语 |

## 常用方法

| 方法 | 说明 |
|---|---|
| `sys.hasFeature(feature)` | 检测平台是否支持指定功能（推荐，替代 `capabilities`） |
| `sys.getNetworkType()` | 获取网络类型，返回 `sys.NetworkType.LAN` 或 `sys.NetworkType.WWAN`，失败返回 LAN |
| `sys.getBatteryLevel()` | 获取电池电量（0.0~1.0），失败返回 1.0 |
| `sys.garbageCollect()` | 强制 JS 内存垃圾回收（仅原生平台有效） |
| `sys.isObjectValid(obj)` | 检查对象是否有效（Web 检查非空，原生检查 JS 和原生对象均有效） |
| `sys.dump()` | 在控制台打印当前主要系统信息 |
| `sys.openURL(url)` | 尝试在浏览器中打开 URL（非所有平台有效） |
| `sys.now()` | 获取当前时间（毫秒） |
| `sys.restartVM()` | 重启 JS 虚拟机（仅原生平台，内部接口） |
| `sys.getSafeAreaRect(symmetric?)` | 获取安全区域 Rect（设计分辨率单位），支持 Android/iOS/微信/字节小游戏 |

## 高频代码

### 平台判断

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('PlatformCheckExample')
export class PlatformCheckExample extends Component {
  start() {
    if (sys.platform === sys.Platform.WECHAT_GAME) {
      // 微信小游戏专属逻辑
      console.log('运行在微信小游戏');
    } else if (sys.isNative) {
      // 原生平台（Android/iOS/Windows/Mac/OHOS 等）
      console.log('运行在原生平台');
    } else if (sys.isBrowser) {
      // H5 浏览器
      console.log('运行在浏览器');
    }
  }
}
```

### 语言判断

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('LanguageCheckExample')
export class LanguageCheckExample extends Component {
  start() {
    if (sys.language === sys.Language.CHINESE) {
      console.log('系统语言: 中文');
    } else {
      // languageCode 格式因平台而异（"zh-CN" / "zh_CN" 等）
      console.log('系统语言:', sys.languageCode);
    }
  }
}
```

### 使用平台兼容的 localStorage

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('StorageExample')
export class StorageExample extends Component {
  saveData(key: string, value: string) {
    sys.localStorage.setItem(key, value);
  }

  loadData(key: string): string | null {
    return sys.localStorage.getItem(key);
  }
}
```

### 判断开发环境

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('DevCheckExample')
export class DevCheckExample extends Component {
  isEditor() {
    return sys.platform === sys.Platform.EDITOR_PAGE;
  }

  showDevConsole() {
    if (this.isEditor()) {
      console.log('编辑器环境 - 显示调试工具');
    } else {
      console.log('构建环境 - 生产模式');
    }
  }
}
```

### 使用 hasFeature 检测平台能力

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('FeatureCheckExample')
export class FeatureCheckExample extends Component {
  start() {
    // 3.4.0+ 推荐：使用 hasFeature 替代已弃用的 capabilities
    if (sys.hasFeature(sys.Feature.WEBP)) {
      console.log('支持 WebP 图片格式');
    }
    if (sys.hasFeature(sys.Feature.SAFE_AREA)) {
      console.log('支持安全区域 API');
    }
  }
}
```

## 常见错误

1. **在编辑器环境误判平台**：编辑器预览时 `sys.platform` 为 `sys.Platform.EDITOR_PAGE`，不要等同于任意构建目标。可使用 `!CC_JSB` 等构建宏在编译期区分类别。
2. **把构建平台当运行平台**：`sys.platform` 反映运行时平台，非构建目标。例如 H5 包在微信中打开时 `sys.isBrowser` 仍为 true。
3. **`sys.os` 不是字符串比较**：`sys.os` 返回 `sys.OS` 枚举值而非字符串。应使用 `sys.os === sys.OS.ANDROID` 形式而非字符串相等判断。
4. **`sys.languageCode` 格式不确定性**：不同平台返回的 languageCode 格式可能不同（`"zh-CN"` vs `"zh_CN"`），建议优先用 `sys.language` 枚举值做逻辑分支，`languageCode` 仅用于展示。
5. **使用已弃用的 capabilities**：3.4.0+ 应使用 `sys.hasFeature(sys.Feature.XXX)` 替代 `sys.capabilities` 对象；使用 `screen.windowSize` 替代 `sys.windowPixelResolution`。
6. **hasFeature 平台差异**：`sys.hasFeature` 在各平台返回的结果可能不同，尤其在小游戏平台，`WEB_VIEW`、`VIDEO_PLAYER` 等能力可能受限或不存在。

## 关联任务

- [运行时环境判断](../concepts/runtime-environments.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 发布 - 平台判断
- 已交叉验证：cc-engine 3.8 公开类型声明（Platform/OS/Language/Feature/BrowserType 枚举、sys 对象属性与方法）
- 注意：3.8.x 小版本可能新增小游戏平台枚举值，使用前建议确认目标引擎版本的 Platform 枚举完整列表。
