// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var n = require("../@babel/runtime/helpers/interopRequireDefault").default;
require("../@babel/runtime/helpers/Arrayincludes"), Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0, require("../@babel/runtime/helpers/Arrayincludes");
var e = require("../@babel/runtime/helpers/toConsumableArray"),
  t = require("../@babel/runtime/helpers/classCallCheck"),
  i = require("../@babel/runtime/helpers/createClass"),
  o = require("./util/util"),
  s = require("./config"),
  l = n(require("./lib/mue/eventcenter")),
  r = n(require("./network/network"));
console.log("utildadsasdad", o.Util);
var c = "返回码错了",
  a = "wx.request fail";
exports.default = function () {
  return i(function n(e) {
    t(this, n), this.currentSkin = null, this.firstInit = !0, this.bindEvent(), this.skinSn = {};
  }, [{
    key: "bindEvent",
    value: function () {
      var n = this;
      l.default.on(s.EVENT.INITRESPONSE, function (e, t) {
        var i = [];
        console.log("data", t);
        for (var o = 0; o < t.skin_list.length; ++o) i.push(t.skin_list[o].skin_id), n.skinSn[t.skin_list[o].skin_id] = t.skin_list[o].sn;
        t.current_skin || wx.setStorage({
          key: "current_skin",
          data: null
        }), n.update(t.current_skin && t.current_skin.skin_id, i);
      });
    }
  }, {
    key: "loadSkinForOtherMode",
    value: function (n, e) {
      var t = this;
      return this.skinSn[n] = e, console.log("??????? zaizhelile", n, e), new Promise(function (e, i) {
        n ? t.loadSkin([n]).then(t.loadSkinBlockInfo).then(t.loadBlockRes).then(function () {
          e();
        }).catch(function (n) {
          console.log("???????????????????? reject", n), i();
        }) : e();
      });
    }
  }, {
    key: "pipe",
    value: function (n, e) {
      var t = this;
      void 0 !== n ? this.loadSkin([n]).then(this.loadSkinBlockInfo).then(this.loadBlockRes).then(function () {
        return new Promise(function (e, t) {
          console.log("currentSkin??????", n), wx.setStorage({
            key: "current_skin",
            data: n,
            success: e,
            fail: t
          });
        });
      }).then(function () {
        return console.log("wow load skinIdlIstdasdasdasd", e), t.loadSkin(e);
      }).then(function (n) {
        var e = n.blockId;
        return new Promise(function (i, s) {
          if (console.log("wowowowoowowowowowo??????", t.firstInit), t.firstInit) {
            for (var l = [], r = 0; r < e.length; ++r) l.push("block_" + e[r]);
            console.log("????dirs", l), o.Util.removeDirsNotInList(l);
          } else t.firstInit = !1;
          console.log("resolve-----------------------", n), i(n);
        });
      }).then(this.loadSkinBlockInfo).then(this.loadBlockRes).catch(function (n) {}) : void 0 !== e && e.length > 0 && this.loadSkin(e).then(this.loadSkinBlockInfo).then(this.loadBlockRes);
    }
  }, {
    key: "reset",
    value: function () {}
  }, {
    key: "loadSkin",
    value: function (n) {
      var t = this;
      return new Promise(function (i, o) {
        var s = wx.getStorageSync("skins") || {};
        console.log("skins", s, s[1], n);
        for (var l = [], u = {}, k = [], d = n.length - 1; d >= 0; --d) s[n[d]] ? (l = l.concat(s[n[d]].object_id_list), console.log("ttttttt", s[n[d]]), n.splice(d, 1), Object.assign(u, u, s[n[d]])) : k.push({
          skin_id: n[d],
          sn: t.skinSn[n[d]]
        });
        console.log("hahahahahahha", n), n.length > 0 ? r.default.getSkin({
          item_list: k
        }).then(function (n) {
          if (console.log("loadSkin response", n), n && n.skin_list) {
            console.log("response getskin", n, n.skin_list);
            for (var r = 0; r < n.skin_list.length; ++r) {
              var a = {
                object_id_list: []
              };
              a.skin_sn = t.skinSn[n.skin_list[r].skin_id];
              for (var k = 0; k < n.skin_list[r].item_list.length; ++k) a.object_id_list.push(n.skin_list[r].item_list[k].object_id), a[n.skin_list[r].item_list[k].object_id] = n.skin_list[r].item_list[k].sn, u[n.skin_list[r].item_list[k].object_id] = n.skin_list[r].item_list[k].sn;
              s[n.skin_list[r].skin_id] = a, s.block_sn = s.block_sn || {}, Object.assign(s.block_sn, s.block_sn, u), l = l.concat(a.object_id_list);
            }
            l = e(new Set(l)), wx.setStorageSync("skins", s), i({
              blockId: l,
              blockSn: u
            });
          } else o(c);
        }).catch(function () {
          o(a);
        }) : (l = e(new Set(l)), u = s.block_sn, console.log("blockidlist", l), i({
          blockId: l,
          blockSn: u
        }));
      });
    }
  }, {
    key: "loadSkinBlockInfo",
    value: function (n) {
      var e = n.blockId,
        t = n.blockSn;
      return new Promise(function (n, i) {
        var o = e.concat(s.LOCALBLOCK).filter(function (n) {
            return !s.LOCALBLOCK.includes(n);
          }),
          l = (wx.getStorageSync("blocks") || {
            array: []
          }).array;
        if (o = o.concat(l).filter(function (n) {
          return !l.includes(n);
        }), console.log("wtf not in local", o), 0 != o.length) {
          console.log("??????", e, t);
          for (var c = [], u = 0; u < o.length; ++u) c.push({
            object_id: o[u],
            sn: t[o[u]]
          });
          console.log("postDtaa", c), r.default.getBlock({
            item_list: c
          }).then(function (e) {
            n(e.object_json_list);
          }).catch(function () {
            i(a);
          });
        } else n();
      });
    }
  }, {
    key: "loadBlockRes",
    value: function (n) {
      var e = this;
      return new Promise(function (t, i) {
        if (console.log("wowowoowowo loadBlockres", n), n) {
          for (var s = [], l = 0; l < n.length; ++l) {
            var r = new Promise(function (t, i) {
              var s = 0;
              n[l] = JSON.parse(n[l]);
              var r = void 0 !== n[l].ad,
                c = n[l].block_res_list.length + (r ? 1 : 0),
                a = n[l].block_res_list.slice(0);
              r && a.push({
                path: "block_".concat(n[l].id, "/trade"),
                cdn_url: n[l].ad.trademark_url
              });
              for (var u = 0; u < a.length; ++u) o.Util.downloadSaveFile({
                filePath: a[u].path,
                url: a[u].cdn_url,
                success: function (n) {
                  ++s, console.log("count", s), s == c && t();
                }.bind(e, l, u),
                fail: function () {
                  i();
                }
              });
            }).then(function (e) {
              var t = wx.getStorageSync("blocks") || {
                array: []
              };
              t.array.push(n[e].id), t[n[e].id] = n[e], wx.setStorageSync("blocks", t);
            }.bind(e, l));
            s.push(r);
          }
          Promise.all(s).then(function () {
            t();
          }).catch(function () {
            i();
          });
        } else t();
      });
    }
  }, {
    key: "update",
    value: function (n, e) {
      this.pipe(n, e);
    }
  }]);
}();
