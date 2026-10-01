// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  r = require("../../@babel/runtime/helpers/possibleConstructorReturn"),
  s = require("../../@babel/runtime/helpers/get"),
  i = require("../../@babel/runtime/helpers/getPrototypeOf"),
  n = require("../../@babel/runtime/helpers/inherits"),
  l = e(require("./singleCtrl")),
  o = require("../shareApp"),
  u = e(require("../pages/player/playerGamePage")),
  h = e(require("../network/network")),
  c = e(require("./bottleSkinBaseCtrl"));
exports.default = function (e) {
  function l(e, a) {
    var s, n, o, h;
    return t(this, l), n = this, h = [e, a], o = i(o = l), (s = r(n, function () {
      if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
      if (Reflect.construct.sham) return !1;
      if ("function" == typeof Proxy) return !0;
      try {
        return !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      } catch (e) {
        return !1;
      }
    }() ? Reflect.construct(o, h || [], i(n).constructor) : o.apply(n, h))).name = "player", s.currentPage = null, s.gamePage = new u.default(e), s;
  }
  return n(l, e), a(l, [{
    key: "init",
    value: function () {
      switch (this.model.stage) {
        case "game":
          this.currentPage = this.gamePage, this.currentPage.show();
          break;
        case "singleSettlementPgae":
          this.currentPage = this.gameOverPage;
          break;
        default:
          this.model.setStage(this.gamePage.name), this.currentPage = this.gamePage, this.currentPage.show();
      }
    }
  }, {
    key: "showGameOverPage",
    value: function (e) {
      this.game.seq++, this.gameSocket.sendCommand(this.game.seq, {
        type: -1,
        s: this.game.currentScore
      }), s(i(l.prototype), "showGameOverPage", this).call(this, e);
    }
  }, {
    key: "shareObservCard",
    value: function () {
      console.log("!!! playerCtrl shareObservCard"), this.shareObservCardA();
    }
  }, {
    key: "shareObservCardA",
    value: function () {
      this.shareObservCardB();
    }
  }, {
    key: "shareObservCardB",
    value: function () {
      var e = this;
      this.model.setStage("loading");
      var t = c.default.getSelectedSkinId();
      (0, o.shareObserve)({
        bottle_skin_id: t,
        skin_id: this.game.skin_id,
        skin_sn: this.game.skin_sn,
        cb: function (t, a) {
          t && e.gameCtrl.afterShareObserveCard(a);
        }
      });
    }
  }, {
    key: "gameOverClickReplay",
    value: function () {
      s(i(l.prototype), "gameOverClickReplay", this).call(this), this.game.seq++, this.gameSocket.sendCommand(this.game.seq, {
        type: 0,
        seed: this.game.randomSeed
      }), this.game.reporter.rpPlayerClickPlayAgain();
    }
  }, {
    key: "destroy",
    value: function () {
      this.currentPage && this.currentPage.hide(), this.currentPage = null, this.model.setStage(""), this.gameSocket.alive && (h.default.quitGame(), this.gameSocket.close()), this.model.clearGameId(), this.model.clearGameTicket(), this.game.viewer.reset(), this.game.deadTimeout && (clearTimeout(this.game.deadTimeout), this.game.deadTimeout = null), this.game.pendingReset = !1, this.model.adInfo = {
        canShowAd: !this.model.getAdTagInLS(),
        advertisingInfo: {}
      }, this.game.resetScene();
    }
  }, {
    key: "wxOnhide",
    value: function () {
      var e = this;
      "loading" != this.model.stage && "singleSettlementPgae" != this.model.stage && "friendRankList" != this.model.stage && (h.default.quitGame(), this.gameSocket.cleanHeartBeat(), this.gameSocket.close(), setTimeout(function () {
        e.modeCtrl.changeMode("singleCtrl");
      }, 100));
    }
  }, {
    key: "wxOnShow",
    value: function () {
      "loading" == this.model.stage && this.model.setStage("game");
    }
  }]);
}(l.default);
