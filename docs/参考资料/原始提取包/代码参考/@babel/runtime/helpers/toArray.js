// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var arrayWithHoles = require("./arrayWithHoles"),
  iterableToArray = require("./iterableToArray"),
  unsupportedIterableToArray = require("./unsupportedIterableToArray"),
  nonIterableRest = require("./nonIterableRest");
function _toArray(r) {
  return arrayWithHoles(r) || iterableToArray(r) || unsupportedIterableToArray(r) || nonIterableRest();
}
module.exports = _toArray;
