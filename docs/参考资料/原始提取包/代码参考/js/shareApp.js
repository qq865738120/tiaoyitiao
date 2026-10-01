// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.ShareRelayCard = function (e) {
  return u.apply(this, arguments);
}, exports.ShareRelayLiveCard = function (e) {
  return l.apply(this, arguments);
}, exports.ShareReviewCard = function (e) {
  var t = e.open_playback_id,
    a = e.headimg,
    r = e.cb;
  e.playback_poster;
  wx.updateShareMenu({
    withShareTicket: !0,
    success: function () {
      wx.shareAppMessage({
        title: "快来看看我的精彩回放！",
        query: "mode=reviewPage&open_playback_id=".concat(t, "&headimg=").concat(a),
        imageUrl: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJD1yfAwp8hgmBhTVR0ZoYKwhfUCTo3oOUpibmSNogexQs3IvzE5kTnfT2PR53VwR6tw/0?wx_fmt=png",
        success: function (e) {
          r(!0, 1);
        },
        fail: function (e) {
          r(!1);
        }
      });
    }
  });
}, exports.pureShare = function (e, t) {
  s.getShareCard({
    type: e,
    score: t
  }, function (t) {
    var a = "";
    try {
      a = t.toTempFilePathSync();
    } catch (e) {
      console.log("pureShare: ", e);
    }
    var r = "";
    r = "rank" == e ? "跳遍天下，已无敌手" : "shareBattle" == e ? "快来挑战我的战绩" : "不好意思，又破纪录了", wx.shareAppMessage({
      title: r,
      imageUrl: a,
      success: function (e) {},
      fail: function (e) {}
    });
  });
}, exports.shareBattle = function (e, r) {
  var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : function () {},
    o = arguments.length > 3 ? arguments[3] : void 0,
    u = arguments.length > 4 ? arguments[4] : void 0;
  s.getShareCard({
    score: r,
    type: "shareBattle"
  }, function () {
    var r = a(t().mark(function a(r) {
      var s, l, p, h, f, d, g;
      return t().wrap(function (t) {
        for (;;) switch (t.prev = t.next) {
          case 0:
            s = "";
            try {
              s = r.toTempFilePathSync();
            } catch (e) {
              console.log("shareBattle: ", e);
            }
            if (e) {
              t.next = 1;
              break;
            }
            return t.abrupt("return");
          case 1:
            if (l = (0, i.getSystemInfo)(), p = function () {
              wx.updateShareMenu({
                withShareTicket: !0,
                success: function () {
                  console.log("mode=battle&pkId=" + e), n(!0, e, 1), wx.shareAppMessage({
                    title: "小试牛刀，不服来战",
                    query: "mode=battle&pkId=" + e,
                    imageUrl: s
                  });
                },
                fail: function (t) {
                  console.error("shareBattle updateShareMenu fail:", t), n(!1, e);
                }
              });
            }, !wx.shareAppMessageToGroup || "ios" !== l.platform && "android" !== l.platform) {
              t.next = 6;
              break;
            }
            return h = "", t.prev = 2, t.next = 3, (0, c.getChatToolInfo)(e, 2, function (t) {
              console.log("!!! shareBattle getChatToolInfo success", t), "battle" !== o.mode && u.changeMode("battleCtrl", {
                query: {
                  pkId: e
                }
              });
            });
          case 3:
            f = t.sent, h = f.activity_id, t.next = 5;
            break;
          case 4:
            return t.prev = 4, g = t.catch(2), console.error("!!! shareBattle getChatToolInfo fail", g), null != g && null !== (d = g.errMsg) && void 0 !== d && d.includes("fail cancel") ? console.log("!!! 用户主动取消分享") : p(), t.abrupt("return");
          case 5:
            console.log("activity_id", h), wx.updateShareMenu({
              withShareTicket: !0,
              isUpdatableMessage: !0,
              activityId: h,
              useForChatTool: !0,
              chooseType: 2,
              templateInfo: {
                templateId: "2A84254B945674A2F88CE4970782C402795EB607"
              },
              success: function () {
                console.log("mode=battle&pkId=" + e), wx.shareAppMessageToGroup({
                  title: "擂台挑战赛",
                  imageUrl: s,
                  path: "?mode=battle&pkId=" + e,
                  success: function (t) {
                    console.log("shareAppMessageToGroup success", t), n(!0, e, 1);
                  },
                  fail: function (t) {
                    console.error("shareAppMessageToGroup fail:", t), n(!1, e);
                  }
                });
              },
              fail: function (t) {
                console.error("shareBattle updateShareMenu fail:", t), n(!1, e);
              }
            }), t.next = 7;
            break;
          case 6:
            p();
          case 7:
          case "end":
            return t.stop();
        }
      }, a, null, [[2, 4]]);
    }));
    return function (e) {
      return r.apply(this, arguments);
    };
  }());
}, exports.shareGiftCard = function (e) {
  wx.shareAppMessage({
    title: "领取皮肤",
    query: "mode=getGiftPage&id=" + e,
    imageUrl: "http://mmbiz.qpic.cn/mmbiz_jpg/icTdbqWNOwNTTiaKet81gQJF2kbzlGb8r41QlLdiacISXtmPusJQKVhWuK2MuCaWUgroa8iaruibAI6XGR0iaheoHEibA/0?wx_fmt=jpeg",
    success: function () {}
  });
}, exports.shareGroupRank = function () {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
  wx.getNetworkType({
    success: function (t) {
      "none" !== t.networkType ? wx.updateShareMenu({
        withShareTicket: !0,
        success: function () {
          wx.shareAppMessage({
            title: "群雄逐鹿，看看你第几",
            query: "mode=groupShare",
            imageUrl: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNQ0ia79enzYJBrAavqMRykpovYxSA9RRTwIjde6a68ZCczLMBBd8eSoOyTRyp2Codc5IObdeqZVFyw/0?wx_fmt=png",
            success: function (t) {
              e(!0, 1);
            },
            fail: function (t) {
              e(!1);
            }
          });
        }
      }) : (e(!1), wx.showModal({
        title: "提示",
        content: "网络状态异常",
        showCancel: !1
      }));
    }
  });
}, exports.shareObserve = function () {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
    t = e.bottle_skin_id,
    a = void 0 === t ? "" : t,
    o = e.skin_id,
    c = void 0 === o ? "" : o,
    s = e.skin_sn,
    u = void 0 === s ? "" : s,
    l = e.cb,
    p = void 0 === l ? function () {} : l,
    h = n.default.getMyUserInfo();
  h || (h = {
    nickname: "",
    headimg: ""
  });
  var f = "gameId=".concat(r.default.gameId, "&mode=observe&version=").concat(i.VERSION, "&skin_id=").concat(c, "&skin_sn=").concat(u, "&bottle_skin_id=").concat(a, "&nickName=").concat(h.nickname, "&headimg=").concat(h.headimg);
  console.log(f), wx.updateShareMenu({
    withShareTicket: !0,
    success: function () {
      p(!0, 1), wx.shareAppMessage({
        title: "即刻起跳，速来围观",
        query: f,
        imageUrl: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNQ0ia79enzYJBiaBtXsYrvBsYBdBdDtKE7y638J84JKPckcOtFMp4QunIWFGc7pibQLm13s9fKZ9ic9ew/0?wx_fmt=png"
      });
    },
    fail: function () {
      p(!1);
    }
  });
}, exports.shareSkin = function () {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
  wx.shareAppMessage({
    title: "我获得了新皮肤",
    imageUrl: e || "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJFHiaWIxfyWrEDAehVqPgyVM4pia5WLiaH3pqhlibn3N8rJibl9LMibEZbSJX6MdjFnHxMdg/0?wx_fmt=png",
    success: function () {}
  });
}, require("../@babel/runtime/helpers/Arrayincludes");
var t = require("../@babel/runtime/helpers/regeneratorRuntime"),
  a = require("../@babel/runtime/helpers/asyncToGenerator"),
  r = e(require("./store/session")),
  n = e(require("./store/storage")),
  o = e(require("./pages/shareCard")),
  i = require("./config"),
  c = require("./chattool"),
  s = new o.default({});
