// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.getChatToolInfo = function (e) {
  return a.apply(this, arguments);
}, exports.getGroupEnterInfo = function (e) {
  return c.apply(this, arguments);
}, exports.showVersionTip = r;
var t = require("../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../@babel/runtime/helpers/asyncToGenerator"),
  o = e(require("./network/network"));
function r() {
  wx.showModal({
    content: "请更新微信版本",
    showCancel: !1,
    confirmColor: "#02BB00"
  }), wx.hideLoading();
}
function s(e) {
  wx.isChatTool ? wx.isChatTool() ? wx.exitChatTool({
    success: function () {
      wx.openChatTool(e);
    },
    fail: function (e) {
      console.error("!!! exitChatTool fail: ", e);
    }
  }) : wx.openChatTool(e) : r();
}
function a() {
  return (a = n(t().mark(function e(n) {
    var r,
      a,
      c,
      u,
      i,
      l,
      f = arguments;
    return t().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return r = f.length > 1 && void 0 !== f[1] ? f[1] : 1, a = f.length > 2 ? f[2] : void 0, c = f.length > 3 ? f[3] : void 0, e.prev = 1, e.next = 2, new Promise(function (e, t) {
            s({
              success: function (t) {
                a && a(t), e(t);
              },
              fail: function (e) {
                c && c(e), t(e);
              }
            });
          });
        case 2:
          return e.next = 3, new Promise(function (e, t) {
            wx.getChatToolInfo({
              success: function (t) {
                console.log("!!! wx.getChatToolInfo success", t), e(t);
              },
              fail: function (e) {
                console.log("!!! wx.getChatToolInfo fail", e), t(e);
              }
            });
          });
        case 3:
          return u = e.sent, e.next = 4, o.default.getActivityId({
            encryptedData: u.encryptedData,
            data: {
              room_id: n,
              business_type: r
            }
          });
        case 4:
          return i = e.sent, console.log("!!! getChatToolInfo res", i), e.abrupt("return", i);
        case 5:
          throw e.prev = 5, l = e.catch(1), console.error("主动获取聊天工具活动ID失败:", l), l;
        case 6:
        case "end":
          return e.stop();
      }
    }, e, null, [[1, 5]]);
  }))).apply(this, arguments);
}
function c() {
  return (c = n(t().mark(function e(n) {
    var r,
      s,
      a,
      c,
      u = arguments;
    return t().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return r = u.length > 1 && void 0 !== u[1] ? u[1] : 1, e.prev = 1, e.next = 2, new Promise(function (e, t) {
            wx.getGroupEnterInfo({
              allowSingleChat: !0,
              needGroupOpenID: !0,
              success: function (t) {
                console.log("!!! getGroupEnterInfo success", t), e(t);
              },
              fail: function (e) {
                console.log("!!! getGroupEnterInfo fail", e), t(e);
              }
            });
          });
        case 2:
          return s = e.sent, e.next = 3, o.default.getActivityId({
            encryptedData: s.encryptedData,
            data: {
              room_id: n,
              business_type: r
            }
          });
        case 3:
          return a = e.sent, console.log("!!! getGroupEnterInfo res", a), e.abrupt("return", a);
        case 4:
          throw e.prev = 4, c = e.catch(1), console.warn("群聊进入获取活动ID与群聊信息失败:", c), c;
        case 5:
        case "end":
          return e.stop();
      }
    }, e, null, [[1, 4]]);
  }))).apply(this, arguments);
}
