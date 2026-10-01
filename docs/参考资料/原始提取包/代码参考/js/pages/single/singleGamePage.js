// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../../@babel/runtime/helpers/createClass"),
  t = require("../../chat"),
  o = require("../../network/getAuth"),
  r = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth,
  s = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
exports.default = function () {
  return i(function i(t) {
    e(this, i), this.game = t, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.viewer = this.game.viewer, this.name = "game";
  }, [{
    key: "show",
    value: function (e) {
      var i = this;
      console.log("!!! show", e);
      var h = this.model.is_from_wn,
        n = this.model.firstBlood;
      h || this.game.guider || (n ? this.viewer.lookers.showLookers({
        avaImg: !1,
        icon: !0,
        wording: !0
      }) : this.viewer.open(), (0, o.createUserInfoButton)("邀请围观", 1, {
        x: 0,
        y: .88 * s,
        width: .13 * r,
        height: .12 * s
      }, function () {
        i.game.gameCtrl.shareObservCard();
      })), this.UI.showScore(), this.UI.resetScorePos(), this.UI.scoreText.changeStyle({
        textAlign: "left"
      }), e && e.usingProp && this.UI.showProp(e.usingProp), GameGlobal.matchType ? (0, t.showMiniGameCenter)() : (0, t.hideMiniGameCenter)();
    }
  }, {
    key: "hide",
    value: function () {
      this.viewer.close(), this.UI.hideScore(), this.UI.hideChampionScore(), this.UI.hideProp(), this.UI.hideAdAvator();
    }
  }, {
    key: "hideLookersShare",
    value: function () {
      this.model.firstBlood && (this.model.setFirstBlood(!1), this.viewer.open());
    }
  }]);
}();
