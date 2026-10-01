# Core Agent Tools 内置 Agent 配置

本目录是 `toolCatalogVersion=3.0.0` 的 builtin Agent JSON 唯一事实源。生产运行时直接读取本目录，禁止把退役工具名加入 Agent grant。

## 边界

- `tools` 是角色最大白名单，实际 ToolSet 仍取角色授权、父任务选择、项目权限、当前请求冻结目录与动态可用性的交集。
- `AskUserQuestion`、`Agent`、`AgentWait`、`AgentCancel` 不可下放给语言子智能体。
- research 保持无写；code 只获得代码实现所需文件/Bash/LSP 与只读 Creator 证据；execution 承担明确 mutation；testing 只获得测试辅助写入和 Preview/Runtime/Debug 链。
- image-generation 保持空 tools/MCP，只使用图片 executor；MediaPart/ArtifactRef 由父子结果协议承接，不授予通用语言 ToolSet。
- 所有 prompt 只引用当前工具名；目录必须通过 3.0.0 权限目录、非委派集合和最小授权测试。

代码角色复用已给事实并按不确定性补充调查；新建目标不存在本身不要求广域搜索。局部模板只定义实现与验证职责，隔离和回执规则由子执行上下文拥有，工具参数归对应工具提示。

四个内置语言角色从实际运行开始计时20分钟，图片角色仍5分钟。普通语言循环固定200步；自定义/插件缺省10分钟保持。
