// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default,
  r = require("../../../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t = require("../../../@babel/runtime/helpers/arrayLikeToArray"),
  i = require("../../../@babel/runtime/helpers/toArray"),
  a = require("../../../@babel/runtime/helpers/objectSpread2"),
  s = require("../../../@babel/runtime/helpers/toConsumableArray"),
  o = require("../../../@babel/runtime/helpers/classCallCheck"),
  l = require("../../../@babel/runtime/helpers/createClass"),
  u = (require("../../lib/animation"), r(require("../../lib/three")), e(require("../../control/propertyCtrl")));
exports.default = function () {
  return l(function e(r) {
    var t = r.game,
      i = r.onGoRecord,
      a = r.onReturn,
      s = r.onLike;
    o(this, e), this.game = t, this.model = this.game.gameModel, this.full2D = this.game.full2D, this.UI = this.game.UI, this.onGoRecord = i, this.onReturn = a, this.onLike = s;
  }, [{
    key: "updateProfilePraiseStatus",
    value: function (e) {
      var r = this,
        o = s(this.data.praise_info.headimg_list);
      o.findIndex(function (e) {
        return e == r.data.headimg;
      }) < 0 && o.push(this.data.headimg);
      var l = {
        praise_info: a(a({}, this.data.praise_info), {}, {
          is_already_praise: e,
          praise_count: this.data.praise_info.praise_count + 1,
          total_praise_count: this.data.praise_info.total_praise_count + 1,
          headimg_list: o
        })
      };
      if (this.data && this.data.is_self && 10 == l.praise_info.praise_count) {
        var n = u.default.getPropsData() || [];
        n.push({
          property_id: "fake",
          item_id: 1
        }), l.propsData = {
          property_list: n
        }, setTimeout(function () {
          u.default.getProps();
        }, 1e3);
      } else l.propsData = {
        property_list: u.default.getPropsData()
      };
      if (l.propsData && Array.isArray(l.propsData.property_list)) {
        var p = i(l.propsData.property_list),
          h = t(p).slice(0);
        l.propsData.property_list = h.filter(function (e) {
          return 1 == e.item_id;
        });
      }
      this.full2D.updateProfilePraise && this.full2D.updateProfilePraise(l);
    }
  }, {
    key: "show",
    value: function (e) {
      this.game.full2D.hide2D(), this.data = e, this.full2D.showProfile(a(a({}, e), {}, {
        onReturn: this.onReturn,
        onRecord: this.onGoRecord,
        onLike: this.onLike
      }));
    }
  }, {
    key: "onClickHide",
    value: function () {
      this.onReturn();
    }
  }, {
    key: "hide",
    value: function () {
      this.game.full2D.hide2D();
    }
  }]);
}();
