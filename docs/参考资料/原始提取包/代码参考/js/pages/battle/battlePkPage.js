// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(l) {
    e(this, t), this.game = l, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "battlePage";
  }, [{
    key: "show",
    value: function (e) {
      console.log("!!! battlePkPage show", e), this.full2D.showPkPage(e);
    }
  }, {
    key: "hide",
    value: function () {
      this.full2D.hide2D();
    }
  }]);
}();
