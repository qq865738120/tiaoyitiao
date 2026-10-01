// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function _setPrototypeOf(t, e) {
  return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}
module.exports = _setPrototypeOf;
