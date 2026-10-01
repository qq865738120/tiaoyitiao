# 渲染、相机、灯光与后处理

## 适用场景

用于节点不可见、多 Camera、Layer、屏幕 UI/世界 UI、阴影、探针、后处理、BlitScreen 与不同渲染管线路径。

## 决策规则

1. 先识别渲染管线，再配置后处理。不能把旧 PostProcess 组件路径无条件套用到 3.8.4+ Builtin Pipeline。
2. 可见性至少同时满足：节点启用、父链启用、Renderer 启用、Layer 命中 Camera Visibility、处于可渲染根与相机范围。
3. 多 Camera 应按职责拆分，例如 World、WorldUI、ScreenUI、Minimap；明确 Clear Flags、Priority、Visibility 和输出目标。
4. 灯光数量、阴影类型和范围按目标平台预算配置；先保证主光和关键局部光，再增加装饰光。
5. 旧后处理路径中，`BlitScreen` 继承 `PostProcessSetting`，而 `PostProcessSetting` 对同节点 `PostProcess` 有强依赖；仍需验证材质和资源引用。
6. Creator 3.8.4+ Builtin Pipeline 的后处理从 Camera 上的 `BuiltinPipelineSettings` 配置；按实际文档和项目管线选择 FXAA、Bloom、Color Grading 等。

## 推荐结构

```text
Rendering
├─ Cameras
│  ├─ WorldCamera            # 世界 Layer
│  ├─ WorldUICamera          # 世界 UI Layer，可选
│  └─ UICamera               # 屏幕 UI Layer
├─ Lighting
│  ├─ MainDirectionalLight
│  └─ LocalLights
├─ Probes
│  ├─ LightProbes
│  └─ ReflectionProbes
└─ PipelineSettings          # 依据当前管线配置
```

后处理决策：

| 条件 | 推荐路径 |
|---|---|
| 3.8.4+ 且项目使用 Builtin Pipeline | Camera + `BuiltinPipelineSettings` |
| 项目明确使用旧 PostProcess 工作流 | PostProcess 节点 + Setting 组件，核对依赖与材质 |
| 自定义管线 | 以项目管线资产、阶段和扩展文档为准，不套用内置字段 |

## 反模式

- 看见 BlitScreen 就只添加它，不检查 PostProcess 依赖和材质引用。
- 未确认项目管线就照抄另一套后处理组件组合。
- 节点不可见时只反复修改坐标，不检查 Layer/Camera Visibility。
- 多个 Camera 使用重叠 Visibility 和不明确的清屏顺序。
- 为所有灯开启最高质量实时阴影。
- 把屏幕 UI、世界 UI 和 3D 世界交给同一 Camera，却没有明确理由和验证。

## 验证清单

- [ ] 已记录当前渲染管线和适用版本。
- [ ] 每台 Camera 的 Priority、Clear Flags、Visibility 和 TargetTexture 已核对。
- [ ] 关键节点 Layer 与 Camera Visibility 相交。
- [ ] 后处理组件、材质、纹理/LUT 和强依赖完整。
- [ ] 阴影距离、分辨率、级联和灯光数量符合目标平台预算。
- [ ] 多 Camera 叠加、透明对象、世界 UI 和屏幕 UI 顺序实测。
- [ ] 编辑器预览、目标平台构建和关闭后处理的回退效果均验证。

## 适用条件

- `[3.8.x]` 通用：Camera Visibility、Layer、灯光和探针的基础决策。
- `[3.8.4+] [管线: Builtin]`：Camera 上的 `BuiltinPipelineSettings` 后处理路径。
- `[旧管线工作流]`：PostProcess、PostProcessSetting、BlitScreen 组合；只有项目确实使用时才采用。

## 一手来源

- [3.8.4+ Builtin Pipeline 后处理](https://docs.cocos.com/creator/3.8/manual/en/render-pipeline/use-post-process.html)
- [Builtin Pipeline](https://docs.cocos.com/creator/3.8/manual/en/render-pipeline/use-builtin-pipeline.html)
- [旧 PostProcess 工作流](https://docs.cocos.com/creator/3.8/manual/en/render-pipeline/post-process/)
- [BlitScreen](https://docs.cocos.com/creator/3.8/manual/en/render-pipeline/post-process/blit-screen.html)
- [探针](https://docs.cocos.com/creator/3.8/manual/en/concepts/scene/light/probe/)
