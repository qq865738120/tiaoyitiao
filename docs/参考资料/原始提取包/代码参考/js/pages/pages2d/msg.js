// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawMsgBox = function (e) {
  (0, t.routeCanvas)(e, "msgBox"), (0, t.createPlane)(e), function (e) {
    e.imgid.bg++, e.imgid.btn++;
    var s = e.context.bg;
    s.clearRect(0, 0, t.WIDTH, t.HEIGHT), s.fillStyle = "rgba(0,0,0, 0.45)", s.fillRect(0, 0, t.WIDTH, t.HEIGHT), s.lineWidth = 2 * t.Dpr, s.strokeStyle = "rgba(255,255,255,0.06)", (0, t.drawText)({
      self: e,
      size: 22,
      t: "消息盒子",
      pos: [207, 89],
      bold: !0,
      type: "bg"
    }), (0, t.drawImageCenter)({
      self: e,
      src: "res/bl3.png",
      pos: [207, 372, 354, 492],
      type: "bg",
      imgid: e.imgid.bg,
      round: !0,
      radius: 2 * t.Dpr,
      cb: function () {
        0 == e.opt.msg_list.length && (0, t.drawText)({
          self: e,
          size: 17,
          t: "暂无消息",
          pos: [207, 318],
          type: "bg"
        }), (0, t.drawImageCenter)({
          self: e,
          src: "res/2d/new_return.png",
          pos: [54, 674, 70, 70],
          type: "bg",
          imgid: e.imgid.bg
        });
      }
    }), (0, t.updatePlane)({
      self: e,
      type: "bg"
    });
  }(e), (0, t.updateClip)({
    self: e
  }), function (e) {
    var l = e.opt.msg_list.length * (0, t.cwh)(90) / t.Dpr,
      r = (0, t.cwh)(482) / t.Dpr;
    e.scrollHandler = new s.default({
      innerOffsetHeight: l,
      outterOffsetHeight: r,
      updatePosition: e.updatePosition.bind(e)
    }), i(e, 0, "list1"), i(e, 10, "list2");
  }(e);
}, exports.drawMsgDetailType5 = function (e) {
  (0, t.routeCanvas)(e, "msgDetail5"), (0, t.createPlane)(e), e.imgid.bg++;
  var s = e.context.bg;
  s.clearRect(0, 0, t.WIDTH, t.HEIGHT), s.fillStyle = "rgba(0,0,0, 0.45)", s.fillRect(0, 0, t.WIDTH, t.HEIGHT), (0, t.drawImageCenter)({
    self: e,
    src: "res/bl3.png",
    pos: [207, 372, 354, 492],
    type: "bg",
    imgid: e.imgid.bg,
    round: !0,
    radius: 2 * t.Dpr,
    cb: function () {
      s.fillStyle = "#111619", s.fillRect((0, t.cx)(30), (0, t.cy)(126), (0, t.cwh)(354), (0, t.cwh)(160)), (0, t.drawText)({
        self: e,
        size: 20,
        t: "banner位置",
        pos: [207, 212],
        color: "rgba(255,255,255,0.2)"
      }), s.lineWidth = .5, (0, t.drawImageCenter)({
        self: e,
        src: e.opt.banner_icon || "aaa",
        pos: [207, 206, 354, 160],
        type: "bg",
        imgid: e.imgid.bg,
        round: !0
      }), (0, t.drawText)({
        self: e,
        size: 20,
        t: e.opt.title,
        pos: [60, 330],
        align: "left"
      });
      for (var i = e.opt.content.split("\\n"), l = 0, r = 0; r < i.length; r++) {
        for (var o = i[r].replace(/[^\x00-\xff]/g, "**").length, n = Math.ceil(o / 22 / 2), a = 0; a < n; a++) {
          var p = 364 + 28 * l;
          l++, (0, t.drawText)({
            self: e,
            size: 14,
            t: i[r].slice(22 * a, 22 * a + 22),
            pos: [60, p],
            align: "left",
            color: "#BEBEBE"
          });
        }
        0 == o && l++;
      }
      (0, t.drawImageCenter)({
        self: e,
        src: "res/2d/new_return.png",
        pos: [54, 674, 70, 70],
        type: "bg",
        imgid: e.imgid.bg
      });
    }
  }), s.lineWidth = 2 * t.Dpr, s.strokeStyle = "rgba(255, 255, 255, 0.06)", (0, t.updatePlane)({
    self: e,
    type: "bg"
  });
}, exports.drawMsgDetailType5Eve = function (e, t, s) {
  if (t > 30 && t < 95 && s > 640 && s < 720) return e.opt.onReturn && e.opt.onReturn(), !1;
}, exports.drawMsgList = i, exports.msgBoxEve = function (e, t, s, i) {
  if (t > 30 && t < 95 && s > 640 && s < 720) return e.opt.onReturn && e.opt.onReturn(), !1;
  if (t > 30 && t < 384 && s > 106 && s < 618) {
    var l = Math.floor((i - 136) / 90);
    return console.log(e.opt.msg_list[l]), e.opt.msg_list[l] && 2 == e.opt.msg_list[l].sub_type ? e.opt.onGoSkin && e.opt.onGoSkin() : e.opt.msg_list[l] && 1 == e.opt.msg_list[l].sub_type ? e.opt.onGoProfile && e.opt.onGoProfile(e.opt.msg_list[l]) : e.opt.msg_list[l] && 4 == e.opt.msg_list[l].sub_type ? e.opt.onGoMyProfile && e.opt.onGoMyProfile() : e.opt.msg_list[l] && 5 == e.opt.msg_list[l].sub_type && e.opt.onGoMsgDetail5 && e.opt.onGoMsgDetail5(e.opt.msg_list[l]), !1;
  }
}, exports.updateMsgBox = function (e) {
  e.scrollHandler.setInnerHeight(e.opt.msg_list.length * (0, t.cwh)(90) / t.Dpr, e.lastScrollY), i(e, e.scrolloffset, e.scrolltype), e.pending = void 0, console.log("END finish");
};
var t = require("./base"),
  s = e(require("../../scroll/scrollHandler"));
