// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var toPropertyKey = require("./toPropertyKey");
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
module.exports = _defineProperty;
