// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.changeCanvasType = function (e) {
  p = e;
}, exports.createUserInfoButton = function (e, n, t, o) {
  var i = t.x,
    c = t.y,
    u = t.width,
    s = t.height;
  if (x[e]) return void w(e);
  var a = p;
  d(!1, !1).catch(function () {
    if (a === p) {
      var t = (0, r.getSystemInfo)(),
        f = t.screenWidth / r.DESIGN_WIDTH,
        h = t.screenHeight / r.DESIGN_HEIGHT,
        l = 0,
        I = 0,
        g = 0;
      t.screenWidth / t.screenHeight < r.DESIGN_WIDTH / r.DESIGN_HEIGHT && (l = (t.screenHeight - r.DESIGN_HEIGHT * t.screenWidth / r.DESIGN_WIDTH) / 2, h = t.screenWidth / r.DESIGN_WIDTH, I = i - r.DESIGN_WIDTH / 2), t.screenWidth / t.screenHeight > r.DESIGN_WIDTH / r.DESIGN_HEIGHT && (g = t.screenWidth / (r.DESIGN_WIDTH * t.screenHeight / r.DESIGN_HEIGHT), I = (i - r.DESIGN_WIDTH / 2) / g), x[e] = 0 === n ? wx.createUserInfoButton({
        type: "image",
        style: {
          left: (r.DESIGN_WIDTH / 2 + I) * f - u * h / 2,
          top: l + c * h - s * h / 2,
          width: u * h,
          height: s * h,
          backgroundColor: "rgba(255, 0, 0, 0)"
        }
      }) : wx.createUserInfoButton({
        type: "image",
        style: {
          left: i * h,
          top: c * h,
          width: u * h,
          height: s * h,
          backgroundColor: "rgba(255, 0, 0, 0)"
        }
      }), x[e].onTap(function (e) {
        e.errMsg.indexOf(":ok") > -1 && e.rawData && (v(), o && o());
      });
    }
  });
}, exports.getAuthUserInfo = d, exports.getAuthWxFriendInteraction = function () {
  var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
  return I("WxFriendInteraction", e);
}, exports.hideUserInfoButton = function () {
  for (var e in x) x[e] && x[e].hide();
}, exports.needAuthorization = h, exports.requirePrivacyAuthorize = f, exports.scope = void 0, exports.showUserInfoButton = w;
var n = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../config"),
  o = e(require("../lib/mue/eventcenter")),
  i = exports.scope = {
    WxFriendInteraction: !1,
    userInfo: !1
  },
  c = {
    WxFriendInteraction: "需要先授权微信朋友关系",
    userInfo: "需要先授权用户信息"
  },
  u = {
    WxFriendInteraction: null,
    userInfo: null
  },
  s = !1,
  a = 0;
function f() {
  return new Promise(function (e, n) {
    wx.requirePrivacyAuthorize ? Date.now() - a < 3e3 ? n() : (a = Date.now(), wx.requirePrivacyAuthorize({
      success: function () {
        e("");
      },
      fail: function () {
        n();
      }
    })) : n();
  });
}
function h() {
  return new Promise(function (e, n) {
    wx.getPrivacySetting || n(""), wx.getPrivacySetting({
      success: function (t) {
        t.needAuthorization ? e("") : n();
      },
      fail: function () {
        n();
      }
    });
  });
}
function l(e, n, t, r, o) {
  wx.authorize({
    scope: "scope.".concat(e)
  }).then(function () {
    r("");
  }).catch(function (i) {
    i.errMsg.indexOf("not authorized in gap") > -1 && (s ? wx.showToast({
      icon: "none",
      title: "授权失败，请稍后再试"
    }) : (s = !0, wx.getPrivacySetting({
      success: function (e) {
        e.needAuthorization || wx.showToast({
          icon: "none",
          title: "授权失败，请稍后再试"
        });
      }
    }))), i.errMsg.indexOf("auth deny") > -1 && t && !1 === n ? wx.showModal({
      content: c[e],
      confirmText: "去授权",
      success: function (n) {
        n.confirm ? wx.openSetting({
          success: function (n) {
            !0 === n.authSetting["scope.".concat(e)] ? r("") : o();
          },
          fail: function () {
            o();
          }
        }) : o();
      },
      fail: function () {
        o();
      }
    }) : o();
  });
}
function I(e) {
  return g.apply(this, arguments);
}
function g() {
  return (g = t(n().mark(function e(t) {
    var o,
      c,
      s,
      a = arguments;
    return n().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return o = !(a.length > 1 && void 0 !== a[1]) || a[1], c = !(a.length > 2 && void 0 !== a[2]) || a[2], console.log("!!! getAuth", t, o, c), e.next = 1, (0, r.getSetting)(!0);
        case 1:
          if (s = e.sent, console.log("!!! getAuth res", s), !u[t]) {
            e.next = 2;
            break;
          }
          return e.abrupt("return", u[t]);
        case 2:
          return u[t] = new Promise(function (e, n) {
            var r = s.authSetting["scope.".concat(t)];
            !0 !== r ? h().then(function () {
              c ? f().then(function () {
                l(t, r, o, e, n);
              }).catch(function () {
                n();
              }) : n();
            }).catch(function () {
              l(t, r, o, e, n);
            }) : e("");
          }).then(function () {
            return i[t] = !0, Promise.resolve("");
          }).catch(function () {
            return i[t] = !1, Promise.reject();
          }).finally(function () {
            u[t] = null;
          }), e.abrupt("return", u[t]);
        case 3:
        case "end":
          return e.stop();
      }
    }, e);
  }))).apply(this, arguments);
}
function d() {
  var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0],
    n = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
  return I("userInfo", e, n);
}
var p = null;
var x = {};
function v() {
  for (var e in x) x[e] && (x[e].destroy(), x[e] = null);
}
function w(e) {
  x[e].show();
}
o.default.on(r.EVENT.INIT_SETTING_COMPLETE, function () {
  console.log("!!! EventCenter.on getAuthUserInfo"), d(!1, !1).then(function () {
    v();
  });
});
