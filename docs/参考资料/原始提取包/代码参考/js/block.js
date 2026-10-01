// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../@babel/runtime/helpers/classCallCheck"),
  t = require("../@babel/runtime/helpers/createClass"),
  s = e(require("./lib/three")),
  a = require("./config"),
  o = require("./lib/animation"),
  h = require("./random"),
  r = 6393958,
  n = 15658734,
  l = 10395294,
  d = 7171437,
  m = 13355979,
  c = 125084537,
  u = 12303291,
  y = 8947848,
  p = new s.MeshBasicMaterial({
    map: a.loader.load("res/cylinder_shadow.png"),
    transparent: !0,
    alphaTest: .01
  }),
  w = new s.MeshBasicMaterial({
    map: a.loader.load("res/desk_shadow.png"),
    transparent: !0,
    alphaTest: .01
  }),
  g = new s.MeshBasicMaterial({
    map: a.loader.load("res/shadow.png"),
    transparent: !0,
    alphaTest: .01
  }),
  M = new s.MeshLambertMaterial({
    map: a.loader.load("res/gray.png")
  }),
  B = new s.MeshLambertMaterial({
    map: a.loader.load("res/number.png"),
    alphaTest: .6
  }),
  O = new s.BoxGeometry(2 * a.BLOCK.radius + .02, a.BLOCK.height + .04, 2 * a.BLOCK.radius + .02),
  L = new s.BoxGeometry(2 * a.BLOCK.radius, a.BLOCK.height, 2 * a.BLOCK.radius),
  b = new s.PlaneGeometry(11, 11),
  C = new s.MeshBasicMaterial({
    map: a.loader.load("res/stripe.png")
  }),
  x = a.GAME.canShadow ? s.MeshLambertMaterial : s.MeshBasicMaterial;
