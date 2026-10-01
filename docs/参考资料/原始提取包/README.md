# 跳一跳素材解析与 Cocos 学习说明

本目录来自本机微信电脑版下载的 **跳一跳** 游戏包，AppID 为 `wx7c8d593b2c3a7703`，缓存包版本目录为 `112`，读取日期为 **2026-09-30**。代码中业务版本是 `4.0.6`，实际内置 Three.js 的 `REVISION` 为 `88dev`；这些版本号含义不同。

微信原始文件保持不变。所有还原、裁切和转换都在副本上进行，原包、副本、还原包和逐文件内容均记录 SHA-256。

## 从哪里开始

1. 打开 `素材浏览.html`：可搜索图片、试听全部 22 段音频、旋转查看 46 个静态模型，也可下载当前 GLB。浏览器需支持 WebGL；页面依赖的文件均在本目录，不需要远程服务。
2. 打开 `图片总览.jpg` 快速看完全部 162 张原始图片。
3. 从 `游戏资源/res/` 取原始图片、MP3 和 `num.ttf`，从 `派生模型/` 取角色与跳台模型。
4. 查看 `素材清单.csv`，按文件名、尺寸、音频时长以及引用它的代码模块定位用途。

## 已提取与派生的内容

| 内容 | 数量 | 位置与来源 |
| --- | ---: | --- |
| 原包文件 | 190 | `游戏资源/`，完整保留包内文件结构 |
| 原始 PNG | 157 | `游戏资源/res/`，含角色贴图、跳台贴图、阴影、标题、按钮和 UI |
| 原始 JPG | 5 | `游戏资源/res/2d/` |
| 原始 MP3 | 22 | `游戏资源/res/`，落地、失败、蓄力、连击、特殊跳台等 |
| 原始 TTF | 1 | `游戏资源/res/num.ttf`，99 个 glyph；字形覆盖以字体实际内容为准 |
| 原始 JSON 与 JS | 4 + 1 | 配置、依赖记录、完整 `game.js` |
| 格式化代码模块 | 154 | `代码参考/`，从原包 define 模块拆分，属于派生学习参考 |
| 本地跳台静态 GLB | 36 | `派生模型/block_00.glb` 至 `block_35.glb` |
| 数字跳台静态 GLB | 7 | `派生模型/numbered_block_0.glb` 至 `numbered_block_6.glb` |
| 默认角色与配件 GLB | 3 | `bottle_default.glb`、`accessory_scarf.glb`、`accessory_hat.glb` |
| 数字图集裁切 PNG | 8 | `图集拆分/number/`，原图仍在 `res/number.png` |
| 渐变背景派生 PNG | 7 | `派生背景/`，依据 `js/ground.js` 中 shader 的两端颜色生成 |
| 内嵌轮廓字体 JSON | 1 | `字体参考/embedded-font.typeface.json`，静态读取 `js/font.js` 的字形对象 |

另外保存了本机缓存中的两个共享插件：`MiniGameCenter`（版本目录 183）与 `MiniGameCommon`（版本目录 65、66），共 8 个包内文件，在 `共享插件参考/` 中。它们是微信插件代码与配置，**不计入跳一跳的 190 个主包文件和 162 张图片**。主包配置使用 `latest`，单凭缓存无法确认运行时实际选用的 Common 版本，因此保留两份，并记录来源。

`应用图标/` 为游戏缓存图标；`参考截图/` 是用户提供的截图，不属于解包素材。

## Cocos 复刻时建议先使用的素材

| 用途 | 文件 |
| --- | --- |
| 角色 | `派生模型/bottle_default.glb`；原贴图 `res/head.png`、`res/middle.png`、`res/bottom.png` |
| 起始跳台 | `派生模型/block_00.glb`；其他本地跳台按编号浏览 |
| 游戏标题 | `游戏资源/res/title.png` |
| 开始与重开按钮 | `游戏资源/res/play.png`、`replay.png` |
| 计分数字 | `游戏资源/res/num.ttf`；`0.png` 至 `9.png`为原平台钟面贴图，不作为HUD字库 |
| 阴影 | `shadow.png`、`cylinder_shadow.png`、`desk_shadow.png`、`stool_shadow.png` |
| 蓄力声音 | `scale_intro.mp3`、`scale_loop.mp3` |
| 成功与失败 | `success.mp3`、`perfect.mp3`、`fall.mp3`、`fall_2.mp3` |
| 连击声音 | `combo1.mp3` 至 `combo8.mp3` |

