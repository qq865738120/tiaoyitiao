// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var getPrototypeOf = require("./getPrototypeOf");
function _superPropBase(e, r) {
  for (; !Object.prototype.hasOwnProperty.call(e, r) && null !== (e = getPrototypeOf(e)););
  return e;
}
module.exports = _superPropBase;
