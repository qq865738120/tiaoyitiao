// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/typeof");
!function (e) {
  var t = {};
  function n(o) {
    if (t[o]) return t[o].exports;
    var r = t[o] = {
      exports: {},
      id: o,
      loaded: !1
    };
    return e[o].call(r.exports, r, r.exports, n), r.loaded = !0, r.exports;
  }
  n.m = e, n.c = t, n.p = "", n(0);
}([function (e, t, n) {
  var o = function (e) {
    if (e && e.__esModule) return e;
    var t = {};
    if (null != e) for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t.default = e, t;
  }(n(1));
  var r = GameGlobal;
  GameGlobal.__isAdapterInjected || (GameGlobal.__isAdapterInjected = !0, function () {
    o.addEventListener = o.canvas.addEventListener = function (e, t) {
      o.document.addEventListener(e, t);
    }, o.removeEventListener = o.canvas.removeEventListener = function (e, t) {
      o.document.removeEventListener(e, t);
    };
    var e = wx.getSystemInfoSync().platform;
    if ("undefined" == typeof __devtoolssubcontext && "devtools" === e) {
      for (var t in o) {
        var n = Object.getOwnPropertyDescriptor(r, t);
        n && !0 !== n.configurable || Object.defineProperty(window, t, {
          value: o[t]
        });
      }
      for (var a in o.document) {
        var i = Object.getOwnPropertyDescriptor(r.document, a);
        i && !0 !== i.configurable || Object.defineProperty(r.document, a, {
          value: o.document[a]
        });
      }
      window.parent = window;
    } else {
      for (var u in o) r[u] = o[u];
      r.window = o, window = r, window.top = window.parent = window;
    }
  }());
}, function (e, t, n) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.cancelAnimationFrame = t.requestAnimationFrame = t.clearInterval = t.clearTimeout = t.setInterval = t.setTimeout = t.canvas = t.location = t.localStorage = t.HTMLElement = t.FileReader = t.Audio = t.Image = t.WebSocket = t.XMLHttpRequest = t.navigator = t.document = void 0;
  var o = n(2);
  Object.keys(o).forEach(function (e) {
    "default" !== e && "__esModule" !== e && Object.defineProperty(t, e, {
      enumerable: !0,
      get: function () {
        return o[e];
      }
    });
  });
  var r = n(3);
  Object.keys(r).forEach(function (e) {
    "default" !== e && "__esModule" !== e && Object.defineProperty(t, e, {
      enumerable: !0,
      get: function () {
        return r[e];
      }
    });
  });
  var a = v(n(9)),
    i = v(n(10)),
    u = v(n(17)),
    c = v(n(18)),
    l = v(n(19)),
    s = v(n(11)),
    f = v(n(12)),
    d = v(n(20)),
    p = v(n(4)),
    h = v(n(21)),
    y = v(n(22));
  function v(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  t.document = i.default, t.navigator = u.default, t.XMLHttpRequest = c.default, t.WebSocket = l.default, t.Image = s.default, t.Audio = f.default, t.FileReader = d.default, t.HTMLElement = p.default, t.localStorage = h.default, t.location = y.default;
  var b = new a.default();
  t.canvas = b, t.setTimeout = setTimeout, t.setInterval = setInterval, t.clearTimeout = clearTimeout, t.clearInterval = clearInterval, t.requestAnimationFrame = requestAnimationFrame, t.cancelAnimationFrame = cancelAnimationFrame;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var n = wx.getSystemInfoSync(),
    o = n.screenWidth,
    r = n.screenHeight,
    a = n.devicePixelRatio,
    i = t.innerWidth = o,
    u = t.innerHeight = r;
  t.devicePixelRatio = a;
  t.screen = {
    availWidth: i,
    availHeight: u
  }, t.performance = {
    now: function () {
      return Date.now() / 1e3;
    }
  }, t.ontouchstart = null, t.ontouchmove = null, t.ontouchend = null;
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  }), n.HTMLCanvasElement = n.HTMLImageElement = void 0;
  var r,
    a = o(4),
    i = (r = a) && r.__esModule ? r : {
      default: r
    };
  function u(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
  }
  function c(t, n) {
    if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return !n || "object" !== e(n) && "function" != typeof n ? t : n;
  }
  function l(t, n) {
    if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
    t.prototype = Object.create(n && n.prototype, {
      constructor: {
        value: t,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
  }
  n.HTMLImageElement = function (e) {
    function t() {
      return u(this, t), c(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, "img"));
    }
    return l(t, e), t;
  }(i.default), n.HTMLCanvasElement = function (e) {
    function t() {
      return u(this, t), c(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, "canvas"));
    }
    return l(t, e), t;
  }(i.default);
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r,
    a = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];
          o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
        }
      }
      return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }(),
    i = o(5),
    u = (r = i) && r.__esModule ? r : {
      default: r
    },
    c = o(8),
    l = o(2);
  function s(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
  }
  function f(t, n) {
    if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return !n || "object" !== e(n) && "function" != typeof n ? t : n;
  }
  var d = function (t) {
    function n() {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
      s(this, n);
      var t = f(this, (n.__proto__ || Object.getPrototypeOf(n)).call(this));
      return t.className = "", t.childern = [], t.style = {
        width: l.innerWidth + "px",
        height: l.innerHeight + "px"
      }, t.insertBefore = c.noop, t.innerHTML = "", t.tagName = e.toUpperCase(), t;
    }
    return function (t, n) {
      if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
      t.prototype = Object.create(n && n.prototype, {
        constructor: {
          value: t,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
    }(n, t), a(n, [{
      key: "setAttribute",
      value: function (e, t) {
        this[e] = t;
      }
    }, {
      key: "getAttribute",
      value: function (e) {
        return this[e];
      }
    }, {
      key: "getBoundingClientRect",
      value: function () {
        return {
          top: 0,
          left: 0,
          width: l.innerWidth,
          height: l.innerHeight
        };
      }
    }, {
      key: "focus",
      value: function () {}
    }, {
      key: "clientWidth",
      get: function () {
        var e = parseInt(this.style.fontSize, 10) * this.innerHTML.length;
        return Number.isNaN(e) ? 0 : e;
      }
    }, {
      key: "clientHeight",
      get: function () {
        var e = parseInt(this.style.fontSize, 10);
        return Number.isNaN(e) ? 0 : e;
      }
    }]), n;
  }(u.default);
  n.default = d;
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r,
    a = o(6);
  var i = function (t) {
    function n() {
      !function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      }(this, n);
      var t = function (t, n) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !n || "object" !== e(n) && "function" != typeof n ? t : n;
      }(this, (n.__proto__ || Object.getPrototypeOf(n)).call(this));
      return t.className = "", t.children = [], t;
    }
    return function (t, n) {
      if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
      t.prototype = Object.create(n && n.prototype, {
        constructor: {
          value: t,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
    }(n, t), n;
  }(((r = a) && r.__esModule ? r : {
    default: r
  }).default);
  n.default = i;
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r,
    a = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];
          o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
        }
      }
      return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }(),
    i = o(7);
  var u = function (t) {
    function n() {
      !function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      }(this, n);
      var t = function (t, n) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !n || "object" !== e(n) && "function" != typeof n ? t : n;
      }(this, (n.__proto__ || Object.getPrototypeOf(n)).call(this));
      return t.childNodes = [], t;
    }
    return function (t, n) {
      if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
      t.prototype = Object.create(n && n.prototype, {
        constructor: {
          value: t,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
    }(n, t), a(n, [{
      key: "appendChild",
      value: function (e) {
        if (!(e instanceof n)) throw new TypeError("Failed to executed 'appendChild' on 'Node': parameter 1 is not of type 'Node'.");
        this.childNodes.push(e);
      }
    }, {
      key: "cloneNode",
      value: function () {
        var e = Object.create(this);
        return Object.assign(e, this), e;
      }
    }, {
      key: "removeChild",
      value: function (e) {
        var t = this.childNodes.findIndex(function (t) {
          return t === e;
        });
        return t > -1 ? this.childNodes.splice(t, 1) : null;
      }
    }]), n;
  }(((r = i) && r.__esModule ? r : {
    default: r
  }).default);
  n.default = u;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var n = function () {
    function e(e, t) {
      for (var n = 0; n < t.length; n++) {
        var o = t[n];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
      }
    }
    return function (t, n, o) {
      return n && e(t.prototype, n), o && e(t, o), t;
    };
  }();
  var o = new WeakMap(),
    r = function () {
      function e() {
        !function (e, t) {
          if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        }(this, e), o.set(this, {});
      }
      return n(e, [{
        key: "addEventListener",
        value: function (e, t) {
          var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
            r = o.get(this);
          r || (r = {}, o.set(this, r)), r[e] || (r[e] = []), r[e].push(t), n.capture && console.warn("EventTarget.addEventListener: options.capture is not implemented."), n.once && console.warn("EventTarget.addEventListener: options.once is not implemented."), n.passive && console.warn("EventTarget.addEventListener: options.passive is not implemented.");
        }
      }, {
        key: "removeEventListener",
        value: function (e, t) {
          var n = o.get(this)[e];
          if (n && n.length > 0) for (var r = n.length; r--; r > 0) if (n[r] === t) {
            n.splice(r, 1);
            break;
          }
        }
      }, {
        key: "dispatchEvent",
        value: function () {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            t = o.get(this)[e.type];
          if (t) for (var n = 0; n < t.length; n++) t[n](e);
        }
      }]), e;
    }();
  t.default = r;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.noop = function () {};
}, function (e, t, n) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.default = function () {
    var e = wx.createCanvas();
    e.type = "canvas", e.__proto__.__proto__ = new o.default("canvas");
    e.getContext;
    return e.getBoundingClientRect = function () {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }, e;
  };
  n(3);
  var o = r(n(4));
  r(n(10));
  function r(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
}, function (e, t, n) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var o = function (e) {
      if (e && e.__esModule) return e;
      var t = {};
      if (null != e) for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
      return t.default = e, t;
    }(n(1)),
    r = c(n(4)),
    a = c(n(11)),
    i = c(n(12)),
    u = c(n(9));
  function c(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  n(15);
  var l = {},
    s = {
      readyState: "complete",
      visibilityState: "visible",
      documentElement: o,
      hidden: !1,
      style: {},
      location: o.location,
      ontouchstart: null,
      ontouchmove: null,
      ontouchend: null,
      head: new r.default("head"),
      body: new r.default("body"),
      createElement: function (e) {
        return "canvas" === e ? new u.default() : "audio" === e ? new i.default() : "img" === e ? new a.default() : new r.default(e);
      },
      getElementById: function (e) {
        return e === o.canvas.id ? o.canvas : null;
      },
      getElementsByTagName: function (e) {
        return "head" === e ? [s.head] : "body" === e ? [s.body] : "canvas" === e ? [o.canvas] : [];
      },
      querySelector: function (e) {
        return "head" === e ? s.head : "body" === e ? s.body : "canvas" === e || e === "#" + o.canvas.id ? o.canvas : null;
      },
      querySelectorAll: function (e) {
        return "head" === e ? [s.head] : "body" === e ? [s.body] : "canvas" === e ? [o.canvas] : [];
      },
      addEventListener: function (e, t) {
        l[e] || (l[e] = []), l[e].push(t);
      },
      removeEventListener: function (e, t) {
        var n = l[e];
        if (n && n.length > 0) for (var o = n.length; o--; o > 0) if (n[o] === t) {
          n.splice(o, 1);
          break;
        }
      },
      dispatchEvent: function (e) {
        var t = l[e.type];
        if (t) for (var n = 0; n < t.length; n++) t[n](e);
      }
    };
  t.default = s;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.default = function () {
    return wx.createImage();
  };
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r,
    a = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];
          o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
        }
      }
      return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }(),
    i = o(13),
    u = (r = i) && r.__esModule ? r : {
      default: r
    };
  var c = new WeakMap(),
    l = new WeakMap(),
    s = (new WeakMap(), new WeakMap(), function (t) {
      function n(t) {
        !function (e, t) {
          if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        }(this, n);
        var o = function (t, n) {
          if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return !n || "object" !== e(n) && "function" != typeof n ? t : n;
        }(this, (n.__proto__ || Object.getPrototypeOf(n)).call(this));
        o.HAVE_NOTHING = 0, o.HAVE_METADATA = 1, o.HAVE_CURRENT_DATA = 2, o.HAVE_FUTURE_DATA = 3, o.HAVE_ENOUGH_DATA = 4, o.readyState = 0, l.set(o, "");
        var r = wx.createInnerAudioContext();
        return c.set(o, r), r.onCanplay(function () {
          o.dispatchEvent({
            type: "load"
          }), o.dispatchEvent({
            type: "loadend"
          }), o.dispatchEvent({
            type: "canplay"
          }), o.dispatchEvent({
            type: "canplaythrough"
          }), o.dispatchEvent({
            type: "loadedmetadata"
          }), o.readyState = 2;
        }), r.onPlay(function () {
          o.dispatchEvent({
            type: "play"
          });
        }), r.onPause(function () {
          o.dispatchEvent({
            type: "pause"
          });
        }), r.onEnded(function () {
          o.dispatchEvent({
            type: "ended"
          }), o.readyState = 4;
        }), r.onError(function () {
          o.dispatchEvent({
            type: "error"
          });
        }), t && (c.get(o).src = t), o;
      }
      return function (t, n) {
        if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
        t.prototype = Object.create(n && n.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
      }(n, t), a(n, [{
        key: "load",
        value: function () {
          console.warn("HTMLAudioElement.load() is not implemented.");
        }
      }, {
        key: "play",
        value: function () {
          c.get(this).play();
        }
      }, {
        key: "pause",
        value: function () {
          c.get(this).pause();
        }
      }, {
        key: "canPlayType",
        value: function () {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
          return "string" != typeof e ? "" : e.indexOf("audio/mpeg") > -1 || e.indexOf("audio/mp4") ? "probably" : "";
        }
      }, {
        key: "cloneNode",
        value: function () {
          var e = new n();
          return e.loop = c.get(this).loop, e.autoplay = c.get(this).loop, e.src = this.src, e;
        }
      }, {
        key: "currentTime",
        get: function () {
          return c.get(this).currentTime;
        },
        set: function (e) {
          c.get(this).seek(e);
        }
      }, {
        key: "src",
        get: function () {
          return l.get(this);
        },
        set: function (e) {
          l.set(this, e), c.get(this).src = e;
        }
      }, {
        key: "loop",
        get: function () {
          return c.get(this).loop;
        },
        set: function (e) {
          c.get(this).loop = e;
        }
      }, {
        key: "autoplay",
        get: function () {
          return c.get(this).autoplay;
        },
        set: function (e) {
          c.get(this).autoplay = e;
        }
      }, {
        key: "paused",
        get: function () {
          return c.get(this).paused;
        }
      }]), n;
    }(u.default));
  n.default = s;
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r,
    a = o(14);
  var i = function (t) {
    function n() {
      return function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      }(this, n), function (t, n) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !n || "object" !== e(n) && "function" != typeof n ? t : n;
      }(this, (n.__proto__ || Object.getPrototypeOf(n)).call(this, "audio"));
    }
    return function (t, n) {
      if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
      t.prototype = Object.create(n && n.prototype, {
        constructor: {
          value: t,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
    }(n, t), n;
  }(((r = a) && r.__esModule ? r : {
    default: r
  }).default);
  n.default = i;
}, function (t, n, o) {
  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r,
    a = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];
          o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
        }
      }
      return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }(),
    i = o(4);
  var u = function (t) {
    function n(t) {
      return function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      }(this, n), function (t, n) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !n || "object" !== e(n) && "function" != typeof n ? t : n;
      }(this, (n.__proto__ || Object.getPrototypeOf(n)).call(this, t));
    }
    return function (t, n) {
      if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function, not " + e(n));
      t.prototype = Object.create(n && n.prototype, {
        constructor: {
          value: t,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), n && (Object.setPrototypeOf ? Object.setPrototypeOf(t, n) : t.__proto__ = n);
    }(n, t), a(n, [{
      key: "addTextTrack",
      value: function () {}
    }, {
      key: "captureStream",
      value: function () {}
    }, {
      key: "fastSeek",
      value: function () {}
    }, {
      key: "load",
      value: function () {}
    }, {
      key: "pause",
      value: function () {}
    }, {
      key: "play",
      value: function () {}
    }]), n;
  }(((r = i) && r.__esModule ? r : {
    default: r
  }).default);
  n.default = u;
}, function (e, t, n) {
  n(16);
}, function (e, t, n) {
  var o,
    r = function (e) {
      if (e && e.__esModule) return e;
      var t = {};
      if (null != e) for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
      return t.default = e, t;
    }(n(1)),
    a = n(10),
    i = (o = a) && o.__esModule ? o : {
      default: o
    },
    u = n(8);
  var c = function e(t) {
    !function (e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }(this, e), this.target = r.canvas, this.currentTarget = r.canvas, this.touches = [], this.targetTouches = [], this.changedTouches = [], this.preventDefault = u.noop, this.stopPropagation = u.noop, this.type = t;
  };
  function l(e) {
    return function (t) {
      var n = new c(e);
      n.touches = t.touches, n.targetTouches = Array.prototype.slice.call(t.touches), n.changedTouches = t.changedTouches, n.timeStamp = t.timeStamp, i.default.dispatchEvent(n);
    };
  }
  wx.onTouchStart(l("touchstart")), wx.onTouchMove(l("touchmove")), wx.onTouchEnd(l("touchend")), wx.onTouchCancel(l("touchcancel"));
}, function (e, t, n) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var o = n(8),
    r = {
      platform: wx.getSystemInfoSync().platform,
      language: "zh-cn",
      appVersion: "5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile/14E8301 MicroMessenger/6.6.0 MiniGame NetType/WIFI Language/zh_CN",
      onLine: !0,
      geolocation: {
        getCurrentPosition: o.noop,
        watchPosition: o.noop,
        clearWatch: o.noop
      }
    };
  t.default = r;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var n = function () {
    function e(e, t) {
      for (var n = 0; n < t.length; n++) {
        var o = t[n];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
      }
    }
    return function (t, n, o) {
      return n && e(t.prototype, n), o && e(t, o), t;
    };
  }();
  var o = new WeakMap(),
    r = new WeakMap(),
    a = new WeakMap(),
    i = new WeakMap(),
    u = new WeakMap();
  function c(e) {
    if ("function" == typeof this["on" + e]) {
      for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++) n[o - 1] = arguments[o];
      this["on" + e].apply(this, n);
    }
  }
  function l(e) {
    this.readyState = e, c.call(this, "readystatechange");
  }
  var s = function () {
    function e() {
      !function (e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      }(this, e), this.onabort = null, this.onerror = null, this.onload = null, this.onloadstart = null, this.onprogress = null, this.ontimeout = null, this.onloadend = null, this.onreadystatechange = null, this.readyState = 0, this.response = null, this.responseText = null, this.responseType = "", this.responseXML = null, this.status = 0, this.statusText = "", this.upload = {}, this.withCredentials = !1, a.set(this, {
        "content-type": "application/x-www-form-urlencoded"
      }), i.set(this, {});
    }
    return n(e, [{
      key: "abort",
      value: function () {
        var e = u.get(this);
        e && e.abort();
      }
    }, {
      key: "getAllResponseHeaders",
      value: function () {
        var e = i.get(this);
        return Object.keys(e).map(function (t) {
          return t + ": " + e[t];
        }).join("\n");
      }
    }, {
      key: "getResponseHeader",
      value: function (e) {
        return i.get(this)[e];
      }
    }, {
      key: "open",
      value: function (t, n) {
        r.set(this, t), o.set(this, n), l.call(this, e.OPENED);
      }
    }, {
      key: "overrideMimeType",
      value: function () {}
    }, {
      key: "send",
      value: function () {
        var t = this,
          n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
        if (this.readyState !== e.OPENED) throw new Error("Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.");
        wx.request({
          data: n,
          url: o.get(this),
          method: r.get(this),
          header: a.get(this),
          responseType: this.responseType,
          success: function (n) {
            var o = n.data,
              r = n.statusCode,
              a = n.header;
            if ("string" != typeof o && !(o instanceof ArrayBuffer)) try {
              o = JSON.stringify(o);
            } catch (e) {
              o = o;
            }
            if (t.status = r, i.set(t, a), c.call(t, "loadstart"), l.call(t, e.HEADERS_RECEIVED), l.call(t, e.LOADING), t.response = o, o instanceof ArrayBuffer) {
              t.responseText = "";
              for (var u = new Uint8Array(o), s = u.byteLength, f = 0; f < s; f++) t.responseText += String.fromCharCode(u[f]);
            } else t.responseText = o;
            l.call(t, e.DONE), c.call(t, "load"), c.call(t, "loadend");
          },
          fail: function (e) {
            var n = e.errMsg;
            -1 !== n.indexOf("abort") ? c.call(t, "abort") : c.call(t, "error", n), c.call(t, "loadend");
          }
        });
      }
    }, {
      key: "setRequestHeader",
      value: function (e, t) {
        var n = a.get(this);
        n[e] = t, a.set(this, n);
      }
    }]), e;
  }();
  s.UNSEND = 0, s.OPENED = 1, s.HEADERS_RECEIVED = 2, s.LOADING = 3, s.DONE = 4, t.default = s;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var n = function () {
    function e(e, t) {
      for (var n = 0; n < t.length; n++) {
        var o = t[n];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
      }
    }
    return function (t, n, o) {
      return n && e(t.prototype, n), o && e(t, o), t;
    };
  }();
  function o(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
  }
  var r = new WeakMap(),
    a = function () {
      function e(t) {
        var n = this,
          a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
        if (o(this, e), this.binaryType = "", this.bufferedAmount = 0, this.extensions = "", this.onclose = null, this.onerror = null, this.onmessage = null, this.onopen = null, this.protocol = "", this.readyState = 3, "string" != typeof t || !/(^ws:\/\/)|(^wss:\/\/)/.test(t)) throw new TypeError("Failed to construct 'WebSocket': The URL '" + t + "' is invalid");
        this.url = t, this.readyState = e.CONNECTING;
        var i = wx.connectSocket({
          url: t,
          protocols: Array.isArray(a) ? a : [a]
        });
        return r.set(this, i), i.onClose(function (t) {
          n.readyState = e.CLOSED, "function" == typeof n.onclose && n.onclose(t);
        }), i.onMessage(function (e) {
          "function" == typeof n.onmessage && n.onmessage(e);
        }), i.onOpen(function () {
          n.readyState = e.OPEN, "function" == typeof n.onopen && n.onopen();
        }), i.onError(function (e) {
          "function" == typeof n.onerror && n.onerror(new Error(e.errMsg));
        }), this;
      }
      return n(e, [{
        key: "close",
        value: function (t, n) {
          this.readyState = e.CLOSING, r.get(this).close({
            code: t,
            reason: n
          });
        }
      }, {
        key: "send",
        value: function (e) {
          if ("string" != typeof e && !(e instanceof ArrayBuffer)) throw new TypeError("Failed to send message: The data " + e + " is invalid");
          r.get(this).send({
            data: e
          });
        }
      }]), e;
    }();
  a.CONNECTING = 0, a.OPEN = 1, a.CLOSING = 2, a.CLOSED = 3, t.default = a;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  t.default = function e() {
    !function (e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }(this, e);
  };
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var n = {
    get length() {
      return wx.getStorageInfoSync().keys.length;
    },
    key: function (e) {
      return wx.getStorageInfoSync().keys[e];
    },
    getItem: function (e) {
      return wx.getStorageSync(e);
    },
    setItem: function (e, t) {
      return wx.setStorageSync(e, t);
    },
    removeItem: function (e) {
      wx.removeStorageSync(e);
    },
    clear: function () {
      wx.clearStorageSync();
    }
  };
  t.default = n;
}, function (e, t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  t.default = {
    href: "game.js",
    reload: function () {}
  };
}]);
