# Cocos sprite manifest 与质量门禁

## 精确输入合同

`prepare --spec` 的顶层键名是 `schema`（不是 `$schema`），最小可执行模板如下；可追加业务描述，但不得改写 schema：

```json
{
  "schema": "game-agent.cocos-2dsprite-spec/v1",
  "assetKind": "character",
  "animationIntent": { "name": "idle", "frameCount": 4, "fps": 8, "loop": true },
  "target": [64, 64],
  "anchor": [0.5, 0.0]
}
```

`process_sprite.py --request` 必须先声明渲染模式。下面是明确像素风动画的精确模板；`runRoot`、`source`、`outputRoot` 必须是当前 run 内绝对路径，report 路径也必须在 run 内；request 文件本身放在 run 外工作目录：

```json
{
  "schema": "game-agent.cocos-2dsprite-process/v1",
  "runId": "<runId>",
  "runRoot": "<absolute-run-root>",
  "source": "<absolute-run-root>/inputs/source.png",
  "outputRoot": "<absolute-run-root>/outputs",
  "assetKind": "character",
  "renderMode": "pixel-art",
  "renderReason": "explicit-user",
  "grid": { "columns": 2, "rows": 2, "count": 4 },
  "target": [64, 64],
  "anchor": [0.5, 0.0],
  "layout": { "marginMode": "safe", "marginReason": "animation-safe" },
  "chromaKey": { "rgb": [255, 0, 255], "tolerance": 64, "feather": 18, "alphaCutoff": 64 },
  "pixelArt": { "paletteColors": 64, "alphaThreshold": 128, "sourceGridFidelityMin": 0.5, "sourceGridColorTolerance": 16 },
  "preserveScale": true,
  "fps": 8,
  "loop": true,
  "atlas": true
}
```

静态非像素素材使用栅格模板，默认不生成 manifest：

```json
{
  "schema": "game-agent.cocos-2dsprite-process/v1",
  "runId": "<runId>",
  "runRoot": "<absolute-run-root>",
  "source": "<absolute-run-root>/inputs/source.png",
  "outputRoot": "<absolute-run-root>/outputs",
  "assetKind": "prop",
  "renderMode": "raster",
  "renderReason": "default-raster",
  "grid": { "columns": 1, "rows": 1, "count": 1 },
  "target": [256, 128],
  "anchor": [0.5, 0.5],
  "layout": { "marginMode": "tight", "marginReason": "ui-tight" },
  "chromaKey": { "rgb": [255, 0, 255], "tolerance": 64, "feather": 18, "alphaCutoff": 64 }
}
```

完整不透明静态背景使用独立模板；它保留完整画布，不进入透明 layout 或色键处理：

```json
{
  "schema": "game-agent.cocos-2dsprite-process/v1",
  "runId": "<runId>",
  "runRoot": "<absolute-run-root>",
  "source": "<absolute-run-root>/inputs/source.png",
  "outputRoot": "<absolute-run-root>/outputs",
  "assetKind": "background",
  "transparencyMode": "opaque",
  "renderMode": "raster",
  "renderReason": "default-raster",
  "grid": { "columns": 1, "rows": 1, "count": 1 },
  "target": [512, 768]
}
```

`opaque` 只允许与 `assetKind=background`、显式 `renderMode=raster`、`1×1` 单帧和 exact target 组合。不得携带 `chromaKey`、`pixelArt`、`layout`、`anchor`、`atlas`、`manifest`、`fps` 或 `loop`；字段即使为 `false` 也属于冲突，处理器不得静默丢弃。源图必须完全不透明，源尺寸与 target 宽高比必须一致；处理器使用完整画布 Lanczos 等比缩放，不裁切、不拉伸、不补透明边。

`renderReason` 只能是 `explicit-user`、`reference-pixel-art`、`context-pixel-art`、`default-raster`、`legacy-explicit-pixel-config` 或 `explicit-request`。新调用应使用前四项。只有 `renderMode=pixel-art` 才能携带 `pixelArt`；`raster` 与 `pixelArt` 同时出现会 fail closed。单帧 request 只要显式给出 `fps`、`loop`、`atlas=true` 或 `manifest=true`，就视为需要 handoff manifest；否则交付 `static-single-frame`。

透明分支的 `layout.marginMode` 只能是 `tight` 或 `safe`，`marginReason` 只能是 `explicit-user`、`ui-tight`、`icon-safe`、`animation-safe` 或 `default-safe`。按钮、标签、面板装饰选择 tight；图标、角色、FX、动画或证据不足选择 safe。tight 将 target 解释为最大边界，默认 `marginPixels=1` 并输出主体联合 bbox 加透明边；safe 将 target 解释为 exact canvas，默认最小安全区为 `max(1, round(min(target)*0.04))`。不透明背景不携带 layout。

