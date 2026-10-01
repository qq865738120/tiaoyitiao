// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
require("../../@babel/runtime/helpers/Arrayincludes"), require("../../@babel/runtime/helpers/Arrayincludes"), require("../../@babel/runtime/helpers/Arrayincludes"), require("../../@babel/runtime/helpers/Arrayincludes"), Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0, require("../../@babel/runtime/helpers/Arrayincludes");
var t = require("../../@babel/runtime/helpers/typeof"),
  n = require("../../@babel/runtime/helpers/classCallCheck"),
  i = require("../../@babel/runtime/helpers/createClass"),
  o = e(require("../store/storage")),
  r = require("../util/util"),
  l = e(require("../network/network"));
exports.default = function () {
  function e() {
    n(this, e);
  }
  return i(e, null, [{
    key: "getBottleSkinResource",
    value: function (t) {
      return new Promise(function (n, i) {
        var r = o.default.getCanUseBottleSkinIdList(),
          l = o.default.getSkinResources(),
          u = o.default.getBottleSkinData(t);
        u && r.includes(t) ? void 0 !== l[t] ? n(l[t]) : ("string" == typeof u.property && (u.property = JSON.parse(u.property)), e.downloadBottleSkin(u.property, u.id).then(function (e) {
          u.property = e, l[t] = u, o.default.setSkinResources(l), n(u);
        }, function (e) {
          i();
        })) : i();
      });
    }
  }, {
    key: "getBottleSkinResourceBySkinData",
    value: function (t) {
      return new Promise(function (n, i) {
        var r = o.default.getSkinResources();
        t && t.id ? void 0 !== r[t.id] ? n(r[t.id]) : ("string" == typeof t.property && (t.property = JSON.parse(t.property)), e.downloadBottleSkin(t.property, t.id).then(function (e) {
          t.property = e, r[t.id] = t, o.default.setSkinResources(r), n(t);
        }, function () {
          i();
        })) : i();
      });
    }
  }, {
    key: "downloadBottleSkin",
    value: function (e, n) {
      return new Promise(function (i, o) {
        if ("object" == t(e)) {
          var l = Object.assign(e);
          if (Array.isArray(e.images) && e.images.length > 0) {
            var u = [],
              a = [];
            e.images.forEach(function (e) {
              u.push(function (e) {
                return new Promise(function (t, n) {
                  wx.downloadFile({
                    url: e,
                    success: function (e) {
                      t(e.tempFilePath);
                    },
                    fail: function (e) {
                      n(e);
                    }
                  });
                });
              }(e));
            }), Promise.all(u).then(function (e) {
              e.forEach(function (e, t) {
                var i, o, l;
                a.push((i = e, o = "bottle_".concat(n, "_").concat(t), l = "bottleSkin/".concat(o), new Promise(function (e, t) {
                  r.Util.saveFile({
                    tempFilePath: i,
                    filePath: l,
                    success: function (t) {
                      e("".concat(wx.env.USER_DATA_PATH, "/").concat(l));
                    },
                    fail: function (e) {
                      t();
                    }
                  });
                })));
              }), Promise.all(a).then(function (e) {
                l.images = e, i(l);
              }, function (e) {
                o();
              });
            }, function (e) {
              o();
            });
          } else i(e);
        } else o();
      });
    }
  }, {
    key: "selectAndDownloadBottleSkin",
    value: function (t) {
      e.getBottleSkinResource(t.id).then(function () {
        o.default.setSelectBottleSkinId(t.id);
      }, function () {
        wx.showToast({
          title: "下载皮肤失败"
        });
      });
    }
  }, {
    key: "getSelectedBottleSkinResource",
    value: function () {
      return new Promise(function (t, n) {
        var i = e.getSelectedSkinId();
        e.getBottleSkinResource(i).then(function (e) {
          t(e);
        }, n);
      });
    }
  }, {
    key: "getSelectedBottleSkinResourceSync",
    value: function () {
      var t = e.getSelectedSkinId(),
        n = o.default.getCanUseBottleSkinIdList(),
        i = o.default.getSkinResources();
      if (!t) return !1;
      if (n.includes(t) && void 0 !== i[t]) {
        if (e.checkSkinExpire(t)) return i[t];
        o.default.setSelectBottleSkinId(0);
      }
    }
  }, {
    key: "getSelectedBottleSkinDisplayInfoSync",
    value: function () {
      var e = o.default.getSelectBottleSkinId(),
        t = o.default.getBottleSkinShopList() || [];
      if (e && t.length > 0) {
        var n = t.find(function (t) {
          return t.id == e;
        });
        return !(!n || !n.display_info) && n.display_info;
      }
      return !1;
    }
  }, {
    key: "getSelectedBottleSkinDataSync",
    value: function (e) {
      var t = o.default.getBottleSkinShopList() || [];
      if (e && t.length > 0) {
        var n = t.find(function (t) {
          return t.id == e;
        });
        return n || !1;
      }
      return !1;
    }
  }, {
    key: "checkSkinExpire",
    value: function (t) {
      var n = o.default.getBottleSkinShopList(),
        i = Math.floor(Date.now() / 1e3),
        r = n.find(function (e) {
          return e.id == t;
        });
      return !!r && (r.expire_time > i || 0 === r.expire_time || (e.setRankDataTolocalStorage({}), !1));
    }
  }, {
    key: "getSelectedSkinId",
    value: function () {
      var t = o.default.getSelectBottleSkinId();
      return e.checkSkinExpire(t) ? t : (o.default.setSelectBottleSkinId(0), 0);
    }
  }, {
    key: "updateSkinExpire",
    value: function (e, t) {
      var n = o.default.getBottleSkinShopList() || [],
        i = Math.floor(Date.now() / 1e3),
        r = o.default.getCanUseBottleSkinIdList(),
        l = n.find(function (t) {
          return t.id == e;
        });
      l && (l.expire_time = t, t > i || 0 === t ? (l.use_status = 1, r.includes(e) || r.push(e)) : (l.use_status = 0, r.includes(e) && (r = r.filter(function (t) {
        return t != e;
      }))), o.default.setCanUseBottleSkinIdList(r));
    }
  }, {
    key: "setRankDataTolocalStorage",
    value: function (t) {
      try {
        var n = Object.assign({}, o.default.getMyUserInfo() || {}),
          i = {};
        if (console.log("-----------------------------"), console.log(n), console.log(t), t) {
          t.playback_id && (i.playback_id = t.playback_id);
          var r = e.getSelectedBottleSkinDisplayInfoSync();
          i.bottle_skin = !!r && r.poster_min, o.default.saveMyUserInfo(Object.assign(n, i));
        }
      } catch (e) {
        console.log("-----------------------------"), console.log("-----------------------------"), console.log("-----------------------------"), console.log(e);
      }
    }
  }, {
    key: "updateSkinExpireByPropertyList",
    value: function () {
      var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
        n = {};
      for (var i in t.map(function (e) {
        (n[e.item_id] && n[e.item_id] < e.expire_time || !n[e.item_id] || 0 === e.expire_time) && (n[e.item_id] = e.expire_time);
      }), n) e.updateSkinExpire(i, n[i]);
    }
  }, {
    key: "syncSelectBottleSkin",
    value: function () {
      var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
        n = e.getSelectedSkinId(),
        i = o.default.getSyncBottleSkinFailFlag();
      (i || t) && l.default.syncSelectedBottleSkin(n).then(function () {
        o.default.setSyncBottleSkinFailFlag(0);
      }, function () {
        o.default.setSyncBottleSkinFailFlag(1);
      });
    }
  }, {
    key: "getBottleSkinShopData",
    value: function () {
      return l.default.getBottleSkinShopData().then(function (e) {
        return o.default.setCanUseBottleSkinIdList(e.canUseSkinIdList), o.default.setBottleSkinShopList(e.bottleSkinShopList), Promise.resolve(e);
      }, function (e) {
        return Promise.reject(e);
      });
    }
  }]);
}();
