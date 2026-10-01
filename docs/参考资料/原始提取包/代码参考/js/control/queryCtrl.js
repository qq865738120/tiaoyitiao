// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(s) {
    e(this, t), this.game = s, this.model = this.game.gameModel, this.gameCtrl = this.game.gameCtrl, this.gameView = this.game.gameView;
  }, [{
    key: "identifyMode",
    value: function (e) {
      if (e.query && e.query.hasOwnProperty("mode")) switch (e.query.mode) {
        case "groupShare":
          e.shareTicket ? this.model.setMode("groupShare") : (this.gameCtrl.identifyModeErr("获取群信息失败"), this.model.setMode("single"));
          break;
        case "battle":
          e.query.pkId ? this.model.setMode("battle") : (this.gameCtrl.identifyModeErr("获取PK信息失败"), this.model.setMode("single"));
          break;
        case "observe":
          e.query.gameId ? this.model.setMode("observe") : (this.gameCtrl.identifyModeErr("获取围观信息失败"), this.model.setMode("single"));
          break;
        case "relay":
          e.query.room_id && e.query.router_id && e.query.version ? this.model.setMode("relay") : this.model.setMode("single");
          break;
        case "reviewPage":
          e.query.open_playback_id ? this.model.setMode("reviewPage") : this.model.setMode("single");
          break;
        case "getGiftPage":
          e.query.id ? (this.model.setMode("getGiftPage"), this.game.reporter.rpClickComeInSkinShare()) : this.model.setMode("single");
          break;
        default:
          this.model.setMode("single");
      } else this.model.setMode("single");
    }
  }]);
}();
