// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.WIDTH = exports.W = exports.ListLineHeight = exports.HEIGHT = exports.H = exports.Dpr = exports.DEBUGVIEW = exports.CANVASTYPE = void 0, exports.back = function (e, t) {
  return e.routesArr.pop(), e.routesArr.pop();
}, exports.cname = function (e, t) {
  t = t || 16, (e = e || "").replace(/[^\x00-\xff]/g, "**").length > t + 2 && (e = function e(t, n) {
    (t = t || "").replace(/[^\x00-\xff]/g, "**").length > n && (t = t.substring(0, t.length - 1), t = e(t, n));
    return t;
  }(e, t) + "...");
  return e;
}, exports.createPlane = function (e, n) {
  if (v(e, n), e.showState = !0, !!e.canvas.bg) return;
  d && (l = ["sample", "btn", "list1", "list2", "bg"]);
  for (var r = 0; r < l.length; r++) e.canvas[l[r]] = document.createElement("canvas"), e.context[l[r]] = e.canvas[l[r]].getContext("2d"), e.canvas[l[r]].width = i, "list1" == l[r] || "list2" == l[r] ? e.canvas[l[r]].height = y(720) : e.canvas[l[r]].height = s, e.texture[l[r]] = new t.Texture(e.canvas[l[r]]), e.material[l[r]] = new t.MeshBasicMaterial({
    map: e.texture[l[r]],
    transparent: !0
  }), "list1" == l[r] || "list2" == l[r] ? e.geometry[l[r]] = new t.PlaneBufferGeometry(g, y(720) / s * u) : e.geometry[l[r]] = new t.PlaneBufferGeometry(g, u), e.obj[l[r]] = new t.Mesh(e.geometry[l[r]], e.material[l[r]]), e.material[l[r]].map.minFilter = t.LinearFilter, e.obj[l[r]].position.y = 0, e.obj[l[r]].position.x = 0, e.obj[l[r]].position.z = 9 - .001 * r;
}, exports.cwh = y, exports.cx = m, exports.cy = h, exports.drawHomeImg = function (e, t) {
  var n = new Image();
  n.onload = function () {
    if (wx.getMenuButtonBoundingClientRect) {
      var r = wx.getMenuButtonBoundingClientRect() || {};
      e.drawImage(n, 10 * o, (r.top || 10) * o, 104, 64);
    } else 1624 == s && 750 == i ? e.drawImage(n, 10 * o, 44 * o, 104, 64) : e.drawImage(n, 10 * o, 10 * o, 104, 64);
    w({
      self: t,
      type: "bg"
    });
  }, n.src = "res/2d/home.png";
}, exports.drawImageCenter = b, exports.drawLine = function (e, t, n, r, a, p, s) {
  s.beginPath(), s.lineWidth = p * o, s.strokeStyle = a, s.moveTo(m(e), h(t)), s.lineTo(m(n), h(r)), s.stroke(), s.closePath();
}, exports.drawReturnImg = function (e, t) {
  var n = new Image();
  n.onload = function () {
    if (wx.getMenuButtonBoundingClientRect) {
      var r = wx.getMenuButtonBoundingClientRect() || {};
      e.drawImage(n, 10 * o, (r.top || 10) * o, 86, 64);
    } else 1624 == s && 750 == i ? e.drawImage(n, 10 * o, 44 * o, 86, 64) : e.drawImage(n, 10 * o, 10 * o, 86, 64);
    w({
      self: t,
      type: "bg"
    });
  }, n.src = "res/2d/return.png";
}, exports.drawText = function (e) {
  var t = (e = Object.assign({}, {
      self: {},
      t: "",
      size: 17,
      pos: [0, 0],
      type: "bg",
      special: !1,
      align: "center",
      color: "#fff",
      bold: !1,
      italic: !1
    }, e)).self.context[e.type],
    n = function (e, t) {
      var n = e * o * a / 414;
      p / a < 736 / 414 && (n = e * o * p / 736);
      return t && f ? n + "px ".concat(f) : n + "px Helvetica";
    }(e.size, e.special);
  e.bold && (n = "bold " + n);
  e.italic && (n = "italic " + n);
  t.font = n, t.textBaseline = "middle", t.textAlign = e.align, t.fillStyle = e.color, "list1" == e.type || "list2" == e.type ? t.fillText(e.t, m(e.pos[0]), y(e.pos[1])) : t.fillText(e.t, m(e.pos[0]), h(e.pos[1]));
}, exports.findSelfIndex = function (e, t, n) {
  return e.nickname === this.myUserInfo.nickname && e.week_best_score === this.myUserInfo.week_best_score;
}, exports.frustumSizeWidth = exports.frustumSizeHeight = void 0, exports.go = I, exports.gtAppVersion = function (e) {
  var t = (0, n.getSystemInfo)().version;
  e = e.split("."), t = t.split(".");
  for (var r = Math.min(e.length, t.length), o = 0; o < r; o++) {
    if (parseInt(e[o]) > parseInt(t[o])) return !1;
    if (parseInt(e[o]) < parseInt(t[o])) return !0;
  }
  return !0;
}, exports.gtVersion = function (e) {
  try {
    var t = (0, n.getSystemInfo)().SDKVersion;
    e = e.split("."), t = t.split(".");
    for (var r = Math.min(e.length, t.length), o = 0; o < r; o++) {
      if (parseInt(e[o]) > parseInt(t[o])) return !1;
      if (parseInt(e[o]) < parseInt(t[o])) return !0;
    }
    return !0;
  } catch (e) {
    return !1;
  }
}, exports.hide = v, exports.realDpr = void 0, exports.relayRerank = function (e) {
  for (var t, n, r = 0, o = e.length; r < o; r++) for (t = 0; t < o; t++) e[r].rank < e[t].rank && (n = e[t], e[t] = e[r], e[r] = n);
  return e;
}, exports.rerank = function (e) {
  for (var t, n, r = 0, o = e.length; r < o; r++) for (t = 0; t < o; t++) e[r].week_best_score > e[t].week_best_score && (n = e[t], e[t] = e[r], e[r] = n);
  return e;
}, exports.roundedRect = T, exports.routeCanvas = function (e, t) {
  e.last2CanvasType = e.lastCanvasType, e.lastCanvasType = e.canvasType, e.canvasType = c[t], (0, r.changeCanvasType)(t), I(e, t), (0, r.hideUserInfoButton)();
}, exports.updateClip = function (e) {
  var n = e.self;
  n.p0 || (n.p0 = new t.Vector3(0, 0, 9), n.p1 = new t.Vector3(-g * (.5 - m(30) / i), (.5 - h(157) / s) * u, 9), n.p2 = new t.Vector3(g * (.5 - m(30) / i), u * (.5 - h(157) / s), 9), n.p3 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(218) / s), 9), n.p4 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(218) / s), 9));
  n.p5 || (n.p5 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(299) / s), 9), n.p6 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(299) / s), 9), n.p7 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(104) / s), 9), n.p8 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(104) / s), 9));
  n.p9 || (n.p9 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(332) / s), 9), n.p10 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(332) / s), 9), n.p11 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(175) / s), 9), n.p12 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(175) / s), 9));
  n.p13 || (n.p13 = new t.Vector3(-g * (.5 - m(30) / i), (.5 - h(318) / s) * u, 9), n.p14 = new t.Vector3(g * (.5 - m(30) / i), u * (.5 - h(318) / s), 9), n.p15 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(176) / s), 9), n.p16 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(176) / s), 9));
  n.p17 || (n.p17 = new t.Vector3(-g * (.5 - m(30) / i), (.5 - h(136) / s) * u, 9), n.p18 = new t.Vector3(g * (.5 - m(30) / i), u * (.5 - h(136) / s), 9), n.p19 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(118) / s), 9), n.p20 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(118) / s), 9));
  n.p21 || (n.p21 = new t.Vector3(-g * (.5 - m(30) / i), (.5 - h(278) / s) * u, 9), n.p22 = new t.Vector3(g * (.5 - m(30) / i), u * (.5 - h(278) / s), 9), n.p23 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(157) / s), 9), n.p24 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(157) / s), 9));
  n.p25 || (n.p25 = new t.Vector3(-g * (.5 - m(30) / i), (.5 - h(225) / s) * u, 9), n.p26 = new t.Vector3(g * (.5 - m(30) / i), u * (.5 - h(225) / s), 9), n.p27 = new t.Vector3(g * (.5 - m(30) / i), -u * (.5 - h(225) / s), 9), n.p28 = new t.Vector3(-g * (.5 - m(30) / i), -u * (.5 - h(225) / s), 9));
  var r = n.p0.clone(),
    o = n.p1.clone(),
    a = n.p2.clone(),
    p = n.p3.clone(),
    l = n.p4.clone();
  n.canvasType == c.pk && (o = n.p5.clone(), a = n.p6.clone(), p = n.p7.clone(), l = n.p8.clone());
  n.canvasType == c.relayRank && (o = n.p9.clone(), a = n.p10.clone(), p = n.p11.clone(), l = n.p12.clone(), 1 != n.opt.my_rank && (o = n.p13.clone(), a = n.p14.clone(), p = n.p15.clone(), l = n.p16.clone()), n.opt.isOutDate && (o = n.p25.clone(), a = n.p26.clone(), p = n.p27.clone(), l = n.p28.clone()));
  n.canvasType == c.msgBox && (o = n.p17.clone(), a = n.p18.clone(), p = n.p19.clone(), l = n.p20.clone());
  n.canvasType == c.shareSkin && (o = n.p21.clone(), a = n.p22.clone(), p = n.p23.clone(), l = n.p24.clone());
  n.options.camera.updateMatrixWorld();
  var d = n.options.camera.matrixWorld;
  r.applyMatrix4(d), o.applyMatrix4(d), a.applyMatrix4(d), p.applyMatrix4(d), l.applyMatrix4(d);
  var f = new t.Triangle(a, o),
    w = f.plane();
  n.canvasType == c.relayRank && 1 == n.opt.my_rank || n.canvasType == c.pk ? x(w, r.clone(), !0) : x(w, r.clone());
  var v = (f = new t.Triangle(p, a)).plane();
  x(v, r.clone());
  var y = (f = new t.Triangle(l, p)).plane();
  x(y, r.clone());
  var b = (f = new t.Triangle(o, l)).plane();
  x(b, r.clone()), n.material.list1.clippingPlanes = [w, v, y, b], n.material.list1.needsUpdate = !0, n.material.list2.clippingPlanes = [w, v, y, b], n.material.list2.needsUpdate = !0;
}, exports.updatePlane = w;
var t = e(require("../../lib/three")),
  n = require("../../config"),
  r = require("../../network/getAuth"),
  o = exports.Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio,
  a = (exports.realDpr = window.devicePixelRatio, exports.W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth),
  p = exports.H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
  s = exports.HEIGHT = p * o,
  i = exports.WIDTH = a * o,
  l = ["btn", "list1", "list2", "bg"],
  c = exports.CANVASTYPE = {
    friendRank: 0,
    groupRank: 1,
    gameOver: 2,
    start: 3,
    pk: 4,
    lookers: 5,
    gameOverNew: 6,
    gameOverHighest: 7,
    beginner: 8,
    verify: 9,
    relayRoom: 10,
    relayGG: 11,
    relayRank: 12,
    relayLookers: 13,
    record: 14,
    relayBeginner: 15,
    relayQr: 16,
    recordShare: 17,
    profile: 18,
    msgBox: 19,
    shareSkin: 20,
    getNewSkin: 21,
    skinList: 22,
    jiliProp: 23,
    msgDetail5: 24,
    pkRule: 25
  },
  u = exports.frustumSizeHeight = n.FRUSTUMSIZE,
  g = exports.frustumSizeWidth = i / s * u,
  d = exports.DEBUGVIEW = !1,
  f = (exports.ListLineHeight = 60, wx.loadFont("res/num.ttf"));
