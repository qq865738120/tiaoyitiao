# Cocos 官方文档技能

`cocos-doc-skill` 是随 Game Agent 分发的内置技能，用于基于 Cocos Creator 3.8 知识卡片回答游戏开发、编辑器工作流、组件 API、任务方案与错误排查问题。

## 面向版本

技能可用于 Creator 3.7 及以上版本；知识卡片来源仍为 3.8。3.7 项目须对照实际宿主组件描述、模板、类型声明或对应版本官方文档复核，不把 3.8 独有能力视为可用。

## 目录结构概览

```text
SKILL.md
README.md
scripts/
  route-query.js
  search-docs.js
versions/
  3.8/
    index.md
    routing/
    concepts/
    scene-node-component/
    scripting/
    assets/
    ui-2d/
    recipes/
    troubleshooting/
    api-reference/
```

## 智能体入口

智能体应从 `SKILL.md` 读取技能 frontmatter、检索脚本、路由优先级和 `needs-review` 处理规则，再根据用户问题进入 `versions/3.8/` 下的对应目录。

## 检索脚本

- `scripts/route-query.js`：读取 routing map，按 API 符号、组件名、错误 alias 和自然语言关键词返回候选文档。
- `scripts/search-docs.js`：扫描知识卡片 frontmatter 与正文片段，适合补充检索长问题、编辑器工作流和跨模块任务。

示例：

```bash
node scripts/route-query.js --query "按钮点击穿透" --json
node scripts/search-docs.js --query "属性检查器绑定 Label" --category scripting --json
```

## 评审材料

- `evals/routing-eval.json`：机器可读的路由与回答契约评估集。
- `evals/eval-viewer.md`：人工评审入口，记录验证命令、代表问句和已知非阻断告警。

## 作者与验证

通用格式、description 边界、相对资源、脚本/eval 与发布包含遵循随扩展发布的 `static/skills/AUTHORING.md`。修改后先运行 `npm run skills:validate`，再运行 `npm run cocos-doc-skill:validate:full`；静态通过不代表模型触发或遵循已经通过。
