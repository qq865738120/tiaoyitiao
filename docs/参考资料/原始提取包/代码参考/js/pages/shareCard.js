// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  n = require("../../@babel/runtime/helpers/createClass"),
  i = (e(require("../store/storage")), window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio),
  a = (window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth, window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth, wx.loadFont("res/num.ttf"));
exports.default = function () {
  return n(function e(n) {
    t(this, e), this.texture = {}, this.material = {};
  }, [{
    key: "getShareCard",
    value: function (e, t) {
      e = e || {};
      this.canvas || (this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.canvas.width = 693, this.canvas.height = 558);
      var n = this.context;
      if ("shareBattle" == e.type) {
        n.fillStyle = "white", n.fillRect(0, 0, 693, 558);
        var i = this;
        this._drawImageCanvas1("res/changlle_share.png", 0, 0, 693, 558, "share", function () {
          n.fillStyle = "rgba(0,0,0,0.8)", n.font = "180px ".concat(a), n.textBaseline = "middle", n.textAlign = "center", n.fillText(e.score || 0, 356.5, 334.8), t && t(i.canvas);
        });
      }
      if ("history" == e.type) {
        n.fillStyle = "white", n.fillRect(0, 0, 693, 558);
        i = this;
        this._drawImageCanvas1("res/high_score.png", 0, 0, 693, 558, "share", function () {
          n.fillStyle = "#00c777", n.font = "180px ".concat(a), n.textBaseline = "middle", n.textAlign = "center", n.fillText(e.score || 0, 356.5, .68 * 558), t && t(i.canvas);
        });
      }
      if ("week" == e.type || "skin" == e.type) {
        n.fillStyle = "white", n.fillRect(0, 0, 693, 558);
        i = this;
        this._drawImageCanvas1("res/high_score_week.png", 0, 0, 693, 558, "share", function () {
          n.fillStyle = "#00c777", n.font = "180px ".concat(a), n.textBaseline = "middle", n.textAlign = "center", n.fillText(e.score || 0, 356.5, .68 * 558), t && t(i.canvas);
        });
      }
    }
  }, {
    key: "_smallReat",
    value: function () {
      for (var e = this.context, t = ["red", "blue", "green", "yellow", "skyblue"], n = 0; n < t.length; n++) {
        e.fillStyle = t[n];
        for (var i = 0; i < 5; i++) e.fillRect(553 * Math.random(), 691 * Math.random(), 15, 15);
      }
    }
  }, {
    key: "_drawImageCanvas",
    value: function (e, t, n, i, a, r, l) {
      var s = new Image(),
        o = this;
      s.onload = function () {
        o.context.drawImage(s, t - i / 2, n - a / 2, i, a), l && l(o.canvas);
      }, s.onerror = function () {
        l && l(o.canvas);
      }, s.src = e;
    }
  }, {
    key: "_drawImageCanvas1",
    value: function (e, t, n, i, a, r, l) {
      "/0" != e && "/96" != e && "/64" != e && e || (e = "res/ava.png");
      var s = new Image(),
        o = this;
      s.onload = function () {
        o.context.drawImage(s, t, n, i, a), l && l(o.canvas);
      }, s.onerror = function () {
        l && l(o.canvas);
      }, s.src = e;
    }
  }]);
}();
