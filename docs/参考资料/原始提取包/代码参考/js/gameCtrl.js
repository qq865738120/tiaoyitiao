// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../@babel/runtime/helpers/asyncToGenerator"),
  o = require("../@babel/runtime/helpers/objectSpread2"),
  i = require("../@babel/runtime/helpers/classCallCheck"),
  a = require("../@babel/runtime/helpers/createClass"),
  s = e(require("./control/queryCtrl")),
  n = e(require("./control/modeCtrl")),
  l = e(require("./control/networkCtrl")),
  c = e(require("./control/reviewCtrl")),
  u = e(require("./control/bottleSkinBaseCtrl")),
  h = require("./config"),
  d = e(require("./store/session")),
  m = e(require("./lib/mue/eventcenter")),
  g = e(require("./pages/single/bottleSkinSharePage")),
  p = require("./shareApp"),
  k = e(require("./control/propertyCtrl")),
  S = require("./network/getAuth"),
  f = require("./util/common"),
  v = e(require("./network/network"));
exports.default = function () {
  return a(function e(t) {
    i(this, e), this.game = t;
  }, [{
    key: "init",
    value: function () {
      this.gameView = this.game.gameView, this.queryCtrl = new s.default(this.game), this.netWorkCtrl = new l.default(this.game), this.reviewCtrl = new c.default(this.game), this.modeCtrl = new n.default(this.game), this.model = this.game.gameModel, this.reporter = this.game.reporter, this.historyTimes = this.game.historyTimes, this.viewer = this.game.viewer, this.reUpLoadShowOverPage = !0, m.default.on(h.EVENT.TRIGGER_EGG, this.handleAd.bind(this)), m.default.on(h.EVENT.AFTER_SHOWN_START_PAGE, this.afterShownStartPage.bind(this));
    }
  }, {
    key: "firstInitGame",
    value: function (e) {
      this.queryCtrl.identifyMode(e), this.modeCtrl.initFirstPage(e);
    }
  }, {
    key: "identifyModeErr",
    value: function (e) {
      this.gameView.showIdentifyModeErr(e);
    }
  }, {
    key: "onLoginSuccess",
    value: function () {
      this.reporter.setTimer(h.REPORTERTIMEOUT), "single" != this.game.mode && k.default.getProps(), this.checkLaterUpLoad();
    }
  }, {
    key: "clickStart",
    value: function () {
      var e = this;
      (0, S.getAuthWxFriendInteraction)().then(function () {
        e.modeCtrl.clickStart(), e.reporter.rpClickSingleStartPage();
      });
    }
  }, {
    key: "showFriendRank",
    value: function () {
      var e = this;
      (0, S.getAuthWxFriendInteraction)().then(function () {
        e.netWorkCtrl.upDateFriendsScoreList(), e.reporter.clickStartPageRankBtn(), e.modeCtrl.showFriendRank();
      });
    }
  }, {
    key: "initReview",
    value: function (e) {
      var t = this;
      this.reviewCtrl.init(o(o({}, e), {}, {
        is_from_share: !1,
        onHide: function () {
          console.log("!!! gameCtrl initReview onHide"), t.modeCtrl.changeMode("singleCtrl");
        }
      }));
    }
  }, {
    key: "quitReview",
    value: function () {
      this.reviewCtrl.reviewPage.onClickHide();
    }
  }, {
    key: "onReturnTo",
    value: function (e) {
      "group" == e ? this.modeCtrl.changeMode("singleCtrl") : "friends" == e ? this.modeCtrl.showFriendRank(!0) : "home" == e && this.modeCtrl.showStartPage();
    }
  }, {
    key: "clickRank",
    value: function () {
      var e = this;
      this.reporter.clickSingleSettlementPageRankBtn(), (0, S.getAuthWxFriendInteraction)().then(function () {
        e.modeCtrl.clickRank();
      });
    }
  }, {
    key: "gameOver",
    value: function (e) {
      if (console.log("gameOver", e), "relay" != this.model.mode) {
        if (!this.reviewCtrl.isInThisPage) {
          if (this.model.setScore(e), "rankGameChallenge" === this.model.mode || "single" === this.model.mode || "player" === this.model.mode) {
            var t,
              r,
              o = this.modeCtrl.challengeScoreKey || h.RANK_SCORE_KEY;
            null === (t = (r = wx).getRankManager) || void 0 === t || t.call(r).update({
              scoreKey: o,
              score: e,
              success: function (e) {
                console.log("!!! rankManager.update success", e);
              },
              fail: function (e) {
                console.error("!!! rankManager.update fail", e);
              }
            }), this.model.setMode("single");
          }
          var i;
          if (this.modeCtrl.gameLivePkScoreKey) this.modeCtrl.gameLivePkScoreKey = null, null === (i = this.modeCtrl.battleInstance) || void 0 === i || i.update({
            scoreKey: this.modeCtrl.gameLivePkScoreKey,
            score: e,
            success: function (e) {
              console.log("!!! GameLiveBattle.update success", e);
            },
            fail: function (e) {
              console.error("!!! GameLiveBattle.update fail", e);
            }
          });
        }
        if ("observe" != this.model.mode) {
          var a = this.model.getHighestScore();
          this.netWorkCtrl.requestMmpayTimeout(), this.historyTimes.addOne();
          var s = this.historyTimes.getTimes();
          k.default.checkUsingProp();
          this.reporter.playGameReport(e, a, s), GameGlobal.matchType || this.netWorkCtrl.upDateFriendsScoreList(), this.netWorkCtrl.updateUserInfo(), u.default.syncSelectBottleSkin();
        }
        "player" == this.model.mode && this.reporter.playAudienceReport(), "battle" == this.model.mode && this.reporter.playPKReport(e), this.reporter.sendReport(), u.default.getSelectedBottleSkinResource().then(function () {}, function () {});
      }
    }
  }, {
    key: "gameOverShowPage",
    value: function () {
      var e = this;
      if ("relay" != this.model.mode) if (this.reUpLoadShowOverPage = !0, "observe" == this.model.mode) this.modeCtrl.showGameOverPage();else {
        this.model.getHighestScore();
        var t = this.model.weekBestScore,
          r = this.model.currentScore;
        r < t || GameGlobal.matchType ? (this.modeCtrl.showGameOverPage(), this.historyTimes.checkUp()) : function () {
          var t = {
            seed: e.game.randomSeed,
            time_seed: e.game.time_seed,
            action: e.game.actionList,
            musicList: e.game.musicList,
            touchList: e.game.touchList,
            steps: e.game.touchMoveList,
            timestamp: e.game.touchStartTime,
            version: h.VERSION,
            use_wangzhe: e.game.use_wangzhe,
            use_mmpaybase: e.game.use_mmpaybase,
            mmpay_status: e.game.mmpay_status,
            mmpay_checksum: e.game.mmpay_checksum,
            succ_property_list: k.default.getSuccPropList() || []
          };
          e.game.bottle.skinId && (t.bottle_skin = {
            item_id: e.game.bottle.skinId
          }), void 0 !== e.game.skin_id && (t.skin_id = e.game.skin_id, t.skin_sn = e.game.skin_sn, console.log(JSON.stringify(t)));
          var o = e.historyTimes.getTimes();
          e.model.upLoadScoreData = {
            currentScore: r,
            gameTimes: o,
            verifyData: t
          }, e.netWorkCtrl.requestSettlement(r, o, e.afterRequestSettlement.bind(e), t);
        }(), GameGlobal.matchType || k.default.handleGameOver({
          seed: e.game.randomSeed,
          time_seed: e.game.time_seed,
          action: e.game.actionList,
          musicList: e.game.musicList,
          touchList: e.game.touchList,
          steps: e.game.touchMoveList,
          timestamp: e.game.touchStartTime,
          version: h.VERSION,
          use_wangzhe: e.game.use_wangzhe,
          use_mmpaybase: e.game.use_mmpaybase,
          mmpay_status: e.game.mmpay_status,
          mmpay_checksum: e.game.mmpay_checksum
        }, r);
      }
    }
  }, {
    key: "afterRequestSettlement",
    value: function (e, t, r) {
      var i = this,
        a = new g.default(o(o(o({}, t), r), {}, {
          game: this.game,
          onReturn: function () {
            n(t);
          },
          onShare: function () {
            (0, p.shareGiftCard)(r.gift_id), i.reporter.rpGetSkinShareGoods(), console.log("onShare", r.gift_id);
          },
          onShareSkin: function () {
            i.reporter.rpGetSkinShowOff();
            var e = r.bottle_skin && r.bottle_skin.share_poster;
            (0, p.shareSkin)(e);
          }
        }));
      if (e) {
        if (this.reUpLoadShowOverPage && n(t, r), r && r.bottle_skin && r.bottle_skin.item_id && r.bottle_skin.expire_time && u.default.updateSkinExpire(r.bottle_skin.item_id, r.bottle_skin.expire_time), this.historyTimes.afterUpload(!0), "observe" == this.model.mode) return;
        var s = this.model.upLoadScoreData.currentScore;
        if (null == s || t && t.banType) return;
        s >= this.model.weekBestScore && (this.model.weekBestScore = s, this.model.saveWeekBestScore(s), s > this.model.getHighestScore() && this.model.saveHeighestScore(this.model.currentScore), r && r.playback_id && u.default.setRankDataTolocalStorage({
          playback_id: r.playback_id
        }));
      } else this.netWorkCtrl.sendServerError(), this.showReUpLoadScoreModel(t);
      function n(e, t) {
        i.modeCtrl.showGameOverPage(o(o(o({}, e), t), {}, {
          onClickBottleSkin: function () {
            a.show(), i.reporter.rpGetSkinSettleClickSkin();
          }
        }));
      }
    }
  }, {
    key: "showReUpLoadScoreModel",
    value: function (e) {
      var t = this;
      wx.showModal({
        title: "提示",
        content: "分数上传失败,请检查网络状态后重试(" + e + ")",
        confirmText: "重试",
        cancelText: "延后上传",
        success: function (r) {
          r.confirm ? t.reUploadScore() : r.cancel ? t.reUpLoadShowOverPage && t.showOverPage(!0) : t.showReUpLoadScoreModel(e);
        },
        fail: function () {
          t.reUpLoadShowOverPage && t.showOverPage(!1);
        }
      });
    }
  }, {
    key: "showOverPage",
    value: function (e) {
      if (this.modeCtrl.showGameOverPage(), e && "observe" != this.model.mode) {
        if (!this.model.upLoadScoreData.verifyData || !this.model.upLoadScoreData.currentScore) return;
        var t = this.model.getActionData(),
          r = this.model.upLoadScoreData.verifyData,
          o = this.model.upLoadScoreData.currentScore;
        t && t.ts > Date.now() && t.score >= o || this.model.saveLaterUpLoadScore(o, r);
      }
    }
  }, {
    key: "reUploadScore",
    value: function () {
      var e = this;
      d.default.sessionId ? this.reUploadScore2() : this.netWorkCtrl.requestLogin(function (t) {
        t ? e.reUploadScore2() : e.showReUpLoadScoreModel("n0");
      });
    }
  }, {
    key: "reUploadScore2",
    value: function () {
      var e = this.model.upLoadScoreData,
        t = e.currentScore,
        r = e.gameTimes,
        o = e.verifyData;
      this.netWorkCtrl.requestSettlement(t, r, this.afterRequestSettlement.bind(this), o);
    }
  }, {
    key: "clickReplay",
    value: function () {
      this.reporter.playAudienceReportStart(), this.reporter.rpSingleSettlePlayAgain(), this.modeCtrl.gameOverClickReplay();
    }
  }, {
    key: "friendRankReturn",
    value: function () {
      this.modeCtrl.friendRankReturn();
    }
  }, {
    key: "netWorkLogin",
    value: function () {
      this.netWorkCtrl.netWorkLogin();
    }
  }, {
    key: "shareGroupRank",
    value: function () {
      this.modeCtrl.shareGroupRank();
    }
  }, {
    key: "afterShareGroupRank",
    value: function (e, t) {
      this.reporter.shareGroupReport(t);
    }
  }, {
    key: "showPkRule",
    value: function () {
      console.log("!!! gameCtrl showPkRulePage"), this.modeCtrl.showPkRule();
    }
  }, {
    key: "closePkRule",
    value: function () {
      console.log("!!! gameCtrl closePkRule"), this.modeCtrl.closePkRule();
    }
  }, {
    key: "setPkDuration",
    value: function () {
      console.log("!!! gameCtrl setPkDuration"), this.modeCtrl.setPkDuration();
    }
  }, {
    key: "subscribePk",
    value: (e = r(t().mark(function e() {
      var r,
        o = this;
      return t().wrap(function (e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.next = 1, (0, h.getSetting)();
          case 1:
            r = e.sent, wx.requestSubscribeMessage({
              tmplIds: [h.PK_SUBSCRIPTION_TEMPLATE_ID],
              success: function (e) {
                var t, i, a, s, n;
                if (console.log("!!! subscribePk success", e), wx.setStorageSync(o.model.getPkId(), e[h.PK_SUBSCRIPTION_TEMPLATE_ID]), e[h.PK_SUBSCRIPTION_TEMPLATE_ID] && (console.log("!!! 本地设置订阅状态", e[h.PK_SUBSCRIPTION_TEMPLATE_ID]), r.subscriptionsSetting[h.PK_SUBSCRIPTION_TEMPLATE_ID] = e[h.PK_SUBSCRIPTION_TEMPLATE_ID]), null !== (t = r.subscriptionsSetting) && void 0 !== t && t[h.PK_SUBSCRIPTION_TEMPLATE_ID]) if ((null === (i = r.subscriptionsSetting) || void 0 === i ? void 0 : i[h.PK_SUBSCRIPTION_TEMPLATE_ID]) === h.SUBSCRIPTION_SETTING_TYPE.ACCEPT || (null === (a = r.subscriptionsSetting) || void 0 === a ? void 0 : a[h.PK_SUBSCRIPTION_TEMPLATE_ID]) === h.SUBSCRIPTION_SETTING_TYPE.ACCEPT_WITH_FORCE_PUSH) wx.showToast({
                  title: "已订阅",
                  icon: "success",
                  duration: 1e3
                });else if ((null === (s = r.subscriptionsSetting) || void 0 === s ? void 0 : s[h.PK_SUBSCRIPTION_TEMPLATE_ID]) === h.SUBSCRIPTION_SETTING_TYPE.REJECT) wx.showModal({
                  title: "请先前往右上角[···]的「设置 > 订阅消息」开启通知接收",
                  showCancel: !1,
                  confirmText: "我知道了"
                });else if ((null === (n = r.subscriptionsSetting) || void 0 === n ? void 0 : n[h.PK_SUBSCRIPTION_TEMPLATE_ID]) === h.SUBSCRIPTION_SETTING_TYPE.BAN) {
                  var l;
                  console.error("订阅模板被禁用", null === (l = r.subscriptionsSetting) || void 0 === l ? void 0 : l[h.PK_SUBSCRIPTION_TEMPLATE_ID]);
                } else {
                  var c;
                  console.error("未知订阅状态", null === (c = r.subscriptionsSetting) || void 0 === c ? void 0 : c[h.PK_SUBSCRIPTION_TEMPLATE_ID]);
                }
                o.modeCtrl.battleCtrl.gotoBattlePage();
              },
              fail: function (e) {
                console.error("!!! subscribePk fail", e);
              }
            });
          case 2:
          case "end":
            return e.stop();
        }
      }, e);
    })), function () {
      return e.apply(this, arguments);
    })
  }, {
    key: "shareBattleCard",
    value: function (e) {
      var t = this;
      console.log("!!! gameCtrl shareBattleCard"), f.inQQ || (0, f.throttleEvent)({
        eventName: "shareBattleCard",
        callback: function () {
          if (console.log("shareBattleCard", t.model.currentScore, h.REWARD_SCORE), e && t.model.currentScore >= h.REWARD_SCORE && h.CAN_USE_REWARD_CHALLENGE) wx.getRankManager().createChallenge({
            scoreKey: h.RANK_SCORE_KEY,
            success: function (e) {
              console.log("!!! rankManager.createChallenge success", e);
            },
            fail: function (e) {
              console.error("!!! rankManager.createChallenge fail", e);
            }
          });else {
            var r = t.model.getSessionId(),
              o = t.model.currentScore,
              i = t.model.getPkId();
            r ? (!i || e ? v.default.createPK(o, t.model.pkLifeTime).then(function () {
              t.afterHavePkId(!0);
            }, function () {
              t.getPKErr();
            }).catch(function (e) {
              return console.log(e);
            }) : t.afterHavePkId(!1), t.reporter.rpClickShareBattle()) : t.gameView.showNoSession();
          }
        }
      });
    }
  }, {
    key: "afterHavePkId",
    value: function (e) {
      var t = this;
      console.log("!!! gameCtrl afterHavePkId", e, this.model.currentScore, this.model.championScore);
      var r = this.model.getPkId(),
        o = e ? this.model.currentScore : this.model.championScore || 0;
      (0, p.shareBattle)(r, o, function (e, r, o) {
        t.afterShareBattle(e, r, o);
      }, this.model, this.modeCtrl);
    }
  }, {
    key: "getPKErr",
    value: function () {
      this.gameView.showGetPkIdFail();
    }
  }, {
    key: "afterShareBattle",
    value: function (e, t, r) {
      console.log("!!! gameCtrl afterShareBattle", e, t, r, this.model.mode), e && this.reporter.sharePKReport(r);
    }
  }, {
    key: "groupPlayGame",
    value: function () {
      this.modeCtrl.groupPlayGame();
    }
  }, {
    key: "loginBattle",
    value: function (e) {
      this.reporter.joinPKReport(e), this.reporter.playPKReportStart(e);
    }
  }, {
    key: "showPkPage",
    value: function (e) {
      this.reporter.playPKScore(e);
    }
  }, {
    key: "onBattlePlay",
    value: function (e) {
      this.modeCtrl.battlePlay(e);
    }
  }, {
    key: "battleToSingle",
    value: function () {
      this.reporter.resetPKReport();
    }
  }, {
    key: "shareObservCard",
    value: function () {
      console.log("!!! gameCtrl shareObservCard"), this.modeCtrl.shareObservCard(), this.reporter.rpClickObserveShare();
    }
  }, {
    key: "socketJoinSuccess",
    value: function (e) {
      this.modeCtrl.socketJoinSuccess(e), "observe" == this.model.mode ? e ? (this.game.socketFirstSync = !0, this.reporter.joinAudienceReportStart()) : this.reporter.joinAudienceReport() : e && this.reporter.playAudienceReportStart();
    }
  }, {
    key: "afterShareObserveCard",
    value: function (e) {
      this.reporter.shareAudienceReport(e);
    }
  }, {
    key: "showPlayerGG",
    value: function (e) {
      this.modeCtrl.showPlayerGG(e);
    }
  }, {
    key: "showPlayerWaiting",
    value: function () {
      this.modeCtrl.showPlayerWaiting();
    }
  }, {
    key: "onPlayerOut",
    value: function () {
      this.modeCtrl.onPlayerOut();
    }
  }, {
    key: "onViewerStart",
    value: function () {
      this.game.audioManager.scale_intro.stop(), this.game.deadTimeout && (clearTimeout(this.game.deadTimeout), this.game.deadTimeout = null), this.game.pendingReset = !1, this.modeCtrl.onViewerStart(), this.reporter.joinAudienceReport();
    }
  }, {
    key: "wxOnShow",
    value: function (e) {
      var t = this;
      this.netWorkCtrl.requestServerInit(), this.netWorkCtrl.requestMmpayTimeout(), this.reporter.setTimer(h.REPORTERTIMEOUT), u.default.getSelectedBottleSkinResource().then(function () {}, function () {}), setTimeout(function () {
        e.query && e.query.hasOwnProperty("mode") ? (t.reUpLoadShowOverPage = !1, t.modeCtrl.reInitFirstPage(e), t.game.guider = !1) : "single" != t.model.mode && "rankGameChallenge" != t.model.mode && "player" != t.model.mode && "battle" != t.model.mode && "relay" != t.model.mode ? (console.log("!!! gameCtrl wxOnShow changeMode", t.model.mode), t.reUpLoadShowOverPage = !1, t.modeCtrl.changeMode("singleCtrl"), t.game.guider = !1) : t.reviewCtrl.isInThisPage ? t.reviewCtrl.continue() : t.modeCtrl.wxOnShow();
      }, 300);
    }
  }, {
    key: "wxOnhide",
    value: function () {
      this.reporter.quitReport(), "observe" == this.model.mode ? this.reporter.joinAudienceReport() : this.reviewCtrl.isInThisPage && this.reviewCtrl.pausePlay(), this.netWorkCtrl.clearServerInit(), this.netWorkCtrl.clearMmpayTimeout(), this.reporter.clearTimer(), this.reporter.sendReport(), this.modeCtrl.wxOnhide();
    }
  }, {
    key: "onReplayGame",
    value: function () {
      "observe" != this.model.mode && (this.reporter.playGameReportStart(), this.reporter.gameBeginReport());
    }
  }, {
    key: "onPeopleCome",
    value: function (e) {
      0 == e.audience_cmd ? (this.viewer.peopleCome(e), this.reporter.playAudienceReportMaxPeople(this.viewer.num)) : 1 == e.audience_cmd && this.viewer.peopleOut(e);
    }
  }, {
    key: "onServerConfigForbid",
    value: function () {}
  }, {
    key: "onSocketCloseErr",
    value: function () {
      console.log("!!! gameCtrl onSocketCloseErr", this.model.mode), "relay" === this.game.mode ? this.modeCtrl.onSocketCloseErr() : (this.gameView.showSocketCloseErr(), this.modeCtrl.changeMode("singleCtrl"));
    }
  }, {
    key: "appealNotify",
    value: function () {
      this.modeCtrl.appealNotify();
    }
  }, {
    key: "checkLaterUpLoad",
    value: function (e) {
      var t = this,
        r = this.model.getActionData();
      if (r && r.ts > Date.now() && r.score) {
        var o = r.score,
          i = r.data,
          a = this.historyTimes.getTimes();
        e ? this.netWorkCtrl.requestSettlement(o, a, this.afterCheckLaterUpLoad.bind(this, o), i) : wx.showModal({
          title: "提示",
          content: "当前有分数未上传成功，是否重试",
          confirmText: "重试",
          cancelText: "取消",
          success: function (e) {
            e.confirm ? t.netWorkCtrl.requestSettlement(o, a, t.afterCheckLaterUpLoad.bind(t, o), i) : e.cancel ? t.model.clearLaterUpLoadScore() : t.checkLaterUpLoad();
          },
          fail: function () {
            t.checkLaterUpLoad();
          }
        });
      }
    }
  }, {
    key: "touchProp",
    value: function (e) {
      this.modeCtrl.touchProp(e);
    }
  }, {
    key: "afterCheckLaterUpLoad",
    value: function (e, t, r) {
      var o = this;
      if (t) return wx.showToast({
        title: "分数上传成功",
        icon: "success",
        duration: 1e3
      }), this.model.clearLaterUpLoadScore(), e > this.model.weekBestScore && (this.model.weekBestScore = e, this.model.saveWeekBestScore(e)), void (e > this.model.highestScore && this.model.saveHeighestScore(e));
      wx.showModal({
        title: "提示",
        content: "分数延后上传失败,请检查网络状态后重试(" + r + ")",
        confirmText: "重试",
        cancelText: "延后上传",
        success: function (e) {
          e.confirm ? o.checkLaterUpLoad(!0) : e.cancel || o.afterCheckLaterUpLoad(!1, r);
        },
        fail: function () {
          o.afterCheckLaterUpLoad(!1, r);
        }
      });
    }
  }, {
    key: "handleAd",
    value: function (e, t) {
      this.modeCtrl.handleAd(t);
    }
  }, {
    key: "onSocketOpen",
    value: function () {
      this.modeCtrl.onSocketOpen();
    }
  }, {
    key: "gotoRelayMode",
    value: function () {
      this.reporter.reportGotoRelayMode(), this.modeCtrl.gotoRelayMode();
    }
  }, {
    key: "skipRelayBeginner",
    value: function () {
      this.modeCtrl.skipRelayBeginner();
    }
  }, {
    key: "outRelay1",
    value: function () {
      this.reporter.relayBackStart(), this.modeCtrl.outRelay1();
    }
  }, {
    key: "outRelay2",
    value: function () {
      this.reporter.relayBackStart(), this.modeCtrl.outRelay2();
    }
  }, {
    key: "startRelay",
    value: function (e) {
      this.modeCtrl.startRelay(e);
    }
  }, {
    key: "watchRelay",
    value: function () {
      this.modeCtrl.watchRelay(), this.reporter.rpWatchRelay();
    }
  }, {
    key: "replayRelay",
    value: function () {
      this.modeCtrl.replayRelay();
    }
  }, {
    key: "shareRelay",
    value: function () {
      this.modeCtrl.shareRelay();
    }
  }, {
    key: "shareRelayLive",
    value: function (e) {
      this.modeCtrl.shareRelayLive(e);
    }
  }, {
    key: "afterShownStartPage",
    value: function () {
      this.reporter.reportStartPage(), this.modeCtrl.afterShownStartPage();
    }
  }]);
  var e;
}();
