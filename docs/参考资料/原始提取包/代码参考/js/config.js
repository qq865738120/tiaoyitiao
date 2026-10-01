// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
var e = require("../@babel/runtime/helpers/interopRequireDefault").default,
  E = require("../@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.getPKScorePos = exports.WAVE = exports.VERSION = exports.USING_PROP = exports.USEWANGZHEBASE = exports.USEMMPAYBASE = exports.SYNC_DEBONCE_TIME = exports.SUBVERSION = exports.SUBSCRIPTION_SETTING_TYPE = exports.ROOM_LIMIT = exports.REWARD_SCORE = exports.REWARD_CHALLENGE_TEXT = exports.REPORTERTIMEOUT = exports.RELAY_SCORE_POS = exports.RANK_SCORE_KEY = exports.PROP_BOARD = exports.PK_TEXT_POS = exports.PK_SUBSCRIPTION_TEMPLATE_ID = exports.PARTICLE = exports.OBSERVE_SCORE_POS = exports.LOCALBLOCK = exports.GAME_SCORE_POS = exports.GAME = exports.FRUSTUMWIDTH = exports.FRUSTUMSIZE = exports.FRUSTUMHEIGHT = exports.EVENT = exports.DESIGN_WIDTH = exports.DESIGN_HEIGHT = exports.COLORS = exports.CAN_USE_REWARD_CHALLENGE = exports.CAMERA = exports.BOTTLE = exports.BLOCK = exports.BASE_TRADE_MARK_RUL = exports.AUDIO = exports.AD_BOARD = void 0, exports.getSetting = function () {
  return W.apply(this, arguments);
}, exports.getSystemInfo = b, exports.gtVersion = s, exports.loader = void 0;
var r = require("../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../@babel/runtime/helpers/asyncToGenerator"),
  o = E(require("./lib/three")),
  R = e(require("./lib/mue/eventcenter"));
function s(e) {
  try {
    var E = b().SDKVersion;
    e = e.split("."), E = E.split(".");
    for (var r = Math.min(e.length, E.length), t = 0; t < r; t++) {
      if (parseInt(e[t]) > parseInt(E[t])) return !1;
      if (parseInt(e[t]) < parseInt(E[t])) return !0;
    }
    return !0;
  } catch (e) {
    return !1;
  }
}
var _ = exports.DESIGN_WIDTH = 414,
  A = exports.DESIGN_HEIGHT = 736,
  S = exports.FRUSTUMHEIGHT = 60,
  n = exports.FRUSTUMWIDTH = 33.75,
  T = (exports.COLORS = {
    red: 13387325,
    pureRed: 16711680,
    white: 14209233,
    brown: 5845806,
    pink: 15964855,
    brownDark: 2300175,
    blue: 40951,
    yellow: 16760320,
    pureWhite: 16777215,
    orange: 16231020,
    orangeDark: 16747520,
    black: 0,
    cream: 16119285,
    green: 2924391,
    lightBlue: 13758190,
    cyan: 9692366,
    yellowBrown: 16764811,
    purple: 9083606
  }, exports.BOTTLE = {
    headRadius: .945,
    bodyWidth: 2.34,
    bodyDepth: 2.34,
    bodyHeight: 3.2,
    reduction: .005,
    minScale: .5,
    velocityYIncrement: 15,
    velocityY: 135,
    velocityZIncrement: 70
  }),
  p = (exports.PARTICLE = {
    radius: .3,
    detail: 2
  }, exports.GAME = {
    BOTTOMBOUND: -55,
    TOPBOUND: 41,
    gravity: 720,
    touchmoveTolerance: 20,
    LEFTBOUND: -140,
    topTrackZ: -30,
    rightBound: 90,
    HEIGHT: window.innerHeight || 736,
    WIDTH: window.innerWidth || 414,
    canShadow: !0
  }),
  i = (exports.WAVE = {
    innerRadius: 2.2,
    outerRadius: 3,
    thetaSeg: 25
  }, exports.CAMERA = {
    fov: 60
  }, exports.AUDIO = {
    success: "res/success.mp3",
    perfect: "res/perfect.mp3",
    scale_loop: "res/scale_loop.mp3",
    scale_intro: "res/scale_intro.mp3",
    restart: "res/start.mp3",
    fall: "res/fall.mp3",
    fall_2: "res/fall_2.mp3",
    combo1: "res/combo1.mp3",
    combo2: "res/combo2.mp3",
    combo3: "res/combo3.mp3",
    combo4: "res/combo4.mp3",
    combo5: "res/combo5.mp3",
    combo6: "res/combo6.mp3",
    combo7: "res/combo7.mp3",
    combo8: "res/combo8.mp3",
    icon: "res/icon.mp3",
    pop: "res/pop.mp3",
    sing: "res/sing.mp3",
    store: "res/store.mp3",
    water: "res/water.mp3",
    pay: "res/wechat_pay.mp3",
    luban: "res/luban.mp3",
    relax: "res/relax.mp3"
  }, exports.BLOCK = {
    radius: 5,
    width: 10,
    minRadiusScale: .8,
    maxRadiusScale: 1,
    height: 5.5,
    radiusSegments: [4, 50],
    floatHeight: 0,
    minDistance: 1,
    maxDistance: 17,
    minScale: T.minScale,
    reduction: T.reduction,
    moveDownVelocity: .07,
    fullHeight: 5.5 / 21 * 40
  }, exports.FRUSTUMSIZE = p.HEIGHT / p.WIDTH / 736 * 414 * 60);
