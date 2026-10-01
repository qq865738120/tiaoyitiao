// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var i = require("../../@babel/runtime/helpers/interopRequireDefault").default,
  t = require("../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var o = require("../../@babel/runtime/helpers/classCallCheck"),
  e = require("../../@babel/runtime/helpers/createClass"),
  s = t(require("../lib/three")),
  r = require("../lib/animation"),
  n = require("../config"),
  a = i(require("../lib/mue/eventcenter")),
  l = function () {
    return e(function i(t, e) {
      o(this, i);
      var r = new s.Shape();
      r = this.roundedRect(r, -1.5, -1.5, 3, 3, .25), new s.Shape();
      var n = new s.ShapeGeometry(r);
      this.reMapUv(n), this.avatorFrame = new s.Mesh(n, new s.MeshBasicMaterial({
        transparent: !0,
        map: t,
        opacity: 1
      })), this.outer = new s.Mesh(n, new s.MeshBasicMaterial({
        transparent: !0,
        color: 16777215,
        opacity: 1
      })), this.outer.scale.set(1.05, 1.05, 1.05), this.outer.position.z = -.1, this.obj = new s.Object3D(), this.obj.add(this.avatorFrame), this.obj.add(this.outer), this.id = e, this.waitingList = [];
    }, [{
      key: "roundedRect",
      value: function (i, t, o, e, s, r) {
        return i.moveTo(t, o + r), i.lineTo(t, o + s - r), i.quadraticCurveTo(t, o + s, t + r, o + s), i.lineTo(t + e - r, o + s), i.quadraticCurveTo(t + e, o + s, t + e, o + s - r), i.lineTo(t + e, o + r), i.quadraticCurveTo(t + e, o, t + e - r, o), i.lineTo(t + r, o), i.quadraticCurveTo(t, o, t, o + r), i;
      }
    }, {
      key: "reMapUv",
      value: function (i) {
        i.computeBoundingBox();
        var t = i.boundingBox.max,
          o = i.boundingBox.min,
          e = new s.Vector2(0 - o.x, 0 - o.y),
          r = new s.Vector2(t.x - o.x, t.y - o.y),
          n = i.faces;
        i.faceVertexUvs[0] = [];
        for (var a = 0; a < n.length; a++) {
          var l = i.vertices[n[a].a],
            c = i.vertices[n[a].b],
            h = i.vertices[n[a].c];
          i.faceVertexUvs[0].push([new s.Vector2((l.x + e.x) / r.x, (l.y + e.y) / r.y), new s.Vector2((c.x + e.x) / r.x, (c.y + e.y) / r.y), new s.Vector2((h.x + e.x) / r.x, (h.y + e.y) / r.y)]);
        }
        i.uvsNeedUpdate = !0;
      }
    }]);
  }();
exports.default = function () {
  return e(function i() {
    o(this, i), this.obj = new s.Object3D(), this.list = [], this.secondList = [];
    var t = new s.PlaneBufferGeometry(26, .76, 30);
    this.progress = new s.Object3D();
    var e = n.loader.load("res/progress2.png"),
      r = new s.CircleGeometry(.38, 15, 0, Math.PI);
    this.roundCircle = new s.Mesh(r, new s.MeshBasicMaterial({
      map: e
    })), this.roundCircleBack = new s.Mesh(r, new s.MeshBasicMaterial({
      transparent: !0,
      opacity: .08,
      color: 0
    })), this.secondRoundCircleBack = this.roundCircleBack.clone(), this.secondRoundCircle = this.roundCircle.clone(), this.backgroundBar = new s.Mesh(t, new s.MeshBasicMaterial({
      transparent: !0,
      opacity: .08,
      color: 0
    })), this.progressBar = new s.Object3D(), this.progressBar.add(new s.Mesh(t, new s.MeshBasicMaterial({
      map: e,
      transparent: !0
    }))), this.progressShadow = new s.Mesh(new s.PlaneGeometry(26, .38), new s.MeshBasicMaterial({
      transparent: !0,
      color: 16777215,
      opacity: .08
    })), this.progressShadow.position.set(0, .19, .1), this.progressBar.add(this.progressShadow), this.progress.add(this.roundCircleBack), this.secondRoundCircleBack.position.z = this.roundCircleBack.position.z = this.backgroundBar.position.z = -.1, this.progress.add(this.secondRoundCircleBack), this.progress.add(this.backgroundBar), this.progress.add(this.progressBar), this.roundCircle.rotation.z = this.roundCircleBack.rotation.z = -Math.PI / 2, this.roundCircle.position.x = this.roundCircleBack.position.x = 13, this.secondRoundCircle = this.roundCircle.clone(), this.secondRoundCircle.rotation.z = this.secondRoundCircleBack.rotation.z = Math.PI / 2, this.secondRoundCircle.position.x = this.secondRoundCircleBack.position.x = -13, this.progress.add(this.roundCircle), this.progress.add(this.secondRoundCircle), this.progress.position.set(8.2, 3.25, 0), this.obj.add(this.progress), this.turnAudio = wx.createInnerAudioContext(), this.turnAudio.src = "res/turn.mp3";
  }, [{
    key: "set",
    value: function (i, t) {
      var o = this;
      this.destroy(), this.list = [];
      for (var e = 0, s = i.length; e < s; ++e) {
        "/0" != i[e].headimg && "/96" != i[e].headimg && "/64" != i[e].headimg && i[e].headimg || (i[e].headimg = "res/ava.png");
        var c = n.loader.load(i[e].headimg),
          h = new l(c, i[e].seat_no);
        this.obj.add(h.obj), h.obj.position.x = 4 * (e - 5 >= 1 ? e - 5 : e), 0 == e && (h.obj.scale.set(2.2, 2.2, 2.2), h.obj.position.set(-1.8, -1.8, 0)), e >= 6 && (h.obj.position.y = -3.5), this.list.push(h);
        var u = new l(c, i[e].seat_no);
        u.obj.visible = !1, this.obj.add(u.obj), this.secondList.push(u);
      }
      this.progressBar.scale.x = 1, this.progressBar.position.x = 0, this.roundCircle.position.x = 13, this.roundCircle.visible = !0, this.secondRoundCircle.visible = !0;
      var d = 5;
      t && t.timeout && (d = 1), r.customAnimation.to(this.progressBar.scale, d, {
        x: .01,
        name: "progress",
        onComplete: function () {
          o.progressBlinkTimer = setInterval(function () {
            o.roundCircle.visible = !o.roundCircle.visible, o.secondRoundCircle.visible = !o.secondRoundCircle.visible;
          }, 800), t && t.noEmit || a.default.emitSync(n.EVENT.PROGRESSOVER);
        }
      }), r.customAnimation.to(this.progressBar.position, d, {
        x: -13,
        name: "progress"
      }), r.customAnimation.to(this.roundCircle.position, d, {
        x: -13,
        name: "progress"
      });
    }
  }, {
    key: "next",
    value: function (i, t) {
      var o = this;
      if (console.log("next111111"), this.progressBlinkTimer && (clearInterval(this.progressBlinkTimer), this.progressBlinkTimer = null), this.animating) return console.log("waitingList!!!!!!!!"), void this.waitingList.push(i);
      console.log("next22222222"), r.TweenAnimation.kill("progress"), this.roundCircle.visible = !0, this.secondRoundCircle.visible = !0, this.animating = !0;
      var e = this.list.shift(),
        s = this.secondList.shift();
      if (i && i.now_player_seat_no == e.id) return console.warn("data 重复的next 导致头像不匹配"), this.list.unshift(e), this.secondList.unshift(s), void (this.animating = !1);
      if (this.list[0]) {
        i && i.my_seat_no == i.now_player_seat_no && this.turnAudio.play(), i && this.currentDie(e.id, i.playerlist) && (e.died = !0);
        var l = .3;
        t && t.noAnimation && (l = .01), this.list[0].avatorFrame.material.opacity = .3, this.list[0].outer.material.opacity = .3, r.customAnimation.to(this.list[0].avatorFrame.material, l, {
          opacity: 1
        }), r.customAnimation.to(this.list[0].outer.material, l, {
          opacity: 1
        }), r.customAnimation.to(this.list[0].obj.scale, l, {
          x: 2.2,
          y: 2.2,
          z: 2.2
        }), r.customAnimation.to(this.list[0].obj.position, l, {
          x: -1.8,
          y: -1.8
        }), this.progressBar.scale.x = 1, this.progressBar.position.x = 0, this.roundCircle.position.x = 13, r.customAnimation.to(this.progressBar.scale, 5, {
          x: .01,
          name: "progress",
          onComplete: function () {
            console.log("fuck progress over"), o.progressBlinkTimer = setInterval(function () {
              o.roundCircle.visible = !o.roundCircle.visible, o.secondRoundCircle.visible = !o.secondRoundCircle.visible;
            }, 800), i && a.default.emitSync(n.EVENT.PROGRESSOVER);
          }
        }), r.customAnimation.to(this.progressBar.position, 5, {
          x: -13,
          name: "progress"
        }), r.customAnimation.to(this.roundCircle.position, 5, {
          x: -13,
          name: "progress"
        });
        for (var c = 1, h = this.list.length; c < h; ++c) if (5 == c) {
          var u = this.list[5];
          u.obj.position.z = -1;
          var d = this.secondList[5];
          r.customAnimation.to(u.outer.material, l, {
            opacity: 0
          }), r.customAnimation.to(u.avatorFrame.material, l, {
            opacity: 0
          }), r.customAnimation.to(u.obj.position, l, {
            x: 0
          }), d.obj.visible = !0, d.outer.material.opacity = 0, d.avatorFrame.material.opacity = 0, d.obj.position.x = 24, d.obj.position.y = 0, r.customAnimation.to(d.obj.position, l, {
            x: d.obj.position.x - 4,
            onEnded: function () {
              u.obj.position.x = d.obj.position.x, u.obj.position.y = d.obj.position.y, u.outer.material.opacity = 1, u.avatorFrame.material.opacity = 1, d.obj.visible = !1;
            }
          }), r.customAnimation.to(d.avatorFrame.material, l, {
            opacity: 1
          }), r.customAnimation.to(d.outer.material, l, {
            opacity: 1
          });
        } else this.list[c].obj.position.z = 0, r.customAnimation.to(this.list[c].obj.position, l, {
          x: 4 * (c - 5 >= 1 ? c - 5 : c)
        });
        r.customAnimation.to(e.obj.position, l, {
          x: -8,
          onEnded: function () {
            if (o.animating = !1, o.waitingList.length > 0) {
              console.log("onComplete next");
              var i = o.waitingList.shift();
              o.next(i, {
                noAnimation: !0
              });
            }
          }
        }), r.customAnimation.to(e.avatorFrame.material, l, {
          opacity: 0
        }), r.customAnimation.to(e.outer.material, l, {
          opacity: 0
        }), e.died ? (this.obj.remove(e.obj), this.obj.remove(s.obj)) : (s.obj.position.x = 4 * (this.list.length - 5 >= 1 ? this.list.length - 5 : this.list.length) + 4, console.log("secondFirstItem obj", s.obj.position.x, this.list.length), s.obj.position.y = this.list.length + 1 > 6 ? -3.5 : 0, s.avatorFrame.material.opacity = 0, s.outer.material.opacity = 0, s.obj.visible = !0, r.customAnimation.to(s.obj.position, l, {
          x: s.obj.position.x - 4,
          onEnded: function () {
            e.obj.scale.set(1, 1, 1), e.obj.position.x = s.obj.position.x, e.obj.position.y = s.obj.position.y, console.log("final", e.obj.position.x, e.obj.position.y), e.avatorFrame.material.opacity = 1, e.outer.material.opacity = 1, s.obj.visible = !1;
          }
        }), r.customAnimation.to(s.avatorFrame.material, l, {
          opacity: 1
        }), r.customAnimation.to(s.outer.material, l, {
          opacity: 1
        }), this.list.push(e), this.secondList.push(s));
      } else this.animating = !1;
    }
  }, {
    key: "currentJumperDie",
    value: function () {
      this.list[0].died = !0;
    }
  }, {
    key: "currentDie",
    value: function (i, t) {
      console.log("id", i, t);
      for (var o = 0, e = t.length; o < e; ++o) if (t[o].seat_no == i && 0 != t[o].rank) return !0;
    }
  }, {
    key: "destroy",
    value: function () {
      this.progressBlinkTimer && (clearInterval(this.progressBlinkTimer), this.progressBlinkTimer = null);
      for (var i = 0, t = this.list.length; i < t; ++i) this.list[i] && this.list[i].obj && this.list[i].obj.material && this.list[i].obj.material.map && this.list[i].obj.material.map.dispose(), this.obj.remove(this.list[i].obj);
      for (i = 0, t = this.secondList.length; i < t; ++i) this.secondList[i] && this.secondList[i].obj && this.secondList[i].obj.material && this.secondList[i].obj.material.map && this.secondList[i].obj.material.map.dispose(), this.obj.remove(this.secondList[i].obj);
      this.list = [], this.secondList = [], this.waitingList = [], this.animating = !1;
    }
  }]);
}();
