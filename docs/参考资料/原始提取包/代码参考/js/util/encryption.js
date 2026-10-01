// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../../@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.encrypt = function (e, r) {
  r = r.slice(0, 16);
  var a = t.default.enc.Utf8.parse(r),
    u = t.default.enc.Utf8.parse(r),
    n = e;
  n = JSON.stringify(n);
  var i = t.default.AES.encrypt(n, a, {
    iv: u,
    mode: t.default.mode.CBC,
    padding: t.default.pad.Pkcs7
  });
  return i = i.toString();
}, exports.encryptSeed = function (e, r) {
  var a = t.default.enc.Utf8.parse(r + "_" + e),
    u = t.default.SHA256(a).toString();
  return u = u.substr(0, 12), u = parseInt(u, 16), u += 46704096e5;
};
var t = e(require("../lib/aes"));
