// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  e = require("../../@babel/runtime/helpers/createClass");
exports.default = function () {
  return e(function e(i) {
    t(this, e), this.optionReport = i.report || function () {}, this.duration = i.duration || 7e3, this.logMessage = "", this.logMaxLength = i.logMaxLength || 5e3, this.timeout = null, this.haveReport = 0;
  }, [{
    key: "start",
    value: function () {
      var t = this;
      this.timeout || this.haveReport || (this.timeout = setTimeout(function () {
        t.report();
      }, this.duration));
    }
  }, {
    key: "pulse",
    value: function () {
      var t = this;
      this.timeout && (this.rpClearTimeout(), this.timeout = setTimeout(function () {
        t.report();
      }, this.duration));
    }
  }, {
    key: "stop",
    value: function () {
      this.rpClearTimeout();
    }
  }, {
    key: "rpClearTimeout",
    value: function () {
      this.timeout && (clearTimeout(this.timeout), this.timeout = null);
    }
  }, {
    key: "report",
    value: function () {
      this.haveReport = 1, this.optionReport(this.logMessage), this.logMessage = "";
    }
  }, {
    key: "log",
    value: function () {
      for (var t = arguments.length, e = new Array(t), i = 0; i < t; i++) e[i] = arguments[i];
      var o = e.join(";;;");
      if (o) {
        this.logMessage += o;
        var s = this.logMessage.length;
        if (s > this.logMaxLength) {
          var r = s - this.logMaxLength;
          this.logMessage = this.logMessage.slice(r, s);
        }
      }
    }
  }]);
}();
