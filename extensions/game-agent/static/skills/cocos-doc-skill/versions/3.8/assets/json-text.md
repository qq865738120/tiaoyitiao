---
id: cocos-3.8-assets-json-text
version: "3.8"
category: assets
title: JSON 与 Text 资源
keywords:
  - JSON 配置
  - JsonAsset
  - TextAsset
  - 文本资源
  - 配置文件
  - 动态加载JSON
  - 读取配置
  - 加载文本
related_docs:
  - assets/asset-workflow.md
  - assets/dynamic-loading.md
  - assets/resources-folder.md
related_api:
  - JsonAsset
  - TextAsset
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - JSON 资源 / 文本资源"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：JSON 配置加载和 TextAsset 的使用是小游戏配置驱动的常见模式"
status: draft
updated: 2026-06-17
---

# JSON 与 Text 资源

## 用途

说明如何在 Cocos Creator 中使用和加载 JSON 配置文件（`JsonAsset`）和文本文件（`TextAsset`），覆盖编辑器绑定和代码动态加载两种方式。

## 核心结论

- **JSON 文件导入为 `JsonAsset`**：通过 `jsonAsset.json` 获取解析后的 JSON 对象。
- **文本文件导入为 `TextAsset`**：通过 `textAsset.text` 获取文本字符串，支持 `.txt`、`.xml`、`.yaml`、`.csv`、`.md` 等。
- **两种使用方式**：编辑器属性绑定（拖拽赋值）和代码动态加载（`resources.load`）。
- **路径不带扩展名**：`resources.load('data/config', JsonAsset, ...)` 加载 `assets/resources/data/config.json`。

## 什么时候使用

- 需要在脚本中读取 JSON 配置文件（如关卡数据、物品配置、本地化文本）。
- 需要加载 `.txt`、`.csv`、`.xml` 等文本格式的数据文件。
- 需要区分编辑器绑定（适合固定配置）和动态加载（适合运行时切换配置）。

## 关键 API

| API | 作用 | 获取数据方式 |
|---|---|---|
| `JsonAsset` | JSON 资源配置类型 | `jsonAsset.json` → `object` |
| `TextAsset` | 文本资源类型 | `textAsset.text` → `string` |
| `resources.load(path, JsonAsset, cb)` | 动态加载 JSON | 回调中获取 JsonAsset |
| `resources.load(path, TextAsset, cb)` | 动态加载文本 | 回调中获取 TextAsset |

## 最小示例

### 编辑器绑定 JSON（推荐固定配置）

```ts
import { _decorator, Component, JsonAsset } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('JsonConfigDemo')
export class JsonConfigDemo extends Component {
  // 在编辑器中拖拽 JSON 文件到此属性
  @property(JsonAsset)
  levelConfig: JsonAsset | null = null;

  start() {
    if (!this.levelConfig) return;

    // json 属性返回解析后的对象
    const config = this.levelConfig.json as { levels: Array<{ id: number; name: string }> };
    console.log('关卡数量:', config.levels.length);
    config.levels.forEach((level) => {
      console.log(`关卡${level.id}: ${level.name}`);
    });
  }
}
```

### 动态加载 JSON（适合切换配置）

```ts
import { _decorator, Component, JsonAsset, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('DynamicJsonDemo')
export class DynamicJsonDemo extends Component {
  loadConfig(levelId: number) {
    // 按关卡 ID 加载不同配置文件
    resources.load(`configs/level_${levelId}`, JsonAsset, (err, jsonAsset) => {
      if (err || !jsonAsset) {
        console.error('配置文件加载失败:', err);
        return;
      }

      const data = jsonAsset.json as Record<string, unknown>;
      console.log('关卡配置:', data);

      // 使用配置数据...
    });
  }
}
```

### 动态加载文本文件

```ts
import { _decorator, Component, TextAsset, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('TextAssetDemo')
export class TextAssetDemo extends Component {
  start() {
    // 加载 CSV 数据文件（路径不带扩展名）
    resources.load('data/item_data', TextAsset, (err, textAsset) => {
      if (err || !textAsset) return;

      // text 属性返回字符串内容
      const csvContent: string = textAsset.text;

      // 解析 CSV
      const lines = csvContent.split('\n');
      lines.forEach((line) => {
        const columns = line.split(',');
        console.log(columns);
      });
    });
  }
}
```

## 常见错误

1. **路径带扩展名**：`resources.load('config.json', JsonAsset, ...)` → 应去掉 `.json`。
2. **未判空访问 `.json`**：加载失败时 `jsonAsset` 为 null，直接访问 `jsonAsset.json` 会崩溃。
3. **文件名冲突**：同一目录下有 `config.json` 和 `config.txt`，加载时需指定正确类型以区分。
4. **JSON 格式错误**：JSON 文件有语法错误时，`jsonAsset.json` 可能为 null，应在使用前判空。
5. **TextAsset 的文本类型**：`.md` 文件也会导入为 TextAsset，通过 `textAsset.text` 获取原始 Markdown 字符串。

## 关联文档

- [动态加载资源](./dynamic-loading.md)
- [resources 目录使用指南](./resources-folder.md)
- [资源导入与工作流](./asset-workflow.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - JSON 资源 / 文本资源
- 已交叉验证：cc-engine 3.8 公开类型声明（`class JsonAsset extends Asset`、`class TextAsset extends Asset`）
- 补充：工程经验——配置文件动态加载是游戏数据驱动的核心模式
