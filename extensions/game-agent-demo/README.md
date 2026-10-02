# Game Agent 演示版

这是只读历史查看器，无需登录或模型配置，不能继续 AI 对话。

将本目录放到专用演示项目 extensions/game-agent-demo，通过 Dashboard 打开项目。查看器只读取当前项目 .gameagent/.data/session 中的新版会话（Session schema 3，index version 2，合法 layout.json）。不会自动迁移或读取旧插件数据。

没有新版数据时显示空态。附件不会读取原机文件或网络媒体；会话数据不被修改。发布包始终为空壳，不包含当前开发项目历史。

完整版：https://store.cocos.com/app/detail/9114

支持 Cocos Creator 3.8.0 及以上。
