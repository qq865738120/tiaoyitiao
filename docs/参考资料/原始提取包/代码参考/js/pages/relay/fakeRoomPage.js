// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(s) {
    e(this, t), this.game = s, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "loading";
  }, [{
    key: "show",
    value: function (e) {
      this.full2D.showRelayRoom({
        players: [],
        imgdata: "",
        game_status: 0,
        my_seat_no: e ? 1 : 0,
        room_owner_seat: 1,
        is_fake: 1
      });
    }
  }, {
    key: "hide",
    value: function () {
      this.full2D.hide2D();
    }
  }]);
}();
