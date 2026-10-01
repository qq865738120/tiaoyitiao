// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawShareSkin = function (e) {
  (0, t.routeCanvas)(e, "shareSkin"), (0, t.createPlane)(e), function (e) {
    e.imgid.bg++;
    var i = e.context.bg;
    i.clearRect(0, 0, t.WIDTH, t.HEIGHT), e.imgid.btn++, e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), i.fillStyle = "rgba(0,0,0, 0.45)", i.fillRect(0, 0, t.WIDTH, t.HEIGHT), i.lineWidth = 2 * t.Dpr, i.strokeStyle = "rgba(255,255,255,0.1)";
    var r = e.opt;
    (0, t.drawImageCenter)({
      self: e,
      src: "res/bl3.png",
      pos: [207, 154, 354, 124],
      type: "bg",
      imgid: e.imgid.bg,
      round: !0,
      radius: 2 * t.Dpr,
      cb: function () {
        var i = e.opt.gift_list.findIndex(n.bind(e)),
          r = e.opt.gift_list[i];
        (0, t.drawText)({
          self: e,
          size: 17,
          t: e.opt.nickname,
          pos: [62, 154],
          align: "left",
          type: "bg"
        }), r ? (0, t.drawText)({
          self: e,
          size: 17,
          t: "送出的 " + r.gift_name,
          pos: [62, 178],
          align: "left",
          type: "bg"
        }) : (0, t.drawText)({
          self: e,
          size: 17,
          t: "送出的礼包已被抢光",
          pos: [62, 178],
          align: "left",
          type: "bg"
        }), (0, t.drawImageCenter)({
          self: e,
          src: e.opt.headimg,
          pos: [86, 98, 47, 47],
          type: "bg",
          cb: function () {
            (0, t.drawImageCenter)({
              self: e,
              src: "res/2d/ava_square.png",
              pos: [86, 98, 48, 48],
              type: "bg",
              imgid: e.imgid.bg
            });
          },
          imgid: e.imgid.bg,
          noupdate: !0,
          round: !0
        });
      }
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/bl3.png",
      pos: [207, 407.5, 354, 343],
      type: "bg",
      imgid: e.imgid.bg,
      round: !0,
      radius: 2 * t.Dpr,
      cb: function () {
        (0, t.drawText)({
          self: e,
          size: 12,
          t: "共有" + r.total_gift + "份礼物，" + r.gift_list.length + "位好友领取",
          pos: [62, 260],
          align: "left",
          type: "bg"
        }), (0, t.drawLine)(30, 278, 384, 278, "rgba(255,255,255,0.1)", .5, i);
      }
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/2d/new_return.png",
      pos: [54, 674, 70, 70],
      type: "btn",
      imgid: e.imgid.btn
    }), (0, t.updatePlane)({
      self: e,
      type: "bg"
    });
  }(e), (0, t.updateClip)({
    self: e
  }), function (e) {
    var n,
      s = e.opt.gift_list.length * (0, t.cwh)(t.ListLineHeight) / t.Dpr;
    n = (0, t.cwh)(301) / t.Dpr, e.scrollHandler = new i.default({
      innerOffsetHeight: s,
      outterOffsetHeight: n,
      updatePosition: e.updatePosition.bind(e)
    }), r(e, 0, "list1");
  }(e);
}, exports.drawShareSkinList = r, exports.shareSkinEve = function (e, t, i) {
  if (t > 30 && t < 95 && i > 640 && i < 720) return e.opt.onReturn && e.opt.onReturn(), !1;
};
var t = require("./base"),
  i = (e(require("../../store/storage")), e(require("../../scroll/scrollHandler")));
function r(e, i, r) {
  "list1" == r ? e.imgid.list1++ : "list2" == r && e.imgid.list2++;
  var n = e.opt.gift_list.slice(i, i + 12),
    s = e.context[r];
  if (s.clearRect(0, 0, t.WIDTH, 12 * (0, t.cwh)(t.ListLineHeight)), 0 == i || 0 != n.length) {
    if (!(i < 0)) {
      var a = n.length;
      console.log(n);
      for (var l = function () {
          g % 2 == 1 && (s.fillStyle = "rgba(255,255,255, 0.03)", s.fillRect(0, g * (0, t.cwh)(t.ListLineHeight), (0, t.cwh)(414), (0, t.cwh)(t.ListLineHeight)));
          var i = (g + .5) * t.ListLineHeight;
          (0, t.drawImageCenter)({
            round: !0,
            self: e,
            src: n[g].headimg,
            pos: [77, i, 34, 34],
            type: r,
            cb: function () {
              (0, t.drawImageCenter)({
                self: e,
                src: "res/ava_rank.png",
                pos: [77, i, 47, 47],
                type: r,
                imgid: e.imgid[r]
              });
            },
            imgid: e.imgid[r],
            noupdate: !0
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 17,
            t: (0, t.cname)(n[g].nickname, 10),
            pos: [114, i],
            type: r
          }), (0, t.drawText)({
            self: e,
            size: 14,
            align: "right",
            t: "获得" + n[g].gift_name,
            pos: [320, i],
            type: r
          }), n[g].gift_icon && (0, t.drawImageCenter)({
            self: e,
            src: n[g].gift_icon,
            pos: [348, i, 28, 28],
            type: r,
            imgid: e.imgid[r]
          });
        }, g = 0; g < a; g++) l();
      (0, t.updatePlane)({
        self: e,
        type: r
      });
    }
  } else (0, t.updatePlane)({
    self: e,
    type: r
  });
}
function n(e, t, i) {
  return !0 === e.received;
}