console.log(i, "FRUSTUMSIZE");
exports.loader = new o.TextureLoader(), exports.REPORTERTIMEOUT = 60001, exports.VERSION = 4, exports.SUBVERSION = "4.0.6", exports.USEWANGZHEBASE = 1, exports.USEMMPAYBASE = 1, exports.ROOM_LIMIT = "10", exports.SUBSCRIPTION_SETTING_TYPE = {
  ACCEPT: "accept",
  REJECT: "reject",
  ACCEPT_WITH_FORCE_PUSH: "acceptWithForcePush",
  BAN: "ban"
};
var I,
  O,
  c,
  a,
  G,
  x,
  L,
  C,
  P,
  N,
  l,
  u,
  M,
  D = exports.EVENT = {
    INIT_SETTING_COMPLETE: "INIT_SETTING_SUCCESS",
    LIVESTATECHANGE: "LIVESTATECHANGE",
    RELAYCREATEROOM: "relayCreateRoom",
    JOINRELAYROOM: "JOINRELAYROOM",
    PEOPLECOME: "PEOPLECOME",
    PEOPLEOUT: "PEOPLEOUT",
    RELAYSTART: "RELAYSTART",
    NOWPLAYERJUMP: "NOWPLAYERJUMP",
    CHECKUSER: "CHECKUSER",
    RELAYCHECKUSER: "RELAYCHECKUSER",
    RUNGAME: "RUNGAME",
    ENDGAME: "ENDGAME",
    PLAYERDIED: "PLAYERDIED",
    NOWPLAYEROVER: "NOWPLAYEROVER",
    RECEIVEMINICODE: "RECEIVEMINICODE",
    GOSTARTPAGE: "GOSTARTPAGE",
    GOTOSINGLESTARTPAGE: "GOTOSINGLESTARTPAGE",
    REPLAYAGAIN: "REPLAYAGAIN",
    SYNCMSGSEQ: "SYNCMSGSEQ",
    RELAYMODEDESTROY: "RELAYMODEDESTROY",
    SYNCSCENE: "SYNCSCENE",
    WATCHRELAY: "WATCHRELAY",
    CHECK_GAME: "CHECK_GAME",
    SEND_CHECK_GAME: "SEND_CHECK_GAME",
    PROGRESSOVER: "PROGRESSOVER",
    CHANGEGAMELEVEL: "CHANGEGAMELEVEL",
    RECEIVEGAMELEVELCHANGE: "RECEIVEGAMELEVELCHANGE",
    SHOW_RELAY_GUIDE: "SHOW_RELAY_GUIDE",
    SKIP_RELAY_GUIDE: "SKIP_RELAY_GUIDE",
    CREATE_RELAY_ROOM_FAIL: "CREATE_RELAY_ROOM_FAIL",
    RP_JOIN_RELAY_ROOM_AGAIN: "RP_JOIN_RELAY_ROOM_AGAIN",
    RP_JOIN_RELAY_ROOM: "RP_JOIN_RELAY_ROOM",
    RP_RELAY_START: "RP_RELAY_START",
    ORDERRUNGAME: "ORDERRUNGAME",
    RP_RELAY_GAME_END: "RP_RELAY_GAME_END",
    GETRELAYQR: "GETRELAYQR",
    GETRELAYCHECKUSERERROR: "GETRELAYCHECKUSERERROR",
    INITRESPONSE: "INITRESPONSE",
    TRIGGER_EGG: "TRIGGER_EGG",
    CLOSE_HIGHEST_MODEL: "CLOSE_HIGHEST_MODEL",
    TRIGGER_AD_JUMP: "TRIGGER_AD_JUMP",
    AFTER_SHOWN_START_PAGE: "AFTER_SHOWN_START_PAGE",
    TRIGGER_PROP: "TRIGGER_PROP",
    RECEIVE_REALTIME_MSG: "RECEIVE_REALTIME_MSG",
    SEND_REALTIME_MSG: "SEND_REALTIME_MSG",
    SEND_REALTIME_MSG_TO_CTRL: "SEND_REALTIME_MSG_TO_CTRL",
    JUMP_AD: "JUMP_AD",
    JUMP_AD_GG: "JUMP_AD_GG",
    CHALLENGE_START: "CHALLENGE_START"
  };
