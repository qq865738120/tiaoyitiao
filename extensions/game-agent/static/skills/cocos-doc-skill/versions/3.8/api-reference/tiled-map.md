---
id: cocos-3.8-api-reference-tiled-map
version: "3.8"
category: api-reference
title: TiledMap（瓦片地图组件）
keywords:
  - TiledMap
  - 瓦片地图
  - TMX地图
  - TiledLayer
  - 地图对象层
  - ObjectGroup
  - getObjectGroup
  - getLayer
  - EnableCulling
related_docs:
  - assets/spine-dragonbones.md
  - api-reference/tiled-map.md
related_api:
  - TiledMap
  - TiledLayer
  - TiledObjectGroup
  - TMXObject
  - Component
source:
  official: "Cocos Creator 3.8 官方文档 - 编辑器组件 - TiledMap"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# TiledMap（瓦片地图组件）

## 用途

TiledMap 组件用于在游戏中加载和显示 Tiled 编辑器（.tmx 格式）制作的瓦片地图，支持多图层渲染、地图层级遮挡、对象层读取等功能。适用于 2D 游戏的关卡地图、RPG 地图场景、塔防地图等。

## 所属模块

```ts
import { TiledMap, TiledLayer, TiledObjectGroup, TMXObject } from 'cc';
```

## 公开导出结论

- `TiledMap` 在 `cc` 模块以 `export class TiledMap extends Component` 公开导出。
- `TiledLayer` 在 `cc` 模块以 `export class TiledLayer extends Component` 公开导出。
- `TiledObjectGroup` 在 `cc` 模块以 `export class TiledObjectGroup extends Component` 公开导出。
- 对象层数据以 Tiled 对象结构返回，具体对象类型按公开声明使用。
- 关键属性：`tmxAsset`（TiledMapAsset 类型，引用 .tmx 地图资源）、`enableCulling`（是否启用裁剪）。
- 关键方法：`getLayer(layerName)`（获取地图图层）、`getObjectGroup(groupName)`（获取对象组）、`getObjectGroups()`（获取所有对象组）、`getLayers()`（获取所有图层）。
- 设置 tmxAsset 后，组件会自动创建与地图中的 Layer 对应的子节点，每个子节点挂载 TiledLayer 组件。

## 常用属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `tmxAsset` | TiledMap 地图资源（.tmx 格式） | 绑定地图资源 |
| `enableCulling` | 是否启用裁剪，默认 true | 性能优化（瓦片数少时可关闭） |

## 常用方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `getLayer(layerName)` | 通过图层名称获取 TiledLayer | 获取地图某一层 |
| `getLayers()` | 获取所有图层 | 遍历地图所有层 |
| `getObjectGroup(groupName)` | 通过名称获取对象组 | 读取地图中放置的对象 |
| `getObjectGroups()` | 获取所有对象组 | 遍历所有对象组 |

## 高频代码

### 绑定地图资源

```ts
import { _decorator, Component, TiledMap, TiledMapAsset } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TiledMapExample')
export class TiledMapExample extends Component {
  @property(TiledMapAsset)
  mapAsset: TiledMapAsset | null = null;

  start() {
    const map = this.getComponent(TiledMap);
    if (!map) return;

    // 挂载地图资源（也可以在编辑器中将 TiledMap 的 tmxAsset 拖拽绑定）
    if (this.mapAsset) {
      map.tmxAsset = this.mapAsset;
    }
  }
}
```

### 读取地图对象层

```ts
import { _decorator, Component, TiledMap } from 'cc';

const { ccclass } = _decorator;

@ccclass('MapObjectReader')
export class MapObjectReader extends Component {
  start() {
    const map = this.getComponent(TiledMap);
    if (!map) return;

    // 获取名称为 'objects' 的对象组
    const objectGroup = map.getObjectGroup('objects');
    if (!objectGroup) {
      console.warn('未找到 objects 对象组');
      return;
    }

    // 遍历所有对象
    const objects = objectGroup.getObjects();
    for (const obj of objects) {
      console.log(
        `对象: ${obj.name}, 位置: (${obj.x}, ${obj.y}), 大小: ${obj.width}x${obj.height}`
      );

      // 读取自定义属性
      const type = obj.getProperty('type');
      console.log(`类型: ${type}`);
    }
  }
}
```

### 获取地图图层并控制可见性

```ts
import { _decorator, Component, TiledMap, TiledLayer } from 'cc';

const { ccclass } = _decorator;

@ccclass('MapLayerControl')
export class MapLayerControl extends Component {
  toggleLayer(layerName: string, visible: boolean) {
    const map = this.getComponent(TiledMap);
    if (!map) return;

    const layer = map.getLayer(layerName);
    if (!layer) return;

    layer.node.active = visible;
  }

  getLayerSize() {
    const map = this.getComponent(TiledMap);
    if (!map) return;

    const layers = map.getLayers();
    for (const layer of layers) {
      // TiledLayer 提供图层大小和瓦片信息
      console.log(
        `图层 ${layer.node.name}: ${layer.layerSize.x} x ${layer.layerSize.y}`
      );
    }
  }
}
```

## 常见错误

1. **资源未导入**：
   - `.tmx` 文件导入后需要与 `.tsx` 文件和图片在同一目录。
   - `.tsx` 文件作为 TiledMap 的图块集引用，必须和 `.tmx` 一起导入。
   - `tmxAsset` 为 null 时地图不显示，必须在编辑器拖拽或代码中赋值。

2. **组件引用为空**：
   - `getComponent(TiledMap)` 返回 null，节点上未添加 TiledMap 组件，必须判空。
   - 自动生成的 TiledLayer 子节点上的 TiledLayer 组件请勿删除。

3. **坐标或层级不对**：
   - 地图默认渲染在 2D 平面（X-Y 平面），需要配合 2D 相机或正交相机查看。
   - 如果地图在 3D 相机中不显示，需要关闭 `enableCulling`。
   - TiledLayer 的节点遮挡与节点的坐标有关，与节点大小无关（通过 `addUserNode` 添加的节点按行列坐标判断遮挡）。

4. **运行时问题**：
   - TiledMap 不支持 `mapLoaded` 回调，在 `start` 中即可安全访问地图数据和图层。
   - 地图瓦片数量很多时（大于 5000），建议保持 `enableCulling = true` 开启裁剪，否则 GPU 负担会增加。
   - 如果地图需要旋转或置于 3D 相机中，需关闭 `enableCulling`。

## 关联任务

- [Spine/DragonBones 资产文档](../assets/spine-dragonbones.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 编辑器组件 - TiledMap
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