角色、动作、道具和透明 FX 的生成源图默认使用纯洋红 `#FF00FF` 背景；画面 Prompt 必须明确“纯色、无棋盘格、无渐变、无纹理、无阴影地板，主体不得使用该色”。Python 把 request 中的 `rgb` 作为生成目标与审计提示：先用外边界锁定实际背景簇，再扫描全图颜色距离直方图，并在 `tolerance` 预算内取得与边界连通的高置信背景样本，以其 P99.9 稀疏尾部和直方图分界共同计算实际中心色及核心剔除范围。边界多簇、覆盖不足、所需范围超过预算或全图范围无法区分背景与主体时 hard fail。若透明资产源图 alpha 全为 255，则 `chromaKey` 必填。只有显式 `background + opaque` 可以接受无 chroma 的全不透明源图，并且不得运行任何 chroma 推断或移除。

像素画源格必须能以相同整数倍率等比映射到目标画布。1024×1024 的 2×2 源格到 64×64 frame 是精确 `8×` 下采样；Prompt 必须要求每个逻辑像素由对齐格内原点的 8×8 同色源像素块表达，禁止抗锯齿、亚像素线、摄影纹理和抖动。脚本对完整 cell 做 nearest 整数缩放，只以整数平移对齐 anchor，不按主体 bbox 分数放大。之后用共享色板执行无抖动量化，并将 Alpha 二值化为 0/255。脚本还会将源格 nearest 下采样后原倍回放，仅在主体并集内比较 Alpha 分类与容差内 RGB，默认每帧至少 `0.5`，防止普通插画伪装成像素源图；此源图遵循度与最终成品门禁分别报告。`pixel-art` report/QC 必须记录倍率、nearest、色数、dither、Alpha threshold、源格分数和 `semiTransparentPixels=0`。

`raster` 在透明处理后按 Alpha 主体 bbox 使用单一 Lanczos scale，不做色板量化或 Alpha 二值化，允许并保留 `0 < alpha < 255` 的抗锯齿像素。禁止把完整 cell 非等比 resize 到 target。QC 必须记录 `renderMode=raster`、`quantized=false`、半透明像素数、全透明像素残余 RGB、source/output bbox、scaleX/scaleY、aspect delta 与实际 margins。全透明像素的 RGB 必须归零，以免导入后采样产生杂色边缘。

不透明背景的 raster QC 与透明 raster 分开：report 必须记录 `transparencyMode=opaque`、`method=full-canvas-raster-v1`、源/目标尺寸、统一 scale、`fullyOpaque=true`、`fullCanvasPreserved=true`、`exactTarget=true`、零透明/半透明像素与 `quantized=false`。它不得携带 `genuineTransparency`、透明 raster、pixel-art 或 chroma residual QC 字段。

动画/多帧/atlas/显式 manifest 交付中的 `cocos-sprite-manifest.json` 使用 `game-agent.cocos-sprite-manifest/v1`，记录权威源 `loose-frames`、每帧相对路径/SHA-256/像素尺寸/anchor、动作 FPS/loop 意图、renderMode、filter/wrap，以及 `creatorVerified`、`playbackVerified`。静态单帧交付使用 `game-agent.cocos-2dsprite-static-frame-package/v1` 与 `authority=single-frame`，package index 的 `entry` 必须精确绑定唯一 PNG 的 path/SHA-256/bytes，且不得包含 manifest、atlas 或额外 frame。

角色和动作默认 anchor 为脚底 `(0.5, 0)`；UI/环形 FX 可用中心 `(0.5, 0.5)`；非对称道具可显式设置。anchor 是归一化 Cocos SpriteFrame 语义，不允许从裁切后的边界隐式漂移。`preserveScale=true` 时以所有帧的共同主体尺寸计算单一 scale 与共享画布，而不是把每帧分别放大填满。tight 的 actual size 可小于 target；safe 必须保持 exact target。

透明 raster 与 pixel-art 都必须验证真实透明像素、非空主体、透明边界、布局、尺寸、预算与残色；不透明背景改为验证完全不透明、完整画布、exact target、等比 Lanczos 与预算。三类分支的 discriminator 和 QC 不得串线；自动指标不替代人工视觉检查。

atlas 如生成，manifest 必须给出稳定 order、rect、padding、extrusion 和 atlas digest，但 loose frames 仍是 authority。未实际创建/播放 AnimationClip 时，FPS/loop 只是 handoff 意图，`playbackVerified=false`。
