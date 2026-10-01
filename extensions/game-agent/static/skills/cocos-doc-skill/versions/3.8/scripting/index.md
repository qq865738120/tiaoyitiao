# Scripting

Cocos Creator 3.8 TypeScript 脚本开发实践。目录聚焦**脚本编写者的实战决策**，不重复概念层的定义和 API 卡片的完整列表。

## 文档索引

- [TypeScript 脚本基础](./typescript-basics.md) — 标准模板、类型约定、入门必读
- [@ccclass 与 @property 详解](./ccclass-property.md) — 装饰器用法、属性面板暴露
- [模块导入与组织](./module-import.md) — 从 cc 导入、项目内脚本引用、模块加载顺序
- [脚本分类与加载](./script-types-and-loading.md) — 六类脚本区分、加载顺序、插件脚本与第三方库策略
- [onLoad 与 start 实战选择](./component-lifecycle.md) — 初始化逻辑放在哪个钩子
- [脚本中访问节点与组件](./node-component-access.md) — 三种引用模式优先级、空引用处理
- [计时器与定时执行](./scheduler-timer.md) — schedule/scheduleOnce/unschedule 用法
- [事件系统](./event-system.md) — 节点事件、自定义事件、冒泡、解绑
- [输入系统](./input-system.md) — 全局 input 事件：键盘、触摸、鼠标
- [输入事件传播](./input-events.md) — 事件冒泡/捕获、node.on 与 Button 事件区别
- [异步加载与 Promise 封装](./async-and-promise.md) — resources.load 封装为 Promise、isValid 检查
- [调试与日志输出](./debugging.md) — console 日志、浏览器 DevTools 断点
- [常见编码陷阱与避坑指南](./coding-pitfalls.md) — 六大高频 bug 模式与预防
