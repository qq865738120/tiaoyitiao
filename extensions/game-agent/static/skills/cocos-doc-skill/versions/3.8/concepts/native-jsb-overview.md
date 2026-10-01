---
id: cocos-3.8-concepts-native-jsb-overview
version: "3.8"
category: concepts
title: 原生平台 / JSB 开发概述
keywords:
  - 原生平台
  - JSB
  - JavaScript Binding
  - 原生反射
  - 原生插件
  - 原生通信
  - JsbBridge
  - 原生开发
  - sys.isNative
  - NATIVE
  - 原生调试
  - Xcode
  - Android Studio
  - DevEco Studio
related_docs:
  - concepts/runtime-environments.md
  - troubleshooting/jsb-bridge-failed.md
  - troubleshooting/hot-update-failed.md
  - troubleshooting/build-errors.md
related_api:
  - native.JsbBridge
  - sys.isNative
  - sys.os
  - NATIVE
source:
  official: "Cocos Creator 3.8 官方文档 - 原生开发概述、JSB 绑定、原生反射、原生插件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：JSB 功能默认 needs-review，不同版本的引擎和平台行为可能有差异"
status: needs-review
updated: 2026-06-18
---

# 原生平台 / JSB 开发概述

> 注意：本文涉及原生平台（iOS、Android、Windows、macOS、HarmonyOS）的 SDK、构建、运行环境和平台限制，这些内容随平台版本和引擎版本变化。默认标记为 `needs-review`，使用时请结合最新官方文档核对。

## 用途

说明 Cocos Creator 3.8 中 Web、Native（原生）和小游戏三大运行环境的差异，介绍 JSB（JavaScript Binding）、原生反射、原生插件的能力边界，帮助判断什么时候需要 JSB，什么时候应该避免使用 JSB。

## 运行环境判断（强制前置）

在任何涉及 JSB、原生反射或原生 API 的代码中，**必须先判断运行环境**，否则在 Web 预览或小游戏中直接调用会导致报错或崩溃。

```ts
import { sys, native } from 'cc';
import { NATIVE } from 'cc/env';

// 方式一：运行时判断（推荐，兼容所有构建目标）
if (sys.isNative) {
  // 仅在原生平台执行
  native.JsbBridge.sendToNative('methodName', 'arg');
}

// 方式二：区分具体平台
if (sys.isNative && sys.os === sys.OS.ANDROID) {
  // Android 特定逻辑
} else if (sys.isNative && sys.os === sys.OS.IOS) {
  // iOS 特定逻辑
}

// 方式三：编译期常量（仅原生构建时引入对应代码）
if (NATIVE) {
  // 此代码块仅在原生构建产物中存在
  // 注意：NATIVE 是编译期常量，不能用于运行时平台切换逻辑
}
```

**关键原则**：
- `sys.isNative` 运行时判断 → 用于所有需要兼容 Web 预览的代码。
- `NATIVE` 编译期常量 → 用于需要 tree-shaking 或仅在原生构建才存在的 API 引用。
- 小游戏平台 `sys.isNative` 为 `false`，不能使用 `native.JsbBridge` 等原生 API。

## 核心结论

- **Web**：浏览器运行，可用 DOM API，无原生能力。
- **小游戏**：平台 SDK 运行，无 DOM，通过平台 API 调用有限原生能力，沙箱严格。
- **Native**（iOS/Android/PC/HarmonyOS）：引擎 C++ 核心通过 JSB 自动绑定，脚本可调用引擎完整能力。需要额外平台原生能力时，使用 JSB 通信、原生反射或原生插件。
- **JSB（JavaScript Binding）**：引擎自动将 C++ 绑定到 JS，是 JS 脚本能在原生平台正常调用引擎 API 的基础。开发者一般不需要手动编写 JSB 绑定。
- **JsbBridge**：Cocos 提供的内置通信桥，支持 JS 到原生和原生到 JS 的双向调用。适用于简单场景（读取设备信息、调用系统弹窗等）。
- **原生反射**：在 JS 层通过字符串名动态调用 Java / Objective-C / ArkTS 方法，无需编写 C++ 级 JSB 绑定代码。灵活但需要注意方法名、参数和线程上下文。
- **原生插件**：使用 Cocos 原生插件机制（`.podspec` / Gradle 依赖）集成第三方原生 SDK，在插件中通过 JSB 或 JsbBridge 暴露给 JS 层。
- **以下场景不应使用 JSB**：仅需标准引擎 API 的功能、只发布 Web 或小游戏的项目、可在 JS 层限定的性能热点。
- **风险**：线程模型不同可能导致崩溃（JS 是单线程，原生异步回调需切回主线程）；方法名拼写错误或签名不匹配无编译期保护；不同平台（iOS vs Android vs HarmonyOS）的反射接口和线程安全策略不同。

