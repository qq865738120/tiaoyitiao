---
id: cocos-3.8-recipes-local-data-storage
version: "3.8"
category: recipes
title: 本地数据存储与存档
keywords:
  - 本地存储
  - 存档
  - 保存设置
  - 读档
  - sys.localStorage
  - 数据持久化
  - 存储限制
  - JSON 序列化
  - localStorage
  - 游戏存档
related_docs:
  - concepts/runtime-environments.md
  - api-reference/sys.md
  - scripting/coding-pitfalls.md
related_api:
  - sys.localStorage
source:
  official: "Cocos Creator 3.8 官方文档 - 网络与存储 - 数据存储"
  verified-against: []
  supplement:
    - "工程经验：localStorage 适合小数据量，不存储敏感凭证"
status: draft
updated: 2026-06-18
---

# 本地数据存储与存档

## 目标

在 Cocos Creator 3.8 游戏中保存设置、游戏存档、玩家进度等小型本地数据。不涉及后端存储、云存档或数据库集成。

## 推荐做法

使用引擎内置的 `sys.localStorage` API，它与浏览器 `localStorage` API 一致。引擎在原生平台（iOS、Android、PC、HarmonyOS）通过 JSB 封装了本地文件存储，对小游戏平台使用平台 SDK 提供的 Storage 接口。

基本流程：`JSON.stringify()` 序列化 → `sys.localStorage.setItem()` 保存 → `sys.localStorage.getItem()` 读取 → `JSON.parse()` 反序列化。

## 示例代码

### 保存游戏存档

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('SaveManager')
export class SaveManager extends Component {
  /** 保存游戏进度 */
  saveGame(data: { level: number; score: number; playerName: string }) {
    try {
      const json = JSON.stringify(data);
      sys.localStorage.setItem('game_save', json);
      console.log('存档保存成功');
    } catch (e) {
      console.error('存档保存失败', e);
    }
  }

  /** 读取游戏进度 */
  loadGame(): { level: number; score: number; playerName: string } | null {
    try {
      const json = sys.localStorage.getItem('game_save');
      if (json === null) {
        return null; // 没有存档
      }
      return JSON.parse(json) as { level: number; score: number; playerName: string };
    } catch (e) {
      console.error('读档失败', e);
      return null;
    }
  }

  /** 清除存档 */
  clearSave() {
    sys.localStorage.removeItem('game_save');
  }
}
```

### 读取默认值

```ts
import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

@ccclass('SettingsManager')
export class SettingsManager extends Component {
  /** 游戏设置默认值 */
  private defaults = {
    musicVolume: 0.8,
    sfxVolume: 1.0,
    language: 'zh-cn',
    vibrationEnabled: true,
  };

  /** 读取设置，不存在则返回默认值 */
  loadSetting(key: string): any {
    const value = sys.localStorage.getItem(key);
    if (value === null) {
      return (this.defaults as any)[key];
    }
    try {
      return JSON.parse(value);
    } catch {
      return (this.defaults as any)[key];
    }
  }

  /** 保存设置 */
  saveSetting(key: string, value: any) {
    sys.localStorage.setItem(key, JSON.stringify(value));
  }

