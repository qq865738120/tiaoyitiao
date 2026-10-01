// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default,
  i = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var a = require("../../@babel/runtime/helpers/toConsumableArray"),
  t = require("../../@babel/runtime/helpers/classCallCheck"),
  r = require("../../@babel/runtime/helpers/createClass"),
  o = require("../config"),
  s = i(require("../lib/three")),
  n = require("../lib/animation"),
  l = e(require("../lib/mue/eventcenter")),
  h = o.AD_BOARD.RADIUS,
  u = o.AD_BOARD.x;
exports.default = function () {
  return r(function e(i) {
    var a = this;
    t(this, e), this.camera = i.camera;
    var r = i.trademark_url;
    this.ad_url = i.ad_url, this.navigateToMiniProgramData = i.navigateToMiniProgramData;
    var n = new s.MeshBasicMaterial({
        map: o.loader.load(o.BASE_TRADE_MARK_RUL),
        transparent: !0,
        opacity: 0
      }),
      m = new s.CircleGeometry(h, 32);
    this.mesh = new s.Mesh(m, n), this.ePosition = [u, 22, 10], this.sPosition = [u, 20, 10], this.mesh.visible = !1, this.camera.add(this.mesh), l.default.on(o.EVENT.TRIGGER_AD_JUMP, this.jumpToH5.bind(this)), r ? o.loader.load(r, function (e) {
      a.mesh.material.map = e, a.mesh.material.needsUpdate = !0, a.show();
    }, function () {}, function (e) {
      console.error("load AD texture error:" + e), a.show();
    }) : this.show();
  }, [{
    key: "show",
    value: function () {
      var e;
      (e = this.mesh.position).set.apply(e, a(this.sPosition)), this.mesh.material.opacity = 0, this.mesh.visible = !0, n.customAnimation.to(this.mesh.position, .4, {
        y: this.ePosition[1]
      }), n.customAnimation.to(this.mesh.material, .4, {
        opacity: 1
      });
    }
  }, {
    key: "jumpToH5",
    value: function () {
      if (this.mesh.visible) {
        if (this.ad_url && wx.openUrl && wx.openUrl({
          url: this.ad_url
        }), this.navigateToMiniProgramData) {
          var e = this.navigateToMiniProgramData,
            i = e.appId,
            a = void 0 === i ? "" : i,
            t = e.path,
            r = void 0 === t ? "" : t,
            s = e.extraData,
            n = void 0 === s ? "" : s;
          wx.navigateToMiniProgram && wx.navigateToMiniProgram({
            appId: a,
            path: r,
            extraData: n,
            success: function () {
              console.log("--navigateToMiniProgram");
            },
            fail: function (e) {
              console.log("--navigateToMiniProgram fail", e);
            }
          });
        }
        this.mesh.visible = !1, l.default.emit(o.EVENT.JUMP_AD, {});
      }
    }
  }, {
    key: "destroy",
    value: function () {
      this.camera.remove(this.mesh), l.default.off(o.EVENT.TRIGGER_AD_JUMP, this.jumpToH5.bind(this));
    }
  }]);
}();
