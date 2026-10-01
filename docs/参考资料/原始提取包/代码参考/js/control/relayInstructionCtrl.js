// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireWildcard").default,
  s = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  o = s(require("../lib/mue/eventcenter")),
  f = e(require("../config")),
  n = s(require("../network/network")),
  u = require("../util/log");
exports.default = function () {
  return i(function e(s) {
    var i = this;
    t(this, e), this.game = s, this.runningSeq = 0, this.cmdList = [], this.seq = 0, this.model = s.gameModel, this.monitor = this.game.socketMonitor, o.default.on(f.EVENT.WATCHRELAY, function () {
      i.sync();
    }), o.default.on(f.EVENT.CHECK_GAME, function () {
      o.default.emit(f.EVENT.SEND_CHECK_GAME, {
        room_id: i.model.relayInfo.room_id || "",
        seq: i.seq
      });
    }), u.realTimeLogManager.setFilterMsg("room_id:".concat(this.model.relayInfo.room_id));
  }, [{
    key: "cmdCome",
    value: function (e) {
      if (0 == e.ret) {
        var s = JSON.parse(e.data);
        if (0 == s.error_code) {
          if (!s.buff) return;
          if (s.buff = JSON.parse(s.buff), 10006 != s.cmdid && console.log("收到帧，cmdid：", s.cmdid, "帧房号:" + s.buff.room_id + "本机房号" + this.model.relayInfo.room_id + (s.buff.room_id == this.model.relayInfo.room_id ? "匹配" : "不匹配"), "数据：", s), 10009 == s.cmdid || 10008 == s.cmdid || 10006 == s.cmdid || 10004 == s.cmdid || 10012 == s.cmdid || 10013 == s.cmdid || 10014 == s.cmdid || 10015 == s.cmdid) return;
          if (10001 != s.cmdid) {
            if (s.buff.room_id != this.model.relayInfo.room_id) return void console.log("房间号不匹配丢弃帧，cmdid：", s.cmdid, "数据:");
            if (10007 == s.cmdid) return void this.parseCmd(s);
            10002 != s.cmdid && 10011 != s.cmdid || (this.cmdList = [], this.canRunningCmd = !0);
          } else this.cmdList = [], this.canRunningCmd = !0;
          this.cmdList.push(s), this.runCmd();
        } else {
          var t = String(s.error_code);
          "-1019" == t ? (this.handleSyncWrong(), n.default.sendServerError(3)) : "-1015" != t && t < 0 && this.debug(t, s.error_msg + "cmd" + e.cmd, s);
        }
      } else this.debug("ret:" + e.ret, "cmd:" + e.cmd), "-1" == String(e.ret) && n.default.sendServerError(4);
    }
  }, {
    key: "runCmd",
    value: function () {
      if (this.cmdList.length && this.canRunningCmd) {
        this.cmdList.sort(function (e, s) {
          return e.ts - s.ts;
        });
        var e = this.cmdList.shift(),
          s = e.cmdid;
        if (10001 == s || 10002 == s || 10010 == s || 10011 == s) return 10010 != s && (this.seq = e.buff.seq, this.msg_seq = -1), this.parseCmd(e), void this.runCmd();
        var t,
          i,
          o,
          f,
          n,
          r,
          m,
          a,
          d = e.buff.seq;
        if (u.realTimeLogManager.info("run cmdid: ".concat(s, ", this.seq: ").concat(this.seq, ", nextSeq: ").concat(d, ", this.msg_seq: ").concat(this.msg_seq, ", nextCmd.msg_seq: ").concat(e.buff.msg_seq, ", data.buff: ").concat((t = e.buff, i = t.create_time, o = t.game_status, f = t.room_id, n = t.room_seed, r = t.seq, m = t.update_time, a = t.msg_seq, JSON.stringify({
          game_status: o,
          room_id: f,
          room_seed: n,
          seq: r,
          msg_seq: a,
          create_time: i,
          update_time: m
        })))), d > this.seq) {
          var c = e.buff.msg_seq - this.msg_seq;
          if (0 == c || 1 == c && "20006" == e.cmdid) return this.parseCmd(e), this.seq = e.buff.seq, this.msg_seq = e.buff.msg_seq, void this.runCmd();
          console.log("丢帧了"), wx.reportEvent("seq_drop", {
            room_id: this.model.relayInfo.room_id,
            cmd_id: s
          }), u.realTimeLogManager.error("run drop frame cmdid: ".concat(s, ", this.seq:").concat(this.seq, ", nextSeq: ").concat(d, ", this.msg_seq: ").concat(this.msg_seq, ", nextCmd.msg_seq: ").concat(e.buff.msg_seq)), this.sync();
        } else 20008 == s && e.buff.msg_seq - this.msg_seq == 0 && (console.log("realtime run"), this.parseCmd(e)), this.runCmd();
      }
    }
  }, {
    key: "sync",
    value: function () {
      this.canRunningCmd = !1, this.cmdList = [], o.default.emitSync(f.EVENT.SYNCMSGSEQ, {
        msg_seq: this.msg_seq
      }), this.clearSyncTimeOut(), this.setSyncTimeOut();
    }
  }, {
    key: "setSyncTimeOut",
    value: function () {
      this.syncTimeOutArr || (this.syncTimeOutArr = []), this.syncTimeOutArr.push(setTimeout(this.sync.bind(this), 5e3));
    }
  }, {
    key: "clearSyncTimeOut",
    value: function () {
      if (Array.isArray(this.syncTimeOutArr)) for (; this.syncTimeOutArr.length;) {
        var e = this.syncTimeOutArr.pop();
        clearTimeout(e);
      }
    }
  }, {
    key: "receiveSyncCmd",
    value: function (e) {
      if (this.clearSyncTimeOut(), 2 == e.buff.game_status) return o.default.emitSync(f.EVENT.ENDGAME, e.buff), void (this.cmdList = []);
      o.default.emitSync(f.EVENT.SYNCSCENE, {
        now_msg_seq: this.msg_seq,
        serverData: e.buff
      }), this.msg_seq = e.buff.msg_seq, this.seq = e.buff.seq, this.canRunningCmd = !0, this.runCmd();
    }
  }, {
    key: "parseCmd",
    value: function (e) {
      switch (e.cmdid) {
        case 10001:
          console.log(10001, "创建房间", e.buff), this.monitor.log("|10001;" + e.buff.room_id + ";" + e.buff.seq + ";" + e.buff.msg_seq), o.default.emitSync(f.EVENT.RELAYCREATEROOM, e.buff);
          break;
        case 10002:
          console.log(10002, "加入房间", e.buff), this.monitor.log("|10002;" + e.buff.room_id + ";" + e.buff.seq + ";" + e.buff.msg_seq), 0 == e.buff.my_seat_no && 0 != e.buff.game_status && (this.canRunningCmd = !1), o.default.emitSync(f.EVENT.JOINRELAYROOM, e.buff);
          break;
        case 10011:
          console.log(10011, "加入下局房间", e.buff), this.monitor.log("|10011;" + e.buff.room_id + ";" + e.buff.seq + ";" + e.buff.msg_seq), 0 == e.buff.my_seat_no && 0 != e.buff.game_status && (this.canRunningCmd = !1), o.default.emitSync(f.EVENT.JOINRELAYROOM, e.buff);
          break;
        case 20004:
          this.adJustBuff(e.buff, 1), this.monitor.log("|20004;" + e.buff.seq + ";" + e.buff.msg_seq), console.log(20004, "有玩家加入", e.buff), o.default.emitSync(f.EVENT.PEOPLECOME, e.buff);
          break;
        case 20005:
          this.adJustBuff(e.buff, 1), this.monitor.log("|20005;" + e.buff.seq + ";" + e.buff.msg_seq), console.log(20005, "有玩家退出", e.buff), o.default.emitSync(f.EVENT.PEOPLEOUT, e.buff);
          break;
        case 20001:
          this.adJustBuff(e.buff), console.log(20001, "游戏开始 ——————————————————", e.buff), this.monitor.log("|20001;" + e.buff.seq + ";" + e.buff.msg_seq + ";" + e.buff.game_level), console.log("20001 my_seat_no", this.model.relayInfo.my_seat_no), o.default.emitSync(f.EVENT.RELAYSTART, e.buff);
          break;
        case 20006:
          this.adJustBuff(e.buff), console.log(20006, "别人跳了一下 ——————————————————", e.buff.msg_seq, e.buff), this.monitor.log("|20006;" + e.buff.seq + ";" + e.buff.msg_seq), console.log("20006 my_seat_no", this.model.relayInfo.my_seat_no), o.default.emitSync(f.EVENT.RELAYCHECKUSER, e.buff);
          break;
        case 20002:
          this.adJustBuff(e.buff), console.log(20002, "回合往前进一下 ——————————————————", e.buff.msg_seq, e.buff), this.monitor.log("|20002;" + e.buff.seq + ";" + e.buff.msg_seq), console.log("20002 my_seat_no", this.model.relayInfo.my_seat_no), o.default.emitSync(f.EVENT.RUNGAME, e.buff);
          break;
        case 20003:
          this.adJustBuff(e.buff), this.monitor.log("|20003;" + e.buff.room_id + ";" + e.buff.seq + ";" + e.buff.msg_seq), console.log(20003, "整个游戏结束", e.buff), console.log("20003 my_seat_no", this.model.relayInfo.my_seat_no), e.buff && "-1019" == e.buff.error_ret && this.monitor.report(), o.default.emitSync(f.EVENT.ENDGAME, e.buff);
          break;
        case 10010:
          this.model.relayInfo.room_id && (this.model.relayInfo.room_wxa_code = e.buff.room_wxa_code), this.adJustBuff(e.buff), console.log(10010, "收到二维码", e.buff), console.log("10010 my_seat_no", this.model.relayInfo.my_seat_no), o.default.emitSync(f.EVENT.RECEIVEMINICODE, e.buff);
          break;
        case 10007:
          this.adJustBuff(e.buff), console.log(10007, "收到同步帧流", e.buff), this.monitor.log("|10007;" + e.buff.seq + ";" + e.buff.msg_seq), this.receiveSyncCmd(e);
          break;
        case 20007:
          this.adJustBuff(e.buff, 1), console.log(20007, "房间难度等级改变", e.buff), o.default.emitSync(f.EVENT.RECEIVEGAMELEVELCHANGE, e.buff);
          break;
        case 20008:
          this.adJustBuff(e.buff), console.log(20008, "接收实时按压帧", e.buff), o.default.emitSync(f.EVENT.RECEIVE_REALTIME_MSG, e.buff);
          break;
        default:
          console.log("没有执行的帧", e);
      }
    }
  }, {
    key: "adJustBuff",
    value: function (e, s) {
      e.my_seat_no = this.model.relayInfo.my_seat_no, s && (e.room_wxa_code = this.model.relayInfo.room_wxa_code), e.score = this.game.UI.score, console.log("修正数据,玩家房号:", e.my_seat_no);
    }
  }, {
    key: "debug",
    value: function () {}
  }, {
    key: "run",
    value: function () {
      this.canRunningCmd = !0, this.runCmd();
    }
  }, {
    key: "stop",
    value: function () {
      this.canRunningCmd = !1;
    }
  }, {
    key: "handleOnShow",
    value: function () {
      this.cmdList = [], this.canRunningCmd = !0;
    }
  }, {
    key: "handleOnhide",
    value: function () {
      this.clearSyncTimeOut(), this.cmdList = [], this.stop();
    }
  }, {
    key: "handleSyncWrong",
    value: function () {
      wx.showModal({
        title: "提示",
        content: "游戏异常，请重新开始游戏",
        showCancel: !1
      });
    }
  }, {
    key: "destroy",
    value: function () {
      this.clearSyncTimeOut(), this.cmdList = [], this.stop(), this.seq = 0, this.msg_seq = -1;
    }
  }]);
}();
