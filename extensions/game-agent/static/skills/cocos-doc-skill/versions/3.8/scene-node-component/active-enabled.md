---
id: cocos-3.8-scene-node-component-active-enabled
version: "3.8"
category: scene-node-component
title: active 与 enabled：激活与启用
keywords:
  - active
  - enabled
  - 激活
  - 隐藏
  - 禁用
  - 显示隐藏
  - 节点激活
  - 组件启用
  - activeInHierarchy
related_docs:
  - api-reference/node.md
  - api-reference/component.md
  - scene-node-component/node.md
  - scene-node-component/component.md
  - scene-node-component/destroy-lifecycle.md
related_api:
  - Node
  - Component
source:
  official: "Cocos Creator 3.8 官方文档 - 脚本系统 - 生命周期回调"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
  supplement:
    - "工程经验：UI 不显示时优先排查父节点 active 链"
status: draft
updated: 2026-06-17
---

# active 与 enabled：激活与启用

## 用途

说明 `node.active` 和 `component.enabled` 的区别、它们对生命周期、渲染、输入和 update 的影响，以及"UI 不显示"问题的排查方法。

## 核心结论

- **`node.active`**：控制节点及其所有子节点是否在场景中激活。`false` 时节点完全不参与渲染、输入、生命周期。
- **`component.enabled`**：控制单个组件是否执行 `update`/`lateUpdate` 和事件回调。`false` 时组件逻辑暂停，但节点仍正常渲染（如果有渲染组件）。
- **`activeInHierarchy`** / **`enabledInHierarchy`**：反映实际生效状态（考虑父节点 active 的影响），只读属性。
- **排查"节点不显示"**：按 `父节点 active 链` → `节点自身 active` → `渲染组件 enabled` → `渲染组件属性` 顺序逐层检查。

## node.active

```ts
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ActiveExample')
export class ActiveExample extends Component {
  @property(Node)
  panel: Node | null = null;

  showPanel() {
    if (this.panel) {
      this.panel.active = true;   // 激活节点及其子节点
    }
  }

  hidePanel() {
    if (this.panel) {
      this.panel.active = false;  // 停用节点及其子节点
    }
  }

  toggleSelf() {
    this.node.active = !this.node.active;
  }
}
```

**`active = false` 的影响**：
- ❌ 节点及其所有子节点不可见（不渲染）
- ❌ 该节点上所有组件的 `update` / `lateUpdate` 不执行
- ❌ 该节点及子节点不响应输入事件
- ❌ 触发 `onDisable` 回调（所有相关组件）
- ✅ 节点引用仍然有效，只是不在场景中活动

## component.enabled

```ts
import { _decorator, Component, Label } from 'cc';

const { ccclass } = _decorator;

@ccclass('EnabledExample')
export class EnabledExample extends Component {
  private _label: Label | null = null;

  start() {
    this._label = this.node.getComponent(Label);
    if (!this._label) return;

    this._label.enabled = false;  // Label 组件逻辑暂停，但文本仍显示
  }

  startCounting() {
    this.enabled = true;  // 启用自身组件的 update
  }

  pauseCounting() {
    this.enabled = false; // 暂停自身组件的 update
  }

  update(dt: number) {
    // 仅当 enabled = true 时执行
    console.log('counting...');
  }

  onDisable() {
    // enabled 变为 false 时触发
    // 用于清理定时器、注销事件
    this.unscheduleAllCallbacks();
  }
}
```

**`enabled = false` 的影响**：
- ❌ 该组件的 `update` / `lateUpdate` 不执行
- ❌ 该组件的定时器（`schedule`）暂停
- ❌ 触发 `onDisable` 回调
- ✅ 节点正常渲染（如果有渲染组件且其 enabled 为 true）
- ✅ 其他组件的 update 正常执行

## 对比速查

| 操作 | 不渲染 | update 不执行 | onDisable 触发 | 子节点影响 | 可逆 |
|---|---|---|---|---|---|
| `node.active = false` | ✅ | ✅（所有组件） | ✅（所有组件） | ✅ 子节点全部不可见 | ✅ |
| `component.enabled = false` | ❌ | ✅（仅该组件） | ✅（仅该组件） | ❌ 无影响 | ✅ |
| `node.destroy()` | ✅ | ✅ | ✅ + onDestroy | ✅ 子节点全部销毁 | ❌ 不可逆 |

## activeInHierarchy 与 enabledInHierarchy

```ts
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('HierarchyCheckExample')
export class HierarchyCheckExample extends Component {
  start() {
    // active: 自身设置的值
    console.log('active:', this.node.active);  // true

    // activeInHierarchy: 实际是否激活（父节点可能 active=false）
    console.log('activeInHierarchy:', this.node.activeInHierarchy);

    // 同样的逻辑
    console.log('enabled:', this.enabled);
    console.log('enabledInHierarchy:', this.enabledInHierarchy);
  }

  update(dt: number) {
    // 提前退出是常见优化
    if (!this.enabledInHierarchy) return;
    // 实际逻辑...
  }
}
```

**判断规则**：
- `activeInHierarchy` 为 `true` ↔ 该节点自身 active 为 true **且**所有祖先节点 active 均为 true。
- `enabledInHierarchy` 为 `true` ↔ 该组件 enabled 为 true **且** `node.activeInHierarchy` 为 true。

## UI 不显示的排查路径

当 UI 元素不显示时，按以下顺序排查：

```ts
import { Node, Label } from 'cc';

// 排查函数示例
function debugUIVisibility(node: Node, label: Label) {
  // 1. 检查 active 链
  let current: Node | null = node;
  while (current) {
    if (!current.active) {
      console.warn(`节点 ${current.name} active = false`);
      return;
    }
    current = current.parent;
  }

  // 2. 检查组件 enabled
  if (!label.enabled) {
    console.warn('Label enabled = false');
    return;
  }

  // 3. 检查渲染组件属性
  if (!label.string || label.string === '') {
    console.warn('Label.string 为空');
    return;
  }
  if (label.fontSize <= 0) {
    console.warn('Label.fontSize 无效:', label.fontSize);
    return;
  }
}
```

**排查顺序**：
1. 检查从 Canvas 到目标节点的所有父节点 active 是否为 true
2. 检查目标节点自身的 active
3. 检查渲染组件的 enabled（Label、Sprite 等）
4. 检查渲染组件属性（string 为空、spriteFrame 为 null 等）
5. 检查 UITransform 的 contentSize 是否合理

## 关联文档

- [Node API 卡片](../api-reference/node.md)
- [Component API 卡片](../api-reference/component.md)
- [节点销毁与生命周期](./destroy-lifecycle.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - 脚本系统 - 生命周期回调
- 已交叉验证：cc-engine 3.8 公开类型声明
- 补充：工程经验——UI 不显示排查按 active 链→enabled→属性顺序
