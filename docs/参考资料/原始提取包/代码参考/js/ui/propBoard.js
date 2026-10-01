// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default,
  i = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/classCallCheck"),
  s = require("../../@babel/runtime/helpers/createClass"),
  r = require("../config"),
  a = i(require("../lib/three")),
  h = (require("../lib/animation"), e(require("../lib/mue/eventcenter"))),
  n = r.PROP_BOARD.p.RADIUS;
exports.default = function () {
  return s(function e(i) {
    var s = this;
    t(this, e), this.camera = i.camera, this.usingId = i.usingId, this.destroyCb = i.destroyCb, this.game = i.game;
    var u = r.PROP_BOARD.skin["s" + i.usingId],
      l = new a.MeshBasicMaterial({
        transparent: !0
      }),
      o = new a.CircleGeometry(n, 32);
    this.mesh = new a.Mesh(o, l), this.mesh.position.set(r.PROP_BOARD.p.x, r.PROP_BOARD.p.y, -1), this.mesh.visible = !1, this.mesh.material.depthTest = !1, this.camera.add(this.mesh), h.default.on(r.EVENT.TRIGGER_PROP, this.touch.bind(this)), r.loader.load(u, function (e) {
      s.mesh.material.map = e, s.mesh.visible = !0, s.mesh.material.needsUpdate = !0;
    });
  }, [{
    key: "touch",
    value: function () {
      this.mesh.visible && this.game.gameCtrl.touchProp({
        id: this.usingId,
        cb: this.afterUsingPorp.bind(this),
        seed: this.game.randomSeed
      });
    }
  }, {
    key: "afterUsingPorp",
    value: function (e) {
      e && this.destroyCb();
    }
  }, {
    key: "destroy",
    value: function () {
      this.camera.remove(this.mesh), h.default.off(r.EVENT.TRIGGER_PROP, this.touch.bind(this));
    }
  }]);
}();
