// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass"),
  i = require("./util"),
  o = e(require("./mock/requestmocker")),
  s = e(require("./mock/socketmocker")),
  u = new (function () {
    return t(function e() {
      r(this, e), this._mocker = {
        request: null,
        socket: null
      }, this.origWX = null;
    }, [{
      key: "mocker",
      value: function (e) {
        return this._mocker[e] || (this._hookWX(), this._initMocker(e)), this._mocker[e] || {};
      }
    }, {
      key: "enable",
      value: function (e) {
        for (var r in e || (e = {
          request: !0,
          socket: !0
        }), e) e[r] && this.mocker(r).enable && this.mocker(r).enable();
      }
    }, {
      key: "addRule",
      value: function (e, r) {
        this.mocker(e).addRule(r);
      }
    }, {
      key: "_hookWX",
      value: function () {
        if (!this.origWX) for (var e in this.origWX = wx, wx = {}, this.origWX) "[object Function]" === (0, i.getTypeOf)(this.origWX[e]) ? wx[e] = this.origWX[e].bind(this.origWX) : wx[e] = this.origWX[e];
      }
    }, {
      key: "_initMocker",
      value: function (e) {
        "request" === e && (this._mocker.request || (this._mocker.request = new o.default())), "socket" === e && (this._mocker.socket || (this._mocker.socket = new s.default()));
      }
    }]);
  }())();
exports.default = u;
