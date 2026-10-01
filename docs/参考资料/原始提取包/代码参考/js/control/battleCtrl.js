// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
require("../../@babel/runtime/helpers/Arrayincludes"), Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0, require("../../@babel/runtime/helpers/Arrayincludes");
var t = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  a = require("../../@babel/runtime/helpers/asyncToGenerator"),
  o = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  r = e(require("../pages/battle/battlePkPage")),
  l = e(require("../pages/battle/battleGamePage")),
  s = e(require("../network/network")),
  n = require("../chattool"),
  h = e(require("../store/session"));
exports.default = function () {
  return i(function e(t, a) {
    o(this, e), this.name = "battle", this.game = t, this.gameCtrl = this.game.gameCtrl, this.model = this.game.gameModel, this.view = this.game.gameView, this.modeCtrl = a, this.netWorkCtrl = this.gameCtrl.netWorkCtrl, this.currentPage = null, this.pkPage = new r.default(t), this.gamePage = new l.default(t), this.shareTicket = "", this.pkId = "", this.shareInfoTimeout = null, this.battleScore = void 0;
  }, [{
    key: "init",
    value: function (e) {
      var t = this.model.getSessionId();
      this.shareTicket = e.shareTicket, this.pkId = e.query.pkId, h.default.setPkId(this.pkId), this.model.setStage(""), wx.showLoading(), t ? this.afterLogin(!0) : this.netWorkCtrl.netWorkLogin(this.afterLogin.bind(this));
    }
  }, {
    key: "afterLogin",
    value: function (e) {
      var t = this;
      console.log("!!! battleCtrl afterLogin", e), e ? (this.setShareInfoTimeout(), wx.getGroupEnterInfo({
        allowSingleChat: !0,
        needGroupOpenID: !0,
        success: function (e) {
          console.log("!!! wx.getGroupEnterInfo success", e), null != t.shareInfoTimeout ? (console.log("没有触发定时器"), t.clearShareInfoTimeout(), t.model.setShareTicket(e.encryptedData), t.gotoBattlePage(), t.gameCtrl.loginBattle(1)) : console.log("已经触发定时器");
        },
        fail: function (e) {
          console.error("!!! wx.getGroupEnterInfo fail", e), null != t.shareInfoTimeout ? (t.clearShareInfoTimeout(), console.log("没有触发定时器"), t.gotoBattlePage(), t.gameCtrl.loginBattle(0)) : console.log("已经触发定时器");
        }
      })) : this.goToBattleFail();
    }
  }, {
    key: "gotoBattlePage",
    value: (e = a(t().mark(function e() {
      var a, o, i, r, l;
      return t().wrap(function (e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (console.log("!!! battleCtrl gotoBattlePage", this.pkId), this.pkId) {
              e.next = 1;
              break;
            }
            return console.error("!!! battleCtrl gotoBattlePage pkId is null"), this.goToBattleFail(), e.abrupt("return");
          case 1:
            return e.prev = 1, e.next = 2, (0, n.getGroupEnterInfo)(this.pkId);
          case 2:
            a = e.sent, o = a.activity_id, i = a.group_openid, this.model.chatToolActivityId = o, this.model.groupOpenid = i, e.next = 4;
            break;
          case 3:
            e.prev = 3, null != (l = e.catch(1)) && null !== (r = l.errMsg) && void 0 !== r && r.includes("fail invalid scene") ? console.log("擂主创建后进入擂台赛，没有群聊信息") : console.error("!!! battleCtrl gotoBattlePage getGroupEnterInfo fail", l);
          case 4:
            s.default.getBattleData(this.gotoBattlePageAfterHaveData.bind(this), this.pkId);
          case 5:
          case "end":
            return e.stop();
        }
      }, e, this, [[1, 3]]);
    })), function () {
      return e.apply(this, arguments);
    })
  }, {
    key: "gotoBattlePageAfterHaveData",
    value: function (e, t) {
      if (console.log("!!! battleCtrl gotoBattlePageAfterHaveData", e, t), wx.hideLoading(), e) {
        var a = [];
        t.data.challenger.length && t.data.challenger.forEach(function (e) {
          a.push({
            headimg: e.headimg,
            is_self: e.is_self ? 1 : 0,
            nickname: e.nickname,
            score_info: [{
              score: e.score
            }]
          });
        }, this), a.sort(function (e, t) {
          return t.score_info[0].score - e.score_info[0].score;
        }), this.model.championScore = t.data.owner.score;
        var o = {
          organizerInfo: {
            headimg: t.data.owner.headimg,
            nickname: t.data.owner.nickname,
            score_info: [{
              score: t.data.owner.score
            }],
            left_time: t.data.left_time,
            is_self: t.data.is_owner ? 1 : 0
          },
          pkListInfo: a,
          gg_score: this.battleScore
        };
        this.currentPage && this.currentPage.hide(), this.pkPage.show(o), this.model.setStage(this.pkPage.name), this.currentPage = this.pkPage, this.gameCtrl.showPkPage(t.data.owner.score), this.model.chatToolActivityId ? t.data.left_time <= 0 && s.default.sendChatToolMsg({
          data: {
            activity_id: this.model.chatToolActivityId,
            target_state: 3,
            room_id: this.pkId
          }
        }).catch(function (e) {
          console.error("!!! 未发送聊天模式消息：", e);
        }) : console.warn("!!! gotoBattlePageAfterHaveData chatToolActivityId is null");
      } else this.goToBattleFail();
    }
  }, {
    key: "goToBattleFail",
    value: function () {
      console.log("!!! battleCtrl goToBattleFail"), this.view.showGoToBattleFail(), this.modeCtrl.changeMode("singleCtrl");
    }
  }, {
    key: "setShareInfoTimeout",
    value: function () {
      this.shareInfoTimeout = setTimeout(this.handleShareInfoTimeout.bind(this), 1e4);
    }
  }, {
    key: "clearShareInfoTimeout",
    value: function () {
      null != this.shareInfoTimeout && (clearTimeout(this.shareInfoTimeout), this.shareInfoTimeout = null);
    }
  }, {
    key: "handleShareInfoTimeout",
    value: function () {
      console.log("!!! battleCtrl handleShareInfoTimeout"), this.clearShareInfoTimeout(), this.goToBattleFail();
    }
  }, {
    key: "destroy",
    value: function () {
      this.currentPage && this.currentPage.hide(), this.model.setStage(""), wx.hideLoading(), this.shareTicket = "", this.pkId = "", this.clearShareInfoTimeout(), this.model.clearShareTicket(), this.game.resetScene(), this.battleScore = void 0;
    }
  }, {
    key: "battlePlay",
    value: function (e) {
      console.log("!!! battleCtrl battlePlay", e, this.model), e ? (this.currentPage && this.currentPage.hide(), this.gamePage.show(), this.game.replayGame(), this.model.setStage(this.gamePage.name), this.currentPage = this.gamePage) : (this.modeCtrl.directPlaySingleGame(), this.gameCtrl.battleToSingle());
    }
  }, {
    key: "showGameOverPage",
    value: function () {
      this.currentPage && this.currentPage.hide(), this.model.setStage(""), this.currentPage = null;
      var e = this.model.currentScore;
      this.battleScore = e, wx.showLoading(), s.default.updatepkinfo(this.gotoBattlePageAgain.bind(this), this.pkId, e), this.model.chatToolActivityId && this.model.groupOpenid ? s.default.sendChatToolMsg({
        data: {
          activity_id: this.model.chatToolActivityId,
          target_state: 1,
          participator_info_list: [{
            group_openid: this.model.groupOpenid,
            state: 1
          }],
          room_id: this.pkId
        }
      }).catch(function (e) {
        console.error("!!! 未发送聊天模式消息：", e);
      }) : console.warn("!!! battleCtrl showGameOverPage chatToolActivityId or groupOpenid is null");
    }
  }, {
    key: "gotoBattlePageAgain",
    value: function (e) {
      e || this.view.showUploadPkScoreFail(), this.gotoBattlePage();
    }
  }, {
    key: "wxOnhide",
    value: function () {}
  }]);
  var e;
}();
