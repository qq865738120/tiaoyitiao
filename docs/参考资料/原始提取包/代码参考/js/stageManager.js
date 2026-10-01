// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../@babel/runtime/helpers/classCallCheck"),
  t = require("../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t() {
    e(this, t), this._stages = {}, this._current = null;
  }, [{
    key: "navigatorTo",
    value: function (e, t) {
      this._current && this._pages[e] ? (this._current.destroyStage(), this._current = this._pages[e], this._current.initStage(t)) : console.warn("StageManager navigator fail");
    }
  }, {
    key: "register",
    value: function (e, t) {
      "function" == typeof t.destroyStage && "function" == typeof t.initStage ? this._stages[e] = t : consoel.warn("StageManager ");
    }
  }]);
}();
