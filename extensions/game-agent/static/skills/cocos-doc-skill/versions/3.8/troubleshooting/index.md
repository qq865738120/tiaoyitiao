# Troubleshooting

本目录用于存放 Cocos Creator 3.8 常见错误现象与排查路径。

## 组件与节点

- [getComponent 返回 null](null-component.md) — 组件获取为空
- [UI 不显示](ui-not-visible.md) — 节点/界面不显示
- [Button 点击不生效](button-not-clickable.md) — 按钮点不了
- [点击穿透](click-through.md) — 弹窗挡不住点击
- [Prefab 实例化失败](prefab-instantiate-failed.md) — 预制体生成失败

## 资源与加载

- [资源加载失败](resource-load-failed.md) — 资源/路径错误

## 动画与音频

- [动画不播放](animation-not-playing.md) — 动画没效果
- [动画事件不触发](animation-event-not-fired.md) — 事件帧回调未调用
- [音频不播放](audio-not-playing.md) — 音效没声音

## 输入与坐标

- [输入不触发](input-not-triggered.md) — 键盘/触摸/鼠标无响应
- [坐标转换不对](coordinate-conversion-wrong.md) — 位置/坐标错误

## 渲染与着色器

- [3D 对象不可见](3d-object-not-visible.md) — 模型不显示/全黑
- [材质不更新](material-not-updated.md) — setProperty 不生效
- [Shader 编译失败](shader-compile-failed.md) — 着色器/Effect 编译出错
- [材质破坏合批](material-breaks-batching.md) — DrawCall 高/合批异常

## 物理

- [碰撞不触发](collision-not-triggered.md) — 2D 碰撞回调
- [3D 物理不触发](physics-3d-not-triggered.md) — onCollisionEnter 不回调

## 性能

- [性能问题](performance-issues.md) — 卡顿/帧率低/内存上涨
- [帧率低](frame-rate-low.md) — 掉帧/FPS 不达标
- [内存泄漏](memory-leak.md) — 内存持续上涨/不释放

## 构建与发布

- [构建报错](build-errors.md) — 通用打包/发布失败分诊
- [Web 构建失败](build-web.md) — Web Desktop/Mobile 构建异常
- [Android 构建失败](build-android.md) — Gradle/SDK/签名问题
- [iOS 构建失败](build-ios.md) — Xcode/CocoaPods/签名问题
- [微信小游戏构建失败](build-wechat-game.md) — 包体/分包/AppID
- [包体太大](package-too-large.md) — 首包/主包超限

## 多媒体

- [VideoPlayer/WebView 不工作](video-webview-not-working.md) — 视频或网页异常

## 渲染与纹理

- [RenderTexture Android blendState 报错](render-texture-blend-state.md) — 场景切换后 SpriteFrame 显示异常

## 原生与热更新

- [热更新失败](hot-update-failed.md) — 热更不生效/下载失败
- [JSB 通信失败](jsb-bridge-failed.md) — 原生通信异常

## 音频兼容

- [音频格式兼容](audio-format-compat.md) — 平台音频格式/音量限制问题
