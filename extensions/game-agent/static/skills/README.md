# 内置 Skills

## 职责

- 保存随生产 ZIP 递归发布、由 Skill 目录发现器只读加载的内置技能包。
- 每个直接子目录以 `SKILL.md` 为入口，并可自包含 README、references、companion scripts、fixtures、evals、依赖 lock 与许可证。
- `2dsprite` 负责可复用角色、道具、动作帧与 FX；`2dmap` 负责地图空间、图层、布局、碰撞、出生点、zones 与地图专用材质。
- `cocos-ui-preview-testing` 负责真实 UI Prefab 的独立 Preview、效果图评分与视觉复核，普通证据保存在用户项目的 `__agent_preview_testing/`。

## 非职责

- 不注册主进程或面板源码，不持有 Provider 凭证，不直接写 Creator AssetDB、`.meta`、Scene 或 Prefab。
- companion scripts 不提升权限；文本读取仍走 Read，进程执行仍走 Bash 或专用 runtime，生成图仍走内置 image-generation Agent。
- 技能包之间不得通过相对路径或符号链接读取兄弟目录。需要复用资产时，`2dmap` 激活真实 `builtin:2dsprite` 并消费其已批准 handoff。

## 包合同

- 所有资源必须位于当前 package root，引用使用相对路径并通过通用 `skills:validate`。
- CJS 控制面兼容 Cocos Creator 3.7.0 及以上的 Node.js 14.16.0；Python 只承担确定性像素算法，运行前必须由 `PythonRuntime` 证明解释器、项目 venv 与锁定依赖 ready。
- Python 精确依赖、hash 与许可证随技能包发布；生产 ZIP 不携带解释器、venv、wheel、安装缓存或其它引擎输出器。
- 资产技能默认交付 Cocos import-ready 文件与版本化 handoff manifest，不等同于 Creator 导入、AnimationClip、TiledMap 组件或运行时播放已经验证。UI 核对技能交付评分与视觉证据，脚本分数不代替真实看图或业务路径验收。

## 修改流程

1. 先阅读本 README、目标技能 README/SKILL 及 `scripts/skills/README.md`。
2. 修改脚本、Schema、lock、fixture 或 eval 时同步更新目标技能 validator 与包闭包测试。
3. 运行 `npm run skills:validate`、两个技能专项 validator、相关单元测试与生产 ZIP 探针。
