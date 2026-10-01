// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  e = require("../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return e(function e(i) {
    t(this, e), this.game = i, this.commandList = [], this.isRunning = !1, this.icTimeout = null, this.cmdHandler = function () {}, this.gameId = 0, this.seq = 0, this.currentSeq = null, this.waited = !1;
  }, [{
    key: "onReceiveCommand",
    value: function (t, e) {
      t._seq = e, this.gameId != this.game.gameCtrl.modeCtrl.observeCtrl.gameId && (this.gameId = this.game.gameCtrl.modeCtrl.observeCtrl.gameId, this.seq = e - 1);
      var i,
        s = e - this.seq;
      1 != s && (s > 1 && (i = 0), s < 1 && (i = 1), this.game.sendServerError(i), this.game.socketFirstSync = !0);
      this.seq = e, (!this.currentSeq || e > this.currentSeq) && (this.commandList.push(t), this.commandList.sort(function (t, e) {
        return t._seq - e._seq;
      }), this.checkRunningState());
    }
  }, {
    key: "checkRunningState",
    value: function () {
      this.isRunning || this.runCommand();
    }
  }, {
    key: "runCommand",
    value: function () {
      var t = this,
        e = this.commandList[0];
      if (e) if (this.isRunning = !0, !this.currentSeq || this.currentSeq && e._seq - this.currentSeq == 1) this.waited = !1, this.currentSeq = e._seq, this.commandList.shift(), this.cmdHandler(e);else if (e._seq - this.currentSeq > 1) {
        if (this.waited) return this.waited = !1, this.currentSeq = e._seq, this.commandList.shift(), void this.cmdHandler(e);
        this.waited = !0, this.timer = setTimeout(function () {
          t.runCommand();
        }, 100);
      }
    }
  }, {
    key: "bindCmdHandler",
    value: function (t) {
      this.cmdHandler = t;
    }
  }, {
    key: "onCmdComplete",
    value: function () {
      this.commandList.length ? this.runCommand() : this.isRunning = !1;
    }
  }, {
    key: "destroy",
    value: function () {
      this.timer && (clearTimeout(this.timer), this.timer = null), this.commandList = [], this.gameId = 0, this.seq = 0, this.currentSeq = null, this.waited = !1, this.icTimeout && clearTimeout(this.icTimeout), this.icTimeout = null, this.isRunning = !1;
    }
  }]);
}();
