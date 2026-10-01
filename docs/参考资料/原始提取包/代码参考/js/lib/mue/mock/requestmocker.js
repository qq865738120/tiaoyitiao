// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../../../@babel/runtime/helpers/createForOfIteratorHelper"),
  r = require("../../../../@babel/runtime/helpers/classCallCheck"),
  l = require("../../../../@babel/runtime/helpers/createClass"),
  u = require("../../../../@babel/runtime/helpers/possibleConstructorReturn"),
  a = require("../../../../@babel/runtime/helpers/getPrototypeOf"),
  i = require("../../../../@babel/runtime/helpers/inherits"),
  n = (require("../util"), e(require("./mocker")));
exports.default = function (e) {
  function n() {
    var e, t, l, i;
    return r(this, n), t = this, l = a(l = n), (e = u(t, function () {
      if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
      if (Reflect.construct.sham) return !1;
      if ("function" == typeof Proxy) return !0;
      try {
        return !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      } catch (e) {
        return !1;
      }
    }() ? Reflect.construct(l, i || [], a(t).constructor) : l.apply(t, i))).opt.delay = 100, e;
  }
  return i(n, e), l(n, [{
    key: "_hook",
    value: function () {
      var e = this;
      this.origFn || (this.origFn = wx.request, wx.request = function (r) {
        if (0 !== e.rules.length) {
          var l,
            u = !1,
            a = t(e.rules);
          try {
            var i = function () {
              var t = l.value;
              if (e._isMatched(r, t)) return setTimeout(function () {
                t.success ? e.applyCallback(wx, r.success, t.success, t.statusCode || 200, t.header || {}) : t.fail && e.applyCallback(wx, r.fail, t.fail), e.applyCallback(wx, r.complete, t.complete);
              }, t.delay > 0 ? 1 * t.delay : e.opt.delay), u = !0, 1;
            };
            for (a.s(); !(l = a.n()).done && !i(););
          } catch (e) {
            a.e(e);
          } finally {
            a.f();
          }
          u || e.origFn.call(wx, r);
        }
      });
    }
  }, {
    key: "_isMatched",
    value: function (e, t) {
      return !(t.url && !this.testMatch(t.url, e.url)) && !(t.data && !this.testMatch(t.data, e.data));
    }
  }]);
}(n.default);