## 什么时候使用

1. **调用平台原生 SDK**，如推送、震动、日历、NFC、第三方登录。
2. **桥接已有的原生代码库**（如自研 C++ 引擎、旧的 Java/ObjC 逻辑）。
3. **使用原生插件**集成第三方服务（广告、统计、支付 SDK）。
4. **需要通过 JSB 获得极致性能**，将计算密集逻辑下放到 C++ 层执行。

## 什么时候不应该使用 JSB

1. **项目只发布 Web 或小游戏平台**——原生平台技术和 API 在这些环境不可用。
2. **需要的能力可以通过引擎标准 API 实现**——例如读文件、网络请求、本地存储，引擎已内置封装。
3. **为很小的 JS 计算瓶颈引入 JSB**——先尝试 JS 层优化（对象池、避免 GC 触发、缓存结果等），确认瓶颈在 JS 执行本身后再考虑。
4. **团队不熟悉原生开发流程**——JSB / 原生插件调试成本远高于纯 JS 开发，需要掌握 Xcode / Android Studio / Gradle / CocoaPods 等工具链。

## 运行环境差异

| 维度 | Web | Native (iOS/Android/PC) | 小游戏 |
|---|---|---|---|
| JS 引擎 | 浏览器 V8 / SpiderMonkey | JavaScriptCore (iOS) / V8 (Android/PC) | 平台定制引擎 |
| DOM API | 完整可用 | 不可用 | 不可用 |
| Node.js API | 不可用 | 不可用 | 不可用 |
| 引擎 API | 通过 WebAssembly/asm.js | JSB (C++ 绑定) 自动暴露 | 引擎适配层 |
| 原生平台 API | 不可用 | JsbBridge / 原生反射 / 原生插件 | 平台 SDK 专用 API |
| 网络请求 | `fetch` / `XMLHttpRequest` | 引擎封装网络 API (内部使用原生实现) | 平台网络 API |
| 本地存储 | `localStorage` / IndexedDB | `sys.localStorage` (引擎封装) | 平台 Storage API |
| 文件系统 | 浏览器沙箱 | 引擎 `assetManager` / 原生文件路径 | 平台沙箱 |
| 线程 | 单线程 (Web Workers 有限) | JS 单线程，原生回调需切主线程 | 单线程 |

## JSB / 原生反射 / 原生插件对比

| 能力 | JSB (JavaScript Binding) | 原生反射 (JsbBridge) | 原生插件 |
|---|---|---|---|
| 本质 | C++ 层绑定，JS 直接调用 C++ 函数 | JS 通过字符串方法名动态调用原生 | 封装原生 SDK，暴露 JS 接口 |
| 开发难度 | 高，需修改引擎源码或编写 C++ 绑定代码 | 低，纯 JS + 纯字符串调用 | 中，需配置 Gradle / CocoaPods |
| 性能 | 最高，贴近 C++ | 中，字符串解析有开销 | 取决于实现方式 |
| 可维护性 | 低，绑定代码与引擎版本耦合 | 中，字符串调用无编译期检查 | 高，接口清晰 |
| 适用场景 | 深度引擎定制、性能敏感 | 简单原生能力调用（弹窗、震动） | 集成第三方 SDK |

## 最小示例

JsbBridge 调用原生方法（JS 端）：

```ts
import { _decorator, Component, native } from 'cc';

const { ccclass } = _decorator;

@ccclass('NativeBridgeDemo')
export class NativeBridgeDemo extends Component {
  start() {
    // JS -> 原生：调用原生类的静态方法
    // Android: 调用 com/example/MyBridge.toast 静态方法，参数 "Hello from Cocos"
    // iOS: 调用 MyBridge.toast 方法，参数 "Hello from Cocos"
    native.JsbBridge.sendToNative('toast', 'Hello from Cocos');
  }
}
```

JsbBridge 原生回调处理（JS 端）：

```ts
native.JsbBridge.onNative((methodName: string, args: string) => {
  // 原生端通过 JsbBridge.sendToJS 发送的消息会在这里收到
  console.log(`原生调用：${methodName}，参数：${args}`);
});
```

## 线程、安全与平台差异风险

### 线程风险

- JS 脚本在原生平台运行在 JS 主线程（Game Thread）。
- 原生异步回调（如网络请求回调、传感器回调）运行在原生线程，不能在回调中直接调用 JS 引擎。必须显式切到主线程。
- JsbBridge 内部做了一定的线程处理，但不能完全依赖——在原生端需要手动 `runOnGameThread` 或 `dispatch_async(dispatch_get_main_queue())`。

### 安全风险

