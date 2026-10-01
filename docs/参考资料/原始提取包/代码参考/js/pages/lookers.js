// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default,
  t = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../../@babel/runtime/helpers/classCallCheck"),
  r = require("../../@babel/runtime/helpers/createClass"),
  a = t(require("../lib/three")),
  n = require("../config"),
  s = (e(require("../store/storage")), e(require("../scroll/scrollHandler")), window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio),
  h = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth,
  o = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
  l = o * s,
  c = h * s,
  u = n.FRUSTUMSIZE,
  d = c / l * u,
  g = ["bg"];
exports.default = function () {
  return r(function e(t) {
    i(this, e), this.texture = {}, this.material = {}, this.geometry = {}, this.obj = {}, this.canvas = {}, this.context = {}, this._touchInfo = {
      trackingID: -1,
      maxDy: 0,
      maxDx: 0
    }, this.cwidth = c, this.cheight = 75, this.options = Object.assign({}, {}, t), this._createPlane();
  }, [{
    key: "showLookers",
    value: function (e) {
      this.showState = !0, e = e || {}, this._drawLookers(e);
    }
  }, {
    key: "showLookersShare",
    value: function (e) {
      this.showState = !0, e = e || {};
    }
  }, {
    key: "hideLookers",
    value: function () {
      this.showState = !1;
      for (var e = 0; e < g.length; e++) this.obj[g[e]].visible = !1, this.options.camera.remove(this.obj[g[e]]);
    }
  }, {
    key: "_drawLookers",
    value: function (e) {
      var t = this;
      console.warn("!!! _drawLookers", e);
      var i = this.context.bg;
      i.fillStyle = "pink", i.strokeStyle = "red", i.lineWidth = 2 * s, i.clearRect(0, 0, this._cx(414), this._cx(this.cheight));
      this.cheight;
      if (e.avaImg) {
        for (var r = c - e.avatar.length * this._cx(32), a = this, n = function () {
            var i = h * t._cx(36) + r;
            t._drawImageCenter(e.avatar[h], i, 75, a._cx(25), a._cx(25), "bg", function () {
              a._drawImageCenter("res/2d/ava_square.png", i, 75, a._cx(26), a._cx(26), "bg");
            });
          }, h = 0; h < e.avatar.length; h++) n();
        i.fillStyle = "rgba(0,0,0,0.56)", i.font = this._cf(14), i.textAlign = "right", i.textBaseline = "middle", i.fillText(e.num + "人围观", r - this._cx(20), 75);
      }
      e.icon && this._drawImageCenter("res/observShare.png", this._cx(35), 75, this._cx(14), this._cx(16), "bg"), e.wording && (i.fillStyle = "rgba(0,0,0,0.56)", i.font = this._cf(14), i.textAlign = "left", i.textBaseline = "middle", i.fillText("邀请围观", this._cx(55), 75)), this._updatePlane("bg");
    }
  }, {
    key: "_createPlane",
    value: function () {
      for (var e = 0; e < g.length; e++) this.canvas[g[e]] = document.createElement("canvas"), this.context[g[e]] = this.canvas[g[e]].getContext("2d"), this.canvas[g[e]].width = c, this.canvas[g[e]].height = this.cheight * s, this.texture[g[e]] = new a.Texture(this.canvas[g[e]]), this.material[g[e]] = new a.MeshBasicMaterial({
        map: this.texture[g[e]],
        transparent: !0
      }), this.geometry[g[e]] = new a.PlaneGeometry(d, this.cheight / o * u), this.obj[g[e]] = new a.Mesh(this.geometry[g[e]], this.material[g[e]]), this.material[g[e]].map.minFilter = a.LinearFilter, this.obj[g[e]].position.y = -(.5 - this.cheight / 2 / o) * u, this.obj[g[e]].position.x = 0, this.obj[g[e]].position.z = 9 - .001 * e;
    }
  }, {
    key: "_updatePlane",
    value: function (e) {
      this.showState && (this.texture[e].needsUpdate = !0, this.obj[e].visible = !0, this.options.camera.add(this.obj[e]));
    }
  }, {
    key: "_drawImageCenter",
    value: function (e, t, i, r, a, n, s) {
      "/0" != e && "/96" != e && "/64" != e && e || (e = "res/ava.png");
      var h = new Image(),
        o = this,
        l = this.context[n];
      h.onload = function () {
        l.drawImage(h, t - r / 2, i - a / 2, r, a), s && s(), o._updatePlane(n);
      }, h.onerror = function () {
        s && s();
      }, h.src = e;
    }
  }, {
    key: "_cx",
    value: function (e) {
      return e * h / 414 * s;
    }
  }, {
    key: "_cf",
    value: function (e) {
      return e * s * h / 414 + "px Helvetica";
    }
  }]);
}();
