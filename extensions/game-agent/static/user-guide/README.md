# 中文使用指南配图

本目录只保存根 `README.zh.md` 使用的真实 Cocos Creator 截图，随生产包离线分发。

## 维护方式

- 通过 Cocos Dashboard 打开独立的示例项目，从真实 Creator 编辑器截取。
- 使用与本次说明对应的 Game Agent 构建，记录版本与日期。
- 截图按工具返回的原始格式保存为 JPEG，不绘制模拟界面，不改写界面文字；配置页使用空 API Key。
- 指南源稿使用 `static/user-guide/<文件名>.jpg` 相对路径，打包时转换为 Creator 的 `packages://game-agent/` 资源地址，兼容 Creator 扩展详情的离线渲染。
- 更新截图后复查缩小阅读的清晰度，以及安装态 Creator 扩展详情中的展示。

## 图片清单

| 文件 | 内容 |
| --- | --- |
| 01-workspace.jpg | Creator 与 Game Agent 工作区 |
| 02-model-settings.jpg | 官方语言模型接入 |
| 03-basic-settings.jpg | 主力 / 辅助模型设置 |
| 04-tool-permissions.jpg | 工具权限 |
| 05-workflows.jpg | 工作流环境准备与运行资源 |
| 06-session-sharing.jpg | 会话导出与导入 |
| 07-model-capabilities.jpg | 自定义模型的上下文、视觉与推理配置 |
| 08-reasoning-level.jpg | 聊天区思考深度菜单 |

截图日期：2026-09-07。界面版本：Game Agent 0.3.3，Creator 3.8.8。
配图用于说明操作入口，不代表真实 Provider 调用、场景保存或生成内容的视觉验收。
