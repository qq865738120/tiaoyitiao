// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../@babel/runtime/helpers/classCallCheck"),
  t = require("../@babel/runtime/helpers/createClass"),
  i = e(require("./lib/three")),
  a = require("./config"),
  s = new i.RingBufferGeometry(a.WAVE.innerRadius, a.WAVE.outerRadius, a.WAVE.thetaSeg);
exports.default = function () {
  return t(function e() {
    r(this, e);
    var t = new i.MeshBasicMaterial({
      color: a.COLORS.pureWhite,
      transparent: !0
    });
    this.obj = new i.Mesh(s, t), this.obj.rotation.x = -Math.PI / 2, this.obj.name = "wave";
  }, [{
    key: "reset",
    value: function () {
      this.obj.scale.set(1, 1, 1), this.obj.material.opacity = 1, this.obj.visible = !1;
    }
  }]);
}();
