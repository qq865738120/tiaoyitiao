// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawSkin = function (e) {
  (0, t.routeCanvas)(e, "skinList"), (0, t.createPlane)(e), function (e) {
    e.imgid.btn++, e.imgid.bg++;
    var i = e.context.bg;
    i.clearRect(0, 0, t.WIDTH, t.HEIGHT);
    var r = e.context.btn;
    r.clearRect(0, 0, t.WIDTH, t.HEIGHT), i.fillStyle = "rgba(0,0,0, 0.45)", i.fillRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.updatePlane)({
      self: e,
      type: "bg"
    }), (0, t.drawText)({
      self: e,
      size: 22,
      t: "皮肤中心",
      pos: [207, 89],
      type: "bg",
      bold: !0
    }), (0, t.drawImageCenter)({
      round: !0,
      radius: 2 * t.Dpr,
      self: e,
      src: "res/bl3.png",
      pos: [207, 372, 354, 492],
      type: "bg",
      imgid: e.imgid.bg,
      cb: function () {
        for (var i = e.opt.skin_list, s = function (s) {
            var n = Math.floor(s / 2),
              l = s % 2,
              o = 1;
            i[s].id == e.opt.id ? r.fillStyle = "#F7E6FF" : 0 == i[s].use_status ? (r.fillStyle = "#D1D1D1", o = .5) : 1 == i[s].use_status && (r.fillStyle = "#F7E6FF"), r.strokeStyle = "#ccc", (0, t.roundedRect)((0, t.cx)(50 + 167 * l), (0, t.cy)(157 + 187 * n), (0, t.cwh)(147), (0, t.cwh)(167), 2 * t.Dpr, r), r.fill(), (0, t.drawImageCenter)({
              self: e,
              src: i[s].img,
              pos: [124 + 167 * l, 220 + 187 * n, 33, 66],
              type: "btn",
              imgid: e.imgid.btn,
              alpha: o,
              cb: function () {
                0 == i[s].use_status && (0, t.drawText)({
                  self: e,
                  size: 17,
                  t: i[s].unlock_wording,
                  pos: [123 + 167 * l, 226 + 187 * n],
                  type: "btn"
                });
              }
            }), r.beginPath(), r.lineWidth = .5 * t.Dpr, r.strokeStyle = "rgba(0,0,0,0.1)", r.moveTo((0, t.cx)(50 + 167 * l), (0, t.cy)(271 + 187 * n)), r.lineTo((0, t.cx)(197 + 167 * l), (0, t.cy)(271 + 187 * n)), r.stroke(), i[s].id == e.opt.id ? (0, t.drawImageCenter)({
              self: e,
              src: "res/2d/sel.png",
              pos: [123 + 167 * l, 296 + 187 * n, 50, 42],
              type: "btn",
              imgid: e.imgid.btn
            }) : 0 == i[s].use_status ? (0, t.drawText)({
              self: e,
              size: 17,
              t: "待解锁",
              pos: [123 + 167 * l, 296 + 187 * n],
              type: "btn",
              color: "#3A3743"
            }) : 1 == i[s].use_status && (0, t.drawText)({
              self: e,
              size: 17,
              t: "使用",
              pos: [123 + 167 * l, 296 + 187 * n],
              type: "btn",
              color: "#3A3743"
            }), i[s].left_time && (0, t.drawText)({
              self: e,
              size: 10,
              t: "有效期" + Math.ceil(i[s].left_time / 3600 / 24) + "天",
              pos: [123 + 167 * l, 166 + 187 * n],
              type: "btn",
              color: "#888"
            });
          }, n = 0; n < i.length; n++) s(n);
      }
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/2d/new_return.png",
      pos: [54, 674, 70, 70],
      type: "btn",
      imgid: e.imgid.btn
    });
  }(e);
}, exports.skinListEve = function (e, t, i, r) {
  if (t > 30 && t < 95 && i > 640 && i < 720) return e.opt.onReturn && e.opt.onReturn(), !1;
  if (t > 30 && t < 384 && i > 86 && i < 618) {
    0;
    var s = Math.floor((i + 0 - 157) / 177),
      n = Math.floor(t / 207),
      l = 2 * s + n;
    return e.opt.skin_list[l] && e.opt.onClickUse && e.opt.onClickUse(e.opt.skin_list[l]), !1;
  }
}, exports.updateSkinUseStatus = function (e) {
  for (var r = e.opt.skin_list, s = r.findIndex(i.bind(e)), n = 0; n < r.length; n++) {
    var l = Math.floor(n / 2),
      o = n % 2,
      a = e.context.btn;
    1 == r[n].use_status && (a.fillStyle = "#F7E6FF", a.fillRect((0, t.cx)(90 + 167 * o), (0, t.cy)(276 + 187 * l), (0, t.cwh)(80), (0, t.cwh)(45)), n == s ? (0, t.drawImageCenter)({
      self: e,
      src: "res/2d/sel.png",
      pos: [123 + 167 * o, 296 + 187 * l, 50, 42],
      type: "btn",
      imgid: e.imgid.btn
    }) : (0, t.drawText)({
      self: e,
      size: 17,
      t: "使用",
      pos: [123 + 167 * o, 296 + 187 * l],
      type: "btn",
      color: "#555"
    }));
  }
};
var t = require("./base");
e(require("../../scroll/scrollHandler"));
function i(e, t, i) {
  return e.id === this.opt.new_id;
}
