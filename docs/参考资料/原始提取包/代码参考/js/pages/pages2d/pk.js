// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawPkList = g, exports.drawPkPage = function (e) {
  return a.apply(this, arguments);
}, exports.drawPkRulePage = function (e) {
  console.log("!!! drawPkRulePage", e);
  var t = e.self,
    r = t.opt;
  (0, o.routeCanvas)(t, "pkRule"), (0, o.createPlane)(t), (0, o.updateClip)({
    self: t
  });
  var i = t.context.bg;
  i.clearRect(0, 0, o.WIDTH, o.HEIGHT), i.fillStyle = "rgba(0,0,0, 0.8)", i.fillRect(0, 0, o.WIDTH, o.HEIGHT), i.fillStyle = "#3B3A3B", i.fillRect((0, o.cx)(31), (0, o.cy)(105), (0, o.cwh)(354), (0, o.cwh)(489)), i.lineWidth = 2 * o.Dpr, i.strokeStyle = "#fff", (0, o.roundedRect)((0, o.cx)(30), (0, o.cy)(104), (0, o.cwh)(354), (0, o.cwh)(489), 1 * o.Dpr, i), (0, o.drawText)({
    self: t,
    t: "擂台挑战赛",
    color: "rgba(255,255,255,1)",
    size: 19,
    pos: [207, 149.5],
    bold: !0
  });
  var n = s.default.getMyUserInfo();
  return console.log("!!! myUserInfo", n), (0, o.drawImageCenter)({
    self: t,
    src: n.headimg,
    pos: [207, 223, 56, 56],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, o.drawText)({
    self: t,
    t: "我的得分",
    color: "rgba(255,255,255,0.9)",
    size: 14,
    pos: [207, 277]
  }), (0, o.drawText)({
    self: t,
    t: (null == r ? void 0 : r.score) || 0,
    color: "rgba(255,255,255,0.9)",
    size: 56,
    pos: [207, 331],
    special: !0
  }), (0, o.drawText)({
    self: t,
    t: "你将以擂主身份，向朋友发起挑战",
    color: "rgba(255,255,255,0.9)",
    size: 16,
    pos: [207, 387]
  }), (0, o.drawText)({
    self: t,
    t: "挑战赛时长：".concat((null == r ? void 0 : r.duration) || 30, "分钟"),
    color: "rgba(255,255,255,0.9)",
    size: 14,
    pos: [197.5, 469.5]
  }), (0, o.drawImageCenter)({
    self: t,
    src: "res/r_arr.png",
    pos: [276, 469, 6.5, 12.5],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, o.drawImageCenter)({
    self: t,
    src: "res/btn_back.png",
    pos: [53.5, 630.5, 43, 43],
    type: "bg",
    imgid: t.imgid.bg
  }), void (0, o.updatePlane)({
    self: t,
    type: "bg"
  });
}, exports.pkEve = function (e, t, r) {
  return f.apply(this, arguments);
}, exports.pkRuleEve = function (e, t, r) {
  if (t > 131 && t < 281 && r > 503 && r < 551) return console.log("发起挑战"), e.options.onClickShare && e.options.onClickShare(!0), !1;
  if (t > 32 && t < 75 && r > 609 && r < 652) return console.log("关闭挑战规则页"), e.options.onClosePkRule && e.options.onClosePkRule(), !1;
  if (t > 133 && t < 279 && r > 459 && r < 479) return console.log("设置挑战赛时间"), e.options.onClickSetPkDuration && e.options.onClickSetPkDuration(), !1;
};
var t = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  o = require("./base"),
  s = e(require("../../store/storage")),
  i = e(require("../../scroll/scrollHandler")),
  n = require("../../config"),
  l = e(require("../../lib/mue/eventcenter"));
function a() {
  return (a = r(t().mark(function e(r) {
    var i, l, a, g, f, d, u, b, w, m, x, y;
    return t().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return i = r.self, console.log("!!! drawPkPage", i.opt, i.options), (0, o.routeCanvas)(i, "pk"), (0, o.createPlane)(i), (0, o.updateClip)({
            self: i
          }), i.myidx = i.opt.pkListInfo.findIndex(p) + 1, i.myUserInfo = i.opt.pkListInfo[i.myidx - 1] || s.default.getMyUserInfo() || {
            headimg: "",
            nickname: "",
            week_best_score: 0,
            score_info: [{
              score: 0
            }]
          }, c({
            self: i,
            list: i.opt.pkListInfo
          }), (l = i.context.bg).clearRect(0, 0, o.WIDTH, o.HEIGHT), l.fillStyle = "rgba(0,0,0, 0.8)", l.fillRect(0, 0, o.WIDTH, o.HEIGHT), l.fillStyle = "rgb(250,250,250)", l.fillRect((0, o.cx)(31), (0, o.cy)(103), (0, o.cwh)(354), (0, o.cwh)(335)), l.lineWidth = 2 * o.Dpr, l.strokeStyle = "#fff", (0, o.roundedRect)((0, o.cx)(30), (0, o.cy)(102), (0, o.cwh)(354), (0, o.cwh)(530), 1 * o.Dpr, l), null == i.opt.gg_score ? ((0, o.drawImageCenter)({
            self: i,
            src: i.opt.organizerInfo.headimg,
            pos: [207, 158, 50, 50],
            type: "bg",
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            t: i.opt.organizerInfo.nickname,
            color: "rgba(0,0,0,0.8)",
            size: 14,
            pos: [207, 195]
          }), (0, o.drawText)({
            self: i,
            t: "擂主得分",
            color: "rgba(0,0,0,0.8)",
            size: 14,
            pos: [207, 242]
          }), (0, o.drawLine)(160, 217, 254, 217, "rgba(0,0,0,0.06)", .5, l), l.fillStyle = "rgba(0,0,0,0.2)", l.fillRect((0, o.cx)(162), (0, o.cy)(239), (0, o.cwh)(9), (0, o.cwh)(3)), l.fillRect((0, o.cx)(162), (0, o.cy)(244), (0, o.cwh)(9), (0, o.cwh)(3)), l.fillRect((0, o.cx)(241), (0, o.cy)(239), (0, o.cwh)(9), (0, o.cwh)(3)), l.fillRect((0, o.cx)(241), (0, o.cy)(244), (0, o.cwh)(9), (0, o.cwh)(3)), (0, o.drawText)({
            self: i,
            t: i.opt.organizerInfo.score_info[0].score,
            color: "#000",
            size: 66,
            pos: [207, 298],
            special: !0
          })) : (i.opt.gg_score > i.opt.organizerInfo.score_info[0].score ? (a = "res/suc.png", g = "挑战成功", f = "rgba(0,0,0,1)", d = "rgba(0,0,0,0.3)", (0, o.drawImageCenter)({
            self: i,
            src: "res/flower_small.png",
            pos: [207, 175, 140, 53],
            type: "bg",
            imgis: i.imgid.bg
          })) : (a = "res/fail.png", g = "挑战失败", f = "rgba(0,0,0,0.3)", d = "rgba(0,0,0,1)"), (0, o.drawImageCenter)({
            self: i,
            src: a,
            pos: [207, 135, 20, 15],
            type: "bg",
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            color: "#000",
            bold: !0,
            size: 30,
            t: g,
            pos: [207, 178]
          }), (0, o.drawImageCenter)({
            self: i,
            src: i.myUserInfo.headimg,
            pos: [158, 289, 26, 26],
            type: "bg",
            imgid: i.imgid.bg
          }), (0, o.drawImageCenter)({
            self: i,
            src: i.opt.organizerInfo.headimg,
            pos: [260, 289, 26, 26],
            type: "bg",
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            color: "rgba(0,0,0,0.8)",
            size: 11,
            t: (0, o.cname)(i.myUserInfo.nickname),
            pos: [158, 318]
          }), (0, o.drawText)({
            self: i,
            color: "rgba(0,0,0,0.8)",
            size: 11,
            t: (0, o.cname)(i.opt.organizerInfo.nickname),
            pos: [260, 318]
          }), i.opt.gg_score > 999 ? (0, o.drawText)({
            self: i,
            color: f,
            size: 44,
            special: !0,
            t: i.opt.gg_score,
            align: "right",
            pos: [190, 253]
          }) : (0, o.drawText)({
            self: i,
            color: f,
            size: 44,
            special: !0,
            t: i.opt.gg_score,
            align: "center",
            pos: [158, 253]
          }), l.fillStyle = "rgba(0,0,0,0.3)", l.fillRect((0, o.cx)(202), (0, o.cy)(242), (0, o.cwh)(10), (0, o.cwh)(4)), i.opt.organizerInfo.score_info[0].score > 999 ? (0, o.drawText)({
            self: i,
            color: d,
            size: 44,
            special: !0,
            t: i.opt.organizerInfo.score_info[0].score,
            align: "left",
            pos: [231, 253]
          }) : (0, o.drawText)({
            self: i,
            color: d,
            size: 44,
            special: !0,
            t: i.opt.organizerInfo.score_info[0].score,
            pos: [260, 253]
          })), (0, o.drawLine)(30, 437, 384, 437, "rgba(0,0,0,0.06)", .5, l), i.opt.organizerInfo.left_time <= 0 ? ((0, o.drawImageCenter)({
            self: i,
            src: "res/btn_bg_h.png",
            pos: [207, 368, 130, 63],
            type: "bg",
            cb: function () {
              (0, o.drawText)({
                self: i,
                size: 14,
                color: "rgba(0,0,0,0.3)",
                t: "挑战结束",
                pos: [207, 368]
              }), (0, o.updatePlane)({
                self: i,
                type: "bg"
              });
            },
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            size: 14,
            color: "#888",
            t: "已失效",
            pos: [207, 403.5]
          })) : 0 == i.opt.organizerInfo.is_self ? (u = "挑战", i.myidx > 0 && (u = "再次挑战"), (0, o.drawImageCenter)({
            self: i,
            src: "res/btn_bg_g.png",
            pos: [207, 368, 130, 63],
            type: "bg",
            cb: function () {
              (0, o.drawText)({
                self: i,
                size: 14,
                t: u,
                pos: [207, 368]
              }), (0, o.updatePlane)({
                self: i,
                type: "bg"
              });
            },
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            size: 12,
            align: "right",
            color: "#000",
            t: "有效时间至",
            pos: [223, 403.5]
          }), b = +new Date(), w = b + 1e3 * i.opt.organizerInfo.left_time, b = new Date(w), m = (m = b.getHours()) < 10 ? "0" + m : m, x = (x = b.getMinutes()) < 10 ? "0" + x : x, (0, o.drawText)({
            self: i,
            size: 12,
            align: "left",
            color: "#fc4814",
            t: m + ":" + x,
            pos: [225, 403.5]
          })) : 1 == i.opt.organizerInfo.is_self && ((0, o.drawImageCenter)({
            self: i,
            src: "res/btn_bg_g.png",
            pos: [207, 368, 130, 63],
            type: "bg",
            cb: function () {
              (0, o.drawText)({
                self: i,
                size: 14,
                t: "分享",
                pos: [207, 368]
              }), (0, o.updatePlane)({
                self: i,
                type: "bg"
              });
            },
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            size: 14,
            align: "right",
            color: "#000",
            t: "有效时间至",
            pos: [223, 403.5]
          }), b = +new Date(), w = b + 1e3 * i.opt.organizerInfo.left_time, b = new Date(w), m = (m = b.getHours()) < 10 ? "0" + m : m, x = (x = b.getMinutes()) < 10 ? "0" + x : x, (0, o.drawText)({
            self: i,
            size: 14,
            align: "left",
            color: "#fc4814",
            t: m + ":" + x,
            pos: [225, 403.5]
          })), e.next = 1, (0, n.getSetting)();
        case 1:
          return y = e.sent, 1 === i.opt.organizerInfo.is_self || i.opt.pkListInfo && i.opt.pkListInfo.some(function (e) {
            return 1 === e.is_self;
          }) ? (console.log("!!! drawPkPage setting.subscriptionsSetting", y.subscriptionsSetting), wx.getStorageSync(i.model.getPkId()) && wx.getStorageSync(i.model.getPkId()) !== n.SUBSCRIPTION_SETTING_TYPE.REJECT || 1 !== i.opt.organizerInfo.is_self ? (0, o.drawText)({
            self: i,
            size: 17,
            t: "回到首页",
            pos: [207, 688]
          }) : ((0, o.drawImageCenter)({
            self: i,
            src: "res/ring.png",
            pos: [94, 688, 20, 20],
            type: "bg",
            imgid: i.imgid.bg
          }), (0, o.drawText)({
            self: i,
            size: 17,
            t: "被超过时提醒我",
            pos: [167.5, 688]
          }), (0, o.drawLine)(244, 680, 244, 694, "rgba(255,255,255,1)", .5, l), (0, o.drawText)({
            self: i,
            size: 17,
            t: "回到首页",
            pos: [295, 688]
          }))) : ((0, o.drawText)({
            self: i,
            size: 17,
            t: "不挑战，直接开始",
            pos: [199, 688]
          }), (0, o.drawImageCenter)({
            self: i,
            src: "res/r_arr.png",
            pos: [280, 688, 6.5, 12.5],
            type: "bg",
            imgid: i.imgid.bg
          })), (0, o.updatePlane)({
            self: i,
            type: "bg"
          }), e.abrupt("return");
        case 2:
        case "end":
          return e.stop();
      }
    }, e);
  }))).apply(this, arguments);
}
function c(e) {
  var t = e.self;
  e.list;
  t.sotedRankList = e.list;
  var r = t.sotedRankList.length * (0, o.cwh)(o.ListLineHeight) / o.Dpr,
    s = (0, o.cwh)(194) / o.Dpr;
  t.scrollHandler = new i.default({
    innerOffsetHeight: r,
    outterOffsetHeight: s,
    updatePosition: t.updatePosition.bind(t)
  }), g(t, 0, "list1");
}
function g(e, t, r) {
  "list1" == r ? e.imgid.list1++ : "list2" == r && e.imgid.list2++;
  var s = e.sotedRankList.slice(t, t + 12),
    i = e.context[r];
  if (i.clearRect(0, 0, o.WIDTH, 12 * (0, o.cwh)(o.ListLineHeight)), i.fillStyle = "white", i.textBaseline = "middle", i.fillRect(0, 0, o.WIDTH, 12 * (0, o.cwh)(o.ListLineHeight)), 0 == t || 0 != s.length) {
    if (!(t < 0)) {
      for (var n = s.length, l = function () {
          var i = (a + .5) * o.ListLineHeight,
            n = a + 1 + t,
            l = "";
          l = 1 == n ? "rgb(250,126,0)" : 2 == n ? "rgb(254,193,30)" : 3 == n ? "rgb(251,212,19)" : "#aaa", (0, o.drawText)({
            self: e,
            bold: !0,
            italic: !0,
            size: 17,
            t: n,
            pos: [58.5, i],
            type: r,
            color: l
          });
          s[a].grade;
          (0, o.drawImageCenter)({
            self: e,
            src: s[a].headimg,
            pos: [107, i, 34, 34],
            type: r,
            cb: function () {
              (0, o.drawImageCenter)({
                self: e,
                src: "res/2d/ava_square.png",
                pos: [107, i, 37, 37],
                type: r,
                imgid: e.imgid[r]
              });
            },
            round: !0,
            imgid: e.imgid[r],
            noupdate: !0
          }), (0, o.drawText)({
            self: e,
            align: "left",
            color: "#000",
            size: 17,
            bold: !0,
            t: (0, o.cname)(s[a].nickname, 14),
            pos: [144, i - 10],
            type: r
          }), s[a].score_info[0].score > e.opt.organizerInfo.score_info[0].score ? (0, o.drawText)({
            self: e,
            color: "#FC4814",
            size: 12,
            t: "挑战成功",
            pos: [144, i + 12],
            type: r,
            align: "left"
          }) : (0, o.drawText)({
            self: e,
            color: "#888",
            size: 12,
            t: "挑战失败",
            pos: [144, i + 12],
            type: r,
            align: "left"
          }), (0, o.drawText)({
            self: e,
            color: "#888",
            size: 22,
            special: !0,
            t: s[a].score_info[0].score || 0,
            pos: [364, i],
            type: r,
            align: "right"
          });
        }, a = 0; a < n; a++) l();
      0 == n && (0, o.drawText)({
        self: e,
        color: "#ccc",
        size: 14,
        t: "暂无人应战",
        pos: [207, 100],
        type: r
      }), (0, o.updatePlane)({
        self: e,
        type: r
      });
    }
  } else (0, o.updatePlane)({
    self: e,
    type: r
  });
}
function p(e, t, r) {
  return 1 === e.is_self;
}
function f() {
  return (f = r(t().mark(function e(r, o, s) {
    return t().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return console.log("!!! pkEve", r, r.opt, r.options, o, s), e.next = 1, (0, n.getSetting)();
        case 1:
          if (e.sent, !(1 === r.opt.organizerInfo.is_self || r.opt.pkListInfo && r.opt.pkListInfo.some(function (e) {
            return 1 === e.is_self;
          }))) {
            e.next = 6;
            break;
          }
          if (!(wx.getStorageSync(r.model.getPkId()) && wx.getStorageSync(r.model.getPkId()) !== n.SUBSCRIPTION_SETTING_TYPE.REJECT || 1 !== r.opt.organizerInfo.is_self)) {
            e.next = 3;
            break;
          }
          if (!(o > 173 && o < 241 && s > 650 && s < 730)) {
            e.next = 2;
            break;
          }
          return console.log("回到首页"), l.default.emitSync(n.EVENT.GOSTARTPAGE, {}), e.abrupt("return", !1);
        case 2:
          e.next = 5;
          break;
        case 3:
          if (!(o > 77 && o < 220 && s > 650 && s < 730)) {
            e.next = 4;
            break;
          }
          return console.log("被超过时提醒我"), r.options.onSubscribePk && r.options.onSubscribePk(), e.abrupt("return", !1);
        case 4:
          if (!(o > 261 && o < 329 && s > 650 && s < 730)) {
            e.next = 5;
            break;
          }
          return console.log("回到首页"), l.default.emitSync(n.EVENT.GOSTARTPAGE, {}), e.abrupt("return", !1);
        case 5:
          e.next = 7;
          break;
        case 6:
          if (!(o > 110 && o < 310 && s > 650 && s < 730)) {
            e.next = 7;
            break;
          }
          return console.log("不挑战 直接开始"), r.options.onBattlePlay && r.options.onBattlePlay(""), e.abrupt("return", !1);
        case 7:
          if (!(o > 140 && o < 280 && s > 325 && s < 405 && r.opt.organizerInfo.left_time > 0)) {
            e.next = 9;
            break;
          }
          if (0 != r.opt.organizerInfo.is_self) {
            e.next = 8;
            break;
          }
          return console.log("挑战/再次挑战"), r.options.onBattlePlay && r.options.onBattlePlay("pk"), e.abrupt("return", !1);
        case 8:
          if (1 != r.opt.organizerInfo.is_self) {
            e.next = 9;
            break;
          }
          return console.log("分享"), r.options.onClickShare && r.options.onClickShare(!1), e.abrupt("return", !1);
        case 9:
        case "end":
          return e.stop();
      }
    }, e);
  }))).apply(this, arguments);
}
