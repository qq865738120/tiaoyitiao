// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.inQQ = exports.checkUpdate = void 0, exports.throttleEvent = function (e) {
  var o = e.eventName,
    t = e.callback,
    a = e.args,
    n = e.throttleTime,
    c = void 0 === n ? 1e3 : n;
  if (d.has(o)) return void console.log("[throttleEvent] eventName:", o);
  d.set(o, t), t(a), setTimeout(function () {
    d.delete(o);
  }, c);
};
var e,
  o,
  t = require("./../config"),
  a = wx.getAppBaseInfo ? wx.getAppBaseInfo() : null,
  n = a ? null === (e = a.host) || void 0 === e ? void 0 : e.appId : "";
exports.inQQ = "wxf0a80d0ac2e82aa7" === n || "wxf14070172bb44e41" === n || "wxdd5cdc32195da4fc" === n;
"function" == typeof wx.getUpdateManager && (o = wx.getUpdateManager());
exports.checkUpdate = function () {
  var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
  return new Promise(function (a, n) {
    if (0 == e && n(), o) try {
      console.log("can use updateManager"), o.onCheckForUpdate(function (e) {
        console.log("onCheckForUpdate"), e.hasUpdate ? (console.log("hasUpdate"), wx.showLoading({
          mask: !0,
          title: "正在努力更新中～"
        })) : (console.log("dontHasUpdate"), n());
      }), o.onUpdateReady(function () {
        console.log("updateReady"), wx.hideLoading(), o.applyUpdate();
      }), o.onUpdateFailed(function () {
        console.log("updateFail"), wx.hideLoading(), n();
      });
    } catch (e) {
      d();
    } else d();
    function d() {
      e == t.VERSION ? a() : n();
    }
  });
};
var d = new Map();
