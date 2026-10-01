// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.clickVerifyForm = o, exports.routeVerify = i, exports.verifyEve = function (t, a, r) {
  if (a > 130 && a < 280 && r > 607 && r < 640) return t.opt.verify_step >= 4 ? (t.opt.banType = 2, t.lastCanvasType == e.CANVASTYPE.gameOver ? t.showGameOverPage(t.opt) : t.showStartPage(t.opt)) : i(t), !1;
  if (a > 130 && a < 280 && r > 670 && r < 720) return t.opt.verify_step = 0, back(this) == e.CANVASTYPE.gameOver ? t.showGameOverPage(t.opt) : t.showStartPage(t.opt), !1;
  if (3 == t.opt.verify_step && a > 130 && a < 370 && r > 240 && r < 300) return o(t, "name"), !1;
  if (3 == t.opt.verify_step && a > 130 && a < 370 && r > 300 && r < 360) return o(t, "mobile"), !1;
};
var e = require("./base"),
  t = require("../../network/network");
function i(i) {
  i.opt.verify_step = i.opt.verify_step || 0;
  var o = i.opt.verify_step;
  0 == o ? ((0, e.createPlane)(i), (0, e.routeCanvas)(i, "verify"), function (t) {
    t.imgid.bg++;
    var i = t.context.bg;
    i.clearRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "#555", i.fillRect(0, 0, e.WIDTH, e.HEIGHT), (0, e.drawText)({
      self: t,
      t: "游戏申诉",
      size: 30,
      pos: [207, 153]
    }), (0, e.drawText)({
      self: t,
      t: "我们需要验证你的玩家身份",
      size: 16,
      pos: [207, 496],
      color: "rgba(255,255,255,0.4)"
    }), (0, e.drawText)({
      self: t,
      t: "将会有专人与你联系",
      size: 16,
      pos: [207, 518],
      color: "rgba(255,255,255,0.4)"
    }), (0, e.drawText)({
      self: t,
      t: "第一步：请提交一份自拍照片",
      size: 20,
      pos: [207, 450],
      color: "white"
    }), (0, e.drawImageCenter)({
      self: t,
      src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VeiaWDZj6rCViaLsuSCWtnyo1mvNqBR05HxPZ5oXTzl0ODXjWiakTvq6yw/0?wx_fmt=png",
      pos: [207, 329, 139, 139],
      type: "bg",
      imgid: t.imgid.bg
    }), (0, e.drawImageCenter)({
      self: t,
      src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VajbZ52iaZX9Vlib0QAKEJGDIV8F9iaFeqXoawUbQkDP8zc6fbm95nKLgw/0?wx_fmt=png",
      pos: [207, 621, 138, 44],
      type: "bg",
      imgid: t.imgid.bg
    }), (0, e.drawText)({
      self: t,
      t: "提交自拍",
      size: 15,
      pos: [207, 621]
    }), (0, e.drawText)({
      self: t,
      t: "退出申诉",
      size: 17,
      pos: [197, 690]
    }), (0, e.drawImageCenter)({
      self: t,
      src: "res/r_arr.png",
      pos: [247, 690, 6.5, 12.5],
      type: "bg",
      imgid: t.imgid.bg
    }), (0, e.updatePlane)({
      self: t,
      type: "bg"
    });
  }(i), i.opt.verify_step++) : 1 == o ? (!function (t) {
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: function (i) {
        t.opt.path = i.tempFilePaths[0], function (t) {
          var i = t.context.bg;
          i.clearRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "#555", i.fillRect(0, 0, e.WIDTH, e.HEIGHT), (0, e.drawText)({
            self: t,
            t: "拍摄完成",
            size: 30,
            pos: [207, 117]
          }), (0, e.drawText)({
            self: t,
            t: "照片已存档，仅供身份识别",
            size: 14,
            pos: [207, 158]
          }), (0, e.drawImageCenter)({
            self: t,
            src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VajbZ52iaZX9Vlib0QAKEJGDIV8F9iaFeqXoawUbQkDP8zc6fbm95nKLgw/0?wx_fmt=png",
            pos: [207, 621, 138, 44],
            type: "bg",
            imgid: t.imgid.bg
          }), (0, e.drawText)({
            self: t,
            t: "下一步",
            size: 15,
            pos: [207, 621]
          }), (0, e.drawText)({
            self: t,
            t: "退出申诉",
            size: 17,
            pos: [197, 690]
          }), (0, e.drawImageCenter)({
            self: t,
            src: "res/r_arr.png",
            pos: [247, 690, 6.5, 12.5],
            type: "bg",
            imgid: t.imgid.bg
          });
          var o = new Image();
          o.onload = function () {
            console.log(o.width, o.height);
            var i = 240,
              a = 320;
            o.width / o.height > .75 ? a = o.height / o.width * i : i = o.width / o.height * a, console.log(i, a), (0, e.drawImageCenter)({
              self: t,
              src: t.opt.path,
              pos: [207, 388, i, a],
              type: "bg",
              imgid: t.imgid.bg
            });
          }, o.src = t.opt.path, (0, e.updatePlane)({
            self: t,
            type: "bg"
          });
        }(t);
      },
      fail: function (e) {
        t.opt.verify_step = 0;
      }
    });
  }(i), i.opt.verify_step++) : 2 == o ? function (i) {
    if (i.opt.loading) return;
    i.opt.loading = !0, wx.showLoading({
      title: "上传中..."
    }), (0, t.upLoadVerifyPic)({
      path: i.opt.path,
      succ: function (t) {
        i.opt.fileid = t, i.opt.verify_step++, function (t) {
          var i = t.context.bg;
          i.clearRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "#555", i.fillRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "#888", i.fillRect(0, (0, e.cy)(206), (0, e.cwh)(414), (0, e.cwh)(215)), (0, e.drawText)({
            self: t,
            t: "第二步：请填写联系方式",
            size: 20,
            pos: [207, 117]
          }), (0, e.drawLine)(30, 299, 384, 299, "rgba(255,255,255,0.4)", .5, i), (0, e.drawLine)(30, 364, 384, 364, "rgba(255,255,255,0.4)", .5, i), (0, e.drawText)({
            self: t,
            t: "姓名",
            align: "left",
            size: 17,
            pos: [30, 277],
            color: "rgba(255,255,255,1)"
          }), (0, e.drawText)({
            self: t,
            t: "手机号码",
            align: "left",
            size: 17,
            pos: [30, 342],
            color: "rgba(255,255,255,1)"
          }), (0, e.drawText)({
            self: t,
            t: "请填写",
            align: "left",
            size: 17,
            pos: [138, 277],
            color: "rgba(255,255,255,0.3)"
          }), (0, e.drawText)({
            self: t,
            t: "请填写",
            align: "left",
            size: 17,
            pos: [138, 342],
            color: "rgba(255,255,255,0.3)"
          }), (0, e.drawImageCenter)({
            self: t,
            src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VajbZ52iaZX9Vlib0QAKEJGDIV8F9iaFeqXoawUbQkDP8zc6fbm95nKLgw/0?wx_fmt=png",
            pos: [207, 621, 138, 44],
            type: "bg",
            imgid: t.imgid.bg
          }), (0, e.drawText)({
            self: t,
            t: "下一步",
            size: 15,
            pos: [207, 621]
          }), (0, e.drawText)({
            self: t,
            t: "退出申诉",
            size: 17,
            pos: [197, 690]
          }), (0, e.drawImageCenter)({
            self: t,
            src: "res/r_arr.png",
            pos: [247, 690, 6.5, 12.5],
            type: "bg",
            imgid: t.imgid.bg
          }), (0, e.updatePlane)({
            self: t,
            type: "bg"
          });
        }(i);
      },
      complete: function () {
        i.opt.loading = !1, wx.hideLoading();
      }
    });
  }(i) : 3 == o && function (i) {
    if (!i.opt.mobile || !i.opt.name) return void wx.showToast({
      title: "请填写完整信息",
      icon: "none"
    });
    if (i.opt.loading) return;
    i.opt.loading = !0, (0, t.upLoadVerifySubmit)({
      name: i.opt.name,
      mobile: i.opt.mobile,
      fileid: i.opt.fileid,
      is_async: i.lastCanvasType == e.CANVASTYPE.start ? 1 : 0,
      succ: function () {
        !function (t) {
          var i = t.context.bg;
          i.clearRect(0, 0, e.WIDTH, e.HEIGHT), i.fillStyle = "#555", i.fillRect(0, 0, e.WIDTH, e.HEIGHT), (0, e.drawText)({
            self: t,
            t: "提交成功",
            size: 30,
            pos: [207, 237]
          }), (0, e.drawText)({
            self: t,
            t: "请耐心等待客服与你联系",
            size: 14,
            pos: [207, 278],
            color: "rgba(255,255,255,0.4)"
          }), (0, e.drawText)({
            self: t,
            t: "如有疑问，可关注“微信小游戏”官方公众号进行咨询",
            size: 14,
            pos: [207, 298],
            color: "rgba(255,255,255,0.4)"
          }), (0, e.drawImageCenter)({
            self: t,
            src: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJNNcIVa8Pr2VajbZ52iaZX9Vlib0QAKEJGDIV8F9iaFeqXoawUbQkDP8zc6fbm95nKLgw/0?wx_fmt=png",
            pos: [207, 621, 138, 44],
            type: "bg",
            imgid: t.imgid.bg
          }), (0, e.drawText)({
            self: t,
            t: "完成",
            size: 15,
            pos: [207, 621]
          }), (0, e.updatePlane)({
            self: t,
            type: "bg"
          });
        }(i), i.opt.verify_step++;
      },
      complete: function () {
        i.opt.loading = !1;
      }
    });
  }(i);
}
function o(t, i) {
  console.log(t.opt.showkey), t.opt.showkey || (t.opt.showkey = !0, wx.showKeyboard({
    defaultValue: t.opt[i] || "",
    maxLength: 20,
    multiple: !1,
    confirmType: "done",
    complete: function () {}
  }), wx.onKeyboardComplete(function (o) {
    t.opt.showkey = !1, t.opt[i] = o.value;
    var a = t.context.bg;
    a.fillStyle = "#888", "name" == i ? (a.fillRect((0, e.cx)(135), (0, e.cy)(262), (0, e.cwh)(250), (0, e.cwh)(30)), (0, e.drawText)({
      self: t,
      t: (0, e.cname)(t.opt.name || "请填写", 20),
      align: "left",
      size: 17,
      pos: [138, 277],
      color: t.opt.name ? "#fff" : "rgba(255,255,255,0.3)"
    })) : (a.fillRect((0, e.cx)(135), (0, e.cy)(327), (0, e.cwh)(250), (0, e.cwh)(30)), (0, e.drawText)({
      self: t,
      t: (0, e.cname)(t.opt.mobile || "请填写", 20),
      align: "left",
      size: 17,
      pos: [138, 342],
      color: t.opt.mobile ? "#fff" : "rgba(255,255,255,0.3)"
    })), (0, e.updatePlane)({
      self: t,
      type: "bg"
    }), wx.offKeyboardComplete();
  }));
}
