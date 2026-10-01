// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var t = require("../@babel/runtime/helpers/interopRequireDefault").default,
  i = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../@babel/runtime/helpers/createClass"),
  o = require("../@babel/runtime/helpers/classCallCheck"),
  s = i(require("./lib/three")),
  a = require("./lib/animation"),
  n = require("./config"),
  h = t(require("./lib/mue/eventcenter")),
  r = t(require("./text")),
  l = e(function t() {
    o(this, t);
    var i = new s.CylinderGeometry(.8, .8, .5, 15, 1, !0),
      e = new s.CylinderGeometry(.65, .65, .5, 15, 1, !0),
      a = new s.RingGeometry(.65, .8, 10);
    this.obj = new s.Object3D();
    var n = new s.MeshLambertMaterial({
        color: 14110276,
        side: s.DoubleSide
      }),
      h = new s.Mesh(i, n),
      r = new s.Mesh(e, n),
      l = new s.Mesh(a, n);
    this.obj.add(h), this.obj.add(r), l.rotation.x = -Math.PI / 2, l.position.y = .25, this.obj.add(l);
    var c = new s.BoxGeometry(1, .25, .5);
    c.vertices[1].y -= .2, c.vertices[0].y -= .2;
    var d = new s.Mesh(c, new s.MeshLambertMaterial({
      color: 13059648
    }));
    d.position.set(-1, -.2, 0), d.rotation.z = .5, this.obj.scale.set(.9, .9, .9), this.obj.add(d);
  }),
  c = e(function t() {
    o(this, t);
    var i = new s.CylinderGeometry(.73, .68, 1, 20),
      e = new s.CylinderGeometry(1.5, 1.5, .2, 20),
      a = new s.CylinderGeometry(.68, .65, .3, 15);
    this.obj = new s.Object3D();
    var n = new s.MeshLambertMaterial({
        color: 4605510
      }),
      h = new s.Mesh(e, n),
      r = new s.Mesh(a, new s.MeshLambertMaterial({
        color: 14110276
      })),
      l = new s.Mesh(i, n);
    r.position.y = .25, l.position.y = .9, this.obj.add(h), this.obj.add(r), this.obj.add(l);
  });
