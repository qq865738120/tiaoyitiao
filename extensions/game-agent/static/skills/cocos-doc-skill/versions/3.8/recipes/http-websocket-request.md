---
id: cocos-3.8-recipes-http-websocket-request
version: "3.8"
category: recipes
title: HTTP 请求与 WebSocket 通信
keywords:
  - HTTP 请求
  - WebSocket
  - 网络请求
  - 服务器通信
  - XMLHttpRequest
  - fetch
  - 网络通信
  - 长连接
  - 发送消息
  - 超时
  - 重试
  - 网络权限
  - 跨域
  - HTTPS
related_docs:
  - concepts/runtime-environments.md
  - concepts/native-jsb-overview.md
  - api-reference/sys.md
related_api:
  - XMLHttpRequest
  - WebSocket
source:
  official: "Cocos Creator 3.8 官方文档 - 网络与存储、WebSocket"
  verified-against: []
  supplement:
    - "工程经验：网络请求需处理生命周期清理、平台权限和错误重试"
status: draft
updated: 2026-06-18
---

# HTTP 请求与 WebSocket 通信

## 目标

在 Cocos Creator 3.8 游戏中实现 HTTP / HTTPS 请求和 WebSocket 长连接，包括连接建立、收发消息、连接关闭和生命周期清理。不提供完整网络框架，只写基础做法和注意事项。

## 推荐做法

### HTTP 请求

使用引擎运行时支持的 `XMLHttpRequest`（跨平台兼容）或 `fetch`（Web 和部分原生平台）。

`XMLHttpRequest` 在 Web、原生和小游戏平台均有引擎兼容层，推荐作为首选。`fetch` 在部分原生平台的旧 JS 引擎中可能不支持，如果项目必须使用 `fetch` 请在原生平台做兼容测试。

### WebSocket

使用标准 `WebSocket` API。引擎在原生平台通过 JSB 绑定了 C++ 实现的 WebSocket 客户端，API 与浏览器标准一致。

## 示例代码

### HTTP GET 请求

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('HttpGetDemo')
export class HttpGetDemo extends Component {
  start() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.example.com/leaderboard');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 5000; // 超时 5 秒

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log('请求成功', data);
      } else {
        console.error('HTTP 错误', xhr.status, xhr.statusText);
      }
    };

    xhr.onerror = () => {
      console.error('网络请求失败');
    };

    xhr.ontimeout = () => {
      console.error('请求超时');
    };

    xhr.send();
  }
}
```

### HTTP POST 请求

<!-- skip-content-quality: TS_MISSING_IMPORT_FROM_CC -->
```ts
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://api.example.com/login');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.timeout = 5000;

xhr.onload = () => {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log('登录成功', data);
  }
};

xhr.onerror = () => {
  console.error('网络请求失败');
};

xhr.send(JSON.stringify({ username: 'test', password: '123456' }));
```

### WebSocket 连接与收发消息

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('WebSocketDemo')
export class WebSocketDemo extends Component {
  private ws: WebSocket | null = null;

  start() {
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.ws = new WebSocket('wss://echo.example.com/ws');

    this.ws.onopen = () => {
      console.log('WebSocket 已连接');
      this.ws!.send('Hello Server!');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      console.log('收到消息', event.data);
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket 错误', error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket 已关闭', event.code, event.reason);
    };
  }

  sendMessage(msg: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msg);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 组件销毁时关闭 WebSocket 连接，防止内存泄漏和异常回调
  onDestroy() {
    this.disconnect();
  }
}
```

## 操作步骤

1. **确定目标平台**：Web 平台可用 `fetch`（推荐 `XMLHttpRequest` 更统一）；原生平台使用 `XMLHttpRequest`；小游戏使用引擎兼容的 `XMLHttpRequest`。
2. **选择协议**：短连接选 HTTP/HTTPS（登录、排行榜、提交数据）；长连接选 WebSocket（即时消息、多人对战、实时状态同步）。
3. **配置超时**：`xhr.timeout = 5000`（毫秒），并在 `ontimeout` 回调中处理超时逻辑。
4. **处理错误重试**：见下方"错误重试和超时原则"。
5. **处理生命周期**：组件 `onDestroy` 时取消所有进行中的 HTTP 请求和关闭 WebSocket 连接。

## 错误重试和超时原则

