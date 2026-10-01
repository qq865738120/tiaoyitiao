// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(a) {
    e(this, t), this.game = a, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.name = "relayRoom";
  }, [{
    key: "show",
    value: function (e) {
      var t = {
        players: e.playerlist,
        imgdata: e.room_wxa_code || "",
        game_status: e.game_status || 0,
        my_seat_no: e.my_seat_no,
        room_owner_seat: e.room_owner_seat,
        game_level: e.game_level || 0
      };
      console.log("显示房间数据"), this.full2D.showRelayRoom(t);
    }
  }, {
    key: "hide",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = e.hide2D || !1;
      t && this.full2D.hide2D();
    }
  }]);
}();
