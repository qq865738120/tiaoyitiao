// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../@babel/runtime/helpers/classCallCheck"),
  a = require("../@babel/runtime/helpers/createClass"),
  i = e(require("./store/storage")),
  s = e(require("./store/session"));
exports.default = function () {
  return a(function e(a) {
    t(this, e), this.game = a, this.mode = "", this.stage = "", this.is_from_wn = 0, this.firstBlood = !1, this.currentScore = 0, this.highestScore = 0, this.observeInfo = {}, this.friendsScore = [], this.weekBestScore = 0, this.startTime = Math.floor(Date.now() / 1e3), this.upLoadScoreData = {}, this.relayInfo = {}, this.groupListData = !1, this.chatToolActivityId = "", this.groupOpenid = "", this.pkLifeTime = void 0, this.championScore = -1, this.adInfo = {
      canShowAd: !1,
      advertisingInfo: {}
    };
  }, [{
    key: "checkAdInfo",
    value: function () {
      this.adInfo.canShowAd = !this.getAdTagInLS();
    }
  }, {
    key: "setMode",
    value: function (e) {
      this.mode = e, this.game.mode = e;
    }
  }, {
    key: "setStage",
    value: function (e) {
      this.stage = e, this.game.stage = e;
    }
  }, {
    key: "init",
    value: function () {
      s.default.init(), i.default.getFirstBlood() || (this.setFirstBlood(!0), i.default.saveFirstBlood()), this.highestScore = i.default.getHeighestScore() || 0, s.default.setServerConfig(i.default.getServerConfig()), this.weekBestScore = i.default.getWeekBestScore() || 0, this.friendsScore = i.default.getFriendsScore();
    }
  }, {
    key: "getServerConfig",
    value: function () {
      return s.default.serverConfig;
    }
  }, {
    key: "setIsFromWn",
    value: function (e) {
      this.is_from_wn = e, this.game.is_from_wn = e;
    }
  }, {
    key: "setFirstBlood",
    value: function (e) {
      this.firstBlood = e, this.game.firstBlood = e;
    }
  }, {
    key: "getMode",
    value: function () {
      return this.mode;
    }
  }, {
    key: "setScore",
    value: function (e) {
      this.currentScore = e;
    }
  }, {
    key: "saveHeighestScore",
    value: function (e) {
      i.default.saveHeighestScore(e), this.highestScore = e;
    }
  }, {
    key: "saveLaterUpLoadScore",
    value: function (e, t) {
      if (e && t) {
        var a = {
          ts: this.getNextSunday(),
          score: e,
          data: t
        };
        i.default.saveActionData(a);
      }
    }
  }, {
    key: "clearLaterUpLoadScore",
    value: function () {
      i.default.saveActionData("");
    }
  }, {
    key: "saveWeekBestScore",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        t = {
          ts: this.getNextSunday(),
          data: e
        };
      i.default.saveWeekBestScore(t);
    }
  }, {
    key: "getActionData",
    value: function () {
      return i.default.getActionData();
    }
  }, {
    key: "getHighestScore",
    value: function () {
      return this.highestScore;
    }
  }, {
    key: "saveFriendsScore",
    value: function (e) {
      this.friendsScore = e;
      var t = {
        ts: this.getNextSunday(),
        data: e
      };
      i.default.saveFriendsScore(t);
    }
  }, {
    key: "getSessionId",
    value: function () {
      return s.default.sessionId;
    }
  }, {
    key: "getPkId",
    value: function () {
      return s.default.pkId;
    }
  }, {
    key: "clearPkId",
    value: function () {
      s.default.clearPkId();
    }
  }, {
    key: "setShareTicket",
    value: function (e) {
      s.default.setShareTicket(e);
    }
  }, {
    key: "getShareTicket",
    value: function () {
      return s.default.shareTicket;
    }
  }, {
    key: "clearShareTicket",
    value: function () {
      s.default.clearShareTicket();
    }
  }, {
    key: "setGameId",
    value: function (e) {
      s.default.setGameId(e);
    }
  }, {
    key: "setGameTicket",
    value: function (e) {
      s.default.setGameTicket(e);
    }
  }, {
    key: "clearGameId",
    value: function () {
      s.default.clearGameId();
    }
  }, {
    key: "clearGameTicket",
    value: function () {
      s.default.clearGameTicket();
    }
  }, {
    key: "setObserveInfo",
    value: function (e) {
      this.observeInfo.headimg = e.headimg, this.observeInfo.nickName = e.nickName;
    }
  }, {
    key: "clearObserveInfo",
    value: function () {
      this.observeInfo.headimg = null, this.observeInfo.nickName = null;
    }
  }, {
    key: "getIsRelayNewBie",
    value: function () {
      var e = !i.default.getRelayNewBie();
      return e && i.default.setRelayNewBie(), e;
    }
  }, {
    key: "getAdTagInLS",
    value: function () {
      var e = i.default.getAdTag();
      return e = !!(e && e.ts && e.ts > Date.now());
    }
  }, {
    key: "setAdTagInLS",
    value: function () {
      var e = this.getNextDay();
      i.default.saveAdTag({
        ts: e
      });
    }
  }, {
    key: "getNextDay",
    value: function () {
      var e = new Date();
      return e.setHours(0, 0, 0, 0), e.valueOf() + 864e5;
    }
  }, {
    key: "getNextSunday",
    value: function () {
      var e = new Date(),
        t = e.getDay();
      e.setHours(0, 0, 0, 0);
      var a = 7 - t + 1;
      return 8 == a && (a = 1), e.valueOf() + 24 * a * 60 * 60 * 1e3;
    }
  }, {
    key: "setGroupRankData",
    value: function (e, t) {
      this.groupListData = {
        list: e,
        userInfo: t
      };
    }
  }, {
    key: "getGroupRankData",
    value: function () {
      var e = this.groupListData;
      return !(!e || !e.userInfo) && {
        list: e.list,
        userInfo: e.userInfo
      };
    }
  }]);
}();
