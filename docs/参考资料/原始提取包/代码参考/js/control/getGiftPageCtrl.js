// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  n = (e(require("../pages/gift/getGiftPage")), e(require("../store/session")), e(require("../network/network"))),
  s = e(require("../control/propertyCtrl"));
exports.default = function () {
  return i(function e(i, n) {
    t(this, e), this.name = "getGiftPage", this.game = i, this.gameCtrl = this.game.gameCtrl, this.model = this.game.gameModel, this.view = this.game.gameView, this.modeCtrl = n, this.netWorkCtrl = this.gameCtrl.netWorkCtrl;
  }, [{
    key: "init",
    value: function (e) {
      var t = this.model.getSessionId();
      console.log("options", e), this.giftId = e.query.id, wx.showLoading(), t ? this.afterLogin(!0) : this.netWorkCtrl.netWorkLogin(this.afterLogin.bind(this));
    }
  }, {
    key: "afterLogin",
    value: function (e) {
      var t = this;
      console.log("susususususuususuusususus", this.giftId), e ? n.default.getGiftData(this.giftId).then(function (e) {
        wx.hideLoading(), e ? (t.updateProperty(e.gift_list), t.game.full2D.showShareSkin({
          headimg: e.headimg,
          nickname: e.nickname,
          total_gift: e.gift_count,
          gift_list: e.gift_list,
          onReturn: function () {
            t.modeCtrl.changeMode("singleCtrl");
          }
        })) : t.modeCtrl.changeMode("singleCtrl");
      }).catch(function () {
        wx.hideLoading(), wx.showModal({
          title: "提示",
          content: "网络异常，拉取礼物失败",
          showCancel: !1
        }), t.modeCtrl.changeMode("singleCtrl");
      }) : (wx.hideLoading(), wx.showModal({
        title: "提示",
        content: "网络异常，拉取礼物失败",
        showCancel: !1
      }), this.modeCtrl.changeMode("singleCtrl"));
    }
  }, {
    key: "updateProperty",
    value: function () {
      var e,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      t.map(function (t) {
        t.received && (e = !0);
      }), e && setTimeout(function () {
        s.default.getProps();
      }, 1e3);
    }
  }, {
    key: "destroy",
    value: function () {
      this.currentPage && this.currentPage.hide(), this.model.setStage(""), wx.hideLoading(), this.shareTicket = "", this.giftId = null, this.game.resetScene();
    }
  }, {
    key: "wxOnhide",
    value: function () {}
  }]);
}();
