// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.compareMyVersion = function (e) {
  if (e === n.VERSION) return 0;
  if (e > n.VERSION) return 1;
  if (e < n.VERSION) return -1;
  return;
}, exports.forceUpdate = function (e, n) {
  if (void 0 === wx.getUpdateManager) e();else {
    var o = function () {
      new Promise(function (e, n) {
        var t = wx.getUpdateManager();
        Promise.race([new Promise(function (e, n) {
          wx.showLoading({
            content: "正在下载",
            mask: !0
          });
        }), Promise.race([new Promise(function (e, n) {
          setTimeout(function () {
            n();
          }, 1e3);
        }), new Promise(function (e, n) {
          t.onCheckForUpdate(function (t) {
            t.hasUpdate ? e() : n();
          });
        })]).then(function () {
          return new Promise(function (e, n) {
            t.onUpdateReady(function () {
              e();
            }), t.onUpdateFailed(function () {
              n();
            });
          });
        }, function () {
          return Promise.reject();
        })]).then(function () {
          t.applyUpdate(), e();
        }, function () {
          n();
        });
      }).then(function () {}, function () {
        wx.hideLoading(), wx.showModal({
          content: "请在检查网络状况后重试",
          confirmText: "重试",
          cancelText: "取消",
          success: function (n) {
            n.confirm ? o() : e();
          },
          fail: function () {
            e();
          }
        }), t.default.sendServerError(10);
      });
    };
    wx.showModal({
      content: n || "点击确定，进行版本更新后重试",
      success: function (n) {
        n.confirm ? o() : e();
      },
      fail: function () {
        e();
      }
    });
  }
};
var n = require("./../config"),
  t = e(require("../network/network"));
