// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../@babel/runtime/helpers/slicedToArray"),
  i = require("../../@babel/runtime/helpers/classCallCheck"),
  a = require("../../@babel/runtime/helpers/createClass"),
  s = e(require("../network/network")),
  n = e(require("../pages/review/review")),
  o = e(require("../pages/review/shareCard")),
  r = e(require("../store/storage")),
  h = require("../shareApp"),
  c = require("../pages/pages2d/base"),
  u = e(require("../lib/mue/eventcenter")),
  l = require("../config"),
  m = e(require("../control/bottleSkinBaseCtrl")),
  d = e(require("../control/propertyCtrl")),
  g = require("../util/forceUpdate");
exports.default = function () {
  return a(function e(t) {
    i(this, e), this.game = t, this.gameCtrl = t.gameCtrl, this.initData();
  }, [{
    key: "initData",
    value: function () {
      this.isInThisPage = !1, this.isInShareCardPage = !1, this.scene = void 0, this.pause = !1, this.actionList = [], this.musicList = [], this.touchStartList = [], this.index = 0, this._playCache = function () {}, this.gameData = {}, this.reviewPage = null, this.onHide = function () {}, this.skinResources = null, this.shareCardData = null, this.property = {}, this.playback_poster = null;
    }
  }, {
    key: "init",
    value: function (e) {
      var i = e.user_data,
        a = e.scene,
        h = e.callback,
        c = e.is_from_share,
        u = e.onHide,
        l = e.playback_poster;
      if (!this.isInThisPage) {
        var d = this,
          p = i && i.playback_id,
          f = i && i.is_self,
          _ = this.game.skinManager;
        this.onHide = u || this.onHide, this.playback_poster = l, this.isInThisPage = !0, function e(i, a) {
          wx.showLoading({
            mask: !0
          }), function (e, i) {
            var a;
            return new Promise(function (n, o) {
              (function (e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                return t ? s.default.getFriendPlayBack(e) : new Promise(function (t, i) {
                  s.default.getWeeklyPlayBack(function (e, a) {
                    var s = "";
                    e ? t(a.data) : (a && a.data && a.data.base_resp && a.data.base_resp.errcode && (s = "，(e" + a.data.base_resp.errcode + ")"), i(s));
                  }, e);
                });
              })(e, i).then(function (e) {
                a = e.game_data;
                var t,
                  i,
                  s,
                  n = e.bottle_skin_data,
                  o = n && n.id ? (t = n, m.default.getBottleSkinResourceBySkinData(t)) : Promise.resolve(void 0);
                return Promise.all([o, (i = a.skin_id, s = a.skin_sn, _.loadSkinForOtherMode(i, s))]);
              }, function (e) {
                return Promise.reject(e);
              }).then(function (e) {
                var i = t(e, 2),
                  s = i[0];
                i[1];
                n({
                  gameData: a,
                  skinResources: s
                });
              }, function (e) {
                o();
              });
            });
          }(a, c).then(function (e) {
            var t = e.gameData,
              a = e.skinResources;
            wx.hideLoading(), i(t, a), d.game.reporter.clickReviewBtn(0);
          }, function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
            wx.hideLoading(), wx.showModal({
              title: "提示",
              content: "获取回放数据失败" + t,
              confirmText: "重试",
              cancelText: "取消",
              success: function (t) {
                t.confirm ? e(i, a) : c && d.onHide && d.onHide();
              },
              fail: function () {
                c && d.onHide && d.onHide();
              }
            }), d.game.reporter.clickReviewBtn(1);
          });
        }(function (e, t) {
          1 === (0, g.compareMyVersion)(e.version) ? (0, g.forceUpdate)(function () {}, "点击确定，进行版本更新后重试") : (h && h(), function (e, t) {
            var h = d.getTotalGameTime(e.timestamp, e.action);
            d.scene = a, d.skinResources = t, d.gameData = e, f ? d.CalGameExtraData(function (e, t) {
              u(e, t);
            }) : u();
            function u() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
                a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
              d.reviewPage = new n.default({
                game: d.game,
                week_best_score: i.week_best_score,
                is_self: f,
                is_from_share: c,
                maxBonusScore: t,
                succeedTime: a,
                onChangeProgress: function (e) {
                  d.isChanging = !1, d.changeProgressTo(e);
                },
                onTouchStartProgress: function () {
                  d.isChanging = !0;
                },
                onHide: function () {
                  d.onHide(), d.destroy();
                },
                onOpenSharePage: function () {
                  d.shareCard(i);
                }
              }), d.shareReviewCard = new o.default({
                game: d.game,
                week_best_score: i.week_best_score,
                headimg: i.headimg,
                maxBonusScore: t,
                succeedTime: a,
                onShare: function (e) {
                  d.onShareToFriends({
                    open_playback_id: e,
                    week_best_score: i.week_best_score,
                    headimg: i.headimg,
                    is_self: i.is_self,
                    playback_poster: d.playback_poster
                  });
                },
                onSave: function (e) {
                  d.onSavePhoto(e);
                },
                onCloseSharePage: function () {
                  d.isInShareCardPage = !1, d.onCloseSharePage();
                }
              }), d.play(e.seed, e.action, e.musicList, e.timestamp, e.version, e.use_wangzhe, e.mmpay_status, e.use_mmpaybase, e.skin_id, e.property, function () {
                if (d.game.currentScore && i.week_best_score && d.game.currentScore != i.week_best_score) {
                  s.default.sendServerError(9);
                  if (Math.random() < .01) {
                    var e = r.default.getMyUserInfo(),
                      t = e && e.open_id;
                    t && s.default.badReport("searchflag:reviewNotRight;open_id:".concat(t, ";playback_id:").concat(p, ";currentScore:").concat(d.game.currentScore, ";week_best_score:").concat(i.week_best_score, ";"));
                  }
                }
                d.onHide && d.onHide();
              }), d.reviewPage.show(i, h);
            }
          }(e, t));
        }, p);
      }
    }
  }, {
    key: "CalGameExtraData",
    value: function (e) {
      this.speedUpto(this.gameData.timestamp.length - 1, this.gameData, function (t, i) {
        e && e(t, i);
      });
    }
  }, {
    key: "onSavePhoto",
    value: function (e) {
      e.toTempFilePath({
        x: (0, c.cx)(46),
        y: (0, c.cy)(95),
        width: (0, c.cwh)(322),
        height: (0, c.cwh)(524),
        success: function (e) {
          wx.saveImageToPhotosAlbum({
            filePath: e.tempFilePath,
            success: function () {
              wx.showToast({
                title: "保存成功"
              });
            }
          });
        },
        fail: function (e) {}
      });
    }
  }, {
    key: "shareCard",
    value: function (e) {
      e.playback_id;
      var t = this,
        i = "mode=reviewPage&headimg=".concat(e.headimg);
      function a() {
        t.reviewPage.pause(), t.isInShareCardPage = !0, t.pausePlay(), t.shareReviewCard.show({
          qrcode: t.shareCardData.qrcode_img,
          open_playback_id: t.shareCardData.open_playback_id
        });
      }
      this.shareCardData ? a() : (wx.showLoading({
        mask: !0
      }), s.default.getOpenPlaybackData(i).then(function (e) {
        wx.hideLoading(), t.isInThisPage && (t.shareCardData = e, a());
      }, function () {
        wx.hideLoading(), t.isInThisPage && (t.isInShareCardPage = !1, wx.showToast({
          title: "获取分享失败",
          icon: "none"
        }));
      }));
    }
  }, {
    key: "onCloseSharePage",
    value: function () {
      this.continue(), this.reviewPage.continue(), this.setProgressByIndex(this.index);
    }
  }, {
    key: "onShareToFriends",
    value: function (e) {
      var t = e.open_playback_id,
        i = e.week_best_score,
        a = e.headimg,
        s = e.is_self;
      e.playback_poster;
      (0, h.ShareReviewCard)({
        open_playback_id: t,
        week_best_score: i,
        headimg: a,
        is_self: s,
        playback_poster: this.playback_poster,
        cb: function () {}
      });
    }
  }, {
    key: "getTotalGameTime",
    value: function (e, t) {
      var i = e.length;
      return e[i - 1] - e[0] + t[i - 1][0] + 3e3;
    }
  }, {
    key: "changeProgressTo",
    value: function (e) {
      var t = this,
        i = this.findStep(e);
      this._destroy(), this.speedUpto(i, this.gameData, function () {
        t._playCache();
      }), this.setProgressByIndex(i);
    }
  }, {
    key: "setProgressByIndex",
    value: function (e) {
      var t;
      if (0 === e) t = .01;else {
        var i = this.getTotalGameTime(this.gameData.timestamp, this.gameData.action),
          a = this.gameData.timestamp[0];
        t = (this.gameData.timestamp[e - 1] - a) / i;
      }
      this.reviewPage.startProgressBarFrom(t);
    }
  }, {
    key: "findStep",
    value: function (e) {
      var t,
        i = this.gameData.timestamp,
        a = e * this.getTotalGameTime(this.gameData.timestamp, this.gameData.action),
        s = i[0];
      if (a > i[i.length - 1] - s) t = i.length;else for (t = i.length - 1; t >= 0 && !(a < i[t] - s + 1 && a > i[t - 1] - s); t--);
      return t - 1;
    }
  }, {
    key: "destroy",
    value: function (e) {
      this.isInThisPage && (this.reviewPage && this.reviewPage.hide(), this.game.resetScene(), u.default.emitSync(l.EVENT.GOTOSINGLESTARTPAGE, {}), this._destroy(), this.isInThisPage = !1, this.initData());
    }
  }, {
    key: "_play",
    value: function (e) {
      var t = this;
      if (this.index < this.actionList.length && !this.pause) {
        var i = this.actionList[this.index][3] || null,
          a = this.actionList[this.index][1],
          s = this.musicList[this.index + 1],
          n = this.actionList[this.index][2],
          o = this.actionList[this.index][0],
          r = 0 == this.index ? 0 : this.touchStartList[this.index] - this.touchStartList[this.index - 1];
        this.timer = setTimeout(function () {
          ++t.index, "stop" != t.game.bottle.status ? (t.speedUpto(t.index - 2, t.gameData, function () {
            t._play(e);
          }), t.setProgressByIndex(t.index)) : (t.isChanging && t.setProgressByIndex(t.index), 1 == i || t.game.touchStartAnim({
            fromReview: !0
          }), t.jumpTimer = setTimeout(function () {
            1 == i ? d.default.reviewUsingProp(i, t.game, {
              quick: n,
              musicScore: s
            }) : t.game.touchEndAnim(o, a, n, s), t.index == t.actionList.length && (t.overTimeout = setTimeout(function () {
              e();
            }, 3e3));
          }, 1 == i ? 0 : 1e3 * o), t._play(e), t._playCache = function () {
            t._play(e);
          });
        }, r);
      } else this.pause;
    }
  }, {
    key: "pausePlay",
    value: function () {
      if (this.pause = !0, this.reviewPage && this.reviewPage.stopAnimation(), this.timer && (clearTimeout(this.timer), this.timer = null), this.timers) {
        for (var e = 0; e < this.timers.length; ++e) clearTimeout(this.timers[e]);
        this.timers = null;
      }
    }
  }, {
    key: "speedUpto",
    value: function (e, t, i) {
      var a = this;
      this._destroy();
      var s,
        n = t.seed,
        o = t.action,
        r = t.musicList,
        h = t.timestamp,
        c = t.version,
        u = t.use_wangzhe,
        l = t.mmpay_status,
        m = t.use_mmpaybase,
        d = t.skin_id,
        g = t.property,
        p = o,
        f = h,
        _ = 0;
      for (this.actionList = p, this.musicList = r, this.touchStartList = f, this.property = g, this.index = 0, this.game.resetScene(n, {
        version: c,
        use_wangzhe: u,
        use_mmpaybase: m,
        mmpay_status: l,
        bottleSkin: this.skinResources || null,
        skinId: d || null
      }), s = 0; s < this.actionList.length - 1 && s < e; s++) v(s);
      function v(e) {
        var t,
          i = a.actionList[e][3] || null,
          s = a.actionList[e][1],
          n = a.actionList[e][0],
          o = a.musicList[e + 1],
          r = a.actionList[e][2];
        1 == (t = 1 == i ? a.game.wellJump({
          property_id: i,
          item_id: 1,
          noAnimation: !0,
          quick: r,
          musicScore: o
        }) : a.game.touchEndAnim(n, s, r, o, {
          noAnimation: !0
        })) || 7 == t ? (a.game.succeed({
          noAnimation: !0,
          musicScore: o
        }), 1 === t ? (++a.game.doubleHit, a.game.UI.addScore(1, !0, r)) : (a.game.doubleHit = 0, a.game.UI.addScore(1, !1, r)), a.game.doubleHit > _ && (_ = a.game.doubleHit)) : 2 == t && a.game.bottle.obj && (a.game.bottle.obj.position.x = a.game.bottle.destination[0], a.game.bottle.obj.position.z = a.game.bottle.destination[1]);
      }
      this.index = s, i(_, this.game.succeedTime);
    }
  }, {
    key: "continue",
    value: function () {
      this.isInShareCardPage || (this.pause = !1, this._playCache());
    }
  }, {
    key: "play",
    value: function (e, t, i, a, s, n, o, r, h, c, u) {
      this.actionList = t, this.musicList = i, this.touchStartList = a, this.property = c, this.index = 0, this.game.resetScene(e, {
        version: s,
        use_wangzhe: n,
        use_mmpaybase: r,
        mmpay_status: o,
        bottleSkin: this.skinResources || null,
        skinId: h || null
      }), this._play(u);
    }
  }, {
    key: "_destroy",
    value: function () {
      if (this.game.stopLoopMusic(), this.timer && (clearTimeout(this.timer), this.timer = null), this.jumpTimer && (clearTimeout(this.jumpTimer), this.jumpTimer = null), this.game.deadTimeout && (clearTimeout(this.game.deadTimeout), this.game.deadTimeout = null), this.overTimeout && (clearTimeout(this.overTimeout), this.overTimeout = null), this.timers) {
        for (var e = 0; e < this.timers.length; ++e) clearTimeout(this.timers[e]);
        this.timers = null;
      }
    }
  }]);
}();
