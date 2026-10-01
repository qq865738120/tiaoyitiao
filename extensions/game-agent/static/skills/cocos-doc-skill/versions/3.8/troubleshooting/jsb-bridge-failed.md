---
id: cocos-3.8-troubleshooting-jsb-bridge-failed
version: "3.8"
category: troubleshooting
title: JSB 原生通信失败排错
keywords:
  - JSB 失败
  - JsbBridge 不生效
  - 原生通信失败
  - sendToNative 没反应
  - onNative 不回调
  - 原生反射
  - 原生方法调用
  - 原生调用 JS 失败
  - sendToJS 没收到
  - 原生桥接
  - 原生插件通信
  - sys.isNative
  - Xcode 日志
  - adb logcat
related_docs:
  - concepts/native-jsb-overview.md
  - concepts/runtime-environments.md
  - troubleshooting/build-errors.md
related_api:
  - native.JsbBridge
  - native
  - sys.isNative
  - sys.os
source:
  official: "Cocos Creator 3.8 官方文档 - 原生开发概述、JsbBridge、JS与Java/OC通信"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：JsbBridge 是字符串桥接，参数拼写、线程上下文和平台差异是常见故障点"
status: needs-review
updated: 2026-06-18
---

# JSB 原生通信失败排错

> 注意：本文涉及不同平台（iOS、Android、HarmonyOS）的原生通信机制，这些平台的接口和行为随版本变化。默认标记为 `needs-review`，使用时请结合最新的平台官方文档和 Cocos Creator 发布说明核对。

## 现象

- `native.JsbBridge.sendToNative()` 调用后原生端没有收到消息。
- 原生端调用 `JsbBridge.sendToJS()` 后 JS 侧没有收到回调。
- 原生端收到消息但处理逻辑没有执行或抛出异常。
- 通信成功但传递的数据在收到的侧变成了错误的值或格式异常。
- H5 预览环境下调用 `native.JsbBridge.xxx` 报错（原生 API 在非原生环境不可用）。
- 只有部分平台通信正常，另一部分平台失败。

## 最可能原因（按检查优先级排序）

1. **平台是否支持**：`JsbBridge` 仅在原生构建产物中可用，必须先使用 `sys.isNative` 判断。Web 预览和小游戏会直接报错。
2. **方法名拼写错误**：`sendToNative` 的第一个参数（方法名）与原生端注册的名称必须完全一致（含大小写、包名、下划线）。
3. **参数格式异常**：`sendToNative` 的第二个参数是字符串，传递对象需先 `JSON.stringify`，传递多参数需封装为 JSON。
4. **未查看原生日志**：原生端异常不会自动回传到 JS 层，必须在 Xcode/Android Studio/DevEco Studio 中查看原生端日志。
5. **线程未正确切换**：原生异步回调（如网络返回、传感器回调）可能在非主线程调用，直接调用 JS 方法会崩溃。
6. **平台差异**：Android、iOS、HarmonyOS 的原生注册方式、方法命名规则和线程安全策略不同。
7. **JsbBridge 未初始化或已释放**：在组件 `onDestroy` 之后或原生端生命周期之外调用。

## 快速检查

### 第 0 步：确认运行环境（必须首先执行）

```ts
import { sys } from 'cc';

if (!sys.isNative) {
  console.warn('当前非原生平台，JsbBridge 不可用');
  // Web 预览中 native.JsbBridge 不存在，不可调用
  return;
}
// 确认平台类型
console.log(`当前平台: ${sys.os}`); // 输出: iOS / Android / OHOS 等
```

### 平台是否支持

- [ ] 确认运行的是**原生构建产物**（iOS / Android 真机或模拟器），不是 Web 预览或小游戏。
- [ ] Web 预览中 `native.JsbBridge` 可能为 `undefined`，调用会直接报错，属于正常行为。
- [ ] 小游戏平台（微信/抖音等）不支持 `native.JsbBridge`（小游戏有自己的平台 API 体系）。
- [ ] HarmonyOS 的 JsbBridge 接口和注册方式与 Android/iOS 不同，需查阅 Cocos 对应发布的 HarmonyOS 支持文档。
- [ ] 确认构建面板未裁剪 `native` / `jsb` 相关引擎模块。

