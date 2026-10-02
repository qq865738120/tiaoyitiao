# 跳一跳：Cocos 核心玩法学习项目

使用 **Cocos Creator 3.8.8** 的单人跳一跳学习工程，保留游戏源码、素材、四阶段实施文档和 Game Agent 开发会话。阶段01—03已完成当前 Creator 桌面范围的验证；阶段04核心音效与画面反馈已实现并完成主要验证，透明材质与角色脚影随高度透明度校准仍未完成，按用户选择保留该状态。物理触摸设备未实测。各阶段实际结果以 [交接记录](docs/交接记录/README.md) 为准。

## 打开与体验

1. 下载工程后，通过 **Cocos Dashboard** 使用 Creator 3.8.8 打开，等待资源导入。
2. 打开 `assets/scenes/JumpMain.scene`，启动 Creator 预览。点击开始，按住鼠标左键或空格蓄力，松开跳跃。屏幕按钮支持暂停、继续、结算、再玩和主页；P 暂停/继续，R 游戏中重开，Escape 回主页。
3. 从编辑器扩展菜单打开 **Game Agent 演示版**，通过历史会话入口浏览阶段01—04。工程已包含 `extensions/game-agent-demo` 和对应会话，无需登录、模型配置或额外复制数据。

DEBUG F8 重置本工程最高分，F9 是正常输入接口的固定 tick 24 跳夹具。阶段04加入基础音效、背景变化、蓄力/翻转/中心落点反馈，详见 [阶段04交接](docs/交接记录/阶段04.md)。

## 开发过程与演示插件

[演示插件与会话说明](docs/演示插件/README.md) 提供独立 ZIP、四阶段会话索引、核验命令及已知限制。演示插件仅浏览历史，不能继续 AI 对话。完整 Game Agent 可从 [Cocos Store](https://store.cocos.com/app/detail/9114) 获取；各阶段提示词保留在 `.gameagent/commands`。

四阶段历史按原始格式保存在 `.gameagent/.data/session`，包括消息、推理、工具结果、主/子任务日志、任务日记和66组预览图片。Git 仅放行归档清单中的历史文件，其余运行数据与模型配置保持忽略。演示查看器中的附件显示为占位，原始截图可从工程归档或 [阶段04截图](docs/验收证据/阶段04截图) 查看。

## 目录导航

| 目录 | 内容 |
| --- | --- |
| `assets/scenes/JumpMain.scene` | 游戏主场景 |
| `assets/scripts/jump` | core、adapters、view、app 分层实现 |
| `assets/resources/jump/original` | 原包185个媒体文件及应用图标 |
| `assets/resources/jump/derived` | 46个静态GLB、背景、裁片、兼容纹理及字体参考 |
| `tests/jump` | 纯逻辑、输入、回放、音频和视图检查 |
| `docs/实施阶段`、`docs/交接记录`、`docs/验收证据` | 四阶段任务、实际结果及证据 |
| `.gameagent/commands` | 四个阶段提示词命令 |
| `.gameagent/.data/session` | 四阶段只读历史归档 |
| `extensions/game-agent-demo` | 已解压的 Game Agent 0.4.0 演示插件 |
| `docs/演示插件` | 演示插件 ZIP 与使用说明 |
| `docs/参考资料/原始提取包` | 原始提取成果、参考代码及离线素材浏览器 |

完整入口见 [文档导航](docs/README.md)。排行榜、消息、皮肤中心、多人、分享、广告、活动、账号和服务器接入不在学习版范围内。参考素材作为档案保留。

运行 `python3 docs/工具/检查演示交付.py` 核验插件和历史归档；素材基线检查使用 `python3 docs/工具/检查交付.py`。这些文件检查与实际 Creator 预览验证分别记录。本次仅打包演示插件，游戏仍以 Creator 预览为交付入口。
