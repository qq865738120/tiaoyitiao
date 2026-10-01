// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../../@babel/runtime/helpers/arrayLikeToArray"),
  a = require("../../@babel/runtime/helpers/toArray"),
  t = require("../../@babel/runtime/helpers/slicedToArray"),
  i = require("../../@babel/runtime/helpers/objectSpread2"),
  o = require("../../@babel/runtime/helpers/classCallCheck"),
  s = require("../../@babel/runtime/helpers/createClass"),
  n = (e(require("../store/storage")), e(require("../network/network"))),
  l = e(require("../pages/profile/profile")),
  u = e(require("../control/propertyCtrl"));
exports.default = function () {
  return s(function e(r) {
    var a = this,
      t = r.game,
      s = r.onReturn,
      u = r.onGoRecord,
      d = r.scene,
      p = r.user_data;
    o(this, e);
    var _ = this;
    this.game = t, this.onReturn = s, this.onGoRecord = u, this.scene = d, this.user_data = p, this.profilePage = new l.default({
      game: t,
      onGoRecord: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        a.onGoRecord && a.onGoRecord(i(i({}, a.profileData), {}, {
          playback_id: a.user_data.playback_id,
          routesArr: e
        }));
      },
      onLike: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        _.data && !_.data.praise_info.is_already_praise && (_.data.praise_info.is_already_praise = 1, n.default.sendLikeTo(_.user_data.playback_id).then(function () {
          _.profilePage.updateProfilePraiseStatus(1), _.game.reporter.rpLike({
            open_user_id: _.user_data.playback_id
          });
        }, function () {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          _.data.praise_info.is_already_praise = 0, _.game.reporter.rpLike({
            open_user_id: _.user_data.playback_id,
            result: 1,
            praise_over_limit: 1 == e.overLimit ? 0 : 1
          }), wx.showToast({
            title: "点赞失败",
            icon: "none"
          });
        }));
        for (var r = e.length, a = r - 1; a >= 0; a--) {
          if ("start" == e[a]) {
            _.game.reporter.rpStartPageFriendInfoLike();
            break;
          }
          if ("gameOver" == e[a]) {
            _.game.reporter.rpGameOverOnlike();
            break;
          }
        }
      },
      onReturn: function () {
        a.destory && a.destory(), a.onReturn && a.onReturn();
      }
    });
  }, [{
    key: "init",
    value: function () {
      var e,
        o = this,
        s = this;
      if (!s.user_data.playback_id && !s.user_data.open_user_id) return console.log("-----------------------------"), console.log("-----------------------------"), console.log("-----------------------------"), console.log("-----------------------------"), console.log("-----------------------------"), console.log("-----------------------------"), void console.log(s.user_data);
      function l(e) {
        s.profilePage.show(e);
        var r = !!e.is_self;
        s.game && s.game.reporter && s.game.reporter.rpClickProfile(r);
      }
      s.user_data.open_user_id && (s.user_data.playback_id = s.user_data.open_user_id), wx.showLoading(), e = function (e) {
        var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        s.data = i(i({}, e), {}, {
          propsData: r,
          is_self: o.user_data.is_self
        }), l(o.data);
      }, Promise.all([s.user_data.is_self ? u.default.getProps() : Promise.resolve(), n.default.getUserProfile(s.user_data.playback_id)]).then(function (i) {
        var o = t(i, 2),
          n = o[0],
          l = void 0 === n ? [] : n,
          u = o[1];
        if (l && Array.isArray(l.property_list)) {
          var d = a(l.property_list),
            p = r(d).slice(0);
          l.property_list = p.filter(function (e) {
            return 1 == e.item_id;
          });
        }
        wx.hideLoading(), s.profileData = u, e(u, l);
      }, function (e) {
        wx.hideLoading(), wx.showToast({
          title: "获取数据失败",
          icon: "none"
        }), s.destory();
      });
    }
  }, {
    key: "showPage",
    value: function () {
      this.profilePage.show(this.data);
      var e = !!this.data.is_self;
      this.game && this.game.reporter && this.game.reporter.rpClickProfile(e);
    }
  }, {
    key: "destory",
    value: function () {}
  }]);
}();
