// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var i = require("../../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/classCallCheck"),
  s = require("../../../@babel/runtime/helpers/createClass"),
  t = require("../pages2d/base"),
  o = require("../../lib/animation"),
  r = (require("../../config"), i(require("../../lib/three")));
exports.default = function () {
  return s(function i(s) {
    var t = s.game,
      o = s.onChangeProgress,
      r = s.onHide,
      n = s.onShare,
      a = s.week_best_score,
      h = s.onSave,
      c = s.is_self,
      g = s.is_from_share,
      l = s.onOpenSharePage,
      u = s.onCloseSharePage,
      d = s.maxBonusScore,
      P = void 0 === d ? 1 : d,
      p = s.succeedTime,
      f = void 0 === p ? 0 : p;
    e(this, i), this.game = t, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.onHide = r, this.onShare = n, this.onSave = h, this.onChangeProgress = o, this.week_best_score = a, this.is_self = c, this.is_from_share = g, this.onOpenSharePage = l, this.onCloseSharePage = u, this.name = "reviewPage", this.maxBonusScore = P, this.succeedTime = f;
    var m = this.changePositionPixel2DTo3D(31, 610);
    this.progressY = m.y, this.leftPositionStartX = m.x, this.rightPositionEndX = -m.x, this.barPositionCenter = this.leftPositionStartX + (Math.abs(this.leftPositionStartX) + this.rightPositionEndX) / 2, this.PositionRange = this.rightPositionEndX + Math.abs(this.leftPositionStartX);
  }, [{
    key: "changePositionPixel2DTo3D",
    value: function (i, e) {
      var s = (0, t.cx)(i),
        o = (0, t.cy)(e);
      return {
        x: (s - t.WIDTH / 2) / t.WIDTH * t.frustumSizeWidth,
        y: (t.HEIGHT / 2 - o) / t.HEIGHT * t.frustumSizeHeight
      };
    }
  }, {
    key: "changePositionCSS2DTo3D",
    value: function (i, e) {
      return {
        x: (i - t.W / 2) / t.W * t.frustumSizeWidth,
        y: (t.H / 2 - e) / t.H * t.frustumSizeHeight
      };
    }
  }, {
    key: "setScorePostion",
    value: function () {
      var i = this.changePositionPixel2DTo3D(40, 201);
      this.UI.scoreText.obj.position.x = i.x, this.UI.scoreText.obj.position.y = i.y, this.UI.scoreText.changeStyle({
        textAlign: "left"
      }), this.UI.showScore();
    }
  }, {
    key: "addProgressBar",
    value: function () {
      var i = new r.PlaneBufferGeometry(this.PositionRange, .3, 30);
      this.progress = new r.Object3D();
      var e = new r.CircleGeometry(.6, 40, 0, 2 * Math.PI),
        s = new r.CircleGeometry(.15, 15, 0, Math.PI);
      this.roundCircle = new r.Mesh(e, new r.MeshBasicMaterial({})), this.roundCircleBack = new r.Mesh(s, new r.MeshBasicMaterial({
        transparent: !0,
        opacity: .25,
        color: 16777215
      })), this.secondRoundCircle = new r.Mesh(s, new r.MeshBasicMaterial({})), this.secondRoundCircleBack = this.roundCircleBack.clone(), this.backgroundBar = new r.Mesh(i, new r.MeshBasicMaterial({
        transparent: !0,
        opacity: .15,
        color: 16777215
      })), this.progressBar = new r.Object3D(), this.progressBar.add(new r.Mesh(i, new r.MeshBasicMaterial({
        transparent: !0
      }))), this.progressShadow = new r.Mesh(new r.PlaneGeometry(this.PositionRange, .15), new r.MeshBasicMaterial({
        transparent: !0,
        color: 16777215,
        opacity: .08
      })), this.progressShadow.position.set(0, .19, .1), this.progressBar.add(this.progressShadow), this.progress.add(this.roundCircleBack), this.secondRoundCircleBack.position.z = this.roundCircleBack.position.z = this.backgroundBar.position.z = -.1, this.progress.add(this.secondRoundCircleBack), this.progress.add(this.backgroundBar), this.progress.add(this.progressBar), this.roundCircle.rotation.z = this.roundCircleBack.rotation.z = -Math.PI / 2, this.roundCircleBack.position.x = this.rightPositionEndX, this.roundCircle.position.x = this.leftPositionStartX, this.secondRoundCircle.rotation.z = this.secondRoundCircleBack.rotation.z = Math.PI / 2, this.secondRoundCircle.position.x = this.secondRoundCircleBack.position.x = this.leftPositionStartX, this.progress.add(this.roundCircle), this.progress.add(this.secondRoundCircle), this.progress.position.set(0, this.progressY, 0), this.progressBar.scale.x = .01, this.progressBar.position.x = this.leftPositionStartX, this.backgroundBar.position.x = this.barPositionCenter, this.secondRoundCircle.position.x = this.leftPositionStartX, this.game.camera.add(this.progress);
    }
  }, {
    key: "getDataByPercent",
    value: function (i) {
      var e = this.totalGameTime,
        s = .01,
        t = this.leftPositionStartX,
        o = e,
        r = this.leftPositionStartX;
      return e && (o = e - e * i, s = i, t += this.PositionRange * i / 2, r = this.PositionRange * i + this.leftPositionStartX), {
        restTime: o,
        roundPositionX: r,
        scaleX: s,
        positionX: t
      };
    }
  }, {
    key: "startProgressBarFrom",
    value: function () {
      var i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : .01,
        e = this.getDataByPercent(i),
        s = e.restTime,
        t = e.scaleX,
        r = e.positionX,
        n = e.roundPositionX;
      this.progressBar.scale.x = t, this.progressBar.position.x = r, this.roundCircle.position.x = n, this.stopAnimation(), o.customAnimation.to(this.progressBar.scale, s / 1e3, {
        x: 1,
        name: "progress",
        onComplete: function () {}
      }), o.customAnimation.to(this.progressBar.position, s / 1e3, {
        x: this.barPositionCenter,
        name: "progress"
      }), o.customAnimation.to(this.roundCircle.position, s / 1e3, {
        x: this.rightPositionEndX,
        name: "progress"
      });
    }
  }, {
    key: "setProgressBarPostionByPercent",
    value: function () {
      var i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : .01,
        e = this.getDataByPercent(i),
        s = (e.restTime, e.scaleX),
        t = e.positionX,
        o = e.roundPositionX;
      this.progressBar.scale.x = s, this.progressBar.position.x = t, this.roundCircle.position.x = o;
    }
  }, {
    key: "stopAnimation",
    value: function () {
      o.TweenAnimation.kill("progress");
    }
  }, {
    key: "inPositionRange",
    value: function (i, e, s, t) {
      return s - 3 < i && i < s + 3 && t - 3 < e && e < t + 3;
    }
  }, {
    key: "onStartChangeProgress",
    value: function () {
      this.stopAnimation(), this.isChangingProgress = !0;
    }
  }, {
    key: "onMoveProgress",
    value: function (i) {
      if (this.isChangingProgress) {
        var e = i.changedTouches[0].pageX,
          s = i.changedTouches[0].pageY,
          t = this.changePositionCSS2DTo3D(e, s);
        this.leftPositionStartX < t.x && t.x < this.rightPositionEndX && this.setProgressBarPostionByPercent((t.x + Math.abs(this.leftPositionStartX)) / this.PositionRange);
      }
    }
  }, {
    key: "onEndChangeProgress",
    value: function () {
      if (this.isChangingProgress) {
        this.isChangingProgress = !1;
        var i = (this.roundCircle.position.x + Math.abs(this.leftPositionStartX)) / this.PositionRange;
        this.onChangeProgress(i);
      }
    }
  }, {
    key: "doTouchStartEvent",
    value: function (i) {
      var e = i.changedTouches[0].pageX,
        s = i.changedTouches[0].pageY,
        t = this.changePositionCSS2DTo3D(e, s);
      this.inPositionRange(t.x, t.y, this.roundCircle.position.x, this.roundCircle.position.y + this.progressY) && this.onStartChangeProgress(), this.full2D.doTouchStartEvent(i);
    }
  }, {
    key: "doTouchMoveEvent",
    value: function (i) {
      this.isChangingProgress && this.onMoveProgress(i);
    }
  }, {
    key: "doTouchEndEvent",
    value: function (i) {
      this.onEndChangeProgress(), this.isChangingProgress = !1, this.full2D.doTouchEndEvent(i);
    }
  }, {
    key: "show",
    value: function (i, e) {
      var s = this,
        t = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : .01,
        o = this;
      this.totalGameTime = e, this.setScorePostion(), this.showRecordPage = function () {
        s.game.full2D.showRecordPage({
          headimg: i.headimg,
          is_self: o.is_self,
          is_from_share: o.is_from_share,
          onShare: function () {
            o.onOpenSharePage();
          }
        });
      }, this.showRecordPage(), this.addProgressBar(), this.startProgressBarFrom(t);
    }
  }, {
    key: "onClickHide",
    value: function () {
      this.onHide();
    }
  }, {
    key: "pause",
    value: function () {
      this.game.full2D.hide2D(), this.hide3D();
    }
  }, {
    key: "continue",
    value: function () {
      this.showRecordPage(), this.addProgressBar(), this.setScorePostion();
    }
  }, {
    key: "hide3D",
    value: function () {
      this.game.UI.hideScore(), this.game.UI.scoreText.obj.position.y = 21, this.game.UI.scoreText.obj.position.x = this.leftPositionStartX, this.game.camera.remove(this.progress);
    }
  }, {
    key: "hide",
    value: function () {
      this.stopAnimation(), this.game.full2D.hide2D(), this.hide3D();
    }
  }]);
}();
