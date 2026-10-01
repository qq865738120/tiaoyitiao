'use strict';
module.exports = {
    open_panel: '默认面板',
    send_to_panel: '发送消息给面板',
    description: 'Cocos Creator AI 智能体插件，帮助用户开发游戏',
    'open-default-panel': '打开 Game Agent',
    'open-generated-assets-panel': '打开 Game Agent 资产管理',
    'generated-assets-panel-title': 'Game Agent 资产管理',
    // 项目设置面板相关
    'codex-auth-notice': "通过浏览器授权使用 ChatGPT/Codex。本地授权保存在 Creator 全局用户配置中；退出仅清除 Game Agent 的本地凭据。",
    'codex-authorize': "ChatGPT/Codex 授权",
    'codex-reauthorize': "重新授权",
    'codex-logout': "退出本地授权",
    'codex-status-failed': "无法读取授权状态，请重新打开设置。",
    'codex-state-unauthorized': "尚未授权",
    'codex-state-authorizing': "等待浏览器授权…",
    'codex-state-authorized-local': "本地授权可用；具体模型权限由服务端确认。",
    'codex-state-refreshing': "正在刷新授权…",
    'codex-state-refresh-transient-failed': "授权刷新暂时失败，将稍后重试。",
    'codex-state-reauthorization-required': "授权已失效，请重新授权。",
    'codex-state-unavailable-by-release-policy': "ChatGPT/Codex 接入尚未开放。",
    'game-agent-group': '官方语言模型接入',
    'custom-connection-1': '自定义语言模型接入 1',
    'custom-connection-2': '自定义语言模型接入 2',
    'custom-connection-3': '自定义语言模型接入 3',
    'image-generation-settings': '生图模型接入',
    'image-generation-settings-notice':
        '当需要使用生图功能时，请配置任一供应商所需的独立凭证。可通过注册按钮前往注册。',
    'image-generation-provider-openrouter': 'OpenRouter',
    'image-generation-register-button': '前往注册',
    'image-generation-openrouter-api-key': 'OpenRouter API Key',
    'image-generation-openrouter-api-key-description':
        '仅用于固定模型 x-ai/grok-imagine-image-quality 的图片生成。此密钥仅用于生图，不会复用语言模型 Key；请勿分享或提交到版本控制。',
    'image-generation-modelsell-api-key': 'ModelSell API Key',
    'image-generation-modelsell-api-key-description':
        '用于 gpt-image-2 图片生成。此密钥仅用于生图，不会复用语言模型 Key；请勿分享或提交到版本控制。',
    'image-generation-bailian-api-key': '阿里云百炼 API Key',
    'image-generation-bailian-api-key-description':
        '用于北京区百炼 qwen-image-2.0-pro、qwen-image-2.0 与 qwen-image-3.0-pro 图片生成。sk-sp- Token Plan Key 会自动使用订阅端点且只能调用 qwen-image-3.0-pro；此密钥仅用于生图，不会复用语言模型 Key。请勿分享或提交到版本控制。',
    'image-generation-bailian-workspace-id': '阿里云百炼 Workspace ID',
    'image-generation-bailian-workspace-id-description':
        '普通按量付费 API Key 必须填写北京区模型调用地址中的 Workspace ID（主机名前缀），只能包含小写字母、数字和连字符；sk-sp- Token Plan Key 不需要 Workspace。',
    'image-generation-test-button': '测试连接',
    'image-generation-test-loading': '测试中…',
    'image-generation-test-risk': '测试可能会产生少量费用',
    'custom-image-1': '自定义生图模型接入 1',
    'custom-image-2': '自定义生图模型接入 2',
    'custom-image-settings-notice':
        '填写并启用连接后，该模型会出现在生图智能体的模型列表中。Base URL 请填写 OpenAI Images API 前缀；“模型 ID”可以是中转站别名，但背后的实际模型只能是 gpt-image-2。API Key 保存在项目配置中，请勿截图、分享或提交到版本控制。',
    'custom-image-display-name': '连接显示名称',
    'custom-image-display-name-description':
        '仅用于模型选择器中的本地分组显示；留空时使用当前槽位的默认名称，不会发送给模型服务。',
    'custom-image-auth-mode-description':
        '决定 API Key 使用 Bearer、x-api-key 或同时使用两者发送。',
    'custom-image-model': '模型 ID',
    'custom-image-model-description':
        '填写中转站实际接受的模型 ID。该 ID 可以是别名，但背后的实际模型只能是 gpt-image-2。',
    'custom-image-base-url-description':
        '填写 HTTP(S) API 前缀，例如 https://host.example/v1；运行时固定拼接 /images/generations 或 /images/edits。仅连接可信服务：HTTP 不加密，插件不限制地址范围。',
    'settings-notice-label': '配置说明',
    'model-settings-notice':
        '用于配置内置模型服务的 API Key。保存后返回或重新聚焦 Game Agent 面板即可刷新模型列表；若仍未更新，请重新打开面板。API Key 保存在项目配置 settings/v2/packages/game-agent.json 中；请勿截图或分享，也不要将该文件提交或上传到代码库。',
    'custom-model-settings-notice':
        '填写并启用连接，再配置并启用至少一个模型；配置完整后，模型会出现在 Game Agent 的模型列表中。\n推荐中转站：https://api.lovtokens.com/sign-up?aff=f2y7',
    'custom-model-test-button': '测试连接',
    'custom-model-test-loading': '测试中…',
    'custom-model-test-risk':
        '测试会产生少量模型调用费用；失败时控制台会打印中转站完整原始响应，可能包含敏感信息。',
    'model-relay-recommendation-title': '模型服务推荐',
    'model-relay-recommendation-message': 'Game Agent 未检测到可用的模型配置。',
    'model-relay-recommendation-detail':
        '可使用第三方中转站注册模型服务：\nhttps://api.lovtokens.com/sign-up?aff=f2y7\n\n该服务为第三方推荐，非 Cocos 官方服务；价格、可用性和数据处理由第三方负责。',
    'model-relay-recommendation-confirm': '前往注册',
    'model-relay-recommendation-cancel': '取消',
    'model-relay-open-failed-title': '打开链接失败',
    'model-relay-open-failed-message': '无法打开系统浏览器。',
    'model-relay-open-failed-detail':
        '请复制以下链接并在浏览器中打开：\nhttps://api.lovtokens.com/sign-up?aff=f2y7',
    'model-relay-open-failed-confirm': '知道了',
    'custom-enabled': '启用连接',
    'custom-display-name': '连接显示名称（必填）',
    'custom-protocol-family': '协议族',
    'custom-base-url': 'Base URL（SDK 前缀）（必填）',
    'custom-api-key': 'API Key（必填）',
    'custom-auth-mode': '鉴权方式（必填）',
    'custom-secret-header-name': '自定义密钥 Header 名',
    'custom-extra-header-1-name': '额外 Header 1 名称',
    'custom-extra-header-1-value': '额外 Header 1 值',
    'custom-extra-header-2-name': '额外 Header 2 名称',
    'custom-extra-header-2-value': '额外 Header 2 值',
    'custom-model-1-enabled': '模型 1',
    'custom-model-1-remote-id': '　远端模型名称（必填）',
    'custom-model-1-display-name': '　显示名称',
    'custom-model-1-wire-api': '　API 协议（必填）',
    'custom-model-1-context-length': '　上下文长度（K）（必填）',
    'custom-model-1-image-input': '　图片输入',
    'custom-model-1-tools': '　工具调用',
    'custom-model-1-thinking': '　思考能力',
    'custom-model-1-reasoning': '　可调推理强度',
    'custom-model-1-reasoning-levels': '　推理档位（逗号分隔）',
    'custom-model-2-enabled': '模型 2',
    'custom-model-2-remote-id': '　远端模型名称（必填）',
    'custom-model-2-display-name': '　显示名称',
    'custom-model-2-wire-api': '　API 协议（必填）',
    'custom-model-2-context-length': '　上下文长度（K）（必填）',
    'custom-model-2-image-input': '　图片输入',
    'custom-model-2-tools': '　工具调用',
    'custom-model-2-thinking': '　思考能力',
    'custom-model-2-reasoning': '　可调推理强度',
    'custom-model-2-reasoning-levels': '　推理档位（逗号分隔）',
    'custom-model-3-enabled': '模型 3',
    'custom-model-3-remote-id': '　远端模型名称（必填）',
    'custom-model-3-display-name': '　显示名称',
    'custom-model-3-wire-api': '　API 协议（必填）',
    'custom-model-3-context-length': '　上下文长度（K）（必填）',
    'custom-model-3-image-input': '　图片输入',
    'custom-model-3-tools': '　工具调用',
    'custom-model-3-thinking': '　思考能力',
    'custom-model-3-reasoning': '　可调推理强度',
    'custom-model-3-reasoning-levels': '　推理档位（逗号分隔）',
    'custom-enabled-description':
        '控制整个自定义连接是否生效。关闭后，该连接下的模型不会显示，也不会发起请求。',
    'custom-display-name-description':
        '仅用于模型选择器中的本地分组显示，不会发送给模型服务。建议填写容易辨认的服务或线路名称。',
    'custom-protocol-family-description':
        '选择模型服务兼容的协议族。OpenAI 兼容线路可使用 Chat Completions 或 Responses；Anthropic 兼容线路使用 Messages。请以服务文档为准。',
    'custom-base-url-description':
        '填写服务文档中的 API 地址前缀；插件会按所选协议追加请求路径。包含账号、查询参数、片段或完整请求路径的地址不保证可用。仅连接可信服务：插件不限制地址或重定向目标；HTTP 不加密，API Key、Header 和对话内容可能被窃取、篡改或发送到重定向地址。',
    'custom-api-key-description':
        '用于当前连接鉴权的密钥。密钥保存在项目设置中，可能随项目文件被提交；请勿分享或提交到版本控制。',
    'custom-auth-mode-description':
        '决定 API Key 以哪种 Header 发送。请选择模型服务文档要求的 Bearer、x-api-key、双鉴权或自定义密钥 Header。',
    'custom-secret-header-name-description':
        '仅在鉴权方式选择“自定义 Header”时使用。填写承载 API Key 的 Header 名称；值自动取自上方 API Key，不能使用保留 Header。',
    'custom-extra-header-name-description':
        '可选的网关或路由 Header 名称，每个连接最多一个。不能与鉴权 Header、协议 Header 重复，也不能包含换行。',
    'custom-extra-header-value-description':
        '随请求发送的额外 Header 值。可能包含账号或路由凭证，请勿分享或提交到版本控制。',
    'custom-model-enabled-description':
        '控制当前模型是否生效。只有连接和模型字段都完整合法时，启用后的模型才会出现在模型选择器中。',
    'custom-model-remote-id-description':
        '填写模型服务 API 接受的精确模型名称，例如文档中的 model 参数。该值会原样发送给模型服务。',
    'custom-model-display-name-description':
        '可选。模型在 Game Agent 中显示的本地名称，不会发送给模型服务；留空时使用远端模型名称。',
    'custom-model-wire-api-description':
        '选择该模型实际使用的请求格式和端点；系统会据此确定使用 OpenAI 或 Anthropic 协议，不会根据模型名称自动猜测。',
    'custom-model-context-length-description':
        '以 K 填写模型的最大上下文长度，1K = 1024 tokens，允许 128–1024。此值由用户声明且不会在线探测；旧版按 token 保存的值升级后必须重新填写。',
    'custom-model-image-input-description':
        '选择模型是否支持图片。连接测试会检测图片支持和发送方式；检测失败时不会向此模型发送图片。',
    'custom-model-tools-description':
        '声明模型是否支持工具调用。启用后 Agent 可以向模型发送工具定义并处理工具调用；系统不会在线探测该能力。',
    'custom-model-thinking-description':
        '声明模型是否支持思考或推理过程。该声明影响思考内容和推理配置的使用，系统不会根据模型名称自动判断。',
    'custom-model-reasoning-description':
        '声明模型是否支持用户调节推理强度。启用时还必须开启思考能力，并在下方填写至少一个支持档位；关闭时已填写档位会被忽略且不生效。',
    'custom-model-reasoning-levels-description':
        '可选。使用英文逗号分隔 low、medium、high、xhigh 的支持子集，例如 low,medium,high,xhigh；填写任一合法档位即表示模型支持可调推理强度。',
    'custom-protocol-openai-option': 'OpenAI 兼容（Chat / Responses）',
    'custom-protocol-anthropic-option': 'Anthropic 兼容（Messages）',
    'custom-auth-bearer-option': 'Bearer（Authorization）',
    'custom-auth-x-api-key-option': 'x-api-key（Anthropic 常用）',
    'custom-auth-both-option': '双鉴权（Bearer + x-api-key）',
    'custom-auth-custom-header-option': '自定义 Header（名称可配置）',
    'custom-wire-openai-chat-option': '【OpenAI】Chat Completions（/chat/completions）',
    'custom-wire-openai-responses-option': '【OpenAI】Responses（/responses）',
    'custom-wire-anthropic-messages-option': '【Anthropic】Messages（/v1/messages）',
    deepseek_apiKey: 'DeepSeek API Key',
    openai_apiKey: 'OpenAI API Key',
    anthropic_apiKey: 'Anthropic API Key',
    google_apiKey: 'Google AI API Key',
    xai_apiKey: 'xAI API Key',
    mistral_apiKey: 'Mistral API Key',
    alibaba_apiKey: '阿里云通义 API Key',
    moonshot_apiKey: 'Moonshot AI API Key',
    zhipuai_apiKey: '智谱 BigModel API Key',
    'apiKey-description':
        '对应模型服务的 API Key。留空时，该服务不会出现在模型列表中；保存后返回 Game Agent 面板即可刷新。',
    default_model: '默认模型',
    'default_model-description':
        '面板首次打开时默认选中的模型 ID（如 deepseek/deepseek-chat）。可在面板下拉中临时切换，但只改本机偏好。',
    'game-agent-search': 'Web 搜索接入',
    tavily_key_1: 'Tavily API Key 1',
    tavily_key_2: 'Tavily API Key 2',
    tavily_key_3: 'Tavily API Key 3',
    tavily_key_4: 'Tavily API Key 4',
    tavily_key_5: 'Tavily API Key 5',
    tavily_key_6: 'Tavily API Key 6',
    tavily_key_7: 'Tavily API Key 7',
    tavily_key_8: 'Tavily API Key 8',
    tavily_key_9: 'Tavily API Key 9',
    tavily_key_10: 'Tavily API Key 10',
    'tavily_key-description': '留空则不使用。配置多个 Key 后，系统会从 Key 池中自动选择可用项。',
    tavily_key_1_description:
        '用于网络搜索。访问 https://app.tavily.com 注册并在 Dashboard 的 API Keys 页面创建；具体额度以 Tavily 官方说明为准。API Key 保存在项目配置中，请勿分享或提交到版本控制。',
    'game-agent-testing': '游戏预览测试',
    game_testing_global_concurrency: '全局并发运行数',
    game_testing_global_concurrency_description:
        'Game Agent 同时连接 Cocos 预览的最大运行数，默认 3，允许范围 1–10。',
    game_testing_per_run_artifact_quota_mb: '单次运行产物上限（MB）',
    game_testing_per_run_artifact_quota_mb_description:
        '单次预览测试可写入的截图和诊断产物总量，默认 256 MB。',
    game_testing_project_artifact_quota_mb: '项目测试产物上限（MB）',
    game_testing_project_artifact_quota_mb_description:
        '整个项目 .gameagent/game-tests 目录的自动清理上限，默认 1024 MB；只会自动删除最旧的已完成测试。',
};
