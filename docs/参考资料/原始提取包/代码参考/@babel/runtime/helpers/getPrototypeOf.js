// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function _getPrototypeOf(t) {
  return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
module.exports = _getPrototypeOf;
