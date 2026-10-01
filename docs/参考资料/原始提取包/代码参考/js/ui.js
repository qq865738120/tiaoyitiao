// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../@babel/runtime/helpers/classCallCheck"),
  i = require("../@babel/runtime/helpers/createClass"),
  o = require("./config"),
  a = e(require("./text")),
  s = e(require("./ui/adBoard")),
  r = e(require("./ui/propBoard")),
  h = e(require("./ui/propAniManager")),
  c = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth, exports.default = function () {
  return i(function e(i, s, r, h) {
    t(this, e), this.game = h, this.full2D = r, this.scene = i, this.camera = s, this.score = 0, this.double = 1, this.scoreText = new a.default("0", {
      fillStyle: 2434341,
      sumScore: !0,
      opacity: .8
    }), this.resetScorePos(), this.scoreText.obj.matrixAutoUpdate = !1, this.camera.add(this.scoreText.obj), this.championText = new a.default("擂主得分", {
      fillStyle: 0,
      opacity: .3,
      chinese: !0
    }), this.championText.obj.position.set(o.PK_TEXT_POS.x, o.PK_TEXT_POS.y, -10), this.championText.obj.updateMatrix(), this.championText.obj.matrixAutoUpdate = !1, this.championText.obj.visible = !1, this.camera.add(this.championText.obj), this.championScoreText = new a.default("0", {
      fillStyle: 0,
      opacity: .3
    }), this.championScoreText.obj.matrixAutoUpdate = !1, this.championScoreText.obj.visible = !1, this.camera.add(this.championScoreText.obj);
  }, [{
    key: "resetScorePos",
    value: function () {
      this.scoreText.obj.position.set(o.GAME_SCORE_POS.x, o.GAME_SCORE_POS.y, -10), this.scoreText.obj.scale.set(1, 1, 1), this.scoreText.obj.updateMatrix();
    }
  }, {
    key: "resetObservePos",
    value: function () {
      this.scoreText.obj.position.set(o.OBSERVE_SCORE_POS.x, o.OBSERVE_SCORE_POS.y, -10), this.scoreText.obj.scale.set(1, 1, 1), this.scoreText.obj.updateMatrix();
    }
  }, {
    key: "resetRelayPos",
    value: function () {
      this.scoreText.obj.position.x = o.RELAY_SCORE_POS.x, this.scoreText.obj.position.y = o.RELAY_SCORE_POS.y, this.scoreText.obj.scale.set(.8, .8, .8), this.scoreText.obj.updateMatrix();
    }
  }, {
    key: "reset",
    value: function () {
      console.log("!!! reset"), GameGlobal.matchType ? (this.scoreText.setScore(GameGlobal.cacheScore), this.score = GameGlobal.cacheScore) : (this.scoreText.setScore(0), this.score = 0), this.double = 1;
    }
  }, {
    key: "update",
    value: function () {}
  }, {
    key: "hideScore",
    value: function () {
      this.scoreText.obj.visible = !1;
    }
  }, {
    key: "showScore",
    value: function () {
      this.scoreText.obj.visible = !0;
    }
  }, {
    key: "hideChampionScore",
    value: function () {
      console.log("!!! hideChampionScore"), this.championText.obj.visible = !1, this.championScoreText.obj.visible = !1;
    }
  }, {
    key: "showChampionScore",
    value: function (e) {
      console.log("!!! showChampionScore", e), this.championText.obj.visible = !0, this.championScoreText.setScore(e);
      var t = (0, o.getPKScorePos)(e);
      this.championScoreText.obj.position.set(t.x, t.y, -10), this.championScoreText.obj.updateMatrix(), this.championScoreText.obj.visible = !0;
    }
  }, {
    key: "addScore",
    value: function (e, t, i, o) {
      return o ? (this.score += e, void this.setScore(this.score)) : (t ? 1 === this.double ? this.double = 2 : this.double += 2 : this.double = 1, i && this.double <= 2 && (this.double *= 2), this.double = Math.min(32, this.double), e *= this.double, this.score += e, this.setScore(this.score), e);
    }
  }, {
    key: "showAdAvator",
    value: function (e, t, i, o) {
      this.adBoard && this.adBoard.destroy && (console.error("Already exist adBoard"), this.adBoard.destroy()), this.adBoard = new s.default({
        camera: e,
        trademark_url: t,
        ad_url: i,
        navigateToMiniProgramData: o
      }), this.game.reporter.rpShowAdCard();
    }
  }, {
    key: "hideAdAvator",
    value: function () {
      this.adBoard && this.adBoard.destroy && this.adBoard.destroy(), this.adBoard = null;
    }
  }, {
    key: "showProp",
    value: function () {
      var e = this,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
      this.propBoard && this.adBoard.destroy && this.propBoard.destroy(), this.propBoard = new r.default({
        camera: this.camera,
        game: this.game,
        usingId: t,
        destroyCb: function () {
          e.hideProp();
        }
      });
    }
  }, {
    key: "hideProp",
    value: function () {
      this.propBoard && this.propBoard.destroy && this.propBoard.destroy(), this.propBoard = null;
    }
  }, {
    key: "audienceWatchPropAni",
    value: function (e) {
      this.propAniManager || (this.propAniManager = new h.default({
        camera: this.camera,
        game: this.game
      })), this.propAniManager.show(e);
    }
  }, {
    key: "setScore",
    value: function (e) {
      GameGlobal.minigameCenter && GameGlobal.matchType && GameGlobal.minigameCenter.reportMatchScore(this.score, GameGlobal.gameID), this.scoreText.setScore(e), o.BLOCK.minRadiusScale -= .005, o.BLOCK.minRadiusScale = Math.max(.25, o.BLOCK.minRadiusScale), o.BLOCK.maxRadiusScale -= .005, o.BLOCK.maxRadiusScale = Math.max(o.BLOCK.maxRadiusScale, .6), o.BLOCK.maxDistance += .03, o.BLOCK.maxDistance = Math.min(22, o.BLOCK.maxDistance);
    }
  }]);
}();
