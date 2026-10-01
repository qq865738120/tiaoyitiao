// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default,
  t = require("../@babel/runtime/helpers/interopRequireWildcard").default,
  i = require("../@babel/runtime/helpers/classCallCheck"),
  o = require("../@babel/runtime/helpers/createClass");
require("./weapp-adapter");
var s = t(require("./lib/three")),
  n = e(require("./block")),
  a = e(require("./ui")),
  r = e(require("./wave")),
  l = e(require("./ground")),
  h = e(require("./bottle")),
  c = require("./config"),
  d = e(require("./ui/audioManager")),
  u = e(require("./tailSystem")),
  m = e(require("./lib/point-in-polygon")),
  g = e(require("./network/network")),
  b = e(require("./store/storage")),
  p = e(require("./store/session")),
  k = e(require("./rankSystem")),
  v = e(require("./network/socket")),
  f = e(require("./pages/full2D")),
  y = require("./shareApp"),
  w = e(require("./viewer")),
  x = require("./lib/animation"),
  B = e(require("./store/historyTimes")),
  T = e(require("./network/reporter")),
  C = e(require("./gameCtrl")),
  S = e(require("./gameView")),
  G = e(require("./gameModel")),
  j = require("./random"),
  M = e(require("./control/instructionCtrl")),
  L = e(require("./control/relayInstructionCtrl")),
  R = e(require("./lib/mue/eventcenter")),
  P = e(require("./control/onebyoneCtrl")),
  O = e(require("./control/bottleSkinBaseCtrl")),
  E = require("./util/encryption"),
  I = e(require("./network/relayMoniter")),
  z = e(require("./lib/mue/lookcenter")),
  A = e(require("./skin")),
  _ = e(require("./control/propertyCtrl")),
  q = require("./getPlugin"),
  D = require("./pages/pages2d/base"),
  U = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
  F = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth,
  H = wx.getSystemInfoSync() || {},
  V = "ios" == H.platform,
  K = "android" == H.platform,
  N = "devtools" == H.platform,
  W = H.model,
  Y = function () {
    return o(function e(t) {
      var o = this;
      i(this, e), this.options = t, this.is_from_wn = 0, this.firstInit = !0, this.distance = 0, this.heightestScore = 0, this.stage = "", this.succeedTime = 0, this.lastAddBonus = -2, this.lastStage = "", this.deadTimeout = null, this.currentScore = 0, this.seq = 0, this.thirdBlock = null, this.straight = !0, this.firstBlood = !1, this.lastHardLevel = 200, this.guider = !1, this.hardDistances = [], (0, q.createMiniGameCenter)({
        autoRender: !1,
        autoShow: !1,
        y: U / 2 - F / 9 * 5
      }, function () {
        o.initMinigameCenter();
      }), (0, q.initMiniGameCommon)(), this.socketFirstSync = !1, this.init(), this.randomSeed = this.generateSeed(), (0, j.setRandomSeed)(this.randomSeed), this.actionList = [], this.musicList = [], this.touchList = [], this.touchMoveList = [], this.onceTouchMoveList = [], this.touchStartTime = [], this.blocks = [], this.liveTime = 0, this.eggBlocksCount = {}, this.eggBlocksTriggerCount = {}, this.eggBlocksFailCount = {}, this.eggBlocksSucceedCount = {}, wx.setKeepScreenOn && wx.setKeepScreenOn({
        keepScreenOn: !0
      }), z.default.startScenes("global");
    }, [{
      key: "moveTo",
      value: function (e) {
        this.camera.position.x = this.camera.position.x + e.x, this.camera.position.z = this.camera.position.z + e.z;
      }
    }, {
      key: "moveGradually",
      value: function (e, t) {
        if (this.animating && !this.guider) {
          (0, x.TweenAnimation)(this.bottle.obj.position.x, this.bottle.obj.position.x - e.x, 500 * t, "Linear", function (e, t) {
            void 0 !== e && (this.bottle.obj.position.x = e, t && (this.bottle.obj.position.x = -.098));
          }.bind(this));
          for (var i = 0, o = this.blocksInUse.length; i < o; ++i) (0, x.TweenAnimation)(this.blocksInUse[i].obj.position.x, this.blocksInUse[i].obj.position.x - e.x, 500 * t, "Linear", function (e) {
            void 0 !== e && (this.obj.position.x = e);
          }.bind(this.blocksInUse[i]));
          this.blocks && this.blocks[0] && (0, x.TweenAnimation)(this.blocks[0].obj.position.x, this.blocks[0].obj.position.x - e.x, 500 * t, "Linear", function (e) {
            void 0 !== e && (this.obj.position.x = e);
          }.bind(this.blocks[0]));
        } else this.camera.destination = [this.camera.position.x + e.x, this.camera.position.z + e.z], (0, x.TweenAnimation)(this.camera.position.x, this.camera.position.x + e.x, 500 * t, "Quad.easeOut", function (e) {
          void 0 !== e && (this.camera.position.x = e);
        }.bind(this)), (0, x.TweenAnimation)(this.camera.position.z, this.camera.position.z + e.z, 500 * t, "Quad.easeOut", function (e) {
          void 0 !== e && (this.camera.position.z = e);
        }.bind(this));
      }
    }, {
      key: "update",
      value: function (e) {
        var t = this;
        this.tailSystem && this.tailSystem.update(1e3 * e), this.bottle.update(e), this.renderer.shadowMap.enabled && (this.shadowTarget.position.x = this.bottle.obj.position.x, this.shadowTarget.position.z = this.bottle.obj.position.z, this.shadowLight.position.x = this.bottle.obj.position.x + 0, this.shadowLight.position.z = this.bottle.obj.position.z + 10);
        for (var i = 0, o = this.blocksInUse.length; i < o; ++i) this.blocksInUse[i].update(e);
        if (this.blocks && this.blocks[0] && this.blocks[0].update(), ("forerake" === this.bottle.status || "hypsokinesis" === this.bottle.status) && 5 != this.hit) {
          var s = this.bottle.getBox(),
            n = "forerake" === this.bottle.status ? this.nextBlock.getBox() : this.currentBlock.getBox();
          for (i = 0, o = s.length; i < o; ++i) if (s[i].intersectsBox(n)) {
            0 == i ? (this.bottle.rotate(), this.suspendTimer && (clearTimeout(this.suspendTimer), this.suspendTimer = null)) : 1 == i ? (this.bottle.suspend(), this.suspendTimer && (clearTimeout(this.suspendTimer), this.suspendTimer = null)) : 2 != i || this.suspendTimer || (this.suspendTimer = setTimeout(function () {
              t.bottle.suspend(), t.suspendTimer = null;
            }, 90 * this.distance));
            break;
          }
        }
        if (this.bottle.obj.position.y <= c.BLOCK.height / 2 + .1 && "jump" === this.bottle.status && this.bottle.flyingTime > .3 && !this.pendingReset) {
          if (1 === this.hit || 7 === this.hit) {
            if (this.bottle.stop(), this.bottle.changeScorePos(0), this.succeed(), this.animating) return;
            1 === this.hit ? (this.audioManager["combo" + Math.min(this.doubleHit + 1, 8)].seek(0), this.audioManager["combo" + Math.min(this.doubleHit + 1, 8)].play(), ++this.doubleHit, this.addWave(Math.min(this.doubleHit, 4)), this.bottle.showAddScore(1, !0, this.quick), this.UI.addScore(1, !0, this.quick), this.currentScore = this.UI.score, "observe" != this.mode && this.showCombo()) : (this.doubleHit = 0, this.UI.addScore(1, !1, this.quick), this.currentScore = this.UI.score, this.bottle.showAddScore(1, !1, this.quick)), this.audioManager.success.seek(0), this.audioManager.success.play(), "observe" == this.mode || "relay" == this.mode || this.gameCtrl.reviewCtrl.isInThisPage || this.rankSystem.update();
          } else 2 === this.hit ? (this.bottle.stop(), this.bottle.obj.position.y = c.BLOCK.height / 2, this.bottle.obj.position.x = this.bottle.destination[0], this.bottle.obj.position.z = this.bottle.destination[1]) : 3 === this.hit ? (this.bottle.hypsokinesis(), this.audioManager.fall_2.play(), this.bottle.obj.position.y = c.BLOCK.height / 2) : 4 === this.hit || 5 === this.hit ? (this.bottle.forerake(), this.audioManager.fall_2.play(), this.bottle.obj.position.y = c.BLOCK.height / 2) : 0 === this.hit ? (this.bottle.fall(), this.audioManager.fall.play(), this.bottle.obj.position.y = c.BLOCK.height / 2) : 6 === this.hit ? (this.bottle.stop(), this.audioManager.fall.play(), this.bottle.obj.position.y = c.BLOCK.height / 2) : -1 === this.hit && (this.bottle.stop(), this.bottle.obj.position.y = c.BLOCK.height / 2, this.bottle.obj.position.x = 0);
          if (0 === this.hit || 3 === this.hit || 4 === this.hit || 5 === this.hit || 6 === this.hit) {
            if (this.guider) if (this.UI.score > 0) this.guider = !1;else {
              if (!(this.liveTime > 3)) return void this.live();
              this.guider = !1, this.full2D.hide2DGradually();
            }
            this.pendingReset = !0, this.currentScore = this.UI.score, this.reporter.addEggBlockReport(this.eggBlocksCount, this.eggBlocksTriggerCount, this.eggBlocksFailCount, this.eggBlocksSucceedCount), this.gameCtrl.gameOver(this.currentScore);
            var a = this.mode;
            this.deadTimeout = setTimeout(function () {
              t.pendingReset = !1, "relay" == a || t.gameCtrl.reviewCtrl.isInThisPage || (x.TweenAnimation.killAll(), GameGlobal.minigameCenter && GameGlobal.matchType ? GameGlobal.matchType === GameGlobal.matchTypes["淘汰赛"] ? (t.gameCtrl.gameOverShowPage(), GameGlobal.cacheScore = 0, GameGlobal.matchType = 0, GameGlobal.minigameCenter.completeMatchGame()) : (GameGlobal.cacheScore = t.currentScore, t.gameCtrl.clickReplay()) : t.gameCtrl.gameOverShowPage()), "observe" == t.mode && t.instructionCtrl.onCmdComplete();
            }, 2e3);
          } else "observe" == this.mode && this.instructionCtrl.onCmdComplete();
          "relay" == this.mode && (this.relayHandleInterrupt ? this.relayHandleInterrupt = !1 : setTimeout(function () {
            R.default.emitSync(c.EVENT.NOWPLAYEROVER, {
              hit: t.hit
            });
          }, 0 === this.hit || 3 === this.hit || 4 === this.hit || 5 === this.hit || 6 === this.hit ? 2e3 : 0));
        }
        this.renderer.render(this.scene, this.camera);
      }
    }, {
      key: "succeed",
      value: function (e) {
        var t = this;
        if (++this.succeedTime, this.musicScore = !1, this.lastSucceedTime = Date.now(), this.succeedTime % 15 == 0 && (e && e.noAnimation || this.ground.changeColor()), this.blocksInUse.length >= 9) {
          var i = this.blocksInUse.shift();
          i.obj.visible = !1, this.blocksPool.push(i);
        }
        var o = this.nextBlock.obj.position.clone().sub(this.currentBlock.obj.position);
        this.bottle.obj.position.x = this.bottle.destination[0], this.bottle.obj.position.z = this.bottle.destination[1];
        var s = this.thirdBlock;
        if (this.audioManager.setTimerFlag(!0), !this.firstAnimating) {
          if (this.guider && (this.guider = !1, this.full2D.hide2DGradually()), !this.animating) {
            if (this.nextBlock.whenSucceed && this.nextBlock.whenSucceed(this.bottle.obj.position.clone()), !this.nextBlock.succeedTimer && void 0 === this.nextBlock.score && !this.nextBlock.musicName || e && e.noAnimation || "relay" == this.mode) e && e.musicScore && "relay" != this.mode && (31 == this.nextBlock.order && (this.nextBlock.score = this.mmpayScore), this.UI.addScore(this.nextBlock.score, !1, !1, !0), 32 == this.nextBlock.order && (this.relaxLeft += 2));else {
              var n = this.nextBlock;
              this.musicTimer = setTimeout(function () {
                void 0 !== n.score && (2 == t.reviewVersion && 15 == n.order || (t.musicScore = !0, 31 == n.order && (n.score = t.mmpayScore), t.UI.addScore(n.score, !1, !1, !0), t.bottle.showAddScore(n.score, !1, !1, !0), R.default.emit(c.EVENT.TRIGGER_EGG, {
                  order: n.order,
                  block: n
                }))), n.musicName && (t.audioManager[n.musicName].seek(0), t.audioManager[n.musicName].play(), n.registerAudio && t.audioManager.register(n.musicName, function () {
                  n.registerAudio();
                }, function () {
                  n.registerEndAudio && n.registerEndAudio();
                })), n.succeedTimer && n.succeedTimer(t.UI.score, t.bottle.obj.position.clone()), 32 == n.order && (t.relaxLeft += 2);
              }, 2e3), this.audioManager.pop.seek(0), this.audioManager.pop.play();
            }
            var a = this.nextBlock.obj.position.clone(),
              r = this.nextBlock.radius + this.distance + s.radius;
            this.straight ? (a.x += r, this.bottle.lookAt("straight", a.clone())) : (a.z -= r, this.bottle.lookAt("left", a.clone())), s.obj.position.x = a.x, s.obj.position.z = a.z;
          }
          var l = s.obj.position.clone().sub(this.nextBlock.obj.position),
            h = o.add(l);
          h.x /= 2, h.z /= 2, this.scene.add(s.obj), this.currentBlock = this.nextBlock, this.nextBlock = s;
          var d = h.length() / 10;
          this.bottle.human.rotation.z = 0, this.bottle.human.rotation.x = 0, e && e.noAnimation ? (this.moveTo(h), s.body.position.y = c.BLOCK.height / 2 - s.height / 2, s.obj.visible = !0) : (this.bottle.squeeze(), s.popup(), c.GAME.canShadow && this.bottle.scatterParticles(), this.animating && (h.x = 19.8), this.cameraMoveDuration = d, this.moveGradually(h, d));
        }
      }
    }, {
      key: "handleWxOnHideEvent",
      value: function () {
        this.show = !1, "prepare" == this.bottle.status && (this.touchObserve = !0), this.animateTimer && (clearTimeout(this.animateTimer), this.animateTimer = null), this.onshowAnimateTimer && (clearTimeout(this.onshowAnimateTimer), this.onshowAnimateTimer = null), this.gameCtrl.wxOnhide(), z.default.stopScenes("global");
      }
    }, {
      key: "init",
      value: function () {
        var e,
          t,
          i = this;
        b.default.getFirstBlood() || this.options.query.mode || this.options.query.wxgamechallengeid || (this.guider = !0), this.socketMonitor = new I.default({
          report: this.report.bind(this),
          duration: 13e3,
          logMaxLength: 5e3
        }), this.gameCtrl = new C.default(this), this.gameView = new S.default(this), this.gameModel = new G.default(this), this.instructionCtrl = new M.default(this), this.relayInstructionCtrl = new L.default(this), this.historyTimes = new B.default(this), this.reporter = new T.default(), this.audioManager = new d.default(this), this.gameSocket = new v.default(this), this.scene = new s.Scene();
        var o = c.FRUSTUMSIZE,
          m = F / U;
        this.camera = new s.OrthographicCamera(o * m / -2, o * m / 2, o / 2, o / -2, -10, 85), this.camera.position.set(-17, 30, 26), this.camera.lookAt(new s.Vector3(13, 0, -4)), this.scene.add(this.camera), this.renderer = new s.WebGLRenderer({
          antialias: !0,
          canvas: canvas,
          preserveDrawingBuffer: !0
        }), window.renderer = this.renderer, this.blocksPool = [], this.blocksInUse = [], this.blocksRemoved = {}, this.doubleHit = 0, V && (W.indexOf("iPhone 4") >= 0 || W.indexOf("iPhone 5") >= 0 || H.system.indexOf("iOS 9") >= 0 || H.system.indexOf("iOS 8") >= 0 || W.indexOf("iPhone 6") >= 0 && W.indexOf("iPhone 6s") < 0) ? (this.renderer.shadowMap.enabled = !1, c.GAME.canShadow = !1, this.renderer.setPixelRatio(1.5)) : void 0 !== H.benchmarkLevel && H.benchmarkLevel < 5 && -1 != H.benchmarkLevel ? (c.GAME.canShadow = !1, this.renderer.shadowMap.enabled = !1, this.renderer.setPixelRatio(window.devicePixelRatio ? V ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio : 1)) : (this.renderer.setPixelRatio(window.devicePixelRatio ? V ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio : 1), this.renderer.shadowMap.enabled = !0), this.renderer.setSize(F, U), this.renderer.localClippingEnabled = !0, this.ground = new l.default(), this.ground.obj.position.z = -84, this.camera.add(this.ground.obj), this.waves = [];
        for (var p = 0; p < 4; ++p) {
          var x = new r.default();
          this.waves.push(x), x.obj.visible = !1, this.scene.add(x.obj);
        }
        var j = new s.MeshBasicMaterial({
          color: 16119285
        });
        this.combo = new s.Mesh(new s.CircleGeometry(.6, 30), j), this.combo.name = "combo", this.combo.position.x = -50, this.combo.rotation.x = -Math.PI / 2, this.scene.add(this.combo), this.renderer.shadowMap.enabled && (this.shadowTarget = new s.Mesh(new s.PlaneGeometry(.1, .1), j), this.shadowTarget.visible = !1, this.shadowTarget.name = "shadowTarget", this.scene.add(this.shadowTarget)), this.currentBlock = new n.default(0), this.initNextBlock = this.nextBlock = new n.default(1), this.nextBlock.obj.position.x = 20, this.bottle = new h.default({
          getSelectedBottleSkinResourceSync: O.default.getSelectedBottleSkinResourceSync
        }), this.bottle.obj.position.set(-10, -c.BLOCK.height / 2, 0), this.scene.add(this.bottle.obj), this.guider && (this.bottle.obj.position.set(-11, 50, 0), this.camera.position.x -= 19, setTimeout(function () {
          i.bottle.showup();
        }, 800), this.currentBlock.obj.position.x = -11, this.currentBlock.change(null, "gray", .7), this.scene.add(this.currentBlock.obj), this.guiderTimer = setInterval(function () {
          i.bottle.velocity.vz = 0, i.bottle.velocity.vy = 150, i.direction = new s.Vector2(1, 0);
          var e = new s.Vector3(1, 0, 0);
          i.bottle.jump(e.normalize()), i.hit = i.checkHit2(i.bottle, i.currentBlock);
        }, 3e3)), this.blocksInUse.push(this.nextBlock), this.blocksInUse.push(this.currentBlock), this.blocksId = c.LOCALBLOCK.slice(0), this.object_id_list = c.LOCALBLOCK.slice(0);
        for (p = 2; p < this.blocksId.length; ++p) {
          var R = new n.default(this.blocksId[p]);
          this.blocksPool.push(R);
        }
        var E = wx.getStorageSync("current_skin");
        this.addToPool(E), this.removeFromPool({
          skinId: E
        }), this.showRelaxScore = 0, this.relaxLeft = 0, this.onebyoneCtrl = new P.default(this, this.camera), this.full2D = new f.default({
          model: this.gameModel,
          camera: this.camera,
          onClickRank: this.gameCtrl.clickRank.bind(this.gameCtrl),
          onClickReplay: this.gameCtrl.clickReplay.bind(this.gameCtrl),
          onClickShare: this.gameCtrl.shareBattleCard.bind(this.gameCtrl),
          onClickPkRule: this.gameCtrl.showPkRule.bind(this.gameCtrl),
          onClosePkRule: this.gameCtrl.closePkRule.bind(this.gameCtrl),
          onClickSetPkDuration: this.gameCtrl.setPkDuration.bind(this.gameCtrl),
          onClickStart: this.gameCtrl.clickStart.bind(this.gameCtrl),
          onShowFriendRank: this.gameCtrl.showFriendRank.bind(this.gameCtrl),
          onBattlePlay: this.gameCtrl.onBattlePlay.bind(this.gameCtrl),
          onSubscribePk: this.gameCtrl.subscribePk.bind(this.gameCtrl),
          onGroupShare: this.gameCtrl.shareGroupRank.bind(this.gameCtrl),
          friendRankReturn: this.gameCtrl.friendRankReturn.bind(this.gameCtrl),
          groupPlayGame: this.gameCtrl.groupPlayGame.bind(this.gameCtrl),
          onLookersStart: this.gameCtrl.onViewerStart.bind(this.gameCtrl),
          onReturnWechat: function () {
            wx.exitMiniProgram();
          },
          onClickPureShare: function (e) {
            (0, y.pureShare)(e, i.gameModel.currentScore), i.reporter.bestShare(e);
          },
          newRelay: this.gameCtrl.gotoRelayMode.bind(this.gameCtrl),
          outRelay1: this.gameCtrl.outRelay1.bind(this.gameCtrl),
          outRelay2: this.gameCtrl.outRelay2.bind(this.gameCtrl),
          startRelay: this.gameCtrl.startRelay.bind(this.gameCtrl),
          watchRelay: this.gameCtrl.watchRelay.bind(this.gameCtrl),
          replayRelay: this.gameCtrl.replayRelay.bind(this.gameCtrl),
          shareRelay: this.gameCtrl.shareRelay.bind(this.gameCtrl),
          shareRelayLive: this.gameCtrl.shareRelayLive.bind(this.gameCtrl),
          quitRecord: this.gameCtrl.quitReview.bind(this.gameCtrl),
          goRecord: this.gameCtrl.initReview.bind(this.gameCtrl),
          skipRelayBeginner: this.gameCtrl.skipRelayBeginner.bind(this.gameCtrl)
        }), this.UI = new a.default(this.scene, this.camera, this.full2D, this), c.GAME.canShadow && (this.tailSystem = new u.default(this.scene, this.bottle)), this.addLight(), this.bindEvent(), this.viewer = new w.default(this.camera), this.rankSystem = new k.default(this), setTimeout(function () {
          i.audioManager && i.audioManager.icon && i.audioManager.icon.play();
        }, 300), this.UI.hideScore(), this.skinManager = new A.default(this), this.gameModel.init(), this.gameCtrl.init(), this.gameView.init(), wx.onShow(this.handleWxOnShowEvent.bind(this)), wx.onHide(this.handleWxOnHideEvent.bind(this)), wx.onError(this.handleWxOnError.bind(this)), wx.onAudioInterruptionBegin && wx.onAudioInterruptionBegin(this.handleInterrupt.bind(this)), g.default.sceneLogin(function (e) {
          console.log("scene initresp : ", JSON.stringify(e)), wx.setStorage({
            key: "ad",
            data: {
              ad_reward_quota: e.ad_reward_quota || 0,
              ad_banner_quota: e.ad_banner_quota || 0,
              t: +new Date()
            }
          });
        }), this.gameCtrl.firstInitGame(this.options), wx.showShareMenu(), wx.onShareAppMessage(function () {
          return {
            title: "一起来，跳一跳",
            imageUrl: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJHS4AOib6MiaPhwEaqw1NPcZGtgAGTlVJ4lrBAGtchhnXanMyo7q7toRpD4DukV5F2TA/0?wx_fmt=png"
          };
        }), null === (e = (t = wx).updateGameLivePanelMenu) || void 0 === e || e.call(t, {
          enableInvitationMenu: !0
        });
      }
    }, {
      key: "loopAnimate",
      value: function () {
        var e = this;
        if (this.clearTimer(), this.animating) {
          this.touchStartAnim({
            fromGuider: !0
          }), this.touchStartTimer = setTimeout(function () {
            e.bottle.velocity.vz = Math.min(.719 * c.BOTTLE.velocityZIncrement, 180), e.bottle.velocity.vy = Math.min(c.BOTTLE.velocityY + .719 * c.BOTTLE.velocityYIncrement, 180);
            var t = new s.Vector3(e.nextBlock.obj.position.x - e.bottle.obj.position.x, 0, e.nextBlock.obj.position.z - e.bottle.obj.position.z);
            e.direction = new s.Vector2(e.nextBlock.obj.position.x - e.bottle.obj.position.x, e.nextBlock.obj.position.z - e.bottle.obj.position.z), e.hit = e.checkHit2(e.bottle, e.currentBlock, e.nextBlock), e.thirdBlock = e.generateNextBlock(), e.thirdBlock && e.thirdBlock.obj && (e.thirdBlock.obj.position.set(39.7, 0, 0), e.tailSystem && e.tailSystem.correctPosition(), x.TweenAnimation.kill("progress"), e.bottle.jump(t.normalize()), e.currentBlock.rebound(), e.animateTimer = setTimeout(function () {
              e.loopAnimate();
            }, 3e3));
          }, 719);
        }
      }
    }, {
      key: "animate",
      value: function () {
        var e = this;
        this.firstAnimating = !0;
        for (var t = this, i = 0; i < 7; ++i) setTimeout(function (e) {
          return function () {
            if (("single" == t.mode && ("startPage" == t.stage || "friendRankList" == t.stage) || t.guider) && t.blocks && t.blocks.length < 7) {
              var i = new n.default(-1, e);
              i.showup(e), t.scene.add(i.obj), t.blocks.push(i), 0 == e && (this.nextBlock = i);
            }
          };
        }(i), 200 * i);
        this.animateGuiderTimer = setTimeout(function () {
          if ("single" == t.mode && ("startPage" == t.stage || "friendRankList" == t.stage) || t.guider) {
            e.bottle.velocity.vz = Math.min(.4 * c.BOTTLE.velocityZIncrement, 180), e.bottle.velocity.vy = Math.min(c.BOTTLE.velocityY + .4 * c.BOTTLE.velocityYIncrement, 180), e.direction = new s.Vector2(e.nextBlock.obj.position.x - e.bottle.obj.position.x, e.nextBlock.obj.position.z - e.bottle.obj.position.z);
            var i = new s.Vector3(e.nextBlock.obj.position.x - e.bottle.obj.position.x, 0, e.nextBlock.obj.position.z - e.bottle.obj.position.z);
            if (e.bottle.jump(i.normalize()), e.hit = -1, e.nextBlock = e.initNextBlock, e.blocks) {
              for (var o = 0, n = e.blocks.length; o < n; ++o) x.customAnimation.to(e.blocks[o].hitObj.material, 1, {
                opacity: 0,
                delay: .2 * o + .5
              });
              for (o = 1, n = e.blocks.length; o < n; ++o) x.customAnimation.to(e.blocks[o].obj.position, .5, {
                z: o % 2 == 0 ? 60 : -60,
                delay: .1 * o + 2.2
              });
              if (e.guider) {
                x.customAnimation.to(e.currentBlock.obj.position, .5, {
                  z: -60,
                  delay: 2.1
                });
                var a = e.currentBlock;
                setTimeout(function () {
                  a.obj.visible = !1;
                }, 3e3);
              }
              e.currentBlock = e.blocks[0], e.beginnerTimer = setTimeout(function () {
                if (("single" == t.mode && ("startPage" == t.stage || "friendRankList" == t.stage) || t.guider) && (t.guider && e.full2D.showBeginnerPage(), e.nextBlock.popup(), e.nextBlock.greenMaterial.color.setHex(6118749), e.nextBlock.whiteMaterial.color.setHex(11184810), e.scene.add(e.nextBlock.obj), e.blocks)) {
                  for (var i = 1, o = e.blocks.length; i < o; ++i) e.blocks[i].obj.visible = !1;
                  e.guider && (e.animating = !1), e.firstAnimating = !1;
                }
              }, 3e3), e.loopAnimateTimer = setTimeout(function () {
                "single" != t.mode || "startPage" != t.stage && "friendRankList" != t.stage || t.show && e.loopAnimate();
              }, 4500);
            }
          }
        }, 1500);
      }
    }, {
      key: "handleWxOnShowEvent",
      value: function (e) {
        (e.query && e.query.mode || this.options.query && this.options.query.mode) && (this.guider = !1);
        var t,
          i = this;
        (this.show = !0, this.reporter.enterReport(e.scene), this.guiderTimer && !this.guider && (clearInterval(this.guiderTimer), this.guiderTimer = null), !e.query.wxgamechallengeid || (0, c.gtVersion)("3.10.1")) ? (this.onshowAnimateTimer = setTimeout((t = this.firstInit, function () {
          "single" == i.mode && "startPage" == i.stage && !i.animateTimer && i.show && (i.blocks && i.blocks.length > 0 && !i.firstAnimating ? (this.animating = !0, i.loopAnimate()) : i.animating || !t || i.guider || (i.animating = !0, i.animate()));
        }), 1e3), this.firstInit ? this.firstInit = !1 : (this.gameCtrl.wxOnShow(e), z.default.startScenes("global"))) : wx.showModal({
          title: "提示",
          content: "当前微信版本过低，暂不支持擂台赛。请升级微信版本。"
        });
      }
    }, {
      key: "showCombo",
      value: function () {
        var e = this;
        setTimeout(function () {
          e.combo.position.set(e.nextBlock.obj.position.x, c.BLOCK.height / 2 + .15, e.nextBlock.obj.position.z);
        }, 200);
      }
    }, {
      key: "hideCombo",
      value: function () {
        this.combo.position.set(-30, 0, 0);
      }
    }, {
      key: "replayGame",
      value: function (e) {
        this.currentScore = 0, this.gameCtrl.onReplayGame(), this.audioManager.restart.seek(0), this.audioManager.restart.play(), this.guider ? (this.guiderTimer && (clearInterval(this.guiderTimer), this.guiderTimer = null), this.animating = !0, this.animate(), this.moveGradually(new s.Vector3(19, 0, 0), 3), this.randomSeed = this.generateSeed(), (0, j.setRandomSeed)(this.randomSeed)) : (this.resetScene(e), this.bottle.showup());
      }
    }, {
      key: "addWave",
      value: function (e) {
        for (var t = this, i = 0; i < e; ++i) setTimeout(function (e) {
          return function () {
            t.waves[e].obj.visible = !0, t.waves[e].obj.position.set(t.bottle.obj.position.x, c.BLOCK.height / 2 + .1 * e + 1, t.bottle.obj.position.z), (0, x.TweenAnimation)(t.waves[e].obj.scale.x, 4, 2 / (e / 2.5 + 2) * 500, "Linear", function (i, o) {
              void 0 !== i && (t.waves[e].obj.scale.x = i, t.waves[e].obj.scale.y = i, t.waves[e].obj.scale.z = i);
            }), (0, x.TweenAnimation)(t.waves[e].obj.material.opacity, 0, 2 / (e / 2.5 + 2) * 500, "Linear", function (i, o, s) {
              void 0 !== i && (t.waves[e].obj.material.opacity = i, s && t.waves[e].reset());
            });
          };
        }(i), 200 * i);
      }
    }, {
      key: "addLight",
      value: function () {
        var e = new s.AmbientLight(16777215, .8);
        if (this.shadowLight = new s.DirectionalLight(16777215, .28), this.shadowLight.position.set(0, 15, 10), this.renderer.shadowMap.enabled) {
          this.shadowLight.castShadow = !0, this.shadowLight.target = this.shadowTarget, this.shadowLight.shadow.camera.near = 5, this.shadowLight.shadow.camera.far = 32, this.shadowLight.shadow.camera.left = -10, this.shadowLight.shadow.camera.right = 10, this.shadowLight.shadow.camera.top = 10, this.shadowLight.shadow.camera.bottom = -10, this.shadowLight.shadow.mapSize.width = 512, this.shadowLight.shadow.mapSize.height = 512;
          var t = new s.PlaneGeometry(22, 25);
          this.shadowGround = new s.Mesh(t, new s.ShadowMaterial({
            transparent: !0,
            color: 0,
            opacity: .3
          })), this.shadowGround.receiveShadow = !0, this.shadowGround.position.x = 0, this.shadowGround.position.y = -18, this.shadowGround.position.z = -14, this.shadowGround.rotation.x = -Math.PI / 2, this.shadowLight.add(this.shadowGround), this.shadowGround.renderOrder = 1;
        }
        this.scene.add(this.shadowLight), this.scene.add(e);
      }
    }, {
      key: "wellJump",
      value: function (e) {
        var t = e.property_id,
          i = void 0 === t ? "" : t,
          o = e.item_id,
          n = void 0 === o ? "" : o,
          a = e.quick,
          r = void 0 !== a && a,
          l = (e.musicScore, e.noAnimation),
          h = void 0 !== l && l;
        this.stopBlockMusic(), this.bottle.velocity.vy = 160;
        var d = this.bottle.velocity.vy / c.GAME.gravity * 2;
        this.direction = new s.Vector2(this.nextBlock.obj.position.x - this.bottle.obj.position.x, this.nextBlock.obj.position.z - this.bottle.obj.position.z), this.direction.x = +this.direction.x.toFixed(2), this.direction.y = +this.direction.y.toFixed(2);
        var u = new s.Vector3(this.direction.x, 0, this.direction.y);
        return this.bottle.velocity.vz = this.direction.length() / d, h || (this.bottle.jump(u.normalize()), this.actionList.push([!1, !1, this.quick, n, i]), this.musicList.push(this.musicScore), this.touchStartTime.push(Date.now()), this.touchMoveList.push([!1, !1]), this.touchList.push([!1, !1])), this.hit = this.checkHit2(this.bottle, this.currentBlock, this.nextBlock), this.thirdBlock = this.generateNextBlock(), this.distance = c.BLOCK.minDistance + (0, j.random)() * (c.BLOCK.maxDistance - c.BLOCK.minDistance), this.distance = +this.distance.toFixed(2), this.quick = void 0 === r ? Date.now() - this.lastSucceedTime < 400 : r, "player" === this.mode && (++this.seq, this.gameSocket.sendCommand(this.seq, {
          type: 1,
          c: {
            x: this.currentBlock.obj.position.x,
            z: this.currentBlock.obj.position.z,
            order: this.currentBlock.order,
            type: this.currentBlock.type,
            r: this.currentBlock.radius,
            rs: this.currentBlock.radiusScale
          },
          n: {
            x: this.nextBlock.obj.position.x,
            z: this.nextBlock.obj.position.z,
            order: this.nextBlock.order,
            type: this.nextBlock.type,
            r: this.nextBlock.radius,
            rs: this.nextBlock.radiusScale
          },
          d: this.duration,
          b: {
            x: this.bottle.obj.position.x,
            y: +this.bottle.obj.position.y.toFixed(2),
            z: this.bottle.obj.position.z,
            vy: this.bottle.velocity.vy,
            vz: this.bottle.velocity.vz
          },
          t: 1 === this.hit || 7 === this.hit ? {
            order: this.thirdBlock.order,
            type: this.thirdBlock.type,
            r: this.thirdBlock.radius,
            rs: this.thirdBlock.radiusScale
          } : null,
          h: this.hit,
          di: this.distance,
          s: this.straight,
          q: this.quick,
          ca: {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
          },
          gd: {
            x: this.ground.obj.position.x,
            y: this.ground.obj.position.y,
            z: this.ground.obj.position.z
          },
          score: this.UI.score,
          usingPropType: 1
        })), this.hit;
      }
    }, {
      key: "observeWellJump",
      value: function () {
        this.stopBlockMusic(), this.bottle.velocity.vy = 160;
        var e = this.bottle.velocity.vy / c.GAME.gravity * 2;
        this.direction = new s.Vector2(this.nextBlock.obj.position.x - this.bottle.obj.position.x, this.nextBlock.obj.position.z - this.bottle.obj.position.z), this.direction.x = +this.direction.x.toFixed(2), this.direction.y = +this.direction.y.toFixed(2);
        var t = new s.Vector3(this.direction.x, 0, this.direction.y);
        this.bottle.velocity.vz = this.direction.length() / e, this.bottle.jump(t.normalize());
      }
    }, {
      key: "checkHit2",
      value: function (e, t, i, o) {
        var s = this.checkHit2Core(e, t, i, o);
        if ("relay" == this.mode && s && s.translate) {
          s.translate.x = s.translate.x.toFixed(2), s.translate.y = s.translate.y.toFixed(2);
          var n = "|cH:".concat(s.hit, ";fT:").concat(s.flyingTime, ",t:").concat(s.time, ",tsl:").concat(s.translate.x, ",").concat(s.translate.y, ";dst:").concat(JSON.stringify(s.destination), ",inY:").concat(s.initY, ",cb:").concat(this.currentBlock.order, ",").concat(this.currentBlock.obj.position.x.toFixed(2), ",").concat(this.currentBlock.obj.position.z.toFixed(2), ";nb:").concat(this.nextBlock.order, ",").concat(this.nextBlock.obj.position.x.toFixed(2), ",").concat(this.nextBlock.obj.position.z.toFixed(2));
          this.socketMonitor.log(n);
        } else i && i.order >= 13 && (1 == s.hit || 7 == s.hit ? this.eggBlocksSucceedCount[i.order] = this.eggBlocksSucceedCount[i.order] ? this.eggBlocksSucceedCount[i.order] + 1 : 1 : 2 != s.hit && (this.eggBlocksFailCount[i.order] = this.eggBlocksFailCount[i.order] ? this.eggBlocksFailCount[i.order] + 1 : 1));
        return s.hit;
      }
    }, {
      key: "checkHit2Core",
      value: function (e, t, i, o) {
        var n = e.velocity.vy / c.GAME.gravity * 2;
        o = o || +e.obj.position.y.toFixed(2);
        var a = c.BLOCK.height / 2 - o,
          r = +((-e.velocity.vy + Math.sqrt(Math.pow(e.velocity.vy, 2) - 2 * c.GAME.gravity * a)) / -c.GAME.gravity).toFixed(2);
        n = +(n -= r).toFixed(2);
        var l = [],
          h = new s.Vector2(e.obj.position.x, e.obj.position.z),
          d = this.direction.setLength(e.velocity.vz * n);
        if (h.add(d), e.destination = [+h.x.toFixed(2), +h.y.toFixed(2)], l.push(+h.x.toFixed(2), +h.y.toFixed(2)), this.animating) return {
          hit: 7
        };
        if (i) {
          var u,
            g = Math.pow(l[0] - i.obj.position.x, 2) + Math.pow(l[1] - i.obj.position.z, 2),
            b = i.getVertices();
          (0, m.default)(l, b) ? u = Math.abs(g) < .5 ? 1 : 7 : (0, m.default)([l[0] - c.BOTTLE.bodyWidth / 2, l[1]], b) || (0, m.default)([l[0], l[1] + c.BOTTLE.bodyDepth / 2], b) ? u = 5 : ((0, m.default)([l[0], l[1] - c.BOTTLE.bodyDepth / 2], b) || (0, m.default)([l[0] + c.BOTTLE.bodyDepth / 2, l[1]], b)) && (u = 3);
        }
        var p = t.getVertices();
        return (0, m.default)(l, p) ? u = 2 : ((0, m.default)([l[0], l[1] + c.BOTTLE.bodyDepth / 2], p) || (0, m.default)([l[0] - c.BOTTLE.bodyWidth / 2, l[1]], p)) && (u = u ? 6 : 4), {
          hit: u || 0,
          flyingTime: n,
          time: r,
          translate: d,
          destination: l,
          initY: o
        };
      }
    }, {
      key: "shuffleArray",
      value: function (e) {
        for (var t = e.length - 1; t > 0; t--) {
          var i = Math.floor((0, j.random)() * (t + 1)),
            o = e[t];
          e[t] = e[i], e[i] = o;
        }
      }
    }, {
      key: "useBlock",
      value: function (e) {
        for (var t, i = 0, o = e.length; i < o; ++i) for (var s = 0, n = this.blocksPool.length; s < n; ++s) if (this.blocksPool[s].order == e[i]) return this.blocksInUse.push(this.blocksPool[s]), t = this.blocksPool[s], this.blocksPool.splice(s, 1), t;
        return !1;
      }
    }, {
      key: "generateNextBlock",
      value: function () {
        var e;
        if (2 === this.reviewVersion) ;else {
          if (this.relaxLeft && (--this.relaxLeft, e = this.useBlock([33, 34, 35]))) return e;
          if (this.UI.score - this.showRelaxScore >= 1e3 && (e = this.useBlock([32]), this.showRelaxScore = this.UI.score, this.relaxLeft = 1, e)) return e;
        }
        var t = 5;
        this.UI.score > 1e3 ? t = 6 : this.succeedTime > 3e3 && (t = 7), this.animating || this.shuffleArray(this.blocksPool);
        for (var i = 0, o = this.blocksPool.length; i < o; ++i) if (this.succeedTime - this.lastAddBonus >= t && this.blocksPool[i].order >= 13 || this.succeedTime - this.lastAddBonus < t && this.blocksPool[i].order < 13) {
          if ((e = this.blocksPool[i]).order >= 13) {
            if (this.lastBonusOrder && this.lastBonusOrder == e.order || this.UI.score < 100 && 29 == e.order || [32, 33, 34, 35].indexOf(e.order) >= 0) continue;
            this.lastAddBonus = this.succeedTime, this.lastBonusOrder = e.order;
          }
          this.blocksInUse.push(e), this.blocksPool.splice(i, 1);
          break;
        }
        if (!e) {
          for (var s = this.blocksInUse.shift(); s.order >= 13;) s.obj.visible = !1, this.blocksPool.push(s), s = this.blocksInUse.shift();
          e = s, this.blocksInUse.push(e);
        }
        return e.obj.visible = !1, e.change(), e;
      }
    }, {
      key: "live",
      value: function () {
        var e = this;
        ++this.liveTime, setTimeout(function () {
          e.resetScene(null, {
            bottleShowupAnimation: !0
          });
        }, 2e3);
      }
    }, {
      key: "clearTimer",
      value: function () {
        this.animateTimer && (clearTimeout(this.animateTimer), this.animateTimer = null), this.loopAnimateTimer && (clearTimeout(this.loopAnimateTimer), this.loopAnimateTimer = null), this.beginnerTimer && (clearTimeout(this.beginnerTimer), this.beginnerTimer = null), this.touchStartTimer && (clearTimeout(this.touchStartTimer), this.touchStartTimer = null), this.suspendTimer && (clearTimeout(this.suspendTimer), this.suspendTimer = null);
      }
    }, {
      key: "setSpecialBaseStatus",
      value: function (e) {
        "relay" == this.mode ? this.use_mmpaybase = this.mmpay_status = this.use_wangzhe = !0 : (this.use_mmpaybase = e && void 0 !== e.use_mmpaybase ? e.use_mmpaybase : b.default.getMmpayBaseStatus(), this.mmpay_status = e && void 0 !== e.mmpay_status ? e.mmpay_status : b.default.getMmpayBonusStatus().status, this.mmpayScore = this.mmpay_status ? 20 : 5, this.mmpay_checksum = b.default.getMmpayBonusStatus().checksum, this.use_wangzhe = e && e.use_wangzhe || b.default.getWangZheBaseStatus());
      }
    }, {
      key: "addToPool",
      value: function (e) {
        var t = this,
          i = wx.getStorageSync("skins") || {};
        if (e && i[e]) {
          var o = i[e].skin_sn,
            s = i[e].object_id_list;
          this.object_id_list = s;
          for (var a = this.blocksId.concat(s).filter(function (e) {
              return !t.blocksId.includes(e);
            }), r = wx.getStorageSync("blocks") || {
              array: []
            }, l = r.array, h = !1, c = [], d = [], u = 0; u < a.length; ++u) this.blocksRemoved[a[u]] ? (c.push(this.blocksRemoved[a[u]]), d.push(a[u]), this.blocksRemoved[a[u]] = null) : r[a[u]] ? (c.push(new n.default(a[u], r[a[u]])), d.push(a[u])) : (h = !0, l.indexOf(a[u]) >= 0 && l.splice(l.indexOf(a[u]), 1));
          if (h) {
            for (u = 0; u < c.length; ++u) this.blocksRemoved[c[u].order] = c[u];
            r.array = l, wx.setStorage({
              key: "blocks",
              data: r
            }), wx.setStorage({
              key: "current_skin",
              data: null
            });
          } else this.skin_id = e, this.skin_sn = o, this.blocksPool = this.blocksPool.concat(c), this.blocksId = this.blocksId.concat(d);
        }
      }
    }, {
      key: "removeFromPool",
      value: function (e) {
        this.setSpecialBaseStatus(e);
        var t,
          i = e && e.version || c.VERSION;
        t = 3 == i || 4 == i ? [24, 26, 27] : [30, 31, 32, 33, 34, 35], !this.use_mmpaybase && t.indexOf(31) < 0 && t.push(31), !this.use_wangzhe && t.indexOf(30) < 0 && t.push(30), t.sort();
        for (var o = t.length - 1; o >= 0; --o) for (var s = this.blocksPool.length - 1; s >= 0; --s) if (this.blocksPool[s].order === t[o]) {
          var n = this.blocksPool.splice(s, 1);
          this.blocksRemoved[n[0].order] = n[0];
        }
        for (o = this.blocksPool.length - 1; o >= 0; --o) if (this.object_id_list.indexOf(this.blocksPool[o].order) < 0) {
          n = this.blocksPool.splice(o, 1);
          console.log("jahhahahahaha remove", n[0].order), this.blocksRemoved[n[0].order] = n[0];
        }
      }
    }, {
      key: "resetScene",
      value: function (e, t) {
        var i,
          o = this;
        if (console.log("resetScene", e, t, this.gameModel), this.reviewVersion = null, this.object_id_list = c.LOCALBLOCK.slice(0), this.skin_id = this.skin_sn = void 0, t && t.version && (this.reviewVersion = t.version), this.touchObserve = !1, this.firstAnimating = !1, this.myTurn = !1, this.clicked = !1, this.pendingReset = !1, this.blocks && this.blocks.length > 0) for (var s = 0, n = this.blocks.length; s < n; ++s) this.scene.remove(this.blocks[s].obj);
        this.blocks = null, "observe" == this.mode && this.audioManager.scale_intro && this.audioManager.scale_loop && (this.audioManager.scale_intro.stop(), this.audioManager.scale_loop.stop()), GameGlobal.seed && GameGlobal.matchType ? this.randomSeed = GameGlobal.seed : this.randomSeed = e || this.generateSeed(), console.log("randomSeed", this.randomSeed), (0, j.setRandomSeed)(this.randomSeed), this.actionList = [], this.musicList = [], this.touchList = [], this.touchStartTime = [], this.touchMoveList = [], this.clearTimer(), this.currentBlock && this.currentBlock.reset(), x.TweenAnimation.killAll(), this.animating = !1, "relay" == this.mode && t && t.gameLevel ? 1 == t.gameLevel ? (c.BLOCK.minRadiusScale = .7, c.BLOCK.maxRadiusScale = .9, c.BLOCK.minDistance = 1, c.BLOCK.maxDistance = 19) : 2 == t.gameLevel && (c.BLOCK.minRadiusScale = .6, c.BLOCK.maxRadiusScale = .8, c.BLOCK.minDistance = 1, c.BLOCK.maxDistance = 20) : (c.BLOCK.minRadiusScale = .8, c.BLOCK.maxRadiusScale = 1, c.BLOCK.minDistance = 1, c.BLOCK.maxDistance = 17);
        for (s = 0, n = this.blocksInUse.length; s < n; ++s) {
          var a = this.blocksInUse.pop();
          a.obj.visible = !1, a.reset(), this.blocksPool.push(a);
        }
        Object.keys(this.blocksRemoved).forEach(function (e) {
          var t = o.blocksRemoved[e];
          t.obj.visible = !1, t.reset(), o.blocksPool.push(t);
        }), this.blocksRemoved = {};
        for (s = 0, n = this.waves.length; s < n; ++s) this.waves[s].reset();
        this.blocksPool.sort(function (e, t) {
          return e.order - t.order;
        }), !t && "relay" != this.mode || t && void 0 === t.skinId ? (i = wx.getStorageSync("current_skin"), (t = t || {}).skinId = i) : i = t && t.skinId, this.addToPool(i), this.removeFromPool(t), this.currentBlock = this.blocksPool.shift(), this.currentBlock.obj.visible = !0, this.scene.add(this.currentBlock.obj), this.blocksInUse.push(this.currentBlock), this.shadowTarget && this.shadowTarget.position.set(0, 0, 0), this.nextBlock = this.blocksPool.shift(), this.currentBlock.change(null, null, 1), this.nextBlock.change(null, null, 1), this.nextBlock.obj.position.set(20, 0, 0), this.currentBlock.obj.position.set(0, 0, 0), this.nextBlock.obj.visible = !0, this.scene.add(this.nextBlock.obj), this.blocksInUse.push(this.nextBlock), this.bottle.reset(t), this.thirdBlock = null, this.UI.reset(), this.rankSystem.reset(), this.hit = null, this.lastAddBonus = -2, this.lastBonusOrder = null, this.succeedTime = 0, this.doubleHit = 0, this.camera.position.set(-17, 30, 26), this.shadowLight.position.set(0, 15, 10), t && t.bottleShowupAnimation && (this.bottle.showup(), this.audioManager.restart.seek(0), this.audioManager.restart.play()), this.showRelaxScore = 0, this.relaxLeft = 0, this.eggBlocksCount = {}, this.eggBlocksTriggerCount = {}, this.eggBlocksFailCount = {}, this.eggBlocksSucceedCount = {}, this.straight = !0, wx.triggerGC && wx.triggerGC();
      }
    }, {
      key: "generateSeed",
      value: function () {
        var e = b.default.getMyUserInfo();
        if (e && e.open_id) {
          var t = Date.now();
          return this.time_seed = t, (0, E.encryptSeed)(t, e.open_id);
        }
        return g.default.sendServerError(7), null === e && g.default.sendServerError(8), this.time_seed = void 0, Date.now();
      }
    }, {
      key: "stopLoopMusic",
      value: function () {
        this.audioManager.scale_intro && this.audioManager.scale_intro.stop(), this.audioManager.scale_loop && this.audioManager.scale_loop.stop(), this.stopBlockMusic();
      }
    }, {
      key: "generateHardDistances",
      value: function () {
        for (var e = 2 + Math.floor(2 * (0, j.random)()), t = [], i = 0; i < e; ++i) i < e - 1 ? t.push(c.BLOCK.minDistance + 2 * (0, j.random)()) : t.push(c.BLOCK.maxDistance - 2 * (0, j.random)());
        return t;
      }
    }, {
      key: "touchStartAnim",
      value: function (e) {
        "prepare" != this.bottle.status && (this.stopBlockMusic(), this.bottle.prepare(), this.currentBlock.shrink(), e && e.fromGuider || (this.audioManager.scale_intro.seek(0), this.audioManager.scale_intro.play(), this.mouseDownTime = Date.now(), this.onceTouchMoveList = []));
      }
    }, {
      key: "touchEndAnim",
      value: function (e, t, i, o, n) {
        "relay" == this.mode && x.TweenAnimation.kill("progress"), void 0 !== o && (this.musicScore = o), this.duration = e || (Date.now() - this.mouseDownTime) / 1e3, this.bottle.velocity.vz = Math.min(this.duration * c.BOTTLE.velocityZIncrement, 150), this.bottle.velocity.vz = +this.bottle.velocity.vz.toFixed(2), this.bottle.velocity.vy = Math.min(c.BOTTLE.velocityY + this.duration * c.BOTTLE.velocityYIncrement, 180), this.bottle.velocity.vy = +this.bottle.velocity.vy.toFixed(2), this.direction = new s.Vector2(this.nextBlock.obj.position.x - this.bottle.obj.position.x, this.nextBlock.obj.position.z - this.bottle.obj.position.z), this.direction.x = +this.direction.x.toFixed(2), this.direction.y = +this.direction.y.toFixed(2);
        var a = new s.Vector3(this.direction.x, 0, this.direction.y);
        if (this.hit = this.checkHit2(this.bottle, this.currentBlock, this.nextBlock, t), this.distance = c.BLOCK.minDistance + (0, j.random)() * (c.BLOCK.maxDistance - c.BLOCK.minDistance), this.distance = +this.distance.toFixed(2), this.straight = (0, j.random)() > .5 ? 1 : 0, 1 === this.hit || 7 === this.hit) {
          var r = this.generateNextBlock();
          r && r.order >= 13 && (this.eggBlocksCount[r.order] = this.eggBlocksCount[r.order] ? this.eggBlocksCount[r.order] + 1 : 1), this.thirdBlock = r, this.quick = void 0 === i ? Date.now() - this.lastSucceedTime < 800 || !1 : i, "relay" == this.mode && (this.quick = !1);
        }
        return n && n.noAnimation || (this.audioManager.scale_intro.stop(), this.audioManager.scale_loop.stop(), this.currentBlock.rebound(), this.bottle.jump(a.normalize()), this.hideCombo()), this.hit;
      }
    }, {
      key: "bindEvent",
      value: function () {
        var e = this,
          t = this;
        R.default.on(c.EVENT.GOTOSINGLESTARTPAGE, function (t, i) {
          e.clearTimer(), e.animating = !0, console.log("gotoSinglepage"), e.loopAnimate();
        }), R.default.on(c.EVENT.TRIGGER_EGG, function (t, i) {
          var o = i.order;
          e.eggBlocksTriggerCount[o] = e.eggBlocksTriggerCount[o] ? e.eggBlocksTriggerCount[o] + 1 : 1;
        }), t.instructionCtrl.bindCmdHandler(function (e) {
          if (-1 == e.type) return t.gameCtrl.showPlayerGG(e.s), void t.instructionCtrl.onCmdComplete();
          if (0 == e.type) return t.socketFirstSync = !0, t.bottle.resetPosition(), t.UI.scoreText.changeStyle({
            textAlign: "center"
          }), t.UI.setScore(0), void t.instructionCtrl.onCmdComplete();
          if (t.gameCtrl.showPlayerWaiting(), e.score != t.UI.score && (t.UI.score = e.score, t.UI.setScore(e.score)), e && e.b && e.b.vy) {
            if (t.socketFirstSync && (t.socketFirstSync = !1, t.camera.position.set(e.ca.x, e.ca.y, e.ca.z), t.ground.obj.position.set(e.gd.x, e.gd.y, e.gd.z)), t.currentBlock.order != e.c.order || t.nextBlock.order != e.n.order) {
              for (var i = 0, o = t.blocksInUse.length; i < o; ++i) {
                var n = t.blocksInUse.pop();
                t.scene.remove(n.obj), t.blocksPool.push(n);
              }
              var a = t.blocksPool.findIndex(function (t) {
                return t.order == e.c.order;
              });
              t.currentBlock = t.blocksPool[a];
              var r = t.blocksPool.splice(a, 1);
              t.blocksInUse.push(r[0]);
              var l = t.blocksPool.findIndex(function (t) {
                return t.order == e.n.order;
              });
              t.nextBlock = t.blocksPool[l];
              r = t.blocksPool.splice(l, 1);
              t.blocksInUse.push(r[0]);
            }
            t.scene.add(t.currentBlock.obj), t.scene.add(t.nextBlock.obj), t.currentBlock.obj.visible = !0, t.nextBlock.obj.visible = !0, t.currentBlock.obj.position.x = e.c.x, t.currentBlock.obj.position.z = e.c.z, t.currentBlock.change(e.c.r, e.c.type, e.c.rs), t.nextBlock.obj.position.x = e.n.x, t.nextBlock.obj.position.z = e.n.z, t.nextBlock.change(e.n.r, e.n.type, e.n.rs), t.bottle.obj.position.set(e.b.x, c.BLOCK.height / 2, e.b.z), t.bottle.velocity.vz = e.b.vz, t.bottle.velocity.vy = e.b.vy, t.distance = e.di, t.straight = e.s;
            var h = new s.Vector3(t.nextBlock.obj.position.x - t.bottle.obj.position.x, 0, t.nextBlock.obj.position.z - t.bottle.obj.position.z);
            if (t.direction = new s.Vector2(t.nextBlock.obj.position.x - t.bottle.obj.position.x, t.nextBlock.obj.position.z - t.bottle.obj.position.z), t.checkHit2(t.bottle, t.currentBlock, t.nextBlock, e.b.y), t.quick = e.q, e.t) {
              var d = t.blocksPool.findIndex(function (t) {
                return t.order == e.t.order;
              });
              if (d > -1) {
                t.thirdBlock = t.blocksPool[d];
                r = t.blocksPool.splice(d, 1);
                t.blocksInUse.push(t.thirdBlock);
              } else t.thirdBlock = t.blocksInUse.find(function (t) {
                return t.order == e.t.order;
              }), t.thirdBlock && t.thirdBlock.obj && t.scene.remove(t.thirdBlock.obj);
              t.thirdBlock.change(e.t.r, e.t.type, e.t.rs);
            }
            if (t.hit = e.h, t.tailSystem && t.tailSystem.correctPosition(), isNaN(e.usingPropType)) {
              t.audioManager.scale_intro.seek(0), t.audioManager.scale_intro.play(), t.bottle.prepare(), t.currentBlock.shrink();
              var u = {
                  x: e.ca.x,
                  y: e.ca.y,
                  z: e.ca.z
                },
                m = {
                  x: e.gd.x,
                  y: e.gd.y,
                  z: e.gd.z
                };
              t.instructionCtrl.icTimeout = setTimeout(function () {
                t.audioManager.scale_intro.stop(), t.audioManager.scale_loop.stop(), 15 == t.currentBlock.order && t.currentBlock.hideGlow(), t.currentBlock.rebound(), t.camera.position.set(u.x, u.y, u.z), t.ground.obj.position.set(m.x, m.y, m.z), u = null, m = null, t.bottle.jump(h.normalize());
              }, 1e3 * e.d);
            } else _.default.observeUsingProp(e.usingPropType, t);
            t.stopBlockMusic(), e = null;
          } else t.instructionCtrl.onCmdComplete();
        }), t.gameSocket.onReciveCommand(function (e, i) {
          "observe" == t.mode && t.instructionCtrl.onReceiveCommand(i, e);
        }), t.gameSocket.onPeopleCome(function (e) {
          t.gameCtrl.onPeopleCome(e);
        }), t.gameSocket.onPlayerOut(function () {
          t.gameCtrl.onPlayerOut();
        }), t.gameSocket.onJoinSuccess(function (e) {
          t.gameCtrl.socketJoinSuccess(e), "observe" == t.mode && (t.bottle.obj.position.set(8, -c.BLOCK.height / 2, 0), t.camera.position.set(-17, 30, 26), t.shadowLight.position.set(0, 15, 10), t.currentBlock && (t.currentBlock.obj.visible = !1), t.nextBlock && (t.nextBlock.obj.visible = !1));
        }), t.gameSocket.onRelayCmdCome(t.relayInstructionCtrl.cmdCome.bind(t.relayInstructionCtrl)), canvas.addEventListener("touchstart", function (e) {
          if ((!GameGlobal.minigameTouchEventHandler || GameGlobal.minigameTouchEventHandler.touchStartHandler(e)) && !t.pendingReset) if (e.touches.length >= 2) t.touchObserve = !0;else if (console.log("!!! touchstart", t.mode, t.stage), "relay" == t.mode && "game" == t.stage && t.full2D.doTouchStartEvent(e), "relay" != t.mode || "game" != t.stage || !t.clicked && t.myTurn) if (t.gameCtrl.reviewCtrl.isInThisPage && t.gameCtrl.reviewCtrl.reviewPage) t.gameCtrl.reviewCtrl.reviewPage.doTouchStartEvent(e);else {
            if ("single" == t.mode || "player" == t.mode || "rankGameChallenge" === t.mode) {
              var i = e.changedTouches[0].clientX,
                o = e.changedTouches[0].clientY;
              if ("game" == t.stage && !t.is_from_wn && !t.guider) {
                if (i < .13 * F && o > .88 * U) return "prepare" == t.bottle.status && (t.touchObserve = !0), void t.gameCtrl.shareObservCard();
                if (t.UI.adBoard && i >= c.AD_BOARD.UI_left && i <= c.AD_BOARD.UI_right && o <= c.AD_BOARD.UI_bottom && o >= c.AD_BOARD.UI_top) return void R.default.emit(c.EVENT.TRIGGER_AD_JUMP, {});
                if (t.UI.propBoard && i >= c.PROP_BOARD.p.UI_left && i <= c.PROP_BOARD.p.UI_right && o <= c.PROP_BOARD.p.UI_bottom && o >= c.PROP_BOARD.p.UI_top) return void ("stop" == t.bottle.status && R.default.emit(c.EVENT.TRIGGER_PROP, {}));
              }
            }
            if ("friendRankList" != t.stage && "battlePage" != t.stage && "groupRankList" != t.stage && "singleSettlementPgae" != t.stage && "startPage" != t.stage) {
              if ("viewerWaiting" != t.stage && "viewerGG" != t.stage && "viewerOut" != t.stage) {
                if ("relayRoom" != t.stage) {
                  if ("getGiftPage" != t.mode) {
                    if ("game" == t.stage) {
                      if ("observe" === t.mode) return;
                      if (!("prepare" !== t.bottle.status || t.pendingReset || t.guider && t.animating) && 1 == e.targetTouches.length) return t.touchObserve ? void (t.touchObserve = !1) : void t.handleInterrupt();
                      "stop" !== t.bottle.status || t.pendingReset || t.guider && t.animating || t.touchStartAnim();
                    }
                  } else t.full2D.doTouchStartEvent(e);
                } else t.full2D.doTouchStartEvent(e);
              } else t.full2D.doTouchStartEvent(e);
            } else t.full2D.doTouchStartEvent(e);
          }
        });
        canvas.addEventListener("touchcancel", function (e) {
          t.handleInterrupt();
        }), canvas.addEventListener("touchend", function (e) {
          if (!GameGlobal.minigameTouchEventHandler || GameGlobal.minigameTouchEventHandler.touchEndHandler(e)) {
            e.changedTouches[0].clientX, e.changedTouches[0].clientY;
            if ("relay" == t.mode && "game" == t.stage && t.full2D.doTouchEndEvent(e), "relay" != t.mode || "game" != t.stage || !t.clicked && t.myTurn) if (t.gameCtrl.reviewCtrl.isInThisPage && t.gameCtrl.reviewCtrl.reviewPage) t.gameCtrl.reviewCtrl.reviewPage.doTouchEndEvent(e);else if ("loading" != t.stage && "relay" != t.stage) {
              if ("singleSettlementPgae" != t.stage && "startPage" != t.stage) {
                if ("viewerWaiting" != t.stage && "viewerGG" != t.stage && "viewerOut" != t.stage) {
                  if ("friendRankList" != t.stage) {
                    if ("battlePage" != t.stage) {
                      if ("groupRankList" != t.stage) {
                        if ("getGiftPage" != t.mode) return "relayRoom" == t.stage ? (console.log(t.stage), void t.full2D.doTouchEndEvent(e)) : void ("game" == t.stage && ("prepare" !== t.bottle.status || t.pendingReset || t.guider && t.animating || (t.touchEndAnim(), "player" === t.mode && (++t.seq, t.gameSocket.sendCommand(t.seq, {
                          type: 1,
                          c: {
                            x: t.currentBlock.obj.position.x,
                            z: t.currentBlock.obj.position.z,
                            order: t.currentBlock.order,
                            type: t.currentBlock.type,
                            r: t.currentBlock.radius,
                            rs: t.currentBlock.radiusScale
                          },
                          n: {
                            x: t.nextBlock.obj.position.x,
                            z: t.nextBlock.obj.position.z,
                            order: t.nextBlock.order,
                            type: t.nextBlock.type,
                            r: t.nextBlock.radius,
                            rs: t.nextBlock.radiusScale
                          },
                          d: t.duration,
                          b: {
                            x: t.bottle.obj.position.x,
                            y: +t.bottle.obj.position.y.toFixed(2),
                            z: t.bottle.obj.position.z,
                            vy: t.bottle.velocity.vy,
                            vz: t.bottle.velocity.vz
                          },
                          t: 1 === t.hit || 7 === t.hit ? {
                            order: t.thirdBlock.order,
                            type: t.thirdBlock.type,
                            r: t.thirdBlock.radius,
                            rs: t.thirdBlock.radiusScale
                          } : null,
                          h: t.hit,
                          di: t.distance,
                          s: t.straight,
                          q: t.quick,
                          ca: {
                            x: t.camera.position.x,
                            y: t.camera.position.y,
                            z: t.camera.position.z
                          },
                          gd: {
                            x: t.ground.obj.position.x,
                            y: t.ground.obj.position.y,
                            z: t.ground.obj.position.z
                          },
                          score: t.UI.score
                        })), "observe" != t.mode && "review" != t.mode && (t.actionList.push([t.duration, +t.bottle.obj.position.y.toFixed(2), t.quick]), t.musicList.push(t.musicScore), "relay" == t.mode && !t.isObserver && t.onebyoneCtrl.data && (t.clicked = !0, R.default.emitSync(c.EVENT.NOWPLAYERJUMP, {
                          jump_succ: 1 == t.hit || 7 == t.hit || 2 == t.hit ? 1 : 0,
                          msginfo: JSON.stringify({
                            duration: t.duration,
                            initY: +t.bottle.obj.position.y.toFixed(2)
                          }),
                          msg_seq: t.onebyoneCtrl.data.msg_seq
                        })), t.touchStartTime.push(t.mouseDownTime), e.changedTouches && e.changedTouches[0] && (t.touchMoveList.push(t.onceTouchMoveList), t.touchList.push([e.changedTouches[0].clientX, e.changedTouches[0].clientY]))))));
                        t.full2D.doTouchEndEvent(e);
                      } else t.full2D.doTouchEndEvent(e);
                    } else t.full2D.doTouchEndEvent(e);
                  } else t.full2D.doTouchEndEvent(e);
                } else t.full2D.doTouchEndEvent(e);
              } else t.full2D.doTouchEndEvent(e);
            } else t.full2D.doTouchEndEvent(e);
          }
        }), canvas.addEventListener("touchmove", function (e) {
          if (!GameGlobal.minigameTouchEventHandler || GameGlobal.minigameTouchEventHandler.touchMoveHandler(e)) if (console.log("!!! touchmove", t.mode, t.stage), "relay" == t.mode && ("game" == t.stage && t.full2D.doTouchMoveEvent(e), "relayRoom" == t.stage && e.changedTouches[0].clientX > 60 && e.changedTouches[0].clientX < 340 && e.changedTouches[0].clientY > 285 && e.changedTouches[0].clientY < 570 && (console.log("!!! touchmove outDate rank", e), t.full2D.doTouchMoveEvent(e))), "getGiftPage" != t.mode) {
            if (t.gameCtrl.reviewCtrl.isInThisPage && t.gameCtrl.reviewCtrl.reviewPage && t.gameCtrl.reviewCtrl.reviewPage.doTouchMoveEvent(e), "prepare" == t.bottle.status) {
              if (t.onceTouchMoveList.length >= 10) return;
              t.onceTouchMoveList.push(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
            "battlePage" != t.stage && "friendRankList" != t.stage && "groupRankList" != t.stage && "startPage" != t.stage || t.full2D.doTouchMoveEvent(e);
          } else t.full2D.doTouchMoveEvent(e);
        });
      }
    }, {
      key: "report",
      value: function (e) {
        Math.random() <= 1 && (console.log("日志上报：" + e), g.default.logReport("|SM|:" + e));
      }
    }, {
      key: "stopBlockMusic",
      value: function () {
        this.currentBlock.whenLeave && this.currentBlock.whenLeave(), this.currentBlock.musicName && this.audioManager[this.currentBlock.musicName].stop(), this.currentBlock.registerEndAudio && this.currentBlock.registerEndAudio(), this.audioManager.clearTimer(), this.audioManager.setTimerFlag(!1), this.musicTimer && (clearTimeout(this.musicTimer), this.musicTimer = null);
      }
    }, {
      key: "handleNetworkFucked",
      value: function (e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "网络异常,点击确定进入游戏";
        this.rollBackToSingle(), e && wx.showModal({
          title: "提示",
          content: t,
          showCancel: !1
        });
      }
    }, {
      key: "handleSocketFucked",
      value: function () {
        this.gameSocket.close(), "player" == this.mode && (this.shareObservCardFail(), this.updateUI()), "observe" == this.mode && this.handleNetworkFucked(!0);
      }
    }, {
      key: "handleInterrupt",
      value: function () {
        "prepare" == this.bottle.status && (this.bottle.velocity.vz = 0, this.bottle.velocity.vy = 150, this.bottle.jump(new s.Vector3(1, 0, 0).normalize()), this.currentBlock.rebound(), this.audioManager.scale_loop.stop(), this.direction = new s.Vector2(1, 0), this.hit = this.checkHit2(this.bottle, this.currentBlock, this.nextBlock), "relay" == this.mode && (R.default.emit(c.EVENT.SEND_REALTIME_MSG_TO_CTRL, {
          time: -1
        }), this.relayHandleInterrupt = !0));
      }
    }, {
      key: "relayBottleReset",
      value: function (e) {
        this.bottle.reset({
          preserveDirection: !0,
          bottleSkin: null
        }), this.bottle.obj.position.x = this.currentBlock.obj.position.x, this.bottle.obj.position.z = this.currentBlock.obj.position.z, e && e.noAnimation || (this.bottle.showup(), this.audioManager.restart.seek(0), this.audioManager.restart.play());
      }
    }, {
      key: "handleWxOnError",
      value: function (e) {
        var t = (null == p.default.serverConfig.bad_js_ratio ? 1e6 : p.default.serverConfig.bad_js_ratio) / 1e6 || 1;
        Math.random() <= t && g.default.badReport(e.message, e.stack);
      }
    }, {
      key: "sendServerError",
      value: function (e) {
        g.default.sendServerError(e);
      }
    }, {
      key: "initMinigameCenter",
      value: function () {
        var e,
          t = this;
        GameGlobal.gameID = 1, GameGlobal.cacheScore = 0, GameGlobal.minigameCenter.setTabs(["game"]), "startPage" == this.stage && GameGlobal.minigameCenter.show();
        var i = c.FRUSTUMSIZE / U;
        GameGlobal.minigameCenter.on("render", function () {
          if (e || GameGlobal.minigameRenderTexture || (console.log("初始化社交组件渲染"), e = GameGlobal.minigameCenter.getCanvas(), function () {
            GameGlobal.minigameRenderTexture = new s.Texture(e.canvas);
            var i = !0;
            (V && (0, D.gtAppVersion)("8.0.31") || K && (0, D.gtAppVersion)("8.0.27") || N) && (i = !1), i && (GameGlobal.minigameRenderTexture.flipY = !1);
            var o = new s.MeshBasicMaterial({
              map: GameGlobal.minigameRenderTexture,
              transparent: !0
            });
            o.map.minFilter = s.LinearFilter;
            var n = new s.PlaneBufferGeometry(1, 1);
            GameGlobal.minigameMesh = new s.Mesh(n, o), GameGlobal.minigameMesh.position.y = 0, GameGlobal.minigameMesh.position.x = 0, GameGlobal.minigameMesh.position.z = 10, GameGlobal.minigameMesh.visible = !0, GameGlobal.minigameMesh.name = "minigamePlugin", t.camera.add(GameGlobal.minigameMesh);
          }(), GameGlobal.minigameTouchEventHandler = GameGlobal.minigameCenter.getTouchEventHandler()), GameGlobal.minigameCenter && e && GameGlobal.minigameMesh) {
            var o = i * e.width,
              n = i * e.height,
              a = i * (U / 2 - e.height / 2 - e.y),
              r = i * (e.x + e.width / 2 - F / 2);
            GameGlobal.minigameMesh.scale.x !== o && (GameGlobal.minigameMesh.scale.x = o), GameGlobal.minigameMesh.scale.y !== n && (GameGlobal.minigameMesh.scale.y = n), GameGlobal.minigameMesh.position.y !== a && (GameGlobal.minigameMesh.position.y = a), GameGlobal.minigameMesh.position.x !== r && (GameGlobal.minigameMesh.position.x = r), GameGlobal.minigameRenderTexture && (GameGlobal.minigameRenderTexture.needsUpdate = !0);
          }
        }), GameGlobal.minigameCenter.on("gameStart", function (e) {
          GameGlobal.cacheScore = e.score || 0, GameGlobal.matchType = e.matchType, GameGlobal.matchTypes = e.matchTypes, GameGlobal.seed = +e.matchID.match(/\d+/g).join(""), GameGlobal.gameID += 1, GameGlobal.controller.gameCtrl.clickReplay();
        }), GameGlobal.minigameCenter.on("gameOver", function (e) {
          x.TweenAnimation.killAll(), GameGlobal.controller.gameCtrl.gameOver(GameGlobal.controller.currentScore), GameGlobal.controller.gameCtrl.gameOverShowPage(), GameGlobal.cacheScore = 0, GameGlobal.matchType = 0;
        });
      }
    }]);
  }();
if (wx.getLaunchOptionsSync) {
  var J = wx.getLaunchOptionsSync();
  GameGlobal.controller = new Y(J);
} else GameGlobal.controller = new Y();
var X = Date.now();
!function e() {
  var t = Date.now(),
    i = t - X;
  if (X = t, requestAnimationFrame(e, !0), i > 100) return;
  GameGlobal.controller.update(i / 1e3);
}();
