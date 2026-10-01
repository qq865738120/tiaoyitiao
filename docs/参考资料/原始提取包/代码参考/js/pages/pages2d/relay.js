// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawRelayBeginner = function (e) {
  (0, t.routeCanvas)(e, "relayBeginner"), (0, t.createPlane)(e), e.imgid.bg++, e.imgid.btn++;
  var a = e.context.bg;
  a.clearRect(0, 0, t.WIDTH, t.HEIGHT), e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), a.beginPath(), a.fillStyle = "rgba(132,111,126,0.8)", a.fillRect(0, (0, t.cy)(547), t.WIDTH, (0, t.cwh)(189)), a.fill(), a.closePath(), (0, t.drawImageCenter)({
    self: e,
    src: "res/2d/skip.png",
    pos: [357, 547, 80, 48],
    type: "bg",
    imgid: e.imgid.bg
  }), (0, t.drawText)({
    self: e,
    t: "玩法说明",
    size: 17,
    pos: [207, 599]
  }), (0, t.drawText)({
    self: e,
    t: "邀请好友进入游戏，轮流操作。每个人在规定时间内",
    size: 14,
    pos: [207, 631]
  }), (0, t.drawText)({
    self: e,
    t: "完成一次操作。掉落者则被淘汰，坚持到最后的玩",
    size: 14,
    pos: [207, 653]
  }), (0, t.drawText)({
    self: e,
    t: "家即为胜利。",
    size: 14,
    pos: [207, 675]
  }), (0, t.updatePlane)({
    self: e,
    type: "bg"
  });
}, exports.drawRelayGG = function (e) {
  if (e.canvasType != t.CANVASTYPE.relayRoom && !t.DEBUGVIEW) return;
  (0, t.createPlane)(e);
  var a = e.context.bg;
  a.clearRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.routeCanvas)(e, "relayGG");
  var r = e.opt;
  (0, t.drawHomeImg)(a, e), (0, t.drawImageCenter)({
    self: e,
    src: "res/bl3.png",
    pos: [207, 342.5, 354, 417],
    imgid: e.imgid.bg,
    type: "bg",
    round: !0,
    cb: function () {
      (0, t.drawImageCenter)({
        self: e,
        src: "res/2d/555.png",
        pos: [207, 214, 37.4, 27],
        type: "bg",
        imgid: e.imgid.bg
      }), (0, t.drawText)({
        self: e,
        t: "游戏结束",
        size: 36,
        pos: [207, 298]
      }), (0, t.drawText)({
        self: e,
        t: "第" + r.my_rank + "名",
        size: 30,
        pos: [207, 358],
        color: "#E3B857"
      }), (0, t.drawText)({
        self: e,
        t: "共" + r.all_player + "名玩家",
        size: 17,
        pos: [207, 398],
        color: "#888"
      }), a.lineWidth = 2 * t.Dpr, a.strokeStyle = "rgba(255,255,255,0.06)", a.fillStyle = "rgba(0,0,0,0.3)", c((0, t.cx)(30), (0, t.cy)(460), (0, t.cwh)(354), (0, t.cwh)(91), 4 * t.Dpr, a), a.fill(), (0, t.drawText)({
        self: e,
        t: "继续观战",
        size: 22,
        pos: [207, 506]
      });
    }
  }), (0, t.updatePlane)({
    self: e,
    type: "bg"
  });
}, exports.drawRelayList = f, exports.drawRelayLookers = function (e) {
  e.opt;
  (0, t.createPlane)(e), (0, t.routeCanvas)(e, "relayLookers"), e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawImageCenter)({
    self: e,
    src: "res/relay_return.png",
    pos: [207, 678, 140, 54],
    imgid: e.imgid.bg,
    type: "bg",
    cb: function () {
      (0, t.drawText)({
        self: e,
        t: "我也要玩",
        size: 17,
        pos: [207, 678],
        color: "#555"
      }), (0, t.updatePlane)({
        self: e,
        type: "bg"
      });
    }
  });
}, exports.drawRelayQr = function (e) {
  e.opt;
  (0, t.createPlane)(e), (0, t.routeCanvas)(e, "relayQr");
  var a = e.context.bg;
  a.clearRect(0, 0, t.WIDTH, t.HEIGHT);
  var r = a.createLinearGradient(0, 0, 0, t.HEIGHT);
  r.addColorStop(0, "#D6F1F1"), r.addColorStop(1, "#D3EDE6"), a.fillStyle = r, a.fillRect(0, 0, t.WIDTH, t.HEIGHT), a.fillStyle = "rgba(0,0,0, 0.3)", a.fillRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawText)({
    self: e,
    t: "扫码即可进入房间",
    size: 17,
    pos: [207, 180]
  }), function (e) {
    var a = "data:image/jpeg;base64," + e.opt.room_wxa_code,
      r = e.context.bg;
    (0, t.drawImageCenter)({
      self: e,
      src: "res/qr.png",
      pos: [207, 368, 390, 390],
      type: "bg",
      imgid: e.imgid.bg,
      cb: function () {
        var o = new Image();
        o.onload = function () {
          r.save(), r.beginPath(), r.arc((0, t.cx)(207), (0, t.cy)(368), (0, t.cwh)(150), 0, 2 * Math.PI), r.clip(), r.drawImage(o, (0, t.cx)(67), (0, t.cy)(228), (0, t.cwh)(280), (0, t.cwh)(280)), r.closePath(), r.restore(), (0, t.updatePlane)({
            self: e,
            type: "bg"
          });
        }, e.opt.room_wxa_code && (o.src = a);
      }
    });
  }(e), (0, t.drawReturnImg)(a, e), (0, t.updatePlane)({
    self: e,
    type: "bg"
  });
}, exports.drawRelayRank = function (e) {
  console.log("!!! drawRelayRank", e), e.opt.players = (0, t.relayRerank)(e.opt.players);
  var a = e.opt.isLive,
    r = e.opt.my_seat_no == e.opt.room_owner_seat;
  if (e.opt.isLiveMember = a && !r, (0, t.createPlane)(e), e.context["bg"].clearRect(0, 0, t.WIDTH, t.HEIGHT), 1 == e.opt.my_rank) (0, t.drawImageCenter)({
    round: !0,
    self: e,
    src: "res/bl3.png",
    pos: [207, 382.5, 354, 537],
    type: "bg",
    imgid: e.imgid.bg,
    cb: function () {
      !function (e) {
        (0, t.routeCanvas)(e, "relayRank"), (0, t.createPlane)(e), (0, t.updateClip)({
          self: e
        });
        var a = e.context.bg;
        (0, t.drawHomeImg)(a, e), a.fillStyle = "rgba(255,255,255,0.04)", a.fillRect((0, t.cx)(30), (0, t.cy)(177), (0, t.cwh)(354), (0, t.cwh)(227)), a.fillStyle = "rgba(0,0,0,0.3)", a.lineWidth = .5 * t.Dpr, a.strokeStyle = "rgba(0,0,0,0.2)", c((0, t.cx)(30), (0, t.cy)(561), (0, t.cwh)(354), (0, t.cwh)(90), 2 * t.Dpr, a), a.fill();
        var r = e.opt.players || [];
        console.log("排行榜的 players: ", r), (0, t.drawText)({
          self: e,
          t: r.length + "人总得分：" + e.opt.total_score,
          size: 17,
          pos: [207, 145]
        }), (0, t.drawImageCenter)({
          self: e,
          src: r[0].headimg,
          pos: [207, 247, 48, 48],
          type: "bg",
          imgid: e.imgid.bg,
          cb: function () {
            (0, t.drawImageCenter)({
              self: e,
              src: "res/2d/ava_square.png",
              pos: [207, 247, 50, 50],
              imgid: e.imgid.bg
            });
          }
        }), (0, t.drawText)({
          self: e,
          t: "第" + e.opt.my_rank + "名",
          size: 30,
          pos: [207, 316],
          color: "#E3B857"
        }), (0, t.drawText)({
          self: e,
          t: "共" + r.length + "名玩家",
          size: 15,
          pos: [207, 356],
          color: "#888"
        }), (0, t.drawText)({
          self: e,
          t: e.opt.isLiveMember ? "回到首页" : "再来一局",
          size: 22,
          pos: [207, 606]
        }), (0, t.updatePlane)({
          self: e,
          type: "bg"
        }), d(e, r);
      }(e);
    }
  });else {
    var o = !1,
      l = 0;
    0 == e.opt.my_seat_no && (o = !0), l = o ? 446 : 537, (0, t.drawImageCenter)({
      round: !0,
      self: e,
      src: "res/bl3.png",
      pos: [207, 114 + l / 2, 354, l],
      type: "bg",
      imgid: e.imgid.bg,
      cb: function () {
        !function (e) {
          (0, t.routeCanvas)(e, "relayRank"), (0, t.updateClip)({
            self: e
          });
          var a = e.context.bg;
          (0, t.drawHomeImg)(a, e), a.fillStyle = "rgba(255,255,255,0.04)", a.fillRect((0, t.cx)(30), (0, t.cy)(177), (0, t.cwh)(354), (0, t.cwh)(141)), a.fill();
          var r = e.opt.players,
            o = !1;
          0 == e.opt.my_seat_no && (o = !0);
          o ? (0, t.drawText)({
            self: e,
            t: "游戏结束",
            size: 30,
            pos: [207, 243]
          }) : (a.fillStyle = "rgba(0,0,0,0.3)", a.strokeStyle = "rgba(0,0,0,0.2)", a.lineWidth = .5 * t.Dpr, c((0, t.cx)(30), (0, t.cy)(560), (0, t.cwh)(354), (0, t.cwh)(90), 2 * t.Dpr, a), a.fill(), (0, t.drawText)({
            self: e,
            t: "第" + e.opt.my_rank + "名",
            size: 30,
            pos: [207, 237],
            color: "#E3B857"
          }), (0, t.drawText)({
            self: e,
            t: "共" + r.length + "名玩家",
            size: 17,
            pos: [207, 275]
          }), (0, t.drawText)({
            self: e,
            t: e.opt.isLiveMember ? "回到首页" : "再来一局",
            size: 22,
            pos: [207, 606]
          }));
          (0, t.drawText)({
            self: e,
            t: r.length + "人总得分：" + e.opt.total_score,
            size: 17,
            pos: [207, 145]
          }), (0, t.updatePlane)({
            self: e,
            type: "bg"
          }), d(e, r);
        }(e);
      }
    });
  }
}, exports.drawRelayRoomPage = function (e) {
  var a = e.opt;
  (0, t.createPlane)(e, ["bg", "btn"]), (0, t.routeCanvas)(e, "relayRoom"), 1 == a.game_level ? a.game_level_s = "中" : 2 == a.game_level ? a.game_level_s = "高" : a.game_level_s = "低";
  if (2 == a.game_status) (0, t.createPlane)(e), function (e) {
    console.log("drawOutDateRoom", e);
    var a = e.context.bg;
    a.clearRect(0, 0, t.WIDTH, t.HEIGHT);
    var r = a.createLinearGradient(0, 0, 0, t.HEIGHT);
    r.addColorStop(0, "#D6F1F1"), r.addColorStop(1, "#D3EDE6"), a.fillStyle = r, a.fillRect(0, 0, t.WIDTH, t.HEIGHT), a.fillStyle = "rgba(0,0,0, 0.3)", a.fillRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawImageCenter)({
      self: e,
      src: "res/2d/555.png",
      pos: [207, 64, 37.4, 27],
      type: "bg",
      imgid: e.imgid.bg
    }), (0, t.drawText)({
      self: e,
      size: 24,
      t: "该局游戏已结束",
      pos: [207, 136]
    }), (0, t.drawHomeImg)(a, e), (0, t.drawImageCenter)({
      self: e,
      src: "res/lookers_btn.png",
      pos: [207, 588, 162, 78],
      type: "bg",
      imgid: e.imgid.bg,
      cb: function () {
        (0, t.drawText)({
          self: e,
          t: "我也要玩",
          size: 18,
          pos: [207, 588],
          color: "#000"
        });
      }
    });
    setTimeout(function () {
      (0, t.drawImageCenter)({
        round: !0,
        self: e,
        src: "res/bl3.png",
        pos: [207, 350, 300, 350],
        type: "bg",
        imgid: e.imgid.bg,
        cb: function () {
          !function (e) {
            e.opt.isOutDate = !0, (0, t.routeCanvas)(e, "relayRank"), (0, t.updateClip)({
              self: e
            });
            var a = e.context.bg;
            (0, t.drawHomeImg)(a, e);
            var r = e.opt.players;
            console.log("!!! 人总得分 self", e), (0, t.drawText)({
              self: e,
              t: "共" + r.length + "人参与",
              size: 17,
              pos: [207, 200]
            }), (0, t.updatePlane)({
              self: e,
              type: "bg"
            }), d(e, r);
          }(e);
        }
      });
    }, 100), (0, t.updatePlane)({
      self: e,
      type: "bg"
    });
  }(e);else if (1 == a.game_status) (0, t.createPlane)(e), function (e) {
    e.imgid.bg++;
    var a = e.context.bg;
    a.clearRect(0, 0, t.WIDTH, t.HEIGHT);
    var r = a.createLinearGradient(0, 0, 0, t.HEIGHT);
    r.addColorStop(0, "#D6F1F1"), r.addColorStop(1, "#D3EDE6"), a.fillStyle = r, a.fillRect(0, 0, t.WIDTH, t.HEIGHT), a.fillStyle = "rgba(0,0,0, 0.3)", a.fillRect(0, 0, t.WIDTH, t.HEIGHT);
    var o = e.opt.players,
      l = e.opt;
    (0, t.drawHomeImg)(a, e);
    var n = [];
    o.length < 6 ? g(e, n = o, 299) : (n = o.slice(0, Math.ceil(o.length / 2)), g(e, n, 299), n = o.slice(Math.ceil(o.length / 2), o.length), g(e, n, 402));
    (0, t.drawText)({
      self: e,
      size: 24,
      t: "游戏已开始",
      pos: [207, 141]
    }), (0, t.drawText)({
      self: e,
      size: 17,
      t: "游戏难度 : " + l.game_level_s,
      pos: [207, 167],
      color: "#FCBA4B"
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/lookers_btn.png",
      pos: [207, 588, 152, 78],
      type: "bg",
      imgid: e.imgid.bg,
      cb: function () {
        (0, t.drawText)({
          self: e,
          t: "观战",
          size: 22,
          pos: [207, 588],
          color: "#000"
        });
      }
    }), (0, t.updatePlane)({
      self: e,
      type: "bg"
    });
  }(e);else if (0 == a.game_status) if (a.my_seat_no == a.room_owner_seat) {
    if (function (e, t, a) {
      if (!t) return !1;
      if ((t = JSON.parse(t)).my_seat_no != t.room_owner_seat && e.my_seat_no == e.room_owner_seat) return !1;
      if (e.isLive !== t.isLive) return !1;
      var r, o, i;
      if (e.players.length == t.players.length) for (var p = 0; p < e.players.length; p++) e.players[p].headimg == t.players[p].headimg && e.players[p].name == t.players[p].name || (r = !0);else r = !0;
      r && n(a);
      e.game_level != t.game_level && (o = !0, l(a));
      (e.players.length > 1 && 1 == t.players.length || t.players.length > 1 && 1 == e.players.length) && (i = !0, s(a));
      return !!(r || o || i) || null == r && null == o && null == i;
    }(e.opt, e.lastopt, e)) return void (e.lastopt = JSON.stringify(e.opt));
    e.lastopt = JSON.stringify(e.opt), function (e) {
      e.imgid.btn++, e.imgid.bg++, e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT);
      var a = e.context.bg;
      a.clearRect(0, 0, t.WIDTH, t.HEIGHT);
      var r = a.createLinearGradient(0, 0, 0, t.HEIGHT);
      r.addColorStop(0, "#D6F1F1"), r.addColorStop(1, "#D3EDE6"), a.fillStyle = r, a.fillRect(0, 0, t.WIDTH, t.HEIGHT), a.fillStyle = "rgba(0,0,0, 0.5)", a.fillRect(0, 0, t.WIDTH, (0, t.cy)(247)), a.fillStyle = "rgba(0,0,0, 0.3)", a.fillRect(0, (0, t.cy)(247), t.WIDTH, (0, t.cy)(489)), n(e), (0, t.drawText)({
        self: e,
        t: "通过房间码邀请",
        size: 17,
        pos: [198, 181],
        color: "rgba(255,255,255,0.7)"
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/r_arr.png",
        pos: [273, 181, 6.5, 12.5],
        type: "btn",
        imgid: e.imgid.btn
      }), l(e);
      var o = "function" == typeof wx.getGameLiveState && wx.getGameLiveState().isLive;
      (o = o && "function" == typeof wx.shareInvitationToLiveRoom) ? ((0, t.drawImageCenter)({
        self: e,
        src: "res/2d/inviteGray.png",
        pos: [120, 119, 128, 37],
        type: "bg",
        imgid: e.imgid.bg
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/2d/inviteWhite.png",
        pos: [272, 119, 128, 37],
        type: "bg",
        imgid: e.imgid.bg
      })) : ((0, t.drawText)({
        self: e,
        t: "+  邀请好友",
        size: 17,
        pos: [207, 119]
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/btn_invite_fri.png",
        pos: [207, 119, 152, 37],
        type: "bg",
        imgid: e.imgid.bg
      }));
      s(e), (0, t.drawHomeImg)(a, e), (0, t.updatePlane)({
        self: e,
        type: "bg"
      });
    }(e);
  } else {
    if (function (e, t, a) {
      if (!t) return !1;
      if (t.my_seat_no != t.room_owner_seat && e.my_seat_no == e.room_owner_seat) return !1;
      var r, o;
      if (t = JSON.parse(t), e.players.length == t.players.length) for (var l = 0; l < e.players.length; l++) e.players[l].headimg == t.players[l].headimg && e.players[l].name == t.players[l].name || (r = !0);else r = !0;
      r && i(a);
      (t.players.length < 10 && e.players.length >= 10 || t.game_level != e.game_level) && (o = !0, p(a));
      if (r || o) return !0;
      return !1;
    }(e.opt, e.lastopt, e)) return void (e.lastopt = JSON.stringify(e.opt));
    e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), e.lastopt = JSON.stringify(e.opt), function (e) {
      var a = e.context.bg;
      a.clearRect(0, 0, t.WIDTH, t.HEIGHT);
      var r = a.createLinearGradient(0, 0, 0, t.HEIGHT);
      r.addColorStop(0, "#D6F1F1"), r.addColorStop(1, "#D3EDE6"), a.fillStyle = r, a.fillRect(0, 0, t.WIDTH, t.HEIGHT), a.fillStyle = "rgba(0,0,0, 0.3)", a.fillRect(0, 0, t.WIDTH, t.HEIGHT);
      e.opt.players, e.opt;
      (0, t.drawHomeImg)(a, e);
      for (var o = 0; o < 10; o++) {
        var l = 59 + o % 5 * 74,
          n = 299 + 103 * Math.floor(o / 5);
        a.lineWidth = 1 * t.Dpr, a.strokeStyle = "rgba(0,0,0,0.06)", a.fillStyle = "rgba(0,0,0,0.06)", (0, t.roundedRect)((0, t.cx)(l - 27), (0, t.cy)(n - 27), (0, t.cwh)(54), (0, t.cwh)(54), 4 * t.Dpr, a), a.fill();
      }
      i(e), p(e), (0, t.drawText)({
        self: e,
        size: 14,
        t: "仅房主可开始游戏以及设置游戏难度",
        pos: [207, 214]
      }), (0, t.drawText)({
        self: e,
        t: "+  邀请好友",
        size: 17,
        pos: [207, 608]
      }), (0, t.drawImageCenter)({
        self: e,
        src: "res/btn_invite_fri.png",
        pos: [207, 608, 152, 37],
        type: "bg",
        imgid: e.imgid.bg
      }), (0, t.updatePlane)({
        self: e,
        type: "bg"
      });
    }(e);
  }
}, exports.drawRelaying = function (e) {
  var a = e.opt;
  (0, t.createPlane)(e), (0, t.routeCanvas)(e, "relayRoom"), e.context.btn.clearRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawText)({
    self: e,
    t: a.text,
    size: 26,
    pos: [34, 220],
    align: "left",
    type: "btn",
    color: "#403A5B"
  }), (0, t.updatePlane)({
    self: e,
    type: "btn"
  });
}, exports.relayBeginnerEve = function (e, t, a) {
  if (t > 310 && t < 397 && a > 530 && a < 560) return e.options.skipRelayBeginner && e.options.skipRelayBeginner(), !1;
}, exports.relayGGEve = function (e, t, a) {
  if (t > 30 && t < 384 && a > 460 && a < 550) return e.hide2D(), !1;
  if (t < 100 && a < 70) return e.relayHeadImg && e.relayHeadImg.obj && e.options.camera.remove(e.relayHeadImg.obj), e.relayText && e.options.camera.remove(e.relayText), e.options.outRelay1 && e.options.outRelay1(), !1;
}, exports.relayQrEve = function (e, t, a) {
  if (t < 100 && a < 70) return e.showRelayRoom(e.relayOpt, !0), !1;
}, exports.relayRankEve = function (e, t, a) {
  if (t < 100 && a < 70 || e.opt.isLiveMember) return e.options.outRelay1 && e.options.outRelay1(), !1;
  if (0 != e.opt.my_seat_no && t > 30 && t < 380 && a > 561 && a < 651) return r.default.emit(o.EVENT.REPLAYAGAIN, {}), !1;
}, exports.relayRoomEve = function (e, t, a) {
  var l = "function" == typeof wx.getGameLiveState && wx.getGameLiveState().isLive;
  if (l = l && "function" == typeof wx.shareInvitationToLiveRoom, 0 == e.opt.game_status && e.opt.my_seat_no == e.opt.room_owner_seat && e.opt.players.length > 1 && t > 160 && t < 260 && a > 627 && a < 677) return e.opt.game_level = e.opt.game_level || 0, e.options.startRelay && e.options.startRelay(e.opt.game_level), !1;
  if (0 == e.opt.game_status && e.opt.my_seat_no == e.opt.room_owner_seat && t > 160 && t < 260 && a > 555 && a < 595) return wx.showActionSheet({
    itemList: ["低", "中", "高"],
    success: function (t) {
      e.opt.game_level = t.tapIndex, e.showRelayRoom(e.opt), r.default.emit(o.EVENT.CHANGEGAMELEVEL, t.tapIndex);
    }
  }), !1;
  if (0 == e.opt.game_status && t < 100 && a < 70) return e.relayHeadImg && e.relayHeadImg.obj && e.options.camera.remove(e.relayHeadImg.obj), e.relayText && e.options.camera.remove(e.relayText), e.options.outRelay1 && e.options.outRelay1(), !1;
  if (0 == e.opt.game_status && e.opt.my_seat_no == e.opt.room_owner_seat && !l && t > 120 && t < 280 && a > 99 && a < 140) return e.options.shareRelay && e.options.shareRelay(), !1;
  if (0 == e.opt.game_status && e.opt.my_seat_no == e.opt.room_owner_seat && l && t > 56 && t < 180 && a > 99 && a < 140) return e.options.shareRelay && e.options.shareRelay(), !1;
  if (0 == e.opt.game_status && e.opt.my_seat_no == e.opt.room_owner_seat && l && t > 205 && t < 336 && a > 99 && a < 140) {
    var n, s, i;
    e.options.shareRelayLive && e.options.shareRelayLive({
      game_level: e.opt.game_level,
      game_level_s: e.opt.game_level_s,
      member_count: null !== (n = null === (s = e.opt) || void 0 === s || null === (i = s.players) || void 0 === i ? void 0 : i.length) && void 0 !== n ? n : 1
    });
  } else {
    if (0 == e.opt.game_status && e.opt.my_seat_no != e.opt.room_owner_seat && t > 160 && t < 260 && a > 598 && a < 618) return e.options.shareRelay && e.options.shareRelay(), !1;
    if ((1 == e.opt.game_status || 2 == e.opt.game_status) && t < 100 && a < 70) return e.relayHeadImg && e.relayHeadImg.obj && e.options.camera.remove(e.relayHeadImg.obj), e.relayText && e.options.camera.remove(e.relayText), e.options.outRelay2 && e.options.outRelay2(), !1;
    if (1 == e.opt.game_status && t > 160 && t < 260 && a > 568 && a < 608) return e.options.watchRelay && e.options.watchRelay(), !1;
    if (0 == e.opt.game_status && e.opt.my_seat_no == e.opt.room_owner_seat && t > 160 && t < 260 && a > 161 && a < 201) return r.default.emit(o.EVENT.GETRELAYQR), e.options.getRelayQr && e.options.getRelayQr(), e.showRelayQr({}), !1;
    if (2 == e.opt.game_status && t > 160 && t < 260 && a > 568 && a < 608) return e.options.newRelay && e.options.newRelay(), !1;
  }
  if (e.needAuth && t > 207 && t < 369 && a > 375 && a < 425) e.options.skipRelayBeginner && e.options.skipRelayBeginner();else if (e.needAuth && t > 45 && t < 207 && a > 375 && a < 425) return e.relayHeadImg && e.relayHeadImg.obj && e.options.camera.remove(e.relayHeadImg.obj), e.relayText && e.options.camera.remove(e.relayText), e.options.outRelay1 && e.options.outRelay1(), !1;
};
var t = require("./base"),
  a = e(require("../../scroll/scrollHandler")),
  r = e(require("../../lib/mue/eventcenter")),
  o = require("../../config");
