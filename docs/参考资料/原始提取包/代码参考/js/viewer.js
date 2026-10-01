// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default,
  i = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../@babel/runtime/helpers/classCallCheck"),
  s = require("../@babel/runtime/helpers/createClass"),
  n = (i(require("./lib/three")), e(require("./pages/lookers")));
exports.default = function () {
  return s(function e(i) {
    t(this, e), this.num = 0, this.list = [], this.imgPlanes = [], this.camera = i, this.lookers = new n.default({
      camera: i
    }), this.isOpen = !1;
  }, [{
    key: "peopleCome",
    value: function (e) {
      this.list.findIndex(function (i) {
        return !!i && i.audience_openid == e.audience_openid;
      }) > -1 || (this.list.push(e), this.num++, this.isOpen && this.showAvatar());
    }
  }, {
    key: "peopleOut",
    value: function (e) {
      var i = this.list.findIndex(function (i) {
        return !!i && i.audience_openid == e.audience_openid;
      });
      i < 0 || (this.num = this.num - 1 < 0 ? 0 : this.num - 1, this.list.splice(i, 1), this.isOpen && this.showAvatar());
    }
  }, {
    key: "showAvatar",
    value: function () {
      if (this.num > 0) {
        for (var e = [], i = 1; i < 4; i++) this.list.length - i >= 0 && e.unshift(this.list[this.list.length - i].audience_headimg);
        this.lookers.showLookers({
          avaImg: !0,
          icon: !0,
          wording: !1,
          num: this.num,
          avatar: e
        });
      } else this.lookers.showLookers({
        avaImg: !1,
        icon: !0,
        wording: !1
      });
    }
  }, {
    key: "open",
    value: function () {
      this.isOpen = !0, this.showAvatar();
    }
  }, {
    key: "close",
    value: function () {
      this.isOpen = !1, this.hideAll();
    }
  }, {
    key: "reset",
    value: function () {
      this.num = 0, this.list = [], this.lookers.hideLookers();
    }
  }, {
    key: "hideAll",
    value: function () {
      this.lookers.hideLookers();
    }
  }]);
}();