function u() {
  return (u = a(t().mark(function e(a) {
    var r, n, o, s, u, l, p, h, f, d, g;
    return t().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (r = a.room_id, n = a.router_id, o = a.version, s = a.cb, r && n && o) {
            e.next = 1;
            break;
          }
          return console.log("shareRelay", r, n, o), e.abrupt("return");
        case 1:
          if (u = "room_id=".concat(r, "&mode=relay&router_id=").concat(encodeURIComponent(n), "&version=").concat(o), console.log(u), l = (0, i.getSystemInfo)(), p = function () {
            wx.updateShareMenu({
              withShareTicket: !0,
              success: function () {
                wx.shareAppMessage({
                  title: "房已开好，就差你了！",
                  query: u,
                  imageUrl: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJN1hYNSmzE0JHB0FicpvibX9tgX8mb3MxbrtpgVxR9ZJaez7Uys56ckP57EU9ib1365Ng/0?wx_fmt=png",
                  success: function (e) {
                    var t = "";
                    e.shareTickets && (t = e.shareTickets[0]), wx.getShareInfo({
                      shareTicket: t,
                      success: function (e) {
                        console.log("!!! getShareInfo success", e), s(u, e.rawData || e.encryptedData);
                      },
                      fail: function (e) {
                        console.error("!!! getShareInfo fail: ", e);
                      }
                    });
                  },
                  fail: function (e) {}
                });
              },
              fail: function () {
                s(!1);
              }
            });
          }, !wx.shareAppMessageToGroup || "ios" !== l.platform && "android" !== l.platform) {
            e.next = 6;
            break;
          }
          return h = "", e.prev = 2, e.next = 3, (0, c.getChatToolInfo)(r);
        case 3:
          f = e.sent, h = f.activity_id, e.next = 5;
          break;
        case 4:
          return e.prev = 4, g = e.catch(2), console.error("!!! ShareRelayCard getChatToolInfo fail", g), null != g && null !== (d = g.errMsg) && void 0 !== d && d.includes("fail cancel") ? console.log("!!! 用户主动取消分享") : p(), e.abrupt("return");
        case 5:
          console.log("activity_id", h), wx.updateShareMenu({
            withShareTicket: !0,
            isUpdatableMessage: !0,
            activityId: h,
            useForChatTool: !0,
            chooseType: 2,
            templateInfo: {
              templateId: "2A84254B945674A2F88CE4970782C402795EB607"
            },
            success: function () {
              wx.shareAppMessageToGroup({
                title: "多人接力赛",
                imageUrl: "https://mmgame.qpic.cn/image/b758595e64b5ba425ccb767b14c804d078f06ebc5f119976503c44a6b3ae034d/0",
                path: "?" + u,
                success: function (e) {
                  var t = "";
                  e.shareTickets && (t = e.shareTickets[0]), wx.getShareInfo({
                    shareTicket: t,
                    success: function (e) {
                      console.log("!!! getShareInfo success", e), s(u, e.rawData || e.encryptedData, h);
                    },
                    fail: function (e) {
                      console.error("!!! getShareInfo fail: ", e), s(u, !1, h);
                    }
                  });
                },
                fail: function (e) {
                  console.error("shareAppMessageToGroup fail: ", e);
                }
              });
            },
            fail: function (e) {
              console.error("updateShareMenu fail: ", e), s(!1);
            }
          }), e.next = 7;
          break;
        case 6:
          p();
        case 7:
        case "end":
          return e.stop();
      }
    }, e, null, [[2, 4]]);
  }))).apply(this, arguments);
}
function l() {
  return (l = a(t().mark(function e(a) {
    var r, n, o, c, s, u, l;
    return t().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (r = a.room_id, n = a.router_id, o = a.version, c = a.activity_id, a.game_level, s = a.game_level_s, u = a.member_count, r && n && o) {
            e.next = 1;
            break;
          }
          return console.log("shareRelayLive", r, n, o), e.abrupt("return");
        case 1:
          l = "is_live=true&room_id=".concat(r, "&mode=relay&router_id=").concat(encodeURIComponent(n), "&version=").concat(o, "&activity_id=").concat(c), wx.shareInvitationToLiveRoom({
            title: "来跳一跳接龙",
            query: l,
            activityId: c,
            templateInfo: {
              parameterList: [{
                name: "member_count",
                value: "".concat(u)
              }, {
                name: "room_limit",
                value: i.ROOM_LIMIT
              }]
            },
            subTitle: "".concat(s, "难度"),
            fail: function (e) {
              console.error("shareInvitationToLiveRoom fail: ", e);
            }
          });
        case 2:
        case "end":
          return e.stop();
      }
    }, e);
  }))).apply(this, arguments);
}
