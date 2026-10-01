// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return i(function i(s, e, o) {
    t(this, i), this._m = s, this._k = e, this._c = o, this._solution = null, this._endPosition = 0, this._startTime = 0;
  }, [{
    key: "_solve",
    value: function (t, i) {
      var s = this._c,
        e = this._m,
        o = this._k,
        n = s * s - 4 * e * o;
      if (0 == n) {
        var h = t,
          a = i / ((l = -s / (2 * e)) * t);
        return {
          x: function (t) {
            return (h + a * t) * Math.pow(Math.E, l * t);
          },
          dx: function (t) {
            var i = Math.pow(Math.E, l * t);
            return l * (h + a * t) * i + a * i;
          }
        };
      }
      if (n > 0) {
        var r = (-s - Math.sqrt(n)) / (2 * e),
          u = (-s + Math.sqrt(n)) / (2 * e);
        h = t - (a = (i - r * t) / (u - r));
        return {
          x: function (t) {
            var i, s;
            return t === this._t && (i = this._powER1T, s = this._powER2T), this._t = t, i || (i = this._powER1T = Math.pow(Math.E, r * t)), s || (s = this._powER2T = Math.pow(Math.E, u * t)), h * i + a * s;
          },
          dx: function (t) {
            var i, s;
            return t === this._t && (i = this._powER1T, s = this._powER2T), this._t = t, i || (i = this._powER1T = Math.pow(Math.E, r * t)), s || (s = this._powER2T = Math.pow(Math.E, u * t)), h * r * i + a * u * s;
          }
        };
      }
      var l,
        _ = Math.sqrt(4 * e * o - s * s) / (2 * e);
      h = t, a = (i - (l = -s / 2 * e) * t) / _;
      return {
        x: function (t) {
          return Math.pow(Math.E, l * t) * (h * Math.cos(_ * t) + a * Math.sin(_ * t));
        },
        dx: function (t) {
          var i = Math.pow(Math.E, l * t),
            s = Math.cos(_ * t),
            e = Math.sin(_ * t);
          return i * (a * _ * s - h * _ * e) + l * i * (a * e + h * s);
        }
      };
    }
  }, {
    key: "x",
    value: function (t) {
      return null == t && (t = (new Date().getTime() - this._startTime) / 1e3), this._solution ? this._endPosition + this._solution.x(t) : 0;
    }
  }, {
    key: "dx",
    value: function (t) {
      return null == t && (t = (new Date().getTime() - this._startTime) / 1e3), this._solution ? this._solution.dx(t) : 0;
    }
  }, {
    key: "setEnd",
    value: function (t, i, s) {
      if (s || (s = new Date().getTime()), t != this._endPosition || !this.almostZero(i, .4)) {
        i = i || 0;
        var e = this._endPosition;
        this._solution && (this.almostZero(i, .4) && (i = this._solution.dx((s - this._startTime) / 1e3)), e = this._solution.x((s - this._startTime) / 1e3), this.almostZero(i, .4) && (i = 0), this.almostZero(e, .4) && (e = 0), e += this._endPosition), this._solution && this.almostZero(e - t, .4) && this.almostZero(i, .4) || (this._endPosition = t, this._solution = this._solve(e - this._endPosition, i), this._startTime = s);
      }
    }
  }, {
    key: "snap",
    value: function (t) {
      this._startTime = new Date().getTime(), this._endPosition = t, this._solution = {
        x: function () {
          return 0;
        },
        dx: function () {
          return 0;
        }
      };
    }
  }, {
    key: "done",
    value: function (t) {
      return t || (t = new Date().getTime()), this.almostEqual(this.x(), this._endPosition, .4) && this.almostZero(this.dx(), .4);
    }
  }, {
    key: "almostEqual",
    value: function (t, i, s) {
      return t > i - s && t < i + s;
    }
  }, {
    key: "almostZero",
    value: function (t, i) {
      return this.almostEqual(t, 0, i);
    }
  }]);
}();
