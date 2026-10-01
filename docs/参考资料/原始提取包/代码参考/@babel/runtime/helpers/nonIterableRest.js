// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableRest;
