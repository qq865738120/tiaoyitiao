// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(o) {
    e(this, t), this.game = o, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "singleSettlementPgae";
  }, [{
    key: "show",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = 0,
        o = "",
        a = function () {},
        n = null,
        i = null,
        r = function () {};
      e && e.banType && (t = e.banType || 0), e.bottle_skin && e.bottle_skin.icon && (o = e.bottle_skin.icon, this.game.reporter.rpGetSkinSettle()), e.onClickBottleSkin && (a = e.onClickBottleSkin), e.onRewardAdGetProp && (n = e.onRewardAdGetProp, i = e.onShowRewardAd), e.onShowBannerAd && (r = e.onShowBannerAd), this.data = e;
      var s = this.model.currentScore,
        l = this.model.getHighestScore(),
        d = this.model.startTime,
        h = this.model.weekBestScore,
        g = this.game.historyTimes.getTimes(),
        u = wx.getStorageSync("ad") || {};
      console.log("ad :", u);
      var m = "";
      if (u.t && n) {
        var c = new Date(u.t),
          f = new Date();
        !e.no_ad && u.ad_reward_quota && c.getMonth() == f.getMonth() && c.getDate() == f.getDate() ? m = "reward" : !e.no_ad && u.ad_banner_quota && c.getMonth() == f.getMonth() && c.getDate() == f.getDate() && (m = "banner");
      }
      if (this.full2D || this.game.handleWxOnError({
        message: "can not find full 2D gameOverPage",
        stack: ""
      }), this.full2D) {
        var w = {
          score: s,
          highest_score: l,
          start_time: d,
          week_best_score: h,
          game_cnt: g,
          banType: t,
          bottle_skin_icon: o,
          ad_type: m,
          onClickBottleSkin: a,
          onRewardAdGetProp: n,
          onShowBannerAd: r,
          onShowRewardAd: i
        };
        this.model.adInfo && this.model.adInfo.advertisingInfo && this.model.adInfo.advertisingInfo.isShowing && (w.advertise = {
          score: this.model.adInfo.advertisingInfo.score,
          icon_url: this.model.adInfo.advertisingInfo.trademark_url,
          url: this.model.adInfo.advertisingInfo.ad_url
        }, this.game.reporter.rpAdGameOver()), this.full2D.showGameOverPage(w), GameGlobal.matchType || (s > l ? this.game.reporter.historyBest() : s > h && this.game.reporter.weekBest());
      }
    }
  }, {
    key: "showAdReward",
    value: function (e) {
      var t = this;
      this.full2D.showJiLiAdGetPropPage({
        icon: e,
        onReturn: function () {
          t.data.no_ad = !0, t.show(t.data);
        }
      });
    }
  }, {
    key: "hide",
    value: function () {
      this.full2D.hide2D();
    }
  }]);
}();
