// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.drawRecordPage = function (t) {
  var i = t.self;
  i.imgid.bg++, (0, e.routeCanvas)(i, "record"), (0, e.createPlane)(i), i.context.bg.clearRect(0, 0, e.WIDTH, e.HEIGHT);
  var r = i.opt;
  (0, e.drawImageCenter)({
    self: i,
    src: r.headimg,
    pos: [61, 128, 42, 42],
    type: "bg",
    cb: function () {
      (0, e.drawImageCenter)({
        self: i,
        src: "res/2d/ava_square.png",
        pos: [61, 128, 43, 43],
        type: "bg",
        imgid: i.imgid.bg
      });
    },
    imgid: i.imgid.bg,
    noupdate: !0,
    round: !0
  }), (0, e.drawImageCenter)({
    self: i,
    src: "res/2d/new_return.png",
    pos: [54, 674, 70, 70],
    type: "bg",
    imgid: i.imgid.bg
  }), r.is_self && (0, e.drawImageCenter)({
    self: i,
    src: "res/2d/iplay.png",
    pos: [317, 670, 166, 75],
    type: "bg",
    imgid: i.imgid.bg,
    cb: function () {
      (0, e.drawImageCenter)({
        self: i,
        src: "res/2d/share_black.png",
        pos: [275, 670, 16, 20],
        type: "bg",
        imgid: i.imgid.bg
      }), (0, e.drawText)({
        self: i,
        size: 17,
        t: "立即分享",
        pos: [294, 670],
        align: "left",
        type: "bg",
        color: "#222"
      });
    }
  });
  (0, e.updatePlane)({
    self: i,
    type: "bg"
  });
}, exports.drawRecordSharePage = function (t) {
  (0, e.routeCanvas)(t, "recordShare"), (0, e.createPlane)(t), t.imgid.bg++;
  var i = t.context.bg;
  i.clearRect(0, 0, e.WIDTH, e.HEIGHT), t.context.btn.clearRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "rgba(0,0,0, 0.8)", i.fillRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "white", i.fillRect((0, e.cx)(46), (0, e.cy)(95), (0, e.cwh)(322), (0, e.cwh)(524));
  var r = t.opt;
  (0, e.drawText)({
    self: t,
    size: 14,
    align: "left",
    t: "游戏得分",
    pos: [70, 412],
    color: "#000"
  }), (0, e.drawText)({
    self: t,
    bold: !0,
    size: 60,
    align: "left",
    t: r.score || 0,
    pos: [70, 458],
    special: !0,
    color: "#00c777"
  }), (0, e.drawText)({
    self: t,
    size: 17,
    align: "left",
    t: "游戏最高连击",
    pos: [111, 541],
    color: "#000"
  }), (0, e.drawText)({
    self: t,
    bold: !0,
    size: 23,
    align: "left",
    t: r.combo || 0,
    pos: [220, 541],
    special: !0,
    color: "#00c777"
  }), (0, e.drawText)({
    self: t,
    size: 17,
    align: "left",
    t: "跳跃基座总数",
    pos: [111, 584],
    color: "#000"
  }), (0, e.drawText)({
    self: t,
    bold: !0,
    size: 23,
    align: "left",
    t: r.blocks || 0,
    pos: [222, 584],
    special: !0,
    color: "#00c777"
  }), (0, e.drawImageCenter)({
    self: t,
    src: "res/2d/new_return.png",
    pos: [54, 674, 70, 70],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, e.drawImageCenter)({
    self: t,
    src: "http://mmbiz.qpic.cn/mmbiz_jpg/icTdbqWNOwNTTiaKet81gQJM5kF68vSvHb8fGUK7Gxet3cpo27XHdThFxDKxa9udIrIRrfib6iceCbdOmMIA8ia6nrQ/0?wx_fmt=jpeg",
    pos: [207, 237, 314, 274],
    type: "bg",
    imgid: t.imgid.bg,
    cb: function () {
      if (t.opt.qrcode) {
        var a = "data:image/jpeg;base64," + t.opt.qrcode,
          g = new Image();
        g.onload = function () {
          i.save(), i.beginPath(), i.arc((0, e.cx)(207), (0, e.cy)(237), (0, e.cwh)(75), 0, 2 * Math.PI), i.clip(), i.drawImage(g, (0, e.cx)(137), (0, e.cy)(167), (0, e.cwh)(140), (0, e.cwh)(140)), i.closePath(), i.restore(), (0, e.updatePlane)({
            self: t,
            type: "bg"
          });
        }, t.opt.qrcode && (g.src = a);
      }
      (0, e.drawImageCenter)({
        self: t,
        src: r.headimg,
        pos: [91, 365, 42, 42],
        type: "bg",
        cb: function () {
          (0, e.drawImageCenter)({
            self: t,
            src: "res/2d/ava_square.png",
            pos: [91, 365, 44, 44],
            type: "bg",
            imgid: t.imgid.bg
          });
        },
        imgid: t.imgid.bg,
        noupdate: !0,
        round: !0
      });
    }
  }), (0, e.drawImageCenter)({
    self: t,
    src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJM5kF68vSvHbGCBbdgOO38RUykCLXfxY4AqvbpYlicNty1spYAodBn0VaIlUTmUWZPA/0?wx_fmt=png",
    pos: [83, 541, 30, 30],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, e.drawImageCenter)({
    self: t,
    src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJM5kF68vSvHbIzzKuHlGd6VRrYJDvWRW8ualJGGNUAjAsqqexE8oqPpmME0FwHa5qg/0?wx_fmt=png",
    pos: [83, 584, 30, 30],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, e.drawImageCenter)({
    self: t,
    src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJM5kF68vSvHbfc7nDtrYImbjUnlqZ4koWibPibgYJVxlg8StI6Q9VuxaIwicLkFtOrhzQ/0?wx_fmt=png",
    pos: [282.5, 674, 47, 47],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, e.drawImageCenter)({
    self: t,
    src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJM5kF68vSvHbbwRXvZtMDn4vIzraOmfMnic8R4qMMQgEV0XLG3unlM2fpHFG9FSBaSg/0?wx_fmt=png",
    pos: [359.5, 674, 47, 47],
    type: "bg",
    imgid: t.imgid.bg
  }), (0, e.updatePlane)({
    self: t,
    type: "bg"
  });
}, exports.getRecordSavePhoto = t, exports.recordEve = function (t, i, r) {
  if (i > 30 && i < 95 && r > 640 && r < 720) return (0, e.back)(t), t.options.quitRecord && t.options.quitRecord(), !1;
  if (t.opt.is_self && i > 270 && i < 340 && r > 640 && r < 720) return t.opt.onShare && t.opt.onShare(), !1;
}, exports.recordShareEve = function (i, r, a) {
  if (r > 30 && r < 95 && a > 640 && a < 720) (0, e.back)(i), i.opt.onClose && i.opt.onClose();else if (r > 259 && r < 306 && a > 640 && a < 720) {
    var g = t(i);
    i.opt.onSave && i.opt.onSave(g);
  } else r > 336 && r < 383 && a > 640 && a < 720 && i.opt.onShare && i.opt.onShare();
};
var e = require("./base");
function t(e) {
  return e.canvas.bg;
}
