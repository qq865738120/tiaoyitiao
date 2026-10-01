// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  o = e(require("../store/session")),
  n = e(require("./network"));
exports.default = function () {
  return a(function e(a) {
    var o = this;
    t(this, e), this.alive = !1, this.noErr = !1, this.game = a, this.handlers = {}, this.handleSocketErr = "", this.heartBeat = [], wx.onSocketOpen(function (e) {
      o.alive = !0, "relay" == o.game.mode ? o.game.gameCtrl.onSocketOpen() : o.joinGame();
    }), wx.onSocketClose(function (e) {
      "player" != o.game.mode || o.noErr || (n.default.quitGame(), o.game.gameCtrl.onSocketCloseErr()), "observe" != o.game.mode || o.noErr || o.game.gameCtrl.onSocketCloseErr(), "relay" != o.game.mode || o.noErr || o.game.gameCtrl.onSocketCloseErr(), o.alive = !1, console.log("Socket close", e, "是否正常关闭：", o.noErr);
    }), wx.onSocketError(function (e) {}), wx.onSocketMessage(function (e) {
      var t;
      o.cleanHeartBeat(), o.heartBeat.push(setTimeout(o.sendHeartBeat.bind(o), 5e3));
      try {
        t = JSON.parse(e.data);
      } catch (e) {
        return o.game.handleWxOnError({
          message: "socket receive wrong msg JSON.parse(res.data) error",
          stack: ""
        }), void wx.closeSocket();
      }
      t.cmd, 106 === t.cmd && o.handleACK(t), 101 === t.cmd && o.handleJoinGame(t), t.cmd, 108 === t.cmd && o.handlePeopleCome(t), 102 === t.cmd && o.receiveCommand(t), 109 == t.cmd && o.close(), 107 == t.cmd && o.handlePlayerOut(), 401 != t.cmd && 402 != t.cmd || o.handleRelayCMD(t);
    });
  }, [{
    key: "cleanHeartBeat",
    value: function () {
      if (this.heartBeat.length) for (; this.heartBeat.length;) {
        var e = this.heartBeat.pop();
        clearTimeout(e);
      }
    }
  }, {
    key: "connectSocket",
    value: function () {
      var e = this;
      console.log("connectSocket"), wx.connectSocket({
        url: "wss://wxagame.weixin.qq.com",
        success: function () {
          console.log("wx.connectSocket success");
        },
        fail: function (t) {
          e.alive = !1;
        }
      });
    }
  }, {
    key: "sendCommand",
    value: function (e, t) {
      var a = o.default.gameId,
        n = o.default.gameTicket;
      if (a && n && e) if ("string" == typeof a) {
        var s = {
          cmd: 102,
          i: a,
          n: e,
          k: n,
          o: [JSON.stringify(t)]
        };
        wx.sendSocketMessage({
          data: JSON.stringify(s)
        });
      } else console.warn("Socket send cmd need gameId");
    }
  }, {
    key: "sendNullCommand",
    value: function () {
      var e = o.default.gameId,
        t = o.default.gameTicket;
      if (e && t) if ("string" == typeof e) {
        var a = {
          cmd: 102,
          i: e,
          k: t,
          o: []
        };
        wx.sendSocketMessage({
          data: JSON.stringify(a)
        });
      } else console.warn("Socket send cmd need gameId");
    }
  }, {
    key: "getCommand",
    value: function (e) {}
  }, {
    key: "sendRelayCmd",
    value: function (e) {
      var t = this;
      if (this.game.gameModel.relayInfo.router_id && o.default.sessionId && e) {
        var a = JSON.stringify(e),
          n = {
            cmd: 401,
            router_id: this.game.gameModel.relayInfo.router_id,
            session_id: o.default.sessionId,
            fast: 1,
            data: a
          };
        wx.sendSocketMessage({
          data: JSON.stringify(n),
          fail: function (e) {
            e && e.errMsg && e.errMsg.match(/WebSocket is not connected$/) && (t.alive = !1);
          }
        });
      }
    }
  }, {
    key: "onRelayCmdCome",
    value: function (e) {
      this.handleRelayCMD = e;
    }
  }, {
    key: "onPeopleCome",
    value: function (e) {
      this.peopleCome = e;
    }
  }, {
    key: "onReciveCommand",
    value: function (e) {
      this.observerMessage = e;
    }
  }, {
    key: "onJoinSuccess",
    value: function (e) {
      this.joinSuccess = e;
    }
  }, {
    key: "onPlayerOut",
    value: function (e) {
      this.playerOutHandler = e;
    }
  }, {
    key: "receiveCommand",
    value: function (e) {
      "function" == typeof this.observerMessage && e.o && e.o[0] && e.o[0].o && this.observerMessage(e.n, JSON.parse(e.o[0].o));
    }
  }, {
    key: "handlePeopleCome",
    value: function (e) {
      "function" == typeof this.peopleCome && this.peopleCome(e);
    }
  }, {
    key: "receiveACK",
    value: function () {}
  }, {
    key: "joinGame",
    value: function () {
      var e = o.default.gameId;
      if (o.default.sessionId && e) {
        var t = {
          cmd: 101,
          game_id: e,
          fast: 1,
          session_id: o.default.sessionId
        };
        wx.sendSocketMessage({
          data: JSON.stringify(t)
        });
      }
    }
  }, {
    key: "handleACK",
    value: function (e) {
      this.handlers.ack && this.handlers.ack.forEach(function (t) {
        t(e);
      });
    }
  }, {
    key: "handleJoinGame",
    value: function (e) {
      if ("observe" == this.game.mode) switch (e.ret) {
        case 0:
        case 2:
          this.joinSuccess(!0);
          break;
        default:
          this.joinSuccess(!1);
      } else 0 != e.ret ? this.joinSuccess(!1) : this.joinSuccess(!0);
    }
  }, {
    key: "sendHeartBeat",
    value: function () {
      if ("player" == this.game.mode) this.sendNullCommand();else {
        wx.sendSocketMessage({
          data: JSON.stringify({
            cmd: 104
          })
        });
      }
    }
  }, {
    key: "quitObserve",
    value: function () {
      if (this.alive) {
        var e = {
          cmd: 109,
          fast: 1,
          game_id: o.default.gameId,
          session_id: o.default.sessionId
        };
        wx.sendSocketMessage({
          data: JSON.stringify(e)
        });
      }
    }
  }, {
    key: "close",
    value: function () {
      var e = this;
      this.alive && (this.cleanHeartBeat(), this.noErr = !0, console.log("emmit close"), wx.closeSocket(), o.default.clearShareTicket(), o.default.clearGameId(), setTimeout(function () {
        e.reset();
      }, 1e3));
    }
  }, {
    key: "onSocketErr",
    value: function (e) {
      this.handleSocketErr = e;
    }
  }, {
    key: "reset",
    value: function () {
      this.noErr = !1;
    }
  }, {
    key: "handlePlayerOut",
    value: function () {
      "function" == typeof this.playerOutHandler && this.playerOutHandler();
    }
  }]);
}();
