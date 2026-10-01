// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var t = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../@babel/runtime/helpers/classCallCheck"),
  r = require("../../@babel/runtime/helpers/createClass"),
  l = t(require("./singleCtrl")),
  n = t(require("./groupShareCtrl")),
  i = t(require("./battleCtrl")),
  a = t(require("./observeCtrl")),
  s = t(require("./playerCtrl")),
  u = t(require("./relayCtrl")),
  c = t(require("./reviewPageCtrl")),
  h = t(require("./getGiftPageCtrl")),
  o = t(require("../lib/mue/eventcenter")),
  C = require("../config"),
  g = require("../network/getAuth");
exports.default = function () {
  return r(function t(r) {
    var y,
      k,
      d = this;
    e(this, t), this.game = r, this.singleCtrl = new l.default(r, this), this.groupShareCtrl = new n.default(r, this), this.battleCtrl = new i.default(r, this), this.observeCtrl = new a.default(r, this), this.playerCtrl = new s.default(r, this), this.relayCtrl = new u.default(r, this), this.reviewPageCtrl = new c.default(r, this), this.getGiftPageCtrl = new h.default(r, this), this.model = r.gameModel, this.gameCtrl = r.gameCtrl, this.currentCtrl = null, this.rankGameChallenging = !1, this.challengeScoreKey = null, this.battleInstance = null, this.gameLivePkScoreKey = null, o.default.on(C.EVENT.GOSTARTPAGE, this.goToSingleStartPage.bind(this)), null === (y = (k = wx).getRankManager) || void 0 === y || y.call(k).onChallengeStart(function (t) {
      (0, g.getAuthWxFriendInteraction)().then(function () {
        console.log("!!! rankManager.onChallengeStart", t);
        var e = t.scoreKey;
        d.challengeScoreKey = e, clearTimeout(d.game.deadTimeout), d.game.deadTimeout = null, d.changeMode("singleCtrl"), d.singleCtrl.clickStart(), d.model.setMode("rankGameChallenge"), o.default.emit(C.EVENT.CHALLENGE_START), d.rankGameChallenging = !0;
      }).catch(function () {
        var e, r;
        console.log("!!! rankManager.abort", t), null === (e = (r = wx).getRankManager) || void 0 === e || e.call(r).abort();
      });
    }), GameGlobal.miniGameCommon && "function" == typeof GameGlobal.miniGameCommon.getRankManager ? (this.battleInstance = GameGlobal.miniGameCommon.getRankManager({
      type: "liveBattle"
    }), this.battleInstance ? this.battleInstance.onChallengeStart(function (t) {
      console.log("liveBattle RankManager onChallengeStart", t), d.gameLivePkScoreKey = t.scoreKey, d.changeMode("singleCtrl"), clearTimeout(d.game.deadTimeout), d.game.deadTimeout = null, d.singleCtrl.clickStart(), d.model.setMode("single");
    }) : console.error("[Game] liveBattle RankManager not available")) : console.error("[Game] getRankManager not available");
  }, [{
    key: "initFirstPage",
    value: function (t) {
      var e = this.model.getMode();
      switch (console.log("init???", t, e), e) {
        case "single":
        case "rankGameChallenge":
          this.currentCtrl = this.singleCtrl, this.singleCtrl.init(t), this.gameCtrl.netWorkLogin();
          break;
        case "groupShare":
          this.currentCtrl = this.groupShareCtrl, this.groupShareCtrl.init(t);
          break;
        case "battle":
          this.currentCtrl = this.battleCtrl, this.battleCtrl.init(t);
          break;
        case "observe":
          this.currentCtrl = this.observeCtrl, this.observeCtrl.init(t);
          break;
        case "relay":
          this.currentCtrl = this.relayCtrl, this.currentCtrl.init(t);
          break;
        case "reviewPage":
          this.currentCtrl = this.reviewPageCtrl, this.currentCtrl.init(t);
          break;
        case "getGiftPage":
          this.currentCtrl = this.getGiftPageCtrl, console.log("getGiftPage", this.getGiftPageCtrl), this.currentCtrl.init(t);
          break;
        default:
          this.currentCtrl = this.singleCtrl, this.model.setMode("single"), this.singleCtrl.init(t), this.gameCtrl.netWorkLogin();
      }
    }
  }, {
    key: "reInitFirstPage",
    value: function (t) {
      var e = this;
      this.currentCtrl && (this.currentCtrl.destroy(), this.gameCtrl.reviewCtrl.destroy(), this.currentCtrl = null), this.gameCtrl.queryCtrl.identifyMode(t), setTimeout(function () {
        e.initFirstPage(t);
      }, 500);
    }
  }, {
    key: "clickStart",
    value: function () {
      this.currentCtrl && this.currentCtrl.clickStart && this.currentCtrl.clickStart();
    }
  }, {
    key: "showGameOverPage",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.showGameOverPage && this.currentCtrl.showGameOverPage(t);
    }
  }, {
    key: "gameOverClickReplay",
    value: function () {
      this.currentCtrl && (this.currentCtrl.gameOverClickReplay ? this.currentCtrl.gameOverClickReplay() : this.game.handleWxOnError({
        message: "cannot Find this.currentCtrl.gameOverClickReplay",
        stack: this.game.mode + "" + this.game.stage
      }));
    }
  }, {
    key: "showFriendRank",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.showFriendRank && this.currentCtrl.showFriendRank(t);
    }
  }, {
    key: "showStartPage",
    value: function () {
      this.currentCtrl && this.currentCtrl.showStartPage && this.currentCtrl.showStartPage();
    }
  }, {
    key: "friendRankReturn",
    value: function () {
      this.currentCtrl && this.currentCtrl.friendRankReturn && this.currentCtrl.friendRankReturn();
    }
  }, {
    key: "shareGroupRank",
    value: function () {
      this.currentCtrl && this.currentCtrl.shareGroupRank && this.currentCtrl.shareGroupRank();
    }
  }, {
    key: "showGroupRankPage",
    value: function () {
      this.currentCtrl && this.currentCtrl.showGroupRankPage && this.currentCtrl.showGroupRankPage();
    }
  }, {
    key: "clickRank",
    value: function () {
      this.currentCtrl && this.currentCtrl.clickRank && this.currentCtrl.clickRank();
    }
  }, {
    key: "showPkRule",
    value: function () {
      console.log("!!! modeCtrl showPkRulePage", this.currentCtrl), this.currentCtrl && this.currentCtrl.showPkRule && this.currentCtrl.showPkRule();
    }
  }, {
    key: "closePkRule",
    value: function () {
      console.log("!!! modeCtrl closePkRule", this.currentCtrl), this.currentCtrl && this.currentCtrl.closePkRule && this.currentCtrl.closePkRule();
    }
  }, {
    key: "setPkDuration",
    value: function () {
      console.log("!!! modeCtrl setPkDuration", this.currentCtrl), this.currentCtrl && this.currentCtrl.setPkDuration && this.currentCtrl.setPkDuration();
    }
  }, {
    key: "changeMode",
    value: function (t, e) {
      console.log("!!! modeCtrl changeMode", t, e), this.currentCtrl && this.currentCtrl.destroy && (this.currentCtrl.destroy(), this.gameCtrl.reviewCtrl.destroy()), this.model.setMode(this[t].name), console.log("!!! modeCtrl changeMode setMode", this.model.mode), this.currentCtrl = this[t], "singleCtrl" === t && o.default.emitSync(C.EVENT.GOTOSINGLESTARTPAGE, {}), this[t].init(e);
    }
  }, {
    key: "singleChangeToPlayer",
    value: function () {
      this.model.setMode(this.playerCtrl.name), this.currentCtrl = this.playerCtrl, this.playerCtrl.init();
    }
  }, {
    key: "groupPlayGame",
    value: function () {
      this.currentCtrl && this.currentCtrl.groupPlayGame && this.currentCtrl.groupPlayGame();
    }
  }, {
    key: "directPlaySingleGame",
    value: function () {
      this.currentCtrl && this.currentCtrl.destroy(), this.model.setMode(this.singleCtrl.name), this.currentCtrl = this.singleCtrl, this.singleCtrl.clickStart();
    }
  }, {
    key: "battlePlay",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.battlePlay && this.currentCtrl.battlePlay(t);
    }
  }, {
    key: "shareObservCard",
    value: function () {
      console.log("!!! modeCtrl shareObservCard", this.currentCtrl), this.currentCtrl && this.currentCtrl.shareObservCard && this.currentCtrl.shareObservCard();
    }
  }, {
    key: "socketJoinSuccess",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.socketJoinSuccess && this.currentCtrl.socketJoinSuccess(t);
    }
  }, {
    key: "showPlayerGG",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.showPlayerGG && this.currentCtrl.showPlayerGG(t);
    }
  }, {
    key: "showPlayerWaiting",
    value: function () {
      this.currentCtrl && this.currentCtrl.showPlayerWaiting && this.currentCtrl.showPlayerWaiting();
    }
  }, {
    key: "onPlayerOut",
    value: function () {
      this.currentCtrl && (this.currentCtrl.onPlayerOut ? this.currentCtrl.onPlayerOut() : this.game.handleWxOnError({
        message: "cannot Find this.currentCtrl.onPlayerOut",
        stack: this.game.mode + "" + this.game.stage
      }));
    }
  }, {
    key: "onViewerStart",
    value: function () {
      this.currentCtrl && this.currentCtrl.onViewerStart && this.currentCtrl.onViewerStart();
    }
  }, {
    key: "appealNotify",
    value: function () {
      this.currentCtrl && this.currentCtrl.appealNotify && this.currentCtrl.appealNotify();
    }
  }, {
    key: "onSocketOpen",
    value: function () {
      this.currentCtrl && this.currentCtrl.onSocketOpen && this.currentCtrl.onSocketOpen();
    }
  }, {
    key: "gotoRelayMode",
    value: function () {
      this.currentCtrl && this.currentCtrl.gotoRelayMode && this.currentCtrl.gotoRelayMode();
    }
  }, {
    key: "outRelay1",
    value: function () {
      this.currentCtrl && this.currentCtrl.outRelay1 && this.currentCtrl.outRelay1();
    }
  }, {
    key: "outRelay2",
    value: function () {
      this.currentCtrl && this.currentCtrl.outRelay2 && this.currentCtrl.outRelay2();
    }
  }, {
    key: "startRelay",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.startRelay && this.currentCtrl.startRelay(t);
    }
  }, {
    key: "watchRelay",
    value: function () {
      this.currentCtrl && this.currentCtrl.watchRelay && this.currentCtrl.watchRelay();
    }
  }, {
    key: "replayRelay",
    value: function () {
      this.currentCtrl && this.currentCtrl.replayRelay && this.currentCtrl.replayRelay();
    }
  }, {
    key: "shareRelay",
    value: function () {
      this.currentCtrl && this.currentCtrl.shareRelay && this.currentCtrl.shareRelay();
    }
  }, {
    key: "shareRelayLive",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.shareRelayLive && this.currentCtrl.shareRelayLive(t);
    }
  }, {
    key: "onSocketCloseErr",
    value: function () {
      this.currentCtrl && this.currentCtrl.onSocketCloseErr && this.currentCtrl.onSocketCloseErr();
    }
  }, {
    key: "touchProp",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.touchProp && this.currentCtrl.touchProp(t);
    }
  }, {
    key: "goToSingleStartPage",
    value: function (t) {
      console.log("!!! modeCtrl goToSingleStartPage", this.currentCtrl), this.currentCtrl == this.singleCtrl && this.game.reporter.singleBackStart(), this.changeMode("singleCtrl");
    }
  }, {
    key: "skipRelayBeginner",
    value: function () {
      this.currentCtrl && this.currentCtrl.skipRelayBeginner && this.currentCtrl.skipRelayBeginner();
    }
  }, {
    key: "handleAd",
    value: function (t) {
      this.currentCtrl && this.currentCtrl.handleAd && this.currentCtrl.handleAd(t);
    }
  }, {
    key: "afterShownStartPage",
    value: function () {
      this.currentCtrl && this.currentCtrl.afterShownStartPage && this.currentCtrl.afterShownStartPage();
    }
  }, {
    key: "wxOnShow",
    value: function () {
      this.currentCtrl && this.currentCtrl.wxOnShow && this.currentCtrl.wxOnShow();
    }
  }, {
    key: "wxOnhide",
    value: function () {
      this.currentCtrl && this.currentCtrl.wxOnhide && this.currentCtrl.wxOnhide();
    }
  }]);
}();
