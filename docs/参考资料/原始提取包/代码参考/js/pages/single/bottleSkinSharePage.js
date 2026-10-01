// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(i) {
    var s = i.game,
      n = i.onReturn,
      h = i.onShare,
      o = i.onShareSkin,
      r = i.bottle_skin,
      a = void 0 === r ? {} : r;
    e(this, t), this.game = s, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.onShare = h, this.onReturn = n, this.bottle_skin = a, this.onShareSkin = o;
  }, [{
    key: "show",
    value: function (e, t) {
      this.full2D.showGetNewSkin({
        poster: this.bottle_skin.poster,
        desc: this.bottle_skin.desc,
        onReturn: this.onReturn,
        onShareGift: this.onShare,
        onShareSkin: this.onShareSkin
      });
    }
  }, {
    key: "hide",
    value: function () {
      this.game.full2D.hide2D();
    }
  }]);
}();
