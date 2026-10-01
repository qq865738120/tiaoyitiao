// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
module.exports = _assertThisInitialized;
