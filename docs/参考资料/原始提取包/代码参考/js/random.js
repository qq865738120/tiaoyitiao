// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.setRandomSeed = exports.random = void 0;
exports.setRandomSeed = function (r) {
  e = r;
};
var r = function () {
  return e = (9301 * e + 49297) % 233280, Math.floor(e / 233280 * 100) / 100;
};
exports.random = function () {
  if (0 === arguments.length) return r();
  if (1 === arguments.length) {
    var e = arguments[0];
    return Math.floor(r() * e);
  }
  var t = arguments[0],
    o = arguments[1];
  return Math.floor(r() * (o - t)) + t;
};
