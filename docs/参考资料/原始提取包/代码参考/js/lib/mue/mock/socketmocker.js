// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../../../@babel/runtime/helpers/createForOfIteratorHelper"),
  c = require("../../../../@babel/runtime/helpers/classCallCheck"),
  l = require("../../../../@babel/runtime/helpers/createClass"),
  n = require("../../../../@babel/runtime/helpers/possibleConstructorReturn"),
  r = require("../../../../@babel/runtime/helpers/get"),
  a = require("../../../../@babel/runtime/helpers/getPrototypeOf"),
  o = require("../../../../@babel/runtime/helpers/inherits"),
  u = (require("../util"), e(require("./mocker"))),
  s = e(require("./sockettask"));
exports.default = function (e) {
  function u() {
    var e, t, l, r;
    return c(this, u), t = this, l = a(l = u), (e = n(t, function () {
      if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
      if (Reflect.construct.sham) return !1;
      if ("function" == typeof Proxy) return !0;
      try {
        return !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      } catch (e) {
        return !1;
      }
    }() ? Reflect.construct(l, r || [], a(t).constructor) : l.apply(t, r))).opt.delay = 0, e;
  }
  return o(u, e), l(u, [{
    key: "addRule",
    value: function (e) {
      e.connectSocket || (e.connectSocket = {}), r(a(u.prototype), "addRule", this).call(this, e);
    }
  }, {
    key: "_hook",
    value: function () {
      this.origFn || (this.origFn = wx.connectSocket, wx.connectSocket = this._connectSocket.bind(this));
    }
  }, {
    key: "_isMatchedConnectSocket",
    value: function (e, t) {
      return !(t.connectSocket.url && !this.testMatch(t.connectSocket.url, e.url)) && !(t.connectSocket.method && !this.testMatch(t.connectSocket.method));
    }
  }, {
    key: "_connectSocket",
    value: function (e) {
      var c,
        l = this,
        n = t(this.rules);
      try {
        var r,
          a = function () {
            var t = c.value;
            if (l._isMatchedConnectSocket(e, t)) {
              var n = new s.default(l, t);
              return t.connectSocket.success ? (l.applyCallback(wx, e.success, t.connectSocket.success), t.onOpen && setTimeout(function () {
                l.applyCallback(n, n._cb.onOpen, t.onOpen.res);
              }, t.onOpen.delay > 0 ? 1 * t.onOpen.delay : l.opt.delay)) : t.connectSocket.fail && l.applyCallback(wx, e.fail, t.connectSocket.fail), l.applyCallback(wx, e.complete, t.connectSocket.complete), {
                v: n
              };
            }
          };
        for (n.s(); !(c = n.n()).done && 0 !== (r = a());) if (r) return r.v;
      } catch (e) {
        n.e(e);
      } finally {
        n.f();
      }
      return this.origFn.call(wx, e);
    }
  }, {
    key: "_send",
    value: function (e) {
      var c,
        l = this,
        n = e._userOpt,
        r = t(e._rule.send);
      try {
        var a = function () {
          var t = c.value;
          if (l.testMatch(t.data, n.data)) return setTimeout(function () {
            t.success ? l.applyCallback(e, n.success, t.success) : t.fail && l.applyCallback(e, n.fail, t.fail), l.applyCallback(e, n.complete, t.complete), t.after && t.after.call(l, e);
          }, t.delay > 0 ? 1 * t.delay : l.opt.delay), 1;
        };
        for (r.s(); !(c = r.n()).done && !a(););
      } catch (e) {
        r.e(e);
      } finally {
        r.f();
      }
    }
  }, {
    key: "_close",
    value: function (e) {
      var t = this,
        c = e._userOpt,
        l = e._rule.close;
      l && setTimeout(function () {
        l.success ? t.applyCallback(e, c.success, l.success) : l.fail && t.applyCallback(e, c.fail, l.fail), t.applyCallback(e, c.complete, l.complete);
      }, l.delay > 0 ? 1 * l.delay : this.opt.delay);
    }
  }]);
}(u.default);
