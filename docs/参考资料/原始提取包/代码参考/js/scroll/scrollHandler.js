// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var t = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var i = require("../../@babel/runtime/helpers/classCallCheck"),
  e = require("../../@babel/runtime/helpers/createClass"),
  s = t(require("./scroll"));
exports.default = function () {
  return e(function t(e) {
    i(this, t), e = e || {}, this._options = e, this._itemSize = e.itemSize || 0, this._innerOffsetHeight = e.innerOffsetHeight || 0, this._outterOffsetHeight = e.outterOffsetHeight || 0, this._extent = this._innerOffsetHeight - this._outterOffsetHeight, this._position = e.position || 0, this._scroll = new s.default(this._extent), this.updatePosition();
  }, [{
    key: "onTouchStart",
    value: function () {
      this._startPosition = this._position, this._lastChangePos = this._startPosition, this._startPosition > 0 ? this._startPosition /= .5 : this._startPosition < -this._extent && (this._startPosition = (this._startPosition + this._extent) / .5 - this._extent), this._animation && (this._animation.cancel(), this._scrolling = !1), this.updatePosition();
    }
  }, {
    key: "onTouchMove",
    value: function (t, i) {
      var e = this._startPosition;
      (e += i) > 0 ? e *= .5 : e < -this._extent && (e = .5 * (e + this._extent) - this._extent), this._position = e, this.updatePosition();
    }
  }, {
    key: "onTouchEnd",
    value: function (t, i, e) {
      var s = this;
      this._scroll.set(this._position, e.y), this._scrolling = !0, this._lastChangePos = this._position, this._animation = this.animation(this._scroll, function () {
        var t = (Date.now() - s._scroll._startTime) / 1e3,
          i = s._scroll.x(t);
        i > 0 && s._extent < 0 && (i = 0), s._position = i, s.updatePosition();
      }, function () {
        s._scrolling = !1;
      });
    }
  }, {
    key: "scrollTo",
    value: function (t) {
      this._animation && (this._animation.cancel(), this._scrolling = !1), "number" == typeof t && (this._position = -t), this._position < -this._extent ? this._position = -this._extent : this._position > 0 && (this._position = 0), this.updatePosition();
    }
  }, {
    key: "updatePosition",
    value: function () {
      this._options.updatePosition(this._position);
    }
  }, {
    key: "animation",
    value: function (t, i, e) {
      var s = {
        id: 0,
        cancelled: !1
      };
      return function i(e, s, n, o) {
        if (!e || !e.cancelled) {
          n(s);
          var h = t.done();
          h || e.cancelled || (e.id = requestAnimationFrame(i.bind(null, e, s, n, o))), h && o && o(s);
        }
      }(s, t, i, e), {
        cancel: function (t) {
          t && t.id && cancelAnimationFrame(t.id), t && (t.cancelled = !0);
        }.bind(null, s),
        model: t
      };
    }
  }, {
    key: "setInnerHeight",
    value: function (t, i) {
      this._innerOffsetHeight = t, this._extent = this._innerOffsetHeight - this._outterOffsetHeight, this._scroll.setExtent(this._extent);
    }
  }]);
}();
