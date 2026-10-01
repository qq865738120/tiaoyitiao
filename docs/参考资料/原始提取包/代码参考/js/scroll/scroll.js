// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var t = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../../@babel/runtime/helpers/classCallCheck"),
  e = require("../../@babel/runtime/helpers/createClass"),
  s = t(require("./friction")),
  n = t(require("./spring"));
exports.default = function () {
  return e(function t(e) {
    i(this, t), this._extent = e, this._friction = new s.default(.01), this._spring = new n.default(1, 90, 20), this._startTime = 0, this._springing = !1, this._springOffset = 0;
  }, [{
    key: "set",
    value: function (t, i) {
      this._friction.set(t, i), t > 0 && i >= 0 ? (this._springOffset = 0, this._springing = !0, this._spring.snap(t), this._spring.setEnd(0)) : t < -this._extent && i <= 0 ? (this._springOffset = 0, this._springing = !0, this._spring.snap(t), this._spring.setEnd(-this._extent)) : this._springing = !1, this._startTime = new Date().getTime();
    }
  }, {
    key: "x",
    value: function (t) {
      if (!this._startTime) return 0;
      if (t || (t = (new Date().getTime() - this._startTime) / 1e3), this._springing) return this._spring.x() + this._springOffset;
      var i = this._friction.x(t),
        e = this.dx(t);
      return i < -this._extent && e <= 0 && (this._springing = !0, this._spring.setEnd(0, e), i < -this._extent ? this._springOffset = -this._extent : this._springOffset = 0, i = this._spring.x() + this._springOffset), i;
    }
  }, {
    key: "dx",
    value: function (t) {
      var i = 0;
      return i = this._lastTime === t ? this._lastDx : this._springing ? this._spring.dx(t) : this._friction.dx(t), this._lastTime = t, this._lastDx = i, i;
    }
  }, {
    key: "done",
    value: function () {
      return this._springing ? this._spring.done() : this._friction.done();
    }
  }, {
    key: "setExtent",
    value: function (t) {
      this._extent = t;
    }
  }]);
}();