require("../../network/getAuth");
function i(e, s, i) {
  e.scrolloffset = s, e.scrolltype = i, "list1" == i ? e.imgid.list1++ : "list2" == i && e.imgid.list2++;
  var l = e.opt.msg_list.slice(s, s + 8),
    r = e.context[i];
  if (r.clearRect(0, 0, t.WIDTH, (0, t.cwh)(720)), 0 == s || 0 != l.length) {
    if (!(s < 0)) {
      for (var o, n, a, p = l.length, g = function () {
          d % 2 == 1 && (r.fillStyle = "rgba(255,255,255, 0.03)", r.fillRect(0, d * (0, t.cwh)(90), (0, t.cwh)(414), (0, t.cwh)(90))), o = new Date(1e3 * l[d].timestamp), n = o.getMonth() + 1 + "月" + o.getDate() + "日";
          var s = 90 * d;
          r.textAlign = "center", a = "res/2d/msg_default.png", l[d].icon && (a = l[d].icon), 1 == l[d].sub_type ? ((0, t.drawImageCenter)({
            round: !0,
            self: e,
            src: a,
            pos: [69, s + 34, 34, 34],
            type: i,
            cb: function () {
              (0, t.drawImageCenter)({
                self: e,
                src: "res/ava_rank.png",
                pos: [69, s + 34, 47, 47],
                type: i,
                imgid: e.imgid[i]
              });
            },
            imgid: e.imgid[i],
            noupdate: !0
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 14,
            t: (0, t.cname)(l[d].title || "", 30),
            pos: [106, s + 23],
            type: i
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 14,
            t: (0, t.cname)(l[d].content || "", 30),
            pos: [106, s + 45],
            type: i
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 12,
            t: n,
            pos: [106, s + 67],
            type: i,
            color: "rgba(255,255,255,0.6)"
          }), (0, t.drawImageCenter)({
            self: e,
            src: "res/2d/zan.png",
            pos: [353, s + 35, 18, 25],
            type: i,
            imgid: e.imgid[i]
          })) : 5 == l[d].sub_type ? ((0, t.drawImageCenter)({
            self: e,
            src: a,
            pos: [69, s + 45, 34, 34],
            type: i,
            imgid: e.imgid[i]
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 14,
            t: (0, t.cname)(l[d].title || "", 30),
            pos: [106, s + 34],
            type: i
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 14,
            t: n,
            pos: [106, s + 56],
            type: i,
            color: "rgba(255,255,255,0.6)"
          })) : ((0, t.drawImageCenter)({
            self: e,
            src: a,
            pos: [69, s + 45, 34, 34],
            type: i,
            imgid: e.imgid[i]
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 14,
            t: (0, t.cname)(l[d].content || "", 30),
            pos: [106, s + 34],
            type: i
          }), (0, t.drawText)({
            self: e,
            align: "left",
            size: 14,
            t: n,
            pos: [106, s + 56],
            type: i,
            color: "rgba(255,255,255,0.6)"
          }));
        }, d = 0; d < p; d++) g();
      (0, t.updatePlane)({
        self: e,
        type: i
      });
    }
  } else (0, t.updatePlane)({
    self: e,
    type: i
  });
}
