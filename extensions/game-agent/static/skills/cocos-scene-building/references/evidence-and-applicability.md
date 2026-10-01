# 证据与适用条件

## 适用场景

用于版本、渲染管线、模板默认绑定、组件依赖、编辑器行为或社区经验存在冲突的结论，也用于维护本技能和纠正旧知识卡。

## 决策规则

证据优先级：

1. 当前项目与当前 Scene/Prefab 的实际查询结果。
2. Creator 3.8.x 引擎源码、编辑器资源和类型声明。
3. Cocos Creator 3.8 官方手册。
4. 最小 Creator 3.8.x 实测。
5. 官方论坛、issue、示例和社区文章，仅用于发现线索或补充边界。

每条高风险结论应记录：

- 结论；
- 适用标签；
- 证据来源；
- 反例或未知条件；
- 最短验证方法。

推荐标签：

- `[3.8.x]`
- `[3.8.4+]`
- `[管线: Builtin]`
- `[旧管线工作流]`
- `[实测: 3.8.4]`
- `[项目特有]`
- `[待 Creator 验证]`

## 推荐结构

### 结论模板

```text
结论：普通 Canvas 后代不会因父子关系自动添加 UITransform。
适用：[3.8.x] [实测: 3.8.4]
证据：RenderRoot2D 的 requireComponent(UITransform) 只作用于组件所在节点；
      Canvas 模板自身含 UITransform，不会递归给任意后代添加组件。
验证：在 Canvas 下创建普通空节点，保存后查询该节点组件。
```

### 已确认纠错账本

| 旧说法 | 一手证据 | 修正 |
|---|---|---|
| 所有 UI 都必须位于 Canvas 下 | RenderRoot2D 是 Canvas 的父类；2D 可渲染要求 RenderRoot2D 父链 | 屏幕 UI 通常用 Canvas；严格要求是 RenderRoot2D |
| Canvas 组件直接持有设计分辨率与 Fit API | 官方 Canvas 文档将设计分辨率/适配放在项目设置 | 不生成虚构的 Canvas 适配字段或调用 |
| Layout `ResizeMode.NONE` 会隐藏溢出 | 官方 Layout 文档：NONE 不改变容器和子项尺寸 | 裁剪使用 Mask/ScrollView |
| Grid 使用 `axisDirection` | 3.8 引擎与官方 Layout 文档使用 `startAxis` | 使用 `startAxis` |
| Layout 与 Widget 绝不能共存 | 两者职责分别是排列直接子节点与对齐当前节点 | 允许共存，但禁止同轴竞争写入 |
| 3.8.x 后处理只有 BlitScreen/PostProcess 路径 | 3.8.4+ Builtin Pipeline 文档使用 Camera 的 BuiltinPipelineSettings | 先识别管线，再选配置路径 |

## 反模式

- 把搜索摘要、博客或模型记忆当作最终事实。
- 看到 3.8 文档 URL 就忽略页面内的 3.8.4+ 或管线限定。
- 用单一模板文件推断所有模板和所有版本。
- 把本机绝对路径、安装目录或临时 UUID 写进技能。
- 为了统一表述而隐藏未验证项和相反证据。
- 仅凭 `@requireComponent` 推断模板的序列化字段已经正确引用。

## 验证清单

- [ ] 关键结论是否至少有官方文档、源码/模板或 Creator 实测之一。
- [ ] 版本、渲染管线、平台和项目特有条件是否标注。
- [ ] 组件强依赖与模板序列化引用是否分开说明。
- [ ] 社区资料是否只作为线索，并回溯到一手来源。
- [ ] 文档链接是否指向 Creator 3.8 官方页面。
- [ ] 技能中是否不存在开发机绝对路径和临时环境信息。
- [ ] 已确认冲突是否进入纠错账本并同步修正旧卡。

## 适用条件

- 本技能统一覆盖 Creator 3.8.x，不按 3.8.0–3.8.8 建重复目录。
- 小版本确有行为差异时，用标签和局部注释披露，不复制整套知识。
- 当前项目查询结果优先于通用建议；项目特有行为不得反向写成 Creator 共性。

## 一手来源

- [Creator 3.8 官方手册](https://docs.cocos.com/creator/3.8/manual/en/)
- [RenderRoot2D](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/renderroot2d.html)
- [Prefab](https://docs.cocos.com/creator/3.8/manual/en/asset/prefab.html)
- [Layout](https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/layout.html)
- [3.8.4+ Builtin Pipeline 后处理](https://docs.cocos.com/creator/3.8/manual/en/render-pipeline/use-post-process.html)
