// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(s) {
    e(this, t), this.game = s, this.name = "game", this.full2D = this.game.full2D, this.UI = this.game.UI;
  }, [{
    key: "show",
    value: function () {
      this.UI.resetRelayPos(), this.UI.scoreText.changeStyle({
        textAlign: "left"
      }), this.UI.showScore();
    }
  }, {
    key: "hide",
    value: function () {
      this.full2D.hide2D(), this.UI.hideScore(), this.UI.resetScorePos(), this.UI.scoreText.obj.scale.set(1, 1, 1), this.UI.scoreText.changeStyle({
        textAlign: "left"
      });
    }
  }, {
    key: "hideScore",
    value: function () {
      this.UI.hideScore(), this.UI.resetScorePos(), this.UI.scoreText.changeStyle({
        textAlign: "left"
      });
    }
  }]);
}();