exports.default = function () {
  return t(function e(t, h) {
    var d = this;
    if (i(this, e), this.radius = a.BLOCK.radius, this.status = "stop", this.scale = 1, this.type = "green", this.types = ["green", "black", "gray"], this.radiusScale = 1, this.obj = new s.Object3D(), this.obj.name = "block", this.body = new s.Object3D(), (t <= 8 || 27 == t) && (this.greenMaterial = new s.MeshLambertMaterial({
      color: r
    }), this.whiteMaterial = new s.MeshLambertMaterial({
      color: n
    })), 32 != t && 33 != t && 34 != t && 35 != t || (this.greenMaterial = new s.MeshLambertMaterial({
      color: n
    }), this.whiteMaterial = new s.MeshLambertMaterial({
      color: l
    })), this.shadowWidth = 11, 2 == t || 7 == t ? (this.shadow = new s.Mesh(b, w), this.shadow.position.set(0, -a.BLOCK.height / 2 - .001 * t, -4.5), this.shadow.scale.y = 1.2) : 3 == t || 21 == t || 27 == t || 28 == t || 29 == t ? (this.shadow = new s.Mesh(b, p), this.shadow.position.set(-.1, -a.BLOCK.height / 2 - .001 * t, -2.8), this.shadow.scale.y = 1.4, this.shadow.scale.x = 1) : (this.shadow = new s.Mesh(b, g), this.shadow.position.set(-.74, -a.BLOCK.height / 2 - .001 * t, -2.73), this.shadow.scale.y = 1.4), this.shadow.rotation.x = -Math.PI / 2, this.order = t, this.radiusSegments = 4, this.height = a.BLOCK.height, this.canChange = !0, 0 == t) {
      var m = [this.greenMaterial, this.whiteMaterial],
        u = new s.Geometry(),
        y = 3,
        K = (a.BLOCK.height - y) / 2,
        v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius);
      this.geometry = v;
      var f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (1 == t) {
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry();
      var G = a.BLOCK.height / 5,
        z = new s.BoxGeometry(2 * a.BLOCK.radius, G, 2 * a.BLOCK.radius);
      this.geometry = z, this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }, {
        x: 0,
        y: -2 * G,
        z: 0
      }, {
        x: 0,
        y: 2 * G,
        z: 0
      }]), this.merge(u, z, 1, [{
        x: 0,
        y: -G,
        z: 0
      }, {
        x: 0,
        y: G,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (2 == t) {
      this.radiusSegments = 50, this.height = a.BLOCK.height / 21 * 1.5;
      G = a.BLOCK.height / 21 * 19.5;
      var j = a.BLOCK.height - G,
        P = new s.CylinderGeometry(a.BLOCK.radius - 4, a.BLOCK.radius - 2, G, 50),
        I = new s.CylinderGeometry(a.BLOCK.radius, a.BLOCK.radius, j, 50),
        U = new s.Mesh(I, this.greenMaterial);
      (k = new s.Mesh(P, this.whiteMaterial)).position.y = -a.BLOCK.height / 21 * 10.5, this.body.add(k), this.hitObj = U;
    } else if (3 == t) {
      this.radiusSegments = 50, this.middleLightGreenMaterial = new s.MeshLambertMaterial({
        color: c
      });
      m = [this.greenMaterial, this.whiteMaterial, this.middleLightGreenMaterial], u = new s.Geometry(), G = 5, j = a.BLOCK.height - G, P = new s.CylinderGeometry(a.BLOCK.radius, a.BLOCK.radius, G, 50), I = new s.CylinderGeometry(a.BLOCK.radius, a.BLOCK.radius, j, 50);
      this.geometry = I, (_ = new s.RingGeometry(.6 * a.BLOCK.radius, .8 * a.BLOCK.radius, 30)).rotateX(-Math.PI / 2), this.merge(u, P, 1, [{
        x: 0,
        y: -(a.BLOCK.height - G) / 2,
        z: 0
      }]), this.merge(u, I, 0, [{
        x: 0,
        y: G + j / 2 - a.BLOCK.height / 2,
        z: 0
      }]), this.merge(u, _, 2, [{
        x: 0,
        y: a.BLOCK.height / 2 + .01,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (4 == t) {
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), z = L;
      this.geometry = z, this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]);
      var _ = new s.RingGeometry(1, 2, 30, 1);
      this.merge(u, _, 1, [{
        x: 0,
        y: 0,
        z: a.BLOCK.radius + .01
      }]), _.rotateY(-Math.PI / 2), this.merge(u, _, 1, [{
        x: -a.BLOCK.radius - .01,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (5 == t) {
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), y = 3, K = (a.BLOCK.height - y) / 2, v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius), f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (6 == t) {
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), y = 3, K = (a.BLOCK.height - y) / 2, v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius), f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (7 == t) {
      this.radiusSegments = 50, this.height = a.BLOCK.height / 21 * 1.5;
      var k;
      G = a.BLOCK.height / 21 * 19.5, j = a.BLOCK.height - G, P = new s.CylinderGeometry(a.BLOCK.radius - 4, a.BLOCK.radius - 2, G, 50), I = new s.CylinderGeometry(a.BLOCK.radius, a.BLOCK.radius, j, 50), U = new s.Mesh(I, this.greenMaterial);
      (k = new s.Mesh(P, this.whiteMaterial)).position.y = -a.BLOCK.height / 21 * 10.5, this.body.add(k), this.hitObj = U;
    } else if (8 == t) {
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), G = a.BLOCK.height / 5, z = new s.BoxGeometry(2 * a.BLOCK.radius, G, 2 * a.BLOCK.radius);
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }, {
        x: 0,
        y: -2 * G,
        z: 0
      }, {
        x: 0,
        y: 2 * G,
        z: 0
      }]), this.merge(u, z, 1, [{
        x: 0,
        y: -G,
        z: 0
      }, {
        x: 0,
        y: G,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (9 == t) {
      var A = new s.MeshLambertMaterial({
        color: 15563832
      });
      m = [A, R = new s.MeshBasicMaterial({
        map: a.loader.load("res/game.png"),
        transparent: !0
      })], u = new s.Geometry(), z = L;
      this.geometry = z, this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, new s.PlaneGeometry(5, 5), 1, [{
        x: 0,
        y: .1,
        z: a.BLOCK.radius + .01
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (10 == t) {
      var T = new s.MeshLambertMaterial({
          color: 16508510
        }),
        S = (m = [T, R = new s.MeshBasicMaterial({
          map: a.loader.load("res/emotion.png"),
          transparent: !0
        })], u = new s.Geometry(), z = L, new s.CylinderGeometry(2, 2, 1, 50)),
        D = new s.PlaneGeometry(1.5, 1.5);
      this.geometry = z, this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), S.rotateX(Math.PI / 2), this.merge(u, S, 0, [{
        x: 0,
        y: 0,
        z: a.BLOCK.radius + .51
      }]), S.rotateZ(Math.PI / 2), S.rotateY(Math.PI / 2), this.merge(u, S, 0, [{
        x: -a.BLOCK.radius - .51,
        y: 0,
        z: 0
      }]), this.merge(u, D, 1, [{
        x: 0,
        y: 0,
        z: a.BLOCK.radius + 1.02
      }]), D.rotateY(-Math.PI / 2), this.merge(u, D, 1, [{
        x: -a.BLOCK.radius - 1.02,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (11 == t) {
      z = L;
      var Y = new s.BoxGeometry(3, 2, 4);
      this.geometry = z;
      var H = new s.MeshLambertMaterial({
          color: 11855938
        }),
        R = new s.MeshBasicMaterial({
          map: a.loader.load("res/green_face.png"),
          transparent: !0
        });
      D = new s.PlaneGeometry(6, 3), m = [H, R], u = new s.Geometry();
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, D, 1, [{
        x: .5,
        y: -1,
        z: a.BLOCK.radius + .01
      }]), Y.rotateZ(Math.PI / 5), this.merge(u, Y, 0, [{
        x: -a.BLOCK.radius - 1,
        y: 1,
        z: 2.5
      }]), Y.rotateZ(-2 * Math.PI / 5), this.merge(u, Y, 0, [{
        x: a.BLOCK.radius,
        y: 1,
        z: 2.5
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (12 == t) {
      z = L, Y = new s.BoxGeometry(3, 2, 4);
      this.geometry = z;
      H = new s.MeshLambertMaterial({
        color: 15921906
      }), R = new s.MeshLambertMaterial({
        map: a.loader.load("res/white_face.png")
      }), D = new s.PlaneGeometry(6, 3), m = [H, R], u = new s.Geometry();
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, D, 1, [{
        x: .5,
        y: -1,
        z: a.BLOCK.radius + .01
      }]), Y.rotateZ(Math.PI / 5), this.merge(u, Y, 0, [{
        x: -a.BLOCK.radius - 1,
        y: 1,
        z: 2.5
      }]), Y.rotateZ(-2 * Math.PI / 5), this.merge(u, Y, 0, [{
        x: a.BLOCK.radius,
        y: 1,
        z: 2.5
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (13 == t) {
      z = L;
      this.geometry = z;
      R = new s.MeshLambertMaterial({
        map: a.loader.load("res/money.png")
      }), D = new s.PlaneGeometry(3, 3), m = [R], u = new s.Geometry();
      this.mapUv(64, 64, z, 1, 2, 2, 4, 4), this.mapUv(64, 64, z, 2, 2, 2, 4, 4), this.mapUv(64, 64, z, 4, 2, 2, 4, 4), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, D, 0, [{
        x: 0,
        y: 0,
        z: a.BLOCK.radius + .01
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (14 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius);
      this.geometry = z;
      var E = new s.MeshLambertMaterial({
        map: a.loader.load("res/tit.png")
      });
      this.mapUv(310, 310, z, 1, 0, 0, 200, 110), this.mapUv(310, 310, z, 2, 0, 110, 200, 310), this.mapUv(310, 310, z, 4, 200, 110, 310, 310), this.hitObj = new s.Mesh(z, E);
    } else if (15 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius);
      this.map = a.loader.load("res/bag.png");
      E = new s.MeshLambertMaterial({
        map: this.map
      });
      this.glowMap = a.loader.load("res/glow_bag.png"), this.hitObj = new s.Mesh(z, E), this.whenSucceed = this.glow, this.beforePopup = this.hideGlow, this.score = 20;
    } else if (16 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius), E = new s.MeshLambertMaterial({
        map: a.loader.load("res/dict.png")
      });
      this.mapUv(428, 428, z, 1, 0, 148, 280, 0), this.mapUv(428, 428, z, 2, 0, 148, 280, 428), this.mapUv(428, 428, z, 4, 280, 148, 428, 428), this.hitObj = new s.Mesh(z, E);
    } else if (17 == t) {
      this.height /= 3;
      var Z = new s.MeshLambertMaterial({
          map: a.loader.load("res/box_top.png")
        }),
        F = new s.MeshLambertMaterial({
          map: a.loader.load("res/box_bottom.png")
        });
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius);
      this.geometry = z;
      var X = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius);
      m = [Z, F], u = new s.Geometry();
      this.mapUv(198, 198, z, 1, 0, 0, 148, 50), this.mapUv(198, 198, z, 2, 0, 50, 148, 198), this.mapUv(198, 198, z, 4, 148, 50, 198, 198), this.mapUv(444, 50, X, 4, 148, 0, 296, 50, !0), this.mapUv(444, 50, X, 1, 0, 0, 148, 50), this.mapUv(444, 50, X, 2, 0, 0, 1, 1), this.mapUv(444, 50, X, 0, 296, 50, 444, 0), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, X, 1, [{
        x: 0,
        y: -2 * this.height,
        z: 0
      }]);
      var q = new s.MeshLambertMaterial({
        map: a.loader.load("res/box_middle.png")
      });
      this.middle = new s.Mesh(X, q), this.middle.position.y = -this.height, this.body.add(this.middle), this.hitObj = new s.Mesh(u, m), this.succeedTimer = this.rotateBox, this.score = 10;
    } else if (18 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius), E = new s.MeshLambertMaterial({
        map: a.loader.load("res/express.png")
      });
      this.mapUv(428, 428, z, 1, 0, 0, 280, 148), this.mapUv(428, 428, z, 2, 0, 148, 280, 428), this.mapUv(428, 428, z, 4, 280, 148, 428, 428), this.hitObj = new s.Mesh(z, E);
    } else if (19 == t) {
      this.min = .9, this.height = a.BLOCK.height / 21 * 4;
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height + .1, 2 * a.BLOCK.radius);
      this.geometry = z;
      E = new s.MeshLambertMaterial({
        color: 16777215,
        transparent: !0,
        opacity: .3
      }), P = new s.BoxGeometry(2.05 * a.BLOCK.radius, a.BLOCK.height / 21 * 17, 2.05 * a.BLOCK.radius), m = [E, F = new s.MeshBasicMaterial({
        map: a.loader.load("res/sing.png")
      })], u = new s.Geometry();
      this.mapUv(416, 416, P, 1, 0, 0, 256, 160), this.mapUv(416, 416, P, 2, 0, 160, 256, 416), this.mapUv(416, 416, P, 4, 256, 160, 416, 416), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, P, 1, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 10.5,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m), this.record = new s.Object3D(), this.record.add(new s.Mesh(new s.CylinderGeometry(.9 * a.BLOCK.radius, .9 * a.BLOCK.radius, .4, 50), new s.MeshBasicMaterial({
        color: 2894892
      })));
      D = new s.CircleGeometry(.9 * a.BLOCK.radius, 40), R = new s.MeshBasicMaterial({
        map: a.loader.load("res/record.png")
      });
      (Ce = new s.Mesh(D, R)).rotation.x = -Math.PI / 2, Ce.position.y = .26, this.record.add(Ce), this.body.add(this.record);
      D = new s.PlaneGeometry(2, 2);
      this.musicIcon = new s.Mesh(D, new s.MeshBasicMaterial({
        map: a.loader.load("res/music_icon.png"),
        transparent: !0
      })), this.musicIcon.position.set(0, 0, 0), this.musicIcon.rotation.y = -Math.PI / 4, this.musicIcon.rotation.x = -Math.PI / 5, this.musicIcon.rotation.z = -Math.PI / 5, this.musicIcon.visible = !1, this.secondMusicIcon = new s.Mesh(D, new s.MeshBasicMaterial({
        map: a.loader.load("res/music_icon_two.png"),
        transparent: !0
      })), this.secondMusicIcon.rotation.y = -Math.PI / 4, this.secondMusicIcon.rotation.x = -Math.PI / 5, this.secondMusicIcon.rotation.z = -Math.PI / 5, this.secondMusicIcon.visible = !1, this.icons = [], this.icons.push(this.musicIcon, this.secondMusicIcon);
      for (var W = 0; W < 2; ++W) this.body.add(this.icons[W]);
      this.succeedTimer = this.playMusic, this.score = 30, this.musicName = "sing", this.perFrame = function () {
        d.record.rotation.y += .01;
      }, this.whenLeave = function () {
        d.stopMusic();
      };
    } else if (20 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius / 38 * 48);
      this.geometry = z, this.shadow.scale.set(1, 61 / 38, 48 / 38);
      E = new s.MeshLambertMaterial({
        map: a.loader.load("res/disk.png")
      });
      var N = new s.MeshBasicMaterial({
        map: a.loader.load("res/disk_dark.png"),
        transparent: !0
      });
      D = new s.PlaneGeometry(3, 3), m = [N, E], u = new s.Geometry();
      this.mapUv(236, 300, z, 1, 0, 250, 10, 260), this.mapUv(236, 300, z, 2, 0, 300, 236, 0), this.mapUv(236, 300, z, 4, 0, 250, 10, 260), this.merge(u, z, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, D, 0, [{
        x: 3.5,
        y: .5,
        z: a.BLOCK.radius / 38 * 48 + .01
      }]), this.hitObj = new s.Mesh(u, m), this.plane = new s.Mesh(D, new s.MeshBasicMaterial({
        map: a.loader.load("res/disk_light.png"),
        transparent: !0
      })), this.plane.position.set(3.5, .5, a.BLOCK.radius / 38 * 48 + .03), this.plane.updateMatrix(), this.plane.matrixAutoUpdate = !1, this.body.add(this.plane), this.timer = setInterval(function () {
        d.plane.visible = !d.plane.visible;
      }, 1e3);
    } else if (21 == t) {
      this.radiusSegments = 50, this.min = .8, this.height = a.BLOCK.height / 21 * 4;
      z = new s.CylinderGeometry(.7 * a.BLOCK.radius, .8 * a.BLOCK.radius, this.height, 50);
      this.geometry = z;
      D = new s.CircleGeometry(.7 * a.BLOCK.radius, 50), P = new s.CylinderGeometry(.7 * a.BLOCK.radius, .5 * a.BLOCK.radius, a.BLOCK.height / 21 * 17, 50), E = new s.MeshBasicMaterial({
        color: 5066061
      }), R = new s.MeshLambertMaterial({
        map: a.loader.load("res/westore_desk.png")
      }), F = new s.MeshBasicMaterial({
        map: a.loader.load("res/westore.png")
      });
      this.shadow.scale.set(.55, .9, .7);
      m = [E, F, R], u = new s.Geometry();
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), P.rotateY(2.3), this.merge(u, P, 1, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 10.5,
        z: 0
      }]), D.rotateX(-Math.PI / 2), D.rotateY(-.7), this.merge(u, D, 2, [{
        x: 0,
        y: this.height / 2 + .01,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (22 == t) {
      this.height = a.BLOCK.height / 21 * 6;
      z = new s.BoxGeometry(2.1 * a.BLOCK.radius, this.height, 2.1 * a.BLOCK.radius);
      this.geometry = z;
      E = new s.MeshLambertMaterial({
        map: a.loader.load("res/gift.png")
      }), P = new s.BoxGeometry(2 * a.BLOCK.radius, a.BLOCK.height / 21 * 15, 2 * a.BLOCK.radius), F = new s.MeshLambertMaterial({
        color: 11637749
      });
      this.mapUv(300, 370, z, 1, 0, 0, 300, 70), this.mapUv(300, 370, z, 2, 0, 70, 300, 370), this.mapUv(300, 370, z, 4, 0, 0, 300, 70, !0);
      m = [E, F], u = new s.Geometry();
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.merge(u, P, 1, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 10.5,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (23 == t) {
      this.height = a.BLOCK.height / 21 * 5;
      z = new s.Geometry();
      var V = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius / 38 * 40);
      z.merge(V), this.shadow.scale.set(1, 48 / 38, 48 / 38);
      var J = new s.BoxGeometry(1.5, 3.5, 1.5);
      J.rotateZ(-.3), J.vertices[7].y -= .4, J.vertices[6].y -= .4, J.translate(-4, -3, -3.5), z.merge(J), J.vertices[6].y += .5, J.translate(0, 0, 7), J.rotateX(-.2), z.merge(J), J.vertices[7].y += .4, J.translate(5, -1, 0), J.rotateZ(.4), z.merge(J);
      E = new s.MeshLambertMaterial({
        map: a.loader.load("res/stool.png")
      });
      this.hitObj = new s.Mesh(z, E), this.shadow = new s.Mesh(new s.PlaneGeometry(this.shadowWidth, this.shadowWidth), new s.MeshBasicMaterial({
        map: a.loader.load("res/stool_shadow.png"),
        transparent: !0,
        alphaTest: .01
      })), this.shadow.position.set(-.76, -a.BLOCK.height / 2 - .001 * t, -3.6), this.shadow.scale.y = 1.4, this.shadow.scale.x = .9, this.shadow.rotation.x = -Math.PI / 2;
    } else if (24 == t) {
      this.height = a.BLOCK.height / 21 * 6;
      z = new s.BoxGeometry(2 * a.BLOCK.radius / 38 * 45, this.height, 2 * a.BLOCK.radius / 38 * 45);
      this.geometry = z;
      P = new s.BoxGeometry(2 * a.BLOCK.radius / 38 * 40, a.BLOCK.height / 21 * 15, 2 * a.BLOCK.radius / 38 * 40);
      this.shadow.scale.set(40 / 38, 1.4, 1);
      m = [E = new s.MeshLambertMaterial({
        map: a.loader.load("res/store_top.png")
      }), F = new s.MeshBasicMaterial({
        map: a.loader.load("res/store_bottom.png"),
        transparent: !0
      }), R = new s.MeshBasicMaterial({
        map: a.loader.load("res/indoor.png"),
        transparent: !0
      })], D = new s.PlaneGeometry(3.1, 3.1), u = new s.Geometry();
      this.mapUv(340, 340, z, 1, 0, 0, 280, 60), this.mapUv(340, 340, z, 2, 0, 60, 280, 340), this.mapUv(340, 340, z, 4, 280, 60, 340, 340), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.mapUv(434, 164, P, 1, 0, 0, 217, 164), this.mapUv(434, 164, P, 4, 217, 0, 434, 164, !0), this.merge(u, P, 1, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 10.5,
        z: 0
      }]), D.rotateY(-Math.PI / 2), this.merge(u, D, 2, [{
        x: -a.BLOCK.radius / 38 * 40 - .01,
        y: -3.3,
        z: -2.5
      }]), this.hitObj = new s.Mesh(u, m);
      var Q = new s.PlaneGeometry(1.55, 3.1);
      this.door = new s.Mesh(Q, new s.MeshBasicMaterial({
        map: a.loader.load("res/door.png"),
        transparent: !0
      })), this.door.rotation.y = -Math.PI / 2, this.door.position.set(-a.BLOCK.radius / 38 * 40 - .02, -3.3, -3.3), this.body.add(this.door), this.secondDoor = new s.Mesh(Q, new s.MeshBasicMaterial({
        map: a.loader.load("res/second_door.png"),
        transparent: !0
      })), this.secondDoor.rotation.y = -Math.PI / 2, this.secondDoor.position.set(-a.BLOCK.radius / 38 * 40 - .02, -3.3, -1.7), this.body.add(this.secondDoor), this.score = 15;
    } else if (25 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius);
      this.geometry = z;
      E = new s.MeshLambertMaterial({
        map: a.loader.load("res/clock.png")
      });
      this.mapUv(320, 200, z, 1, 0, 0, 5, 5), this.mapUv(320, 200, z, 2, 0, 0, 5, 5), this.mapUv(320, 200, z, 4, 0, 200, 320, 0, !0);
      var $ = C,
        ee = new s.CylinderGeometry(1, 1, 1, 30);
      m = [E, $], u = new s.Geometry();
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), ee.rotateZ(Math.PI / 2), this.merge(u, ee, 1, [{
        x: -a.BLOCK.radius - .5,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m), this.plane = new s.Mesh(new s.PlaneGeometry(3, 3), new s.MeshBasicMaterial({
        map: a.loader.load("res/point.png"),
        transparent: !0
      })), this.plane.position.set(0, 0, a.BLOCK.radius + .04), this.body.add(this.plane), this.timer = setInterval(function () {
        d.plane.visible = !d.plane.visible;
      }, 1e3), this.numbers = [];
      var ie = new s.PlaneGeometry(3, 3);
      for (W = 0; W < 10; ++W) {
        for (var te = new s.MeshBasicMaterial({
            map: a.loader.load("res/" + W + ".png"),
            alphaTest: .5
          }), se = [], ae = 0; ae < 4; ++ae) {
          var oe = new s.Mesh(ie, te);
          oe.position.z = a.BLOCK.radius + .01, oe.visible = !1, se.push(oe), this.body.add(oe);
        }
        this.numbers.push(se);
      }
      var he = new Date(),
        re = ("0" + he.getHours()).slice(-2),
        ne = ("0" + he.getMinutes()).slice(-2);
      this.numbers[re[0]][0].position.x = -3.2 * this.radiusScale, this.numbers[re[0]][0].visible = !0, this.numbers[re[1]][1].position.x = -1.3 * this.radiusScale, this.numbers[re[1]][1].visible = !0, this.numbers[ne[0]][2].position.x = 1.3 * this.radiusScale, this.numbers[ne[0]][2].visible = !0, this.numbers[ne[1]][3].position.x = 3.2 * this.radiusScale, this.numbers[ne[1]][3].visible = !0;
    } else if (26 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius), E = new s.MeshLambertMaterial({
        map: a.loader.load("res/well.png")
      });
      this.mapUv(280, 428, z, 1, 0, 0, 280, 148), this.mapUv(280, 428, z, 2, 0, 148, 280, 428), this.mapUv(280, 428, z, 4, 0, 0, 280, 148, !0), this.hitObj = new s.Mesh(z, E), this.score = 5;
    } else if (27 == t) {
      this.radiusSegments = 50;
      z = new s.CylinderGeometry(2 * a.BLOCK.radius / 38 * 25, 2 * a.BLOCK.radius / 38 * 25, this.height, 50);
      this.geometry = z, this.shadow.scale.set(50 / 38, 50 / 38, 50 / 38);
      E = new s.MeshBasicMaterial({
        map: a.loader.load("res/golf_bottom.png")
      }), D = new s.CircleGeometry(2 * a.BLOCK.radius / 38 * 25 + .01, 30), R = new x({
        map: a.loader.load("res/golf_top.png")
      }), u = new s.Geometry(), m = [E, R];
      z.rotateY(3), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), D.rotateX(-Math.PI / 2), D.rotateY(-.7), this.merge(u, D, 1, [{
        x: 0,
        y: this.height / 2 + .01,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m), this.sphere = new s.Mesh(new s.SphereGeometry(.6, 10, 10), this.whiteMaterial), this.sphere.position.set(-8, -1, -1.5), this.obj.add(this.sphere);
      var le = new s.Mesh(new s.PlaneGeometry(2, 5), new s.MeshBasicMaterial({
        map: a.loader.load("res/flag.png"),
        transparent: !0
      }));
      this.body.add(le), le.position.set(-4.4, 5, -4.3), le.rotation.y = -Math.PI / 4, le.rotation.x = -.928, le.rotation.z = -Math.PI / 5;
    } else if (28 == t) {
      this.radiusSegments = 50;
      z = new s.CylinderGeometry(2 * a.BLOCK.radius / 38 * 15, 2 * a.BLOCK.radius / 38 * 15, this.height, 50);
      this.geometry = z, this.shadow.scale.set(30 / 38, 30 / 38, 30 / 38);
      E = new s.MeshBasicMaterial({
        map: a.loader.load("res/paper_bottom.png")
      }), D = new s.CircleGeometry(2 * a.BLOCK.radius / 38 * 15 + .01, 30), R = new x({
        map: a.loader.load("res/paper_top.png")
      }), u = new s.Geometry(), m = [E, R];
      z.rotateY(4), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), D.rotateX(-Math.PI / 2), D.rotateY(-.7), this.merge(u, D, 1, [{
        x: 0,
        y: this.height / 2 + .01,
        z: 0
      }]), this.shadow.scale.y = 1.1, this.hitObj = new s.Mesh(u, m);
    } else if (29 == t) {
      this.radiusSegments = 50, this.min = .8, this.height = a.BLOCK.height / 21 * 4;
      z = new s.CylinderGeometry(.4 * a.BLOCK.radius, .4 * a.BLOCK.radius, this.height, 50);
      this.geometry = z;
      E = C, D = new s.CircleGeometry(.4 * a.BLOCK.radius, 50), R = new s.MeshBasicMaterial({
        color: 16777215
      }), X = new s.CylinderGeometry(.4 * a.BLOCK.radius, .5 * a.BLOCK.radius, a.BLOCK.height / 21 * 1, 50), P = new s.CylinderGeometry(.5 * a.BLOCK.radius, .5 * a.BLOCK.radius, a.BLOCK.height / 21 * 16, 50), F = new s.MeshBasicMaterial({
        map: a.loader.load("res/medicine.png")
      }), u = new s.Geometry(), m = [E, R, F];
      this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), D.rotateX(-Math.PI / 2), this.merge(u, D, 1, [{
        x: 0,
        y: this.height / 2 + .01,
        z: 0
      }]), this.merge(u, X, 1, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 2.5,
        z: 0
      }]), P.rotateY(2.3), this.merge(u, P, 2, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 11,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m), this.shadow.scale.set(.55, .9, .7);
    } else if (30 == t) {
      z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius);
      this.geometry = z;
      E = new s.MeshLambertMaterial({
        map: a.loader.load("res/luban.png")
      });
      this.mapUv(338, 338, z, 1, 0, 128, 208, 0), this.mapUv(338, 338, z, 2, 0, 128, 210, 338), this.mapUv(338, 338, z, 4, 210, 129, 337, 338);
      var de = new s.MeshLambertMaterial({
          color: 2199e3
        }),
        me = new s.Mesh(new s.BoxGeometry(10, .4, 1.5), de),
        ce = new s.MeshLambertMaterial({
          color: 4531468
        }),
        ue = new s.MeshLambertMaterial({
          color: 8037621
        });
      this.earBlack = new s.Mesh(new s.BoxGeometry(1.2, 3.5, 3.5), ce), this.earBlue = new s.Mesh(new s.BoxGeometry(1, 2.5, 2.5), ue), me.position.set(0, .8, 5.75), this.body.add(me), this.earBlack.position.set(-5.4, 0, 0), this.earBlue.position.set(-6, 0, 0), this.body.add(this.earBlue), this.body.add(this.earBlack), this.hitObj = new s.Mesh(z, E), this.musicName = "luban", this.score = 20;
      D = new s.PlaneGeometry(2, 2);
      this.icons = [];
      var ye = a.loader.load("res/music_icon_two.png");
      for (W = 0; W < 4; ++W) this.icons[W] = new s.Mesh(D, new s.MeshBasicMaterial({
        map: ye,
        transparent: !0
      })), this.icons[W].rotation.y = -Math.PI / 4, this.icons[W].rotation.x = -Math.PI / 5, this.icons[W].rotation.z = -Math.PI / 5, this.body.add(this.icons[W]), this.icons[W].scale.set(.6, .6, .6);
      this.succeedTimer = this.playLubanMusic, this.whenLeave = this.stopLubanMusic;
    } else if (31 == t) {
      this.canChange = !1, this.height = a.BLOCK.height / 21 * 7;
      z = new s.BoxGeometry(2 * a.BLOCK.radius / 38 * 45, this.height, 2 * a.BLOCK.radius / 38 * 45);
      this.geometry = z;
      P = new s.BoxGeometry(2 * a.BLOCK.radius / 38 * 40, a.BLOCK.height / 21 * 14, 2 * a.BLOCK.radius / 38 * 40);
      this.shadow.scale.set(40 / 38, 1.4, 1), this.map = a.loader.load("res/wechat_close.png"), this.topMap = a.loader.load("res/wechat_top.png");
      m = [E = new s.MeshLambertMaterial({
        map: this.topMap
      }), F = new s.MeshBasicMaterial({
        map: this.map,
        transparent: !0
      })], u = new s.Geometry();
      this.mapUv(340, 340, z, 1, 0, 0, 280, 60), this.mapUv(340, 340, z, 2, 0, 60, 280, 340), this.mapUv(340, 340, z, 4, 280, 60, 340, 340), this.merge(u, z, 0, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.mapUv(434, 164, P, 1, 0, 0, 217, 164), this.mapUv(434, 164, P, 4, 217, 0, 434, 164, !0), this.merge(u, P, 1, [{
        x: 0,
        y: -a.BLOCK.height / 21 * 10.5,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
      Q = new s.PlaneGeometry(2.5, 3.34);
      this.door = new s.Mesh(Q, new s.MeshBasicMaterial({
        map: a.loader.load("res/wechat_door.png"),
        transparent: !0
      })), this.door.rotation.y = -Math.PI / 2, this.door.position.set(-a.BLOCK.radius / 38 * 40 - .05, -2.9, 1.2), this.door.visible = !1, this.body.add(this.door), this.secondDoor = new s.Mesh(Q, new s.MeshBasicMaterial({
        map: a.loader.load("res/wechat_second_door.png"),
        transparent: !0
      })), this.secondDoor.visible = !1, this.secondDoor.rotation.y = -Math.PI / 2, this.secondDoor.position.set(-a.BLOCK.radius / 38 * 40 - .05, -2.9, -1.2), this.body.add(this.secondDoor), this.glowMap = a.loader.load("res/wechat_open.png"), this.glowTopMap = a.loader.load("res/wechat_glow_top.png"), this.succeedTimer = function () {
        5 != this.score && (this.hitObj.material[1].map = this.glowMap, this.hitObj.material[0].map = this.glowTopMap, this.logo.visible = !1, this.glowLogo.visible = !0, this.door.visible = !0, this.secondDoor.visible = !0);
      }, this.glowLogo = new s.Object3D(), this.logo = new s.Object3D();
      X = new s.CylinderGeometry(1.8, 1.8, .5, 30);
      var pe = new s.MeshLambertMaterial({
          color: 3457369
        }),
        we = (N = new s.MeshLambertMaterial({
          color: 5879160
        }), new s.Mesh(X, N)),
        ge = new s.Mesh(X, pe);
      (D = new s.CircleGeometry(1.8, 30)).rotateX(Math.PI / 2), D.rotateY(-Math.PI / 2);
      R = new s.MeshBasicMaterial({
        map: a.loader.load("res/wechat_logo.png")
      });
      var Me = new s.MeshBasicMaterial({
          map: a.loader.load("res/wechat_glow_logo.png")
        }),
        Be = new s.Mesh(D, R),
        Oe = new s.Mesh(D, Me);
      this.logo.add(we), Be.position.y = -.251, this.logo.add(Be), this.logo.position.x = -6.5, this.logo.rotation.z = -Math.PI / 2, this.body.add(this.logo), Oe.position.y = -.251, this.glowLogo.add(Oe), this.glowLogo.add(ge), this.glowLogo.position.x = -6.5, this.glowLogo.rotation.z = -Math.PI / 2, this.glowLogo.visible = !1, this.body.add(this.glowLogo), this.musicName = "pay", this.registerAudio = function () {
        5 != d.score && (o.customAnimation.to(d.door.position, 1, {
          z: 2.2
        }), o.customAnimation.to(d.secondDoor.position, 1, {
          z: -1.9
        }));
      }, this.registerEndAudio = function () {
        5 != d.score && (o.customAnimation.to(d.door.position, 1, {
          z: 1.2
        }), o.customAnimation.to(d.secondDoor.position, 1, {
          z: -1.2
        }));
      }, this.beforePopup = function () {
        d.hitObj.material[1].map = d.map, d.hitObj.material[0].map = d.topMap, d.logo.visible = !0, d.glowLogo.visible = !1, d.door.visible = !1, d.secondDoor.visible = !1;
      }, this.score = 20;
    } else if (32 == t) {
      this.canChange = !1;
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), y = 3, K = (a.BLOCK.height - y) / 2, v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius);
      this.geometry = v;
      f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
      X = new s.CylinderGeometry(1.5, 1.5, .4, 30);
      var Le = new s.Mesh(X, new s.MeshLambertMaterial({
        color: 9099465
      }));
      (D = new s.CircleGeometry(1.5, 30)).rotateX(Math.PI / 2), D.rotateY(-Math.PI / 2);
      R = new s.MeshBasicMaterial({
        map: a.loader.load("res/relax_back.png")
      });
      var be = new s.MeshBasicMaterial({
          map: a.loader.load("res/relax_front.png"),
          side: s.DoubleSide
        }),
        Ce = new s.Mesh(D, R),
        xe = new s.Mesh(D, be);
      this.board = new s.Object3D(), Ce.position.y = -.21, xe.position.y = .21, this.board.add(Ce), this.board.add(xe), this.board.add(Le), this.board.rotation.z = -Math.PI / 2, this.board.position.set(6.7, 3.5, 6.7), this.obj.add(this.board);
      var Ke = new s.Mesh(X, this.greenMaterial),
        ve = new s.Mesh(X, this.greenMaterial);
      ve.scale.set(1, 1, 1), ve.position.set(6.7, -2, 6.7), this.obj.add(ve), Ke.scale.set(.7, .7, .7), Ke.position.set(6.7, -1.5, 6.7), this.obj.add(Ke);
      var fe = Ke.clone();
      fe.scale.set(.1, 11, .1), fe.position.set(6.7, 0, 6.7), this.obj.add(fe), this.perFrame = function () {
        d.board.rotation.y += .01;
      }, this.score = -20, this.musicName = "relax";
    } else if (33 == t) {
      this.canChange = !1;
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), y = 3, K = (a.BLOCK.height - y) / 2, v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius);
      this.geometry = v;
      f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (34 == t) {
      this.canChange = !1;
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), y = 3, K = (a.BLOCK.height - y) / 2, v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius);
      this.geometry = v;
      f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (35 == t) {
      this.canChange = !1;
      m = [this.greenMaterial, this.whiteMaterial], u = new s.Geometry(), y = 3, K = (a.BLOCK.height - y) / 2, v = new s.BoxGeometry(2 * a.BLOCK.radius, K, 2 * a.BLOCK.radius);
      this.geometry = v;
      f = new s.BoxGeometry(2 * a.BLOCK.radius, y, 2 * a.BLOCK.radius);
      this.merge(u, v, 0, [{
        x: 0,
        y: -y / 2 - K / 2,
        z: 0
      }, {
        x: 0,
        y: y / 2 + K / 2,
        z: 0
      }]), this.merge(u, f, 1, [{
        x: 0,
        y: 0,
        z: 0
      }]), this.hitObj = new s.Mesh(u, m);
    } else if (-1 == t) {
      var Ge = [15622240, 14980702, 15712087, 9089870, 7451844, 6519997, 10772948];
      z = O, E = new s.MeshLambertMaterial({
        color: Ge[h],
        transparent: !0
      });
      this.hitObj = new s.Mesh(z, E);
      var ze = new s.BoxGeometry(2 * a.BLOCK.radius, a.BLOCK.height, 2 * a.BLOCK.radius);
      this.mapUv(100, 88, ze, 2, 0, 0, 5, 5);
      var je = new s.Mesh(ze, M);
      0 == h && (je.receiveShadow = !0), this.body.add(je);
      var Pe, Ie, Ue, _e;
      D = new s.PlaneGeometry(4, 8);
      Ue = (Pe = h % 4 * 64) + 64, _e = (Ie = 128 * parseInt(h / 4)) + 128, this.mapUv(256, 256, D, 0, Pe, _e, Ue, Ie), (Ce = new s.Mesh(D, B)).rotation.x = -Math.PI / 2, Ce.rotation.z = -Math.PI / 2, Ce.position.y = a.BLOCK.height / 2 + .05, this.body.add(Ce), this.obj.scale.set(.7, 1, .7);
    } else {
      var ke = arguments[1];
      if (1 == ke.block_type) {
        z = new s.BoxGeometry(2 * a.BLOCK.radius, this.height, 2 * a.BLOCK.radius), E = new s.MeshLambertMaterial({
          map: a.loader.load("".concat(wx.env.USER_DATA_PATH, "/").concat(ke.block_res_list[0].path))
        });
        this.mapUv(428, 428, z, 1, 0, 0, 280, 148), this.mapUv(428, 428, z, 2, 0, 148, 280, 428), this.mapUv(428, 428, z, 4, 280, 148, 428, 428), this.hitObj = new s.Mesh(z, E), this.shadow.position.set(0, -a.BLOCK.height / 2 - .001, -4.5);
      } else if (2 == ke.block_type) {
        this.radiusSegments = 50;
        z = new s.CylinderGeometry(a.BLOCK.radius, a.BLOCK.radius, this.height, 50);
        this.geometry = z;
        E = new s.MeshBasicMaterial({
          map: a.loader.load("".concat(wx.env.USER_DATA_PATH, "/").concat(ke.block_res_list[0].path))
        }), D = new s.CircleGeometry(a.BLOCK.radius + .01, 30), R = new x({
          map: a.loader.load("".concat(wx.env.USER_DATA_PATH, "/").concat(ke.block_res_list[1].path))
        }), u = new s.Geometry(), m = [E, R];
        z.rotateY(3), this.merge(u, z, 0, [{
          x: 0,
          y: 0,
          z: 0
        }]), D.rotateX(-Math.PI / 2), D.rotateY(-.7), this.merge(u, D, 1, [{
          x: 0,
          y: this.height / 2 + .01,
          z: 0
        }]), this.hitObj = new s.Mesh(u, m), this.shadow = new s.Mesh(b, p), this.shadow.position.set(-.1, -a.BLOCK.height / 2 - .001, -2.8), this.shadow.scale.y = 1.4, this.shadow.scale.x = 1, this.shadow.rotation.x = -Math.PI / 2;
      }
      ke.ad && (this.isAd = !0, this.trademark_url = "block_".concat(ke.id, "/trade"), this.ad_url = ke.ad.activity_url), this.score = ke.score;
    }
    this.shadow.initZ = this.shadow.position.z, this.hitObj.receiveShadow = !0, this.hitObj.name = "hitObj", this.body.add(this.hitObj), this.hitObj.matrixAutoUpdate = !1, this.shadow.initScale = this.shadow.scale.y, this.body.position.y = a.BLOCK.height / 2 - this.height / 2, this.obj.add(this.shadow), this.obj.add(this.body);
  }, [{
    key: "merge",
    value: function (e, i, t, a) {
      for (var o = 0, h = i.faces.length; o < h; ++o) i.faces[o].materialIndex = 0;
      var r = new s.Mesh(i);
      for (o = 0, h = a.length; o < h; ++o) r.position.set(a[o].x, a[o].y, a[o].z), r.updateMatrix(), e.merge(r.geometry, r.matrix, t);
    }
  }, {
    key: "_mapUv",
    value: function (e, i, t, a, o, h, r, n, l) {
      var d = 1 / e,
        m = 1 / i;
      if (t.faces[a] instanceof s.Face3) {
        var c = t.faceVertexUvs[0][2 * a];
        4 == a && !l || 2 == a && l ? (c[0].x = o * d, c[0].y = h * m, c[2].x = o * d, c[2].y = n * m, c[1].x = r * d, c[1].y = h * m) : (c[0].x = o * d, c[0].y = h * m, c[1].x = o * d, c[1].y = n * m, c[2].x = r * d, c[2].y = h * m);
        c = t.faceVertexUvs[0][2 * a + 1];
        4 == a && !l || 2 == a && l ? (c[2].x = o * d, c[2].y = n * m, c[1].x = r * d, c[1].y = n * m, c[0].x = r * d, c[0].y = h * m) : (c[0].x = o * d, c[0].y = n * m, c[1].x = r * d, c[1].y = n * m, c[2].x = r * d, c[2].y = h * m);
      }
    }
  }, {
    key: "mapUv",
    value: function (e, i, t, s, a, o, h, r, n) {
      if (s.length) for (var l = 0; l < s.length; ++l) this._mapUv(e, i, t, s[l], a, o, h, r, n);else this._mapUv(e, i, t, s, a, o, h, r, n);
    }
  }, {
    key: "showLight",
    value: function (e) {
      var i = this;
      this.light.visible = !0, this.light.material.opacity = 0, this.light.position.set(e.x - this.obj.position.x, 5.6, e.z - this.obj.position.z), this.light.scale.set(1 / this.radiusScale, 1, 1 / this.radiusScale), o.customAnimation.to(this.light.material, 1, {
        opacity: 1
      }), setTimeout(function () {
        i.hideLight();
      }, 1500);
    }
  }, {
    key: "hideLight",
    value: function () {
      var e = this;
      o.customAnimation.to(this.light.material, .5, {
        opacity: 0,
        onComplete: function () {
          e.light.visible = !1;
        }
      });
    }
  }, {
    key: "hideLightImediate",
    value: function () {
      this.light.visible = !1;
    }
  }, {
    key: "getBox",
    value: function () {
      return this.boundingBox || (this.boundingBox = new s.Box3().setFromObject(this.body)), this.boundingBox;
    }
  }, {
    key: "glow",
    value: function () {
      this.hitObj.material.map = this.glowMap;
    }
  }, {
    key: "wechatGlow",
    value: function () {}
  }, {
    key: "openDoor",
    value: function () {
      o.customAnimation.to(this.door.position, 1, {
        z: -4.5
      }), o.customAnimation.to(this.secondDoor.position, 1, {
        z: -.5
      });
    }
  }, {
    key: "closeDoor",
    value: function () {
      o.customAnimation.to(this.door.position, 1, {
        z: -3.3
      }), o.customAnimation.to(this.secondDoor.position, 1, {
        z: -1.7
      });
    }
  }, {
    key: "rotateBox",
    value: function () {
      o.customAnimation.to(this.middle.rotation, .5, {
        y: -Math.PI / 2
      });
    }
  }, {
    key: "playLubanMusic",
    value: function () {
      var e = this,
        i = function () {
          e.icons[0].position.set(1, 7, -1), e.icons[1].position.set(-1, 7, -1), e.icons[2].position.set(1, 7, 1), e.icons[3].position.set(-1, 7, 1);
          for (var i = 0, t = e.icons.length; i < t; ++i) e.icons[i].material.opacity = 0, o.customAnimation.to(e.icons[i].position, .7, {
            y: 12,
            ease: "Cubic.easeIn",
            delay: .1 * i
          }), o.customAnimation.to(e.icons[i].position, .7, {
            x: 0 == i || 2 == i ? 3 : -3,
            delay: .1 * i
          }), o.customAnimation.to(e.icons[i].material, .7, {
            opacity: 1,
            delay: .1 * i
          }), o.customAnimation.to(e.icons[i].position, .7, {
            y: 17,
            ease: "Cubic.easeOut",
            delay: .1 * i + .7
          }), o.customAnimation.to(e.icons[i].position, .7, {
            x: 0 == i || 2 == i ? 1 : -1,
            delay: .1 * i + .7
          }), o.customAnimation.to(e.icons[i].material, .7, {
            opacity: 0,
            delay: .1 * i + .7
          });
        };
      setTimeout(function () {
        i();
      }, 1e3), this.lubanMusicTimer = setInterval(function () {
        i();
      }, 3e3);
      var t = function () {
        for (var i = 0; i < 15; ++i) o.customAnimation.to(e.earBlack.scale, .2, {
          y: 1.3,
          z: 1.3,
          delay: .4 * i
        }), o.customAnimation.to(e.earBlue.scale, .2, {
          y: 1.3,
          z: 1.3,
          delay: .4 * i
        }), o.customAnimation.to(e.earBlack.scale, .2, {
          y: 1,
          z: 1,
          delay: .4 * i + .2
        }), o.customAnimation.to(e.earBlue.scale, .2, {
          y: 1,
          z: 1,
          delay: .4 * i + .2
        });
      };
      t(), this.earTimer = setInterval(function () {
        t();
      }, 9e3);
    }
  }, {
    key: "raceAnim",
    value: function (e, i) {
      for (var t = this, s = [{
          x: .8,
          y: 3,
          z: 0
        }, {
          x: 3,
          y: 1.5,
          z: 3
        }, {
          x: -3,
          y: 2.5,
          z: -2.5
        }, {
          x: 3,
          y: 0,
          z: 3
        }], a = 0; a < 4; ++a) this.icons[a].material.opacity = 0, this.icons[a].position.x = i.x - this.obj.position.x + .2, this.icons[a].position.y = 9, this.icons[a].position.z = i.z - this.obj.position.z - .2, setTimeout(function (e) {
        o.customAnimation.to(this.icons[e].material, .9, {
          opacity: 1
        }), o.customAnimation.to(this.icons[e].material, .6, {
          opacity: 0,
          delay: 1
        }), o.customAnimation.to(this.icons[e].position, 1.6, {
          x: this.icons[e].position.x + s[e].x,
          y: this.icons[e].position.y + s[e].y,
          z: this.icons[e].position.z + s[e].z
        });
      }.bind(this, a), 300 * a);
      this.raceAnimTimer = setTimeout(function () {
        t.raceAnim(e, i);
      }, 4e3);
    }
  }, {
    key: "stopRaceAnim",
    value: function () {
      this.raceAnimTimer && (clearTimeout(this.raceAnimTimer), this.raceAnimTimer = null);
    }
  }, {
    key: "stopLubanMusic",
    value: function () {
      this.earTimer && (clearTimeout(this.earTimer), this.earTimer = null), this.lubanMusicTimer && (clearTimeout(this.lubanMusicTimer), this.lubanMusicTimer = null);
    }
  }, {
    key: "playMusic",
    value: function () {
      for (var e = this, i = 0; i < 2; ++i) setTimeout(function (e) {
        return function () {
          e.visible = !0, e.position.set(0, 0, 0), e.material.opacity = 1, o.customAnimation.to(e.position, 2, {
            x: 5 * (1 - 2 * Math.random()),
            y: 15,
            z: 5 * (1 - 2 * Math.random())
          }), o.customAnimation.to(e.material, 2, {
            opacity: 0
          });
        };
      }(this.icons[i]), 1e3 * i);
      this.musicTimer = setTimeout(function () {
        e.playMusic();
      }, 2500);
    }
  }, {
    key: "stopMusic",
    value: function () {
      this.musicTimer && (clearTimeout(this.musicTimer), this.musicTimer = null);
    }
  }, {
    key: "change",
    value: function (e, i, t) {
      if (this.canChange) {
        if (this.order >= 9) {
          var s = this.order >= 13 ? .7 : .6;
          return this.radiusScale = t || Math.max((0, h.random)() * (a.BLOCK.maxRadiusScale - a.BLOCK.minRadiusScale) + a.BLOCK.minRadiusScale, this.min || s), this.radiusScale = +this.radiusScale.toFixed(2), this.radius = e || this.radiusScale * a.BLOCK.radius, this.radius = +this.radius.toFixed(2), void this.obj.scale.set(this.radiusScale, 1, this.radiusScale);
        }
        this.radiusScale = t || (0, h.random)() * (a.BLOCK.maxRadiusScale - a.BLOCK.minRadiusScale) + a.BLOCK.minRadiusScale, this.radiusScale = +this.radiusScale.toFixed(2), this.radius = e || this.radiusScale * a.BLOCK.radius, this.radius = +this.radius.toFixed(2), this.obj.scale.set(this.radiusScale, 1, this.radiusScale), this.changeColor(i);
      }
    }
  }, {
    key: "changeColor",
    value: function (e) {
      var i = e || this.types[Math.floor(3 * Math.random())];
      this.type != i && (this.type = i, "green" == i ? (this.greenMaterial.color.setHex(r), this.whiteMaterial.color.setHex(n), this.middleLightGreenMaterial && this.middleLightGreenMaterial.color.setHex(c)) : "gray" == i ? (this.greenMaterial.color.setHex(n), this.whiteMaterial.color.setHex(l), this.middleLightGreenMaterial && this.middleLightGreenMaterial.color.setHex(u)) : "black" == i && (this.greenMaterial.color.setHex(d), this.whiteMaterial.color.setHex(m), this.middleLightGreenMaterial && this.middleLightGreenMaterial.color.setHex(y)));
    }
  }, {
    key: "getVertices",
    value: function () {
      var e = this,
        i = [],
        t = this.geometry || this.hitObj.geometry;
      if (this.obj.updateMatrixWorld(), 4 === this.radiusSegments) [0, 1, 4, 5].forEach(function (s) {
        var a = t.vertices[s].clone().applyMatrix4(e.hitObj.matrixWorld);
        i.push([a.x, a.z]);
      });else for (var s = 0; s < this.radiusSegments; ++s) {
        var a = t.vertices[s].clone().applyMatrix4(this.hitObj.matrixWorld);
        i.push([a.x, a.z]);
      }
      return i;
    }
  }, {
    key: "relayLimitTime",
    value: function (e) {
      this.limitTime = e;
    }
  }, {
    key: "shrink",
    value: function () {
      this.status = "shrink", this.prepareTime = 0;
    }
  }, {
    key: "_shrink",
    value: function (e) {
      if (!(void 0 !== this.limitTime && this.prepareTime > this.limitTime)) if (this.scale -= a.BLOCK.reduction, this.scale = Math.max(a.BLOCK.minScale, this.scale), this.scale <= a.BLOCK.minScale) this.status = "stop";else {
        this.body.scale.y = this.scale, this.shadow.scale.y -= a.BLOCK.reduction / 2, this.shadow.position.z += a.BLOCK.reduction / 4 * this.shadowWidth;
        var i = a.BLOCK.reduction / 2 * a.BLOCK.height * (a.BLOCK.height - this.height / 2) / a.BLOCK.height * 2;
        this.body.position.y -= i, this.prepareTime += e;
      }
    }
  }, {
    key: "showup",
    value: function (e) {
      var i = this.shadow.position.z;
      this.body.position.set(0, 20, 0), this.shadow.position.z = -15, this.obj.visible = !0, 3 == e || 4 == e || 6 == e ? this.obj.position.set(7.5 * (6 == e ? 5 : 3), 0, 3.8 * (3 == e || 6 == e ? -1 : 1)) : 5 == e ? this.obj.position.set(30, 0, 0) : this.obj.position.set(7.5 * e, 0, 0), (0, o.TweenAnimation)(this.body.position.y, a.BLOCK.height / 2 - this.height / 2, 500, "Bounce.easeOut", function (e, i) {
        this.body.position.y = e;
      }.bind(this)), (0, o.TweenAnimation)(this.shadow.position.z, i, 500, "Bounce.easeOut", function (e, i) {
        this.shadow.position.z = e;
      }.bind(this));
    }
  }, {
    key: "hideGlow",
    value: function () {
      this.hitObj.material.map = this.map;
    }
  }, {
    key: "popup",
    value: function () {
      var e = this;
      if (this.beforePopup && this.beforePopup(), 25 == this.order) {
        for (var i = 0; i < 10; ++i) for (var t = 0; t < 4; ++t) this.numbers[i][t].visible = !1;
        var s = new Date(),
          h = ("0" + s.getHours()).slice(-2),
          r = ("0" + s.getMinutes()).slice(-2);
        this.numbers[h[0]][0].position.x = -3.1 * this.radiusScale, this.numbers[h[0]][0].visible = !0, this.numbers[h[1]][1].position.x = -1.2 * this.radiusScale, this.numbers[h[1]][1].visible = !0, this.numbers[r[0]][2].position.x = 1.2 * this.radiusScale, this.numbers[r[0]][2].visible = !0, this.numbers[r[1]][3].position.x = 3.1 * this.radiusScale, this.numbers[r[1]][3].visible = !0;
      } else 17 == this.order && (this.middle.rotation.y = 0);
      var n = this.shadow.position.z;
      this.body.position.y = 20, this.shadow.position.z = -15, this.obj.visible = !0, this.boundingBox = null, o.customAnimation.to(this.body.position, .5, {
        y: a.BLOCK.height / 2 - this.height / 2,
        ease: "Bounce.easeOut",
        onEnded: function () {
          e.body.position.y = a.BLOCK.height / 2 - e.height / 2;
        }
      }), o.customAnimation.to(this.shadow.position, .5, {
        z: n,
        ease: "Bounce.easeOut",
        onEnded: function () {
          e.shadow.position.z = n;
        }
      });
    }
  }, {
    key: "reset",
    value: function () {
      this.status = "stop", this.scale = 1, this.obj.scale.y = 1, this.body.scale.y = 1, this.obj.position.y = 0, this.body.position.y = a.BLOCK.height / 2 - this.height / 2, this.shadow.scale.y = this.shadow.initScale, this.shadow.position.z = this.shadow.initZ, this.boundingBox = null, this.limitTime = void 0;
    }
  }, {
    key: "rebound",
    value: function () {
      this.limitTime = void 0, this.status = "stop", this.scale = 1, o.customAnimation.to(this.body.scale, .5, {
        ease: "Elastic.easeOut",
        y: 1
      }), o.customAnimation.to(this.body.position, .5, {
        ease: "Elastic.easeOut",
        y: a.BLOCK.height / 2 - this.height / 2
      }), o.customAnimation.to(this.shadow.scale, .5, {
        ease: "Elastic.easeOut",
        y: this.shadow.initScale
      }), o.customAnimation.to(this.shadow.position, .5, {
        ease: "Elastic.easeOut",
        z: this.shadow.initZ
      });
    }
  }, {
    key: "update",
    value: function (e) {
      this.perFrame && this.perFrame(), "stop" !== this.status && ("shrink" === this.status ? this._shrink(e) : this.status);
    }
  }]);
}();