function l(e) {
  e.context.btn.clearRect((0, t.cx)(100), (0, t.cy)(555), (0, t.cwh)(200), (0, t.cwh)(40)), (0, t.drawText)({
    self: e,
    t: "游戏难度  :   " + e.opt.game_level_s,
    size: 17,
    pos: [138, 575],
    align: "left",
    type: "btn"
  }), (0, t.drawImageCenter)({
    self: e,
    src: "res/r_arr.png",
    pos: [273, 575, 6.5, 12.5],
    type: "btn",
    imgid: e.imgid.btn
  }), (0, t.updatePlane)({
    self: e,
    type: "btn"
  });
}
function n(e) {
  var a = e.context.btn;
  a.clearRect((0, t.cx)(20), (0, t.cy)(270), (0, t.cwh)(370), (0, t.cwh)(210));
  for (var r = e.opt.players, o = function (o) {
      var l = 59 + o % 5 * 74,
        n = 314 + 103 * Math.floor(o / 5);
      r[o] ? ((0, t.drawImageCenter)({
        self: e,
        src: r[o].headimg,
        pos: [l, n, 51, 51],
        type: "btn",
        imgid: e.imgid.btn,
        round: !0,
        noupdate: !0,
        cb: function () {
          (0, t.drawImageCenter)({
            self: e,
            src: "res/2d/ava_square.png",
            pos: [l, n, 53, 53],
            type: "btn",
            imgid: e.imgid.btn,
            cb: function () {
              console.log(r[o].seat_no, e.opt.room_owner_seat), r[o].seat_no == e.opt.room_owner_seat && (0, t.drawImageCenter)({
                self: e,
                src: "res/2d/owner.png",
                pos: [l, n - 27, 40, 18],
                imgid: e.imgid.btn,
                type: "btn",
                cb: function () {
                  (0, t.updatePlane)({
                    self: e,
                    type: "btn"
                  });
                }
              });
            }
          });
        }
      }), (0, t.drawText)({
        self: e,
        t: (0, t.cname)(r[o].name, 6),
        size: 14,
        pos: [l, n + 45],
        type: "btn"
      })) : (a.lineWidth = 1 * t.Dpr, a.strokeStyle = "rgba(0,0,0,0.06)", a.fillStyle = "rgba(0,0,0,0.06)", (0, t.roundedRect)((0, t.cx)(l - 27), (0, t.cy)(n - 27), (0, t.cwh)(53), (0, t.cwh)(53), 4 * t.Dpr, a), a.fill());
    }, l = 0; l < 10; l++) o(l);
}
function s(e) {
  e.context.btn.clearRect((0, t.cx)(100), (0, t.cy)(620), (0, t.cwh)(220), (0, t.cwh)(80)), e.opt.players.length > 1 && (0, t.drawImageCenter)({
    self: e,
    src: "res/play.png",
    pos: [207, 657, 208, 78],
    type: "btn",
    imgid: e.imgid.btn
  });
}
function i(e) {
  console.log("diff player");
  var a = e.context.btn,
    r = e.opt.players;
  a.clearRect((0, t.cx)(20), (0, t.cy)(260), (0, t.cwh)(370), (0, t.cwh)(210));
  for (var o = function (a) {
      var o = 59 + a % 5 * 74,
        l = 299 + 103 * Math.floor(a / 5);
      r[a] && ((0, t.drawImageCenter)({
        self: e,
        src: r[a].headimg,
        pos: [o, l, 52, 52],
        type: "btn",
        imgid: e.imgid.btn,
        round: !0,
        noupdate: !0,
        cb: function () {
          (0, t.drawImageCenter)({
            self: e,
            src: "res/2d/ava_square.png",
            pos: [o, l, 54, 54],
            imgid: e.imgid.btn,
            type: "btn",
            cb: function () {
              r[a].seat_no == e.opt.room_owner_seat && (0, t.drawImageCenter)({
                self: e,
                src: "res/2d/owner.png",
                pos: [o, l - 27, 40, 18],
                imgid: e.imgid.btn,
                type: "btn",
                cb: function () {
                  (0, t.updatePlane)({
                    self: e,
                    type: "btn"
                  });
                }
              });
            }
          });
        }
      }), (0, t.drawText)({
        self: e,
        t: (0, t.cname)(r[a].name, 6),
        size: 14,
        pos: [o, l + 45],
        type: "btn"
      }));
    }, l = 0; l < 10; l++) o(l);
}
function p(e) {
  e.context.btn.clearRect((0, t.cx)(120), (0, t.cy)(111), (0, t.cwh)(170), (0, t.cwh)(90)), 10 == e.opt.players.length ? (0, t.drawText)({
    self: e,
    size: 24,
    t: "房间人数已满",
    pos: [207, 131.5],
    type: "btn"
  }) : (0, t.drawText)({
    self: e,
    size: 24,
    t: "等待开始游戏",
    pos: [207, 131.5],
    type: "btn"
  }), (0, t.drawText)({
    self: e,
    size: 17,
    t: "游戏难度 : " + e.opt.game_level_s,
    pos: [207, 167],
    color: "#FCBA4B",
    type: "btn"
  }), (0, t.updatePlane)({
    self: e,
    type: "btn"
  });
}
function g(e, a, r) {
  for (var o = a.length, l = 54, n = 207 - (o * l + 20 * (o - 1)) / 2, s = (e.context.bg, function () {
      var o = n + 27 + 74 * i;
      (0, t.drawImageCenter)({
        self: e,
        round: !0,
        src: a[i].headimg,
        pos: [o, r, l, l],
        type: "bg",
        cb: function () {
          (0, t.drawImageCenter)({
            self: e,
            src: "res/2d/ava_square.png",
            pos: [o, r, 56, 56],
            type: "bg",
            imgid: e.imgid.bg
          });
        },
        imgid: e.imgid.bg,
        noupdate: !0
      }), (0, t.drawText)({
        self: e,
        t: (0, t.cname)(a[i].name, 6),
        size: 14,
        pos: [o, r + 45]
      });
    }), i = 0; i < o; i++) s();
}
function c(e, t, a, r, o, l) {
  l.beginPath(), l.moveTo(e, t + o - 1), l.lineTo(e, t + r - o), l.quadraticCurveTo(e, t + r, e + o, t + r), l.lineTo(e + a - o, t + r), l.quadraticCurveTo(e + a, t + r, e + a, t + r - o), l.lineTo(e + a, t), l.lineTo(e, t), l.stroke(), l.closePath();
}
function d(e, r) {
  console.log("renderRelayRankList :: ");
  e.sotedRankList = r;
  var o = e.sotedRankList.length * (0, t.cwh)(t.ListLineHeight) / t.Dpr,
    l = (0, t.cwh)(157) / t.Dpr;
  1 != e.opt.my_rank && (l = (0, t.cwh)(242) / t.Dpr), e.opt.isOutDate && (console.log("!!! isOutDate RankList"), l = (0, t.cwh)(300) / t.Dpr), console.log("!!! innerOffsetHeight: ", o, "outterOffsetHeight: ", l, "updatePosition: ", e.updatePosition.bind(e)), e.scrollHandler = new a.default({
    innerOffsetHeight: o,
    outterOffsetHeight: l,
    updatePosition: e.updatePosition.bind(e)
  }), f(e, 0, "list1");
}
function f(e, a, r) {
  var o = e.opt.isOutDate ? 20 : 0;
  "list1" == r ? e.imgid.list1++ : "list2" == r && e.imgid.list2++;
  var l = e.sotedRankList.slice(a, a + 10),
    n = e.context[r];
  if (n.clearRect(0, 0, t.WIDTH, 10 * (0, t.cwh)(t.ListLineHeight)), n.textBaseline = "middle", 0 == a || 0 != l.length) {
    if (!(a < 0)) {
      for (var s = l.length, i = function () {
          console.log(p);
          var n = (p + .5) * t.ListLineHeight,
            s = p + 1 + a,
            i = "";
          i = 1 == s ? "#ffd800" : "#888", (0, t.drawText)({
            self: e,
            bold: !0,
            italic: !0,
            size: 17,
            t: s,
            pos: [58.5 + o, n],
            type: r,
            color: i
          }), (0, t.drawImageCenter)({
            self: e,
            src: l[p].headimg,
            pos: [107 + o, n, 36, 36],
            type: r,
            cb: function () {
              (0, t.drawImageCenter)({
                self: e,
                src: "res/2d/ava_square.png",
                pos: [107 + o, n, 37, 37],
                type: r,
                imgid: e.imgid[r]
              });
            },
            round: !0,
            imgid: e.imgid[r],
            noupdate: !0
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 17,
            bold: !0,
            t: (0, t.cname)(l[p].name, 14),
            pos: [144 + o, n],
            type: r
          });
        }, p = 0; p < s; p++) i();
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
