// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawProfile = function (t) {
  t.imgid.bg++, t.imgid.btn++, t.imgid.list1++, t.imgid.list2++, t.showDialog = !1, (0, e.routeCanvas)(t, "profile"), (0, e.createPlane)(t);
  var i = t.context.bg;
  i.clearRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "rgba(0,0,0, 0.45)", i.fillRect(0, 0, e.WIDTH, e.HEIGHT), t.context.btn.clearRect(0, 0, e.WIDTH, e.HEIGHT);
  var s = t.opt,
    n = 430,
    a = 0;
  s.is_self && (n = 520, a = -30);
  i.strokeStyle = "rgba(255, 255, 255, 0.06)", (0, e.drawImageCenter)({
    round: !0,
    radius: 2 * e.Dpr,
    self: t,
    src: "res/bl3.png",
    pos: [207, 123 + n / 2 + a, 354, n],
    type: "bg",
    imgid: t.imgid.bg,
    cb: function () {
      i.strokeStyle = "rgba(255,255,255,0.1)", (0, e.roundedRect)((0, e.cx)(30), (0, e.cy)(123 + a), (0, e.cwh)(354), (0, e.cwh)(n), 2 * e.Dpr, i), (0, e.drawText)({
        self: t,
        t: "本周最高分",
        size: 14,
        pos: [186, 160 + a],
        type: "bg"
      }), (0, e.drawText)({
        self: t,
        t: s.week_best_score || 0,
        size: 28,
        pos: [186, 191 + a],
        type: "bg",
        special: !0
      }), (0, e.drawText)({
        self: t,
        t: "历史最高分",
        size: 14,
        pos: [307, 160 + a],
        type: "bg"
      }), (0, e.drawText)({
        self: t,
        t: s.highest_score || 0,
        size: 28,
        pos: [307, 191 + a],
        type: "bg",
        special: !0
      }), (0, e.drawLine)(30, 233 + a, 384, 233 + a, "rgba(255,255,255,0.1)", .5, i), (0, e.drawText)({
        self: t,
        t: "本周精彩回放",
        size: 12,
        pos: [87, 272 + a],
        type: "bg"
      }), (0, e.drawImageCenter)({
        self: t,
        round: !0,
        src: s.playback_poster || "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJHSzlW8rkRicx6ppKtmCKMC9a5Qmdm5l19UJguw969rjWV43K3OECytHQ07XPsscjKw/0?wx_fmt=png",
        pos: [207, 362.5 + a, 314, 141],
        type: "bg",
        imgid: t.imgid.bg,
        radius: 2 * e.Dpr,
        cb: function () {
          i.fillStyle = "rgba(0,0,0, 0.4)", (0, e.roundedRect)((0, e.cx)(50), (0, e.cy)(292 + a), (0, e.cwh)(314), (0, e.cwh)(141), 2 * e.Dpr, i), i.fill(), 0 == s.week_best_score ? (0, e.drawText)({
            self: t,
            t: "暂无回放",
            size: 17,
            pos: [207, 362.5 + a],
            type: "bg"
          }) : (0, e.drawImageCenter)({
            self: t,
            src: "res/2d/record.png",
            pos: [207, 362.5 + a, 40, 40],
            type: "bg",
            imgid: t.imgid.bg
          });
        }
      }), console.log(s.praise_info), r(t), (0, e.drawImageCenter)({
        self: t,
        round: !0,
        src: s.headimg,
        pos: [80, 173 + a, 60, 60],
        type: "bg",
        cb: function () {
          (0, e.drawImageCenter)({
            self: t,
            src: "res/2d/ava_square.png",
            pos: [80, 173 + a, 61, 61],
            type: "bg",
            imgid: t.imgid.bg
          });
        },
        imgid: t.imgid.bg,
        noupdate: !0
      }), (0, e.drawImageCenter)({
        self: t,
        src: "res/2d/new_return.png",
        pos: [54, 674, 70, 70],
        type: "bg",
        imgid: t.imgid.bg
      }), s.is_self || (0, e.drawImageCenter)({
        self: t,
        src: "res/2d/target.png",
        pos: [354, 499, 32, 32],
        type: "btn",
        imgid: t.imgid.btn
      });
      var o = 0;
      s.is_self && (o = -57), i.fillStyle = "rgba(255,255,255,0.1)", i.strokeStyle = "rgba(255,255,255,0.1)", i.fillRect((0, e.cx)(50), (0, e.cy)(485 + o), (0, e.cwh)(314), (0, e.cwh)(28)), i.fill();
      for (var p = 314 / s.praise_info.reward_count, g = 0; g < s.praise_info.reward_count - 1; g++) (0, e.drawLine)(82 + p * g, 485 + o, 82 + p * g, 513 + o, "rgba(255,255,255,0.1)", .5, i);
    }
  }), (0, e.updatePlane)({
    self: t,
    type: "bg"
  });
}, exports.drawProfileUpdate = r, exports.profileEve = function (r, t, i) {
  if (t > 30 && t < 95 && i > 640 && i < 720) return "friendRank" == r.routesArr[r.routesArr.length - 2] && (r.setScroll = !0), (0, e.back)(r), r.opt.onReturn && r.opt.onReturn(), !1;
  if (r.opt.week_best_score > 0 && t > 50 && t < 350 && i > 290 && i < 430) return r.opt.onRecord && r.opt.onRecord(r.routesArr), !1;
  if (t > 310 && t < 390 && i > 640 && i < 700) return r.opt.onLike && r.opt.onLike(r.routesArr), !1;
  if (!r.opt.is_self && t > 330 && t < 380 && i > 476 && i < 516) return function (r) {
    var t = r.context.btn;
    if (r.timer) return;
    (0, e.drawImageCenter)({
      self: r,
      src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJFHiaWIxfyWrESuKDicrZJNaicFibAB2deJFicf7ahrv9LzA5gf90icrPhLk45Pw2dDNA12Q/0?wx_fmt=png",
      pos: [320, 446.5, 150, 69],
      type: "btn",
      imgid: r.imgid.btn,
      cb: function () {
        r.showDialog = !0, (0, e.drawText)({
          self: r,
          t: "在游戏中使用本道具可",
          size: 12,
          pos: [260, 432],
          type: "btn",
          align: "left",
          color: "#000"
        }), (0, e.drawText)({
          self: r,
          t: "自动完成一次完美跳跃",
          size: 12,
          pos: [260, 448],
          type: "btn",
          align: "left",
          color: "#000"
        }), r.timer = setTimeout(function () {
          r.timer = null, r.canvasType == e.CANVASTYPE.profile && (t.clearRect((0, e.cx)(245), (0, e.cy)(415), (0, e.cwh)(150), (0, e.cwh)(66)), (0, e.updatePlane)({
            self: r,
            type: "btn"
          }));
        }, 2e3);
      }
    });
  }(r), !1;
};
var e = require("./base");
function r(r) {
  var t = r.context.btn,
    i = r.opt;
  console.log("profile data", i), i.is_self && t.clearRect((0, e.cx)(35), (0, e.cy)(485), (0, e.cwh)(345), (0, e.cwh)(125));
  var s = 0;
  if (i.is_self && (s = -57), i.praise_info.praise_count > 0) {
    var n = 314 / i.praise_info.reward_count,
      a = r.context.bg;
    a.fillStyle = "#FFD240", a.strokeStyle = "rgba(255,255,255,0.1)", (0, e.roundedRect)((0, e.cx)(50), (0, e.cy)(485 + s), (0, e.cwh)(n * i.praise_info.praise_count), (0, e.cwh)(28), (0, e.cwh)(.5), a);
    for (var o = 0; o < i.praise_info.praise_count; o++) (0, e.drawImageCenter)({
      self: r,
      src: "res/2d/shade.png",
      pos: [52 + o * n + .5 * n, 497 + s, n, 28],
      type: "bg",
      imgid: r.imgid.bg
    });
    a.fill();
  }
  if (i.is_self) {
    if ((0, e.drawLine)(30, 480, 384, 480, "rgba(255,255,255,0.1)", .5, t), (0, e.drawLine)(30, 541, 384, 541, "rgba(255,255,255,0.1)", .5, t), i.praise_info.total_praise_count > 0) {
      (0, e.drawText)({
        self: r,
        t: "共 " + i.praise_info.total_praise_count + " 个赞",
        size: 14,
        pos: [364, 511],
        align: "right",
        type: "btn"
      });
      var p = i.praise_info.headimg_list;
      (0, e.drawImageCenter)({
        self: r,
        src: "res/2d/profile_zan_icon.png",
        pos: [54, 511, 16, 24],
        type: "btn",
        imgid: r.imgid.btn
      });
      var g = p.length;
      g > 6 && (g = 5, (0, e.drawImageCenter)({
        self: r,
        src: "res/2d/profile_zan.png",
        pos: [258, 511, 24, 24],
        type: "btn",
        imgid: r.imgid.btn
      }));
      for (var l = function (t) {
          (0, e.drawImageCenter)({
            self: r,
            round: !0,
            src: p[t],
            pos: [88 + 34 * t, 511, 23, 23],
            type: "btn",
            cb: function () {
              (0, e.drawImageCenter)({
                self: r,
                src: "res/2d/ava_square.png",
                pos: [88 + 34 * t, 511, 24, 24],
                type: "btn",
                imgid: r.imgid.btn
              });
            },
            imgid: r.imgid.btn,
            noupdate: !0
          });
        }, c = 0; c < g; c++) l(c);
    } else (0, e.drawText)({
      self: r,
      t: "暂无人点赞",
      size: 14,
      pos: [207, 511],
      type: "btn",
      color: "rgba(255,255,255,0.6)"
    });
    var d = i.propsData.property_list || [];
    if (0 == d.length) (0, e.drawText)({
      self: r,
      t: "暂无道具",
      size: 14,
      pos: [207, 577],
      type: "btn",
      color: "rgba(255,255,255,0.6)"
    });else {
      (0, e.drawImageCenter)({
        self: r,
        src: "res/2d/profile_prop_icon.png",
        pos: [54, 576, 16, 24],
        type: "btn",
        imgid: r.imgid.btn
      }), (g = d.length) > 6 && (g = 5, (0, e.drawImageCenter)({
        self: r,
        src: "res/2d/profile_prop.png",
        pos: [258, 576, 24, 24],
        type: "btn",
        imgid: r.imgid.btn
      }));
      for (var f = 0; f < g; f++) (0, e.drawImageCenter)({
        self: r,
        src: "res/2d/target.png",
        pos: [88 + 34 * f, 576, 24, 24],
        type: "btn",
        imgid: r.imgid.btn
      });
      (0, e.drawText)({
        self: r,
        t: "共 " + d.length + " 个道具",
        size: 14,
        pos: [364, 576],
        type: "btn",
        align: "right"
      });
    }
  } else t.clearRect((0, e.cx)(48), (0, e.cy)(455), (0, e.cwh)(100), (0, e.cwh)(20)), (0, e.drawText)({
    self: r,
    t: "还差" + (i.praise_info.reward_count - i.praise_info.praise_count) + "个好友的赞",
    size: 12,
    pos: [50, 465],
    type: "btn",
    align: "left"
  });
  var b = "res/2d/like.png";
  i.praise_info.is_already_praise && (b = "res/2d/like1.png"), (0, e.drawImageCenter)({
    self: r,
    src: b,
    pos: [354, 671, 82, 76],
    type: "btn",
    imgid: r.imgid.btn
  });
}
