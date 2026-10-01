// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var t = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../@babel/runtime/helpers/classCallCheck"),
  e = require("../@babel/runtime/helpers/createClass"),
  s = t(require("./lib/three.js")),
  o = 100,
  n = 2,
  l = .5,
  a = .5,
  h = (exports.default = function () {
    return e(function t(e, s) {
      i(this, t), this.scene = e, this.bottle = s, this.tailsRemainPool = [], this.tailsUsingPool = [], this.lastDotPosition = this.bottle.obj.position.clone(), this.nowPosition = this.bottle.obj.position.clone(), this.distance = a, this.init();
    }, [{
      key: "init",
      value: function () {
        var t = l,
          i = n;
        this.geometry = new s.PlaneBufferGeometry(t, i), this.material = new s.MeshBasicMaterial({
          color: 16777215,
          side: s.DoubleSide,
          transparent: !0,
          opacity: .3
        });
        for (var e = 0; e < 20; e++) {
          var o = new h(this.geometry, this.material);
          this.scene.add(o.mesh), this.tailsRemainPool.push(o);
        }
      }
    }, {
      key: "update",
      value: function (t) {
        var i;
        if (this.updateActiveCell(t), "prepare" == this.bottle.status && (this.nowPosition = this.bottle.obj.position.clone(), this.lastDotPosition = this.bottle.obj.position.clone()), "jump" == this.bottle.status) if (this.nowPosition = this.bottle.obj.position.clone(), (i = this.nowPosition.clone().distanceTo(this.lastDotPosition.clone())) < 5) {
          if (i >= this.distance) for (var e = i / this.distance, s = Math.floor(e), n = this.lastDotPosition.clone(), l = this.nowPosition.clone(), a = t / o, h = 1; h <= s; h++) {
            l = this.lastDotPosition.clone().lerp(this.nowPosition.clone(), h / e);
            var r = 1 + a * (h / e - 1);
            r = r <= 0 ? 0 : r, this.layEgg(n.clone(), l.clone(), r), n = l.clone(), h == s && (this.lastDotPosition = l.clone());
          }
        } else this.lastDotPosition = this.nowPosition.clone();
      }
    }, {
      key: "updateActiveCell",
      value: function (t) {
        for (var i = this.tailsUsingPool, e = 1 / o, s = 0; s < i.length; s++) {
          i[s].tickTime += t;
          var n = i[s].mesh.scale.y - e * t;
          if (n > 0) {
            if (i[s].mesh.scale.y = n > 0 ? n : 0, i[s].tickTime >= o) {
              i[s].reset();
              var l = i.shift();
              this.tailsRemainPool.push(l), s--;
            }
          } else {
            i[s].reset();
            var a = i.shift();
            this.tailsRemainPool.push(a), s--;
          }
        }
      }
    }, {
      key: "correctPosition",
      value: function () {
        this.lastDotPosition = this.bottle.obj.position.clone();
      }
    }, {
      key: "layEgg",
      value: function (t, i) {
        var e = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1,
          s = this.getMesh();
        this.tailsUsingPool.push(s), s.mesh.position.set(i.x, i.y, i.z), s.mesh.scale.y = e, s.mesh.lookAt(t), s.mesh.rotateY(Math.PI / 2), s.mesh.visible = !0;
      }
    }, {
      key: "getMesh",
      value: function () {
        var t = this.tailsRemainPool.shift();
        return t || (t = new h(this.geometry, this.material), this.scene.add(t.mesh)), t;
      }
    }, {
      key: "allReset",
      value: function () {
        this.tailsRemainPool.forEach(function (t) {
          t.reset();
        });
      }
    }]);
  }(), function () {
    return e(function t(e, o) {
      i(this, t), this.tickTime = 0, this.mesh = new s.Mesh(e, o), this.mesh.visible = !1, this.mesh.name = "tail";
    }, [{
      key: "reset",
      value: function () {
        this.tickTime = 0, this.mesh.scale.set(1, 1, 1), this.mesh.visible = !1;
      }
    }]);
  }());
