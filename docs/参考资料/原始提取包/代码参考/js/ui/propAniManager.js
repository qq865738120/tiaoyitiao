// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../@babel/runtime/helpers/createClass"),
  a = require("../config"),
  s = e(require("../lib/three")),
  r = require("../lib/animation");
exports.default = function () {
  return t(function e(t) {
    var a = t.camera,
      r = t.game;
    i(this, e), this.game = r, this.camera = a;
    var o = new s.CircleGeometry(1.5, 32),
      n = new s.MeshBasicMaterial({
        color: 16777215,
        transparent: !0,
        opacity: 1
      });
    this.bg = new s.Mesh(o, n);
    var m = new s.CircleGeometry(1.3, 32),
      h = new s.MeshBasicMaterial({
        transparent: !0,
        opacity: 1
      });
    this.main = new s.Mesh(m, h), this.main.position.set(0, 0, .1), this.mesh = new s.Object3D(), this.mesh.add(this.bg), this.mesh.add(this.main), this.mesh.rotateY(-Math.PI / 4), this.mesh.rotateX(-Math.PI / 16 * 3), this.mesh.visible = !1;
  }, [{
    key: "show",
    value: function () {
      var e = this,
        i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
        t = a.PROP_BOARD.skin["s" + i];
      a.loader.load(t, function (i) {
        e.main.material.map = i, e.main.material.needsUpdate = !0, e.mesh.visible = !0;
      });
      var s = this.game.bottle.obj.position.clone(),
        o = s.x,
        n = s.z;
      this.mesh.position.set(o, 10, n), this.bg.material.opacity = 0, this.main.material.opacity = 0, this.game.scene.add(this.mesh), r.customAnimation.to(this.mesh.position, .4, {
        y: 13
      }), r.customAnimation.to(this.bg.material, .4, {
        opacity: 1
      }), r.customAnimation.to(this.main.material, .4, {
        opacity: 1
      }), r.customAnimation.to(this.bg.material, .4, {
        opacity: 0,
        delay: .6
      }), r.customAnimation.to(this.main.material, .4, {
        opacity: 0,
        delay: .6,
        onComplete: function () {
          e.game.scene.remove(e.mesh), e.mesh.visible = !1;
        }
      });
    }
  }]);
}();
