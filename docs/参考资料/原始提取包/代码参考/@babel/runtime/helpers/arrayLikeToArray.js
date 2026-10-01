// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = new Array(a); e < a; e++) n[e] = r[e];
  return n;
}
module.exports = _arrayLikeToArray;
