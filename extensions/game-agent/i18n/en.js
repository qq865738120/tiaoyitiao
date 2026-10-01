'use strict';
module.exports = {
    open_panel: 'Default Panel',
    send_to_panel: 'Send message to Default Panel',
    description: 'Cocos Creator AI agent extension that helps users develop games',
    'open-default-panel': 'Open Game Agent',
    'open-generated-assets-panel': 'Open Game Agent Asset Manager',
    'generated-assets-panel-title': 'Game Agent Asset Manager',
    // Project settings
    'codex-auth-notice': "Authorize ChatGPT/Codex in your browser. Credentials are stored in Creator global user configuration. Signing out only clears local Game Agent credentials.",
    'codex-authorize': "Authorize ChatGPT/Codex",
    'codex-reauthorize': "Reauthorize",
    'codex-logout': "Sign out locally",
    'codex-status-failed': "Unable to read authorization status. Reopen settings.",
    'codex-state-unauthorized': "Not authorized",
    'codex-state-authorizing': "Waiting for browser authorization…",
    'codex-state-authorized-local': "Authorized locally; model access is determined by the service.",
    'codex-state-refreshing': "Refreshing authorization…",
    'codex-state-refresh-transient-failed': "Authorization refresh temporarily failed. Retrying later.",
    'codex-state-reauthorization-required': "Authorization expired or invalid. Please reauthorize.",
    'codex-state-unavailable-by-release-policy': "ChatGPT/Codex access is not yet available.",
    'game-agent-group': 'Official Language Model Access',
    'custom-connection-1': 'Custom Language Model Access 1',
    'custom-connection-2': 'Custom Language Model Access 2',
    'custom-connection-3': 'Custom Language Model Access 3',
    'image-generation-settings': 'Image Generation Model',
    'image-generation-settings-notice':
        'To use image generation, configure the independent credentials required by any provider. Use its registration button to sign up.',
    'image-generation-provider-openrouter': 'OpenRouter',
    'image-generation-register-button': 'Register',
    'image-generation-openrouter-api-key': 'OpenRouter API Key',
    'image-generation-openrouter-api-key-description':
        'Used only for image generation with the fixed x-ai/grok-imagine-image-quality model. This key is used only for image generation and is never reused from language-model settings. Do not share or commit it.',
    'image-generation-modelsell-api-key': 'ModelSell API Key',
    'image-generation-modelsell-api-key-description':
        'Used for image generation with gpt-image-2. This key is used only for image generation and is never reused from language-model settings. Do not share or commit it.',
    'image-generation-bailian-api-key': 'Alibaba Cloud Bailian API Key',
    'image-generation-bailian-api-key-description':
        'Used for qwen-image-2.0-pro, qwen-image-2.0, and qwen-image-3.0-pro image generation in the Beijing region. An sk-sp- Token Plan key automatically uses the subscription endpoint and can call only qwen-image-3.0-pro. This key is used only for image generation and is never reused from language-model settings. Do not share or commit it.',
    'image-generation-bailian-workspace-id': 'Alibaba Cloud Bailian Workspace ID',
    'image-generation-bailian-workspace-id-description':
        'A regular pay-as-you-go API key requires the Workspace ID used as the Beijing endpoint hostname prefix. Only lowercase letters, digits, and hyphens are accepted. An sk-sp- Token Plan key does not require a Workspace.',
    'image-generation-test-button': 'Test Connection',
    'image-generation-test-loading': 'Testing…',
    'image-generation-test-risk': 'Testing may incur a small charge',
    'custom-image-1': 'Custom Image Model Access 1',
    'custom-image-2': 'Custom Image Model Access 2',
    'custom-image-settings-notice':
        'After this connection is completed and enabled, its model appears in the image agent model list. Enter an OpenAI Images API prefix as the Base URL. The Model ID may be a relay alias, but its underlying model must be gpt-image-2. The API key is stored in project settings; do not screenshot, share, or commit it.',
    'custom-image-display-name': 'Connection Display Name',
    'custom-image-display-name-description':
        'A local group name shown in model selectors. When empty, the slot default is used. It is never sent to the image service.',
    'custom-image-auth-mode-description':
        'Sends the API key with Bearer authentication, x-api-key, or both.',
    'custom-image-model': 'Model ID',
    'custom-image-model-description':
        'Enter the model ID accepted by the relay. It may be an alias, but the underlying model must be gpt-image-2.',
    'custom-image-base-url-description':
        'Enter an HTTP(S) API prefix such as https://host.example/v1. The runtime appends /images/generations or /images/edits. Connect only to trusted services: HTTP is unencrypted and address ranges are not restricted.',
    'settings-notice-label': 'Configuration Notice',
    'model-settings-notice':
        'Configure API keys for built-in model services here. After saving, return to or refocus the Game Agent panel to refresh the model list. If it still does not update, reopen the panel. API keys are stored in the project configuration at settings/v2/packages/game-agent.json. Do not screenshot or share them, and do not commit or upload this file to a code repository.',
    'custom-model-settings-notice':
        'Enter and enable the connection, then configure and enable at least one model. Complete models appear in the Game Agent model list.\nRecommended relay service: https://api.lovtokens.com/sign-up?aff=f2y7',
    'custom-model-test-button': 'Test Connection',
    'custom-model-test-loading': 'Testing…',
    'custom-model-test-risk':
        'The test may incur a small model charge. On failure, the complete raw relay response is printed to the console and may contain sensitive information.',
    'model-relay-recommendation-title': 'Model Service Recommendation',
    'model-relay-recommendation-message': 'Game Agent did not detect a usable model configuration.',
    'model-relay-recommendation-detail':
        "You can register with this third-party relay service:\nhttps://api.lovtokens.com/sign-up?aff=f2y7\n\nThis is not an official Cocos service. Pricing, availability, and data handling are the third party's responsibility.",
    'model-relay-recommendation-confirm': 'Open Registration',
    'model-relay-recommendation-cancel': 'Cancel',
    'model-relay-open-failed-title': 'Unable to Open Link',
    'model-relay-open-failed-message': 'The system browser could not be opened.',
    'model-relay-open-failed-detail':
        'Copy this link and open it in your browser:\nhttps://api.lovtokens.com/sign-up?aff=f2y7',
    'model-relay-open-failed-confirm': 'OK',
    'custom-enabled': 'Enable Connection',
    'custom-display-name': 'Connection Display Name (Required)',
    'custom-protocol-family': 'Protocol Family',
    'custom-base-url': 'Base URL (SDK Prefix) (Required)',
    'custom-api-key': 'API Key (Required)',
    'custom-auth-mode': 'Authentication Mode (Required)',
    'custom-secret-header-name': 'Custom Secret Header Name',
    'custom-extra-header-1-name': 'Extra Header 1 Name',
    'custom-extra-header-1-value': 'Extra Header 1 Value',
    'custom-extra-header-2-name': 'Extra Header 2 Name',
    'custom-extra-header-2-value': 'Extra Header 2 Value',
    'custom-model-1-enabled': 'Model 1',
    'custom-model-1-remote-id': '　Remote Model ID (Required)',
    'custom-model-1-display-name': '　Display Name',
    'custom-model-1-wire-api': '　API Protocol (Required)',
    'custom-model-1-context-length': '　Context Length (K) (Required)',
    'custom-model-1-image-input': '　Image Input',
    'custom-model-1-tools': '　Tool Calling',
    'custom-model-1-thinking': '　Thinking',
    'custom-model-1-reasoning': '　Adjustable Reasoning',
    'custom-model-1-reasoning-levels': '　Reasoning Levels (comma-separated)',
    'custom-model-2-enabled': 'Model 2',
    'custom-model-2-remote-id': '　Remote Model ID (Required)',
    'custom-model-2-display-name': '　Display Name',
    'custom-model-2-wire-api': '　API Protocol (Required)',
    'custom-model-2-context-length': '　Context Length (K) (Required)',
    'custom-model-2-image-input': '　Image Input',
    'custom-model-2-tools': '　Tool Calling',
    'custom-model-2-thinking': '　Thinking',
    'custom-model-2-reasoning': '　Adjustable Reasoning',
    'custom-model-2-reasoning-levels': '　Reasoning Levels (comma-separated)',
    'custom-model-3-enabled': 'Model 3',
    'custom-model-3-remote-id': '　Remote Model ID (Required)',
    'custom-model-3-display-name': '　Display Name',
    'custom-model-3-wire-api': '　API Protocol (Required)',
    'custom-model-3-context-length': '　Context Length (K) (Required)',
    'custom-model-3-image-input': '　Image Input',
    'custom-model-3-tools': '　Tool Calling',
    'custom-model-3-thinking': '　Thinking',
    'custom-model-3-reasoning': '　Adjustable Reasoning',
    'custom-model-3-reasoning-levels': '　Reasoning Levels (comma-separated)',
    'custom-enabled-description':
        'Controls whether this custom connection is active. When disabled, its models are hidden and no requests are sent through it.',
    'custom-display-name-description':
        'A local group name shown in model selectors. It is never sent to the relay. Use a recognizable provider or route name.',
    'custom-protocol-family-description':
        'Select the API family implemented by the relay. OpenAI-compatible routes can use Chat Completions or Responses; Anthropic-compatible routes use Messages. Follow the relay documentation.',
    'custom-base-url-description':
        'Enter the API address prefix from your service documentation. The selected protocol determines the appended request path. Addresses containing account information, query parameters, fragments, or a full request path may not work. Connect only to trusted services: addresses and redirect targets are not restricted. HTTP is unencrypted, so API keys, headers, and conversation data may be intercepted, modified, or sent to a redirect target.',
    'custom-api-key-description':
        'The secret used to authenticate this connection. It is stored in project settings and may be committed with project files. Never share or commit it.',
    'custom-auth-mode-description':
        'Controls which authentication Header carries the API key. Choose Bearer, x-api-key, both, or a custom secret Header exactly as required by the relay documentation.',
    'custom-secret-header-name-description':
        'Used only with Custom Header authentication. Enter the Header name that carries the API key; its value comes from the API Key field. Reserved Headers are not allowed.',
    'custom-extra-header-name-description':
        'Optional gateway or routing Header name. Each connection supports at most one. It must not duplicate authentication or protocol Headers and must not contain line breaks.',
    'custom-extra-header-value-description':
        'The extra Header value sent with requests. It may contain account or routing credentials; never share or commit it.',
    'custom-model-enabled-description':
        'Controls whether this model is enabled. An enabled model appears in selectors only when both the connection and all required model fields are valid.',
    'custom-model-remote-id-description':
        'Enter the exact model identifier accepted by the relay API, such as the documented model parameter. This value is sent to the relay unchanged.',
    'custom-model-display-name-description':
        'Optional. A local name shown for this model in Game Agent. When empty, the remote model ID is used.',
    'custom-model-wire-api-description':
        'Selects the request format and endpoint and determines whether the OpenAI or Anthropic protocol is used. The system never guesses from the model name.',
    'custom-model-context-length-description':
        'Enter the maximum model context in K, where 1K = 1024 tokens; allowed range is 128–1024. This is user-declared and not probed online. Values saved as raw tokens by older versions must be entered again.',
    'custom-model-image-input-description':
        'Select whether the model supports images. The connection test checks image support and how images are sent. Images will not be sent to this model if the check fails.',
    'custom-model-tools-description':
        'Declares whether the model supports tool calling. When enabled, the Agent may send tool definitions and process tool calls. This capability is not probed online.',
    'custom-model-thinking-description':
        'Declares whether the model supports thinking or reasoning output. This affects thinking content and reasoning configuration; it is not inferred from the model name.',
    'custom-model-reasoning-description':
        'Declares whether users can adjust reasoning strength. When enabled, Thinking must also be enabled and at least one supported level must be listed below. When disabled, saved levels are ignored and have no effect.',
    'custom-model-reasoning-levels-description':
        'Optional. Enter a comma-separated subset of low, medium, high, and xhigh, for example low,medium,high,xhigh. Any valid level means adjustable reasoning is supported.',
    'custom-protocol-openai-option': 'OpenAI Compatible (Chat / Responses)',
    'custom-protocol-anthropic-option': 'Anthropic Compatible (Messages)',
    'custom-auth-bearer-option': 'Bearer (Authorization)',
    'custom-auth-x-api-key-option': 'x-api-key (common for Anthropic)',
    'custom-auth-both-option': 'Dual Auth (Bearer + x-api-key)',
    'custom-auth-custom-header-option': 'Custom Header (configurable name)',
    'custom-wire-openai-chat-option': '【OpenAI】Chat Completions (/chat/completions)',
    'custom-wire-openai-responses-option': '【OpenAI】Responses (/responses)',
    'custom-wire-anthropic-messages-option': '【Anthropic】Messages (/v1/messages)',
    deepseek_apiKey: 'DeepSeek API Key',
    openai_apiKey: 'OpenAI API Key',
    anthropic_apiKey: 'Anthropic API Key',
    google_apiKey: 'Google AI API Key',
    xai_apiKey: 'xAI API Key',
    mistral_apiKey: 'Mistral API Key',
    alibaba_apiKey: 'Alibaba Qwen API Key',
    moonshot_apiKey: 'Moonshot AI API Key',
    zhipuai_apiKey: 'Zhipu BigModel API Key',
    'apiKey-description':
        'API key for the corresponding model service. If left empty, the service will not appear in the model list. Return to the Game Agent panel after saving to refresh it.',
    default_model: 'Default Model',
    'default_model-description':
        'Model ID selected by default when the panel opens (e.g. deepseek/deepseek-chat). You can change the current selection from the dropdown, but this default is only updated from this field.',
    'game-agent-search': 'Web Search Access',
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
    'tavily_key-description':
        'Leave empty to skip it. When multiple keys are configured, the system automatically selects an available key from the pool.',
    tavily_key_1_description:
        'Used for web search. Register at https://app.tavily.com and create a key from Dashboard → API Keys. See Tavily documentation for current quotas. API keys are stored in project settings; do not share or commit them.',
    'game-agent-testing': 'Game Preview Testing',
    game_testing_global_concurrency: 'Global Concurrent Runs',
    game_testing_global_concurrency_description:
        'Maximum number of Cocos Preview test runs Game Agent may keep open at once. Default is 3; allowed range is 1–10.',
    game_testing_per_run_artifact_quota_mb: 'Per-Run Artifact Quota (MB)',
    game_testing_per_run_artifact_quota_mb_description:
        'Total screenshot and diagnostic artifact bytes allowed for one preview test run. Default is 256MB.',
    game_testing_project_artifact_quota_mb: 'Project Artifact Quota (MB)',
    game_testing_project_artifact_quota_mb_description:
        'Automatic cleanup ceiling for the project .gameagent/game-tests directory. Default is 1024MB; only oldest completed runs are deleted automatically.',
};
