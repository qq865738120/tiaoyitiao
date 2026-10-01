---
id: cocos-3.8-architecture-game-data-and-save-architecture
version: "3.8"
category: architecture
title: 游戏数据与存档架构
keywords:
  - 存档
  - 存档架构
  - SaveData
  - SaveManager
  - localStorage
  - 序列化
  - 进度存档
  - 配置管理
  - ConfigManager
  - 数据分层
  - 版本迁移
  - schema 版本
  - 数据持久化
  - 缓存策略
  - 运行时状态
related_docs:
  - architecture/game-loop-and-execution-order.md
related_api:
  - sys.localStorage
  - JsonAsset
  - resources
source:
  official: "Cocos Creator 3.8 官方文档 - 资源管理、本地存储、数据持久化"
  supplement:
    - "工程经验：四类数据区分策略、存档 DTO 设计规范、版本迁移与恢复机制"
status: draft
updated: 2026-06-18
---

# 游戏数据与存档架构

## 适用条件

- 需要区分编辑器配置、运行时状态、静态配置表和跨场景存档。
- 需要把 `JsonAsset`、Bundle、localStorage 或原生文件存储串成可维护的数据链路。
- 需要为版本升级、字段迁移和存档兼容制定明确规则。

## 非适用条件

- 只需要读取单个资源或修改一个组件属性，应使用 assets 或 recipes。
- 没有持久化和配置表需求的原型项目，不需要完整存档架构。
- 服务端权威数据、联网同步和账号系统不在本文范围内。

## Cocos落地

静态配置可放在 JSON 资源或 Bundle 中，由资源系统加载成普通 TypeScript DTO；运行时状态留在组件或服务对象中；跨场景数据由明确初始化的常驻节点/服务持有；存档只写可序列化 DTO，避免直接保存 Node、Component 或 Asset 引用。

## 代价

数据分层需要维护 schema、迁移函数和加载时序；对小项目会显得繁琐，但能避免后期把编辑器配置、运行时状态和持久化数据混在同一组件里。

## 概述

Cocos Creator 3.8 项目中的数据按照**生命周期、持久性、可变性**分为四类：静态配置、玩家进度（存档）、临时运行时状态和缓存。将这四类数据混用是导致存档膨胀、序列化引擎对象、配置表与业务耦合等问题的根源。

本文提供一套分层数据架构，让智能体能把配置、运行时状态、进度存档和缓存分开设计，避免序列化引擎对象。

## 常见误区

1. **"把整个 Node 或 Component 存进存档"**：引擎对象不可序列化，JSON.stringify 会丢失引用或报循环引用错误。应提取纯数据字段。
2. **"存档不需要版本号"**：随着项目迭代，存档结构必然变化。没有版本号无法安全迁移旧存档。
3. **"ConfitManager 和 SaveManager 可以合并"**：不可。配置只读、跟随构建；存档读写、跟随玩家。生命周期和来源都不同。
4. **"sys.localStorage 在 Web 上足够大，不需要考虑容量"**：Web 端约 5MB 限制，存储大量 String 记录可能超出。应控制存档 JSON 大小，图片等资源用文件路径引用而非 base64。
5. **"用户修改了 localStorage 数据没关系"**：对于单机游戏，可以接受。对于排行、货币等敏感数据，应服务端校验或至少签名加密。
6. **"存档失败就静默忽略"**：存档失败应提示用户，并提供重试机制。连续失败可能意味着存储空间不足。

## 数据流与所有权

```
配置表 (JSON)
  │
  └─ ConfigManager.loadAll() ─→ ConfigManager (只读)
        │
        └─ getWeapon("sword_01") ─→ 业务逻辑
                                      │
                                      ├─ 修改临时状态（Runtime State）
                                      │   - EnemyAI.currentHealth
                                      │   - Combat.comboCount
                                      │
                                      └─ 触发持久化（Save Data）
                                          saveManager.setLevel(2)
                                          saveManager.addItem("sword_01")

- 本节长模板已压缩；保留决策点，具体实现按关联 API/recipe 组合。

## 可组合性

- **与 Bootstrap/Manager 模式**：ConfigManager 和 SaveManager 作为顶层 Manager，由 Game/Bootstrap 在 onLoad 中初始化
- **与事件系统**：SaveManager.save() 可通过事件通知 UI 刷新、数据上报等
- **与场景管理**：SaveManager 是跨场景单例，不随场景切换销毁

## 维护代价

| 维度 | 代价 | 说明 |
|---|---|---|
| 初始化复杂度 | 中 | ConfigManager 需预加载配置表；SaveManager 需处理加载/迁移 |
| 运行期性能 | 低 | 仅保存时序列化一次，读取时反序列化一次 |
| 测试难度 | 中 | 存档迁移需要覆盖多个版本的测试用例 |
| 新人理解成本 | 中 | 四类数据区分概念需理解，但代码模板清晰 |
| 跨平台兼容 | 低-中 | sys.localStorage 统一 API，但需注意 Web 5MB 限制 |

## 已知替代方案

| 方案 | 适用场景 | 缺陷 |
|---|---|---|
| 直接 JSON 文件读写 | 需要热更新、与外部工具交互 | 原生平台需 jsb.fileUtils，Web 不可用 |
| IndexedDB（Web） | 需要 >5MB 数据、结构化查询 | 异步 API 增加复杂度；原生平台不可用 |
| SQLite（原生） | 复杂查询、大量数据 | 额外库依赖，与 Web 不兼容 |
| 云存档 | 多设备同步 | 需要服务端，增加网络依赖和延迟 |
