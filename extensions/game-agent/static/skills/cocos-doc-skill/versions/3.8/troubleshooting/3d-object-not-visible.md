---
id: cocos-3.8-troubleshooting-3d-object-not-visible
version: "3.8"
category: troubleshooting
title: 3D 对象不可见
keywords:
  - 3D 对象不可见
  - 模型不显示
  - 模型全黑
  - 模型看不到
  - 3D 节点不渲染
  - 物体看不见
  - Camera 渲染不到
  - targetTexture 不渲染
  - RenderTexture 输出空白
related_docs:
  - api-reference/camera.md
  - api-reference/directional-light.md
  - api-reference/sphere-light.md
  - api-reference/spot-light.md
  - concepts/3d-scene-rendering.md
  - troubleshooting/ui-not-visible.md
  - concepts/scene-node-component-model.md
  - troubleshooting/render-texture-blend-state.md
related_api:
  - Camera
  - DirectionalLight
  - SphereLight
  - SpotLight
  - MeshRenderer
  - Node
source:
  official: "Cocos Creator 3.8 官方文档 - 场景 / 相机 / 光照"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：3D 对象不可见时按本文顺序排查最有效"
status: draft
updated: 2026-06-17
---

# 3D 对象不可见

## 现象

场景中添加了 3D 模型节点（立方体、球体或导入的 FBX/GLTF 模型），预览或运行时该模型在游戏画面中看不到。可能表现为：
- 完全空白，无一物。
- 其他 UI/2D 元素正常，仅 3D 部分不可见。
- 模型存在但显示为全黑。

## 最可能原因

3D 对象不可见通常由以下条件之一导致，建议**按下文顺序逐一排查**：

1. 节点 active、位置、缩放导致物体不在场景的有效范围内。
2. Camera 位置、朝向、near/far 裁剪导致物体在视锥体外。
3. Layer 与 visibility 不匹配。
4. MeshRenderer / Mesh / Material 配置缺失。
5. 缺少光源或材质不受光。
6. 渲染管线配置或平台差异。

## 快速检查（按排查顺序）

### Step 1: 检查节点的 active、位置和缩放

- [ ] 在层级管理器中选择该节点，确认 **active** 复选框已勾选，且所有父节点也都 active。
- [ ] 确认节点的 **Position** 在合理范围内——不在 Camera 背侧，不是极远/极近的值。
- [ ] 确认节点的 **Scale** 不为零或极小数（如 0.001），否则模型被压缩到不可见。
- [ ] 如果节点是预制体实例，检查 Prefab 自身的 Scale 是否异常。

```ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('DebugNodeState')
class DebugNodeState extends Component {
  start() {
    // 调试输出节点状态
    console.log('active:', this.node.active);
    console.log('worldPosition:', this.node.worldPosition);
    console.log('worldScale:', this.node.worldScale);
  }
}
```

### Step 2: 检查 Camera 位置、朝向、near/far

- [ ] 确认场景中至少有一个 Camera 组件存在（`director.getScene().renderScene.cameras`）。
- [ ] 确认 Camera 的位置和旋转朝向**对着** 3D 模型所在区域。
- [ ] 确认模型的 worldPosition 在 Camera 的 nearClip 和 farClip 之间。
- [ ] 如果使用透视相机，检查模型是否在 FOV 覆盖范围内。

```ts
// 获取场景中所有相机
import { _decorator, Component, Camera, director, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('DebugCamera')
export class DebugCamera extends Component {
  start() {
    const mainCamera = Camera.main;
    if (mainCamera) {
      console.log('Camera position:', mainCamera.node.worldPosition);
      console.log('Camera rotation:', mainCamera.node.eulerAngles);
      console.log('nearClip:', mainCamera.nearClip, 'farClip:', mainCamera.farClip);
    }

    const scene = director.getScene();
    const cameras: Camera[] = scene?.renderScene?.cameras as Camera[] || [];
    console.log('Total cameras:', cameras.length);
  }
}
```

### Step 3: 检查 Layer 与 visibility

- [ ] 在 Inspector 中查看 3D 模型节点的 **Layer** 属性（默认应为 `DEFAULT`）。
- [ ] 在 Inspector 中查看 Camera 组件的 **visibility** 属性——默认只勾选 `DEFAULT`。
- [ ] 如果 Layer 被修改为其他层，确认 Camera 的 visibility 包含该层。
- [ ] 如果场景有**多个相机**，确认负责渲染 3D 的相机 visibility 包含模型的 Layer。

**常见情况**：误将模型节点 Layer 改为 `UI_2D`，而 3D 相机只渲染 `DEFAULT` 层，导致模型对 3D 相机不可见。

```ts
import { _decorator, Component, Camera } from 'cc';
const { ccclass } = _decorator;

@ccclass('CheckLayerVisibility')
class CheckLayerVisibility extends Component {
  start() {
    // 检查节点 Layer 和 Camera visibility
    if (this.node.layer) {
      console.log('Node layer value:', this.node.layer);
    }

    const mainCamera = Camera.main;
    if (mainCamera) {
      console.log('Camera visibility:', mainCamera.visibility);
      // visibility 是按位掩码，检查 DEFAULT 层（位 0）是否开启
      const isDefaultVisible = (mainCamera.visibility & (1 << 0)) !== 0;
      console.log('DEFAULT layer visible:', isDefaultVisible);
    }
  }
}
```

### Step 4: 检查 MeshRenderer / Mesh / Material

