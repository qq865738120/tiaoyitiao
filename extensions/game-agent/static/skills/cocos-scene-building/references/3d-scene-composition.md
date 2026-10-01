# 3D 场景组合

## 适用场景

用于 3D 关卡、室内外环境、角色、交互物、模型、灯光、探针、LOD、世界 UI 和大型场景层级规划。

## 决策规则

1. 先按生命周期和职责分根，再按美术结构细分。稳定环境、动态对象、玩法触发器、特效和世界 UI 不应混在同一资产边界。
2. 模型资产的重复实例优先保留来源一致性；有独立行为和多组件组合时封装为 Prefab。
3. 静态环境与动态对象分开，便于阴影、烘焙、探针、剔除、LOD 和物理策略独立配置。
4. 远近模型切换使用 LOD Group；不要只复制多个模型节点后靠脚本随意开关。
5. 光照探针服务动态物体的间接光；反射探针服务环境反射。探针范围、密度和更新方式应与场景分区一致。
6. 视觉网格与碰撞代理可以分离：复杂模型常用更简单的 Collider 形状，降低物理成本并提高稳定性。
7. 世界空间 UI 应单独分层，明确 Camera、距离缩放、遮挡和交互策略。

## 推荐结构

```text
Scene
├─ Environment
│  ├─ StaticGeometry
│  ├─ Vegetation
│  ├─ Lighting
│  ├─ ReflectionProbes
│  └─ LightProbes
├─ Dynamic
│  ├─ Player
│  ├─ NPCs
│  └─ InteractiveProps
├─ Gameplay
│  ├─ SpawnPoints
│  ├─ Triggers
│  └─ Navigation
├─ Effects
├─ WorldUI
├─ Cameras
└─ Systems
```

大型世界可将区域内容拆成 Scene 或 Asset Bundle 驱动的 Prefab 分块；分块边界应与加载、卸载和复用边界一致。

## 反模式

- 按“模型文件夹长什么样”原样复制为运行时场景树，而不考虑生命周期。
- 每个重复场景物件都制作独立 Prefab，造成资产碎片化。
- 用高面数 MeshCollider 代替简单碰撞代理且没有性能依据。
- 将静态环境和频繁移动对象混在同一根节点与同一优化策略中。
- 在所有物体上盲目添加实时阴影、反射探针或最高质量 LOD。
- 用深层节点路径作为脚本公共契约。

## 验证清单

- [ ] 根节点是否对应稳定职责和生命周期。
- [ ] 重复模型是否复用资产或 Prefab，而非复制独立资源。
- [ ] 静态/动态标记、阴影和剔除策略是否一致。
- [ ] LOD 阈值是否从目标 Camera 距离与实际画面验证。
- [ ] 光照探针、反射探针是否覆盖真正需要的区域。
- [ ] 视觉网格与碰撞代理是否分别满足质量和性能。
- [ ] 世界 UI 的 Layer、Camera Visibility、遮挡和交互是否实测。

## 适用条件

- 适用于 Creator 3.8.x 3D 场景。
- 探针、阴影和后处理能力受渲染管线、目标平台和项目质量档位影响，必须结合当前项目设置验证。

## 一手来源

- [LOD](https://docs.cocos.com/creator/3.8/manual/en/editor/rendering/lod.html)
- [光照探针](https://docs.cocos.com/creator/3.8/manual/en/concepts/scene/light/probe/light-probe.html)
- [反射探针工作流](https://docs.cocos.com/creator/3.8/manual/en/concepts/scene/light/probe/reflection-art-workflow.html)
- [3D 物理组件](https://docs.cocos.com/creator/3.8/manual/en/physics/physics-component.html)
