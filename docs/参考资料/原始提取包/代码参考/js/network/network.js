// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0, exports.upLoadVerifyPic = function (e) {
  var t = e.path || "",
    a = e.succ || function () {
      console.log("upLoadVerifyPic need succ func");
    },
    s = e.complete || function () {
      console.log("upLoadVerifyPic need complete func");
    },
    o = i.default.sessionId || "";
  if (!t || !o) return console.log("upLoadVerifyPic need session_id：" + o + "upLoadVerifyPic need path：" + t), s(), void f("提交失败", "n0");
  console.log(c + "/wxagame/wxagame_filetransfer?action=preview"), wx.uploadFile({
    url: c + "/wxagame/wxagame_filetransfer?action=preview",
    filePath: t,
    name: "file",
    formData: {
      base_req: JSON.stringify({
        session_id: o,
        fast: 1
      })
    },
    success: function (e) {
      if (console.log("upLoadVerifyPic success", e), 200 == e.statusCode) {
        if (e.data) {
          var t = JSON.parse(e.data);
          if (t.base_resp && 0 == t.base_resp.errcode) {
            var s = t.content;
            a(s);
          } else f("提交失败", "e" + t.base_resp.errcode);
        } else f("提交失败", "no res data");
      } else f("提交失败", "s" + e.statusCode);
    },
    fail: function (e) {
      console.log("upLoadVerifyPic fail", e), f("提交失败", "n1");
    },
    complete: function () {
      s();
    }
  });
}, exports.upLoadVerifySubmit = function (e) {
  var t = i.default.sessionId || "",
    a = e.complete || function () {
      console.log("upLoadVerifySubmit need complete func");
    },
    s = e.succ || function () {
      console.log("upLoadVerifySubmit need succ func");
    },
    o = String(e.name),
    n = String(e.mobile),
    r = String(e.fileid),
    u = Number.parseInt(e.is_async) || 0;
  if (!t) return console.log("upLoadVerifySubmit need session_id：" + t), f("提交失败", "n0"), void a();
  var d = {
    base_req: {
      session_id: i.default.sessionId,
      fast: 1
    },
    name: o,
    phone_number: n,
    photo_id: r,
    is_async: u
  };
  wx.request({
    url: c + "/wxagame/wxagame_appeal?action=submit",
    method: "POST",
    data: d,
    success: function (e) {
      200 === e.statusCode ? e.data && e.data.base_resp && 0 === e.data.base_resp.errcode ? s() : f("提交失败", "e" + e.data.base_resp.errcode) : f("提交失败", "s" + e.statusCode);
    },
    fail: function () {
      f("提交失败", "n1");
    },
    complete: function () {
      a();
    }
  });
};
var t = require("../../@babel/runtime/helpers/objectSpread2"),
  a = require("../../@babel/runtime/helpers/typeof"),
  s = require("../../@babel/runtime/helpers/classCallCheck"),
  o = require("../../@babel/runtime/helpers/createClass"),
  i = e(require("../store/session")),
  n = e(require("../store/storage")),
  r = require("../util/encryption"),
  u = require("./../config"),
  d = e(require("../lib/mue/eventcenter")),
  c = "https://mp.weixin.qq.com";
