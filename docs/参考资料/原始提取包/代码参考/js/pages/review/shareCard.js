// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../../../@babel/runtime/helpers/classCallCheck"),
  s = require("../../../@babel/runtime/helpers/createClass");
require("../pages2d/base"), require("../../lib/animation"), require("../../config"), e(require("../../lib/three")), exports.default = function () {
  return s(function e(s) {
    var a = s.game,
      o = s.onShare,
      r = s.week_best_score,
      t = s.onSave,
      h = s.headimg,
      n = s.onCloseSharePage,
      l = s.maxBonusScore,
      u = void 0 === l ? 1 : l,
      c = s.succeedTime,
      d = void 0 === c ? 0 : c;
    i(this, e), this.game = a, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.onShare = o, this.onSave = t, this.week_best_score = r, this.headimg = h, this.name = "reviewSharePage", this.maxBonusScore = u, this.succeedTime = d, this.onCloseSharePage = n;
  }, [{
    key: "show",
    value: function (e) {
      var i = this,
        s = e.qrcode,
        a = void 0 === s ? "" : s,
        o = e.open_playback_id,
        r = void 0 === o ? "" : o;
      this.game.full2D.showRecordSharePage({
        headimg: this.headimg,
        score: this.week_best_score,
        combo: this.maxBonusScore,
        blocks: this.succeedTime,
        qrcode: a,
        onClose: function () {
          i.game.full2D.hide2D(), i.onCloseSharePage();
        },
        onSave: function (e) {
          i.onSave(e);
        },
        onShare: function () {
          i.onShare(r);
        }
      });
    }
  }, {
    key: "hide",
    value: function () {
      this.stopAnimation(), this.game.full2D.hide2D(), this.hide3D();
    }
  }]);
}();
