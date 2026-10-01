// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  e = require("../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return e(function e(i) {
    t(this, e), this._drag = i, this._dragLog = Math.log(i), this._x = 0, this._v = 0, this._startTime = 0;
  }, [{
    key: "set",
    value: function (t, e) {
      this._x = t, this._v = e, this._startTime = new Date().getTime();
    }
  }, {
    key: "x",
    value: function (t) {
      var e;
      return void 0 === t && (t = (new Date().getTime() - this._startTime) / 1e3), e = t === this._dt && this._powDragDt ? this._powDragDt : this._powDragDt = Math.pow(this._drag, t), this._dt = t, this._x + this._v * e / this._dragLog - this._v / this._dragLog;
    }
  }, {
    key: "dx",
    value: function (t) {
      var e;
      return void 0 === t && (t = (new Date().getTime() - this._startTime) / 1e3), e = t === this._dt && this._powDragDt ? this._powDragDt : this._powDragDt = Math.pow(this._drag, t), this._dt = t, this._v * e;
    }
  }, {
    key: "done",
    value: function () {
      return Math.abs(this.dx()) < 3;
    }
  }]);
}();
