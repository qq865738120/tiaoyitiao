// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  o = e(require("../pages/group/groupPage")),
  r = e(require("../network/network")),
  a = require("../network/getAuth");
exports.default = function () {
  return i(function e(i, r) {
    t(this, e), this.name = "groupShare", this.game = i, this.gameCtrl = this.game.gameCtrl, this.model = this.game.gameModel, this.view = this.game.gameView, this.netWorkCtrl = this.gameCtrl.netWorkCtrl, this.modeCtrl = r, this.groupPage = new o.default(i), this.shareTicket = "", this.shareInfoTimeout = null;
  }, [{
    key: "init",
    value: function (e) {
      var t = this.model.getServerConfig();
      if (t && !t.group_score_switch) return this.view.showServeConfigForbiddenGroupShare(), void this.modeCtrl.changeMode("singleCtrl");
      this.model.setStage("");
      var i = this.model.getSessionId();
      this.shareTicket = e.shareTicket, wx.showLoading(), i ? this.afterLogin(!0) : this.netWorkCtrl.netWorkLogin(this.afterLogin.bind(this));
    }
  }, {
    key: "afterLogin",
    value: function (e) {
      var t = this;
      e ? (this.setShareInfoTimeout(), wx.getShareInfo({
        shareTicket: this.shareTicket,
        success: function (e) {
          null != t.shareInfoTimeout && (t.clearShareInfoTimeout(), t.model.setShareTicket(e.rawData || e.encryptedData), r.default.getGroupScore(function (e, i) {
            e ? (0, a.getAuthWxFriendInteraction)().then(function () {
              var e = i.data.user_info || [],
                o = i.data.my_user_info || {};
              t.model.setStage(e, o), t.showGroupRankPage(e, o);
            }).catch(function () {
              t.goToGroupShareFail("朋友关系授权失败");
            }) : t.goToGroupShareFail(), wx.hideLoading();
          }));
        },
        fail: function (e) {
          null != t.shareInfoTimeout && (t.clearShareInfoTimeout(), wx.hideLoading(), t.goToGroupShareFail("群里的群分享才有效哦~"));
        }
      })) : (wx.hideLoading(), this.goToGroupShareFail());
    }
  }, {
    key: "setShareInfoTimeout",
    value: function () {
      this.shareInfoTimeout = setTimeout(this.handleShareInfoTimeout.bind(this), 5e3);
    }
  }, {
    key: "clearShareInfoTimeout",
    value: function () {
      null != this.shareInfoTimeout && (clearTimeout(this.shareInfoTimeout), this.shareInfoTimeout = null);
    }
  }, {
    key: "handleShareInfoTimeout",
    value: function () {
      this.clearShareInfoTimeout(), this.goToGroupShareFail();
    }
  }, {
    key: "goToGroupShareFail",
    value: function (e) {
      console.log("!!! goToGroupShareFail", e), this.view.showGroupShareFail(e), this.modeCtrl.changeMode("singleCtrl");
    }
  }, {
    key: "showGroupRankPage",
    value: function (e, t) {
      var i,
        o,
        r = this.model.getGroupRankData();
      if (r && (i = r.list, o = r.userInfo), void 0 !== e && void 0 !== t) this.model.setGroupRankData(e, t);else {
        if (void 0 === i || void 0 === o) throw new Error("showGroupRankPage。调用没有list，myUserInfo数据");
        e = i, t = o;
      }
      this.groupPage.show(e.concat([]), t), this.model.setStage(this.groupPage.name), this.currentPage = this.groupPage;
    }
  }, {
    key: "destroy",
    value: function () {
      wx.hideLoading(), this.currentPage && this.currentPage.hide(), this.model.setStage(""), this.shareTicket = "", this.model.clearShareTicket(), this.clearShareInfoTimeout(), this.game.resetScene();
    }
  }, {
    key: "groupPlayGame",
    value: function () {
      this.modeCtrl.directPlaySingleGame();
    }
  }, {
    key: "wxOnhide",
    value: function () {}
  }]);
}();