### 日志位置（按平台）

- [ ] **JS 侧日志**：在调用 `sendToNative` 前加 `console.log` 输出方法名和完整参数，确认调用实际被执行。
- [ ] **原生侧日志**：
  - **iOS**：Xcode 控制台输出（`NSLog` 或 `print` 输出），注意区分 JS 日志和原生日志。
  - **Android**：`adb logcat -s CocosJS`（JS 日志）、`adb logcat -s JsbBridge`（桥接日志）、Android Studio Logcat。
  - **HarmonyOS**：DevEco Studio 的 Log 面板，按 tag 筛选。
- [ ] **原生端异常日志**：在原生端代码中确保 `try-catch` 或 `@try-@catch` 包裹了 JsbBridge 回调逻辑，输出完整异常栈。

### 原生方法名、参数、线程

- [ ] 确认 `sendToNative` 的第一个参数（方法名）在原生端的确切名称。代码大小写、下划线必须完全匹配。
  ```
  // JS 端
  native.JsbBridge.sendToNative('showToast', 'Hello');

  // iOS 端（ObjC）
  // 需要在 AppController 或自定义类中注册，方法名为 showToast
  ```
- [ ] 确认第二个参数的字符串内容是服务端期望的格式。如果是结构化数据，必须先用 `JSON.stringify` 序列化。
- [ ] 如果传递多个参数：JsbBridge 只支持一个字符串参数。多参数需要封装成 JSON 字符串，在原生端解析。
  ```ts
  const params = JSON.stringify({ userId: 123, action: 'login' });
  native.JsbBridge.sendToNative('onUserAction', params);
  ```
- [ ] 原生端回调线程：确认原生方法执行结束后，调用 `sendToJS` 之前确认是否运行在主线程。
  - iOS：在回调中 `dispatch_async(dispatch_get_main_queue(), ^{ sendToJS(...); });`
  - Android：使用 `runOnUiThread(() -> bridge.sendToJS(...));`

### 代码检查清单

- [ ] 构建时确认未裁剪引擎模块中的 `native` / `jsb` 相关模块。
- [ ] 检查原生工程中是否正确编译了 JsbBridge 相关代码（Cocos 内置，一般不需要额外配置，但如果使用了自定义原生插件需要确认）。
- [ ] `sys.isNative` 是否为 `true`？在代码中判断是否运行在原生平台：
  ```ts
  import { sys } from 'cc';
  if (!sys.isNative) {
    console.warn('不是原生平台，JsbBridge 不可用');
    return;
  }
  ```

## 解决方案

### 1. 检查平台兼容：先确认是否在原生平台

```ts
import { _decorator, Component, sys, native } from 'cc';

const { ccclass } = _decorator;

@ccclass('BridgeDemo')
export class BridgeDemo extends Component {
  callNative(methodName: string, arg: string) {
    if (!sys.isNative) {
      console.warn('非原生环境，JsbBridge 不可用');
      return;
    }
    try {
      native.JsbBridge.sendToNative(methodName, arg);
    } catch (e) {
      console.error('JsbBridge 调用失败', e);
    }
  }
}
```

### 2. 参数序列化：结构化数据用 JSON 字符串

```ts
const data = JSON.stringify({ score: 100, level: 3 });
native.JsbBridge.sendToNative('submitScore', data);
```

### 3. 原生端注册（iOS / ObjC 示例）

```objc
// AppController.mm 或自定义类中
#include "cocos/bindings/manual/jsb_globals.h"

// 注册方法
[[JsbBridge sharedInstance] addScriptListener:@"showToast" callback:^(NSString *arg) {
    // arg 就是从 JS 端传来的字符串
    dispatch_async(dispatch_get_main_queue(), ^{
        // 在主线程上执行 UI 操作
        [self showToast:arg];
    });
}];
```