exports.LOCALBLOCK = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], exports.BASE_TRADE_MARK_RUL = "res/wechat_logo.png", exports.PK_TEXT_POS = {
  x: 9.5,
  y: 4 + (i < 60 ? i / 2 - 9 : 21)
}, exports.getPKScorePos = function (e) {
  console.log("!!! getPKScorePos score", e);
  for (var E = 13, r = e; r >= 10;) r /= 10, E -= 2.5;
  return console.log("!!! getPKScorePos x", E), {
    x: E,
    y: i < 60 ? i / 2 - 9 : 21
  };
}, exports.GAME_SCORE_POS = {
  x: -13,
  y: i < 60 ? i / 2 - 9 : 21
}, exports.OBSERVE_SCORE_POS = {
  x: 0,
  y: i < 60 ? ~~(11 * i / 60) : 11
}, exports.RELAY_SCORE_POS = {
  x: -13.8,
  y: i < 60 ? 19 : 26
}, exports.PROP_BOARD = {
  p: (I = {
    designX: 207,
    designY: 694,
    desighW: 45,
    designH: 45
  }, O = I.designX, c = I.designY, a = I.designH, G = I.desighW, x = H(O), L = m(c) - (i - S) / 2, C = U(G / 2), P = U(G), N = U(a), l = p.WIDTH / _, u = O * l, M = p.WIDTH / n * (i / 2 - L), {
    RADIUS: C,
    WIDTH: P,
    HEIGHT: N,
    x: x,
    y: L,
    UI_x: u,
    UI_y: M,
    UI_left: u - G / 2 * l,
    UI_right: u + G / 2 * l,
    UI_top: M - a / 2 * l,
    UI_bottom: M + a / 2 * l
  }),
  skin: {
    s1: "http://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNTTiaKet81gQJBaI5ibAEtVLs2DLAVwl4u2xxutYHQRRMiaQVlZdyIWVWSf0IBo797QCiah7lGicrHELRg/0?wx_fmt=png"
  },
  skinTexture: {}
}, exports.USING_PROP = 1, exports.AD_BOARD = function (e) {
  var E = e.designX,
    r = e.designY,
    t = e.designH,
    o = e.desighW,
    R = H(E),
    s = m(r),
    S = U(o / 2),
    n = U(o),
    T = U(t),
    i = p.WIDTH / _,
    I = E * i,
    O = r * i + (p.HEIGHT - A * i) / 2;
  return {
    RADIUS: S,
    WIDTH: n,
    HEIGHT: T,
    x: R,
    y: s,
    UI_x: I,
    UI_y: O,
    UI_left: I - o / 2 * i,
    UI_right: I + o / 2 * i,
    UI_top: O - t / 2 * i,
    UI_bottom: O + t / 2 * i
  };
}({
  designX: 367,
  designY: 98.126,
  designH: 44,
  desighW: 44
}), exports.SYNC_DEBONCE_TIME = 5e3, exports.PK_SUBSCRIPTION_TEMPLATE_ID = "Pijb7-2pKuuhnQNHC_qkSNGW8lER43b2fpcFww3_C8E";
function U(e) {
  return (n / _ * e).toFixed(2);
}
function H(e) {
  return (n * (e / _) - n / 2).toFixed(2);
}
function m(e) {
  return (e / _ * -n + S / 2).toFixed(2);
}
var g = exports.CAN_USE_REWARD_CHALLENGE = s("3.10.1"),
  d = (exports.RANK_SCORE_KEY = "tiaoyitiao", exports.REWARD_SCORE = 100),
  Y = (exports.REWARD_CHALLENGE_TEXT = g ? "达到".concat(d, "分可发起有奖擂台赛，得皮肤和道具") : "", null);
function b() {
  return Y || (wx.getSystemInfoSync && (Y = wx.getSystemInfoSync(), console.log("!!! getSystemInfoSync", Y)), Y || {});
}
var f = null,
  h = !0;
function W() {
  return (W = t(r().mark(function e() {
    var E,
      t,
      o = arguments;
    return r().wrap(function (e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (E = o.length > 0 && void 0 !== o[0] && o[0], console.log("!!! getSetting", E), !f || E) {
            e.next = 1;
            break;
          }
          return e.abrupt("return", f);
        case 1:
          if (e.prev = 1, !wx.getSetting) {
            e.next = 3;
            break;
          }
          return e.next = 2, new Promise(function (e, E) {
            wx.getSetting({
              withSubscriptions: !0,
              success: function (E) {
                console.log("!!! getSetting success", E), e(E);
              },
              fail: function (e) {
                console.error("!!! getSetting fail", e), E(e);
              }
            });
          });
        case 2:
          f = e.sent;
        case 3:
          e.next = 5;
          break;
        case 4:
          e.prev = 4, t = e.catch(1), console.error("!!! 获取用户设置失败", t);
        case 5:
          return h && (h = !1, R.default.emitSync(D.INIT_SETTING_COMPLETE, f)), e.abrupt("return", f);
        case 6:
        case "end":
          return e.stop();
      }
    }, e, null, [[1, 4]]);
  }))).apply(this, arguments);
}
