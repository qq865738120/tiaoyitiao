// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return t(function t(s, n) {
    e(this, t), this._mocker = s, this._rule = n, this._userOpt = {}, this._cb = {};
  }, [{
    key: "send",
    value: function (e) {
      this._userOpt = e, this._mocker._send(this);
    }
  }, {
    key: "close",
    value: function (e) {
      this._userOpt = e, this._mocker._close(this);
    }
  }, {
    key: "onOpen",
    value: function (e) {
      this._cb.onOpen = e;
    }
  }, {
    key: "onClose",
    value: function (e) {
      this._cb.onClose = e;
    }
  }, {
    key: "onError",
    value: function (e) {
      this._cb.onError = e;
    }
  }, {
    key: "onMessage",
    value: function (e) {
      this._cb.onMessage = e;
    }
  }, {
    key: "sendMessage",
    value: function (e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      this._applyCallback("onMessage", e, t);
    }
  }, {
    key: "closeSocket",
    value: function (e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      this._applyCallback("onClose", e, t);
    }
  }, {
    key: "throwError",
    value: function (e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      this._applyCallback("onError", e, t);
    }
  }, {
    key: "_applyCallback",
    value: function (e, t, s) {
      var n = this;
      setTimeout(function () {
        n._cb[e] && n._cb[e].call(n, t);
      }, s);
    }
  }]);
}();
