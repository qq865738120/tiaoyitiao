// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default,
  t = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
require("../../@babel/runtime/helpers/Arrayincludes"), Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0, require("../../@babel/runtime/helpers/Arrayincludes");
var i = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  s = t(require("../lib/three")),
  n = require("../config"),
  r = e(require("../text")),
  o = require("../lib/animation"),
  l = require("./pages2d/base"),
  h = require("./pages2d/start"),
  c = require("./pages2d/beginner"),
  y = require("./pages2d/lookers"),
  u = require("./pages2d/pk"),
  p = require("./pages2d/rank"),
  d = require("./pages2d/gg"),
  v = require("./pages2d/verify"),
  T = require("./pages2d/relay"),
  f = require("./pages2d/record"),
  m = require("./pages2d/profile"),
  g = require("./pages2d/msg"),
  k = require("./pages2d/skin"),
  w = require("./pages2d/shareskin"),
  A = e(require("../lib/mue/eventcenter")),
  E = e(require("./headimgAnimation")),
  _ = require("../network/getAuth"),
  S = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio,
  R = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth,
  x = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
  P = x * S,
  b = R * S,
  C = ["btn", "list1", "list2", "bg"],
  N = n.FRUSTUMSIZE,
  Y = (wx.loadFont("res/num.ttf"), !1);
