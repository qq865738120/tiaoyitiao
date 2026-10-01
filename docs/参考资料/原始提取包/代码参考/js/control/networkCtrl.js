// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default,
  t = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../../@babel/runtime/helpers/slicedToArray"),
  n = require("../../@babel/runtime/helpers/typeof"),
  i = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  u = t(require("../network/network")),
  o = e(require("../store/storage")),
  s = e(require("../control/bottleSkinBaseCtrl")),
  l = require("../network/getAuth"),
  f = e(require("../lib/mue/eventcenter")),
  c = require("../config");
exports.default = function () {
  return a(function e(t) {
    i(this, e), this.game = t, this.gameCtrl = t.gameCtrl, this.model = t.gameModel, this.loginCb = null, this.serverConfigInterval = null, this.historyTimes = this.game.historyTimes;
  }, [{
    key: "netWorkLogin",
    value: function (e) {
      e && (this.loginCb = e), u.default.requestLogin(this.afterRequestLogin.bind(this));
    }
  }, {
    key: "afterRequestLogin",
    value: function (e) {
      var t = this;
      this.loginCb && this.loginCb(e);
      var i = u.default.getUserInfo(this.afterGetUserInfo.bind(this));
      i.then(function (e) {}, function (e) {
        e && Math.random() < .1 && ("object" == n(e) && (e = JSON.stringify(e)), u.default.badReport("$$getUserInfoFail;unknownError;".concat(e, ";"))), u.default.sendServerError(6);
      });
      var a = wx.getLaunchOptionsSync(),
        o = function () {
          Promise.all([i, u.default.requestFriendsScore(t.updateFriendsScore.bind(t))]).then(function (e) {
            var t = r(e, 2),
              n = (t[0], t[1]);
            (0, l.requirePrivacyAuthorize)().then(function () {
              (0, l.getAuthWxFriendInteraction)().then(function () {
                console.warn("同意好友授权");
              }).catch(function () {
                console.warn("不同意好友授权");
              });
            }), n && n.my_user_info && n.my_user_info.playback_id && s.default.setRankDataTolocalStorage(n.my_user_info);
          }, function () {}), t.requestMmpayTimeout(), t.requestServerInit(), t.gameCtrl.onLoginSuccess();
        };
      e && !a.query.wxgamechallengeid ? o() : e && a.query.wxgamechallengeid && f.default.on(c.EVENT.CHALLENGE_START, function () {
        o();
      });
    }
  }, {
    key: "afterGetUserInfo",
    value: function (e) {
      e.appeal_notify && this.gameCtrl.appealNotify();
    }
  }, {
    key: "requestServerInit",
    value: function () {
      u.default.requestInit(), this.serverConfigInterval = setInterval(u.default.requestInit.bind(u.default), 6e4);
    }
  }, {
    key: "requestMmpayTimeout",
    value: function () {
      var e = this;
      this.clearMmpayTimeout();
      var t = o.default.getMmpayBonusStatus();
      function r() {
        u.default.requestMmpayBonus(function (t, r) {
          t && r.data.svr_time ? 0 == r.data.pay_status.status ? (r.data.pay_status.expire_time < 120 && (r.data.pay_status.expire_time = 120), o.default.setMmpayBonusStatus(r.data.pay_status, r.data.svr_time), e.mmpayTimeout = setTimeout(e.requestMmpayTimeout.bind(e), 1e3 * r.data.pay_status.expire_time)) : 1 == r.data.pay_status.status && o.default.setMmpayBonusStatus(r.data.pay_status, r.data.svr_time) : e.mmpayTimeout = setTimeout(e.requestMmpayTimeout.bind(e), 12e4);
        });
      }
      t ? 1 == t.status || 0 == t.status && r() : r();
    }
  }, {
    key: "clearMmpayTimeout",
    value: function () {
      this.mmpayTimeout && (clearTimeout(this.mmpayTimeout), this.mmpayTimeout = null);
    }
  }, {
    key: "clearServerInit",
    value: function () {
      this.serverConfigInterval && clearInterval(this.serverConfigInterval);
    }
  }, {
    key: "upDateFriendsScoreList",
    value: function () {
      var e = this;
      this.model.getSessionId() && u.default.requestFriendsScore(function () {
        e.updateFriendsScore2.bind(e).apply(void 0, arguments);
      }).then(function () {}, function () {});
    }
  }, {
    key: "updateUserInfo",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
        t = o.default.getMyUserInfo();
      "object" == n(t) && t.open_id || u.default.getUserInfo(e.bind(this)).then(function () {}, function (e) {
        e && Math.random() < .1 && ("object" == n(e) && (e = JSON.stringify(e)), u.default.badReport("$$getUserInfoFail;unknownError;".concat(e, ";"))), u.default.sendServerError(6);
      });
    }
  }, {
    key: "updateFriendsScore",
    value: function (e, t) {
      if (e && (t.user_info.sort(function (e, t) {
        return -(e.week_best_score || 0) + (t.week_best_score || 0);
      }), this.model.saveFriendsScore(t.user_info), t.my_user_info)) {
        var r = t.my_user_info.history_best_score || 0;
        this.model.saveHeighestScore(r);
        var n = t.my_user_info.week_best_score || 0;
        this.model.weekBestScore = n, this.model.saveWeekBestScore(n);
        var i = t.my_user_info.times;
        this.historyTimes.verifyScore(i), t && t.my_user_info && s.default.setRankDataTolocalStorage(t.my_user_info);
      }
    }
  }, {
    key: "updateFriendsScore2",
    value: function (e, t) {
      e && (t.user_info.sort(function (e, t) {
        return -(e.week_best_score || 0) + (t.week_best_score || 0);
      }), this.model.saveFriendsScore(t.user_info), t.my_user_info && s.default.setRankDataTolocalStorage(t.my_user_info));
    }
  }, {
    key: "uploadScore",
    value: function (e) {
      u.default.requestSettlement(e);
    }
  }, {
    key: "requestSettlement",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : function () {},
        n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
      u.default.requestSettlement(e, t, r, n);
    }
  }, {
    key: "requestLogin",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      u.default.requestLogin(e);
    }
  }, {
    key: "sendServerError",
    value: function () {
      u.default.sendServerError(2);
    }
  }, {
    key: "createRouterId",
    value: function (e) {
      u.default.createRouterId(e);
    }
  }], [{
    key: "getPropperty",
    value: function () {
      return u.default.getproperty().then(function (e) {
        return s.default.updateSkinExpireByPropertyList(e.property_list), Promise.resolve(e);
      }, function (e) {
        return Promise.reject(e);
      });
    }
  }]);
}();
