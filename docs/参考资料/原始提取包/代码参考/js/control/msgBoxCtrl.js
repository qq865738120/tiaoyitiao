// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/objectSpread2"),
  a = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  o = e(require("../network/network")),
  n = e(require("../store/storage"));
exports.default = function () {
  return i(function e(t) {
    var i = t.game,
      o = t.onReturn,
      n = t.onGoSkin,
      s = t.onGoProfile,
      r = t.onGoMyProfile;
    a(this, e), this.game = i, this.onReturn = o, this.onGoSkin = n, this.onGoProfile = s, this.onGoMyProfile = r, this.page_index = 1, this.page_count = 100, this.oldData = [];
  }, [{
    key: "init",
    value: function () {
      var e = this,
        t = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
      if (this.arriveLastPage = !1, t) {
        wx.showLoading({
          mask: !0
        }), this.page_index = 1;
        var a = o.default.requestMsg({
          type: 1,
          page_index: 1,
          page_count: this.page_count
        });
        a.then(function (t) {
          if (wx.hideLoading(), !t || !t.msg_list || !t.msg_list.length) return e.arriveLastPage = !0, e.oldData = [], void e.showPage([]);
          t.msg_list.length < e.page_count && (e.arriveLastPage = !0);
          var a = e.handleServerData(t);
          e.oldData = a, e.showPage(a);
        }, function (e) {
          console.log("request fail", e), wx.hideLoading(), wx.showToast({
            icon: "none",
            mask: !1,
            title: "网络繁忙",
            duration: 800
          });
        });
      } else {
        var i = this.oldData || [];
        this.showPage(i);
      }
    }
  }, {
    key: "handleServerData",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
          msg_list: []
        },
        a = [];
      return e.msg_list && e.ctx_info ? (e.msg_list.forEach(function (e) {
        a.push(t({
          timestamp: e.timestamp,
          sub_type: e.body.sub_type
        }, e.body.base_info));
      }), this.ctx_info = e.ctx_info) : this.ctx_info = {}, a;
    }
  }, {
    key: "showPage",
    value: function (e) {
      var t = this;
      this.game.full2D.showMsgBox({
        msg_list: e,
        onReturn: function () {
          t.onReturn();
        },
        onGoSkin: function () {
          t.onGoSkin();
        },
        onGoProfile: function (e) {
          t.onGoProfile(e);
        },
        onGoMyProfile: function () {
          t.onGoMyProfile();
        },
        onGoMsgDetail5: function (e) {
          t.showDetailPage(e);
        },
        onEnd: function () {
          t.getNextPage();
        }
      });
    }
  }, {
    key: "showDetailPage",
    value: function (e) {
      var a = this;
      this.game.full2D.showMsgDetailType5(t(t({}, e), {}, {
        onReturn: function () {
          a.showPage(a.oldData);
        }
      }));
    }
  }, {
    key: "getOldData",
    value: function () {
      var e = [];
      if (Array.isArray(this.oldData)) e = this.oldData;else {
        var t = n.default.getMsgBoxData();
        t && t.datalist && (e = t.datalist);
      }
      return e;
    }
  }, {
    key: "saveOldData",
    value: function (e, t) {
      this.oldData = e, n.default.saveMsgBoxData({
        datalist: e,
        ctx_info: t
      });
    }
  }, {
    key: "getNextPage",
    value: function () {
      var e = this;
      this.arriveLastPage || (wx.showLoading({
        mask: !0
      }), o.default.requestMsg({
        type: 1,
        page_index: this.page_index + 1,
        page_count: this.page_count,
        ctx_info: this.ctx_info
      }).then(function (t) {
        if (wx.hideLoading(), t && t.msg_list && t.msg_list.length) {
          e.page_index += 1, t.msg_list.length < e.page_count && (e.arriveLastPage = !0);
          var a = e.handleServerData(t);
          Array.isArray(e.oldData) && (e.oldData = e.oldData.concat(a)), e.game.full2D.updateMsgBox(a);
        } else e.arriveLastPage = !0;
      }, function () {
        wx.hideLoading(), wx.showToast({
          icon: "none",
          mask: !1,
          title: "网络繁忙",
          duration: 800
        });
      }));
    }
  }, {
    key: "destroy",
    value: function () {}
  }]);
}();
