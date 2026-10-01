---
id: cocos-3.8-recipes-i18n-multi-language
version: "3.8"
category: recipes
title: 多语言国际化方案（i18n）
keywords:
  - i18n
  - 国际化
  - 多语言
  - L10N
  - 本地化
  - 语言切换
  - 文本本地化
  - 资源本地化
related_docs:
  - api-reference/sys.md
  - api-reference/label.md
  - api-reference/sprite.md
related_api:
  - sys.languageCode
  - Label
  - Sprite
source:
  official: "Cocos Creator 3.8 官方文档 - 本地化编辑器"
  verified-against: []
  supplement:
    - "无公开引擎 API，是编辑器工具链/方案级功能，需人工确认"
status: needs-review
updated: 2026-06-18
---

# 多语言国际化方案（i18n）

> **此文档标记为 needs-review**：本地化是编辑器工具链/方案级功能而非引擎公开 API，具体配置方式可能随 Cocos Creator 版本变化。

## 目标

在 Cocos Creator 3.8 游戏中实现多语言支持，包含文本本地化、资源（图片/音频）本地化、语言切换及 UI 刷新。本文为方案型 recipe，不提供引擎公开 API。

## 核心结论

- **Cocos Creator 3.6+ 内置 L10N 本地化系统**：通过面板 -> 本地化编辑器使用，支持文本、音频、图片本地化。v3.1-v3.5 可通过 Cocos Store 下载 i18n 扩展插件（LocalizedLabel / LocalizedSprite）。
- **无公开引擎 API**：本地化是编辑器工具链 / 方案级功能，不是引擎导出的 JavaScript API。本文同时提供编辑器方案和纯代码方案。
- **语言切换后 UI 不会自动刷新**：需要手动通知所有引用本地化文本的组件。

## 推荐做法（v3.6+ 编辑器方案）

1. **启用 L10N 系统**：面板 -> 本地化编辑器。
2. **使用 L10N Label 组件**：替代手动字符串替换。该组件绑定文本 key 和语言表。
3. **收集并统计需要本地化的文本**：在本地化编辑器中导入或手动录入。
4. **编译语言**：配置目标语言，L10N 系统生成对应语言的资源副本。

## 无编辑器方案（纯代码方案）

适用于不使用 L10N 编辑器的项目，或需要自定义本地化逻辑的情况。

### JSON 语言表

```ts
// lang/zh.json
{
    "start_game": "开始游戏",
    "settings": "设置",
    "score": "分数：{}"
}

// lang/en.json
{
    "start_game": "Start Game",
    "settings": "Settings",
    "score": "Score: {}"
}
```

### 语言切换

遍历所有 Label 组件，根据当前语言更新 `label.string`：

```ts
import { _decorator, Component, Node, Label, sys } from 'cc';
const { ccclass } = _decorator;

type LangTable = Record<string, string>;

@ccclass('I18nManager')
export class I18nManager extends Component {
    private static instance: I18nManager;
    private currentLang: string = 'zh';
    private tables: Record<string, LangTable> = {};

    static getInstance(): I18nManager {
        return I18nManager.instance;
    }

    onLoad() {
        I18nManager.instance = this;
        // 使用 sys.languageCode 获取 ISO 639-1 语言代码
        const systemLang = sys.languageCode;
        this.currentLang = systemLang.startsWith('zh') ? 'zh' : 'en';
    }

    setLanguage(lang: string) {
        this.currentLang = lang;
        // 发送自定义事件通知所有需要刷新的组件
        this.node.emit('language-changed', lang);
    }

    getText(key: string, ...args: any[]): string {
        const table = this.tables[this.currentLang];
        if (!table) return key;
        let text = table[key] || key;
        if (args.length > 0) {
            args.forEach((arg, i) => {
                text = text.replace(`{}`, String(arg));
            });
        }
        return text;
    }
}
```

### 使用 sys.languageCode

`sys.languageCode` 返回 ISO 639-1 格式的语言代码（如 `"zh"`、`"en"`、`"ja"`），用于语言自动检测。

## 图片/资源本地化

按语言分目录组织资源：

- `assets/textures/zh/banner.png`
- `assets/textures/en/banner.png`

切换语言时动态加载对应目录资源：

```ts
import { resources, SpriteFrame, Sprite } from 'cc';

function switchBanner(lang: string, sprite: Sprite) {
    const path = `textures/${lang}/banner`;
    resources.load(path, SpriteFrame, (err, sf) => {
        if (err) return;
        sprite.spriteFrame = sf;
    });
}
```

## 语言切换后 UI 刷新

- **发送自定义事件**：通过全局管理器派发 `language-changed` 事件，各组件监听后刷新文本。
- **维护全局语言管理器单例**：各组件在 `start` / `update` 中检查语言是否变化。
- **L10N 系统自动处理**：使用编辑器的 L10N Label 组件后，切换语言时自动刷新文本。

## 常见错误

1. **将 i18n 误认为是引擎公开 API**：这不是引擎的 JavaScript API，而是编辑器工具链功能。
2. **文本表 key 命名不规范**：建议使用 `模块_用途` 格式（如 `menu_start_game`），避免后续扩充时冲突。
3. **切换语言后部分 UI 未刷新**：未正确通知所有使用了本地化文本的组件。
4. **数字/日期格式化未随语言切换**：不同语言对数字分隔符、日期格式有不同习惯，需额外处理。
5. **未考虑字体支持**：中文需要中文字体包，英文使用英文字体。语言切换后需动态切换字体。

## 小游戏平台注意事项

小游戏平台获取系统语言的方式可能不同（如微信小游戏通过 `wx.getSystemInfoSync().language`）。在纯代码方案中，需要根据平台做兼容处理。

## 验证方式

1. 在预览模式或发布包中，切换系统语言后检查游戏文本是否正确显示。
2. 手动切换语言后检查所有 UI 组件是否均已刷新。
3. 检查语言 key 是否有遗漏（未翻译的 key 会直接显示 key 名）。
4. 检查数字格式化是否正确（小数点、千分位等）。

## 相关文档

- [sys API - 平台/语言检测](../api-reference/sys.md)
- [Label 组件 API](../api-reference/label.md)
- [Sprite 组件 API](../api-reference/sprite.md)