- [ ] 确认节点上**挂载了** `MeshRenderer` 组件。如果是通过 `addComponent` 动态添加的，确认代码已执行。
- [ ] 确认 MeshRenderer 的 **Mesh** 属性已赋值（不空的网格资源）。
- [ ] 确认 MeshRenderer 的 **Materials** 数组不为空，且至少有一个材质资源。
- [ ] 如果使用了 SkinnedMeshRenderer（骨骼动画模型），确认模型已正确绑定骨骼。

```ts
import { _decorator, Component, MeshRenderer } from 'cc';
const { ccclass } = _decorator;

@ccclass('CheckMeshRenderer')
class CheckMeshRenderer extends Component {
  start() {
    const meshRenderer = this.node.getComponent(MeshRenderer);
    if (meshRenderer) {
      console.log('Mesh:', meshRenderer.mesh);
      console.log('Materials count:', meshRenderer.materials?.length);
      console.log('Materials[0]:', meshRenderer.materials?.[0]);

      if (!meshRenderer.mesh) {
        console.warn('Mesh is null — assign a mesh asset');
      }
      if (!meshRenderer.materials || meshRenderer.materials.length === 0) {
        console.warn('Materials array is empty — assign at least one material');
      }
    }
  }
}
```

### Step 5: 检查灯光、材质与渲染管线

#### 模型全黑但能看到轮廓

- [ ] **场景中没有灯光**——确保场景有至少一个 DirectionalLight 或其他光源。
- [ ] 新建场景默认有 `Main Light`，如果被删除，需手动添加（节点创建 -> 光源 -> 平行光）。
- [ ] **材质不支持光照**——确认材质使用的 Effect 是内置的 `builtin-standard` 或其他支持 PBR 的 Effect。使用 `unlit` Effect 的材质不对场景灯光起反应。

```ts
import { _decorator, Component, director, DirectionalLight } from 'cc';
const { ccclass } = _decorator;

@ccclass('CheckSceneLights')
class CheckSceneLights extends Component {
  start() {
    // 检查场景中的光源
    const scene = director.getScene();
    if (scene) {
      const lights = scene.getComponentsInChildren(DirectionalLight);
      console.log('DirectionalLights in scene:', lights.length);
    }
  }
}
```

#### 光源位置或方向不对

- **DirectionalLight**：光的方向由节点旋转控制，位置不受影响。检查 Main Light 的 eulerAngles 是否合理（如 `(-45, 0, 0)` 代表从斜上方照射）。
- **SphereLight**：位置决定光照中心，检查 `range` 是否足以覆盖模型。距离过远或 `range` 太小都会导致模型不受光。
- **SpotLight**：沿节点 -Z 轴方向照射，检查旋转和 `spotAngle`/`range` 是否覆盖模型。

#### 渲染管线或平台差异

- 某些平台或自定义渲染管线可能不支持部分光照特性。
- 移动端对多聚光灯阴影有限制。
- 在 Web 预览正常但在原生平台异常时，优先检查 Shadow 相关设置。

### Step 6（兜底确认）

如果以上步骤均未发现问题，尝试以下操作：

1. 创建一个**全新的**场景，添加默认 3D 对象（层级管理器 -> + -> 3D 对象 -> Cube），确认默认场景能正常渲染。
2. 如果新场景正常，说明是项目场景配置问题，从新场景逐步合并原场景内容。
3. 如果新场景也有问题，检查渲染管线配置、工程设置或引擎版本。

## 排查清单总结

| 步骤 | 检查项 | 快速验证方法 |
|---|---|---|
| 1 | 节点 active / 位置 / 缩放 | Inspector 直接查看 |
| 2 | Camera 位置 / 朝向 / near-far | 切换到 3D 编辑视角检查 Camera 视锥体 |
| 3 | Layer 与 visibility | 对比节点 Layer 和 Camera visibility 列表 |
| 4 | MeshRenderer / Mesh / Material | Inspector 检查 Mesh 和 Materials 属性 |
| 5 | 灯光与材质 | 确认场景至少有一个光源；材质使用标准 Effect |
| 6 | 新场景比对 | 创建干净场景添加默认 3D 对象 |

## 仍未解决时

- 使用编辑器 **场景编辑器** 的 3D 视角，沿 Camera 的视线方向排查是否有物体遮挡。
- 检查场景中是否有多余的 **Camera 组件覆盖**（如两个 Camera 叠在同一区域且 clearFlags 冲突）。
- 在代码外部设置断点，确认 `addComponent(MeshRenderer)` 等动态添加组件的代码确实被执行。
- 尝试用 `console.log(scene.renderScene)` 检查渲染场景对象是否有效。
- 查阅 [性能问题](./performance-issues.md) 文档确认不是 DrawCall 或合批异常。
- 检查 **Camera.targetTexture** 是否无意中设置为了 `RenderTexture`——当 Camera 的 `targetTexture` 被赋值后，Camera 渲染到纹理而非屏幕，这不是 Bug 而是设计行为。如果期望 Camera 直接渲染到屏幕，需将 `targetTexture` 设为 `null`。
- 检查目标平台的构建设置是否有特殊的渲染限制。

## 相关文档

- [3D 场景渲染基础概念](../concepts/3d-scene-rendering.md)
- [Camera API 卡片](../api-reference/camera.md)
- [DirectionalLight API 卡片](../api-reference/directional-light.md)
- [SphereLight API 卡片](../api-reference/sphere-light.md)
- [SpotLight API 卡片](../api-reference/spot-light.md)
- [场景、节点与组件模型](../concepts/scene-node-component-model.md)
- [UI 不显示排查](./ui-not-visible.md)
