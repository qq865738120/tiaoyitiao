// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.createMiniGameCenter = function (e, o) {
  try {
    if ("undefined" != typeof requirePlugin) {
      var r = new (0, requirePlugin("MiniGameCenter", {
        enableRequireHostModule: !0,
        customEnv: {
          wx: wx
        }
      }).default)(e);
      void 0 === r || void 0 === r.on ? console.error("minigameCenter create error") : (r.on("ready", function () {
        GameGlobal.minigameCenter = r, o();
      }), r.on("error", function (e) {
        console.log("插件初始化失败", e);
      }));
    }
  } catch (e) {
    console.error(e);
  }
}, exports.initMiniGameCommon = function () {
  try {
    if ("undefined" != typeof requirePlugin) {
      var e = (0, requirePlugin("MiniGameCommon", {
        enableRequireHostModule: !0,
        customEnv: {
          wx: wx
        }
      }).default)();
      void 0 === e || void 0 === e.canIUse ? console.error("miniGameCommon create error") : GameGlobal.miniGameCommon = e;
    }
  } catch (e) {
    console.error(e);
  }
};
