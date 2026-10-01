// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.hideMiniGameCenter = function () {
  GameGlobal.minigameCenter && GameGlobal.minigameCenter.hide();
}, exports.showMiniGameCenter = function () {
  GameGlobal.minigameCenter && GameGlobal.minigameCenter.show();
};
