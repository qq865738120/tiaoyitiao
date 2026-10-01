---
id: cocos-3.8-api-reference-web-view
version: "3.8"
category: api-reference
title: WebView
keywords:
  - WebView
  - 网页
  - 嵌入网页
  - 网页打不开
  - 加载网页
  - 浏览器
  - 内嵌浏览器
related_docs:
  - recipes/play-video.md
related_api:
  - WebView
  - WebView.EventType
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - WebView 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement:
    - "needs-review: 小游戏平台不支持 WebView；原生平台可用；部分应用商店可能因 WebView 内容审核风险拒绝上架"
status: draft
updated: 2026-06-17
---

# WebView

## 用途

WebView 组件用于在游戏中嵌入网页，支持加载远程 URL，适用于显示公告、活动页面、帮助文档等场景。支持 Web、iOS 和 Android 平台。

## 所属模块

```ts
import { WebView } from 'cc';
```

## 公开导出结论

- `WebView` 在 `cc` 模块以 `export class WebView extends Component` 公开导出。
- 事件类型通过 `WebView.EventType` 静态属性暴露，等同于 `_cocos_web_view_web_view_enums__EventType` 枚举。
- 公开属性（全部 getter/setter）：`url`（get/set）、`state`（只读）、`nativeWebView`（只读）。
- 公开方法：`setJavascriptInterfaceScheme(scheme: string)`、`setOnJSCallback(callback: () => void)`、`evaluateJS(str: string)`。
- 公开事件回调数组：`webviewEvents`（`EventHandler[]` 类型，通过编辑器或代码绑定回调）。
- **平台限制**：小游戏平台不支持 WebView 组件；原生平台（iOS/Android）可用但需注意审核风险；Web 平台使用 iframe 实现。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `url` | 要加载的网址（需 http/https 前缀） | 设置加载页面 |
| `state` | 当前网页视图状态（只读） | 监听加载状态 |
| `nativeWebView` | 原始网页对象（Web 平台为 HTMLIFrameElement，只读） | 高级定制 |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `setJavascriptInterfaceScheme(scheme)` | 设置 JavaScript 接口方案（仅 Android/iOS） | 原生层 JS 通信 |
| `setOnJSCallback(callback)` | 设置 JS 回调（仅 Android/iOS） | 原生层 JS 回调接收 |
| `evaluateJS(str)` | 执行 WebView 内页面脚本 | 注入 JS 操作页面内容 |

## 事件类型（WebView.EventType）

| 事件 | 值 | 说明 |
|---|---|---|
| `LOADING` | `"loading"` | 网页加载中 |
| `LOADED` | `"loaded"` | 网页加载完成 |
| `ERROR` | `"error"` | 网页加载出错 |

事件绑定通过节点的 `node.on(WebView.EventType.XXX, callback, target)` 方式注册，或在编辑器 `webviewEvents` 数组中配置 `EventHandler`。

## 高频代码

### 加载网页并监听事件

```ts
import { _decorator, Component, WebView } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WebViewExample')
export class WebViewExample extends Component {
  @property(WebView)
  webView: WebView | null = null;

  start() {
    if (!this.webView) return;

    // 设置 URL
    this.webView.url = 'https://example.com';

    // 监听加载事件
    this.node.on(WebView.EventType.LOADING, this.onLoading, this);
    this.node.on(WebView.EventType.LOADED, this.onLoaded, this);
    this.node.on(WebView.EventType.ERROR, this.onError, this);
  }

  onLoading() {
    console.log('网页加载中...');
  }

  onLoaded() {
    console.log('网页加载完成');
  }

  onError() {
    console.error('网页加载出错');
  }

  onDestroy() {
    this.node.off(WebView.EventType.LOADING, this.onLoading, this);
    this.node.off(WebView.EventType.LOADED, this.onLoaded, this);
    this.node.off(WebView.EventType.ERROR, this.onError, this);
  }
}
```

### 动态加载 URL

```ts
import { _decorator, Component, WebView } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DynamicWebViewExample')
export class DynamicWebViewExample extends Component {
  @property(WebView)
  webView: WebView | null = null;

  loadURL(url: string) {
    if (!this.webView) return;
    this.webView.url = url; // 直接赋值即可触发加载
  }
}
```

### 执行 WebView 内 JavaScript

```ts
import { _decorator, Component, WebView } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WebViewJSExample')
export class WebViewJSExample extends Component {
  @property(WebView)
  webView: WebView | null = null;

  injectScript() {
    if (!this.webView) return;

    // 在加载完成的页面中执行 JS
    this.webView.evaluateJS('alert("Hello from Cocos!");');
  }
}
```

### 通过代码获取 WebView 组件

```ts
import { _decorator, Component, WebView } from 'cc';

const { ccclass } = _decorator;

@ccclass('GetWebViewExample')
export class GetWebViewExample extends Component {
  start() {
    const webView = this.node.getComponent(WebView);
    if (!webView) return;

    webView.url = 'https://example.com';
  }
}
```

## 常见错误

1. **空白页（URL 格式不对或 HTTPS 问题）** — WebView 的 `url` 必须以 `http://` 或 `https://` 开头，不能省略协议头。混合内容（HTTPS 页面加载 HTTP 资源）可能被浏览器阻止。

2. **跨域限制** — WebView 内部加载的页面受到浏览器跨域安全策略限制，跨域问题需自行解决。`evaluateJS` 同样受跨域约束。

3. **小游戏平台不支持** — 微信小游戏、抖音小游戏等平台**不支持** WebView 组件，在这些平台上使用会导致功能缺失。发布前需检查目标平台是否支持。

4. **审核风险** — 部分应用商店（如 App Store）对 WebView 加载的内容有审核要求，加载不可控的第三方网页可能导致应用被拒。建议加载自主可控的页面内容。

5. **未设置 UITransform 尺寸** — 与 VideoPlayer 类似，WebView 节点也需要有 `UITransform` 组件且尺寸大于 0，否则显示区域为 0。

## 关联任务

- [播放视频](../recipes/play-video.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - WebView 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
