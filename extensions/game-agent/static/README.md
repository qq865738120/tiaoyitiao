# static

## 职责
- 存放扩展静态资源，例如图标、样式构建产物和内置技能。

## 非职责
- 不存放扩展主进程、面板或领域源码；内置 Skill 可以携带只供该 Skill 调用的受管 companion scripts，但这些脚本不得注册为插件生产入口或绕过工具生命周期。
- 不存放用户项目数据资源。

## 允许依赖
- 由构建脚本写入的静态产物。

## 禁止依赖
- 不在静态资源中另建插件运行时或跨包可变业务状态。Skill和Workflow可携带受管、可审计的确定性脚本闭包，仍须通过各自runtime、权限及发布边界执行。

## 公共入口
- `workflows/` 保存工作流定义、Schema和包内确定性Node/Python脚本；资源与依赖按显式闭包和lock校验，不能绕过审批或调用未授权工具。
- `user-guide/` 保存中文用户说明的真实 Creator 截图；由 CUA 从编辑器直接截取，随 `README.zh.md` 一起发布。截图来源与维护要求见该目录 README。
- `style/output.css` 由 `npm run build:styles` 生成。
- `icons/` 预留扩展图标。
- `skills/` 存放随插件打包分发的只读内置技能，每个技能一个目录，入口文件为 `SKILL.md`。技能包可以自包含 README、渐进 references、companion scripts、fixtures/evals、精确依赖 lock 与第三方 license notice；所有引用必须保持在各自 package root 内，运行仍复用 Game Agent 的 Skill、Read、Bash、Agent 与专用 runtime/审批边界。
- `agents/` 存放随插件打包分发的只读内置智能体 JSON 配置；research、code、execution、testing 的 `tools` 分别声明角色最大授权，四者均显式包含只读 `LSP`，但任务仍需显式选择且子智能体仍需按需激活。`image-generation` 保持空 tools/MCP，使用 5 分钟超时，并提供基础游戏图片资产 `promptTemplate`；运行时在模板后拼接单次画面要求，再交给独立图片 executor。
- `commands/` 保存随生产包递归发布的只读内置 Markdown 命令；每个直接子级 `.md` 文件遵循 `agent_context/tech/prompt-command-authoring.md`，不允许嵌套目录或符号链接。命令只是普通用户提示词，不提升工具权限、审批能力或 Guardrail 优先级。

## 测试位置
- 静态资源通常通过构建和 UI 验收覆盖。

## 修改流程
修改前阅读本 README。新增静态产物时说明来源和生成方式。