学习导入时，可以把所需 `res` 文件复制到自己的 Cocos 项目 `assets/jump/res/`，再导入所需 GLB；让 Creator 自行生成 `.meta`。2D UI 图片与 3D 贴图的导入设置用途不同，请分别检查 SpriteFrame、纹理过滤、透明与材质设置。本目录不包含 Cocos 场景、Prefab 或 Cocos 运行脚本；**本次没有实际执行 Creator GUI 导入、保存重开或运行验收**。

## 模型怎样还原

原包没有独立 FBX、OBJ 或 GLB。角色和跳台是由 `js/bottle.js`、`js/block.js` 使用球、柱、方块、圆环与平面几何在运行时组装的。派生 GLB 按原代码默认构造导出，保留网格层级、变换、面 UV 与原包纹理；仅允许几何相关模块运行，禁用网络、真实计时器与游戏启动流程。

模型保持默认尺寸和静态姿态。默认角色不包含分数文本和临时粒子；隐藏配件单独导出。跳台保留默认可见结构和贴片阴影。动画、蓄力缩放、随机尺寸与换色、服务器皮肤，以及微信 UI 由复刻工程自行实现。GLB 的材质表达与原版 Three.js 灯光、混合效果可能有差异，不能视作像素级视觉还原。

两个旧 PNG（`box_middle.png`、`well.png`）携带自定义色彩元数据。为使派生模型兼容标准读取器，其嵌入纹理使用去除这些元数据的 RGBA 副本，像素保持一致；兼容副本位于 `派生模型/纹理兼容副本/`，原始 PNG 未改动。

模型格式依据 [glTF 2.0 规范](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)；46 个 GLB 经 Khronos glTF Validator 检查，**0 错误、0 警告**。报告中的默认矩阵与非 2 次幂纹理属于 info 提示，不等于 Creator 验收。

## 本地包未包含的内容

这次完整解析的是**本机已经下载的主包与相关插件缓存**，不是服务器历史资源全集。

- `res/store.mp3` 与 `res/water.mp3` 有代码引用，但主包没有这两个文件；未生成假音频或替代文件。
- `js/skin.js` 与角色皮肤控制器显示，皮肤、活动贴图和部分广告资源由服务器动态下发。在本 AppID 的当前本地目录没有找到这些下载资源文件，因此不能从该缓存恢复全部历史或未加载皮肤。
- 网络头像、排行榜数据、活动内容和微信宿主的界面元素不能等同于固定的包内游戏素材。
- 渐变背景由 shader 生成；跳跃与特效主要由代码和基础几何生成，不存在对应的完整动画序列帧文件。相关代码和参数已保留，不能把派生静态模型当成动画资源。

## 复刻参数与代码入口

`报告/game-constants.json` 收录原版角色、跳台、重力、声音映射和本地跳台编号。原代码的基础跳台半径为 5、高为 5.5，角色头半径为 0.945，重力为 720，属于原工程自身的数值尺度；需要在自己的 Cocos 工程中统一单位和相机尺度。

重点读：`代码参考/js/bottle.js`（角色与跳跃）、`js/block.js`（36 种跳台）、`js/config.js`（参数）、`js/ground.js`（背景 shader）、`js/index.js`（游戏组织）。这些参考代码依赖微信与原版 Three.js，不能直接作为 Cocos 脚本运行。

## 校验与来源

- `报告/packages.json`：原始包路径、缓存版本、头结构、字节数、偏移和哈希。
- `报告/resource-manifest.json`、`素材清单.csv`：190 个主包文件的格式、大小、哈希、图片尺寸、音频时长和代码引用。
- `报告/derived-models.json`、`model-validation.json`：模型来源、纹理、三角形数及格式校验。
- `报告/atlas-regions.json`、`background-palettes.json`、`texture-normalization.json`：裁切与转换依据。
- `报告/missing-resources.json`：确切缺失的固定包内引用。
- `报告/shared-plugins.json`：共享插件的独立来源和清单。
- `报告/verification-summary.json`：媒体、字体、模型与原始文件保持不变的检查结果。

图片全部可解码，22 个音频均由 macOS 音频读取器解析，TTF 已通过表边界、校验和与 FreeType 加载检查。wxapkg 头、索引、文件范围、路径与重叠均完成校验。

## 2026-09-30 素材修正版

本工程中的43个平台派生GLB已修正阴影的透明混合模式，离线浏览器使用相同修正版；原始微信包、原始媒体和几何/UV/纹理像素保持不变。数字图集源区域按图片坐标保留，数字含义见 `报告/atlas-regions.json`；当前资源目录使用 digit_1—7 与 unused_blank 命名。numbered_block_0—6 是原代码索引，实际显示数字1—7。详见项目 `docs/素材修正报告.md`。