- JS 到原生反射使用字符串方法名，**没有编译期类型检查**。参数拼写错误、类型不匹配会导致运行时崩溃。
- 原生方法不应直接暴露文件读写、数据库操作等敏感能力给 JS 层——JS 脚本可以被逆向或篡改。
- **不要在 JsbBridge 或原生反射中传递敏感凭证**（API Key、Token、密码），原生层的调用同样是可被 hook 的。

### 平台差异

- **Android**：通过 Java 反射，方法名为完整包名+方法名（如 `com/example/MyBridge.showToast`），需运行在 UI 线程。
- **iOS**：通过 Objective-C runtime（`performSelector:`），方法名需注意 NSObject 方法签名。
- **HarmonyOS**：使用 ArkTS 反射接口，接口名和调用方式与 Android 不同。
- **Windows / macOS**：通常通过 C++ JSB 绑定或原生插件实现，JsbBridge 支持有限。

## 关键 API / 组件

- **JsbBridge**：`native.JsbBridge.sendToNative()`、`native.JsbBridge.onNative()`、`native.JsbBridge.sendToJS()`（原生端）。
- **native**：`native.xxx` 命名空间下的原生平台 API（部分只在原生构建可用）。
- **sys**：`sys.isNative`、`sys.os`、`sys.browserType` 等平台判断 API。

## 公开导出结论

- `native.JsbBridge` 在 `cc` 模块公开导出，提供 `sendToNative(methodName: string, arg: string)`、`onNative(callback)` 等桥接方法。
- `sys.isNative` 在 `cc` 模块公开导出，为运行时判断是否为原生平台的布尔属性。
- `sys.os` 在 `cc` 模块公开导出，为运行时获取当前操作系统类型的枚举（`sys.OS.IOS`、`sys.OS.ANDROID`、`sys.OS.OHOS` 等）。
- `NATIVE` 在 `cc/env` 模块公开导出，为编译期常量，仅在原生构建时值为 `true`。
- 官方类型声明与引擎源码行为一致，以上 API 均已在 Cocos Creator 3.8 文档中有对应章节。

## 原生调试工具速查

不同平台的原生代码调试工具链完全不同，排查时必须使用对应平台的工具：

| 平台 | JS 侧日志 | 原生侧日志 | 必备工具 |
|---|---|---|---|
| iOS | Xcode 控制台 | `NSLog` / `print` 输出 | Xcode（版本需匹配 iOS SDK） |
| Android | `adb logcat -s CocosJS` | `adb logcat` / Android Studio Logcat | Android Studio + adb |
| HarmonyOS | DevEco Studio Log 面板 | DevEco Studio Log 面板 | DevEco Studio |
| Windows | Visual Studio 输出窗口 | Visual Studio 输出/调试 | Visual Studio |
| macOS | Xcode 控制台 | `NSLog` | Xcode |

> 原生端异常通常不会自动回传 JS 层。如果 JsbBridge 调用后原生端没有反应，必须在原生侧添加日志并查看对应平台的开发工具输出。

## 常见错误

1. **忘记判断运行环境导致非原生平台崩溃**：在 Web 预览或小游戏中调用 `native.JsbBridge` 等原生 API 直接报错。必须先使用 `sys.isNative` 判断（见上文"运行环境判断"章节）。
2. **在 Web 预览正常、原生构建崩溃**：原生平台没有 DOM API，也没有 `fetch`（部分 JS 引擎），应使用引擎封装的 `XMLHttpRequest` 或 `native.xxx`。
3. **调用 JsbBridge 后原生端没有收到**：确认 `sendToNative` 的第一个参数（方法名）与原生端注册的名称完全一致（大小写和拼写）。同时检查原生端的对应平台开发工具（Xcode / Android Studio / DevEco Studio）日志输出。
4. **原生异步回调中访问 JS 对象崩溃**：原生回调不在主线程，不能直接修改节点属性或调用引擎 API。使用 `mainQueue/runOnGameThread` 切回主线程。
5. **不同 iOS / Android 版本行为不一致**：系统 API 行为可能因版本变化，JsbBridge 传递的字符串是纯文本，没有版本兼容保障。

## 关联文档

- [运行环境](./runtime-environments.md)
- [JSB 通信失败排错](../troubleshooting/jsb-bridge-failed.md)
- [热更新失败排错](../troubleshooting/hot-update-failed.md)
- [构建失败分诊](../troubleshooting/build-errors.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 原生开发概述、JSB 绑定、原生反射、原生插件、原生调试
- 已交叉验证：cc-engine 3.8 公开类型声明（`native.JsbBridge`、`sys.isNative`、`sys.os`、`NATIVE` 均在 `cc` 或 `cc/env` 模块公开导出）
- 补充：工程经验 — JSB/原生反射的线程安全、平台差异和生产踩坑；原生端异常排查必须借助 Xcode/Android Studio/DevEco Studio 日志输出
