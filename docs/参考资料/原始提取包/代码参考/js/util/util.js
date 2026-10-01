// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.Util = void 0;
var e = exports.Util = {},
  o = wx.getFileSystemManager();
window.fileManager = o;
var c = function (e) {
  o.saveFile({
    tempFilePath: e.tempFilePath,
    filePath: "".concat(wx.env.USER_DATA_PATH, "/").concat(e.filePath),
    success: function () {
      e.success && e.success();
    },
    fail: function () {
      e.fail && e.fail();
    }
  });
};
e.saveFile = function (e) {
  console.log("saveFile", e);
  var l = e.filePath.split("/");
  l.length >= 2 && o.access({
    path: "".concat(wx.env.USER_DATA_PATH, "/").concat(l[0]),
    success: function () {
      console.log("success, access dir"), c(e);
    },
    fail: function (n) {
      o.mkdir({
        dirPath: "".concat(wx.env.USER_DATA_PATH, "/").concat(l[0]),
        success: function () {
          console.log("mrk dir ok", e), c(e);
        },
        fail: function (o) {
          console.log("fail mrk dir"), c(e);
        }
      });
    }
  });
}, e.deleteFiles = function (e) {
  for (var c = 0, l = e.length; c < l; ++c) o.unlinkSync("".concat(wx.env.USER_DATA_PATH, "/").concat(e[c]));
}, e.removeDirsNotInList = function (e) {
  console.log("remove list", e), e && o.readdir({
    dirPath: wx.env.USER_DATA_PATH,
    success: function (c) {
      for (var l = c.files, n = 0, i = l.length; n < i; ++n) e.indexOf(l[n]) < 0 && "block_" == l[n].substr(0, 6) && (console.log("remove dirs", l[n]), o.rmdir({
        filePath: "".concat(wx.env.USER_DATA_PATH, "/").concat(l[n]),
        success: function () {
          console.log("remove dir ok");
        }
      }));
    },
    fail: function (e) {
      console.log("faile", e);
    }
  });
}, e.downloadSaveFile = function (o) {
  console.log("downloadSaveFile", o), wx.downloadFile({
    url: o.url,
    header: o.header || "",
    success: function (c) {
      console.log("download okkkkkk", c.tempFilePath), e.saveFile({
        filePath: o.filePath,
        tempFilePath: c.tempFilePath,
        success: o.success,
        fail: o.fail
      });
    },
    fail: function (e) {
      console.log("fail download", e), o.fail && o.fail();
    }
  });
};
