// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var o = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../@babel/runtime/helpers/classCallCheck"),
  t = require("../@babel/runtime/helpers/createClass"),
  e = o(require("./lib/three")),
  i = require("./config"),
  n = require("./lib/animation"),
  l = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
  a = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
exports.default = function () {
  return t(function o() {
    r(this, o);
    var t = ["varying vec2 vUv;", "void main()", "{", "  vUv = uv;", "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n"),
      n = ["uniform vec3 topColor;", "uniform vec3 bottomColor;", "varying vec2 vUv;", "void main()", "{", "  float h = vUv.y;", "  gl_FragColor = vec4(mix(bottomColor, topColor, min(max(h, 0.0), 1.0)), 1.0);", "}"].join("\n"),
      u = {
        topColor: {
          type: "c",
          value: new e.Color("rgb(215, 219, 230)")
        },
        bottomColor: {
          type: "c",
          value: new e.Color("rgb(188, 190, 199)")
        }
      },
      s = new e.PlaneGeometry(a / l * i.FRUSTUMSIZE, i.FRUSTUMSIZE);
    this.obj = new e.Object3D();
    var m = new e.ShaderMaterial({
      uniforms: u,
      vertexShader: t,
      fragmentShader: n
    });
    this.ground = new e.Mesh(s, m), this.obj.add(this.ground), this.colors = [{
      topColor: [215, 219, 230],
      bottomColor: [188, 190, 199]
    }, {
      topColor: [252, 235, 227],
      bottomColor: [227, 190, 195]
    }, {
      topColor: [217, 237, 245],
      bottomColor: [188, 218, 191]
    }, {
      topColor: [248, 228, 189],
      bottomColor: [231, 192, 136]
    }, {
      topColor: [214, 230, 249],
      bottomColor: [153, 183, 208]
    }, {
      topColor: [255, 250, 204],
      bottomColor: [239, 232, 152]
    }, {
      topColor: [217, 218, 246],
      bottomColor: [164, 172, 212]
    }], this.current = 0;
  }, [{
    key: "changeColor",
    value: function () {
      var o = this,
        r = this.current + 1 > 6 ? 0 : this.current + 1,
        t = [255 * this.ground.material.uniforms.topColor.value.r, 255 * this.ground.material.uniforms.topColor.value.g, 255 * this.ground.material.uniforms.topColor.value.b],
        i = [255 * this.ground.material.uniforms.bottomColor.value.r, 255 * this.ground.material.uniforms.bottomColor.value.g, 255 * this.ground.material.uniforms.bottomColor.value.b],
        l = t.concat(i),
        a = this.colors[r].topColor.concat(this.colors[r].bottomColor);
      (0, n.TweenAnimation)(l, a, 5e3, "Linear", function (t, i) {
        if (void 0 !== t) {
          for (var n = 0; n < 6; ++n) t[n] = parseInt(t[n]);
          var l = t.slice(0, 3),
            a = t.slice(3);
          o.ground.material.uniforms.topColor.value = new e.Color("rgb(".concat(l.join(","), ")")), o.ground.material.uniforms.bottomColor.value = new e.Color("rgb(".concat(a.join(","), ")")), o.current = r;
        }
      });
    }
  }]);
}();
