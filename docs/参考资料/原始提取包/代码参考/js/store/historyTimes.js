// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  s = e(require("./storage")),
  r = e(require("../network/network"));
exports.default = function () {
  return i(function e(i) {
    t(this, e), this.times = s.default.getHistoryTimes(), this.times || (this.times = {
      accurate: 0,
      bonus: 0
    }), this.game = i, this.limitScore = 5;
  }, [{
    key: "verifyScore",
    value: function (e) {
      e >= this.times.accurate ? (this.times.accurate = e, this.times.bonus >= this.limitScore ? this.upLoadHistoryTimes() : s.default.saveHistoryTimes(this.times)) : this.upLoadHistoryTimes();
    }
  }, {
    key: "addOne",
    value: function () {
      this.times.bonus++;
    }
  }, {
    key: "checkUp",
    value: function () {
      this.times.bonus >= this.limitScore ? this.upLoadHistoryTimes() : s.default.saveHistoryTimes(this.times);
    }
  }, {
    key: "upLoadHistoryTimes",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        i = this.times.accurate + this.times.bonus;
      r.default.requestSettlement(e, i, this.afterUpload.bind(this), t);
    }
  }, {
    key: "afterUpload",
    value: function (e) {
      e && (this.times.accurate += this.times.bonus, this.times.bonus = 0), s.default.saveHistoryTimes(this.times);
    }
  }, {
    key: "getTimes",
    value: function () {
      return this.times.accurate + this.times.bonus;
    }
  }]);
}();
