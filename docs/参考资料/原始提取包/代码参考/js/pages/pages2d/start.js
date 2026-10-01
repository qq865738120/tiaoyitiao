// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawStartPage = function (e) {
  e.imgid.btn++, e.imgid.bg++, (0, n.routeCanvas)(e, "start"), (0, n.createPlane)(e);
  var o = e.context.bg;
  o.clearRect(0, 0, n.WIDTH, n.HEIGHT), o.fillStyle = "rgba(0,0,0, 0.3)", o.fillRect(0, 0, n.WIDTH, n.HEIGHT), (0, n.drawImageCenter)({
    self: e,
    src: "res/title.png",
    pos: [204, 168, 207, 52],
    type: "bg",
    imgid: e.imgid.bg
  }), e.context["btn"].clearRect(0, 0, n.WIDTH, n.HEIGHT), (0, n.drawImageCenter)({
    self: e,
    src: "res/play.png",
    pos: [207, 505, 212, 84],
    type: "btn",
    imgid: e.imgid.btn
  }), e.opt.hideRank || ((0, n.drawText)({
    t: "多人游戏",
    self: e,
    size: 17,
    pos: [163, 571],
    align: "left"
  }), (0, n.drawImageCenter)({
    self: e,
    src: "res/r_arr.png",
    pos: [247, 571, 6.6, 10],
    type: "bg",
    imgid: e.imgid.bg
  }), o.fillStyle = "rgba(0,0,0, 0.15)", o.fillRect(0, (0, n.cy)(617), n.WIDTH, (0, n.cwh)(250)), (0, n.drawImageCenter)({
    self: e,
    src: "res/2d/rank.png",
    pos: [111.5, 671, 74, 74],
    type: "btn",
    imgid: e.imgid.btn
  }), (0, n.drawImageCenter)({
    self: e,
    src: "res/2d/msg.png",
    pos: [207.5, 671, 74, 74],
    type: "btn",
    imgid: e.imgid.btn
  }), (0, n.drawImageCenter)({
    self: e,
    src: "res/2d/skin.png",
    pos: [303.5, 671, 74, 74],
    type: "btn",
    imgid: e.imgid.btn
  }), (0, n.drawText)({
    t: "排行榜",
    self: e,
    size: 12,
    pos: [111.5, 711.5]
  }), (0, n.drawText)({
    t: "消息",
    self: e,
    size: 12,
    pos: [207.5, 711.5]
  }), (0, n.drawText)({
    t: "皮肤中心",
    self: e,
    size: 12,
    pos: [303.5, 711.5]
  }), t.default.on(r.EVENT.INIT_SETTING_COMPLETE, function () {
    (0, i.createUserInfoButton)("多人游戏", 0, {
      x: 207,
      y: 571,
      width: 140,
      height: 40
    }, function () {
      e.options.newRelay && e.options.newRelay();
    }), (0, i.createUserInfoButton)("消息", 0, {
      x: 207,
      y: 680,
      width: 74,
      height: 94
    }, function () {
      e.opt.onMsgBox && e.opt.onMsgBox();
    });
  }));
  1 == e.opt.banType && (o.lineWidth = 1, o.strokeStyle = "rgba(0,0,0,0.7)", o.fillStyle = "rgba(0,0,0,0.7)", (0, n.roundedRect)((0, n.cx)(30), (0, n.cy)(258), (0, n.cwh)(354), (0, n.cwh)(196), 4, o), o.fill(), (0, n.drawText)({
    t: "游戏中存在可疑操作，存疑分数",
    self: e,
    size: 17,
    pos: [207, 310]
  }), (0, n.drawText)({
    t: "将不在排行榜中显示。",
    self: e,
    size: 17,
    pos: [207, 336]
  }), (0, n.drawImageCenter)({
    self: e,
    src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VajbZ52iaZX9Vlib0QAKEJGDIV8F9iaFeqXoawUbQkDP8zc6fbm95nKLgw/0?wx_fmt=png",
    pos: [207, 401, 138, 44],
    type: "bg",
    imgid: e.imgid.bg
  }), (0, n.drawText)({
    t: "我要申诉",
    self: e,
    size: 15,
    pos: [207, 401]
  }));
  (0, n.updatePlane)({
    self: e,
    type: "bg"
  });
}, exports.drawStartUpdate = function (e) {
  var t = e.context.btn;
  t.fillStyle = "red", t.beginPath(), t.arc((0, n.cx)(230), (0, n.cy)(650), (0, n.cwh)(5), 0, 2 * Math.PI), t.stroke(), t.fill(), (0, n.updatePlane)({
    self: e,
    type: "btn"
  });
}, exports.startEve = function (e, t, i) {
  if (console.log(t, i), t > 86 && t < 318 && i > 458 && i < 552) return e.options.onClickStart && e.options.onClickStart(), !1;
  if (!e.opt.hideRank && t > 83 && t < 139 && i > 643 && i < 726) return e.options.onShowFriendRank && e.options.onShowFriendRank(), !1;
  if (!e.opt.hideRank && t > 157 && t < 257 && i > 552 && i < 591) return e.options.newRelay && e.options.newRelay(), !1;
  if (1 == e.opt.banType && t > 128 && t < 286 && i > 369 && i < 433) return (0, o.routeVerify)(e), !1;
  if (!e.opt.hideRank && t > 179 && t < 235 && i > 643 && i < 726) return e.opt.onMsgBox && e.opt.onMsgBox(), !1;
  if (!e.opt.hideRank && t > 275 && t < 331 && i > 643 && i < 726) return e.opt.onBottleSkin && e.opt.onBottleSkin(), !1;
};
var t = e(require("../../lib/mue/eventcenter")),
  i = require("../../network/getAuth"),
  r = require("../../config"),
  n = require("./base"),
  o = require("./verify");
