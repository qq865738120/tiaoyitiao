// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.customAnimation = exports.TweenAnimation = void 0;
var n = e(require("./tween")),
  t = -1,
  o = t - 1,
  r = {};
(exports.customAnimation = {}).to = function (e, n, o) {
  n *= 1e3;
  o.delay;
  for (var r in o) if ("delay" === r) ;else if ("onComplete" === r || "onEnded" === r) ;else if ("ease" === r) ;else if ("name" === r) ;else if (o.delay || 0 !== n) {
    var a = ++t;
    setTimeout(function (t) {
      return function () {
        i(e[t], o[t], n, o.ease || "Linear", function (n, r, i) {
          i && o.onEnded && o.onEnded(), void 0 !== n && (e[t] = n), r && o.onComplete && o.onComplete();
        }, o.name, a);
      };
    }(r), 1e3 * (o.delay || 0));
  } else e[r] = o[r], o.onComplete && o.onComplete(), o.onEnded && o.onEnded();
};
var i = exports.TweenAnimation = function (e, i, a, l, s, u, f) {
  f = f || ++t;
  u && (r[u] || (r[u] = []), r[u].push(f));
  var c = function (e) {
      return "function" == typeof e;
    },
    d = function (e) {
      return "number" == typeof e;
    },
    m = function (e) {
      return "string" == typeof e;
    },
    p = function (e) {
      return "[object Array]" == Object.prototype.toString.call(e);
    },
    v = function (e) {
      if (d(e)) return e;
      if (m(e)) {
        if (/\d+m?s$/.test(e)) return /ms/.test(e) ? 1 * e.replace("ms", "") : 1e3 * e.replace("s", "");
        if (/^\d+$/.test(e)) return +e;
      }
      return -1;
    };
  d(e) && d(i) || p(e) && p(i) || window.console && console.error("from和to两个参数必须且为数值");
  var g = !1;
  p(e) && p(i) && (g = !0);
  var w = n.default;
  if (!w) return window.console && console.error("缓动算法函数缺失"), 0;
  var b = {
      duration: 300,
      easing: "Linear",
      callback: function () {}
    },
    y = function (e) {
      c(e) ? b.callback = e : -1 != v(e) ? b.duration = v(e) : m(e) && (b.easing = e);
    };
  y(a), y(l), y(s), window.requestAnimationFrame || (requestAnimationFrame = function (e) {
    setTimeout(e, 17);
  });
  var A = -1,
    h = Math.ceil(b.duration / 17);
  b.easing = b.easing.slice(0, 1).toUpperCase() + b.easing.slice(1);
  var k,
    q = b.easing.split(".");
  if (1 == q.length ? k = w[q[0]] : 2 == q.length && (k = w[q[0]] && w[q[0]][q[1]]), 0 != c(k)) {
    var x = Date.now(),
      C = Date.now(),
      E = function () {
        var n = Date.now(),
          t = n - C,
          a = Math.ceil(1e3 / t);
        if (C = n, t > 100) requestAnimationFrame(E);else {
          if (a >= 30) A++;else {
            var l = Math.floor((n - x) / 17);
            A = l > A ? l : A + 1;
          }
          var s;
          if (g) {
            s = [];
            for (var c = 0, d = e.length; c < d; ++c) s.push(k(A, e[c], i[c] - e[c], h));
          } else s = k(A, e, i - e, h);
          if (A <= h && f > o) {
            if (u && r[u] && r[u].indexOf(f) < 0) return;
            b.callback(s), requestAnimationFrame(E);
          } else if (A > h && f > o) {
            if (u && r[u] && r[u].indexOf(f) < 0) return;
            b.callback(i, !0, !0);
          } else b.callback(void 0, !1, !0);
        }
      };
    E();
  } else console.error('没有找到名为"' + b.easing + '"的动画算法');
};
i.kill = function (e) {
  r[e] = [];
}, i.killAll = function () {
  for (var e in o = t, r) r[e] = [];
};