exports.default = function () {
  function e() {
    s(this, e);
  }
  return o(e, null, [{
    key: "onServerConfigForbid",
    value: function (e) {
      this.emmitServerConfigForbid = e;
    }
  }, {
    key: "getUserInfo",
    value: function () {
      var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
        s = this,
        o = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          }
        };
      return new Promise(function (i, r) {
        function u(t, o) {
          try {
            Math.random() < .1 && ("object" == a(o) && (o = JSON.stringify(o)), s.badReport("$$getUserInfoFail;" + t + ";" + o + ";"));
          } catch (e) {
            console.log(e);
          }
          if ("rejectForFail" == t) {
            "object" == a(o) && /timeout/g.test(o.errMsg) && e.sendServerError(8);
          }
          r();
        }
        wx.request({
          url: c + "/wxagame/wxagame_getuserinfo",
          method: "POST",
          data: o,
          success: function (e) {
            if (200 === e.statusCode) {
              if (0 === e.data.base_resp.errcode) {
                t(e.data);
                var a = {
                  nickname: e.data.nickname,
                  headimg: e.data.headimg,
                  open_id: e.data.open_id
                };
                n.default.saveMyUserInfo(a), i(e.data);
              } else u("rejectForErrcode", e.data.base_resp.errcode);
            } else u("rejectForStatusCode", e.statusCode);
          },
          fail: function (e) {
            u("rejectForFail", e);
          }
        });
      });
    }
  }, {
    key: "login",
    value: function () {
      var e = this,
        t = this.loginPromise = new Promise(function (e, t) {
          console.log("wx.login"), wx.login({
            success: function (a) {
              a.code ? (i.default.setLoginState(a.code), e(a.code)) : t("sessionId get fail have no res.code");
            },
            fail: function () {
              console.log("wx.login fail"), t("sessionId get fail");
            }
          });
        });
      return t.catch(function () {
        e.loginPromise = null;
      }), t;
    }
  }, {
    key: "requestLogin",
    value: function (e) {
      e || (e = function () {}), this.loginPromise || this.login(), this.loginPromise.then(function () {
        e(!0);
      }, function (t) {
        e(!1);
      });
    }
  }, {
    key: "requestFriendsScore",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (!i.default.serverConfig || i.default.serverConfig.friends_score_switch) {
        if (i.default.sessionId) {
          var t = {
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            }
          };
          return new Promise(function (a, s) {
            wx.request({
              url: c + "/wxagame/wxagame_getfriendsscore",
              method: "POST",
              data: t,
              success: function (t) {
                if (200 === t.statusCode) {
                  if (0 === t.data.base_resp.errcode) {
                    if (t.data.bottle_skin_list) {
                      var o = l(t.data.my_user_info || {}, t.data.user_info, t.data.bottle_skin_list),
                        i = o.user_info,
                        n = o.my_user_info;
                      t.data.user_info = i, t.data.my_user_info = n;
                    }
                    e(!0, t.data), a(t.data);
                  } else e && (e(!1), s());
                } else e && (e(!1), s());
              },
              fail: function (t) {
                e(!1, !1), s();
              }
            });
          });
        }
        e(!1);
      }
    }
  }, {
    key: "requestSettlement",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
        a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : function () {},
        s = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
      if (i.default.sessionId) {
        var o = {
            score: e,
            times: t,
            game_data: JSON.stringify(s)
          },
          n = {
            base_req: {
              host: (0, u.getSystemInfo)().host,
              session_id: i.default.sessionId,
              fast: 1
            },
            action_data: (0, r.encrypt)(o, i.default.sessionId)
          };
        wx.request({
          url: c + "/wxagame/wxagame_settlement",
          method: "POST",
          data: n,
          success: function (e) {
            if (200 === e.statusCode) {
              if (0 === e.data.base_resp.errcode) {
                var t = e.data.cheater_status || 0;
                if (1 == (e.data.appeal_status || 0)) a(!0, {
                  banType: 2
                }, e.data);else switch (t) {
                  case 1:
                    a(!0, {
                      banType: 3
                    }, e.data);
                    break;
                  case 2:
                    a(!0, {
                      banType: 1
                    }, e.data);
                    break;
                  default:
                    a(!0, {
                      banType: 0
                    }, e.data);
                }
              } else a(!1, "e" + e.data.base_resp.errcode);
            } else a(!1, "s" + e.statusCode);
          },
          fail: function (e) {
            a(!1, "n1");
          }
        });
      } else a(!1, "n0");
    }
  }, {
    key: "requestCreateGame",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (!i.default.serverConfig || i.default.serverConfig.audience_mode_switch) {
        i.default.sessionId || this.reGetSessionId("requestCreateGame", e);
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          }
        };
        wx.request({
          url: c + "/wxagame/wxagame_creategame",
          method: "POST",
          data: t,
          success: function (t) {
            200 === t.statusCode && 0 === t.data.base_resp.errcode ? e(!0, t) : e(!1);
          },
          fail: function (t) {
            e(!1);
          }
        });
      } else e(!1, "当前围观人数过多，请稍后再试");
    }
  }, {
    key: "reGetSessionId",
    value: function (e, t) {
      var a = this;
      n.default.clearSessionId(), this.requestLogin(function (s) {
        s ? t ? a[e](t) : a[e]() : t && t(!1);
      });
    }
  }, {
    key: "requestInit",
    value: function (e) {
      if (i.default.sessionId) if (i.default.serverConfig) {
        var t = i.default.serverConfig.version;
        this.requestServerInit(t, e);
      } else this.requestServerInit(0, e);
    }
  }, {
    key: "requestServerInit",
    value: function (e) {
      var t = {
        base_req: {
          session_id: i.default.sessionId,
          fast: 1
        },
        version: e
      };
      wx.request({
        url: c + "/wxagame/wxagame_init",
        method: "POST",
        data: t,
        success: function (e) {
          200 === e.statusCode && 0 === e.data.base_resp.errcode && ((e.data.version > i.default.serverConfig.version || !i.default.serverConfig.version) && (i.default.setServerConfig(e.data), n.default.saveServerConfig(e.data)), console.log("wtf init"), d.default.emit(u.EVENT.INITRESPONSE, e.data));
        },
        fail: function (e) {
          console.log("Network requestInit fail", e);
        }
      });
    }
  }, {
    key: "requestMmpayBonus",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          }
        };
        console.log("---------------request MMPAY"), wx.request({
          url: c + "/wxagame/wxagame_getuserstatus",
          method: "POST",
          data: t,
          success: function (t) {
            200 === t.statusCode ? t.data && 0 !== t.data.base_resp.errcode ? e(!1, t) : t.data ? e(!0, t) : e(!1, t) : e(!1, t);
          },
          fail: function (t) {
            e(!1, t);
          }
        });
      } else e(!1);
    }
  }, {
    key: "getGroupScore",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1,
            group_info: {
              share_ticket: i.default.shareTicket
            }
          }
        };
        wx.request({
          url: c + "/wxagame/wxagame_getgrouprank",
          method: "POST",
          data: t,
          success: function (t) {
            if (200 === t.statusCode) {
              if (0 === t.data.base_resp.errcode) {
                if (console.log(t.data), t.data.bottle_skin_list) {
                  var a = l(t.data.my_user_info || {}, t.data.user_info, t.data.bottle_skin_list),
                    s = a.user_info,
                    o = a.my_user_info;
                  t.data.user_info = s, t.data.my_user_info = o;
                }
                e(!0, t);
              } else e(!1);
            } else e(!1);
          },
          fail: function (t) {
            e(!1);
          }
        });
      } else e(!1);
    }
  }, {
    key: "createPK",
    value: function (e, t) {
      return new Promise(function (a, s) {
        if (i.default.sessionId) {
          wx.showLoading();
          var o = {
              base_req: {
                session_id: i.default.sessionId,
                fast: 1
              },
              score: e,
              life_time: t
            },
            n = {
              url: c + "/wxagame/wxagame_createpk",
              method: "POST",
              data: o,
              success: function (e) {
                console.log("!!! createPK success", e), 200 === e.statusCode && 0 === e.data.base_resp.errcode ? (i.default.setPkId(e.data.pk_id), a()) : s();
              },
              fail: function (e) {
                console.log("!!! createPK fail", e), s();
              },
              complete: function () {
                wx.hideLoading();
              }
            };
          console.log("!!! createPK request", n), wx.request(n);
        } else s();
      });
    }
  }, {
    key: "getBattleData",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
        t = arguments.length > 1 ? arguments[1] : void 0;
      if (!i.default.sessionId || !t) return console.error("Network getBattleData not ok need sessionID pkId"), void e(!1);
      var a = {
        base_req: {
          session_id: i.default.sessionId,
          fast: 1
        },
        pk_id: t
      };
      i.default.shareTicket && (a.base_req.group_info = {
        share_ticket: i.default.shareTicket
      });
      var s = {
        url: c + "/wxagame/wxagame_getpkinfo",
        method: "POST",
        data: a,
        success: function (t) {
          console.log("!!! wxagame_getpkinfo success", t), 200 === t.statusCode && 0 === t.data.base_resp.errcode ? e(!0, t) : e(!1);
        },
        fail: function (t) {
          console.error("!!! wxagame_getpkinfo fail", t), e(!1);
        }
      };
      console.log("!!! wxagame_getpkinfo request", s), wx.request(s);
    }
  }, {
    key: "updatepkinfo",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
        t = arguments.length > 1 ? arguments[1] : void 0,
        a = arguments.length > 2 ? arguments[2] : void 0;
      if (i.default.sessionId && t) {
        var s = {
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            },
            pk_id: t,
            score: a
          },
          o = {
            url: c + "/wxagame/wxagame_updatepkinfo",
            method: "POST",
            data: s,
            success: function (t) {
              console.log("!!! wxagame_updatepkinfo success", t), 200 === t.statusCode && 0 === t.data.base_resp.errcode ? e(!0, t) : e(!1);
            },
            fail: function (t) {
              console.error("!!! wxagame_updatepkinfo fail", t), e(!1);
            }
          };
        console.log("!!! wxagame_updatepkinfo request", o), wx.request(o);
      } else e(!1);
    }
  }, {
    key: "quitGame",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (i.default.gameId || i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          },
          game_id: i.default.gameId
        };
        wx.request({
          url: c + "/wxagame/wxagame_quitgame",
          method: "POST",
          data: t,
          success: function (t) {
            200 === t.statusCode && 0 === t.data.base_resp.errcode ? e(!0, t) : e(!1);
          },
          fail: function (t) {
            e(!1);
          }
        });
      } else e(!1);
    }
  }, {
    key: "syncop",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (i.default.gameId || i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          },
          game_id: i.default.gameId
        };
        wx.request({
          url: c + "/wxagame/wxagame_syncop",
          method: "POST",
          data: t,
          success: function (t) {
            200 === t.statusCode && 0 === t.data.base_resp.errcode ? e(!0, t) : e(!1);
          },
          fail: function (t) {
            e(!1);
          }
        });
      } else callback(!1);
    }
  }, {
    key: "sendReport",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
        t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      if (i.default.sessionId) {
        var a = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1,
            client_info: t
          },
          report_list: e
        };
        wx.request({
          url: c + "/wxagame/wxagame_bottlereport",
          method: "POST",
          data: a,
          success: function (e) {},
          fail: function () {}
        });
      }
    }
  }, {
    key: "sendEggReport",
    value: function (e) {
      if (i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          },
          egg_info_list: e
        };
        wx.request({
          url: c + "/wxagame/wxagame_eggreport",
          method: "POST",
          data: t,
          success: function (e) {
            console.log("Network sendEggReport success", e);
          },
          fail: function () {
            console.log("Network sendEggReport fail");
          }
        });
      }
    }
  }, {
    key: "badReport",
    value: function (e, t) {
      var a = (0, u.getSystemInfo)(),
        s = i.default.sessionId || "";
      e = "nickName:".concat(n.default.getMyUserInfo().nickname, ",model:").concat(a.model, ",SDKVersion:").concat(a.SDKVersion, ",version:").concat(a.version, ",subVersion:").concat(u.SUBVERSION, ",sessionId:").concat(s, ",errmsg:").concat(e, ",stack:").concat(t);
      this.requestBadjs(130, e);
    }
  }, {
    key: "logReport",
    value: function (e) {
      var t = (0, u.getSystemInfo)(),
        a = (i.default.sessionId, "nickName:".concat(n.default.getMyUserInfo().nickname, ",model:").concat(t.model, ",SDKVersion:").concat(t.SDKVersion, ",version:").concat(t.version, ",subVersion:").concat(u.SUBVERSION, ",logMsg:").concat(e));
      this.requestBadjs(150, a);
    }
  }, {
    key: "requestBadjs",
    value: function (e, t) {
      wx.request({
        url: "https://badjs.weixinbridge.com/badjs",
        data: {
          id: e,
          level: 4,
          msg: t + "$"
        },
        success: function (e) {},
        fail: function (e) {}
      });
    }
  }, {
    key: "sendServerError",
    value: function (e) {
      if (i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          },
          id: 3,
          key: e
        };
        wx.request({
          url: c + "/wxagame/wxagame_jsreport",
          method: "POST",
          data: t,
          success: function (e) {},
          fail: function () {}
        });
      }
    }
  }, {
    key: "createRouterId",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {};
      if (i.default.sessionId) {
        var t = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          }
        };
        wx.request({
          url: c + "/wxagame/wxagame_allocrouteid",
          method: "POST",
          data: t,
          success: function (t) {
            200 === t.statusCode ? t.data && t.data.base_resp && 0 === t.data.base_resp.errcode ? (e(!0, t.data.route_id), console.log("Network createRouterId: ", t.data.route_id)) : e(!1, "e" + t.data.base_resp.errcode) : e(!1, "s" + t.statusCode);
          },
          fail: function (t) {
            e(!1, "n1");
          }
        });
      } else e(!1, "n0");
    }
  }, {
    key: "getWeeklyPlayBack",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
        t = arguments.length > 1 ? arguments[1] : void 0;
      if (i.default.sessionId && t) {
        var a = {
          base_req: {
            session_id: i.default.sessionId,
            fast: 1
          },
          game_version: u.VERSION,
          action: "weekly_rank",
          playback_id: t
        };
        wx.request({
          url: c + "/wxagame/wxagame_playback",
          method: "POST",
          data: a,
          success: function (t) {
            var a = Object.assign({}, t);
            if (200 === a.statusCode) {
              if (!a.data || 0 === a.data.base_resp.errcode) return a.data && a.data.game_data ? (a.data.game_data = JSON.parse(a.data.game_data), a.data.bottle_skin_data = g(a.data.bottle_skin), void e(!0, a)) : void e(!1, a);
              e(!1, a);
            } else e(!1, a);
          },
          fail: function (t) {
            e(!1, t);
          }
        });
      } else e(!1);
    }
  }, {
    key: "getFriendPlayBack",
    value: function (e) {
      var t = c + "/wxagame/wxagame_playback",
        a = {
          open_playback_id: e,
          game_version: u.VERSION
        };
      return this.requestWithIdPromise({
        url: t,
        method: "POST",
        data: a
      }).then(function (e) {
        return e && e.game_data ? (e.game_data = JSON.parse(e.game_data), e.bottle_skin_data = g(e.bottle_skin), Promise.resolve(e)) : Promise.reject();
      }, function () {
        Promise.reject();
      });
    }
  }, {
    key: "getOpenPlaybackData",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
        t = c + "/wxagame/wxagame_setplayback",
        a = {
          action: "weekly_rank",
          query: e
        };
      return this.requestWithIdPromise({
        url: t,
        method: "POST",
        data: a
      }).then(function (e) {
        return new Promise(function (t, a) {
          e.qrcode_img && e.open_playback_id ? t(e) : a();
        });
      }, function () {
        return Promise.reject();
      });
    }
  }, {
    key: "syncSelectedBottleSkin",
    value: function (e) {
      return new Promise(function (t, a) {
        if (i.default.sessionId && e) {
          var s = {
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            },
            item_id: e
          };
          wx.request({
            url: c + "/wxagame/wxagame_selectbottleskin",
            method: "POST",
            data: s,
            success: function (e) {
              200 === e.statusCode ? e.data && 0 !== e.data.base_resp.errcode ? a(e) : t() : a(e);
            },
            fail: function (e) {
              a(e);
            }
          });
        } else a();
      });
    }
  }, {
    key: "getBottleSkinShopData",
    value: function () {
      return new Promise(function (e, t) {
        if (i.default.sessionId) {
          var a = {
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            }
          };
          wx.request({
            url: c + "/wxagame/wxagame_getskincenter",
            method: "POST",
            data: a,
            success: function (a) {
              if (200 === a.statusCode) {
                if (a.data && 0 !== a.data.base_resp.errcode) t(a);else if (a.data && a.data.item_list) {
                  var s = (o = a.data, i = o.item_list.filter(function (e) {
                    return 1 == e.useble;
                  }).map(function (e) {
                    return e.item_id;
                  }), n = o.item_list.map(function (e) {
                    return g(e);
                  }), {
                    canUseSkinIdList: i,
                    bottleSkinShopList: n
                  });
                  e(s);
                } else {
                  var o, i, n;
                  t(a);
                }
              } else t(a);
            },
            fail: function (e) {
              t(e);
            }
          });
        } else t();
      });
    }
  }, {
    key: "getUserProfile",
    value: function (e) {
      return new Promise(function (t, a) {
        if (i.default.sessionId) {
          var s = {
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            },
            open_user_id: e
          };
          wx.request({
            url: c + "/wxagame/wxagame_getpersonaldetail",
            method: "POST",
            data: s,
            success: function (e) {
              var s;
              200 === e.statusCode ? e.data && 0 !== e.data.base_resp.errcode ? a(e) : e.data && e.data.user_info ? t({
                highest_score: (s = e.data.user_info).history_best_score,
                week_best_score: s.week_best_score,
                headimg: s.headimg,
                nickname: s.nickname,
                praise_info: s.praise_info,
                playback_poster: s.playback_poster || ""
              }) : a(e) : a(e);
            },
            fail: function (e) {
              a(e);
            }
          });
        } else a();
      });
    }
  }, {
    key: "sendLikeTo",
    value: function (e) {
      return new Promise(function (t, a) {
        if (i.default.sessionId) {
          var s = {
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            },
            open_user_id: e
          };
          wx.request({
            url: c + "/wxagame/wxagame_praise",
            method: "POST",
            data: s,
            success: function (e) {
              e.data.over_limit ? a({
                overLimit: e.data.over_limit
              }) : t();
            },
            fail: function (e) {
              a(e);
            }
          });
        } else a();
      });
    }
  }, {
    key: "requestWithId",
    value: function (e) {
      if (!e.url) return console.error("requestWithId need url"), void ("function" == typeof e.fail && e.fail("requestWithId need url"));
      var a = e.fail = e.fail || function () {
        console.error("requestWithId need fail function");
      };
      e.success = e.success || function () {
        console.error("requestWithId need success function");
      };
      function s(e) {
        var a = e.sessionId,
          s = e.opt;
        s.data = s.data || {}, s.data.base_req = {
          session_id: a,
          fast: 1
        };
        var o = s.success,
          i = s.fail;
        s.success = function (e) {
          200 === e.statusCode ? 0 === e.data.base_resp.errcode ? o(e.data) : i("errcode unexpected:" + e.data.base_resp.errcode) : i("status code unexpected:" + e.statusCode);
        }, wx.request(t({}, s));
      }
      i.default.sessionId ? s({
        sessionId: i.default.sessionId,
        opt: e
      }) : (this.loginPromise || this.login(), this.loginPromise.then(function (t) {
        s({
          sessionId: t,
          opt: e
        });
      }, function (e) {
        a(e);
      }));
    }
  }, {
    key: "requestWithIdPromise",
    value: function () {
      var e = this,
        s = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        o = null;
      return s.data = "object" === a(s.data) ? s.data : {}, (o = "object" !== a(s) || "object" != a(s.data) || Array.isArray(s.data) ? Promise.reject("opt or optData is not an pureObject") : new Promise(function (a, o) {
        var i = s.success || function () {},
          n = s.fail || function () {};
        s.success = function (e) {
          "function" == typeof i && i(e), a(e);
        }, s.fail = function (e) {
          "function" == typeof n && n(e), o(e);
        }, e.requestWithId(t({}, s));
      })).catch(function (e) {
        console.log("requestWithIdPromise Error", s, e);
      }), o;
    }
  }, {
    key: "requestMsg",
    value: function (e) {
      var t = c + "/wxagame/wxagame_getmsglist";
      return this.requestWithIdPromise({
        url: t,
        method: "POST",
        data: e
      });
    }
  }, {
    key: "requestMsgRedPot",
    value: function () {
      var e = c + "/wxagame/wxagame_getunreadmsgcount";
      return this.requestWithIdPromise({
        url: e,
        method: "POST",
        data: {
          type: 1
        }
      });
    }
  }, {
    key: "getproperty",
    value: function () {
      var e = c + "/wxagame/wxagame_getproperty";
      return this.requestWithIdPromise({
        url: e,
        method: "POST",
        data: {}
      });
    }
  }, {
    key: "useproperty",
    value: function (e) {
      var t = e.property_id,
        a = e.seed,
        s = c + "/wxagame/wxagame_useproperty",
        o = {
          property_id: t,
          seed: a
        };
      return this.requestWithIdPromise({
        url: s,
        method: "POST",
        data: o
      });
    }
  }, {
    key: "revertproperty",
    value: function (e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      if (i.default.sessionId) {
        var a = c + "/wxagame/wxagame_revertproperty",
          s = {
            score: t,
            game_data: JSON.stringify(e)
          },
          o = {
            action_data: (0, r.encrypt)(s, i.default.sessionId)
          };
        return this.requestWithIdPromise({
          url: a,
          method: "POST",
          data: o
        });
      }
    }
  }, {
    key: "getGiftData",
    value: function (e) {
      var t = c + "/wxagame/wxagame_getgift",
        a = {
          gift_id: e
        };
      return this.requestWithIdPromise({
        url: t,
        method: "POST",
        data: a
      });
    }
  }, {
    key: "getSkin",
    value: function (e) {
      var t = c + "/wxagame/wxagame_getskin";
      return this.requestWithIdPromise({
        url: t,
        method: "POST",
        data: e
      });
    }
  }, {
    key: "getBlock",
    value: function (e) {
      var t = c + "/wxagame/wxagame_geteggobject";
      return this.requestWithIdPromise({
        url: t,
        method: "POST",
        data: e
      });
    }
  }, {
    key: "getAdReward",
    value: function () {
      var e = c + "/wxagame/wxagame_adreward";
      return this.requestWithIdPromise({
        url: e,
        method: "POST",
        data: {}
      });
    }
  }, {
    key: "showBannerAd",
    value: function () {
      var e = c + "/wxagame/wxagame_adbanner";
      return this.requestWithIdPromise({
        url: e,
        method: "POST",
        data: {}
      });
    }
  }, {
    key: "sceneLogin",
    value: function (e) {
      var t = c + "/wxagame/wxagame_scenelogin";
      this.requestWithId({
        url: t,
        method: "POST",
        success: e,
        fail: function () {}
      });
    }
  }, {
    key: "requestWithEncryptedData",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
          url: "",
          method: "POST",
          data: {},
          encryptedData: ""
        },
        a = e.url,
        s = e.data,
        o = e.encryptedData,
        n = e.method;
      return new Promise(function (e, r) {
        if (i.default.sessionId) {
          var u = t({
            base_req: {
              session_id: i.default.sessionId,
              fast: 1
            }
          }, s);
          o && (u.base_req.group_info = {
            share_ticket: o
          });
          var d = {
            url: a,
            method: n || "POST",
            data: u,
            success: function (t) {
              200 === t.statusCode ? 0 === t.data.base_resp.errcode ? (console.log("!!! request ".concat(a, " success"), t), e(t.data)) : r("!!! request ".concat(a, " fail, errcode: ").concat(t.data.base_resp.errcode)) : r("!!! request ".concat(a, " fail, statusCode: ").concat(t.statusCode));
            },
            fail: function (e) {
              r("!!! request ".concat(a, " fail: ").concat(JSON.stringify(e)));
            }
          };
          console.log("!!! request ".concat(a, " options"), d), wx.request(d);
        } else r("!!! requestWithEncryptedData need sessionId");
      });
    }
  }, {
    key: "getActivityId",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
        encryptedData: "",
        data: {}
      };
      return e.url = c + "/wxagame/wxagame_getactivityid", this.requestWithEncryptedData(e);
    }
  }, {
    key: "sendChatToolMsg",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
        data: {}
      };
      return e.url = c + "/wxagame/wxagame_sendchattoolmsg", this.requestWithEncryptedData(e);
    }
  }]);
}();
function l(e, t, a) {
  var s = {};
  return a.map(function (e) {
    s[e.item_id] = e.poster_min;
  }), e.bottle_skin = s[e.bottle_skin_id], t.map(function (e) {
    e.bottle_skin = s[e.bottle_skin_id];
  }), {
    my_user_info: e,
    user_info: t
  };
}
function f(e, t) {
  var a = t ? e + "(" + t + ")" : e;
  wx.showModal({
    title: "提示",
    content: a,
    showCancel: !1
  });
}
function g() {
  var e,
    t,
    a,
    s = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
  try {
    e = JSON.parse(s.resources) || {};
  } catch (t) {
    e = {};
  }
  return s.expire_time && (a = Math.floor(Date.now() / 1e3), t = s.expire_time - a), {
    display_info: e.display_info || {},
    img: e.display_info && e.display_info.poster,
    use_status: s.useble || 0,
    unlock_wording: e.display_info && e.display_info.unlock_wording,
    left_time: t,
    expire_time: s.expire_time,
    type: e.type,
    id: s.item_id,
    property: e.property
  };
}
