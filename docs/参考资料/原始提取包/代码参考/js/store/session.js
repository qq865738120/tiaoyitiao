// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t() {
    e(this, t);
  }, null, [{
    key: "init",
    value: function () {
      this.sessionId = "", this.gameId = "", this.gameTicket = "", this.serverConfig = "", this.shareTicket = "", this.pkId = "", this.serverConfig = "";
    }
  }, {
    key: "setLoginState",
    value: function (e) {
      this.sessionId = e;
    }
  }, {
    key: "setGameId",
    value: function (e) {
      this.gameId = e;
    }
  }, {
    key: "setGameTicket",
    value: function (e) {
      this.gameTicket = e;
    }
  }, {
    key: "setServerConfig",
    value: function (e) {
      this.serverConfig = e;
    }
  }, {
    key: "setShareTicket",
    value: function (e) {
      console.warn("!!! setShareTicket", e), this.shareTicket = e;
    }
  }, {
    key: "setPkId",
    value: function (e) {
      this.pkId = e;
    }
  }, {
    key: "clearPkId",
    value: function () {
      this.pkId = "";
    }
  }, {
    key: "clearGameId",
    value: function () {
      this.gameId = "";
    }
  }, {
    key: "clearShareTicket",
    value: function () {
      this.ShareTicket = "";
    }
  }, {
    key: "clearGameTicket",
    value: function () {
      this.gameTicket = "";
    }
  }]);
}();
