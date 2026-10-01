# 性能、生命周期与场景拆分

## 适用场景

用于大型关卡、切场景、区域流式加载、Asset Bundle、节点池、重复对象、节点膨胀、DrawCall、内存和首屏加载优化。

## 决策规则

1. Scene、Prefab 和 Asset Bundle 的边界优先跟随生命周期：一起加载、一起使用、一起释放的内容适合放在同一边界。
2. `preloadScene` 只预加载场景所需资源，不会切换场景；`loadScene` 才进入场景。不要把预加载当作已实例化。
3. 高频创建销毁的同构对象使用 Prefab + 节点池；低频、状态复杂的对象不必强行池化。
4. 重复静态 3D 网格优先评估 GPU Instancing、合批与 LOD；UI 则优先保证纹理/材质连续并控制 Mask 等批次边界。
5. 不要以减少节点数为唯一目标。节点职责、激活成本、组件更新、渲染批次和资源内存应分别度量。
6. 场景拆分需要同时设计跨场景持久节点、事件解绑、资源引用和失败回退。
7. Asset Bundle 是资源交付与加载边界，不自动解决业务生命周期；必须明确加载、缓存、释放责任。

## 推荐结构

```text
Bootstrap.scene
├─ PersistentServices
└─ LoadingUI

Gameplay.scene
├─ SharedEnvironment
├─ RegionMounts
├─ DynamicActors
└─ GameplayUI

Bundles
├─ shared
├─ region-a
├─ region-b
└─ optional-content
```

区域流式加载应通过稳定挂载点实例化区域 Prefab；区域卸载前先停止逻辑、解绑事件、回收池对象，再释放仅由该区域持有的资源。

## 反模式

- 为“整洁”把所有资源放进一个场景或一个 Bundle。
- 仅调用 `preloadScene` 就假设新场景节点已经可查询。
- 高频对象每帧 instantiate/destroy，却不评估节点池。
- 为减少 DrawCall 盲目合并所有节点，破坏剔除、复用和独立生命周期。
- 切场景后留下全局事件、定时器或持久节点的旧引用。
- 用节点总数替代真实性能测量。

## 验证清单

- [ ] Scene/Prefab/Bundle 边界是否与加载和释放生命周期一致。
- [ ] preload、load、激活和首帧可交互时点是否分别测量。
- [ ] 高频对象的创建、回收、重置和池容量是否验证。
- [ ] DrawCall、三角面、节点/组件更新、物理步和内存均有基线。
- [ ] LOD、实例化、UI 合批与 Mask 边界在目标设备实测。
- [ ] 场景切换后的事件、计时器、持久节点和资源引用无泄漏。
- [ ] 加载失败、Bundle 缺失和低内存回退路径可用。

## 适用条件

- 适用于 Creator 3.8.x 资源与场景管理。
- 资源释放会受引用关系和缓存策略影响；任何“已释放”结论都应通过实际引用与内存数据确认。

## 一手来源

- [Asset Bundle](https://docs.cocos.com/creator/3.8/manual/en/asset/bundle.html)
- [Asset Manager](https://docs.cocos.com/creator/3.8/manual/en/asset/asset-manager.html)
- [场景资源加载](https://docs.cocos.com/creator/3.8/manual/en/asset/scene-managing.html)
- [UI 合批](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/engine/ui-batch.html)
- [LOD](https://docs.cocos.com/creator/3.8/manual/en/editor/rendering/lod.html)
