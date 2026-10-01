---
name: cocos-doc-skill
description: Cocos Creator 3.7 及以上版本游戏开发、编辑器工作流、组件 API、任务方案与报错排查；遇到 Cocos 知识盲区时使用。
metadata:
  game-agent-display-name: "Cocos 官方文档技能"
  game-agent-invocation: "auto"
---
# Cocos 官方文档技能

本技能适用于 Creator 3.7 及以上版本，现有知识卡片来源仍为 3.8。在 3.7 项目中使用前须核对实际宿主组件描述、模板、类型声明或对应版本官方文档；3.8 独有能力不能直接作为可用结论。回答前先定位最相关的知识卡片，再基于卡片给出结论、步骤和风险提示。

## 快速检索

激活后，`Skill` 返回可见的 `package_root`。优先通过 `Bash` 使用该根目录下的脚本压缩检索范围：

1. 常规分诊：用 `Bash` 执行 `node "<package_root>/scripts/route-query.js" --query "<用户问题>" --json`，从 routing map 命中 API、组件、错误和关键词入口。
2. 补充检索：当分诊结果不足、问题描述较长或包含编辑器工作流时，用 `Bash` 执行 `node "<package_root>/scripts/search-docs.js" --query "<用户问题>" --limit 8 --json`。
3. 分类收窄：已判断类型时给 `search-docs.js` 增加 `--category recipes`、`--category api-reference`、`--category troubleshooting` 等参数。

脚本结果只负责候选排序；最终答案仍要用 `Read(file_path:"<package_root>/...")` 阅读命中文档，核对 `status`、相关文档和示例代码。

## 路由优先级

1. API 符号 / 组件类名 → `versions/3.8/routing/api-symbol-map.json` 或 `component-map.json`
2. 错误现象 / 异常信息 → `versions/3.8/routing/error-map.json`
3. 自然语言任务描述 → `versions/3.8/routing/keyword-map.json`
4. 仍未命中 → `versions/3.8/routing/task-router.md`

## 文档落点

- 任务型问题 → `versions/3.8/recipes/`
- API / 组件问题 → `versions/3.8/api-reference/`
- 报错问题 → `versions/3.8/troubleshooting/`
- 编辑器工作流 / 属性检查器 / 资源管理器 / 构建发布 → 优先查 `versions/3.8/scripting/`、`assets/`、`recipes/`、`troubleshooting/`
- 架构模式 / 设计权衡问题 → `versions/3.8/architecture/`
- 游戏系统设计问题 → `versions/3.8/gameplay-systems/`
- 跨模块完整案例问题 → `versions/3.8/case-studies/`

## 回答规则

- 不要只凭通用游戏开发经验回答；至少阅读一个命中文档，复杂问题阅读主文档和 related docs。
- API 结论以 `api-reference/` 的公开导出结论为准；没有公开导出结论时，不把源码内部能力说成公开 API。
- 编辑器特有问题要区分运行时代码、编辑器属性配置、资源导入设置、构建面板配置和扩展脚本环境。
- 给代码时默认使用 Cocos Creator 3.8 TypeScript：从 `cc` 导入，使用 `_decorator`，对象引用属性允许 `null` 并在使用前检查。

## 路由分片机制

`keyword-map.json` 是聚合入口，由 `routing/keyword-map/` 下的主题分片合并生成。

## status 处理规则

- verified：可作为推荐答案。
- draft：可作为常规答案，但建议告知用户结合官方文档复核。
- needs-review：必须明确告知用户该结论待复核，不得作为唯一权威结论。
- forum-evidence-pending：补充证据待复核。