wx.onGameLiveStateChange && wx.onGameLiveStateChange(function (e) {
  var t = "start" === e.state;
  Y !== t && (Y = t, A.default.emit(n.EVENT.LIVESTATECHANGE, {
    isLive: t
  }));
});
exports.default = function () {
  return a(function e(t) {
    var a = this;
    i(this, e), this.model = t.model, this.texture = {}, this.material = {}, this.geometry = {}, this.obj = {}, this.canvas = {}, this.context = {}, this._touchInfo = {
      trackingID: -1,
      maxDy: 0,
      maxDx: 0
    }, this.maxscroll = 0, this.options = Object.assign({}, {}, t), this.imgid = {
      btn: 0,
      bg: 0,
      list1: 0,
      list2: 0
    }, this.options.onGroupShare = t.onGroupShare, this.options.friendRankReturn = t.friendRankReturn, this.options.groupPlayGame = t.groupPlayGame, this.options.onClickRank = t.onClickRank, this.options.onClickReplay = t.onClickReplay, this.options.onClickShare = t.onClickShare, this.options.onClickPkRule = t.onClickPkRule, this.options.onClickPureShare = t.onClickPureShare, this.options.onClickStart = t.onClickStart, this.options.onShowFriendRank = t.onShowFriendRank, this.options.onBattlePlay = t.onBattlePlay, this.options.onSubscribePk = t.onSubscribePk, this.options.onLookersStart = t.onLookersStart, this.options.newRelay = t.newRelay, this.options.outRelay1 = t.outRelay1, this.options.outRelay2 = t.outRelay2, this.options.startRelay = t.startRelay, this.options.shareRelay = t.shareRelay, this.options.shareRelayLive = t.shareRelayLive, this.options.replayRelay = t.replayRelay, this.options.skipRelayBeginner = t.skipRelayBeginner, this.options.getRelayQr = t.getRelayQr, this.options.quitRecord = t.quitRecord, A.default.on(n.EVENT.RELAYSTART, function (e, t) {
      a.hide2D(), a.relayHeadImg || (a.relayHeadImg = new E.default()), a.relayText || (a.relayText = new s.Object3D(), a.turnText = new r.default("轮到你了！", {
        fillStyle: 4209243,
        chinese: !0,
        textAlign: "left"
      }), a.relayText.add(a.turnText.obj), a.outText = new r.default("被淘汰了！", {
        fillStyle: 4209243,
        chinese: !0,
        textAlign: "left"
      }), a.relayText.add(a.outText.obj), a.relayText.scale.set(1.5, 1.5, 1.5), a.relayText.position.x = -13.8, a.relayText.position.y = 11.5), a.options.camera.add(a.relayText), a.outText.obj.visible = !1, a.turnText.obj.visible = !1, a.relayHeadImg.set(t.playerlist), a.options.camera.add(a.relayHeadImg.obj), a.relayHeadImg.obj.position.x = -8.8, a.relayHeadImg.obj.position.y = 20, P / b < 736 / 414 && (a.relayHeadImg.obj.position.y = 14, a.relayText.position.y = 6), t.my_seat_no == t.now_player_seat_no && (a.turnText.obj.visible = !0, a.outText.obj.visible = !1);
    }), A.default.on(n.EVENT.SYNCSCENE, function (e, t) {
      a.hide2D(), a.relayHeadImg || (a.relayHeadImg = new E.default()), a.relayText || (a.relayText = new s.Object3D(), a.turnText = new r.default("轮到你了！", {
        fillStyle: 4209243,
        chinese: !0,
        textAlign: "left"
      }), a.relayText.add(a.turnText.obj), a.outText = new r.default("被淘汰了！", {
        fillStyle: 4209243,
        chinese: !0,
        textAlign: "left"
      }), a.relayText.add(a.outText.obj), a.relayText.scale.set(1.5, 1.5, 1.5), a.relayText.position.x = -13.8, a.relayText.position.y = 11.5), a.options.camera.add(a.relayText);
      var i = t.serverData.playerlist;
      i = i.slice(t.serverData.now_player_index, i.length).concat(i.slice(0, t.serverData.now_player_index)), console.log("围观看到的头像1：", i, t.serverData.now_player_index), i = i.filter(function (e) {
        return 0 === e.rank;
      }), console.log("围观看到的头像2：", i), a.options.camera.add(a.relayHeadImg.obj), a.relayHeadImg.obj.position.x = -8.8, a.relayHeadImg.obj.position.y = 20, t.serverData.my_seat_no == t.serverData.now_player_seat_no ? (a.turnText.obj.visible = !0, a.outText.obj.visible = !1, a.relayHeadImg.set(i, {
        timeout: !0
      })) : (a.turnText.obj.visible = !1, a.outText.obj.visible = !1, a.relayHeadImg.set(i));
    }), A.default.on(n.EVENT.ORDERRUNGAME, function (e, t) {
      a.relayHeadImg || (a.relayHeadImg = new E.default()), a.relayHeadImg.next(t), t.my_seat_no == t.now_player_seat_no ? (a.turnText.obj.visible = !0, a.outText.obj.visible = !1) : (a.turnText.obj.visible = !1, a.outText.obj.visible = !1);
    }), A.default.on(n.EVENT.PLAYERDIED, function (e, t) {
      if (a.canvasType == l.CANVASTYPE.relayRoom) {
        a.outText.obj.visible = !0, a.turnText.obj.visible = !1;
        var i = t.playerlist.filter(function (e) {
          return 0 === e.rank;
        });
        t.my_seat_no == t.now_player_seat_no && i.length > 2 && a.showRelayGG({
          all_player: t.player_count,
          my_rank: t.player_rank
        });
      }
    }), A.default.on(n.EVENT.RECEIVEMINICODE, function (e, t) {
      a.showRelayQr(t);
    }), A.default.on(n.EVENT.ENDGAME, function (e, t) {
      var i;
      console.log("!!! ENDGAME", e, t), a.relayHeadImg && a.options.camera.remove(a.relayHeadImg.obj), a.relayText && a.options.camera.remove(a.relayText);
      var s = 0,
        n = t.my_seat_no,
        r = t.playerlist.find(function (e) {
          return e.seat_no === n;
        });
      r && r.rank >= 0 && (s = r.rank + 1), o.TweenAnimation.killAll(), a.showRelayRank({
        isLive: null === (i = GameGlobal.liveRooms) || void 0 === i ? void 0 : i.includes(t.room_id),
        room_owner_seat: t.room_owner_seat,
        players: t.playerlist,
        my_seat_no: t.my_seat_no,
        my_rank: s,
        total_score: t.score
      });
    }), A.default.on(n.EVENT.RELAYMODEDESTROY, function (e, t) {
      a.relayHeadImg && a.relayHeadImg.obj && (a.outText.obj.visible = a.turnText.obj.visible = !1, a.options.camera.remove(a.relayText), a.options.camera.remove(a.relayHeadImg.obj));
    }), A.default.on(n.EVENT.LIVESTATECHANGE, function (e, t) {
      var i;
      a.opt.isLive = t.isLive, "relayRoom" === (null === (i = a.routesArr) || void 0 === i ? void 0 : i.slice(-1)[0]) && (0, T.drawRelayRoomPage)(a);
    }), wx.onShareInvitationToLiveRoom && wx.onShareInvitationToLiveRoom(function () {
      var e, t;
      if ("relayRoom" === (null === (e = a.routesArr) || void 0 === e ? void 0 : e.slice(-1)[0]) && null !== (t = a.model.relayInfo) && void 0 !== t && t.activity_id) {
        var i = a.model.relayInfo,
          s = i.room_id,
          r = i.activity_id,
          o = i.router_id,
          l = n.VERSION;
        return {
          title: "来跳一跳接龙",
          query: "is_live=true&room_id=".concat(s, "&mode=relay&router_id=").concat(encodeURIComponent(o), "&version=").concat(l, "&activity_id=").concat(r),
          activityId: r,
          templateInfo: {
            parameterList: [{
              name: "member_count",
              value: a.opt.players.length
            }, {
              name: "room_limit",
              value: n.ROOM_LIMIT
            }]
          },
          subTitle: "".concat(a.opt.game_level_s, "难度")
        };
      }
      return {
        onError: function () {
          wx.showToast({
            icon: "none",
            title: "自动创建房间失败，请通过主页“多人游戏”手动创建房间并重试"
          });
        },
        promise: new Promise(function (e, t) {
          a.options.newRelay && a.options.newRelay(), A.default.on(n.EVENT.RELAYCREATEROOM, function (t, i) {
            a.model.relayInfo.is_live_master = !0;
            var s = i.room_id,
              r = i.activity_id,
              o = i.router_id,
              l = n.VERSION,
              h = "is_live=true&room_id=".concat(s, "&mode=relay&router_id=").concat(encodeURIComponent(o), "&version=").concat(l, "&activity_id=").concat(r);
            e({
              title: "来跳一跳接龙",
              query: h,
              activityId: r,
              templateInfo: {
                parameterList: [{
                  name: "member_count",
                  value: "1"
                }, {
                  name: "room_limit",
                  value: n.ROOM_LIMIT
                }]
              },
              subTitle: "低难度"
            });
          });
        })
      };
    });
  }, [{
    key: "showFriendRankList",
    value: function (e) {
      this.opt = e || {}, (0, p.drawFriendRankList)({
        self: this
      });
    }
  }, {
    key: "showGroupRankList",
    value: function (e, t) {
      (0, p.drawGroupRankList)(this, e, t);
    }
  }, {
    key: "showGameOverPage",
    value: function (e) {
      e = e || {}, this.opt = e, (0, d.routeGameOver)(this);
    }
  }, {
    key: "showStartPage",
    value: function (e) {
      l.DEBUGVIEW || (this.opt = e || {}, (0, h.drawStartPage)(this));
    }
  }, {
    key: "updateStartPage",
    value: function () {
      this.canvasType == l.CANVASTYPE.start && 1 != this.opt.hideRank && (0, h.drawStartUpdate)(this);
    }
  }, {
    key: "showPkRulePage",
    value: function (e) {
      this.opt = e, (0, u.drawPkRulePage)({
        self: this
      });
    }
  }, {
    key: "showPkPage",
    value: function (e) {
      this.opt = e, (0, u.drawPkPage)({
        self: this
      });
    }
  }, {
    key: "showLookersPage",
    value: function (e) {
      this.opt = e, (0, y.drawLookersPage)({
        self: this
      });
    }
  }, {
    key: "showRecordPage",
    value: function (e) {
      this.opt = e, (0, f.drawRecordPage)({
        self: this
      });
    }
  }, {
    key: "showRecordSharePage",
    value: function (e) {
      this.opt = e, (0, f.drawRecordSharePage)(this);
    }
  }, {
    key: "showBeginnerPage",
    value: function () {
      (0, c.drawBeginnerPage)({
        self: this
      });
    }
  }, {
    key: "showRelayRoom",
    value: function (e, t) {
      this.relayOpt = e, (this.canvasType != l.CANVASTYPE.relayQr || t) && (this.opt = e, (0, T.drawRelayRoomPage)(this));
    }
  }, {
    key: "showRelayGG",
    value: function (e) {
      this.opt = e, (0, T.drawRelayGG)(this);
    }
  }, {
    key: "showRelaying",
    value: function (e) {
      this.opt = e, (0, T.drawRelaying)(this);
    }
  }, {
    key: "showRelayLookers",
    value: function (e) {
      this.opt = e, (0, T.drawRelayLookers)(this);
    }
  }, {
    key: "showRelayRank",
    value: function (e) {
      this.opt = e, (0, T.drawRelayRank)(this);
    }
  }, {
    key: "showRelayBeginner",
    value: function (e) {
      this.opt = e, (0, T.drawRelayBeginner)(this);
    }
  }, {
    key: "showRelayQr",
    value: function (e) {
      this.opt = e, (0, T.drawRelayQr)(this);
    }
  }, {
    key: "showProfile",
    value: function (e) {
      this.opt = e, (0, m.drawProfile)(this);
    }
  }, {
    key: "updateProfilePraise",
    value: function (e) {
      this.opt.praise_info = e.praise_info, e.propsData && (this.opt.propsData = e.propsData), (0, m.drawProfileUpdate)(this);
    }
  }, {
    key: "showMsgBox",
    value: function (e) {
      this.opt = e, (0, g.drawMsgBox)(this);
    }
  }, {
    key: "updateMsgBox",
    value: function (e) {
      this.canvasType == l.CANVASTYPE.msgBox && (this.opt.msg_list = this.opt.msg_list.concat(e), (0, g.updateMsgBox)(this));
    }
  }, {
    key: "showSkin",
    value: function (e) {
      this.opt = e, console.log(e), (0, k.drawSkin)(this);
    }
  }, {
    key: "updateSkin",
    value: function (e) {
      this.opt.new_id = e.id, (0, k.updateSkinUseStatus)(this);
    }
  }, {
    key: "showShareSkin",
    value: function (e) {
      this.opt = e, (0, w.drawShareSkin)(this);
    }
  }, {
    key: "showGetNewSkin",
    value: function (e) {
      this.opt = e, (0, d.drawGetNewSkin)(this);
    }
  }, {
    key: "showJiLiAdGetPropPage",
    value: function (e) {
      this.opt = e, (0, d.drawJiLiAdGetPropPage)(this);
    }
  }, {
    key: "showMsgDetailType5",
    value: function (e) {
      this.opt = e, (0, g.drawMsgDetailType5)(this);
    }
  }, {
    key: "hide2D",
    value: function () {
      (0, l.hide)(this);
    }
  }, {
    key: "hide2DGradually",
    value: function () {
      if (!l.DEBUGVIEW) for (var e = this, t = 0; t < C.length; t++) this.obj[C[t]] && o.customAnimation.to(this.material[C[t]], 1, {
        opacity: 0,
        onComplete: function (t) {
          return function () {
            e.material[C[t]].opacity = 1, e.obj[C[t]].visible = !1, e.showState = !1, e.options.camera.remove(e.obj[C[t]]);
          };
        }(t)
      });
    }
  }, {
    key: "_findDelta",
    value: function (e) {
      var t = this._touchInfo,
        i = e.touches[0] || e.changedTouches[0];
      return i ? {
        x: i.pageX - t.x,
        y: i.pageY - t.y
      } : null;
    }
  }, {
    key: "doTouchStartEvent",
    value: function (e) {
      if (this.showState) {
        var t = e.changedTouches[0].pageX,
          i = e.changedTouches[0].pageY;
        if (this.startX = t, this.startY = i, this.canvasType == l.CANVASTYPE.friendRank || this.canvasType == l.CANVASTYPE.groupRank || this.canvasType == l.CANVASTYPE.pk || this.canvasType == l.CANVASTYPE.relayRank || this.canvasType == l.CANVASTYPE.msgBox || this.canvasType == l.CANVASTYPE.shareSkin || this.canvasType == l.CANVASTYPE.pkRule) {
          var a = this._touchInfo,
            s = this.scrollHandler;
          if (!s) return;
          a.trackingID = "touch", a.x = e.touches[0].pageX, a.y = e.touches[0].pageY, a.maxDx = 0, a.maxDy = 0, a.historyX = [0], a.historyY = [0], a.historyTime = [+new Date()], a.listener = s, s.onTouchStart && s.onTouchStart();
        } else this.canvasType == l.CANVASTYPE.gameOver ? (t = this._cxp(t), i = this._cyp(i), "skin" != this.opt.type && "tired" != this.opt.type && t > 207 && t < 360 && i > 540 && i < 660 && this._drawGameOverBtnClick()) : this.canvasType == l.CANVASTYPE.start && (t = this._cxp(t), i = this._cyp(i), t > 86 && t < 318 && i > 458 && i < 552 && this._drawStartClick());
      }
    }
  }, {
    key: "doTouchMoveEvent",
    value: function (e) {
      if (this.showState && (this.canvasType == l.CANVASTYPE.friendRank || this.canvasType == l.CANVASTYPE.groupRank || this.canvasType == l.CANVASTYPE.pk || this.canvasType == l.CANVASTYPE.relayRank || this.canvasType == l.CANVASTYPE.msgBox || this.canvasType == l.CANVASTYPE.shareSkin)) {
        var t = this._touchInfo;
        if (-1 == t.trackingID) return;
        e.preventDefault();
        var i = this._findDelta(e);
        if (!i) return;
        t.maxDy = Math.max(t.maxDy, Math.abs(i.y)), t.maxDx = Math.max(t.maxDx, Math.abs(i.x));
        var a = +new Date();
        for (t.historyX.push(i.x), t.historyY.push(i.y), t.historyTime.push(a); t.historyTime.length > 10;) t.historyTime.shift(), t.historyX.shift(), t.historyY.shift();
        t.listener && t.listener.onTouchMove && t.listener.onTouchMove(i.x, i.y, a);
      }
    }
  }, {
    key: "doTouchEndEvent",
    value: function (e) {
      if (console.log("!!! doTouchEndEvent", this.canvasType), this.showState) {
        var t = e.changedTouches[0].pageX,
          i = e.changedTouches[0].pageY,
          a = i,
          s = !0;
        if (this.canvasType != l.CANVASTYPE.friendRank && this.canvasType != l.CANVASTYPE.groupRank && this.canvasType != l.CANVASTYPE.pk && this.canvasType != l.CANVASTYPE.relayRank && this.canvasType != l.CANVASTYPE.msgBox && this.canvasType != l.CANVASTYPE.record && this.canvasType != l.CANVASTYPE.shareSkin || !(Math.abs(t - this.startX) > 5 || Math.abs(i - this.startY) > 5) || (s = !1), t = this._cxp(t), i = this._cyp(i), this.canvasType == l.CANVASTYPE.start && this._drawStartClickRevert(), s) {
          if (this.canvasType == l.CANVASTYPE.gameOver && !1 === (0, d.gameOverEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.groupRank && !1 === (0, p.groupRankEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.friendRank && !1 === (0, p.friendRankEve)(this, t, i, this._cyp(a - this.lastScrollY))) return !1;
          if (this.canvasType == l.CANVASTYPE.start && !1 === (0, h.startEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.pk && !1 === (0, u.pkEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.pkRule && !1 === (0, u.pkRuleEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.lookers && !1 === (0, y.lookersEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.verify && !1 === (0, v.verifyEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.relayRoom && !1 === (0, T.relayRoomEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.relayRank && !1 === (0, T.relayRankEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.relayGG && !1 === (0, T.relayGGEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.relayBeginner && !1 === (0, T.relayBeginnerEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.relayQr && !1 === (0, T.relayQrEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.record && !1 === (0, f.recordEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.recordShare && !1 === (0, f.recordShareEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.profile && !1 === (0, m.profileEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.msgBox && !1 === (0, g.msgBoxEve)(this, t, i, this._cyp(a - this.lastScrollY))) return !1;
          if (this.canvasType == l.CANVASTYPE.skinList && !1 === (0, k.skinListEve)(this, t, i, this._cyp(a - this.lastScrollY))) return !1;
          if (this.canvasType == l.CANVASTYPE.getNewSkin && !1 === (0, d.getNewSkinEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.shareSkin && !1 === (0, w.shareSkinEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.jiliProp && !1 === (0, d.drawJiLiAdGetPropPageEve)(this, t, i)) return !1;
          if (this.canvasType == l.CANVASTYPE.msgDetail5 && !1 === (0, g.drawMsgDetailType5Eve)(this, t, i)) return !1;
          this.canvasType == l.CANVASTYPE.gameOver && "tired" != this.opt.type && "skin" != this.opt.type && this._drawGameOverBtnClickRevert();
        } else {
          var n = this._touchInfo;
          if (-1 == n.trackingID) return;
          e.preventDefault();
          var r = this._findDelta(e);
          if (!r) return;
          var o = n.listener;
          n.trackingID = -1, n.listener = null;
          var c = {
            x: 0,
            y: 0
          };
          if (n.historyTime.length > 2) for (var A = n.historyTime.length - 1, E = n.historyTime[A], _ = n.historyX[A], S = n.historyY[A]; A > 0;) {
            A--;
            var R = E - n.historyTime[A];
            if (R > 30 && R < 50) {
              c.x = (_ - n.historyX[A]) / (R / 1e3), c.y = (S - n.historyY[A]) / (R / 1e3);
              break;
            }
          }
          n.historyTime = [], n.historyX = [], n.historyY = [], o && o.onTouchEnd && o.onTouchEnd(r.x, r.y, c);
        }
      }
    }
  }, {
    key: "doClickEvent",
    value: function (e) {}
  }, {
    key: "updatePosition",
    value: function (e) {
      var t;
      e > 0 && (e = 0);
      var i = (0, l.cwh)(720) / P * N,
        a = (0, l.cwh)(720),
        s = 12;
      this.canvasType != l.CANVASTYPE.friendRank && this.canvasType != l.CANVASTYPE.groupRank || (t = -(this._cy(157) + a / 2 - P / 2) / P * N), this.canvasType == l.CANVASTYPE.pk && (t = -(this._cy(437) + a / 2 - P / 2) / P * N), this.canvasType == l.CANVASTYPE.relayRank && (t = -(this._cy(404) + a / 2 - P / 2) / P * N, 1 != this.opt.my_rank && (t = -(this._cy(318) + a / 2 - P / 2) / P * N), this.opt.isOutDate && (t = -(this._cy(225) + a / 2 - P / 2) / P * N)), this.canvasType == l.CANVASTYPE.msgBox && (t = -(this._cy(136) + a / 2 - P / 2) / P * N, s = 8), this.canvasType == l.CANVASTYPE.shareSkin && (t = -(this._cy(278) + a / 2 - P / 2) / P * N);
      var n = Math.floor((t - N * e / x) / i);
      if (this.lastN != n && this.lastN - n < 0) n % 2 == 0 ? this._drawList((n + 1) * s, "list2") : this._drawList((n + 1) * s, "list1");else if (this.lastN != n && this.lastN - n > 0) {
        var r = n;
        -1 == r && (r = 1), n % 2 == 0 ? this._drawList(n * s, "list1") : this._drawList(r * s, "list2");
      }
      n % 2 == 0 ? (this.obj.list1.position.y = t - N * e / x - n * i, this.obj.list2.position.y = t - N * e / x - (n + 1) * i) : (this.obj.list2.position.y = t - N * e / x - n * i, this.obj.list1.position.y = t - N * e / x - (n + 1) * i), this.lastN = n, this.lastScrollY = e, this.maxscroll = Math.min(this.lastScrollY, this.maxscroll);
    }
  }, {
    key: "_drawList",
    value: function (e, t) {
      this.canvasType != l.CANVASTYPE.pk ? this.canvasType == l.CANVASTYPE.friendRank || this.canvasType == l.CANVASTYPE.groupRank ? (0, p.drawRankList)(this, e, t) : this.canvasType == l.CANVASTYPE.relayRoom ? (0, T.drawRelayList)(this, e, t) : this.canvasType == l.CANVASTYPE.msgBox ? (this.lastScrollY <= this.maxscroll && !this.pending && (this.pending = !0, this.opt.onEnd && this.opt.onEnd()), (0, g.drawMsgList)(this, e, t)) : this.canvasType == l.CANVASTYPE.shareSkin && (0, w.drawShareSkinList)(this, e, t) : (0, u.drawPkList)(this, e, t);
    }
  }, {
    key: "_drawAuthModal",
    value: function () {
      var e = this;
      this.needAuth = !0, this.context.btn.clearRect(this._cx(207), this._cy(355), (0, l.cwh)(320), (0, l.cwh)(144)), this._drawImageCenter("res/2d/auth.png", this._cx(207), this._cy(355), (0, l.cwh)(320), (0, l.cwh)(144), "btn", null, this.imgid.btn), (0, _.createUserInfoButton)("多人游戏邀请", 0, {
        x: 287,
        y: 398,
        width: 160,
        height: 58
      }, function () {
        e.options.skipRelayBeginner();
      });
    }
  }, {
    key: "_drawGameOverBtnClick",
    value: function () {
      this.context.btn.clearRect(this._cx(140), this._cy(this.replayBtnPosy - 80), (0, l.cwh)(232), (0, l.cwh)(134)), this._drawImageCenter("res/replay.png", this._cx(256), this._cy(this.replayBtnPosy), (0, l.cwh)(190), (0, l.cwh)(75), "btn", null, this.imgid.btn);
    }
  }, {
    key: "_drawGameOverBtnClickRevert",
    value: function () {
      this.context.btn.clearRect(this._cx(140), this._cy(this.replayBtnPosy - 80), (0, l.cwh)(232), (0, l.cwh)(134)), this._drawImageCenter("res/replay.png", this._cx(256), this._cy(this.replayBtnPosy), (0, l.cwh)(212), (0, l.cwh)(84), "btn", null, this.imgid.btn);
    }
  }, {
    key: "_drawStartClick",
    value: function () {
      this.context.btn.clearRect(this._cx(91), this._cy(448), (0, l.cwh)(232), (0, l.cwh)(104)), this._drawImageCenter("res/play.png", this._cx(207), this._cy(505), (0, l.cwh)(190), (0, l.cwh)(75), "btn", null, this.imgid.btn);
    }
  }, {
    key: "_drawStartClickRevert",
    value: function () {
      this.context.btn.clearRect(this._cx(91), this._cy(448), (0, l.cwh)(232), (0, l.cwh)(104)), this._drawImageCenter("res/play.png", this._cx(207), this._cy(505), (0, l.cwh)(212), (0, l.cwh)(84), "btn", null, this.imgid.btn);
    }
  }, {
    key: "_cx",
    value: function (e) {
      var t = e * R / 414;
      return x / R < 736 / 414 && (t = e * x / 736 + (R - 414 * x / 736) / 2), t * S;
    }
  }, {
    key: "_cy",
    value: function (e) {
      return (x / R > 736 / 414 ? e * R / 414 + (x - 736 * R / 414) / 2 : e * x / 736) * S;
    }
  }, {
    key: "_cxp",
    value: function (e) {
      return x / R < 736 / 414 ? (e - (R - 414 * x / 736) / 2) / x * 736 : e / R * 414;
    }
  }, {
    key: "_cyp",
    value: function (e) {
      return x / R > 736 / 414 ? (e - (x - 736 * R / 414) / 2) / R * 414 : e / x * 736;
    }
  }, {
    key: "_drawImageCenter",
    value: function (e, t, i, a, s, n, r, o, h) {
      "/0" != e && "/96" != e && "/64" != e && e || (e = "res/ava.png");
      var c = new Image(),
        y = this;
      c.onload = function () {
        y.imgid[n] == o && (y.context[n].drawImage(c, t - a / 2, i - s / 2, a, s), r && r(), h || (0, l.updatePlane)({
          self: y,
          type: n
        }));
      }, c.onerror = function () {
        r && r();
      }, c.src = e;
    }
  }]);
}();
