# Cocos 分层地图 handoff

`layered_mode` 发布透明 PNG 层和 `cocos-layered-map.json`。JSON schema 为 `game-agent.cocos-layered-map/v1`，声明画布、`origin=top-left`、`yAxis=down`、像素单位、稳定 layer order 与每层 SHA-256。

推荐层序：`foundation`、`terrain`、`props_back`、`actors`、`props_front`、`foreground`。每层必须与画布尺寸一致；foundation 可不透明，其余层保留透明度。运行控制的角色、交互物、门、拾取物和 hazard 不得烘焙到 foundation。

placement 记录 `assetId`、x/y、anchor、sortY 与 layer；occluder 记录遮挡区和 fade 意图；collision 记录矩形/polygon；spawn 和 zone 记录稳定 id/type/shape。所有坐标必须在画布边界内。composite preview 仅用于 QA，不是 authority。
