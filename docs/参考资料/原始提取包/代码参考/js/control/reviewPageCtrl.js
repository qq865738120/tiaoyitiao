// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  r = require("../../@babel/runtime/helpers/createClass");
e(require("../pages/group/groupPage")), e(require("../network/network")), exports.default = function () {
  return r(function e(r, i) {
    t(this, e), this.name = "groupShare", this.game = r, this.gameCtrl = this.game.gameCtrl, this.model = this.game.gameModel, this.view = this.game.gameView, this.netWorkCtrl = this.gameCtrl.netWorkCtrl, this.modeCtrl = i;
  }, [{
    key: "init",
    value: function (e) {
      var t = this;
      this.model.getSessionId() ? this.afterLogin(!0, e) : this.netWorkCtrl.netWorkLogin(function (r) {
        t.afterLogin(r, e);
      });
    }
  }, {
    key: "afterLogin",
    value: function (e, t) {
      var r = this;
      e && !this.gameCtrl.reviewCtrl.isInThisPage && t && t.query && "reviewPage" == t.query.mode && (wx.showLoading(), setTimeout(function () {
        r.gameCtrl.reviewCtrl.init({
          user_data: {
            playback_id: t.query.open_playback_id,
            is_self: !1,
            headimg: t.query.headimg
          },
          onHide: function () {
            r.modeCtrl.changeMode("singleCtrl");
          },
          scene: "home",
          is_from_share: !0
        });
      }, 500));
    }
  }, {
    key: "destroy",
    value: function () {}
  }, {
    key: "wxOnhide",
    value: function () {}
  }]);
}();
