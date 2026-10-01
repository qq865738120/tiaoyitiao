// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return i(function i(t) {
    e(this, i), this.game = t, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.name = "viewerGG";
  }, [{
    key: "show",
    value: function (e) {
      var i = this.model.observeInfo;
      this.full2D.showLookersPage({
        type: "gg",
        score: e,
        headimg: i.headimg,
        nickname: i.nickName
      }), this.UI.hideScore();
    }
  }, {
    key: "hide",
    value: function () {
      this.full2D.hide2D();
    }
  }]);
}();
