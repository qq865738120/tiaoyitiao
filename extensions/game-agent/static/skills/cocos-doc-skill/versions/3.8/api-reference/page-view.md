---
id: cocos-3.8-api-reference-page-view
version: "3.8"
category: api-reference
title: PageView
keywords:
  - PageView
  - PageViewIndicator
  - 分页
  - 引导页
  - 轮播
  - 翻页
  - 页面切换
related_docs:
  - ui-2d/scroll-view.md
related_api:
  - PageView
  - PageViewComponent
  - PageViewIndicator
  - PageViewIndicatorComponent
source:
  official: "Cocos Creator 3.8 官方文档 - UI 系统 - PageView 组件"
  verified-against:
    - "cc-engine 3.8 公开类型声明"
    - "cc-engine 3.8 引擎源码"
  supplement: []
status: draft
updated: 2026-06-17
---

# PageView

## 用途

PageView 组件实现分页容器效果，用于引导页、轮播图、分页选择、水平/垂直页面切换等场景。

## 所属模块

```ts
import { PageView, PageViewIndicator } from 'cc';
```

## 公开导出结论

- `PageView` 在 `cc` 模块以 `export class PageView extends ScrollView` 公开导出，继承了 ScrollView 的所有属性与方法。
- `PageViewIndicator` 在 `cc` 模块以 `export class PageViewIndicator extends Component` 公开导出。
- PageView 公开属性：`sizeMode`（页面大小类型）、`direction`（滚动方向）、`scrollThreshold`（滚动临界值）、`pageTurningEventTiming`（翻页事件时机）、`indicator`（指示器引用）、`curPageIdx`（当前页索引，只读）、`autoPageTurningThreshold`（快速滑动翻页临界值）、`pageTurningSpeed`（翻页速度，单位秒）、`pageEvents`（翻页事件数组）。
- PageView 继承自 ScrollView 的属性：`verticalScrollBar`、`horizontalScrollBar`、`horizontal`、`vertical`、`cancelInnerEvents`、`scrollEvents`。
- 静态枚举：`PageView.SizeMode`（Unified / Free）、`PageView.Direction`（Horizontal / Vertical）、`PageView.EventType`（继承 ScrollView 事件并增加翻页事件）。
- PageView 公开方法：`getCurrentPageIndex()`、`setCurrentPageIndex(index)`、`getPages()`、`addPage(page)`、`insertPage(page, index)`、`removePage(page)`、`removePageAtIndex(index)`、`removeAllPages()`、`scrollToPage(idx, timeInSecond?)`。
- PageViewIndicator 公开属性：`spriteFrame`（标记图片）、`direction`（摆放方向）、`cellSize`（每个标记大小）、`spacing`（标记间距）。
- PageViewIndicator 公开方法：`setPageView(target)`（关联 PageView）。
- PageViewIndicator 静态枚举：`Direction`（HORIZONTAL / VERTICAL）。
- 无类型声明、源码、官方文档之间的冲突。

## 常用属性

### PageView 属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `curPageIdx` | 当前页面索引（只读） | 获取当前页 |
| `direction` | 滚动方向（Horizontal / Vertical） | 水平/垂直分页 |
| `pageTurningSpeed` | 翻页所需时间（秒） | 翻页动画速度 |
| `indicator` | 关联的 PageViewIndicator | 显示翻页指示点 |
| `scrollThreshold` | 拖拽超过此比例触发翻页（默认百分比） | 调整翻页灵敏度 |
| `pageEvents` | 翻页事件回调数组 | 编辑器绑定翻页回调 |
| `pageTurningEventTiming` | 翻页事件触发时机 | 控制事件触发时机 |
| `autoPageTurningThreshold` | 快速滑动翻页速度临界值 | 快速滑动翻页 |
| `sizeMode` | 页面尺寸模式（Unified / Free） | 统一大小/自由大小 |

### PageViewIndicator 属性

| 属性 | 说明 | 高频场景 |
|---|---|---|
| `spriteFrame` | 每个页面标记显示的图片 | 指示点样式 |
| `direction` | 标记摆放方向（HORIZONTAL / VERTICAL） | 水平/垂直指示器 |
| `cellSize` | 每个标记的大小 | 调整指示点尺寸 |
| `spacing` | 标记之间的间距 | 调整指示点间距 |

## 常用方法

### PageView 方法

| 方法 | 说明 | 高频场景 |
|---|---|---|
| `getCurrentPageIndex()` | 返回当前页面索引 | 获取当前页 |
| `setCurrentPageIndex(index)` | 设置当前页面索引 | 跳转到指定页 |
| `scrollToPage(idx, timeInSecond?)` | 滚动到指定页面（可指定过渡时间） | 翻页动画 |
| `addPage(page)` | 添加新页面到末尾 | 动态增加页面 |
| `insertPage(page, index)` | 在指定位置插入页面 | 动态插入页面 |
| `removePage(page)` | 移除指定页面 | 动态移除页面 |
| `removePageAtIndex(index)` | 移除指定索引的页面 | 按索引移除 |
| `removeAllPages()` | 移除所有页面 | 重置分页 |
| `getPages()` | 返回所有页面节点数组 | 遍历页面 |

## 高频代码

### 基础引导页翻页

