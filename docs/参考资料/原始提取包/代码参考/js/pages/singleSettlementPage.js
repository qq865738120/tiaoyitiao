// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  t = e(require("../lib/three"));
exports.default = function () {
  return i(function e(i) {
    r(this, e);
    var a = new t.MeshBasicMaterial({
        color: 32960
      }),
      s = new t.Mesh(new t.PlaneGeometry(5, 5), a),
      o = s.clone(),
      n = s.clone();
    o.position.set(0, -20, -1), s.position.set(-10, -20, -1), n.position.set(10, -20, -1), this.ui = [o, s, n], this.camera = i;
  }, [{
    key: "show",
    value: function () {
      var e = this;
      this.ui.forEach(function (r) {
        e.camera.add(r);
      });
    }
  }, {
    key: "hide",
    value: function () {
      var e = this;
      this.ui.forEach(function (r) {
        e.camera.remove(r);
      });
    }
  }]);
}();
