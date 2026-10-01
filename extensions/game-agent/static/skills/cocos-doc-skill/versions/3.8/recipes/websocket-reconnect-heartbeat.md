---
id: cocos-3.8-recipes-websocket-reconnect-heartbeat
version: "3.8"
category: recipes
title: WebSocket 心跳保活与断线重连
keywords:
  - WebSocket
  - 心跳
  - 断线重连
  - 指数退避
  - 连接状态机
  - 长连接
  - 保活
  - 网络重连
  - 平台差异
related_docs:
  - recipes/http-websocket-request.md
  - concepts/runtime-environments.md
  - api-reference/sys.md
related_api:
  - WebSocket
  - sys
source:
  official: "Cocos Creator 3.8 官方文档 - 网络与存储 - WebSocket"
  verified-against: []
  supplement:
    - "心跳保活和断线重连是通用网络模式，非 Cocos 专有 API，但工程封装方式有价值"
status: draft
updated: 2026-06-18
---

# WebSocket 心跳保活与断线重连

## 目标

在 Cocos Creator 3.8 游戏中构建可靠的 WebSocket 长连接，包含心跳保活（ping/pong）、断线重连（指数退避）、连接状态管理及生命周期清理。

## 核心结论

- **WebSocket 是 Web 平台标准 API，不是 Cocos 专有 API**。Cocos 原生平台通过 JSB 绑定了 C++ 实现的 WebSocket 客户端，API 与浏览器标准一致。
- **心跳保活、断线重连（指数退避）、连接状态机是通用网络模式**，不依赖 Cocos 引擎特殊功能。
- **平台差异需要注意**：Web 使用标准 WebSocket；原生平台通过 JSB；微信小游戏最多 2 个并发连接并需要域名白名单。

## 心跳保活（Heartbeat）

- 客户端定时发送 ping 消息（如每 30 秒）。
- 服务端需回复 pong 消息。
- 超时未收到 pong 视为断线，触发重连流程。

## 断线重连（指数退避）

- 初始重连间隔：1 秒。
- 每次重连失败间隔翻倍：1s -> 2s -> 4s -> 8s -> 16s -> 30s（封顶）。
- 重连成功后重置退避间隔。
- 设置最大重连次数（如 10 次），超过后停止重连，通知上层。

## 连接状态机

```
CLOSED -> CONNECTING -> CONNECTED -> RECONNECTING -> CONNECTING -> ...
```

每个状态转换时触发对应回调，便于上层 UI 显示连接状态。

## 最小可复制示例

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

enum ConnectionState {
    CLOSED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
}

@ccclass('WebSocketManager')
export class WebSocketManager extends Component {
    private ws: WebSocket | null = null;
    private url = 'wss://example.com/ws';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1;
    private maxReconnectDelay = 30;
    private heartBeatTimer: number | null = null;
    private heartBeatInterval = 30000; // 30s
    private pongTimeout: number | null = null;
    private pongTimeoutDuration = 5000; // 5s
    private state: ConnectionState = ConnectionState.CLOSED;

    connect() {
        if (this.state === ConnectionState.CONNECTING) return;
        this.setState(ConnectionState.CONNECTING);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('[WS] 已连接');
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1;
            this.setState(ConnectionState.CONNECTED);
            this.startHeartBeat();
        };

        this.ws.onmessage = (event: MessageEvent) => {
            const data = event.data as string;
            if (data === 'pong') {
                this.clearPongTimeout();
                return;
            }
            this.handleMessage(data);
        };

        this.ws.onerror = (err: Event) => {
            console.error('[WS] 错误', err);
        };

        this.ws.onclose = (event: CloseEvent) => {
            console.log('[WS] 关闭', event.code, event.reason);
            this.stopHeartBeat();
            if (this.state === ConnectionState.CONNECTED) {
                this.scheduleReconnect();
            }
        };
    }

    private setState(state: ConnectionState) {
        this.state = state;
        this.node.emit('connection-state-changed', state);
    }

    private startHeartBeat() {
        this.stopHeartBeat();
        this.heartBeatTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
                // 设置 pong 超时
                this.pongTimeout = setTimeout(() => {
                    console.warn('[WS] pong 超时，视为断线');
                    this.ws!.close();
                }, this.pongTimeoutDuration);
            }
        }, this.heartBeatInterval);
    }

    private stopHeartBeat() {
        if (this.heartBeatTimer !== null) {
            clearInterval(this.heartBeatTimer);
            this.heartBeatTimer = null;
        }
        this.clearPongTimeout();
    }

    private clearPongTimeout() {
        if (this.pongTimeout !== null) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WS] 达到最大重连次数，停止重连');
            this.setState(ConnectionState.CLOSED);
            return;
        }

        this.setState(ConnectionState.RECONNECTING);
        console.log(`[WS] 第 ${this.reconnectAttempts + 1} 次重连，间隔 ${this.reconnectDelay}s`);

        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, this.reconnectDelay * 1000);

        // 指数退避，封顶
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }

    private handleMessage(data: string) {
        // 处理业务消息
        console.log('[WS] 收到消息', data);
    }

    send(data: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    disconnect() {
        this.stopHeartBeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.reconnectAttempts = 0;
        this.setState(ConnectionState.CLOSED);
    }

    onDestroy() {
        this.disconnect();
    }
}
```

## 平台差异

### Web 平台

标准 WebSocket API，无额外限制。

### 原生平台（JSB）

Cocos Creator 通过 JSB 绑定 C++ WebSocket 实现。v3.5 前的 Android 版本可能需要配置证书文件路径。API 与浏览器标准一致。

### 微信小游戏

- 最多 **2 个并发 WebSocket 连接**，超过会报错。
- 需要先在微信公众平台配置服务器域名白名单。
- WebSocket 地址必须使用 `wss://` 协议。

### 抖音小游戏

类似微信小游戏的限制，需确认平台文档。

## 生命周期清理

- 组件 `onDestroy` 中必须调用 `close()` 并清除所有定时器（心跳定时器和重连定时器），避免内存泄漏和异常回调。
- 单例管理的 WebSocket 连接，应在应用退出时主动关闭。
- 如果组件销毁时仍有重连定时器未执行，使用 `clearTimeout` 清理。

## 验证方式

1. 正常连接：启动游戏，确认 `onopen` 触发，心跳定时器开始发送 ping。
2. 断线重连：关闭服务端或断开网络，确认 `onclose` 触发后进入重连流程。
3. 指数退避：观察重连间隔是否正确递增（1s -> 2s -> 4s -> ... -> 30s）。
4. 最大重连停止：超过 `maxReconnectAttempts` 后确认不再重连。
5. 精灵活性清理：销毁组件后确认定时器停止、WebSocket 关闭、无回调触发。

## 常见错误

1. **未清理定时器**：组件销毁后心跳定时器继续执行，尝试访问已销毁的对象。
2. **多实例同时重连**：同一个连接被多个组件管理，导致多个 WebSocket 实例同时重连。应使用单例管理。
3. **重连后旧实例未关闭**：新连接创建前未 `close()` 旧实例，导致 WebSocket 泄漏。
4. **小游戏并发超限**：同时打开多个 WebSocket 连接，超出小游戏平台限制（如微信最多 2 个）。
5. **HTTPS 页面使用 ws://**：安全页面必须使用 `wss://`，否则浏览器会阻止连接。

## 相关文档

- [HTTP 请求与 WebSocket 通信](../recipes/http-websocket-request.md)
- [运行环境](../concepts/runtime-environments.md)
- [sys API - 平台判断](../api-reference/sys.md)
