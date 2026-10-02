;(function installDemoCompat() {
    if (!Object.hasOwn) Object.defineProperty(Object, 'hasOwn', {
        value: function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); }, configurable: true, writable: true,
    });
    [Array.prototype, String.prototype].forEach(function (prototype) {
        if (!prototype.at) Object.defineProperty(prototype, 'at', {
            value: function (index) {
                if (this == null) throw new TypeError('Invalid receiver');
                var object = Object(this), length = object.length;
                var number = Number(index) || 0;
                var offset = number < 0 ? Math.ceil(number) : Math.floor(number);
                if (offset < 0) offset += length;
                return offset >= 0 && offset < length ? object[offset] : undefined;
            }, configurable: true, writable: true,
        });
    });
})();
'use strict';

var types = require('../chunks/types-BnMUUABw.js');

function createDemoLifecycle(host) {
  let generation = 0;
  const timers = /* @__PURE__ */ new Set();
  const unload = () => {
    generation += 1;
    timers.forEach(clearTimeout);
    timers.clear();
  };
  return {
    unload,
    /** 建立当前加载代次并安排两次有限尝试。 */
    load() {
      unload();
      const current = generation;
      let opened = false;
      let pending = false;
      for (const delay of [6e3, 12e3]) {
        const timer = setTimeout(async () => {
          timers.delete(timer);
          if (current !== generation || opened || pending) return;
          pending = true;
          try {
            await host.open(() => current === generation);
            if (current === generation) opened = true;
          } catch {
            if (current === generation) host.failed();
          } finally {
            pending = false;
          }
        }, delay);
        timers.add(timer);
      }
    }
  };
}

async function openPanel(isActive = () => true) {
  if (!isActive()) return;
  try {
    await Editor.Panel.openBeside("inspector", types.DEMO_PACKAGE_NAME);
  } catch {
    if (isActive()) await Editor.Panel.open(types.DEMO_PACKAGE_NAME);
  }
}
const lifecycle = createDemoLifecycle({ open: openPanel, failed: () => console.warn("Game Agent \u6F14\u793A\u9762\u677F\u6682\u65F6\u65E0\u6CD5\u6253\u5F00\uFF0C\u53EF\u4ECE\u6269\u5C55\u83DC\u5355\u6253\u5F00\u3002") });
function load() {
  lifecycle.load();
}
function unload() {
  lifecycle.unload();
}
const methods = {
  openPanel: () => openPanel(),
  /** 只打开固定公开商城地址，失败返回局部反馈状态。 */
  async openPurchase() {
    try {
      const electron = require("electron");
      await electron.shell.openExternal(types.DEMO_PURCHASE_URL);
      return true;
    } catch {
      return false;
    }
  }
};

exports.load = load;
exports.methods = methods;
exports.unload = unload;
