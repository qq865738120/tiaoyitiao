// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = exports.MueEvent = exports.EventCenter = void 0;
var e = require("../../../@babel/runtime/helpers/createForOfIteratorHelper"),
  t = require("../../../@babel/runtime/helpers/classCallCheck"),
  n = require("../../../@babel/runtime/helpers/createClass"),
  r = exports.MueEvent = function () {
    return n(function e(n) {
      t(this, e), this.type = n, this.defaultPrevented = !1, this.timeStamp = Date.now();
    }, [{
      key: "preventDefault",
      value: function () {
        this.defaultPrevented = !0;
      }
    }]);
  }(),
  i = new (exports.EventCenter = function () {
    return n(function e() {
      t(this, e), console.log("!!! EventCenter constructor"), this.listener = {};
    }, [{
      key: "emit",
      value: function (e) {
        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
        this._emit.apply(this, [!1, e].concat(n));
      }
    }, {
      key: "emitSync",
      value: function (e) {
        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
        this._emit.apply(this, [!0, e].concat(n));
      }
    }, {
      key: "_emit",
      value: function (t, n) {
        for (var i = this, s = arguments.length, l = new Array(s > 2 ? s - 2 : 0), o = 2; o < s; o++) l[o - 2] = arguments[o];
        if ("CHECK_GAME" != n && "SEND_CHECK_GAME" != n && "SEND_REALTIME_MSG_TO_CTRL" != n && "SEND_REALTIME_MSG" != n && console.log("触发事件", n), this.listener[n]) {
          var a = new r(n),
            u = function () {
              for (var t in i.listener[n]) {
                var r,
                  s = e(i.listener[n][t]);
                try {
                  for (s.s(); !(r = s.n()).done;) {
                    var o = r.value;
                    o.call.apply(o, [o, a].concat(l));
                  }
                } catch (e) {
                  s.e(e);
                } finally {
                  s.f();
                }
              }
              i.listener[n].one = [];
            };
          t ? u.call(this) : this._async(u);
        }
      }
    }, {
      key: "on",
      value: function (e, t) {
        this._addListener(e, "on", t);
      }
    }, {
      key: "one",
      value: function (e, t) {
        this._addListener(e, "one", t);
      }
    }, {
      key: "off",
      value: function (e, t) {
        var n = this;
        this.listener[e] && this._async(function () {
          if (t) {
            var r = t.toString();
            for (var i in n.listener[e]) for (var s = 0; !(s >= n.listener[e][i].length);) r === n.listener[e][i][s].toString() && (n.listener[e][i].splice(s, 1), s--), s++;
          } else n.listener[e] = {
            on: [],
            one: []
          }, delete n.listener[e];
        });
      }
    }, {
      key: "_addListener",
      value: function (e, t, n) {
        this.listener[e] || (this.listener[e] = {
          on: [],
          one: []
        }), this.listener[e][t].push(n);
      }
    }, {
      key: "_async",
      value: function (e) {
        var t = this;
        setTimeout(function () {
          e.call(t);
        }, 0);
      }
    }]);
  }())();
exports.default = i;
