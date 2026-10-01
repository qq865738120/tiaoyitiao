// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawGetNewSkin = function (e) {
  e.sunGif = new s.default(-.5, 4, 8.998, 20, 20, "res/2d/sun.png"), e.sunGif.rotate(.002), e.options.camera.add(e.sunGif.obj), (0, t.createPlane)(e), (0, t.routeCanvas)(e, "getNewSkin"), e.imgid.bg++, e.imgid.btn++;
  var r = e.context.btn;
  r.clearRect(0, 0, t.WIDTH, t.HEIGHT), e.context.bg.clearRect(0, 0, t.WIDTH, t.HEIGHT), r.fillStyle = "rgba(0,0,0, 0.45)", r.fillRect(0, 0, t.WIDTH, t.HEIGHT);
  var o = e.opt;
  (0, t.drawImageCenter)({
    self: e,
    src: "res/bl3.png",
    pos: [207, 304.5, 354, 401],
    type: "bg",
    imgid: e.imgid.bg,
    cb: function () {
      (0, t.drawText)({
        self: e,
        size: 12,
        t: o.desc,
        pos: [207, 176],
        type: "btn",
        color: "rgba(255,255,255,0.6)"
      }), function (e) {
        e.lineWidth = 1 * t.Dpr, e.strokeStyle = "#fff", e.fillStyle = "#fff", (0, t.roundedRect)((0, t.cx)(144), (0, t.cy)(96), (0, t.cwh)(126), (0, t.cwh)(44), 4 * t.Dpr, e), e.fill(), e.lineWidth = 1 * t.Dpr, e.strokeStyle = "#555", e.fillStyle = "#555", (0, t.roundedRect)((0, t.cx)(147), (0, t.cy)(99), (0, t.cwh)(120), (0, t.cwh)(38), 2 * t.Dpr, e), e.fill(), e.lineWidth = 1 * t.Dpr, e.strokeStyle = "#D2A764", e.fillStyle = "#D2A764", (0, t.roundedRect)((0, t.cx)(147), (0, t.cy)(99), (0, t.cwh)(120), (0, t.cwh)(36), 2 * t.Dpr, e), e.fill();
      }(r), (0, t.drawText)({
        self: e,
        size: 17,
        t: "获得新皮肤",
        pos: [207, 115],
        bold: !0,
        type: "btn"
      }), (0, t.drawImageCenter)({
        self: e,
        src: o.poster,
        pos: [207, 308, 50, 100],
        type: "btn",
        imgid: e.imgid.btn
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/pure_share.png",
        pos: [207, 456, 18, 24],
        type: "btn",
        imgid: e.imgid.btn
      }), r.strokeStyle = "rgba(255,255,255,0.06)";
    }
  }), (0, t.drawImageCenter)({
    self: e,
    src: "res/2d/new_return.png",
    pos: [54, 674, 70, 70],
    type: "btn",
    imgid: e.imgid.btn
  }), (0, t.drawImageCenter)({
    self: e,
    src: "res/2d/iplay.png",
    pos: [322, 670, 160, 75],
    type: "btn",
    imgid: e.imgid.btn,
    cb: function () {
      (0, t.drawImageCenter)({
        self: e,
        src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJDb9JwwmxHtnUrFjffD8F0VaaNDyic3X9Uy7Vsj4iaw3U2MyLcYv7gUcp0VgZRafjvhA/0?wx_fmt=png",
        pos: [265, 645, 54, 105],
        type: "btn",
        imgid: e.imgid.btn
      }), (0, t.drawText)({
        self: e,
        size: 17,
        t: "分享",
        color: "#222",
        pos: [327, 670],
        type: "btn"
      }), (0, t.updatePlane)({
        self: e,
        type: "btn"
      });
    }
  });
}, exports.drawJiLiAdGetPropPage = function (e) {
  e.sunGif = new s.default(-.5, 4, 8.998, 20, 20, "res/2d/sun.png"), e.sunGif.rotate(.002), e.options.camera.add(e.sunGif.obj), (0, t.routeCanvas)(e, "jiliProp"), (0, t.createPlane)(e), e.imgid.bg++, e.imgid.btn++;
  var r = e.context.bg;
  r.clearRect(0, 0, t.WIDTH, t.HEIGHT), e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), r.fillStyle = "rgba(0,0,0, 0.45)", r.fillRect(0, 0, t.WIDTH, t.HEIGHT), r.lineWidth = 1 * t.Dpr, r.strokeStyle = "rgba(255,255,255,0.06)", (0, t.roundedRect)((0, t.cx)(30), (0, t.cy)(144), (0, t.cwh)(354), (0, t.cwh)(421), 4 * t.Dpr, r), r.strokeStyle = "rgba(255,255,255,0.06)", (0, t.drawImageCenter)({
    round: !0,
    self: e,
    src: "res/bl3.png",
    pos: [207, 354.5, 354, 421],
    type: "bg",
    imgid: e.imgid.bg,
    radius: 4 * t.Dpr,
    cb: function () {
      (0, t.drawImageCenter)({
        self: e,
        src: "res/2d/target.png",
        pos: [207, 314, 96, 96],
        type: "btn",
        imgid: e.imgid.btn
      }), r.lineWidth = 1 * t.Dpr, r.strokeStyle = "#fff", r.fillStyle = "#fff", (0, t.roundedRect)((0, t.cx)(146), (0, t.cy)(128), (0, t.cwh)(122), (0, t.cwh)(40), 4 * t.Dpr, r), r.fill(), r.lineWidth = 1 * t.Dpr, r.strokeStyle = "#999", r.fillStyle = "#999", (0, t.roundedRect)((0, t.cx)(149), (0, t.cy)(131), (0, t.cwh)(116), (0, t.cwh)(34), 2 * t.Dpr, r), r.fill(), r.lineWidth = 1 * t.Dpr, r.strokeStyle = "#D2A764", r.fillStyle = "#D2A764", (0, t.roundedRect)((0, t.cx)(149), (0, t.cy)(131), (0, t.cwh)(116), (0, t.cwh)(32), 2 * t.Dpr, r), r.fill(), (0, t.drawText)({
        self: e,
        size: 17,
        t: "获得道具",
        pos: [207, 147]
      }), (0, t.drawText)({
        self: e,
        size: 14,
        t: "在游戏中使用本道具可自动完",
        pos: [207, 453],
        color: "rgba(255,255,255,0.8)"
      }), (0, t.drawText)({
        self: e,
        size: 14,
        t: "成一次完美的跳跃",
        pos: [207, 475],
        color: "rgba(255,255,255,0.8)"
      });
    }
  }), (0, t.drawImageCenter)({
    self: e,
    src: "res/2d/new_return.png",
    pos: [54, 674, 70, 70],
    type: "bg",
    imgid: e.imgid.bg
  }), (0, t.updatePlane)({
    self: e,
    type: "bg"
  });
}, exports.drawJiLiAdGetPropPageEve = function (e, t, r) {
  if (t > 42 && t < 110 && r > 640 && r < 720) return e.options.camera.remove(e.sunGif.obj), e.sunGif.destroy(), e.opt.onReturn && e.opt.onReturn(), !1;
}, exports.gameOverEve = function (e, r, s) {
  console.log("gameOverEve", r, s);
  var a = e.opt.score >= i.REWARD_SCORE && i.CAN_USE_REWARD_CHALLENGE;
  "skin" != e.opt.type && r > 42 && r < 110 && s > e.replayBtnPosy - 50 && s < e.replayBtnPosy + 50 && o.default.emitSync(i.EVENT.GOSTARTPAGE, {});
  if ("tired" != e.opt.type && "skin" != e.opt.type && r > 168 && r < 340 && s > e.replayBtnPosy - 50 && s < e.replayBtnPosy + 50) return (0, t.hide)(e), e.options.onClickReplay && e.options.onClickReplay(), !1;
  if ("tired" == e.opt.type && e.noplay_time <= 0 && r > 207 && r < 360 && s > 540 && s < 660) return e.options.onClickReplay && e.options.onClickReplay(), !1;
  if ("ban" == e.opt.type && 1 == e.opt.banType && r > 150 && r < 260 && s > 430 && s < 500) return (0, n.routeVerify)(e), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && r > 128 && r < 285 && s > 310 && s < 350 && e.opt.score >= i.REWARD_SCORE) return e.options.onClickShare && e.options.onClickShare(!0), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && r > 198 && r < 216 && s > 315.5 && s < 339.5 && e.opt.score < i.REWARD_SCORE) return e.options.onClickPureShare && e.options.onClickPureShare(e.opt.type), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && r > 301 && r < 319 && s > 315.5 && s < 339.5 && e.opt.score >= i.REWARD_SCORE) return e.options.onClickPureShare && e.options.onClickPureShare(e.opt.type), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && e.changlleList.length > 5 && r > 55 && r < 115 && s > 402 && s < 422) return p(e, -1), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && e.changlleList.length > 5 && r > 297 && r < 357 && s > 402 && s < 422) return p(e, 1), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && 0 == e.changlleList.length && r > 31 && r < 384 && s > 406 && s < 453) return e.sunGif && (e.options.camera.remove(e.sunGif.obj), e.sunGif.destroy()), e.options.onClickRank && e.options.onClickRank(), !1;
  if (("week" == e.opt.type || "history" == e.opt.type || "skin" == e.opt.type) && e.changlleList.length > 0 && r > 31 && r < 384 && s > 483 && s < 530) return e.sunGif && (e.options.camera.remove(e.sunGif.obj), e.sunGif.destroy()), e.options.onClickRank && e.options.onClickRank(), !1;
  if ("gg" == e.opt.type && r > 25 && r < 385 && s > 290 && s < 490) return e.options.onClickRank && e.options.onClickRank(), !1;
  if ("skin" == e.opt.type && r > 150 && r < 260 && s < 720 && s > 500) return e.sunGif && (e.options.camera.remove(e.sunGif.obj), e.sunGif.destroy()), e.opt.onClickBottleSkin && e.opt.onClickBottleSkin(), !1;
  if ("gg" == e.opt.type && e.opt.advertise && r > 250 && r < 325 && s > 155 && s < 195) return wx.openUrl && wx.openUrl({
    url: e.opt.advertise.url
  }), o.default.emit(i.EVENT.JUMP_AD_GG, {}), !1;
  if ("gg" == e.opt.type && r > 198 && r < 216 && s > 206 && s < 230) return e.options.onClickPureShare && e.options.onClickPureShare("shareBattle"), !1;
  if ("gg" == e.opt.type && r > 301 && r < 319 && s > 228 && s < 254 && a) return e.options.onClickPureShare && e.options.onClickPureShare("shareBattle"), !1;
  if (("gg" == e.opt.type || "tired" == e.opt.type) && r > 139 && r < 275 && s > 199 && s < 260 && e.opt.score < i.REWARD_SCORE) return console.log("!!! onClickShare gg or tired", e.options.onClickPkRule), e.options.onClickShare && e.options.onClickShare(!0), !1;
  if (("gg" == e.opt.type || "tired" == e.opt.type) && r > 128 && r < 286 && s > 199 && s < 260 && e.opt.score >= i.REWARD_SCORE) return console.log("!!! onClickShare gg or tired", e.options.onClickPkRule), e.options.onClickShare && e.options.onClickShare(!0), !1;
  if ("gg" == e.opt.type && 1 == e.opt.loadAdSuc && r > 25 && r < 385 && s > 511 && s < 531) return e.opt.videoAd.show(), console.log("点击查看激励广告"), !1;
}, exports.getNewSkinEve = function (e, t, r) {
  if (t > 42 && t < 110 && r > 640 && r < 720) return e.options.camera.remove(e.sunGif.obj), e.sunGif.destroy(), e.opt.onReturn && e.opt.onReturn(), !1;
  if (t > 220 && t < 440 && r > 640 && r < 720) return e.opt.onShareGift && e.opt.onShareGift(), !1;
  if (t > 177 && t < 237 && r > 436 && r < 476) return e.opt.onShareSkin && e.opt.onShareSkin(), !1;
}, exports.routeGameOver = function (e, n) {
  (0, t.createPlane)(e);
  var s = e.opt;
  e.myUserInfo = r.default.getMyUserInfo() || {
    headimg: "",
    nickname: "",
    week_best_score: 0,
    score_info: [{
      score: 0
    }]
  }, e.myUserInfo.last_week_best_score = s.week_best_score, e.myUserInfo.week_best_score = Math.max(s.week_best_score, s.score) || 0;
  var l = r.default.getFriendsScore() || [];
  l.push(e.myUserInfo);
  var p = (0, t.rerank)(l);
  if (e.sotedRankList = p, e.myidx = p.findIndex(t.findSelfIndex.bind(e)) + 1, e.changlleList = [], s.score >= s.highest_score || s.score >= e.myUserInfo.last_week_best_score) {
    (r.default.getMyUserInfo() || {
      headimg: "",
      nickname: "",
      week_best_score: 0,
      score_info: [{
        score: 0
      }]
    }).week_best_score = s.score;
    for (var b = r.default.getFriendsScore() || [], h = 0; h < b.length; h++) b[h].week_best_score < s.score && b[h].week_best_score > e.myUserInfo.last_week_best_score && e.changlleList.push(b[h]);
  }
  var w = !1;
  (s.game_cnt > 5 || s.score > 5) && !e._has_show_tired && +new Date() / 1e3 - s.start_time > 1800 && (w = !0, e._has_show_tired = !0);
  (0, t.routeCanvas)(e, "gameOver"), GameGlobal.matchType ? (GameGlobal.matchType = 0, o.default.emitSync(i.EVENT.GOSTARTPAGE, {})) : e.opt.banType ? (e.opt.type = "ban", function (e) {
    e.imgid.bg++;
    var r = e.opt,
      o = e.context.bg;
    y(e, o, Math.max(r.highest_score, r.score)), g(e, r.score, o, 69), f(e), (0, t.drawText)({
      self: e,
      t: "游戏中存在可疑操作，该分数",
      pos: [207, 373],
      size: 17
    }), (0, t.drawText)({
      self: e,
      t: "将不在排行榜中显示",
      pos: [207, 399],
      size: 17
    }), (0, t.drawLine)(0, 296, 414, 296, "rgba(255,255,255,0.1)", .5, o), (0, t.drawLine)(0, 526, 414, 526, "rgba(255,255,255,0.1)", .5, o), 1 == r.banType && ((0, t.drawImageCenter)({
      self: e,
      src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VajbZ52iaZX9Vlib0QAKEJGDIV8F9iaFeqXoawUbQkDP8zc6fbm95nKLgw/0?wx_fmt=png",
      pos: [207, 459, 138, 44],
      type: "bg",
      imgid: e.imgid.bg
    }), (0, t.drawText)({
      self: e,
      t: "我要申诉",
      pos: [207, 459],
      size: 17
    }));
    (0, t.updatePlane)({
      self: e,
      type: "bg"
    });
  }(e)) : s.bottle_skin_icon ? (e.opt.type = "skin", c(e)) : s.score > s.highest_score ? (e.opt.type = "history", c(e)) : s.score > e.myUserInfo.last_week_best_score ? (e.opt.type = "week", c(e)) : w ? (e.opt.type = "tired", function (e) {
    e.imgid.bg++;
    var r = e.opt,
      o = e.context.bg;
    y(e, o, Math.max(r.highest_score, r.score)), (0, t.drawImageCenter)({
      self: e,
      src: "res/2d/new_home.png",
      pos: [76, 607, 74, 74],
      type: "bg",
      imgid: e.imgid.bg
    }), d({
      self: e,
      score: r.score
    }), g(e, r.score, o, 0), o.lineWidth = 4 * t.Dpr, o.strokeStyle = "#fff", o.fillStyle = "#fff", (0, t.roundedRect)((0, t.cx)(31), (0, t.cy)(298), (0, t.cwh)(354), (0, t.cwh)(210), 1 * t.Dpr, o), o.fill(), (0, t.drawText)({
      self: e,
      t: "玩了这么久",
      pos: [80, 370],
      size: 17,
      color: "black",
      align: "left"
    }), (0, t.drawText)({
      self: e,
      t: "休息一下吧",
      pos: [80, 410],
      size: 17,
      color: "black",
      align: "left"
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/tired.png",
      pos: [297, 397, 179, 185],
      type: "bg",
      imgid: e.imgid.bg
    });
    var i = e.context.btn;
    i.clearRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawImageCenter)({
      self: e,
      src: "res/noplay.png",
      pos: [257, 607, 212, 84],
      type: "btn",
      cb: function () {
        e.noplay_time = 5, (0, t.drawText)({
          self: e,
          type: "btn",
          color: "#00C777",
          size: 22,
          t: e.noplay_time,
          pos: [190, 607]
        }), (0, t.updatePlane)({
          self: e,
          type: "btn"
        }), e.timer = setInterval(function () {
          e.noplay_time--, "tired" == e.opt.type ? e.noplay_time <= 0 ? (clearInterval(e.timer), i.clearRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawImageCenter)({
            self: e,
            src: "res/replay.png",
            pos: [257, 607, 212, 84],
            type: "btn",
            imgid: e.imgid.btn
          })) : (i.fillStyle = "white", i.fillRect((0, t.cx)(175), (0, t.cy)(590), (0, t.cwh)(30), (0, t.cwh)(30)), (0, t.drawText)({
            self: e,
            color: "#00C777",
            size: 22,
            t: e.noplay_time,
            pos: [190, 607],
            type: "btn"
          }), (0, t.updatePlane)({
            self: e,
            type: "btn"
          })) : clearInterval(e.timer);
        }, 1e3);
      },
      imgid: e.imgid.btn
    }), (0, t.updatePlane)({
      self: e,
      type: "bg"
    });
  }(e)) : (e.opt.type = "gg", function (e) {
    e.imgid.bg++, e.imgid.btn++;
    var r = e.opt,
      o = r.score >= i.REWARD_SCORE && i.CAN_USE_REWARD_CHALLENGE,
      n = e.context.bg;
    y(e, n, Math.max(r.highest_score, r.score)), r.advertise && r.advertise.score ? (d({
      self: e,
      posy: 244,
      score: r.score
    }), (0, t.drawText)({
      self: e,
      size: 14,
      t: "本次得分",
      pos: [119, 118]
    }), (0, t.drawText)({
      self: e,
      size: 58,
      special: !0,
      t: r.score,
      pos: [119, 166]
    }), (0, t.drawLine)(227, 98, 227, 186, "rgba(255,255,255,0.4)", .5, n), (0, t.drawText)({
      self: e,
      t: "为你助力",
      align: "left",
      size: 17,
      pos: [255, 149]
    }), (0, t.drawText)({
      self: e,
      t: "+ " + r.advertise.score,
      align: "left",
      special: !0,
      size: 17,
      pos: [325, 149]
    }), (0, t.drawText)({
      self: e,
      t: "查看详情",
      align: "left",
      size: 12,
      pos: [256, 175]
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/r_arr.png",
      pos: [315, 175, 6.6, 10],
      type: "bg",
      imgid: e.imgid.bg
    }), (0, t.drawImageCenter)({
      self: e,
      src: r.advertise.icon_url,
      pos: [269, 115, 24, 24],
      type: "bg",
      imgid: e.imgid.bg
    })) : (d({
      self: e,
      score: r.score
    }), g(e, r.score, n, 0));
    if ("gg" === r.type) {
      var s = o ? 310 : 207,
        l = o ? 240.5 : 218;
      (0, t.drawImageCenter)({
        self: e,
        src: "res/pure_share.png",
        pos: [s, l, 18, 24],
        type: "bg",
        imgid: e.imgid.bg
      });
    }
    n.lineWidth = 1 * t.Dpr, n.strokeStyle = "rgba(255,255,255,0.06)", (0, t.roundedRect)((0, t.cx)(30), (0, t.cy)(297), (0, t.cwh)(354), (0, t.cwh)(192), 4 * t.Dpr, n), (0, t.drawImageCenter)({
      round: !0,
      self: e,
      src: "res/bl3.png",
      pos: [207, 393, 354, 192],
      type: "bg",
      imgid: e.imgid.bg,
      radius: 4 * t.Dpr,
      cb: function () {
        (0, t.drawLine)(30, 449, 384, 449, "rgba(255,255,255,0.06)", .5, n), (0, t.drawText)({
          self: e,
          t: "排行榜 · 每周一凌晨刷新",
          color: "rgba(255,255,255,0.6)",
          align: "left",
          size: 12,
          pos: [46, 468]
        }), (0, t.drawText)({
          self: e,
          t: "查看全部排行",
          align: "left",
          size: 12,
          pos: [291, 468]
        }), (0, t.drawImageCenter)({
          self: e,
          src: "res/r_arr.png",
          pos: [371, 468, 6.6, 10],
          type: "bg",
          imgid: e.imgid.bg
        }), (0, a.getAuthWxFriendInteraction)(!1).then(function () {
          n.fillStyle = "rgba(255,255,255,0.06)", n.fillRect((0, t.cx)(150), (0, t.cy)(296), (0, t.cwh)(115), (0, t.cwh)(153));
          var r = e.myidx - 2,
            o = 0;
          1 == e.sotedRankList.length && (o = 1);
          for (var i = function () {
              if (1 == e.myidx && 0 == s && r++, e.myidx == e.sotedRankList.length && 2 == s) return 1;
              var i = "";
              if (i = e.myidx == r + 1 + s ? "#41bf8c" : "#888", e.sotedRankList[r + s]) {
                (0, t.drawText)({
                  self: e,
                  color: i,
                  italic: !0,
                  bold: !0,
                  size: 16,
                  t: r + 1 + s,
                  pos: [90 + 118 * (s + o), 318]
                }), (0, t.drawText)({
                  self: e,
                  color: "#888",
                  t: (0, t.cname)(e.sotedRankList[r + s].nickname, 14),
                  pos: [90 + 118 * (s + o), 394],
                  size: 14
                }), (0, t.drawText)({
                  self: e,
                  size: 22,
                  special: !0,
                  t: e.sotedRankList[r + s].week_best_score || 0,
                  pos: [90 + 118 * (s + o), 426]
                });
                var n = 90 + 118 * (s + o);
                (0, t.drawImageCenter)({
                  self: e,
                  round: !0,
                  src: e.sotedRankList[r + s].headimg,
                  pos: [n, 355, 42, 42],
                  type: "bg",
                  cb: function () {
                    (0, t.drawImageCenter)({
                      self: e,
                      src: "res/ava_rank.png",
                      pos: [n, 355, 58, 58],
                      type: "bg",
                      imgid: e.imgid.bg
                    });
                  },
                  imgid: e.imgid.bg,
                  noupdate: !0
                });
              }
            }, s = 0; s < 3; s++) i();
        }).catch(function () {
          (0, t.drawImageCenter)({
            self: e,
            src: "res/auth/rank_tip.png",
            pos: [205, 355, 254, 24],
            type: "bg",
            imgid: e.imgid.bg
          }), (0, t.drawImageCenter)({
            self: e,
            src: "res/auth/refresh.png",
            pos: [205, 390, 45, 18],
            type: "bg",
            imgid: e.imgid.bg
          });
        });
      }
    }), (0, t.updatePlane)({
      self: e,
      type: "bg"
    }), console.log(e.opt.ad_type, !!wx.createRewardedVideoAd, "reward" == e.opt.ad_type);
    var c = (0, i.getSystemInfo)();
    if (wx.createRewardedVideoAd && "reward" == e.opt.ad_type && ("ios" == c.platform && (0, t.gtAppVersion)("6.7.0") || (0, t.gtVersion)("2.1.2") && "android" == c.platform && (0, t.gtAppVersion)("6.6.7"))) e.opt.videoAd = wx.createIncentiveVideoAd({
      adUnitId: "adunit-d8b47b944fa90908"
    }), e.opt.videoAd ? (e.opt.videoAd.load().then(function () {
      console.log("load reward ad succ"), e.opt.loadAdSuc = !0, e.hasAd = !0, function (e) {
        if (e.canvasType != t.CANVASTYPE.gameOver) return;
        e.context.bg.strokeStyle = "rgba(255,255,255,0.06)", (0, t.drawImageCenter)({
          round: !0,
          self: e,
          src: "res/bl3.png",
          pos: [207, 521, 354, 50],
          type: "bg",
          imgid: e.imgid.bg,
          radius: 4 * t.Dpr,
          cb: function () {
            (0, t.drawText)({
              self: e,
              size: 14,
              t: "看广告拿道具",
              pos: [220, 521]
            }), (0, t.drawImageCenter)({
              self: e,
              src: "res/2d/target.png",
              pos: [154, 521, 24, 24],
              type: "bg",
              imgid: e.imgid.bg
            }), (0, t.drawImageCenter)({
              self: e,
              src: "res/r_arr.png",
              pos: [276, 521, 6.6, 10],
              type: "bg",
              imgid: e.imgid.bg
            });
          }
        });
      }(e), e.opt.onShowRewardAd && e.opt.onShowRewardAd();
    }).catch(function (t) {
      e.opt.loadAdSuc = !1, console.log("reward ad err", t), console.log(t.message);
    }), e.hasAd || e.opt.videoAd.onClose(function (t) {
      (t && t.isEnded || void 0 === t) && (e.opt.loadAdSuc = !1, e.opt.onRewardAdGetProp && e.opt.onRewardAdGetProp());
    }), console.log("load reward ? ")) : console.warn("!!! createRewardedVideoAd fail");else if (wx.createBannerAd && (0, t.gtVersion)("2.0.6")) {
      var p = t.WIDTH / t.Dpr;
      return t.HEIGHT / t.WIDTH < 736 / 414 && (p = Math.max((0, t.cx)(370) / t.Dpr, 300)), e.bannerAd || (e.bannerAd = wx.createBannerAd({
        adUnitId: "adunit-eed18d29ad7e511b",
        style: {
          left: 0,
          top: t.HEIGHT / t.Dpr - 119,
          width: p
        }
      })), void (e.bannerAd ? (e.bannerAd.show(), e.bannerAd.onError(function (t) {
        console.log("banner load err"), f(e);
      }), e.bannerAd.onLoad(function (r) {
        console.log("23333? ", window.innerHeight, window.innerWidth, t.HEIGHT, t.WIDTH, t.HEIGHT / t.WIDTH > 736 / 414), t.HEIGHT / t.WIDTH > 736 / 414 + .5 ? f(e) : f(e, 548), e.opt.onShowBannerAd && e.opt.onShowBannerAd(), console.log("banner ad load succ");
      }), e.bannerAd.onResize(function (r) {
        console.log("on resize", r.width, r.height), e.bannerAd && e.bannerAd.style && (t.HEIGHT / t.WIDTH > 736 / 414 ? e.bannerAd.style.top = t.HEIGHT / t.Dpr - r.height - 20 : e.bannerAd.style.top = t.HEIGHT / t.Dpr - r.height, r.height > 180 ? e.bannerAd.hide() : t.HEIGHT / t.WIDTH < 736 / 414 && (e.bannerAd.style.width = p, e.bannerAd.style.left = (t.WIDTH / t.Dpr - p) / 2));
      })) : console.warn("!!! createBannerAd fail"));
    }
    f(e);
  }(e));
};
var t = require("./base"),
  r = e(require("../../store/storage")),
  o = e(require("../../lib/mue/eventcenter")),
  i = require("../../config"),
  n = require("./verify"),
  s = e(require("../threePage")),
  a = require("../../network/getAuth"),
  l = require("../../util/common");
