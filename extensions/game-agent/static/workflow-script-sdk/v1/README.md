# Workflow Context SDK V1

Node CommonJS 和 Python 的同义薄客户端。只使用 attempt 私有 Unix socket / Windows named pipe、token、序列和摘要认证；不持有 Provider 凭证。通用 call 与命名方法具有相同权限。

`context.processImage(request)` / `context.process_image(request)` 默认 60 秒普通调用，只能处理输入白名单或宿主已发布并授予本 attempt 的 Artifact。声明 `imageProcessing.operations: ["remove-solid-background"]`、Artifact read 和 `game-agent.processed-image/v1` PNG、`game-agent.image-processing-report/v1` JSON 写权限后可用。

请求包含 version=1、operation、source、background={rgb:[255,0,255],keyColorIsBackground:true}，可选 region={x,y,width,height} 和 allowEmpty。调用者须保证键色只作背景。返回 ready/image 或 review_required/candidateImage，以及 report/summary。使用 openInputMount 读取派生结果，绝不直接传物理路径。计算不允许 durable wait，也不在 Context 调用中准备环境。
