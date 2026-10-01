// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawFriendRankList = function (e) {
  var r = e.self,
    i = r.last2CanvasType;
  (0, t.routeCanvas)(r, "friendRank"), r.lastCanvasType == t.CANVASTYPE.record && (r.lastCanvasType = i);
  r.myUserInfo = n.default.getMyUserInfo() || {}, r.myUserInfo.week_best_score = r.opt.week_best_score || 0, l(r);
}, exports.drawGroupRankList = function (e, n, r) {
  (0, t.routeCanvas)(e, "groupRank"), e.myUserInfo = r || {
    headimg: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJBaI5ibAEtVLsv4KfFrRhad6VWuvvibKOkib8ibibWxsOFXWEUlhp3fo0NAwticZFicevpx1A/0?wx_fmt=png",
    nickname: "",
    week_best_score: 0,
    grade: 1
  }, function (e, n, r) {
    (0, t.createPlane)(e), (0, t.updateClip)({
      self: e
    }), d({
      self: e
    }), r ? (f({
      self: e
    }), c({
      self: e,
      list: n
    })) : (0, a.getAuthWxFriendInteraction)().then(function () {
      f({
        self: e
      }), c({
        self: e,
        list: n
      });
    }).catch(function () {
      !function (e) {
        (0, t.drawImageCenter)({
          self: e,
          src: "res/auth/rank_tip.png",
          pos: [205, 305, 254, 24],
          type: "bg",
          imgid: e.imgid.bg
        }), (0, t.drawImageCenter)({
          self: e,
          src: "res/auth/refresh.png",
          pos: [205, 340, 45, 18],
          type: "bg",
          imgid: e.imgid.bg
        });
      }();
    });
  }(e, n);
}, exports.drawRankList = p, exports.friendRankEve = function (e, n, r, i) {
  if (console.log(n, r), n > 230 && n < 340 && r > 640 && r < 720) {
    if (o.inQQ) return;
    return e.options.onGroupShare && e.options.onGroupShare(), !1;
  }
  if (n > 30 && n < 95 && r > 640 && r < 720) return (0, t.back)(e), e.options.friendRankReturn && e.options.friendRankReturn(""), !1;
  if (n > 30 && n < 379 && r > 140 && r < 518 && e.sotedRankList && a.scope.WxFriendInteraction) {
    var s = Math.round((i - 171) / t.ListLineHeight);
    return e.opt.onProfile && e.sotedRankList[s] && e.opt.onProfile({
      user_data: e.sotedRankList[s],
      scene: "friends",
      routesArr: e.routesArr
    }), !1;
  }
  if (n > 30 && n < 379 && r > 528 && r < 618 && e.sotedRankList && a.scope.WxFriendInteraction) return e.opt.onProfile && e.sotedRankList[e.myidx - 1] && e.opt.onProfile({
    user_data: e.sotedRankList[e.myidx - 1],
    scene: "friends",
    routesArr: e.routesArr
  }), !1;
  n > 80 && n < 320 && r > 300 && r < 360 && !a.scope.WxFriendInteraction && (0, a.getAuthWxFriendInteraction)(!1).then(function () {
    l(e, !0);
  });
}, exports.groupRankEve = function (e, n, r) {
  if (n > 260 && n < 390 && r > 640 && r < 720) return (0, t.hide)(e), e.options.groupPlayGame && e.options.groupPlayGame(), !1;
  if (n > 30 && n < 110 && r > 640 && r < 720) return i.default.emitSync(s.EVENT.GOSTARTPAGE, {}), !1;
  n > 80 && n < 320 && r > 300 && r < 360 && !a.scope.WxFriendInteraction && console.log("点击刷新");
};
var t = require("./base"),
  n = e(require("../../store/storage")),
  r = e(require("../../scroll/scrollHandler")),
  i = e(require("../../lib/mue/eventcenter")),
  s = require("../../config"),
  a = require("../../network/getAuth"),
  o = require("../../util/common");
