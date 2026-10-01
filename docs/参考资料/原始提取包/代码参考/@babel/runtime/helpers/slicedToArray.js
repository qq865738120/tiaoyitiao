// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var arrayWithHoles = require("./arrayWithHoles"),
  iterableToArrayLimit = require("./iterableToArrayLimit"),
  unsupportedIterableToArray = require("./unsupportedIterableToArray"),
  nonIterableRest = require("./nonIterableRest");
function _slicedToArray(r, e) {
  return arrayWithHoles(r) || iterableToArrayLimit(r, e) || unsupportedIterableToArray(r, e) || nonIterableRest();
}
module.exports = _slicedToArray;
