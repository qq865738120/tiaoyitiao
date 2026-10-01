// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.realTimeLogManager = void 0;
var e = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;
exports.realTimeLogManager = {
  debug: function () {
    e && e.debug.apply(e, arguments);
  },
  info: function () {
    e && e.info.apply(e, arguments);
  },
  warn: function () {
    e && e.warn.apply(e, arguments);
  },
  error: function () {
    e && e.error.apply(e, arguments);
  },
  setFilterMsg: function (t) {
    e && e.setFilterMsg && "string" == typeof t && e.setFilterMsg(t);
  },
  addFilterMsg: function (t) {
    e && e.addFilterMsg && "string" == typeof t && e.addFilterMsg(t);
  }
};
