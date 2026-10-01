// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/slicedToArray"),
  i = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  n = e(require("../pages/observe/observeWaiting")),
  s = e(require("../pages/observe/observeGg")),
  o = e(require("../pages/observe/observeOut")),
  r = e(require("../network/network")),
  l = require("../util/forceUpdate"),
  h = e(require("./bottleSkinBaseCtrl"));
exports.default = function () {
  return a(function e(t, a) {
    i(this, e), this.game = t, this.name = "observe", this.gameCtrl = this.game.gameCtrl, this.model = this.game.gameModel, this.view = this.game.gameView, this.modeCtrl = a, this.netWorkCtrl = this.gameCtrl.netWorkCtrl, this.gameSocket = this.game.gameSocket, this.currentPage = null, this.waitingPage = new n.default(t), this.ggPage = new s.default(t), this.outPage = new o.default(t), this.gameId = "", this.longTimeout = null;
  }, [{
    key: "init",
    value: function (e) {
      var t = this,
        i = this.model.getServerConfig();
      if (i && !i.audience_mode_switch) return this.view.showServeConfigForbiddenObserveMode(), void this.modeCtrl.changeMode("singleCtrl");
      if (e.query.version) {
        console.log("options.query.version", e.query.version);
        var a = e.query.version;
        1 == (0, l.compareMyVersion)(a) ? (0, l.forceUpdate)(function () {
          t.modeCtrl.changeMode("singleCtrl");
        }, "点击确定，进行版本更新后重试") : this.go(e);
      } else this.go(e);
    }
  }, {
    key: "go",
    value: function (e) {
      var t = this;
      this.model.setStage("");
      var i = this.model.getSessionId();
      this.gameId = e.query.gameId, this.model.setObserveInfo({
        headimg: e.query.headimg,
        nickName: e.query.nickName
      }), this.model.setGameId(this.gameId), wx.showLoading(), i ? this.afterLogin(!0, e) : this.netWorkCtrl.netWorkLogin(function (i) {
        t.afterLogin(i, e);
      });
    }
  }, {
    key: "afterLogin",
    value: function (e, i) {
      var a = this;
      if (e) {
        var n,
          s,
          o = i.query.skin_id || "",
          r = i.query.skin_sn || "",
          l = i.query.bottle_skin_id || "";
        n = o && r ? this.game.skinManager.loadSkinForOtherMode(o, r).then(function () {
          return o;
        }, function (e) {
          return console.log("----observeCtrl---- ekili", e), Promise.reject(null);
        }) : Promise.resolve(null), s = l && 0 != l ? new Promise(function (e, t) {
          h.default.getBottleSkinShopData().then(function (i) {
            var a = null,
              n = i.bottleSkinShopList || [],
              s = n.findIndex(function (e) {
                return e.id == l;
              });
            s < 0 ? e(null) : (a = n[s], h.default.getBottleSkinResourceBySkinData(a).then(function () {
              e(a);
            }, function (e) {
              t(e);
            }));
          }, function (e) {
            t(e);
          });
        }) : Promise.resolve(null), Promise.all([n, s]).then(function (e) {
          var i = t(e, 2),
            n = i[0],
            s = void 0 === n ? null : n,
            o = i[1];
          a.game.resetScene(null, {
            skinId: s,
            bottleSkin: o
          }), a.go2();
        }, function (e) {
          console.log("GO observe fail", e), a.goToObserveStateFail();
        });
      } else this.goToObserveStateFail();
    }
  }, {
    key: "go2",
    value: function () {
      this.setLongTimeHandle(), this.gameSocket.connectSocket(), this.model.setStage("");
    }
  }, {
    key: "socketJoinSuccess",
    value: function (e) {
      this.clearLongTimeHandle(), wx.hideLoading(), e ? (this.waitingPage.show(), this.model.setStage(this.waitingPage.name), this.currentPage = this.waitingPage, this.game.UI.setScore(0), this.checkPlayerTimeout = setInterval(this.checkPlayerState.bind(this), 1e4)) : this.showPlayerDead();
    }
  }, {
    key: "goToObserveStateFail",
    value: function () {
      this.view.showObserveStateFail(), this.modeCtrl.changeMode("singleCtrl");
    }
  }, {
    key: "setLongTimeHandle",
    value: function () {
      this.longTimeout = setTimeout(this.handleLongTime.bind(this), 9e3);
    }
  }, {
    key: "handleLongTime",
    value: function () {
      this.goToObserveStateFail();
    }
  }, {
    key: "clearLongTimeHandle",
    value: function () {
      null != this.longTimeout && (clearTimeout(this.longTimeout), this.longTimeout = null);
    }
  }, {
    key: "showPlayerDead",
    value: function () {
      this.gameSocket.close(), this.clearCheckPlayerTimeout(), this.currentPage && this.currentPage.hide(), this.outPage.show(), this.model.setStage(this.outPage.name), this.currentPage = this.outPage;
    }
  }, {
    key: "checkPlayerState",
    value: function () {
      r.default.syncop(this.judgePlayerState.bind(this));
    }
  }, {
    key: "judgePlayerState",
    value: function (e, t) {
      e ? 0 != t.data.state && (this.clearCheckPlayerTimeout(), this.showPlayerDead()) : this.handleSyncopErr();
    }
  }, {
    key: "handleSyncopErr",
    value: function () {
      this.view.showSyncopErr(), this.goToObserveStateFail();
    }
  }, {
    key: "clearCheckPlayerTimeout",
    value: function () {
      null != this.checkPlayerTimeout && (clearInterval(this.checkPlayerTimeout), this.checkPlayerTimeout = null);
    }
  }, {
    key: "destroy",
    value: function () {
      this.currentPage && this.currentPage.hide(), this.currentPage = null, this.model.setStage(""), this.model.clearGameId(), this.clearLongTimeHandle(), this.clearCheckPlayerTimeout(), wx.hideLoading(), this.gameSocket.alive && this.gameSocket.close(), this.model.clearObserveInfo(), this.game.instructionCtrl.destroy(), this.game.deadTimeout && (clearTimeout(this.game.deadTimeout), this.game.deadTimeout = null), this.game.pendingReset = !1, this.game.resetScene();
    }
  }, {
    key: "showPlayerWaiting",
    value: function () {
      this.currentPage != this.waitingPage && (null != this.currentPage && this.currentPage.hide(), this.waitingPage.show(), this.model.setStage(this.waitingPage.name), this.currentPage = this.waitingPage);
    }
  }, {
    key: "showPlayerGG",
    value: function (e) {
      null != this.currentPage && this.currentPage.hide(), this.ggPage.show(e), this.model.setStage(this.ggPage.name), this.currentPage = this.ggPage;
    }
  }, {
    key: "onPlayerOut",
    value: function () {
      this.showPlayerDead();
    }
  }, {
    key: "onViewerStart",
    value: function () {
      this.gameSocket.quitObserve(), this.game.instructionCtrl.destroy(), this.modeCtrl.directPlaySingleGame();
    }
  }, {
    key: "showGameOverPage",
    value: function () {}
  }, {
    key: "wxOnhide",
    value: function () {
      this.clearCheckPlayerTimeout(), this.gameSocket.quitObserve(), this.gameSocket.close(), this.game.resetScene();
    }
  }, {
    key: "wxOnshow",
    value: function () {}
  }]);
}();