exports.default = function () {
  return e(function t() {
    var i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      e = i.getSelectedBottleSkinResourceSync,
      a = void 0 === e ? function () {} : e;
    o(this, t), this.getSelectedBottleSkinResourceSync = a, this.obj = new s.Object3D(), this.obj.name = "bottle", this.trail = null, this.bottle = new s.Object3D(), this.maps = {}, this.scarf = new l(), this.scarf.obj.position.y = -1.5, this.scarf.obj.visible = !1, this.hat = new c(), this.hat.obj.position.y = 1, this.hat.obj.scale.set(.8, .8, .8), this.hat.obj.visible = !1, this.checkSkin();
    var h = 2.1 * .45;
    this.human = new s.Object3D(), this.head = new s.Mesh(new s.SphereGeometry(h, 17, 17), this.headMaterial), this.head.castShadow = !0, this.bottom = new s.Mesh(new s.CylinderGeometry(.88 * h, 1.27 * h, 2.68 * h, 20), this.bottomMaterial), this.bottom.rotation.y = 4.7, this.bottom.castShadow = !0;
    var d = new s.CylinderGeometry(h, .88 * h, 1.2 * h, 15),
      m = [this.middleMaterial, this.middleTopMaterial],
      u = new s.Geometry();
    d.rotateY(4.7), this.merge(u, d, 0, [{
      x: 0,
      y: this.bottom.position.y + 1.94 * h,
      z: 0
    }]);
    var p = new s.SphereGeometry(h, 17, 17);
    p.scale(1, .54, 1), this.merge(u, p, 1, [{
      x: 0,
      y: this.bottom.position.y + 2.54 * h,
      z: 0
    }]), this.middle = new s.Mesh(u, m), this.middle.castShadow = !0, this.body = new s.Object3D(), this.body.add(this.bottom), this.body.add(this.middle), this.human.add(this.body), this.head.position.y = 4.725, this.human.add(this.head), this.bottle.add(this.human), this.bottle.position.y = n.BOTTLE.bodyHeight / 2 - .25, this.obj.add(this.bottle), this.head.add(this.scarf.obj), this.head.add(this.hat.obj), this.status = "stop", this.scale = 1, this.double = 1, this.velocity = {}, this.flyingTime = 0, this.direction = "straight", this.jumpStatus = "init", this.particles = [];
    for (var b = new s.MeshBasicMaterial({
        map: n.loader.load("res/white.png"),
        alphaTest: .5
      }), y = new s.MeshBasicMaterial({
        map: n.loader.load("res/green.png"),
        alphaTest: .5
      }), v = new s.PlaneGeometry(1, 1), f = 0; f < 15; ++f) {
      (M = new s.Mesh(v, b)).rotation.y = -Math.PI / 4, M.rotation.x = -Math.PI / 5, M.rotation.z = -Math.PI / 5, this.particles.push(M), this.obj.add(M);
    }
    for (f = 0; f < 5; ++f) {
      var M;
      (M = new s.Mesh(v, y)).rotation.y = -Math.PI / 4, M.rotation.x = -Math.PI / 5, M.rotation.z = -Math.PI / 5, this.particles.push(M), this.obj.add(M);
    }
    this.scoreText = new r.default("0", {
      fillStyle: 2434341,
      textAlign: "center",
      plusScore: !0
    }), this.scoreText.obj.visible = !1, this.scoreText.obj.rotation.y = -Math.PI / 4, this.scoreText.obj.scale.set(.5, .5, .5), this.obj.add(this.scoreText.obj);
  }, [{
    key: "merge",
    value: function (t, i, e, o) {
      for (var a = 0, n = i.faces.length; a < n; ++a) i.faces[a].materialIndex = 0;
      var h = new s.Mesh(i);
      for (a = 0, n = o.length; a < n; ++a) h.position.set(o[a].x, o[a].y, o[a].z), h.updateMatrix(), t.merge(h.geometry, h.matrix, e);
    }
  }, {
    key: "showAddScore",
    value: function (t, i, e, o) {
      o || (i ? 1 === this.double ? this.double = 2 : this.double += 2 : this.double = 1, e && this.double <= 2 && (this.double *= 2), this.double = Math.min(32, this.double), t *= this.double), this.scoreText.setScore(t.toString()), this.scoreText.obj.visible = !0, this.scoreText.obj.position.y = 3, this.scoreText.material.opacity = 1, (0, a.TweenAnimation)(this.scoreText.obj.position.y, n.BOTTLE.bodyHeight + 6, 700, function (t) {
        void 0 !== t && (this.scoreText.obj.position.y = t);
      }.bind(this)), (0, a.TweenAnimation)(this.scoreText.material.opacity, 0, 700, function (t, i, e) {
        void 0 !== t && (this.scoreText.material.opacity = t, e && (this.scoreText.obj.visible = !1));
      }.bind(this));
    }
  }, {
    key: "changeScorePos",
    value: function (t) {
      this.scoreText.obj.position.z = t;
    }
  }, {
    key: "resetParticles",
    value: function () {
      this.gatherTimer && clearTimeout(this.gatherTimer), this.gatherTimer = null;
      for (var t = 0, i = this.particles.length; t < i; ++t) this.particles[t].gathering = !1, this.particles[t].visible = !1, this.particles[t].scattering = !1;
    }
  }, {
    key: "scatterParticles",
    value: function () {
      for (var t = 0; t < 10; ++t) this.particles[t].scattering = !0, this.particles[t].gathering = !1, this._scatterParticles(this.particles[t]);
    }
  }, {
    key: "_scatterParticles",
    value: function (t) {
      var i = n.BOTTLE.bodyWidth / 2,
        e = (i + Math.random() * (2 - i)) * (1 - 2 * Math.random()),
        o = (i + Math.random() * (2 - i)) * (1 - 2 * Math.random());
      t.scale.set(1, 1, 1), t.visible = !1, t.position.x = e, t.position.y = -.5, t.position.z = o, setTimeout(function (t) {
        return function () {
          if (t.scattering) {
            t.visible = !0;
            var i = .3 + .2 * Math.random();
            a.customAnimation.to(t.scale, i, {
              x: .2,
              y: .2,
              z: .2
            }), a.customAnimation.to(t.position, i, {
              x: 2 * e,
              y: 2.5 * Math.random() + 2,
              z: 2 * o,
              onComplete: function () {
                t.scattering = !1, t.visible = !1;
              }
            });
          }
        };
      }(t), 0);
    }
  }, {
    key: "gatherParticles",
    value: function () {
      for (var t = this, i = 10; i < 20; ++i) this.particles[i].gathering = !0, this.particles[i].scattering = !1, this._gatherParticles(this.particles[i]);
      this.gatherTimer = setTimeout(function () {
        for (var i = 0; i < 10; ++i) t.particles[i].gathering = !0, t.particles[i].scattering = !1, t._gatherParticles(t.particles[i]);
      }, 500 + 1e3 * Math.random());
    }
  }, {
    key: "_gatherParticles",
    value: function (t) {
      var i = this;
      t.scale.set(1, 1, 1), t.visible = !1;
      var e = Math.random() > .5 ? 1 : -1,
        o = Math.random() > .5 ? 1 : -1;
      t.position.x = (1 + 7 * Math.random()) * e, t.position.y = 1 + 7 * Math.random(), t.position.z = (1 + 7 * Math.random()) * o, setTimeout(function (t) {
        return function () {
          if (t.gathering) {
            t.visible = !0;
            var s = .5 + .4 * Math.random();
            (0, a.TweenAnimation)(t.scale.x, .8 + Math.random(), 1e3 * s, function (i) {
              void 0 !== i && (t.scale.x = i);
            }), (0, a.TweenAnimation)(t.scale.y, .8 + Math.random(), 1e3 * s, function (i) {
              void 0 !== i && (t.scale.y = i);
            }), (0, a.TweenAnimation)(t.scale.z, .8 + Math.random(), 1e3 * s, function (i) {
              void 0 !== i && (t.scale.z = i);
            }), (0, a.TweenAnimation)(t.position.x, Math.random() * e, 1e3 * s, function (i) {
              void 0 !== i && (t.position.x = i);
            }), (0, a.TweenAnimation)(t.position.y, 2.5 * Math.random(), 1e3 * s, function (i) {
              void 0 !== i && (t.position.y = i);
            }), (0, a.TweenAnimation)(t.position.z, Math.random() * o, 1e3 * s, function (e, o) {
              void 0 !== e && (t.position.z = e, o && t.gathering && i._gatherParticles(t));
            });
          }
        };
      }(t), 500 * Math.random());
    }
  }, {
    key: "update",
    value: function (t) {
      "stop" != this.status && ("prepare" == this.status ? this._prepare(t) : "jump" == this.status ? this._jump(t) : "turn" == this.status && this.turn());
    }
  }, {
    key: "lookAt",
    value: function (t, i) {
      t !== this.direction && ("straight" === t ? (this.turnAngle = -Math.PI / 2, this.angle = 0) : (this.turnAngle = Math.PI / 2, this.angle = Math.PI / 2), this.direction = t);
    }
  }, {
    key: "turn",
    value: function () {
      var t = this.turnAngle > 0 ? .2 : -.2;
      this.bottle.rotation.y += t, this.turnAngle -= t, this.turnAngle >= -.2 && this.turnAngle <= .2 && (this.bottle.rotation.y = this.angle, this.status = "stop");
    }
  }, {
    key: "fall",
    value: function () {
      var t = this;
      this.stop(), setTimeout(function () {
        t.status = "fall", (0, a.TweenAnimation)(t.obj.position.y, -n.BLOCK.height / 2 - .3, 400, function (t) {
          void 0 !== t && (this.obj.position.y = t);
        }.bind(t));
      }, 0);
    }
  }, {
    key: "forerake",
    value: function () {
      var t = this;
      this.stop(), this.status = "forerake", setTimeout(function () {
        "straight" === t.direction ? (0, a.TweenAnimation)(t.obj.rotation.z, -Math.PI / 2, 1e3, function (t) {
          void 0 !== t && (this.obj.rotation.z = t);
        }.bind(t)) : (0, a.TweenAnimation)(t.obj.rotation.x, -Math.PI / 2, 1e3, function (t) {
          void 0 !== t && (this.obj.rotation.x = t);
        }.bind(t)), setTimeout(function () {
          "suspend" != t.status ? ((0, a.TweenAnimation)(t.obj.position.y, -n.BLOCK.height / 2 + 1.2, 400, function (t, i) {
            void 0 !== t && (this.obj.position.y = t);
          }.bind(t)), a.customAnimation.to(t.head.position, .2, {
            x: -1.125
          }), a.customAnimation.to(t.head.position, .2, {
            x: 0,
            delay: .2
          })) : t.status = "stop";
        }, 200);
      }, 200);
    }
  }, {
    key: "hypsokinesis",
    value: function () {
      var t = this;
      this.stop(), this.status = "hypsokinesis", setTimeout(function () {
        "straight" === t.direction ? (0, a.TweenAnimation)(t.obj.rotation.z, Math.PI / 2, 800, function (t) {
          void 0 !== t && (this.obj.rotation.z = t);
        }.bind(t)) : (0, a.TweenAnimation)(t.obj.rotation.x, Math.PI / 2, 800, function (t) {
          void 0 !== t && (this.obj.rotation.x = t);
        }.bind(t)), setTimeout(function () {
          "suspend" != t.status ? ((0, a.TweenAnimation)(t.obj.position.y, -n.BLOCK.height / 2 + 1.2, 400, function (t, i) {
            void 0 !== t && (this.obj.position.y = t);
          }.bind(t)), a.customAnimation.to(t.head.position, .2, {
            x: 1.125
          }), a.customAnimation.to(t.head.position, .2, {
            x: 0,
            delay: .2
          })) : t.status = "stop";
        }, 350);
      }, 200);
    }
  }, {
    key: "_jump",
    value: function (t) {
      var i = new s.Vector3(0, 0, 0);
      i.z = this.velocity.vz * t, i.y = this.velocity.vy * t - n.GAME.gravity / 2 * t * t - n.GAME.gravity * this.flyingTime * t, this.flyingTime += t, this.obj.translateY(i.y), this.obj.translateOnAxis(this.axis, i.z);
    }
  }, {
    key: "squeeze",
    value: function () {
      this.obj.position.y = n.BLOCK.height / 2, this.head.position.x = 0, a.customAnimation.to(this.body.scale, .15, {
        y: .9,
        x: 1.07,
        z: 1.07
      }), a.customAnimation.to(this.body.scale, .15, {
        y: 1,
        x: 1,
        z: 1,
        delay: .15
      }), a.customAnimation.to(this.head.position, .15, {
        y: 4.725,
        delay: .15
      });
    }
  }, {
    key: "stop",
    value: function () {
      this.status = "stop", this.flyingTime = 0, this.scale = 1, this.velocity = {}, this.jumpStatus = "init";
    }
  }, {
    key: "suspend",
    value: function () {
      this.status = "suspend", a.TweenAnimation.killAll();
    }
  }, {
    key: "rotate",
    value: function () {
      var t;
      (a.TweenAnimation.killAll(), "straight" === this.direction) ? ((0, a.TweenAnimation)(this.obj.rotation.z, 0, 300, function (t) {
        void 0 !== t && (this.obj.rotation.z = t);
      }.bind(this)), t = this.status.indexOf("forerake") >= 0 ? 2 : -2, (0, a.TweenAnimation)(this.obj.position.x, this.obj.position.x + t, 300, function (t) {
        void 0 !== t && (this.obj.position.x = t);
      }.bind(this))) : ((0, a.TweenAnimation)(this.obj.rotation.x, 0, 300, function (t) {
        void 0 !== t && (this.obj.rotation.x = t);
      }.bind(this)), t = this.status.indexOf("forerake") >= 0 ? -2 : 2, (0, a.TweenAnimation)(this.obj.position.z, this.obj.position.z + t, 300, function (t) {
        void 0 !== t && (this.obj.position.z = t);
      }.bind(this)));
      (0, a.TweenAnimation)(this.head.position.x, 0, 100, function (t) {
        void 0 !== t && (this.head.position.x = t);
      }.bind(this)), (0, a.TweenAnimation)(this.obj.position.y, -n.BLOCK.height / 2, 300, function (t, i) {
        void 0 !== t && (this.obj.position.y = t, i && (this.status = "stop"));
      }.bind(this)), this.status = "rotate";
    }
  }, {
    key: "_prepare",
    value: function (t) {
      if (!(void 0 !== this.limitTime && this.prepareTime > this.limitTime || (this.scale -= n.BOTTLE.reduction, this.scale = Math.max(n.BOTTLE.minScale, this.scale), this.scale <= n.BOTTLE.minScale))) {
        this.body.scale.y = this.scale, this.body.scale.x += .007, this.body.scale.z += .007, this.head.position.y -= .018;
        this.obj.position.y -= n.BLOCK.reduction / 2 * n.BLOCK.height / 2 + .027, this.prepareTime += t, this.prepareTime - this.lastPrepareTime >= .1 && (this.lastPrepareTime = this.prepareTime, h.default.emit(n.EVENT.SEND_REALTIME_MSG_TO_CTRL, {
          time: this.prepareTime
        }));
      }
    }
  }, {
    key: "prepare",
    value: function () {
      this.lastPrepareTime = 0, this.prepareTime = 0, this.status = "prepare", this.gatherParticles();
    }
  }, {
    key: "relayLimitTime",
    value: function (t) {
      this.limitTime = t;
    }
  }, {
    key: "jump",
    value: function (t) {
      this.resetParticles(), this.status = "jump", this.axis = t, a.customAnimation.to(this.body.scale, .25, {
        x: 1,
        y: 1,
        z: 1
      }), this.head.position.y = 4.725, this.scale = 1, this.limitTime = void 0;
      var i = Math.min(Math.max(this.velocity.vz / 35, 1.2), 1.4);
      this.human.rotation.z = this.human.rotation.x = 0, "straight" === this.direction ? (a.customAnimation.to(this.human.rotation, .14, {
        z: this.human.rotation.z - Math.PI
      }), a.customAnimation.to(this.human.rotation, .18, {
        z: this.human.rotation.z - 2 * Math.PI,
        delay: .14
      }), a.customAnimation.to(this.head.position, .1, {
        y: this.head.position.y + .9 * i,
        x: this.head.position.x + .45 * i
      }), a.customAnimation.to(this.head.position, .1, {
        y: this.head.position.y - .9 * i,
        x: this.head.position.x - .45 * i,
        delay: .1
      }), a.customAnimation.to(this.head.position, .15, {
        y: 4.725,
        x: 0,
        delay: .25
      }), a.customAnimation.to(this.body.scale, .1, {
        y: Math.max(i, 1),
        x: Math.max(Math.min(1 / i, 1), .7),
        z: Math.max(Math.min(1 / i, 1), .7)
      }), a.customAnimation.to(this.body.scale, .1, {
        y: Math.min(.9 / i, .7),
        x: Math.max(i, 1.2),
        z: Math.max(i, 1.2),
        delay: .1
      }), a.customAnimation.to(this.body.scale, .3, {
        y: 1,
        x: 1,
        z: 1,
        delay: .2
      })) : (a.customAnimation.to(this.human.rotation, .14, {
        x: this.human.rotation.x - Math.PI
      }), a.customAnimation.to(this.human.rotation, .18, {
        x: this.human.rotation.x - 2 * Math.PI,
        delay: .14
      }), a.customAnimation.to(this.head.position, .1, {
        y: this.head.position.y + .9 * i,
        z: this.head.position.z - .45 * i
      }), a.customAnimation.to(this.head.position, .1, {
        z: this.head.position.z + .45 * i,
        y: this.head.position.y - .9 * i,
        delay: .1
      }), a.customAnimation.to(this.head.position, .15, {
        y: 4.725,
        z: 0,
        delay: .25
      }), a.customAnimation.to(this.body.scale, .05, {
        y: Math.max(i, 1),
        x: Math.max(Math.min(1 / i, 1), .7),
        z: Math.max(Math.min(1 / i, 1), .7)
      }), a.customAnimation.to(this.body.scale, .05, {
        y: Math.min(.9 / i, .7),
        x: Math.max(i, 1.2),
        z: Math.max(i, 1.2),
        delay: .1
      }), a.customAnimation.to(this.body.scale, .2, {
        y: 1,
        x: 1,
        z: 1,
        delay: .2
      }));
    }
  }, {
    key: "showup",
    value: function () {
      this.status = "showup", this.obj.position.y = 25, this.human.rotation.x = this.human.rotation.z = 0, (0, a.TweenAnimation)(this.obj.position.y, n.BLOCK.height / 2, 500, "Bounce.easeOut", function (t, i) {
        void 0 !== t && (this.obj.position.y = t, i && (this.status = "stop"));
      }.bind(this));
    }
  }, {
    key: "stopPrepare",
    value: function () {
      this.obj.position.y = n.BLOCK.height / 2, this.stop(), this.body.scale.set(1, 1, 1), this.head.position.y = 4.725, this.head.position.x = 0, this.resetParticles();
    }
  }, {
    key: "getBox",
    value: function () {
      return [new s.Box3().setFromObject(this.head), new s.Box3().setFromObject(this.middle), new s.Box3().setFromObject(this.bottom)];
    }
  }, {
    key: "resetToDefaultSkin",
    value: function () {
      this.changeBottleMaterial(["res/head.png", "res/head.png", "res/middle.png", "res/bottom.png"]), this.scarf.obj.visible = !1, this.hat.obj.visible = !1;
    }
  }, {
    key: "changeSkin",
    value: function (t) {
      t ? (this.skinId = t.id || null, 1 == t.type ? (this.scarf.obj.visible = !1, this.hat.obj.visible = !1, this.skin = t.property.images.join(""), this.changeBottleMaterial(t.property.images)) : 2 == t.type && (this.resetToDefaultSkin(), this.scarf.obj.visible = !0)) : (this.skinId = null, this.resetToDefaultSkin());
    }
  }, {
    key: "changeBottleMaterial",
    value: function (t) {
      for (var i = 0; i < 4; ++i) this.maps[t[i]] || (this.maps[t[i]] = n.loader.load(t[i]));
      this.headMaterial && this.bottomMaterial && this.middleTopMaterial && this.middleMaterial ? (this.headMaterial.map = this.maps[t[0]], this.middleTopMaterial.map = this.maps[t[1]], this.middleMaterial.map = this.maps[t[2]], this.bottomMaterial.map = this.maps[t[3]]) : (this.headMaterial = new s.MeshBasicMaterial({
        map: this.maps[t[0]]
      }), this.middleTopMaterial = new s.MeshBasicMaterial({
        map: this.maps[t[1]]
      }), this.middleMaterial = new s.MeshBasicMaterial({
        map: this.maps[t[2]]
      }), this.bottomMaterial = new s.MeshBasicMaterial({
        map: this.maps[t[3]]
      }));
    }
  }, {
    key: "checkSkin",
    value: function (t) {
      if (t && t.bottleSkin) this.changeSkin(t.bottleSkin);else if (t && null === t.bottleSkin) this.changeSkin();else {
        var i = this.getSelectedBottleSkinResourceSync();
        i ? this.changeSkin(i) : this.changeSkin();
      }
    }
  }, {
    key: "reset",
    value: function (t) {
      this.resetPosition(t), this.checkSkin(t);
    }
  }, {
    key: "resetPosition",
    value: function (t) {
      this.stop(), this.obj.position.y = n.BLOCK.height / 2, this.obj.position.x = this.obj.position.z = 0, this.obj.rotation.z = 0, this.obj.rotation.y = 0, this.obj.rotation.x = 0, this.bottle.rotation.y = 0, this.bottle.rotation.z = 0, this.bottle.rotation.x = 0, this.body && this.head && (this.body.scale.set(1, 1, 1), this.body.rotation.z = this.body.rotation.x = this.body.rotation.y = 0, this.head.position.y = 4.725, this.head.position.x = 0, this.human.rotation.y = this.human.rotation.z = this.human.rotation.x = 0), t && t.preserveDirection || (this.direction = "straight"), this.jumpStatus = "init", this.double = 1, this.resetParticles(), this.scoreText.obj.visible = !1, this.destination = [];
    }
  }]);
}();
