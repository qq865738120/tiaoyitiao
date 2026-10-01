// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var e = require("../@babel/runtime/helpers/classCallCheck"),
  a = require("../@babel/runtime/helpers/createClass");
exports.default = function () {
  return a(function a(s) {
    e(this, a);
  }, null, [{
    key: "frameReport",
    value: function (e, a) {
      var s = 0;
      switch (e) {
        case "iPhone5":
          s = 1;
          break;
        case "iPhone5s":
          s = 2;
          break;
        case "iPhone6":
          s = 3;
          break;
        case "iPhone6s":
          s = 4;
          break;
        case "iPhone6Plus":
          s = 5;
          break;
        case "iPhone6sPlus":
          s = 6;
          break;
        case "iPhone7":
          s = 7;
          break;
        case "iPhone7s":
          s = 8;
          break;
        case "iPhone7Plus":
          s = 9;
          break;
        case "iPhone7sPlus":
          s = 10;
          break;
        case "iPhone8":
          s = 11;
          break;
        case "iPhone8Plus":
          s = 12;
          break;
        case "iPhoneX":
          s = 13;
      }
      new Image().src = "https://mp.weixin.qq.com/mp/jsmonitor?idkey=58121_" + 3 * s + "_" + a + ";58121_" + (3 * s + 1) + "_1&t=" + Math.random();
    }
  }]);
}();
