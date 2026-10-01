// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableSpread;