**不要在本技能文档中实现完整重试框架**，以下只写通用原则：

1. 重试次数限制：不应无限重试，建议最多 2-3 次，使用指数退避（间隔 1s、2s、4s）。
2. 区分可重试和不可重试的错误：超时、网络中断可重试；HTTP 4xx（客户端错误）不应重试；5xx（服务器错误）可以重试或降级。
3. 统一错误回调：在 `onerror` 和 `ontimeout` 中集中处理错误统计和重试计数。
4. 不要让重试逻辑阻塞 UI 更新——使用延迟回调而非同步等待。
5. WebSocket 连接失败后的重连需要清除旧连接实例，避免多个 WebSocket 实例同时重连。

## 生命周期清理

- HTTP 请求是一次性的，`onload`/`onerror`/`ontimeout` 回调执行后即自动结束。需要取消请求时调用 `xhr.abort()`。
- WebSocket 必须在组件 `onDestroy` 时显式 `close()`，否则：
  - 组件已销毁但 `onmessage`/`onerror`/`onclose` 继续触发，可能访问到已销毁的对象。
  - WebSocket 实例不会被 GC 回收，造成内存泄漏。
  - 多个组件共同管理同一个 WebSocket 连接时，应使用单例管理，避免重复创建和混乱关闭。

## 平台网络权限 / HTTPS / 跨域提示

### 原生平台

- **Android**：在 `build/jsb-link/frameworks/runtime-src/proj.android/app/AndroidManifest.xml` 中确认包含 `<uses-permission android:name="android.permission.INTERNET" />`（通常已经包含，如果不确定可以检查构造后文件）。
- **iOS**：Cocos Creator 默认允许 HTTP（App Transport Security 已有例外配置），但如果自定义构建配置可能需要添加 `NSAppTransportSecurity` 的 `NSExceptionDomains` 配置。
- **HarmonyOS**：网络权限在构建配置中处理，确认已申请 `ohos.permission.INTERNET`。

### HTTPS

- 生产环境应使用 HTTPS，避免明文传输敏感数据。
- 原生平台如果连接 HTTP 地址，需要在构建配置中修改 ATS（iOS）或网络安全配置（Android 9+）。

### 跨域（CORS）

- Web 平台和 Web 预览时，跨域请求需要服务器响应 `Access-Control-Allow-Origin` 头。
- 原生平台和小游戏**没有 CORS 限制**，不需要关注跨域问题。
- 如果在 Web 预览时遇到跨域错误（Console 显示 CORS 相关错误），需要在服务器端配置 CORS 或在浏览器中关闭同源策略（仅开发调试）。

## 验证方式

1. HTTP 请求：在浏览器的 Network 面板（Web 预览）或原生平台的日志中查看 `console.log` 的输出和 `xhr.status`。
2. WebSocket：连接后查看 `onopen` 是否触发；发送消息后查看服务端是否收到；关闭连接后查看 `onclose`。
3. 在组件 `onDestroy` 后检查 WebSocket 实例是否已 `close()`，可以在 `onclose` 回调中打印确认。

## 常见错误

1. **HTTP 请求在原生平台报错**：检查是否使用了 `fetch`（部分原生 JS 引擎不支持），改回 `XMLHttpRequest`。
2. **WebSocket 在原生平台连接失败**：确认服务器地址以 `ws://` 或 `wss://` 开头；HTTPS 页面必须使用 `wss://`。
3. **WebSocket 内存泄漏**：组件销毁时没有 `close()`，导致回调继续执行。在 `onDestroy` 中显式断开。
4. **超时设置不生效或太短**：`xhr.timeout` 单位是毫秒，`ontimeout` 回调中处理超时后的逻辑；过短的超时在高延迟网络下会频繁失败。
5. **WebSocket 连接成功但发不出消息**：确认 `readyState` 为 `WebSocket.OPEN`（值为 1）；如果刚连接成功立刻发送，部分平台可能有短时间延迟，可以延迟 50-100ms 后发送。
6. **小游戏网络请求报错**：小游戏平台对网络请求有域名白名单限制，需要先将服务器域名添加到小游戏管理后台的合法域名列表中。

## 相关文档

- [运行环境](../concepts/runtime-environments.md)
- [原生 / JSB 概述](../concepts/native-jsb-overview.md)
- [sys API - 平台判断](../api-reference/sys.md)
