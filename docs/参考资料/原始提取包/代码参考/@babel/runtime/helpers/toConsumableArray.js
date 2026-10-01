// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var arrayWithoutHoles = require("./arrayWithoutHoles"),
  iterableToArray = require("./iterableToArray"),
  unsupportedIterableToArray = require("./unsupportedIterableToArray"),
  nonIterableSpread = require("./nonIterableSpread");
function _toConsumableArray(r) {
  return arrayWithoutHoles(r) || iterableToArray(r) || unsupportedIterableToArray(r) || nonIterableSpread();
}
module.exports = _toConsumableArray;