```ts
import { _decorator, Component, PageView, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PageViewExample')
export class PageViewExample extends Component {
  @property(PageView)
  pageView: PageView | null = null;

  start() {
    if (!this.pageView) return;

    console.log('当前页面索引：', this.pageView.getCurrentPageIndex());
    console.log('总页数：', this.pageView.getPages().length);
  }

  /** 监听翻页事件 */
  onPageTurning(pageView: PageView) {
    if (!pageView) return;
    console.log('翻页到：', pageView.getCurrentPageIndex());
  }

  /** 跳转到特定页面 */
  goToPage(index: number) {
    if (!this.pageView) return;
    this.pageView.scrollToPage(index, 0.3);
  }

  /** 下一页 */
  nextPage() {
    if (!this.pageView) return;
    const current = this.pageView.getCurrentPageIndex();
    const total = this.pageView.getPages().length;
    if (current < total - 1) {
      this.pageView.scrollToPage(current + 1, 0.3);
    }
  }

  /** 上一页 */
  prevPage() {
    if (!this.pageView) return;
    const current = this.pageView.getCurrentPageIndex();
    if (current > 0) {
      this.pageView.scrollToPage(current - 1, 0.3);
    }
  }
}
```

### 动态添加和移除页面

```ts
import { _decorator, Component, PageView, Node, instantiate, Prefab } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DynamicPageViewExample')
export class DynamicPageViewExample extends Component {
  @property(PageView)
  pageView: PageView | null = null;

  @property(Prefab)
  pagePrefab: Prefab | null = null;

  private pageIndex = 0;

  /** 添加新页面 */
  addPage() {
    if (!this.pageView || !this.pagePrefab) return;

    const page = instantiate(this.pagePrefab);
    page.name = `page_${this.pageIndex++}`;
    this.pageView.addPage(page);
  }

  /** 删除当前页面 */
  removeCurrentPage() {
    if (!this.pageView) return;

    const currentIdx = this.pageView.getCurrentPageIndex();
    this.pageView.removePageAtIndex(currentIdx);
  }

  /** 删除所有页面 */
  clearAllPages() {
    if (!this.pageView) return;
    this.pageView.removeAllPages();
  }
}
```

### 使用 PageViewIndicator

```ts
import { _decorator, Component, PageView, PageViewIndicator } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PageViewIndicatorExample')
export class PageViewIndicatorExample extends Component {
  @property(PageView)
  pageView: PageView | null = null;

  @property(PageViewIndicator)
  indicator: PageViewIndicator | null = null;

  start() {
    if (!this.pageView || !this.indicator) return;

    // 关联指示器和 PageView
    this.pageView.indicator = this.indicator;
  }
}
```

### 监听翻页事件

```ts
import { _decorator, Component, PageView } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PageViewEventExample')
export class PageViewEventExample extends Component {
  @property(PageView)
  pageView: PageView | null = null;

  onEnable() {
    if (!this.pageView) return;

    // 监听翻页事件（从节点派发）
    this.node.on('page-turning', this.onPageTurning, this);
  }

  onDisable() {
    this.node.off('page-turning', this.onPageTurning, this);
  }

  private onPageTurning(pageView: PageView) {
    if (!pageView) return;
    console.log('翻页事件触发，当前页：', pageView.getCurrentPageIndex());
  }

  /** 自动轮播 */
  private autoPlayTimer = 0;
  private autoPlayInterval = 3;

  update(dt: number) {
    // 自动翻页示例（每 3 秒翻一页）
    if (!this.pageView) return;

    this.autoPlayTimer += dt;
    if (this.autoPlayTimer >= this.autoPlayInterval) {
      this.autoPlayTimer = 0;
      const current = this.pageView.getCurrentPageIndex();
      const total = this.pageView.getPages().length;
      const next = (current + 1) % total;
      this.pageView.scrollToPage(next, 0.3);
    }
  }

  onDestroy() {
    this.node.off('page-turning', this.onPageTurning, this);
  }
}
```

## 常见错误

1. **未设置 content 节点**：PageView 继承自 ScrollView，需要在 content 节点下放置页面子节点，否则无法滚动。
2. **页面内容超出或不足**：`ScrollThreshold` 设置过低可能导致轻微滑动就翻页；设置过高则难以翻页。
3. **`direction` 与子节点布局不匹配**：水平翻页时需确保子节点在水平方向排列，垂直翻页时需垂直排列。
4. **动态操作页面后索引未更新**：`removePage` / `removePageAtIndex` 后，`curPageIdx` 自动调整；但外部对索引的缓存需及时刷新。
5. **`scrollToPage` 传入超出范围的索引**：索引必须 >= 0 且 < 总页数，否则行为未定义。
6. **PageViewIndicator 未关联**：`Indicator` 不会自动关联，需要在代码中设置 `pageView.indicator` 或在编辑器 Inspector 中拖拽绑定。
7. **未检查 null**：`getComponent(PageView)` 或 `@property(PageView)` 可能为 null。

## 关联任务

- [滚动视图](../ui-2d/scroll-view.md)

## 来源

- 官方：Cocos Creator 3.8 官方文档 - UI 系统 - PageView 组件
- 已交叉验证：cc-engine 3.8 公开类型声明 / 引擎源码
