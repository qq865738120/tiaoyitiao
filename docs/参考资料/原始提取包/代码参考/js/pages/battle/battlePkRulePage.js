// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  s = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return s(function s(t) {
    e(this, s), this.game = t, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "battlePage", this.score = 0;
  }, [{
    key: "show",
    value: function (e) {
      e.score && (this.score = e.score), console.log("!!! battlePkRulePage show", e, this.score), e.score = this.score, this.full2D.showPkRulePage(e);
    }
  }, {
    key: "hide",
    value: function () {
      this.full2D.hide2D();
    }
  }]);
}();
