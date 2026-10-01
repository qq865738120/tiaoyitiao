// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../../@babel/runtime/helpers/createClass"),
  r = e(require("../../lib/mue/eventcenter")),
  l = require("../../config");
exports.default = function () {
  return i(function e(i) {
    t(this, e), this.game = i, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "startPage";
  }, [{
    key: "show",
    value: function (e) {
      this.full2D.showRelayBeginner();
    }
  }, {
    key: "hide",
    value: function () {
      r.default.emitSync(l.EVENT.SKIP_RELAY_GUIDE), this.full2D.hide2D();
    }
  }]);
}();
