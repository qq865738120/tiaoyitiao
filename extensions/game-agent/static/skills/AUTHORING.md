# Game Agent Skill 作者指南

Game Agent 使用开放的 [Agent Skills](https://agentskills.io/specification) 包格式。兼容的最小技能包只需要一个 `SKILL.md`，其中的 YAML frontmatter 至少包含 `name` 和 `description`；包内可以带任意其它文件和目录。不要把 `references/`、`scripts/`、`assets/`、`templates/` 当作强制目录或安全权限边界，它们只是常见约定。

## 最小入口与可选元数据

```yaml
---
name: stable-kebab-name
description: 何时使用，以及明确不适用的边界
# 以下仅为 Game Agent 可选扩展，不影响其它 Agent Skills host
metadata:
  game-agent-display-name: "可选的本地展示名"
  game-agent-invocation: "auto" # auto | manual | disabled
  game-agent-version: "3.0.0"
compatibility: Creator 3.8 和 Node 14.16 兼容宿主
---
```

- 使用标准 YAML：可用多行文本、列表和其它可选字段；`metadata` 本身必须是 string → string 映射。不要为了兼容某个 host 降级成手写键值格式。
- `name` 与 `description` 是跨 host 的必需字段。其它 frontmatter 都应当是可忽略的增强信息；`compatibility` 只能说明运行需求，不能自行安装依赖或扩大权限。
- 正文保留路由、不可跳过门禁、少量主流程和验收。把大篇知识、模板、素材、评测和 helper 放在包内任意合理位置，并从正文明确说明何时读取或使用。

## Game Agent 通用文件工具

模型先 `Skill({ skillId })` 读取完整正文。激活结果会返回可见的绝对 `package_root`；之后所有包内资源均使用通用工具：

- 路径已知的文本、图片或二进制普通文件用 `Read(file_path:"<package_root>/...")`；路径未知时用 `Glob`/`Grep` 以该绝对根为起点。
- 普通文件复制、编辑或写入使用 `Write`/`Edit`，遵循通用审批、风险和 Creator 语义对象边界。
- companion script 用 `Bash` 执行。正文应给出精确的相对脚本路径及所需解释器，模型必须逐字复用本次 `Skill` 结果中的绝对 `package_root`，不得从 `GAME_AGENT_PROJECT_ROOT`、当前目录、仓库布局或 Skill 名称拼接/猜测脚本根；Bash 的超时、取消、输出限制、审计与风险审批全部适用。
- 脚本需要当前 Session 的生成原图时，在同一次 Bash 命令中调用 `SOURCE=$("$GAME_AGENT_ARTIFACT_MATERIALIZER_NODE" "$GAME_AGENT_ARTIFACT_MATERIALIZER_CLI" --ref "generated-image:<imageId>")`。stdout 只返回 exact source 文件路径，不返回 JSON 或 receipt；调用方应在同一命令中计算源 SHA-256，并用 AgentWait provenance、checkpoint/图片身份和 `GAME_AGENT_ARTIFACT_MATERIALIZER_ENDPOINT` 显式写 receipt，再立即把 source/receipt 传给下游脚本。不得先调用 `--help`、不得直接执行 CLI、不得持久化/回显/跨调用复用 source 路径，也不得传 Base64 或原始字节。
- `package_root` 是可见路径，不是硬隔离边界。Creator Scene、Prefab、节点、组件、AssetDB 与项目设置仍必须使用专用 Creator 工具；Bash 只提供软隔离。

可选的 `allowed-tools` 等社区或 host 扩展字段只作为 advisory。它们不会绕过 Game Agent 的项目权限、Creator 领域边界、写后复验或人工审批。

## 脚本与 Creator 边界

- companion script 应声明输入、输出、超时、退出码、幂等性、产物位置和依赖 runtime。脚本输出只证明脚本本身完成，不能替代最终领域验证。
- 若宿主缺少解释器，Bash 会返回其标准进程错误；正文应提前声明兼容性与替代路径。
- Scene、Prefab、节点、组件、AssetDB 与项目设置必须使用对应 Creator 工具；不要用脚本直接改写 Creator 托管序列化状态。写后通过 `CreatorInspect`、`PreviewObserve` 或 `RuntimeInspect` 复验。

## 持久化与验收

激活时 Session 保存稳定 Skill ID、内容版本与完整 `SKILL.md` SHA-256；运行时会向模型返回当前可见 `package_root`。入口缺失、版本变化、摘要变化或损坏时必须重新激活。

- `npm run skills:validate` 对内置包执行入口、链接、已明确引用的资源、eval 基础结构与发布包含检查；它不把特定目录名、扩展名或行为质量当成开放规范要求。
- 至少覆盖：标准 YAML、多层包资源、文本分页、二进制/图片读取、Bash 脚本成功与失败、内容漂移、save/reopen 与真实模型或 Creator 验收（如果该技能会驱动 Creator 工作流）。
- 明确区分静态校验、单元测试、Creator GUI、真实 Provider、save/reopen、部署和视觉验收。