function c(e) {
  e.imgid.bg++, e.imgid.btn++;
  var r = e.opt,
    o = e.context.bg;
  y(e, o, Math.max(r.highest_score, r.score)), e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), o.lineWidth = 1 * t.Dpr, o.strokeStyle = "rgba(255,255,255,0.06)";
  var n = 426;
  0 == e.changlleList.length && (n = 349), (0, t.roundedRect)((0, t.cx)(30), (0, t.cy)(104), (0, t.cwh)(354), (0, t.cwh)(n), 4 * t.Dpr, o), o.strokeStyle = "rgba(255,255,255,0.06)", (0, t.drawImageCenter)({
    round: !0,
    self: e,
    src: "res/bl3.png",
    pos: [207, 104 + n / 2, 354, n],
    type: "bg",
    imgid: e.imgid.bg,
    radius: 4 * t.Dpr,
    cb: function () {
      !function (e, r) {
        var o = "新纪录",
          i = "#E11212";
        "history" == e.opt.type && (e.opt.highest_score < 100 && e.opt.score >= 100 ? (o = "初窥门径", i = "#509FC9") : e.opt.highest_score < 500 && e.opt.score >= 500 ? (o = "耐得寂寞", i = "#E67600") : e.opt.highest_score < 1e3 && e.opt.score >= 1e3 ? (o = "登堂入室", i = "#009D5E") : e.opt.highest_score < 2e3 && e.opt.score >= 2e3 ? (o = "无聊大师", i = "#7A0096") : e.opt.highest_score < 3e3 && e.opt.score >= 3e3 && (o = "一指禅", i = "#555555"));
        r.lineWidth = 1 * t.Dpr, r.strokeStyle = "#fff", r.fillStyle = "#fff", (0, t.roundedRect)((0, t.cx)(166), (0, t.cy)(88), (0, t.cwh)(82), (0, t.cwh)(32), 4 * t.Dpr, r), r.fill(), r.lineWidth = 1 * t.Dpr, r.strokeStyle = "#800000", r.fillStyle = "#800000", (0, t.roundedRect)((0, t.cx)(169), (0, t.cy)(91), (0, t.cwh)(76), (0, t.cwh)(26), 2 * t.Dpr, r), r.fill(), r.lineWidth = 1 * t.Dpr, r.strokeStyle = i, r.fillStyle = i, (0, t.roundedRect)((0, t.cx)(169), (0, t.cy)(91), (0, t.cwh)(76), (0, t.cwh)(24), 2 * t.Dpr, r), r.fill(), (0, t.drawText)({
          self: e,
          bold: !0,
          size: 14,
          t: o,
          pos: [207, 104]
        });
      }(e, o), o.fillStyle = "rgba(255,255,255,0.2)", o.fillRect((0, t.cx)(155), (0, t.cy)(157), (0, t.cwh)(9), (0, t.cwh)(3)), o.fillRect((0, t.cx)(155), (0, t.cy)(162), (0, t.cwh)(9), (0, t.cwh)(3)), o.fillRect((0, t.cx)(248), (0, t.cy)(157), (0, t.cwh)(9), (0, t.cwh)(3)), o.fillRect((0, t.cx)(248), (0, t.cy)(162), (0, t.cwh)(9), (0, t.cwh)(3)), (0, t.drawText)({
        self: e,
        size: 14,
        t: "history" == e.opt.type ? "历史最高分" : "本周最高分",
        pos: [207, 160]
      }), (0, t.drawText)({
        self: e,
        size: 86,
        special: !0,
        t: r.score,
        pos: [207, 244.5],
        color: "#00c777"
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/flower.png",
        pos: [207, 220, 260, 141],
        type: "bg",
        imgid: e.imgid.bg
      });
      var n = r.score >= i.REWARD_SCORE && i.CAN_USE_REWARD_CHALLENGE;
      d({
        self: e,
        posy: 305,
        score: r.score,
        type: "white"
      });
      var s = n ? 310 : 207;
      (0, t.drawImageCenter)({
        self: e,
        src: "res/pure_share.png",
        pos: [s, 327.5, 18, 24],
        type: "bg",
        imgid: e.imgid.bg
      }), o.lineWidth = 2 * t.Dpr, o.strokeStyle = "rgba(255,255,255,0.04)", o.fillStyle = "rgba(255,255,255,0.04)";
      var a = 0;
      0 != e.changlleList.length && (a = 77), o.fillRect((0, t.cx)(30), (0, t.cy)(406 + a), (0, t.cwh)(354), (0, t.cwh)(46)), (0, t.drawText)({
        self: e,
        size: 12,
        t: "查看全部排行",
        pos: [166, 428.5 + a],
        align: "left"
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/r_arr.png",
        pos: [247, 428.5 + a, 6.6, 10],
        type: "bg",
        imgid: e.imgid.bg
      });
    }
  }), e.changlleList.length > 0 && (e.changlleListStart = 0, p(e, 0)), e.context.btn.clearRect((0, t.cx)(91), (0, t.cy)(490), (0, t.cwh)(232), (0, t.cwh)(94)), "skin" == e.opt.type ? (e.sunGif = new s.default(0, -20, 8.998, 20, 20, "res/2d/sun.png"), e.sunGif.rotate(.005), e.options.camera.add(e.sunGif.obj), (0, t.drawImageCenter)({
    self: e,
    src: r.bottle_skin_icon,
    pos: [207, 607, 80, 80],
    type: "btn",
    imgid: e.imgid.btn
  })) : f(e), e.changlleList.length > 0 && (0, t.drawText)({
    self: e,
    size: 14,
    t: "排名新超越" + e.changlleList.length + "位好友",
    pos: [207, 406],
    type: "btn",
    color: "rgba(255,255,255,0.8)"
  }), (0, t.updatePlane)({
    self: e,
    type: "bg"
  });
}
function p(e, r) {
  if (e.imgid.btn++, !(e.changlleListStart + 5 * r < 0 || e.changlleListStart + 5 * r >= e.changlleList.length)) {
    e.changlleListStart = e.changlleListStart + 5 * r;
    var o = e.changlleList.slice(e.changlleListStart, e.changlleListStart + 5),
      i = o.length,
      n = 32,
      s = 207 - (32 * i + 10 * (i - 1)) / 2;
    e.context.btn.clearRect((0, t.cx)(30), (0, t.cy)(421), (0, t.cwh)(354), (0, t.cwh)(55));
    for (var a = function () {
        var r = s + 16 + 42 * l;
        (0, t.drawImageCenter)({
          self: e,
          round: !0,
          src: o[l].headimg,
          pos: [r, 443, n, n],
          type: "btn",
          cb: function () {
            (0, t.drawImageCenter)({
              self: e,
              src: "res/ava_rank.png",
              pos: [r, 443, 46, 46],
              type: "btn",
              imgid: e.imgid.btn
            });
          },
          imgid: e.imgid.btn,
          noupdate: !0
        });
      }, l = 0; l < i; l++) a();
    e.changlleList.length > 5 && e.changlleListStart + 5 < e.changlleList.length && (0, t.drawImageCenter)({
      self: e,
      src: "res/r_arr1.png",
      pos: [339, 443, 6, 8],
      type: "btn",
      imgid: e.imgid.btn
    }), e.changlleList.length > 5 && 0 != e.changlleListStart && (0, t.drawImageCenter)({
      self: e,
      src: "res/l_arr.png",
      pos: [69, 443, 6, 8],
      type: "btn",
      imgid: e.imgid.btn
    });
  }
}
function d(e) {
  if (!l.inQQ) {
    var r,
      o,
      n = e.self,
      s = e.posy,
      a = void 0 === s ? 218 : s,
      c = e.type,
      p = void 0 === c ? "green" : c;
    switch (e.score >= i.REWARD_SCORE && i.CAN_USE_REWARD_CHALLENGE && (p = "rewards"), p) {
      case "rewards":
        r = 157.02, o = 45;
        break;
      case "white":
        r = 130, o = 45, (0, t.drawText)({
          self: n,
          size: 14,
          t: i.REWARD_CHALLENGE_TEXT,
          pos: [207, a + 70],
          color: "#FFFFFFCC"
        });
        break;
      default:
        r = 136, o = 45, (0, t.drawText)({
          self: n,
          size: 12,
          t: i.REWARD_CHALLENGE_TEXT,
          pos: [207, a + 40],
          color: "#FFFFFF99"
        });
    }
    "green" !== p && "white" !== p && (0, t.drawImageCenter)({
      self: n,
      src: "res/btn_pk_".concat(p, ".png"),
      pos: [207, a + o / 2, r, o],
      type: "bg",
      imgid: n.imgid.bg
    });
  }
}
function g(e, r, o, i) {
  i = i || 0, (0, t.drawText)({
    self: e,
    size: 14,
    t: "本次得分",
    pos: [207, 84 + i]
  }), (0, t.drawText)({
    self: e,
    size: 88,
    special: !0,
    t: r,
    pos: [212, 150 + i]
  }), o.fillStyle = "rgba(255,255,255,0.2)", o.fillRect((0, t.cx)(162), (0, t.cy)(78 + i), (0, t.cwh)(9), (0, t.cwh)(3)), o.fillRect((0, t.cx)(162), (0, t.cy)(84 + i), (0, t.cwh)(9), (0, t.cwh)(3)), o.fillRect((0, t.cx)(241), (0, t.cy)(78 + i), (0, t.cwh)(9), (0, t.cwh)(3)), o.fillRect((0, t.cx)(241), (0, t.cy)(84 + i), (0, t.cwh)(9), (0, t.cwh)(3));
}
function f(e, r) {
  e.canvasType == t.CANVASTYPE.gameOver && (r = r || 607, e.replayBtnPosy = r, (0, t.drawImageCenter)({
    self: e,
    src: "res/2d/new_home.png",
    pos: [76, r, 74, 74],
    type: "bg",
    imgid: e.imgid.bg
  }), e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawImageCenter)({
    self: e,
    src: "res/replay.png",
    pos: [256, r, 212, 84],
    type: "btn",
    imgid: e.imgid.btn
  }), console.log("draw home and replay succ"));
}
function y(e, r, o) {
  o >= i.REWARD_SCORE && i.CAN_USE_REWARD_CHALLENGE;
  r.clearRect(0, 0, t.WIDTH, t.HEIGHT), r.fillStyle = "rgba(0,0,0, 0.45)", r.fillRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawText)({
    self: e,
    t: "历史最高分：" + o,
    size: 14,
    pos: [207, 706]
  });
}