function w(e) {
  (e = Object.assign({}, {
    self: {},
    type: "bg"
  }, e)).self.showState && (e.self.canvasType == c.gameOver && "bg" != e.type && "btn" != e.type && "sample" != e.type || e.self.canvasType == c.start && "bg" != e.type && "btn" != e.type && "sample" != e.type || e.self.canvasType == c.record && "bg" != e.type || (e.self.texture[e.type].needsUpdate = !0, e.self.obj[e.type].visible = !0, e.self.options.camera.add(e.self.obj[e.type])));
}
function x(e, t, n) {
  if (e && t) {
    var r = e.distanceToPoint(t);
    r < 0 && !n && e.negate(), n && r > 0 && e.negate();
  }
}
function v(e, t) {
  if (!d) {
    e.showState = !1, e.bannerAd && e.bannerAd.hide(), e.bannerAd && e.bannerAd.destory(), e.bannerAd = null;
    for (var n = 0; n < l.length; n++) !e.obj[l[n]] || t && t.indexOf(l[n]) >= 0 || (e.obj[l[n]].visible = !1, e.options.camera.remove(e.obj[l[n]]));
    e.canvasType != c.getNewSkin && e.canvasType != c.gameOver && e.canvasType != c.jiliProp && e.sunGif && (e.options.camera.remove(e.sunGif.obj), e.sunGif.destroy()), t || (e.lastopt = void 0);
  }
}
function y(e) {
  var t = e * a / 414;
  return p / a < 736 / 414 && (t = e * p / 736), t * o;
}
function m(e) {
  var t = e * a / 414;
  return p / a < 736 / 414 && (t = e * p / 736 + (a - 414 * p / 736) / 2), t * o;
}
function h(e) {
  return (p / a > 736 / 414 ? e * a / 414 + (p - 736 * a / 414) / 2 : e * p / 736) * o;
}
function b(e) {
  "/0" != (e = Object.assign({}, {
    self: {},
    src: "",
    pos: [0, 0, 100, 100],
    type: "bg",
    cb: null,
    imgid: 0,
    noupdate: !1,
    round: !1,
    radius: 2,
    alpha: 1
  }, e)).src && "/96" != e.src && "/64" != e.src && e.src || (e.src = "res/ava.png");
  var t = new Image(),
    n = e.self.context[e.type];
  t.onload = function () {
    if (e.self.imgid[e.type] == e.imgid) {
      var r;
      if (e.round) n.save(), r = "list1" == e.type || "list2" == e.type ? y(e.pos[1]) - y(e.pos[3]) / 2 : h(e.pos[1]) - y(e.pos[3]) / 2, T(m(e.pos[0]) - y(e.pos[2]) / 2, r, y(e.pos[2]), y(e.pos[3]), e.radius, n), n.clip(), n.globalAlpha = e.alpha, n.drawImage(t, m(e.pos[0]) - y(e.pos[2]) / 2, r, y(e.pos[2]), y(e.pos[3])), n.globalAlpha = 1, n.closePath(), n.restore();else n.globalAlpha = e.alpha, "list1" == e.type || "list2" == e.type ? n.drawImage(t, m(e.pos[0]) - y(e.pos[2]) / 2, y(e.pos[1]) - y(e.pos[3]) / 2, y(e.pos[2]), y(e.pos[3])) : n.drawImage(t, m(e.pos[0]) - y(e.pos[2]) / 2, h(e.pos[1]) - y(e.pos[3]) / 2, y(e.pos[2]), y(e.pos[3])), n.globalAlpha = 1;
      e.cb && e.cb(), e.noupdate || w({
        self: e.self,
        type: e.type
      });
    }
  }, t.onerror = function (t) {
    e.cb && e.cb();
  }, t.src = e.src;
}
function T(e, t, n, r, o, a) {
  a.beginPath(), a.moveTo(e, t + o - 1), a.lineTo(e, t + r - o), a.quadraticCurveTo(e, t + r, e + o, t + r), a.lineTo(e + n - o, t + r), a.quadraticCurveTo(e + n, t + r, e + n, t + r - o), a.lineTo(e + n, t + o), a.quadraticCurveTo(e + n, t, e + n - o, t), a.lineTo(e + o, t), a.quadraticCurveTo(e, t, e, t + o), a.stroke(), a.closePath();
}
function I(e, t) {
  e.routesArr = e.routesArr || [], e.routesArr.push(t);
}
