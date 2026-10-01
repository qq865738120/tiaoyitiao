---
id: cocos-3.8-troubleshooting-build-ios
version: "3.8"
category: troubleshooting
title: iOS 构建失败
keywords:
  - iOS 构建失败
  - Xcode 构建失败
  - Xcode 编译错误
  - iOS 签名错误
  - iOS 证书
  - iOS Provisioning Profile
  - iOS 闪退
  - CocoaPods 报错
  - iOS 模拟器无法运行
  - iOS 真机调试
  - iOS Bundle Identifier
  - iOS Metal 渲染
  - App Store 上传失败
  - Xcode 26.5
  - Xcode 26 构建报错
  - enoki/half.h
  - iOS deployment target
  - iOS 黑屏
  - iOS 运行黑屏
  - building for iOS, but linking in dylib built for iOS Simulator
related_docs:
  - troubleshooting/build-ios-xcode.md
  - troubleshooting/build-errors.md
  - troubleshooting/build-android.md
  - recipes/command-line-build.md
related_api: []
source:
  official: "Cocos Creator 3.8 官方文档 - 构建发布 - iOS 平台"
  verified-against: []
  supplement:
    - "工程经验：iOS 构建失败需从 Xcode 版本、签名配置、CocoaPods 和证书四个维度排查"
status: needs-review
updated: 2026-06-18
---

# iOS 构建失败

> **此文档标记为 needs-review**：iOS 构建涉及 Xcode 版本兼容性、签名界面变化、Apple 政策更新，以 Cocos Creator 3.8 官方文档和 Apple 最新发布说明为准。

## 现象

构建 iOS 平台时报错中断，或构建产物在 Xcode 中编译失败，或在 iOS 设备上运行出现闪退、黑屏，或在 App Store Connect 审核被拒。

## 一级分诊路径（按大概率到小概率排序）

1. **开发环境未配置** — Xcode 版本不兼容、未安装命令行工具。
2. **签名和证书问题** — Apple Developer 证书、Provisioning Profile 配置错误或过期。
3. **CocoaPods 集成失败** — 第三方 SDK 的 Pod 依赖安装失败或版本冲突。
4. **Xcode 版本不兼容** — 版本太旧或太新，与 Cocos Creator 3.8 不兼容。
5. **Bundle Identifier 配置错误** — 包名格式不正确或与证书不匹配。

## 快速检查

### 环境依赖

- **[ ] Xcode**：建议 Xcode 14 及以上。Xcode 16+ 需确认兼容性（签名界面有变化）。
- **[ ] Xcode Command Line Tools**：终端执行 `xcode-select --install` 安装。
- **[ ] CocoaPods**：如果使用了依赖 CocoaPods 的 SDK，执行 `pod --version` 确认已安装。
  - Apple Silicon Mac：`brew install cocoapods`
  - 通用：`sudo gem install cocoapods`
- **[ ] Apple Developer 账户**：确认有效且已加入正确的团队。

### 构建日志

- **编辑器构建日志**：点击构建任务日志按钮查看资源打包、脚本编译阶段。
- **Xcode 构建日志**：用 Xcode 打开 `build/<任务名>/proj/` 中的 `.xcworkspace`（使用 CocoaPods 时）或 `.xcodeproj`，在 **Report Navigator** 或 **Issue Navigator** 中查看。

### 签名与证书

- **[ ] Xcode Signing & Capabilities 面板中 Team 选择正确。
- **[ ] Bundle Identifier 与证书匹配（格式：`com.mycompany.myproduct`）。
- **[ ] Provisioning Profile 未过期。
- **[ ] 自动签名时，Xcode Preferences → Accounts 已登录。
- **[ ] 新设备真机调试：已将 UDID 加入 Provisioning Profile。

### 其他快速检查

- **[ ] 使用 CocoaPods 时必须打开 `.xcworkspace` 而非 `.xcodeproj`。
- **[ ] CocoaPods 失败时在 `proj/` 下执行 `pod install --repo-update` 重新安装。
- **[ ] 渲染后端 iOS 仅支持 METAL。
- **[ ] 最低目标系统 iOS 12.0。
- **[ ] 运行时闪退：连接设备到 Xcode，查看 Window → Devices and Simulators 设备日志。

## 仍未解决时

确认问题类别后，进入对应子页获取详细排查步骤：

- **Xcode 版本兼容性、编译错误、运行黑屏** → [build-ios-xcode.md](./build-ios-xcode.md)
- **签名配置、CocoaPods 详细集成** → 回看本页解决方案部分
- **运行时闪退排查** → 连接 Xcode 通过 Devices and Simulators 查看崩溃日志
- **构建后 App Store 审核被拒** → 检查是否使用私有 API、缺隐私权限说明、32 位支持等

参考官方文档：
- [iOS 平台构建选项](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/ios/build-options-ios.html)
- [安装配置原生开发环境](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/setup-native-development.html)

## 相关文档

- [iOS Xcode 版本兼容性 / 编译错误](./build-ios-xcode.md)
- [Android 构建失败](./build-android.md)
- [构建错误分诊](./build-errors.md)
- [命令行构建](../recipes/command-line-build.md)
