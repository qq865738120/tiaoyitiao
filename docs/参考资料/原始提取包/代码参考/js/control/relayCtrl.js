// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  o = require("../../@babel/runtime/helpers/asyncToGenerator"),
  i = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  n = require("../config"),
  s = e(require("../lib/mue/eventcenter")),
  r = e(require("../pages/relay/room")),
  l = require("../shareApp"),
  h = e(require("../pages/relay/gamePage")),
  d = e(require("../pages/relay/fakeRoomPage")),
  c = require("../util/forceUpdate"),
  m = require("../network/getAuth"),
  u = e(require("../network/network")),
  f = require("../chattool");
exports.default = function () {
  return a(function e(t, o) {
    i(this, e), this.name = "relay", this.game = t, this.reporter = t.reporter, this.modeCtrl = o, this.gameCtrl = this.game.gameCtrl, this.model = this.game.gameModel, this.view = this.game.gameView, this.netWorkCtrl = this.gameCtrl.netWorkCtrl, this.onSocketOpenCb = function () {}, this.socketTimeout = null, this.gameSocket = this.game.gameSocket, this.reconnectTimeout = null, this.currentPage = null, this.roomPage = new r.default(t), this.gamePage = new h.default(t), this.fakeRoomPage = new d.default(t), this.scene = 1, this.setStartRelayReportTimeOut = null, this.socketMonitor = this.game.socketMonitor;
  }, [{
    key: "init",
    value: function (e) {
      if (e && e.scene) switch (e.scene) {
        case 1044:
          this.scene = 0;
          break;
        default:
          this.scene = 1;
      }
      this.addEvent(), this.createRoomNoAddEvent(e);
    }
  }, {
    key: "createRoomNoAddEvent",
    value: function (e) {
      var t = this;
      this.options = e, e ? this.changePage("fakeRoomPage", 0) : this.changePage("fakeRoomPage", 1), (0, m.getAuthUserInfo)(!1, !1).then(function () {
        t.model.getSessionId() ? t.afterLogin(e, !0) : t.netWorkCtrl.netWorkLogin(t.afterLogin.bind(t, e)), t.isShareCard = !1;
      }).catch(function () {
        t.game.full2D._drawAuthModal();
      });
    }
  }, {
    key: "afterLogin",
    value: function (e, t) {
      var o = this;
      if (!t) return this.view.showJoinRelayFail("n0"), e || s.default.emit(n.EVENT.CREATE_RELAY_ROOM_FAIL, {
        result: 1
      }), void this.modeCtrl.changeMode("singleCtrl");
      if (e) {
        console.log("options12312312312", e);
        var i = e.query.room_id,
          a = decodeURIComponent(e.query.router_id),
          r = e.query.version,
          l = e.shareTicket,
          h = e.query.activityId;
        if (console.log("optionsoptionsoptionsoptions", a), n.VERSION != r) this.rpJoinRoom(1), 1 == (0, c.compareMyVersion)(r) ? (0, c.forceUpdate)(function () {
          o.modeCtrl.changeMode("singleCtrl");
        }, "点击确定，进行版本更新后重试") : (this.view.showVersionMismatching(), this.modeCtrl.changeMode("singleCtrl"));else Array.isArray(GameGlobal.liveRooms) || (GameGlobal.liveRooms = []), e.query.is_live && GameGlobal.liveRooms.push(i), this.model.relayInfo = {
          activityId: h,
          room_id: i,
          router_id: a
        }, wx.getShareInfo({
          shareTicket: l,
          success: function (t) {
            o.model.relayInfo.shareInfo = {
              activityId: h,
              sharePath: e.query,
              shareTicket: t.rawData || t.encryptedData
            };
          },
          complete: function () {
            o.joinRelayRoom();
          }
        });
      } else this.netWorkCtrl.createRouterId(this.afterCreateRouterId.bind(this));
    }
  }, {
    key: "afterCreateRouterId",
    value: function (e, t) {
      e ? (this.model.relayInfo = {
        router_id: t
      }, this.masterCreateRoom()) : (this.view.showJoinRelayFail(t), s.default.emit(n.EVENT.CREATE_RELAY_ROOM_FAIL, {
        result: 1
      }), this.modeCtrl.changeMode("singleCtrl"));
    }
  }, {
    key: "masterCreateRoom",
    value: function () {
      this.onSocketOpenCb = this.socketCreateRoom.bind(this), this.connectSocket(this.masterCreateRoomFail.bind(this));
    }
  }, {
    key: "joinRelayRoom",
    value: function (e) {
      var t = e || this.joinRelayRoomFail.bind(this);
      this.onSocketOpenCb = this.socketJoinRoom.bind(this), this.connectSocket(t);
    }
  }, {
    key: "joinNextRelayRoom",
    value: function () {
      console.warn("!!! joinNextRelayRoom"), s.default.emitSync(n.EVENT.RELAYMODEDESTROY, {}), this.clearSocketTimeout(), this.scene = 2, this.onSocketOpenCb = this.socketJoinNextRoom.bind(this), this.connectSocket(this.joinRelayRoomFail.bind(this));
    }
  }, {
    key: "connectSocket",
    value: function (e) {
      this.socketTimeout = setTimeout(e, 5e3), this.gameSocket.alive ? this.onSocketOpenCb() : this.gameSocket.connectSocket();
    }
  }, {
    key: "onSocketOpen",
    value: function () {
      this.onSocketOpenCb();
    }
  }, {
    key: "socketCreateRoom",
    value: function () {
      var e = {
        cmdid: 10001,
        buff: {
          router_id: this.model.relayInfo.router_id,
          version: n.VERSION
        }
      };
      this.sendRelayCmd(e);
    }
  }, {
    key: "socketJoinRoom",
    value: function () {
      var e = {
        cmdid: 10002,
        buff: {
          room_id: this.model.relayInfo.room_id
        }
      };
      this.sendRelayCmd(e);
    }
  }, {
    key: "socketJoinNextRoom",
    value: function () {
      var e = {
        cmdid: 10011,
        buff: {
          room_id: this.model.relayInfo.room_id
        }
      };
      this.sendRelayCmd(e);
    }
  }, {
    key: "sendRelayMsg",
    value: function (e, t) {
      var o = t.time,
        i = {
          cmdid: 10015,
          buff: {
            room_id: this.model.relayInfo.room_id,
            msg_info: {
              msginfo: o
            },
            msg_seq: this.game.relayInstructionCtrl.msg_seq
          }
        };
      this.sendRelayCmd(i);
    }
  }, {
    key: "joinRoomSucc",
    value: (y = o(t().mark(function e(o, i) {
      var a, n, s, r;
      return t().wrap(function (e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return console.log("加入房间成功 joinRoomSucc", o, i, this.model.relayInfo), this.clearSocketTimeout(), this.rpJoinRoom(0), this.model.relayInfo.shareInfo && (this.afterShareRelay(this.model.relayInfo.shareInfo.sharePath, this.model.relayInfo.shareInfo.shareTicket), this.model.relayInfo.shareInfo = null), this.model.relayInfo.room_seed = i.room_seed, this.model.relayInfo.my_seat_no = i.my_seat_no, this.model.relayInfo.next_room_id = i.next_room_id, this.model.relayInfo.activity_id = i.activity_id, this.model.relayInfo.room_wxa_code = "", e.prev = 1, e.next = 2, (0, f.getGroupEnterInfo)(i.room_id);
          case 2:
            a = e.sent, n = a.activity_id, s = a.group_openid, this.model.chatToolActivityId = n, this.model.groupOpenid = s, e.next = 4;
            break;
          case 3:
            e.prev = 3, r = e.catch(1), console.error("!!! joinRoomSucc getGroupEnterInfo fail", r);
          case 4:
            console.log("!!! joinRoomSucc data.my_seat_no", i.my_seat_no), console.log("!!! joinRoomSucc data.room_owner_seat", i.room_owner_seat), this.model.chatToolActivityId && this.model.groupOpenid ? i.my_seat_no !== i.room_owner_seat && 0 !== i.my_seat_no && u.default.sendChatToolMsg({
              data: {
                activity_id: this.model.chatToolActivityId,
                target_state: 1,
                participator_info_list: [{
                  group_openid: this.model.groupOpenid,
                  state: 1
                }],
                room_id: i.room_id
              }
            }).catch(function (e) {
              console.error("!!! 未发送聊天模式消息：", e);
            }) : console.warn("!!! joinRoomSucc chatToolActivityId or groupOpenid is null"), this.setCheckGameInterval(), 0 != i.my_seat_no && 1 == i.game_status ? this.rejoinRelay() : this.changePage("roomPage", i);
          case 5:
          case "end":
            return e.stop();
        }
      }, e, this, [[1, 3]]);
    })), function (e, t) {
      return y.apply(this, arguments);
    })
  }, {
    key: "joinRelayRoomFail",
    value: function () {
      console.log("joinRelayRoomFail"), this.rpJoinRoom(1), this.view.showJoinRelayFail2(), this.modeCtrl.changeMode("singleCtrl");
    }
  }, {
    key: "masterCreateRoomFail",
    value: function () {
      console.log("masterCreateRoomFail"), s.default.emit(n.EVENT.CREATE_RELAY_ROOM_FAIL, {
        result: 1
      }), this.view.showJoinRelayFail2(), this.modeCtrl.changeMode("singleCtrl");
    }
  }, {
    key: "createRoomSucc",
    value: (e = o(t().mark(function e(o, i) {
      return t().wrap(function (e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            console.log("createRoomSucc"), this.clearSocketTimeout(), this.model.relayInfo.room_id = i.room_id, this.model.relayInfo.room_seed = i.room_seed, this.model.relayInfo.my_seat_no = i.my_seat_no, this.model.relayInfo.activity_id = i.activity_id, this.model.relayInfo.room_wxa_code = "", this.model.relayInfo.next_room_id = i.next_room_id, this.setCheckGameInterval(), s.default.emit(n.EVENT.CREATE_RELAY_ROOM_FAIL, {
              result: 0
            }), this.changePage("roomPage", i);
          case 1:
          case "end":
            return e.stop();
        }
      }, e, this);
    })), function (t, o) {
      return e.apply(this, arguments);
    })
  }, {
    key: "sendRelayCmd",
    value: function (e) {
      var t = e.cmdid,
        o = e.buff;
      t && ("10006" != t && console.log("向服务器发送指令：", t, "数据：", o), o = JSON.stringify(o), this.gameSocket.sendRelayCmd({
        cmdid: t,
        buff: o
      }));
    }
  }, {
    key: "clearSocketTimeout",
    value: function () {
      clearTimeout(this.reconnectTimeout), clearTimeout(this.socketTimeout), this.clearCheckGameInterval(), this.socketTimeout = null, this.reconnectTimeout = null;
    }
  }, {
    key: "changePage",
    value: function (e, t) {
      this.currentPage && this.currentPage.hide();
      var o = this[e];
      o && (this.currentPage = o, this.model.setStage(o.name), this.currentPage.show(t));
    }
  }, {
    key: "shareRelay",
    value: function () {
      var e = this.model.relayInfo,
        t = e.room_id,
        o = e.router_id,
        i = n.VERSION,
        a = this.afterShareRelay.bind(this);
      this.isShareCard = !0, (0, l.ShareRelayCard)({
        room_id: t,
        router_id: o,
        version: i,
        cb: a
      }), this.reporter.rpClickShareObserve();
    }
  }, {
    key: "afterShareRelay",
    value: function (e, t, o) {
      if (console.log("!!! afterShareRelay", e, t, o), this.model.chatToolActivityId = o, e && t && this.gameSocket.alive) {
        var i = {
          cmdid: 10014,
          buff: {
            room_id: this.model.relayInfo.room_id,
            session_id: this.model.getSessionId(),
            share_ticket: t,
            share_query: "?" + e
          }
        };
        this.sendRelayCmd(i), this.reporter.rpRelayClickCardShare();
      }
    }
  }, {
    key: "shareRelayLive",
    value: function (e) {
      var t = e.game_level,
        o = e.game_level_s,
        i = e.member_count;
      this.model.relayInfo.is_live_master = !0;
      var a = this.model.relayInfo,
        s = a.room_id,
        r = a.router_id,
        h = a.activity_id,
        d = n.VERSION,
        c = this.afterShareRelay.bind(this);
      (0, l.ShareRelayLiveCard)({
        room_id: s,
        router_id: r,
        version: d,
        cb: c,
        activity_id: h,
        game_level: t,
        game_level_s: o,
        member_count: i
      });
    }
  }, {
    key: "addEvent",
    value: function () {
      s.default.on(n.EVENT.RELAYCREATEROOM, this.createRoomSucc.bind(this)), s.default.on(n.EVENT.JOINRELAYROOM, this.joinRoomSucc.bind(this)), s.default.on(n.EVENT.PEOPLECOME, this.upDateRoom.bind(this)), s.default.on(n.EVENT.PEOPLEOUT, this.upDateRoom.bind(this)), s.default.on(n.EVENT.RELAYSTART, this.relayGameStart.bind(this)), s.default.on(n.EVENT.NOWPLAYERJUMP, this.sendPlayerJumpMsg.bind(this)), s.default.on(n.EVENT.CHECKUSER, this.checkUser.bind(this)), s.default.on(n.EVENT.REPLAYAGAIN, this.joinNextRoom.bind(this)), s.default.on(n.EVENT.SYNCMSGSEQ, this.syncMsgSeq.bind(this)), s.default.on(n.EVENT.SEND_CHECK_GAME, this.sendCheckGame.bind(this)), s.default.on(n.EVENT.ENDGAME, this.endGame.bind(this)), s.default.on(n.EVENT.CHANGEGAMELEVEL, this.sendChangeGameLevel.bind(this)), s.default.on(n.EVENT.RECEIVEGAMELEVELCHANGE, this.receiveGameLevelChange.bind(this)), s.default.on(n.EVENT.GETRELAYQR, this.getRelayQR.bind(this)), s.default.on(n.EVENT.GETRELAYCHECKUSERERROR, this.syncRelay.bind(this)), s.default.on(n.EVENT.SEND_REALTIME_MSG, this.sendRelayMsg.bind(this));
    }
  }, {
    key: "offEvent",
    value: function () {
      s.default.off(n.EVENT.RELAYCREATEROOM, this.createRoomSucc.bind(this)), s.default.off(n.EVENT.JOINRELAYROOM, this.joinRoomSucc.bind(this)), s.default.off(n.EVENT.PEOPLECOME, this.upDateRoom.bind(this)), s.default.off(n.EVENT.PEOPLEOUT, this.upDateRoom.bind(this)), s.default.off(n.EVENT.RELAYSTART, this.relayGameStart.bind(this)), s.default.off(n.EVENT.NOWPLAYERJUMP, this.sendPlayerJumpMsg.bind(this)), s.default.off(n.EVENT.CHECKUSER, this.checkUser.bind(this)), s.default.off(n.EVENT.REPLAYAGAIN, this.joinNextRoom.bind(this)), s.default.off(n.EVENT.SYNCMSGSEQ, this.syncMsgSeq.bind(this)), s.default.off(n.EVENT.SEND_CHECK_GAME, this.sendCheckGame.bind(this)), s.default.off(n.EVENT.ENDGAME, this.endGame.bind(this)), s.default.off(n.EVENT.CHANGEGAMELEVEL, this.sendChangeGameLevel.bind(this)), s.default.off(n.EVENT.RECEIVEGAMELEVELCHANGE, this.receiveGameLevelChange.bind(this)), s.default.off(n.EVENT.GETRELAYQR, this.getRelayQR.bind(this)), s.default.off(n.EVENT.GETRELAYCHECKUSERERROR, this.syncRelay.bind(this)), s.default.off(n.EVENT.SEND_REALTIME_MSG, this.sendRelayMsg.bind(this));
    }
  }, {
    key: "upDateRoom",
    value: function (e, t) {
      console.log("更新房间信息"), this.currentPage == this.roomPage && this.currentPage.show(t);
    }
  }, {
    key: "outRelay1",
    value: function () {
      var e = {
        cmdid: 10003,
        buff: {
          room_id: this.model.relayInfo.room_id,
          is_live_master: this.model.relayInfo.is_live_master
        }
      };
      this.sendRelayCmd(e), this.modeCtrl.changeMode("singleCtrl"), this.model.relayInfo.my_seat_no === this.model.relayInfo.room_owner_seat && (this.model.chatToolActivityId ? u.default.sendChatToolMsg({
        data: {
          activity_id: this.model.chatToolActivityId,
          target_state: 3,
          room_id: this.model.relayInfo.room_id
        }
      }).catch(function (e) {
        console.error("!!! 未发送聊天模式消息：", e);
      }) : console.warn("!!! outRelay1 chatToolActivityId is null"));
    }
  }, {
    key: "outRelay2",
    value: function () {
      this.modeCtrl.changeMode("singleCtrl");
    }
  }, {
    key: "startRelay",
    value: function (e) {
      var t = {
        cmdid: 10004,
        buff: {
          room_id: this.model.relayInfo.room_id,
          game_level: e
        }
      };
      this.sendRelayCmd(t), this.setStartRelayReportTimeOut = setTimeout(function () {
        s.default.emit(n.EVENT.RP_RELAY_START, {
          result: 1
        });
      }, 5e3);
    }
  }, {
    key: "relayGameStart",
    value: function (e) {
      this.changePage("gamePage"), clearTimeout(this.setStartRelayReportTimeOut), s.default.emit(n.EVENT.RP_RELAY_START, {
        result: 0
      });
    }
  }, {
    key: "sendPlayerJumpMsg",
    value: function (e, t) {
      var o = t.msginfo,
        i = t.jump_succ,
        a = t.msg_seq;
      if (this.model.relayInfo.my_seat_no) {
        var n = {
          cmdid: 10009,
          buff: {
            room_id: this.model.relayInfo.room_id,
            msg_info: {
              msgid: this.model.relayInfo.room_id + Date.now(),
              jump_succ: i,
              msginfo: o
            },
            msg_seq: a
          }
        };
        this.sendRelayCmd(n);
      }
    }
  }, {
    key: "checkUser",
    value: function (e, t) {
      var o = t.msgid,
        i = t.msg_seq,
        a = t.jump_succ;
      if (this.model.relayInfo.my_seat_no) {
        var n = {
          cmdid: 10008,
          buff: {
            room_id: this.model.relayInfo.room_id,
            msg_info: {
              msgid: o,
              jump_succ: a,
              msg_seq: i
            }
          }
        };
        this.sendRelayCmd(n);
      }
    }
  }, {
    key: "endGame",
    value: function (e, t) {
      console.log("!!! endGame", t, this.model.relayInfo), this.clearCheckGameInterval(), this.gamePage.hideScore(), s.default.emit(n.EVENT.RP_RELAY_GAME_END, {
        jielong_score: t.score,
        player_num: t.playerlist.length,
        max_audience: t.onlookerlist.length,
        difficulty: t.game_level
      }), this.model.chatToolActivityId ? u.default.sendChatToolMsg({
        data: {
          activity_id: this.model.chatToolActivityId,
          target_state: 3,
          room_id: this.model.relayInfo.room_id
        }
      }).catch(function (e) {
        console.error("!!! 未发送聊天模式消息：", e);
      }) : console.warn("!!! endGame chatToolActivityId is null");
    }
  }, {
    key: "syncMsgSeq",
    value: function (e, t) {
      var o = {
        cmdid: 10007,
        buff: {
          room_id: this.model.relayInfo.room_id,
          msg_seq: t.msg_seq
        }
      };
      this.sendRelayCmd(o);
    }
  }, {
    key: "setCheckGameInterval",
    value: function () {
      this.checkRelayInterval = setInterval(function () {
        s.default.emit(n.EVENT.CHECK_GAME, {});
      }, 2e3);
    }
  }, {
    key: "clearCheckGameInterval",
    value: function () {
      console.log("清除业务心跳"), clearInterval(this.checkRelayInterval), this.checkRelayInterval = null;
    }
  }, {
    key: "sendCheckGame",
    value: function (e, t) {
      if (this.model.relayInfo.my_seat_no) {
        var o = {
          cmdid: 10006,
          buff: {
            room_id: t.room_id,
            seq: t.seq
          }
        };
        this.sendRelayCmd(o);
      }
    }
  }, {
    key: "joinNextRoom",
    value: function (e) {
      if (!this.model.relayInfo.next_room_id) return console.warn("!!! joinNextRoom next_room_id is null"), this.view.showJoinNextRoomFail(), void this.modeCtrl.changeMode("singleCtrl");
      s.default.emitSync(n.EVENT.RELAYMODEDESTROY, {}), this.game.full2D.hide2D(), this.model.relayInfo.room_id = this.model.relayInfo.next_room_id, this.model.relayInfo.room_wxa_code = "", this.joinNextRelayRoom();
    }
  }, {
    key: "afterGetMiniCode",
    value: function (e, t) {
      console.log("getMiniCode", "RECEIVEMINICODE"), this.upDateRoom(e, t);
    }
  }, {
    key: "getMiniCode",
    value: function () {
      var e = {
        cmdid: 10010,
        buff: {
          room_id: this.model.relayInfo.room_id,
          router_id: decodeURIComponent(this.model.relayInfo.router_id),
          client_version: n.VERSION,
          mode: "relay"
        }
      };
      this.sendRelayCmd(e);
    }
  }, {
    key: "watchRelay",
    value: function () {
      this.rejoinRelay();
    }
  }, {
    key: "rejoinRelay",
    value: function () {
      s.default.emitSync(n.EVENT.WATCHRELAY, {}), this.changePage("gamePage");
    }
  }, {
    key: "syncRelay",
    value: function () {
      s.default.emitSync(n.EVENT.WATCHRELAY, {});
    }
  }, {
    key: "onSocketCloseErr",
    value: function () {
      this.socketTimeout || (this.clearSocketTimeout(), this.model.relayInfo.room_id && this.model.relayInfo.router_id ? this.reconnectSocket() : this.modeCtrl.changeMode("singleCtrl"));
    }
  }, {
    key: "reconnectSocket",
    value: function () {
      var e = this.reconnectSocketFail.bind(this);
      this.joinRelayRoom(e);
    }
  }, {
    key: "reconnectSocketFail",
    value: function () {
      this.gameSocket.close(), this.clearSocketTimeout(), clearTimeout(this.reconnectTimeout), this.reconnectTimeout = setTimeout(this.reconnectSocket.bind(this), 3e3);
    }
  }, {
    key: "progressOver",
    value: function (e) {
      var t = {
        cmdid: 10013,
        buff: {
          room_id: this.model.relayInfo.room_id,
          msg_seq: this.game.relayInstructionCtrl.msg_seq
        }
      };
      console.log("告诉服务器这个人过时"), this.sendRelayCmd(t);
    }
  }, {
    key: "receiveGameLevelChange",
    value: function (e, t) {
      this.upDateRoom(e, t);
    }
  }, {
    key: "sendChangeGameLevel",
    value: function (e, t) {
      var o = {
        cmdid: 10012,
        buff: {
          room_id: this.model.relayInfo.room_id,
          game_level: t
        }
      };
      console.log("告诉服务器房间的难度改变"), this.sendRelayCmd(o);
    }
  }, {
    key: "rpJoinRoom",
    value: function (e) {
      2 == this.scene ? s.default.emit(n.EVENT.RP_JOIN_RELAY_ROOM_AGAIN, {
        res: e
      }) : s.default.emit(n.EVENT.RP_JOIN_RELAY_ROOM, {
        scene: this.scene,
        result: e
      });
    }
  }, {
    key: "getRelayQR",
    value: function () {
      this.model.relayInfo.room_wxa_code ? s.default.emitSync(n.EVENT.RECEIVEMINICODE, {
        room_wxa_code: this.model.relayInfo.room_wxa_code
      }) : this.getMiniCode(), this.reporter.rpRelayClickSunCode();
    }
  }, {
    key: "checkCmd",
    value: function () {
      var e = this.game.relayInstructionCtrl.cmdList,
        t = !1;
      e.length && e[e.length - 1].buff.game_status > 0 && (t = !0);
      return t;
    }
  }, {
    key: "wxOnShow",
    value: function () {
      this.isShareCard ? this.checkCmd() ? this.onSocketCloseErr() : this.game.relayInstructionCtrl.run() : (this.game.relayInstructionCtrl.handleOnShow(), this.onSocketCloseErr());
      this.socketMonitor.log("|os|"), this.isShareCard = !1;
    }
  }, {
    key: "wxOnhide",
    value: function () {
      this.isShareCard ? this.game.relayInstructionCtrl.stop() : (this.clearSocketTimeout(), this.gameSocket.close(), this.game.relayInstructionCtrl.handleOnhide()), this.socketMonitor.log("|oh|");
    }
  }, {
    key: "skipRelayBeginner",
    value: function () {
      this.init(this.options);
    }
  }, {
    key: "gotoRelayMode",
    value: function () {
      s.default.emitSync(n.EVENT.RELAYMODEDESTROY, {}), this.game.full2D.hide2D(), this.clearSocketTimeout(), this.scene = 1, this.model.relayInfo = {}, this.onSocketOpenCb = function () {}, this.game.relayInstructionCtrl.destroy(), this.createRoomNoAddEvent();
    }
  }, {
    key: "destroy",
    value: function () {
      this.clearSocketTimeout(), this.gameSocket.close(), this.model.relayInfo = {}, this.onSocketOpenCb = function () {}, this.offEvent(), this.game.full2D.hide2D(), wx.hideLoading(), this.game.relayInstructionCtrl.destroy(), this.game.resetScene(), s.default.emitSync(n.EVENT.RELAYMODEDESTROY, {});
    }
  }]);
  var e, y;
}();
