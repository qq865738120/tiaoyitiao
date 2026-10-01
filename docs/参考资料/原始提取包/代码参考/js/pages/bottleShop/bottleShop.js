// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass");
require("../../lib/animation"), e(require("../../lib/three")), exports.default = function () {
  return t(function e(t) {
    var l = t.game,
      n = t.onClickUse,
      r = t.onReturn;
    i(this, e), this.game = l, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.onReturn = r, this.onClickUse = n;
  }, [{
    key: "show",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
        i = arguments.length > 1 ? arguments[1] : void 0,
        t = {
          id: 0,
          img: "res/defaultBottlePoster.png",
          type: 0,
          unlock_wording: "",
          use_status: 1,
          property: {}
        },
        l = e.find(function (e) {
          return 0 === e.id;
        });
      l || (e = [t].concat(e)), this.full2D.showSkin({
        id: i,
        skin_list: e,
        onClickUse: this.onClickUse,
        onReturn: this.onReturn
      });
    }
  }, {
    key: "setSelectSkin",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
      this.full2D.updateSkin && this.full2D.updateSkin({
        id: e
      });
    }
  }, {
    key: "hide",
    value: function () {
      this.game.full2D.hide2D();
    }
  }]);
}();
