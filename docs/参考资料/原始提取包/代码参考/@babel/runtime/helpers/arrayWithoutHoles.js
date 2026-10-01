// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var arrayLikeToArray = require("./arrayLikeToArray");
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return arrayLikeToArray(r);
}
module.exports = _arrayWithoutHoles;
