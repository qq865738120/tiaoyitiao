---
id: cocos-3.8-troubleshooting-shader-compile-failed
version: "3.8"
category: troubleshooting
title: Shader 编译失败排错
keywords:
  - Shader 编译失败
  - 着色器编译错误
  - .effect 编译报错
  - 着色器代码错误
  - YAML 错误
  - Shader 报错
  - 效果文件报错
  - 着色器语法错误
  - 自定义 Shader 编译
related_docs:
  - concepts/effect-shader-overview.md
  - recipes/create-simple-effect.md
  - troubleshooting/build-errors.md
  - troubleshooting/performance-issues.md
related_api:
  - EffectAsset
  - Material
source:
  official: "Cocos Creator 3.8 官方文档 - 着色器语法、YAML 101、预处理宏定义"
  verified-against:
    - "cc-engine 3.8 内置着色器源码 (builtin-unlit.effect, builtin-sprite.effect)"
  supplement:
    - "工程经验：Shader 编译失败 90% 是缩进或名称不匹配问题"
    - "工程经验：降级到官方最小 Effect 是最高效的排除手段"
status: draft
updated: 2026-06-17
---

# Shader 编译失败排错

## 现象

在编辑器中保存或修改 `.effect` 文件后，Console 面板输出红色编译错误信息。Material 显示异常、材质预览变粉红色或白色，或者使用了该 Effect 的渲染组件无法正常运行。

## 排查顺序

### 1. 查看控制台编译错误位置

打开编辑器底部的 **Console** 面板（开发者 → Console），定位错误信息。常见错误信息形式：

```
[Effect] compile <path/to/my-effect.effect> failed:
YAMLException: ... at line X, column Y
```

**关键信息**：
- 文件名和路径
- 错误行号和列号
- 错误类型（YAML 解析错误 / GLSL 语法错误 / 宏定义错误）

### 2. 检查 YAML / Effect 结构

这是最高的错误来源。检查以下内容：

- `CCEffect %{` 和 `}%` 必须正确闭合，`%` 前后不能有空格——冒号前的空格会导致解析失败。
- **缩进一致性**：YAML 使用空格缩进（不可用 Tab），同层级元素缩进一致。
  ```yaml
  # 正确缩进
  techniques:
  - passes:
    - vert: my-vs:vert
      frag: my-fs:frag
  ```
- **冒号后必须有空格**：如 `vert: my-vs:vert`（正确） vs `vert:my-vs:vert`（错误）。
- 列表项以 `- `（短横线+空格）开头。
- `}%` 之后不能有多余内容，CCProgram 块同样使用 `CCProgram name %{ ... }%` 格式。
- 编辑器会对 `.effect` 文件自动校验，错误信息中的行号通常指向 `CCEffect` 块的 YAML 部分。

### 3. 检查 Property / Uniform 名称和类型

- Effect 中 `properties` 段声明的属性名必须与 `CCProgram` 内的 Uniform 名称**完全一致**（区分大小写）。
  ```yaml
  # properties 中的名称
  properties:
    myColor: { value: [1, 1, 1, 1] }
  ```
  ```glsl
  // CCProgram 中的 Uniform 名称必须匹配
  uniform Constant {
    vec4 myColor;
  };
  ```
- 使用 `target` 字段可重定向到不同的 Uniform 名称。详见 Effect 语法文档。
- 类型匹配：`vec4` 对应 `Color` 或 `[number, number, number, number]`；`float` 对应 `number`；`sampler2D` 对应 `Texture2D`。
- 2D 材质的 Uniform 必须放在 `uniform Constant { }` 块内（**不允许离散 Uniform**）。

### 4. 检查宏定义、include 路径和平台差异

- **宏默认值为 0 (false)**，使用 `#if MACRO_NAME` 而非 `#ifdef MACRO_NAME` 判断——`#ifdef` 对自定义宏始终为 true，因为引擎会在运行时为所有出现的宏定义默认值 `#define MACRO_NAME 0`。
- `#include <...>` 中的路径必须存在，按引擎约定引用内置 chunk：`#include <builtin/uniforms/cc-global>` 等。
- 常用 include 路径：
  - `#include <builtin/uniforms/cc-global>`：全局 Uniform（投影矩阵、相机位置等）
  - `#include <builtin/uniforms/cc-local>`：局部 Uniform（模型矩阵）
  - `#include <builtin/internal/embedded-alpha>`：嵌入 Alpha 处理
  - `#include <builtin/internal/alpha-test>`：Alpha Test 宏
- **平台差异**：
  - 某些 GLSL 语法在 WebGL 1.0 上不支持（如 `texture()` 的某些重载）。
  - `precision` 声明：WebGL 需要 `precision highp float;` 或 `precision mediump float;`。
  - 函数式宏（Function-like Macros）在 WebGL 1.0 原生不支持，但 Cocos Shader 编译时会自动展开。
  - UBO（Uniform Buffer Object）在 WebGL 1.0 上可能不可用——Cocos 有 fallback 机制，但自定义 Uniform 块建议保持在 `uniform Constant { }` 中。
- 如果 Effect 使用了 Surface Shader 语法，需要确保包含对应的 Surface Shader header。

### 5. 降级到官方示例最小 Effect

如果上述检查均未发现问题，降级到官方最小 Effect 进行测试：

1. 从 `internal/effects/builtin-sprite.effect` 复制内容到一个新的临时 `.effect` 文件。
2. 确认这个最小 Effect 可以正常编译和显示。
3. 逐步添加自己的修改（每次添加一小段后保存测试）。
4. 若最小 Effect 也编译失败，说明编辑器资源系统存在问题——尝试重启编辑器或重建资源。

## 仍未解决时

- 在 VS Code 中安装 **Cocos Effect** 插件获得语法高亮和基础校验。
- 检查 `.effect` 文件编码是否为 UTF-8（不含 BOM）。
- 确认 Cocos Creator 版本是否为最新的 3.8.x 补丁版本。
- 将 `.effect` 文件内容贴到 [在线 YAML JSON 转换器](https://codebeautify.org/yaml-to-json-xml-csv) 验证 YAML 段是否正确。
- 在官方论坛搜索相同版本下的 Shader 编译问题。
- 考虑平台兼容性：在 Web 桌面端调试通过后，再测试移动端和小游戏平台。

## 相关文档

- [Effect / Shader 概念概览](../concepts/effect-shader-overview.md)
- [创建简单 Effect 步骤](../recipes/create-simple-effect.md)
- 着色器语法和 YAML 101 详见官方文档"着色器语法"与"YAML 101"章节
- 预处理宏定义详见官方文档"预处理宏定义"章节
- [构建失败分诊](./build-errors.md)
