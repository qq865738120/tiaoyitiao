// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default,
  t = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../@babel/runtime/helpers/toConsumableArray"),
  s = require("../@babel/runtime/helpers/classCallCheck"),
  r = require("../@babel/runtime/helpers/createClass"),
  a = t(require("./lib/three")),
  l = e(require("./font")),
  o = function () {
    return r(function e(t) {
      var i = t.number,
        r = t.geometry,
        a = t.material;
      s(this, e), this.number = i, this.geometry = r, this.material = a, this.avaliable = [], this.used = [];
    }, [{
      key: "get",
      value: function () {
        var e = 0 === this.avaliable.length ? new a.Mesh(this.geometry, this.material) : this.avaliable.pop();
        return this.used.push(e), e;
      }
    }, {
      key: "clear",
      value: function () {
        this.avaliable = [].concat(i(this.avaliable), i(this.used)), this.used = [];
      }
    }]);
  }();
exports.default = function () {
  return r(function e(t, i) {
    var r = this;
    if (s(this, e), void 0 === i.fillStyle && (i.fillStyle = 16777215), this.material = new a.MeshBasicMaterial({
      color: i.fillStyle,
      transparent: !0
    }), i.opacity && (this.material.opacity = i.opacity), this.options = i || {}, this.obj = new a.Object3D(), this.obj.name = "text", i.chinese) {
      var n = new a.Mesh(new a.TextBufferGeometry(t, {
        font: l.default,
        size: 1,
        height: .1
      }), this.material);
      this.obj.add(n), "center" == i.textAlign && (n.position.x = 1.1 * t.length / -2);
    } else this.plus = new a.Mesh(new a.TextBufferGeometry("+", {
      font: l.default,
      size: 3,
      height: .1
    }), this.material), this.sub = new a.Mesh(new a.TextBufferGeometry("-", {
      font: l.default,
      size: 3,
      height: .1
    }), this.material), this.pools = Array.from({
      length: 10
    }).map(function (e, t) {
      return new o({
        number: t,
        material: r.material,
        geometry: new a.TextBufferGeometry(t, {
          font: l.default,
          size: 3,
          height: .1
        })
      });
    }), this.setScore(t);
  }, [{
    key: "setScore",
    value: function (e) {
      var t = this;
      this.sub.visible = !1, this.plus.visible = !1;
      var i = !1;
      e < 0 && (i = !0, e = Math.abs(e));
      var s = 2.5 * (e = e.toString()).length,
        r = "center" == this.options.textAlign ? -s / 2 : 0;
      this.options.plusScore && (r = -(s + 2.5) / 2, i || (this.plus.position.x = r, this.obj.add(this.plus), this.plus.visible = !0), r += 2.5), i && (this.sub.position.x = r, this.obj.add(this.sub), this.sub.visible = !0, r += 2.5), this.pools.forEach(function (e) {
        e.used.forEach(function (e) {
          return t.obj.remove(e);
        }), e.clear();
      });
      for (var a = 0, l = e.length; a < l; ++a) {
        var o = this.pools[e[a]].get();
        o.position.x = r, this.obj.add(o), r += 2.5;
      }
    }
  }, {
    key: "changeStyle",
    value: function (e) {
      Object.assign(this.options, e), this.obj.updateMatrix();
    }
  }]);
}();
