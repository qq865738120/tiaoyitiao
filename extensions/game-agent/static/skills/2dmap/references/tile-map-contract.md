# Cocos TileMap handoff

## 精确输入合同

`prepare --spec` 的顶层键名是 `schema`（不是 `$schema`）。地图消费精灵包时使用已发布 run 的真实 digest：

```json
{
  "schema": "game-agent.cocos-2dmap-spec/v1",
  "mode": "tile_mode",
  "tileSize": [16, 16],
  "mapSize": [4, 3],
  "spritePackages": [
    { "runId": "<published-sprite-runId>", "packageDigest": "<published-sprite-package-digest>", "purpose": "player" }
  ]
}
```

`build_cocos_map.py --request` 的 2×2 Provider palette → 16×16 tile、4×3 地图模板如下。`runRoot`、`source`、`outputRoot` 和 report 必须在当前 map run 内，request 文件本身放在 run 外工作目录：

```json
{
  "schema": "game-agent.cocos-2dmap-build/v1",
  "runId": "<runId>",
  "runRoot": "<absolute-run-root>",
  "source": "<absolute-run-root>/inputs/source.png",
  "outputRoot": "<absolute-run-root>/outputs",
  "mode": "tile_mode",
  "sourceGrid": { "columns": 2, "rows": 2, "count": 4 },
  "pixelArt": { "paletteColors": 64, "alphaThreshold": 128, "sourceGridFidelityMin": 0.5, "sourceGridColorTolerance": 16 },
  "tileSize": [16, 16],
  "mapSize": [4, 3],
  "layerData": [1, 2, 3, 4, 2, 1, 4, 3, 3, 4, 1, 2],
  "collision": [{ "name": "ground", "x": 0, "y": 32, "width": 64, "height": 16 }],
  "spawns": [{ "name": "player", "type": "player", "x": 8, "y": 16, "width": 0, "height": 0 }],
  "zones": [{ "name": "goal", "kind": "goal", "x": 48, "y": 0, "width": 16, "height": 16, "properties": { "kind": "goal" }]
}
```

`tile_mode` 必须同目录发布：

- `tileset.png`：带 1px extrusion，默认 `margin=1`、`spacing=2`；
- `tileset.tsx`：外部 TSX，记录 tilewidth/tileheight/tilecount/columns、image 尺寸、margin/spacing；
- `map.tmx`：正交地图、CSV tile layer，引用外部 TSX；
- `cocos-map-manifest.json`：`game-agent.cocos-map-manifest/v1`，绑定所有摘要、profile、坐标系、object group 语义与验证状态。

TMX object groups 固定命名：`collision`、`spawns`、`zones`。collision 使用矩形或 polygon；spawn 带稳定 name/type；zone 带 `kind` 属性。坐标原点左上、Y 轴向下、单位像素。对象必须在地图像素边界内。

Python 写出后必须用标准 XML 解析器重新打开 TMX/TSX，确认外部引用、图层宽高、CSV gid 数量、tileset PNG 尺寸、margin/spacing 与 object groups；回读失败不得发布。脚本不生成 `.meta`，也不声称 Creator 已完成导入。

来自图片 Provider 的高分辨率源图必须通过 request `sourceGrid={columns,rows,count}` 声明视觉 tile 格，再由脚本以整数倍 nearest 归一化到 `tileSize`。manifest/report 必须记录倍率、色板、无抖动和二值 Alpha；例如 1024×1024 的 `2×2` palette 以精确 32× 下采样生成四个 16×16 权威 tile，而不是被解释为 4096 个 tile。Prompt 必须要求源逻辑像素块与 quadrant 原点对齐；脚本以 nearest 往返重建度量每个源 tile 的逻辑网格保真度，默认最低 `0.5`、RGB 容差 `16`，低于门槛、分数/非等比缩放或半透明成品均 fail closed。
