---
id: cocos-3.8-recipes-command-line-build
version: "3.8"
category: recipes
title: 命令行构建
keywords:
  - 命令行构建
  - CI 构建
  - 自动化构建
  - 构建参数
  - 构建日志
  - 批量构建
  - 无头构建
  - CocosCreator 命令行
  - 构建脚本
related_docs:
  - troubleshooting/build-errors.md
  - troubleshooting/build-web.md
  - troubleshooting/build-wechat-game.md
  - troubleshooting/build-android.md
  - troubleshooting/build-ios.md
related_api: []
source:
  official: "Cocos Creator 3.8 官方文档 - 构建发布 - 命令行发布项目"
  verified-against: []
  supplement:
    - "工程经验：命令行构建适用于 CI、重复构建和定位构建问题，不应与项目私有 CI 配置耦合"
status: draft
updated: 2026-06-18
---

# 命令行构建

## 目标

通过命令行（终端）执行 Cocos Creator 项目构建，而非使用编辑器中的构建发布面板。

## 适用场景

- **CI/CD 自动化**：集成到持续集成流水线中，实现自动化构建和发布。
- **重复构建**：需要频繁构建相同项目时，避免每次都手动操作构建面板。
- **定位构建问题**：通过命令行参数精确控制构建配置，排查特定配置下的构建异常。
- **批量构建**：一次运行脚本构建多个平台或多个配置的发布包。

## 推荐做法

### 基本命令格式

```bash
# macOS
/Applications/CocosCreator/Creator/3.8.0/CocosCreator.app/Contents/MacOS/CocosCreator \
  --project /path/to/your/project \
  --build "platform=web-mobile;debug=true"

# Windows
...\CocosCreator.exe --project projectPath --build "platform=web-desktop;debug=true"
```

> **注意**：实际路径中的版本号（`3.8.0`）需要替换为你安装的 Cocos Creator 具体版本。

### 构建参数来源

构建参数可以通过以下方式获取：

1. **从构建发布面板导出配置**：打开 **项目 -> 构建发布** 面板，配置好构建选项后，点击面板顶部的 **Export** 按钮，导出 JSON 配置文件。这是最推荐的参数来源，确保与面板配置一致。
2. **使用 `--build` 参数直接传递**：在命令行中以分号分隔的键值对传递。例如：
   ```bash
   --build "platform=web-mobile;debug=true;md5Cache=true"
   ```
3. **使用 `configPath` 参数指定配置文件**：导出 JSON 文件后，在 `--build` 中使用 `configPath` 引用：
   ```bash
   --build "configPath=./build-config.json"
   ```

### 平台参数对照

不同平台的构建参数作为 `packages` 嵌套在构建参数中。导出 JSON 配置时可清晰看到各平台的特定参数，例如：

```json
{
  "platform": "wechatgame",
  "packages": {
    "wechatgame": {
      "appid": "wx1234567890abcdef"
    }
  }
}
```

### 如何保存日志

1. **直接重定向输出**：
   ```bash
   /Applications/CocosCreator/Creator/3.8.0/CocosCreator.app/Contents/MacOS/CocosCreator \
     --project /path/to/your/project \
     --build "platform=web-mobile" > build.log 2>&1
   ```

2. **使用 `logDest` 参数**（推荐）：
   ```bash
   --build "platform=web-mobile;logDest=./build-output.log"
   ```
   该参数可指定构建日志的输出路径。

3. **在 CI 环境中**：CI 系统通常会自动捕获 stdout/stderr，可以直接将命令输出与 CI 日志系统集成。

### 进程退出码

构建完成后可通过退出码判断结果：

| 退出码 | 含义 |
|-------|------|
| 36    | 构建成功 |
| 32    | 构建参数不合法 |
| 34    | 构建过程出错（查看日志定位问题） |

## 操作步骤

1. **确认 Cocos Creator 安装路径**：在终端中确认编辑器的安装路径，不同版本和安装方式的路径可能不同。

2. **导出构建配置**（推荐）：
   - 打开 Cocos Creator 编辑器。
   - 打开 **项目 -> 构建发布** 面板。
   - 配置好构建选项（平台、调试模式、AppID 等）。
   - 点击面板顶部的 **Export** 按钮，保存 JSON 配置文件到项目目录。

3. **执行命令行构建**：
   ```bash
   # 使用导出的配置文件
   /Applications/CocosCreator/Creator/3.8.0/CocosCreator.app/Contents/MacOS/CocosCreator \
     --project /path/to/your/project \
     --build "configPath=./build-config.json"
   ```

4. **检查构建结果**：
   - 退出码为 36 表示成功。
   - 退出码为 34 时，查看构建日志文件。

## 验证方式

- 构建成功后，在 `build/` 目录下检查构建产物是否存在（如 `web-mobile/index.html`、`wechatgame/game.json` 等）。
- 检查退出码是否为 36。
- 对于原生平台，在对应的原生 IDE 中打开项目进一步验证。

## 常见错误

### 找不到 CocosCreator 命令

- 确保 Cocos Creator 编辑器已安装。
- 检查命令中的路径是否与安装路径匹配。
- macOS 上完整路径为：`/Applications/CocosCreator/Creator/<版本号>/CocosCreator.app/Contents/MacOS/CocosCreator`。
- 可以将该路径添加到 shell 别名或脚本变量中，避免每次输入完整路径。

### 构建参数不合法（退出码 32）

- 确认 `--build` 后的参数格式正确：使用双引号包裹，分号分隔不同参数。
- 确认平台名称与构建面板中一致（如 `web-mobile`、`wechatgame`、`android`）。
- 尝试先从构建面板导出配置文件，验证后再在命令行中使用 `configPath` 引用。

### 构建过程出错（退出码 34）

1. 查看构建日志（通过 `logDest` 参数指定或直接查看命令行输出）。
2. 日志中的错误信息通常会指向具体原因：脚本编译错误、资源丢失、配置错误等。
3. 根据错误信息，回到各平台对应的排错文档：

| 平台 | 排错文档 |
|------|---------|
| Web | [Web 构建失败](../troubleshooting/build-web.md) |
| 微信小游戏 | [微信小游戏构建失败](../troubleshooting/build-wechat-game.md) |
| Android | [Android 构建失败](../troubleshooting/build-android.md) |
| iOS | [iOS 构建失败](../troubleshooting/build-ios.md) |
| 通用 | [构建失败错误分诊](../troubleshooting/build-errors.md) |

## 相关文档

- [构建失败错误分诊](../troubleshooting/build-errors.md)
- [Web 构建失败](../troubleshooting/build-web.md)
- [微信小游戏构建失败](../troubleshooting/build-wechat-game.md)
- [Android 构建失败](../troubleshooting/build-android.md)
- [iOS 构建失败](../troubleshooting/build-ios.md)