### 4. 原生端注册（Android / Java 示例）

```java
// AppActivity.java 或自定义类中
import com.cocos.lib.JsbBridge;

JsbBridge shared = JsbBridge.getInstance();
shared.addScriptListener("showToast", arg -> {
    // arg 是从 JS 端传来的字符串
    runOnUiThread(() -> {
        // 在主线程上处理
        Toast.makeText(this, arg, Toast.LENGTH_SHORT).show();
    });
});
```

### 5. JS 端接收原生调用

```ts
import { native } from 'cc';

// 注册 JS 端回调
native.JsbBridge.onNative((methodName: string, args: string) => {
  if (methodName === 'onPurchaseComplete') {
    const data = JSON.parse(args);
    console.log('购买完成', data);
  }
});
```

## 需要人工复核的最新平台限制

以下内容随平台版本变化，使用前必须人工复核：

1. **iOS JsbBridge 方法名限制**：某些系统保留方法名可能导致注册失败。如在较新 iOS 版本中，ObjC runtime 的 `performSelector` 行为可能因 ARC 或命名冲突变化。
2. **Android JNI 线程安全**：`JsbBridge.sendToJS` 在非 UI 线程调用时可能被系统 ANR 或抛出 `CalledFromWrongThreadException`，需确保在主线程调用。
3. **HarmonyOS 通信差异**：HarmonyOS 的 JsbBridge 接口和注册方式与 Android/iOS 不同，需查阅 Cocos 对应发布的 HarmonyOS 支持文档。
4. **原生插件中的 JsbBridge**：如果在自定义原生插件中使用，需要确保插件的原生代码正确链接了 Cocos 的 JsbBridge 头文件/lib，且编译时没有符号冲突。
5. **引擎版本兼容性**：Cocos Creator 3.8.x 的不同补丁版本中，`native.JsbBridge` 的接口可能有微小调整（如参数类型）。查看当前版本的发布说明确认。
6. **字符串编码**：传递中文字符串时，原生端的字符编码可能与 JS 端不同（UTF-8 vs UTF-16），在部分平台上可能产生乱码。

## 公开导出结论

- `native.JsbBridge` 在 `cc` 模块公开导出，提供 `sendToNative(methodName: string, arg: string)` 和 `onNative(callback)` 两个核心桥接方法。
- `sys.isNative`、`sys.os` 在 `cc` 模块公开导出，用于运行时平台判断。
- `NATIVE` 在 `cc/env` 模块公开导出，为编译期常量。
- 官方类型声明与引擎源码行为一致，以上 API 在 Cocos Creator 3.8 官方文档中均有对应章节（原生开发概述、JS与Java通信、JS与OC通信）。

## 仍未解决时

1. 创建一个**最小可复现工程**：只保留一个按钮，点击后调用 `sendToNative('test', 'ping')`，原生端收到后调用 `sendToJS('test', 'pong')`。确认最简单的通信链路是否能正常往返。如果最小链路也不通，可能是构建配置或引擎模块裁剪问题。
2. 检查 Cocos Creator 底部 Console 面板在构建过程中是否有 `native` / `jsb` 相关的裁剪告警。
3. **按平台定位**：
   - **Android**：检查 `app/build.gradle` 中是否引入了冲突的依赖，确认 ProGuard/R8 未混淆 `JsbBridge` 相关类。
   - **iOS**：检查 Xcode 项目 `Build Phases` 中是否正确链接了 `JsbBridge` 相关文件，确认 CocoaPods 依赖是否完整。
   - **HarmonyOS**：检查 `build-profile.json5` 中的签名和模块配置是否正确。
4. 搜索 Cocos 官方论坛中当前引擎版本的 `JsbBridge` 相关帖子，确认是否已知问题或版本差异。
5. 尝试使用最新版本的 Cocos Creator 3.8.x 补丁版重新构建。

## 相关文档

- [原生 / JSB 概述](../concepts/native-jsb-overview.md)
- [运行环境](../concepts/runtime-environments.md)
- [构建失败分诊](./build-errors.md)
