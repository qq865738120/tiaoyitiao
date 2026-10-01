// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
function asyncGeneratorStep(n, e, r, t, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void r(n);
  }
  i.done ? e(u) : Promise.resolve(u).then(t, o);
}
function _asyncToGenerator(n) {
  return function () {
    var e = this,
      r = arguments;
    return new Promise(function (t, o) {
      var a = n.apply(e, r);
      function c(n) {
        asyncGeneratorStep(a, t, o, c, i, "next", n);
      }
      function i(n) {
        asyncGeneratorStep(a, t, o, c, i, "throw", n);
      }
      c(void 0);
    });
  };
}
module.exports = _asyncToGenerator;
