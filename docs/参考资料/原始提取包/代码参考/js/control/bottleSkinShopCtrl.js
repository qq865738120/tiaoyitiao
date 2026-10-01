// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  o = require("../../@babel/runtime/helpers/createClass"),
  i = (e(require("../network/network")), e(require("../pages/bottleShop/bottleShop"))),
  n = e(require("../control/bottleSkinBaseCtrl")),
  a = e(require("../store/storage"));
exports.default = function () {
  return o(function e(o) {
    var i = o.game,
      n = o.onReturn;
    t(this, e), this.game = i, this.gameCtrl = i.gameCtrl, this.onReturn = n;
  }, [{
    key: "init",
    value: function () {
      var e,
        t,
        o = this;
      this.bottleShopPage = new i.default({
        game: this.game,
        onClickUse: function (t) {
          n.default.getSelectedSkinId() != t.id && t.use_status && (t.id ? (e = setTimeout(function () {
            wx.showLoading({
              title: "下载中...",
              mask: !0
            });
          }, 100), n.default.getBottleSkinResource(t.id).then(function (i) {
            e && (clearTimeout(e), e = !1), wx.hideLoading(), a.default.setSelectBottleSkinId(t.id), o.bottleShopPage.setSelectSkin(t.id), n.default.syncSelectBottleSkin(!0), o.changeSkin(o.game), n.default.setRankDataTolocalStorage({});
          }, function (t) {
            e && (clearTimeout(e), e = !1), wx.hideLoading(), wx.showToast({
              title: "获取皮肤失败",
              icon: "none"
            });
          })) : (a.default.setSelectBottleSkinId(0), n.default.syncSelectBottleSkin(!0), o.bottleShopPage.setSelectSkin(t.id), o.changeSkin(o.game), n.default.setRankDataTolocalStorage({})));
        },
        onReturn: function () {
          o.onReturn();
        }
      }), t = setTimeout(function () {
        wx.showLoading({
          title: "加载中...",
          mask: !0
        });
      }, 300), n.default.getBottleSkinShopData().then(function (e) {
        t && (clearTimeout(t), t = !1), wx.hideLoading();
        var i = n.default.getSelectedSkinId();
        o.bottleShopPage.show(e.bottleSkinShopList, i || 0);
      }, function () {
        t && (clearTimeout(t), t = !1), wx.hideLoading();
        var e = a.default.getBottleSkinShopList(e),
          i = n.default.getSelectedSkinId();
        o.bottleShopPage.show(e, i || 0), wx.hideLoading(), wx.showToast({
          title: "加载失败",
          icon: "none"
        });
      });
    }
  }, {
    key: "changeSkin",
    value: function (e) {
      var t = n.default.getSelectedBottleSkinResourceSync();
      t ? this.game.bottle && this.game.bottle.changeSkin && this.game.bottle.changeSkin(t) : this.game.bottle.changeSkin();
    }
  }, {
    key: "destroy",
    value: function () {}
  }]);
}();
