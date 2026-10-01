// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../@babel/runtime/helpers/classCallCheck"),
  o = require("../../@babel/runtime/helpers/createClass"),
  t = require("../config");
exports.default = function () {
  return o(function o(i) {
    var n = this;
    e(this, o), this.game = i, this.musicPool = ["success", "combo1", "combo2", "combo3", "combo4", "combo5", "combo6", "combo7", "combo8", "scale_intro", "scale_loop", "restart", "fall", "fall_2", "pop", "icon", "sing", "pay", "luban", "relax"];
    var a = 0;
    this.musicPool.forEach(function (e, o) {
      setTimeout(function (e) {
        this[e] = wx.createInnerAudioContext(), this[e].src = t.AUDIO[e], (a += 1) === this.musicPool.length && (n.scale_loop.loop = !0, n.icon.onEnded(function () {
          n.icon.destroy();
        }), n.pay.onPlay(function () {
          n.pay.before && n.pay.before();
        }), n.pay.onEnded(function () {
          n.pay.after && n.pay.after(), n.timer = setTimeout(function () {
            n.canTimer && (n.pay.seek(0), n.pay.play());
          }, 3e3);
        }), n.sing.onEnded(function () {
          n.timer = setTimeout(function () {
            n.canTimer && (n.sing.seek(0), n.sing.play());
          }, 3e3);
        }), n.luban.onEnded(function () {
          n.timer = setTimeout(function () {
            n.canTimer && (n.luban.seek(0), n.luban.play());
          }, 3e3);
        }), n.scale_intro.onEnded(function () {
          "prepare" == n.game.bottle.status && n.scale_loop.play();
        }));
      }.bind(n, e), 2 * o);
    });
  }, [{
    key: "resetAudio",
    value: function () {
      var e = this;
      this.musicPool.forEach(function (o) {
        e[o].stop();
      });
    }
  }, {
    key: "register",
    value: function (e, o, t) {
      console.log("ley", e), this[e].before = o, this[e].after = t;
    }
  }, {
    key: "setTimerFlag",
    value: function (e) {
      this.canTimer = e;
    }
  }, {
    key: "clearTimer",
    value: function () {
      this.timer && (clearTimeout(this.timer), this.timer = null);
    }
  }, {
    key: "replay",
    value: function (e) {
      var o = this[e];
      o ? (o.stop(), o.play()) : console.warn("there is no music", e);
    }
  }]);
}();
