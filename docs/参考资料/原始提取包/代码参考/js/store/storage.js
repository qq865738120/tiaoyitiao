// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../@babel/runtime/helpers/createClass"),
  n = require("./../config");
exports.default = function () {
  function s() {
    e(this, s), this.mmpayStatus = null;
  }
  return t(s, null, [{
    key: "getFriendsScore",
    value: function () {
      try {
        var e = wx.getStorageSync("friends_score") || [];
        return e = e && e.ts ? e.ts < Date.now() ? [] : e.data : [];
      } catch (e) {
        return [];
      }
    }
  }, {
    key: "saveFriendsScore",
    value: function (e) {
      wx.setStorage({
        key: "friends_score",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "saveMyUserInfo",
    value: function () {
      var e,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        n = s.getMyUserInfo() || {};
      e = Object.assign({}, n, t), wx.setStorage({
        key: "my_user_info",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "saveHeighestScore",
    value: function (e) {
      wx.setStorage({
        key: "my_heighest_score",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getHeighestScore",
    value: function () {
      try {
        return wx.getStorageSync("my_heighest_score") || !1;
      } catch (e) {
        return !1;
      }
    }
  }, {
    key: "getMyUserInfo",
    value: function () {
      try {
        return wx.getStorageSync("my_user_info") || !1;
      } catch (e) {
        return null;
      }
    }
  }, {
    key: "saveSessionId",
    value: function (e) {
      wx.setStorage({
        key: "session_id",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getSessionId",
    value: function (e) {
      try {
        return wx.getStorageSync("session_id") || "";
      } catch (e) {
        return "";
      }
    }
  }, {
    key: "clearSessionId",
    value: function () {
      wx.removeStorage({
        key: "session_id",
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "saveServerConfig",
    value: function (e) {
      wx.setStorage({
        key: "server_config",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getServerConfig",
    value: function () {
      try {
        return wx.getStorageSync("server_config") || 0;
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: "getFirstBlood",
    value: function () {
      try {
        return wx.getStorageSync("first_blood") || 0;
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: "saveFirstBlood",
    value: function () {
      wx.setStorage({
        key: "first_blood",
        data: 1,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getHistoryTimes",
    value: function () {
      try {
        return wx.getStorageSync("history_Times2") || !1;
      } catch (e) {
        return !1;
      }
    }
  }, {
    key: "saveHistoryTimes",
    value: function (e) {
      wx.setStorage({
        key: "history_Times2",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "saveActionData",
    value: function (e) {
      wx.setStorage({
        key: "action_data0",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getActionData",
    value: function () {
      try {
        return wx.getStorageSync("action_data0") || !1;
      } catch (e) {
        return !1;
      }
    }
  }, {
    key: "saveAdTag",
    value: function (e) {
      wx.setStorage({
        key: "ad_tag0",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getAdTag",
    value: function () {
      try {
        return wx.getStorageSync("ad_tag0") || !1;
      } catch (e) {
        return !1;
      }
    }
  }, {
    key: "saveWeekBestScore",
    value: function (e) {
      wx.setStorage({
        key: "weeek_best_score0",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getWeekBestScore",
    value: function () {
      try {
        var e = wx.getStorageSync("weeek_best_score0") || 0;
        return e && e.ts && (e = e.ts < Date.now() ? 0 : e.data), e;
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: "setRelayNewBie",
    value: function () {
      wx.setStorage({
        key: "relay_newbie",
        data: 1,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getRelayNewBie",
    value: function () {
      try {
        return wx.getStorageSync("relay_newbie") || 0;
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: "getWangZheBaseStatus",
    value: function () {
      return n.USEWANGZHEBASE;
    }
  }, {
    key: "getMmpayBaseStatus",
    value: function () {
      return n.USEMMPAYBASE;
    }
  }, {
    key: "getMmpayBonusStatus",
    value: function () {
      var e,
        t = {
          status: 0,
          expire_time: !1
        };
      if (this.mmpayStatus) e = this.mmpayStatus;else try {
        e = wx.getStorageSync("mmpayStatus") || {};
      } catch (n) {
        e = t;
      }
      if (1 == e.status) {
        var n = Math.round(new Date() / 1e3);
        return e.expire_time + e.svr_time < n ? t : e;
      }
      return 0 == e.status ? e : t;
    }
  }, {
    key: "setMmpayBonusStatus",
    value: function (e, t) {
      this.mmpayStatus = Object.assign(e, {
        svr_time: t
      }), wx.setStorage({
        key: "mmpayStatus",
        data: this.mmpayStatus
      });
    }
  }, {
    key: "getBottleSkinData",
    value: function (e) {
      return this.getBottleSkinShopList().find(function (t) {
        return t.id == e;
      });
    }
  }, {
    key: "getBottleSkinShopList",
    value: function () {
      return void 0 !== this.BottleSkinShopList ? this.BottleSkinShopList : wx.getStorageSync("bottleSkin_shopList") || [];
    }
  }, {
    key: "setBottleSkinShopList",
    value: function (e) {
      this.BottleSkinShopList = e, wx.setStorage({
        key: "bottleSkin_shopList",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getSkinResources",
    value: function () {
      return void 0 !== this.BottleSkinResources ? this.BottleSkinResources : wx.getStorageSync("bottleSkin_skinResources") || {};
    }
  }, {
    key: "setSkinResources",
    value: function (e) {
      this.BottleSkinResources = e, wx.setStorage({
        key: "bottleSkin_skinResources",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getCanUseBottleSkinIdList",
    value: function () {
      return void 0 !== this.canUseBottleSkinList ? this.canUseBottleSkinList : wx.getStorageSync("bottleSkin_canUseList") || [];
    }
  }, {
    key: "setCanUseBottleSkinIdList",
    value: function (e) {
      this.canUseBottleSkinList = e, wx.setStorage({
        key: "bottleSkin_canUseList",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "setSelectBottleSkinId",
    value: function (e) {
      this.bottleSkinId = e, wx.setStorage({
        key: "bottleSkin_skinId",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getSelectBottleSkinId",
    value: function () {
      return void 0 !== this.bottleSkinId ? this.bottleSkinId : wx.getStorageSync("bottleSkin_skinId");
    }
  }, {
    key: "saveMsgBoxData",
    value: function (e) {
      wx.setStorage({
        key: "msg_box_data_0",
        data: e,
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "getMsgBoxData",
    value: function () {
      try {
        return wx.getStorageSync("msg_box_data_0") || null;
      } catch (e) {
        return null;
      }
    }
  }, {
    key: "setSyncBottleSkinFailFlag",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
      this.syncBottleSkinFailFlag = e;
    }
  }, {
    key: "getSyncBottleSkinFailFlag",
    value: function () {
      return this.syncBottleSkinFailFlag || 0;
    }
  }]);
}();
