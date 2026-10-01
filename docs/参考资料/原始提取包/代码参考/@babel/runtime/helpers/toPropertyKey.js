// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var _typeof = require("./typeof"),
  toPrimitive = require("./toPrimitive");
function _toPropertyKey(r) {
  var t = toPrimitive(r, "string");
  return "symbol" === _typeof(t) ? t : String(t);
}
module.exports = _toPropertyKey;