  start() {
    // 使用默认值加载设置
    const volume = this.loadSetting('musicVolume');
    console.log('音乐音量', volume);
  }
}
```

## 操作步骤

1. **序列化**：使用 `JSON.stringify(data)` 把 JavaScript 对象转换为 JSON 字符串。注意不能序列化 `undefined`、`Function`、`Symbol` 和循环引用。
2. **保存**：`sys.localStorage.setItem(key, jsonString)`。`key` 应为有明确含义的字符串（如 `'game_save'`、`'settings'`），避免用变量名做 key。
3. **读取**：`sys.localStorage.getItem(key)`。返回 `null` 表示该 key 不存在（从未保存或已被清除）。
4. **反序列化**：`JSON.parse(jsonString)` 把 JSON 字符串还原为 JavaScript 对象。注意 `JSON.parse` 可能抛出异常，应使用 try-catch 包裹。
5. **删除**：`sys.localStorage.removeItem(key)` 删除单个；`sys.localStorage.clear()` 清空所有。
6. **设置默认值**：`getItem` 返回 `null` 时使用预先定义的默认值对象，不要假设数据一定存在。

## 验证方式

1. 写入后立即读取，确认返回值与写入值一致（类型和结构）。
2. 重新启动游戏后读取，确认数据在进程重启后仍然存在。
3. 在原生平台测试时，清除应用数据（iOS 删除重装 / Android 清空应用数据）后启动，确认 `getItem` 返回 `null`，默认值生效。
4. 使用 `JSON.stringify` / `JSON.parse` 测试反序列化异常场景：手动在代码中尝试 `JSON.parse('invalid')` 确认 catch 分支正常工作。

## 平台存储限制

| 平台 | 存储机制 | 典型限制 | 备注 |
|---|---|---|---|
| Web 预览 | 浏览器 `localStorage` | 5-10 MB | 受浏览器同源策略限制 |
| iOS | `NSUserDefaults` 或文件存储 | 无硬限制，建议 < 1 MB | 引擎通过 JSB 封装，数据以文件存储在 App 沙箱 |
| Android | SharedPreferences 或文件存储 | 无硬限制，建议 < 1 MB | 引擎通过 JSB 封装，数据以文件存储在应用私有目录 |
| 小游戏（微信） | 微信 Storage API | 单个 key < 1 MB，总计 < 10 MB | 引擎通过平台 SDK 封装，扩展存储需申请 |
| 小游戏（其它平台） | 各平台 Storage | 不同平台限制不同 | 建议查阅具体平台开发文档 |

> 注：`sys.localStorage` 适合存储设置、玩家存档等小型数据。**不适合存储**大量游戏资产、图片缓存、大文件等。大文件存储应使用引擎的 `assetManager` 或原生文件系统 API。

## 不存储敏感凭证

**不要在 `sys.localStorage` 中存储以下内容：**

- API Key、密钥、Token（任何形式）
- 用户密码
- 未加密的支付信息
- 个人身份信息（如未加密的手机号、身份证号）

原因：
1. `sys.localStorage` 在原生平台以明文文件存储在小沙箱，可以被 root 后读取。
2. 在小游戏平台，部分平台的 Storage 内容可以通过开发者工具查看。
3. 需要存储登录态时，使用短生命周期的 session token，而非长期凭证；敏感数据应通过后端服务存储。

## 常见错误

1. **直接存对象而不序列化**：`sys.localStorage.setItem('key', dataObject)` 会导致存储 `[object Object]` 字符串。**必须先 `JSON.stringify` 再存储。**
2. **读档时忘记异常处理**：`JSON.parse` 如果在存储的 JSON 字符串出错时会抛出异常，应用 try-catch 包裹。
3. **存档版本不兼容**：游戏更新后存档数据结构变化，旧存档 `JSON.parse` 后缺少新字段。应使用版本号字段或迁移逻辑。
4. **存储频率过高**：在 `update()` 中每帧保存，频繁的 I/O 操作影响性能。只在状态改变的关键节点保存（关卡结束、切后台、手动存档）。
5. **使用 `clear()` 清除所有玩家数据**：`clear()` 清除应用的所有 `sys.localStorage` 数据，包括可能由引擎或其他系统组件存储的内容。尽量使用 `removeItem()` 逐个删除。
6. **过度依赖默认值**：如果在保存时没有写入数据结构中某些字段，读取时只使用默认值读取顶层属性，可能导致深层嵌套的属性为 `undefined`。建议保存和读取都使用完整结构化数据。

## 相关文档

- [运行环境](../concepts/runtime-environments.md)
- [sys API - 平台判断](../api-reference/sys.md)
- [编码陷阱 - 异步回调](../scripting/coding-pitfalls.md)
