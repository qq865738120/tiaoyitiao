// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../../@babel/runtime/helpers/objectSpread2"),
  i = require("../../../@babel/runtime/helpers/classCallCheck"),
  r = require("../../../@babel/runtime/helpers/createClass"),
  l = e(require("../../lib/mue/eventcenter")),
  s = require("../../config"),
  a = require("../../chat");
exports.default = function () {
  return r(function e(t, r, l) {
    i(this, e), this.game = t, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "startPage", this.onMsg = r, this.onSkin = l;
  }, [{
    key: "show",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      e.hideRank = this.model.firstBlood, this.full2D && this.full2D.showStartPage(t(t({}, e), {}, {
        onBottleSkin: this.onSkin.bind(this),
        onMsgBox: this.onMsg.bind(this)
      })), this.model.firstBlood = !1, l.default.emit(s.EVENT.AFTER_SHOWN_START_PAGE, {}), (0, a.showMiniGameCenter)();
    }
  }, {
    key: "upDateRedPot",
    value: function () {
      this.full2D.updateStartPage();
    }
  }, {
    key: "hide",
    value: function () {
      (0, a.hideMiniGameCenter)(), this.full2D.hide2D();
    }
  }]);
}();