function l(e, r) {
  (0, t.createPlane)(e), (0, t.updateClip)({
    self: e
  }), d({
    self: e
  }), f({
    self: e
  }), c({
    self: e,
    list: n.default.getFriendsScore()
  });
}
function d(e) {
  var n = e.self;
  n.imgid.bg++, n.imgid.btn++;
  var r = n.context.btn;
  r.clearRect(0, 0, t.WIDTH, t.HEIGHT), r.lineWidth = 1 * t.Dpr, r.strokeStyle = "rgba(255,255,255,0.1)", (0, t.roundedRect)((0, t.cx)(30), (0, t.cy)(126), (0, t.cwh)(354), (0, t.cwh)(392), 2 * t.Dpr, r);
  var i = n.context.bg;
  i.clearRect(0, 0, t.WIDTH, t.HEIGHT), i.fillStyle = "rgba(0,0,0, 0.45)", i.fillRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawText)({
    self: n,
    size: 22,
    t: n.canvasType == t.CANVASTYPE.groupRank ? "群排行榜" : "好友排行榜",
    pos: [207, 89],
    bold: !0,
    type: "btn"
  }), (0, t.updatePlane)({
    self: n,
    type: "bg"
  }), (0, t.drawImageCenter)({
    round: !0,
    radius: 2 * t.Dpr,
    self: n,
    src: "res/bl3.png",
    pos: [207, 322, 354, 392],
    type: "bg",
    imgid: n.imgid.bg,
    cb: function () {
      (0, t.drawText)({
        self: n,
        size: 12,
        t: "每周一凌晨刷新",
        pos: [54, 141],
        type: "btn",
        color: "rgba(255,255,255,0.6)",
        align: "left"
      }), r.strokeStyle = "rgba(255,255,255,0.06)";
    }
  }), n.canvasType == t.CANVASTYPE.friendRank ? o.inQQ || (0, t.drawImageCenter)({
    self: n,
    src: "res/2d/see_group.png",
    pos: [304, 674, 176, 75],
    type: "btn",
    imgid: n.imgid.btn
  }) : (0, t.drawImageCenter)({
    self: n,
    src: "res/2d/iplay.png",
    pos: [327, 670, 130, 75],
    type: "btn",
    imgid: n.imgid.btn,
    cb: function () {
      (0, t.drawText)({
        self: n,
        size: 17,
        t: "我也要玩",
        color: "#222",
        pos: [327, 670],
        type: "btn"
      }), (0, t.updatePlane)({
        self: n,
        type: "btn"
      });
    }
  }), (0, t.drawImageCenter)({
    self: n,
    src: "res/2d/new_return.png",
    pos: [54, 674, 70, 70],
    type: "btn",
    imgid: n.imgid.btn
  });
}
function f(e) {
  var n = e.self;
  (0, t.drawImageCenter)({
    round: !0,
    self: n,
    src: "res/bl3.png",
    pos: [207, 573, 354, 90],
    type: "btn",
    imgid: n.imgid.btn,
    radius: 2 * t.Dpr,
    cb: function () {
      void 0 === n.myidx || (0, t.drawText)({
        self: n,
        size: 17,
        italic: !0,
        bold: !0,
        t: n.myidx,
        pos: [64, 574],
        type: "btn"
      }), (0, t.drawImageCenter)({
        round: !0,
        self: n,
        src: n.myUserInfo.headimg,
        pos: [107, 573, 34, 34],
        type: "btn",
        cb: function () {
          (0, t.drawImageCenter)({
            self: n,
            src: "res/ava_rank.png",
            pos: [107, 573, 36, 36],
            type: "btn",
            imgid: n.imgid.btn
          });
        },
        imgid: n.imgid.btn,
        noupdate: !0
      }), (0, t.drawText)({
        self: n,
        align: "left",
        size: 17,
        t: (0, t.cname)(n.myUserInfo.nickname, 16),
        pos: [144, 573],
        type: "btn"
      }), (0, t.drawText)({
        self: n,
        align: "right",
        size: 22,
        special: !0,
        t: n.myUserInfo.week_best_score || 0,
        pos: [339, 575],
        type: "btn"
      }), n.myUserInfo.bottle_skin && (0, t.drawImageCenter)({
        self: n,
        src: n.myUserInfo.bottle_skin,
        pos: [362, 571, 15, 30],
        type: "btn",
        imgid: n.imgid.btn
      }), (0, t.updatePlane)({
        self: n,
        type: "btn"
      });
    }
  });
}
function c(e) {
  var n = e.self,
    i = e.list,
    s = [];
  n.myUserInfo = n.myUserInfo || {
    headimg: "",
    nickname: "",
    week_best_score: 0,
    score_info: [{
      score: 0
    }]
  }, n.myUserInfo.is_self = !0, (i = i || []).push(n.myUserInfo), s = (0, t.rerank)(i), n.sotedRankList = s;
  var a,
    o = n.sotedRankList.length * (0, t.cwh)(t.ListLineHeight) / t.Dpr;
  n.myidx = s.findIndex(t.findSelfIndex.bind(n)) + 1, a = (0, t.cwh)(361) / t.Dpr;
  var l = 0,
    d = 0,
    f = 0;
  console.log(n.routesArr, n.lastScrollY), n.setScroll && (l = n.lastScrollY || 0, d = n.lastOffset1 || 0, f = n.lastOffset2 || 0), n.setScroll = !1, n.scrollHandler = new r.default({
    innerOffsetHeight: o,
    outterOffsetHeight: a,
    updatePosition: n.updatePosition.bind(n),
    position: l
  }), p(n, d, "list1"), p(n, f, "list2");
}
function p(e, n, r) {
  "list1" == r ? (e.imgid.list1++, e.lastOffset1 = n) : "list2" == r && (e.imgid.list2++, e.lastOffset2 = n);
  var i = e.sotedRankList.slice(n, n + 12),
    s = e.context[r];
  if (s.clearRect(0, 0, t.WIDTH, 12 * (0, t.cwh)(t.ListLineHeight)), 0 == n || 0 != i.length) {
    if (!(n < 0)) {
      for (var a, o, l = i.length, d = function () {
          f % 2 == 1 && (s.fillStyle = "rgba(255,255,255, 0.03)", s.fillRect(0, f * (0, t.cwh)(t.ListLineHeight), (0, t.cwh)(414), (0, t.cwh)(t.ListLineHeight)));
          var l = (f + .5) * t.ListLineHeight;
          s.textAlign = "center", o = "", o = 1 == (a = f + 1 + n) ? "rgb(250,126,0)" : 2 == a ? "rgb(254,193,30)" : 3 == a ? "rgb(251,212,19)" : "#aaa", (0, t.drawText)({
            self: e,
            color: o,
            size: 17,
            italic: !0,
            bold: !0,
            t: a,
            pos: [58.5, l],
            type: r
          });
          i[f].grade;
          s.beginPath(), s.strokeStyle = "rgba(255,255,255, 0.1)", s.fillStyle = "rgba(255,255,255, 0.1)", (0, t.roundedRect)((0, t.cx)(90), (0, t.cwh)(l - 17), (0, t.cwh)(34), (0, t.cwh)(34), 4 * t.Dpr, s), s.fill(), s.closePath(), (0, t.drawImageCenter)({
            round: !0,
            self: e,
            src: i[f].headimg,
            pos: [107, l, 34, 34],
            type: r,
            cb: function () {
              (0, t.drawImageCenter)({
                self: e,
                src: "res/ava_rank.png",
                pos: [107, l, 47, 47],
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
            t: (0, t.cname)(i[f].nickname, 12),
            pos: [144, l],
            type: r
          }), 0, i[f].bottle_skin && (0, t.drawImageCenter)({
            self: e,
            src: i[f].bottle_skin,
            pos: [362, l, 15, 30],
            type: r,
            imgid: e.imgid[r]
          }), 23, (0, t.drawText)({
            self: e,
            align: "right",
            size: 22,
            special: !0,
            t: i[f].week_best_score || 0,
            pos: [339, l + 2],
            type: r
          });
        }, f = 0; f < l; f++) d();
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
