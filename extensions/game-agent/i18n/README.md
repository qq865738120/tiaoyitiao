# i18n

## 职责

- 为 Cocos Creator 扩展清单、项目设置 renderer 与面板提供中英文静态文案。
- 中英文文件保持相同 key 集合；Provider 凭证、远端响应和用户项目内容不得进入本目录。

## 非职责

- 不读取 Profile，不执行运行时能力探测，也不决定模型或工具行为。
- 不保存动态错误详情或第三方响应正文。

## 修改门禁

- 新增或删除 key 时同步修改 `zh.js` 与 `en.js`。
- 项目设置字段文案必须与 `source/bridge/project-settings/customModelSettingsFields.ts` 和 `package.json` 的 Profile 字段一致。

- 用户文案优先说明用途、影响与下一步；实现术语改为用户可理解表达。隐私、HTTP 传输和测试费用风险不得因精简而删除。
