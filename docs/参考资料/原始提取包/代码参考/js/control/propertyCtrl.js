// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var r = require("../../@babel/runtime/helpers/toConsumableArray"),
  t = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  n = e(require("../network/network")),
  o = e(require("../control/networkCtrl")),
  p = (e(require("../lib/mue/eventcenter")), require("../config")),
  s = {
    propArray: [],
    item_list: []
  };
exports.default = function () {
  return i(function e() {
    t(this, e);
  }, null, [{
    key: "getProps",
    value: function () {
      var e = this,
        r = o.default.getPropperty();
      return r.then(function (r) {
        s.propArray = r.property_list, s.item_list = r.item_list, e.prepareAllIcon();
      }, function () {}), r;
    }
  }, {
    key: "getPropsData",
    value: function () {
      return r(s.propArray);
    }
  }, {
    key: "getSuccPropList",
    value: function () {
      var e = s.succ_property_list || [];
      return r(e);
    }
  }, {
    key: "canUseProp",
    value: function () {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
        r = !1,
        t = this.getFirstPropByClass(e);
      return r = t > -1, this.resetUsingList(), r;
    }
  }, {
    key: "confirmUsingProp",
    value: function (e) {
      var r = this,
        t = e.id,
        i = e.game,
        o = e.seed,
        p = new Promise(function (e, i) {
          var p = r.getFirstPropByClass(t);
          if (p > -1) {
            var u = s.propArray[p].property_id;
            n.default.useproperty({
              property_id: u,
              seed: o
            }).then(function () {
              e(u);
            }, function () {
              i({
                type: 1,
                errMsg: "property_id confirm fail",
                property_id: u,
                item_id: t
              });
            });
          } else i({
            type: 0,
            errMsg: "can not find any props"
          });
        });
      return p.then(function (e) {
        r.usingProp(t, e, i);
      }, function (e) {
        console.log(e), e.property_id && e.item_id && r.addFail(e.item_id, e.property_id);
      }), p;
    }
  }, {
    key: "usingProp",
    value: function (e, r, t) {
      if (Array.isArray(s.propArray)) {
        var i = s.propArray.findIndex(function (e) {
          return e.property_id == r;
        });
        i > -1 && (s.propArray.splice(i, 1), this.gameUsingProp(e, t, {
          property_id: r,
          item_id: e
        }), this.addSuccess(e, r));
      }
    }
  }, {
    key: "gameUsingProp",
    value: function (e, r, t) {
      switch (e) {
        case 1:
          r.wellJump(t);
      }
    }
  }, {
    key: "reviewUsingProp",
    value: function (e, r, t) {
      switch (e) {
        case 1:
          r.wellJump(t), this.audienceWatchPropAni(r, e);
      }
    }
  }, {
    key: "observeUsingProp",
    value: function (e, r, t) {
      switch (e) {
        case 1:
          r.observeWellJump(t), this.audienceWatchPropAni(r, e);
      }
    }
  }, {
    key: "getFirstPropById",
    value: function (e) {
      return this.getPropById("property_id", e);
    }
  }, {
    key: "getFirstPropByClass",
    value: function (e) {
      return this.getPropById("item_id", e);
    }
  }, {
    key: "getPropById",
    value: function (e, r) {
      var t = -1;
      return Array.isArray(s.propArray) && (t = s.propArray.findIndex(function (t) {
        return t[e] == r;
      })), t;
    }
  }, {
    key: "resetUsingList",
    value: function () {
      s.succ_property_list = [], s.fail_property_list = [];
    }
  }, {
    key: "addSuccess",
    value: function (e, r) {
      Array.isArray(s.succ_property_list) || (s.succ_property_list = []), s.succ_property_list.push({
        item_id: e,
        property_id: r
      });
    }
  }, {
    key: "addFail",
    value: function (e, r) {
      Array.isArray(s.fail_property_list) || (s.fail_property_list = []), s.fail_property_list.push({
        item_id: e,
        property_id: r
      });
    }
  }, {
    key: "handleGameOver",
    value: function (e) {
      var r = this;
      if (s.fail_property_list && s.fail_property_list.length) {
        e.succ_property_list = s.succ_property_list.slice(0), e.fail_property_list = s.fail_property_list.slice(0);
        var t = n.default.revertproperty(e, 0);
        t.then(function () {
          r.getProps();
        }, function () {
          r.getProps();
        });
      }
    }
  }, {
    key: "prepareAllIcon",
    value: function () {
      var e = [];
      for (var r in p.PROP_BOARD.skin) {
        var t = this.prepareSingleSkin(r);
        e.push(t);
      }
      return Promise.all(e);
    }
  }, {
    key: "prepareSingleSkin",
    value: function (e) {
      new Promise(function (r, t) {
        p.PROP_BOARD.skinTexture[e] || r(), p.loader.load(p.PROP_BOARD.skin[e], function (t) {
          p.PROP_BOARD.skinTexture[e] = t, r();
        }, function () {}, function () {
          t();
        });
      });
    }
  }, {
    key: "audienceWatchPropAni",
    value: function (e, r) {
      e && e.UI && e.UI.audienceWatchPropAni && e.UI.audienceWatchPropAni(r);
    }
  }, {
    key: "checkUsingProp",
    value: function () {
      return !(!s.succ_property_list || !s.succ_property_list.length);
    }
  }]);
}();
