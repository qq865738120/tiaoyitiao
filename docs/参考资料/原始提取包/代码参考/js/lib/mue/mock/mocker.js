// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../../@babel/runtime/helpers/createClass"),
  r = require("../util");
exports.default = function () {
  return t(function t() {
    e(this, t), this.opt = {}, this.rules = [], this.origFn = null;
  }, [{
    key: "config",
    value: function (e) {
      this.opt = e || {};
    }
  }, {
    key: "enable",
    value: function () {
      this.origFn || this._hook && this._hook();
    }
  }, {
    key: "addRule",
    value: function (e) {
      this.rules.push(e);
    }
  }, {
    key: "applyCallback",
    value: function (e, t, n) {
      for (var i = arguments.length, a = new Array(i > 3 ? i - 3 : 0), u = 3; u < i; u++) a[u - 3] = arguments[u];
      if (e && t) {
        var s = n;
        "[object Function]" === (0, r.getTypeOf)(n) && (s = n()), a || (a = []), "[object Undefined]" !== (0, r.getTypeOf)(s) && a.unshift(s), t.apply(e, a);
      }
    }
  }, {
    key: "testMatch",
    value: function (e, t) {
      var n = (0, r.getTypeOf)(e),
        i = (0, r.getTypeOf)(t);
      switch (n) {
        case "[object Array]":
          if (n !== i) return !1;
          if (0 === e.length) {
            if (e.length !== t.length) return !1;
          } else for (var a = 0; a < e.length; a++) if (!this.testMatch(e[a], t[a])) return !1;
          break;
        case "[object Object]":
          if (n !== i) return !1;
          if (0 === Object.keys(e).length) {
            if (0 !== Object.keys(t).length) return !1;
          } else for (var u in e) if (!this.testMatch(e[u], t[u])) return !1;
          break;
        case "[object String]":
        case "[object Number]":
        case "[object Boolean]":
          if (n !== i) return !1;
          if (e !== t) return !1;
          break;
        case "[object RegExp]":
          if (!e.test(t)) return !1;
          break;
        case "[object Function]":
          if (!1 === e.call(e, t)) return !1;
      }
      return !0;
    }
  }]);
}();
