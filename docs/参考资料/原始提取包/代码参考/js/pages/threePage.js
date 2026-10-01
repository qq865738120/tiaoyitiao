// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  r = e(require("../lib/three")),
  s = require("../config");
exports.default = function () {
  return i(function e(i, o, a, n, l, u) {
    t(this, e);
    var h = new r.PlaneBufferGeometry(n, l),
      b = new r.MeshBasicMaterial({
        map: s.loader.load(u),
        transparent: !0
      });
    this.obj = new r.Mesh(h, b), this.obj.visible = !0, this.obj.position.y = o || 0, this.obj.position.z = a || 0, this.obj.position.x = i || 0;
  }, [{
    key: "rotate",
    value: function () {
      var e = this,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
      this.timer || (this.timer = setInterval(function () {
        e.obj.rotation.z += t;
      }, 20));
    }
  }, {
    key: "destroy",
    value: function () {
      this.timer && (clearInterval(this.timer), this.timer = null);
    }
  }]);
}();
