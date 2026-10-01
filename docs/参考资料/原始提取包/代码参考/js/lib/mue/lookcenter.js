// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../../../@babel/runtime/helpers/createForOfIteratorHelper"),
  r = require("../../../@babel/runtime/helpers/classCallCheck"),
  t = require("../../../@babel/runtime/helpers/createClass"),
  s = {
    global: {
      normal: 21,
      high: 22,
      low: 23
    },
    single: {
      normal: 24,
      high: 0,
      low: 25
    },
    rank: {
      normal: 26,
      high: 0,
      low: 27
    }
  },
  i = function () {
    function i() {
      r(this, i);
    }
    return t(i, null, [{
      key: "add",
      value: function (e, r) {
        var t = s[e];
        t ? r && (r >= 120 ? t.high && i.report([{
          sid: t.high,
          time: 100 * r
        }]) : (i.report([{
          sid: t.normal,
          time: 100 * r
        }]), r <= 30 && t.low && i.report([{
          sid: t.low,
          time: 100 * r
        }]))) : console.warn("No FPS sid for", e);
      }
    }, {
      key: "report",
      value: function (r) {
        var t,
          s = {
            pid: 415,
            speeds: []
          },
          i = e(r);
        try {
          for (i.s(); !(t = i.n()).done;) {
            var n = t.value;
            s.speeds.push(n.sid + "_" + n.time);
          }
        } catch (e) {
          i.e(e);
        } finally {
          i.f();
        }
        s.speeds = s.speeds.join(";"), wx.request({
          url: "https://badjs.weixinbridge.com/frontend/reportspeed",
          method: "GET",
          data: s
        });
      }
    }]);
  }(),
  n = function () {
    return t(function e() {
      r(this, e), this.avg = 0, this.pre = 0, this.count = 0;
    }, [{
      key: "add",
      value: function (e) {
        this.avg = 1 * ((this.pre * this.count + e) / (this.count + 1)).toFixed(2), this.pre = e, this.count++;
      }
    }, {
      key: "get",
      value: function () {
        return this.avg;
      }
    }]);
  }(),
  a = new (function () {
    return t(function e() {
      r(this, e), this.performance = wx.getPerformance(), this.preFrameTime = 0, this.frame = 0, this.fps = 0, this.isStarted = !1, this.scenes = {}, window.requestAnimationFrame(this.loop);
    }, [{
      key: "startScenes",
      value: function (e, r) {
        var t = a;
        r || (r = .05), Math.random() <= r && (t.scenes[e] = new n(), t.isStarted = !0);
      }
    }, {
      key: "stopScenes",
      value: function (e) {
        var r = a;
        if (r.scenes[e]) {
          var t = r.scenes[e].get();
          console.debug("Avg fps:", e, t), i.add(e, t), delete r.scenes[e], 0 === Object.keys(r.scenes).length && (r.isStarted = !1, r.reset());
        }
      }
    }, {
      key: "stopAll",
      value: function () {
        var e = a;
        for (var r in e.scenes) e.stopScenes(r);
      }
    }, {
      key: "reset",
      value: function () {
        var e = a;
        e.preFrameTime = 0, e.frame = 0, e.fps = 0;
      }
    }, {
      key: "loop",
      value: function () {
        var e = a;
        if (e.preFrameTime) {
          if (e.isStarted) {
            e.frame++;
            var r = Date.now(),
              t = r - e.preFrameTime;
            if (t >= 1e3) for (var s in e.fps = 1 * (e.frame / (t / 1e3)).toFixed(2), e.frame = 0, e.preFrameTime = r, e.scenes) e.scenes[s].add(e.fps);
          }
        } else e.preFrameTime = Date.now();
        window.requestAnimationFrame(e.loop);
      }
    }]);
  }())();
exports.default = a;
