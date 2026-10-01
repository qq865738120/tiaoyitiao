// 从游戏包的 define 模块拆分并格式化；学习参考，非 Cocos 脚本。
Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = void 0;
var t,
  e,
  r = r || function (t, e) {
    var r = {},
      i = r.lib = {},
      n = function () {},
      s = i.Base = {
        extend: function (t) {
          n.prototype = this;
          var e = new n();
          return t && e.mixIn(t), e.hasOwnProperty("init") || (e.init = function () {
            e.$super.init.apply(this, arguments);
          }), e.init.prototype = e, e.$super = this, e;
        },
        create: function () {
          var t = this.extend();
          return t.init.apply(t, arguments), t;
        },
        init: function () {},
        mixIn: function (t) {
          for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
          t.hasOwnProperty("toString") && (this.toString = t.toString);
        },
        clone: function () {
          return this.init.prototype.extend(this);
        }
      },
      o = i.WordArray = s.extend({
        init: function (t, e) {
          t = this.words = t || [], this.sigBytes = null != e ? e : 4 * t.length;
        },
        toString: function (t) {
          return (t || a).stringify(this);
        },
        concat: function (t) {
          var e = this.words,
            r = t.words,
            i = this.sigBytes;
          if (t = t.sigBytes, this.clamp(), i % 4) for (var n = 0; n < t; n++) e[i + n >>> 2] |= (r[n >>> 2] >>> 24 - n % 4 * 8 & 255) << 24 - (i + n) % 4 * 8;else if (65535 < r.length) for (n = 0; n < t; n += 4) e[i + n >>> 2] = r[n >>> 2];else e.push.apply(e, r);
          return this.sigBytes += t, this;
        },
        clamp: function () {
          var e = this.words,
            r = this.sigBytes;
          e[r >>> 2] &= 4294967295 << 32 - r % 4 * 8, e.length = t.ceil(r / 4);
        },
        clone: function () {
          var t = s.clone.call(this);
          return t.words = this.words.slice(0), t;
        },
        random: function (e) {
          for (var r = [], i = 0; i < e; i += 4) r.push(4294967296 * t.random() | 0);
          return new o.init(r, e);
        }
      }),
      c = r.enc = {},
      a = c.Hex = {
        stringify: function (t) {
          var e = t.words;
          t = t.sigBytes;
          for (var r = [], i = 0; i < t; i++) {
            var n = e[i >>> 2] >>> 24 - i % 4 * 8 & 255;
            r.push((n >>> 4).toString(16)), r.push((15 & n).toString(16));
          }
          return r.join("");
        },
        parse: function (t) {
          for (var e = t.length, r = [], i = 0; i < e; i += 2) r[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4;
          return new o.init(r, e / 2);
        }
      },
      h = c.Latin1 = {
        stringify: function (t) {
          var e = t.words;
          t = t.sigBytes;
          for (var r = [], i = 0; i < t; i++) r.push(String.fromCharCode(e[i >>> 2] >>> 24 - i % 4 * 8 & 255));
          return r.join("");
        },
        parse: function (t) {
          for (var e = t.length, r = [], i = 0; i < e; i++) r[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8;
          return new o.init(r, e);
        }
      },
      f = c.Utf8 = {
        stringify: function (t) {
          try {
            return decodeURIComponent(escape(h.stringify(t)));
          } catch (t) {
            throw Error("Malformed UTF-8 data");
          }
        },
        parse: function (t) {
          return h.parse(unescape(encodeURIComponent(t)));
        }
      },
      u = i.BufferedBlockAlgorithm = s.extend({
        reset: function () {
          this._data = new o.init(), this._nDataBytes = 0;
        },
        _append: function (t) {
          "string" == typeof t && (t = f.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes;
        },
        _process: function (e) {
          var r = this._data,
            i = r.words,
            n = r.sigBytes,
            s = this.blockSize,
            c = n / (4 * s);
          if (e = (c = e ? t.ceil(c) : t.max((0 | c) - this._minBufferSize, 0)) * s, n = t.min(4 * e, n), e) {
            for (var a = 0; a < e; a += s) this._doProcessBlock(i, a);
            a = i.splice(0, e), r.sigBytes -= n;
          }
          return new o.init(a, n);
        },
        clone: function () {
          var t = s.clone.call(this);
          return t._data = this._data.clone(), t;
        },
        _minBufferSize: 0
      });
    i.Hasher = u.extend({
      cfg: s.extend(),
      init: function (t) {
        this.cfg = this.cfg.extend(t), this.reset();
      },
      reset: function () {
        u.reset.call(this), this._doReset();
      },
      update: function (t) {
        return this._append(t), this._process(), this;
      },
      finalize: function (t) {
        return t && this._append(t), this._doFinalize();
      },
      blockSize: 16,
      _createHelper: function (t) {
        return function (e, r) {
          return new t.init(r).finalize(e);
        };
      },
      _createHmacHelper: function (t) {
        return function (e, r) {
          return new d.HMAC.init(t, r).finalize(e);
        };
      }
    });
    var d = r.algo = {};
    return r;
  }(Math);
e = (t = r).lib.WordArray, t.enc.Base64 = {
  stringify: function (t) {
    var e = t.words,
      r = t.sigBytes,
      i = this._map;
    t.clamp(), t = [];
    for (var n = 0; n < r; n += 3) for (var s = (e[n >>> 2] >>> 24 - n % 4 * 8 & 255) << 16 | (e[n + 1 >>> 2] >>> 24 - (n + 1) % 4 * 8 & 255) << 8 | e[n + 2 >>> 2] >>> 24 - (n + 2) % 4 * 8 & 255, o = 0; 4 > o && n + .75 * o < r; o++) t.push(i.charAt(s >>> 6 * (3 - o) & 63));
    if (e = i.charAt(64)) for (; t.length % 4;) t.push(e);
    return t.join("");
  },
  parse: function (t) {
    var r = t.length,
      i = this._map;
    (n = i.charAt(64)) && -1 != (n = t.indexOf(n)) && (r = n);
    for (var n = [], s = 0, o = 0; o < r; o++) if (o % 4) {
      var c = i.indexOf(t.charAt(o - 1)) << o % 4 * 2,
        a = i.indexOf(t.charAt(o)) >>> 6 - o % 4 * 2;
      n[s >>> 2] |= (c | a) << 24 - s % 4 * 8, s++;
    }
    return e.create(n, s);
  },
  _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
}, function (t) {
  function e(t, e, r, i, n, s, o) {
    return ((t = t + (e & r | ~e & i) + n + o) << s | t >>> 32 - s) + e;
  }
  function i(t, e, r, i, n, s, o) {
    return ((t = t + (e & i | r & ~i) + n + o) << s | t >>> 32 - s) + e;
  }
  function n(t, e, r, i, n, s, o) {
    return ((t = t + (e ^ r ^ i) + n + o) << s | t >>> 32 - s) + e;
  }
  function s(t, e, r, i, n, s, o) {
    return ((t = t + (r ^ (e | ~i)) + n + o) << s | t >>> 32 - s) + e;
  }
  for (var o = r, c = (h = o.lib).WordArray, a = h.Hasher, h = o.algo, f = [], u = 0; 64 > u; u++) f[u] = 4294967296 * t.abs(t.sin(u + 1)) | 0;
  h = h.MD5 = a.extend({
    _doReset: function () {
      this._hash = new c.init([1732584193, 4023233417, 2562383102, 271733878]);
    },
    _doProcessBlock: function (t, r) {
      for (var o = 0; 16 > o; o++) {
        var c = t[a = r + o];
        t[a] = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8);
      }
      o = this._hash.words;
      var a = t[r + 0],
        h = (c = t[r + 1], t[r + 2]),
        u = t[r + 3],
        d = t[r + 4],
        p = t[r + 5],
        l = t[r + 6],
        _ = t[r + 7],
        y = t[r + 8],
        v = t[r + 9],
        g = t[r + 10],
        B = t[r + 11],
        x = t[r + 12],
        k = t[r + 13],
        m = t[r + 14],
        S = t[r + 15],
        w = e(w = o[0], M = o[1], C = o[2], z = o[3], a, 7, f[0]),
        z = e(z, w, M, C, c, 12, f[1]),
        C = e(C, z, w, M, h, 17, f[2]),
        M = e(M, C, z, w, u, 22, f[3]);
      w = e(w, M, C, z, d, 7, f[4]), z = e(z, w, M, C, p, 12, f[5]), C = e(C, z, w, M, l, 17, f[6]), M = e(M, C, z, w, _, 22, f[7]), w = e(w, M, C, z, y, 7, f[8]), z = e(z, w, M, C, v, 12, f[9]), C = e(C, z, w, M, g, 17, f[10]), M = e(M, C, z, w, B, 22, f[11]), w = e(w, M, C, z, x, 7, f[12]), z = e(z, w, M, C, k, 12, f[13]), C = e(C, z, w, M, m, 17, f[14]), w = i(w, M = e(M, C, z, w, S, 22, f[15]), C, z, c, 5, f[16]), z = i(z, w, M, C, l, 9, f[17]), C = i(C, z, w, M, B, 14, f[18]), M = i(M, C, z, w, a, 20, f[19]), w = i(w, M, C, z, p, 5, f[20]), z = i(z, w, M, C, g, 9, f[21]), C = i(C, z, w, M, S, 14, f[22]), M = i(M, C, z, w, d, 20, f[23]), w = i(w, M, C, z, v, 5, f[24]), z = i(z, w, M, C, m, 9, f[25]), C = i(C, z, w, M, u, 14, f[26]), M = i(M, C, z, w, y, 20, f[27]), w = i(w, M, C, z, k, 5, f[28]), z = i(z, w, M, C, h, 9, f[29]), C = i(C, z, w, M, _, 14, f[30]), w = n(w, M = i(M, C, z, w, x, 20, f[31]), C, z, p, 4, f[32]), z = n(z, w, M, C, y, 11, f[33]), C = n(C, z, w, M, B, 16, f[34]), M = n(M, C, z, w, m, 23, f[35]), w = n(w, M, C, z, c, 4, f[36]), z = n(z, w, M, C, d, 11, f[37]), C = n(C, z, w, M, _, 16, f[38]), M = n(M, C, z, w, g, 23, f[39]), w = n(w, M, C, z, k, 4, f[40]), z = n(z, w, M, C, a, 11, f[41]), C = n(C, z, w, M, u, 16, f[42]), M = n(M, C, z, w, l, 23, f[43]), w = n(w, M, C, z, v, 4, f[44]), z = n(z, w, M, C, x, 11, f[45]), C = n(C, z, w, M, S, 16, f[46]), w = s(w, M = n(M, C, z, w, h, 23, f[47]), C, z, a, 6, f[48]), z = s(z, w, M, C, _, 10, f[49]), C = s(C, z, w, M, m, 15, f[50]), M = s(M, C, z, w, p, 21, f[51]), w = s(w, M, C, z, x, 6, f[52]), z = s(z, w, M, C, u, 10, f[53]), C = s(C, z, w, M, g, 15, f[54]), M = s(M, C, z, w, c, 21, f[55]), w = s(w, M, C, z, y, 6, f[56]), z = s(z, w, M, C, S, 10, f[57]), C = s(C, z, w, M, l, 15, f[58]), M = s(M, C, z, w, k, 21, f[59]), w = s(w, M, C, z, d, 6, f[60]), z = s(z, w, M, C, B, 10, f[61]), C = s(C, z, w, M, h, 15, f[62]), M = s(M, C, z, w, v, 21, f[63]);
      o[0] = o[0] + w | 0, o[1] = o[1] + M | 0, o[2] = o[2] + C | 0, o[3] = o[3] + z | 0;
    },
    _doFinalize: function () {
      var e = this._data,
        r = e.words,
        i = 8 * this._nDataBytes,
        n = 8 * e.sigBytes;
      r[n >>> 5] |= 128 << 24 - n % 32;
      var s = t.floor(i / 4294967296);
      for (r[15 + (n + 64 >>> 9 << 4)] = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), r[14 + (n + 64 >>> 9 << 4)] = 16711935 & (i << 8 | i >>> 24) | 4278255360 & (i << 24 | i >>> 8), e.sigBytes = 4 * (r.length + 1), this._process(), r = (e = this._hash).words, i = 0; 4 > i; i++) n = r[i], r[i] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8);
      return e;
    },
    clone: function () {
      var t = a.clone.call(this);
      return t._hash = this._hash.clone(), t;
    }
  }), o.MD5 = a._createHelper(h), o.HmacMD5 = a._createHmacHelper(h);
}(Math), function () {
  var t,
    e = r,
    i = (t = e.lib).Base,
    n = t.WordArray,
    s = (t = e.algo).EvpKDF = i.extend({
      cfg: i.extend({
        keySize: 4,
        hasher: t.MD5,
        iterations: 1
      }),
      init: function (t) {
        this.cfg = this.cfg.extend(t);
      },
      compute: function (t, e) {
        for (var r = (c = this.cfg).hasher.create(), i = n.create(), s = i.words, o = c.keySize, c = c.iterations; s.length < o;) {
          a && r.update(a);
          var a = r.update(t).finalize(e);
          r.reset();
          for (var h = 1; h < c; h++) a = r.finalize(a), r.reset();
          i.concat(a);
        }
        return i.sigBytes = 4 * o, i;
      }
    });
  e.EvpKDF = function (t, e, r) {
    return s.create(r).compute(t, e);
  };
}(), r.lib.Cipher || function (t) {
  var e = (l = r).lib,
    i = e.Base,
    n = e.WordArray,
    s = e.BufferedBlockAlgorithm,
    o = l.enc.Base64,
    c = l.algo.EvpKDF,
    a = e.Cipher = s.extend({
      cfg: i.extend(),
      createEncryptor: function (t, e) {
        return this.create(this._ENC_XFORM_MODE, t, e);
      },
      createDecryptor: function (t, e) {
        return this.create(this._DEC_XFORM_MODE, t, e);
      },
      init: function (t, e, r) {
        this.cfg = this.cfg.extend(r), this._xformMode = t, this._key = e, this.reset();
      },
      reset: function () {
        s.reset.call(this), this._doReset();
      },
      process: function (t) {
        return this._append(t), this._process();
      },
      finalize: function (t) {
        return t && this._append(t), this._doFinalize();
      },
      keySize: 4,
      ivSize: 4,
      _ENC_XFORM_MODE: 1,
      _DEC_XFORM_MODE: 2,
      _createHelper: function (t) {
        return {
          encrypt: function (e, r, i) {
            return ("string" == typeof r ? _ : p).encrypt(t, e, r, i);
          },
          decrypt: function (e, r, i) {
            return ("string" == typeof r ? _ : p).decrypt(t, e, r, i);
          }
        };
      }
    });
  e.StreamCipher = a.extend({
    _doFinalize: function () {
      return this._process(!0);
    },
    blockSize: 1
  });
  var h = l.mode = {},
    f = function (t, e, r) {
      var i = this._iv;
      i ? this._iv = void 0 : i = this._prevBlock;
      for (var n = 0; n < r; n++) t[e + n] ^= i[n];
    },
    u = (e.BlockCipherMode = i.extend({
      createEncryptor: function (t, e) {
        return this.Encryptor.create(t, e);
      },
      createDecryptor: function (t, e) {
        return this.Decryptor.create(t, e);
      },
      init: function (t, e) {
        this._cipher = t, this._iv = e;
      }
    })).extend();
  u.Encryptor = u.extend({
    processBlock: function (t, e) {
      var r = this._cipher,
        i = r.blockSize;
      f.call(this, t, e, i), r.encryptBlock(t, e), this._prevBlock = t.slice(e, e + i);
    }
  }), u.Decryptor = u.extend({
    processBlock: function (t, e) {
      var r = this._cipher,
        i = r.blockSize,
        n = t.slice(e, e + i);
      r.decryptBlock(t, e), f.call(this, t, e, i), this._prevBlock = n;
    }
  }), h = h.CBC = u, u = (l.pad = {}).Pkcs7 = {
    pad: function (t, e) {
      for (var r, i = (r = (r = 4 * e) - t.sigBytes % r) << 24 | r << 16 | r << 8 | r, s = [], o = 0; o < r; o += 4) s.push(i);
      r = n.create(s, r), t.concat(r);
    },
    unpad: function (t) {
      t.sigBytes -= 255 & t.words[t.sigBytes - 1 >>> 2];
    }
  }, e.BlockCipher = a.extend({
    cfg: a.cfg.extend({
      mode: h,
      padding: u
    }),
    reset: function () {
      a.reset.call(this);
      var t = (e = this.cfg).iv,
        e = e.mode;
      if (this._xformMode == this._ENC_XFORM_MODE) var r = e.createEncryptor;else r = e.createDecryptor, this._minBufferSize = 1;
      this._mode = r.call(e, this, t && t.words);
    },
    _doProcessBlock: function (t, e) {
      this._mode.processBlock(t, e);
    },
    _doFinalize: function () {
      var t = this.cfg.padding;
      if (this._xformMode == this._ENC_XFORM_MODE) {
        t.pad(this._data, this.blockSize);
        var e = this._process(!0);
      } else e = this._process(!0), t.unpad(e);
      return e;
    },
    blockSize: 4
  });
  var d = e.CipherParams = i.extend({
      init: function (t) {
        this.mixIn(t);
      },
      toString: function (t) {
        return (t || this.formatter).stringify(this);
      }
    }),
    p = (h = (l.format = {}).OpenSSL = {
      stringify: function (t) {
        var e = t.ciphertext;
        return ((t = t.salt) ? n.create([1398893684, 1701076831]).concat(t).concat(e) : e).toString(o);
      },
      parse: function (t) {
        var e = (t = o.parse(t)).words;
        if (1398893684 == e[0] && 1701076831 == e[1]) {
          var r = n.create(e.slice(2, 4));
          e.splice(0, 4), t.sigBytes -= 16;
        }
        return d.create({
          ciphertext: t,
          salt: r
        });
      }
    }, e.SerializableCipher = i.extend({
      cfg: i.extend({
        format: h
      }),
      encrypt: function (t, e, r, i) {
        i = this.cfg.extend(i);
        var n = t.createEncryptor(r, i);
        return e = n.finalize(e), n = n.cfg, d.create({
          ciphertext: e,
          key: r,
          iv: n.iv,
          algorithm: t,
          mode: n.mode,
          padding: n.padding,
          blockSize: t.blockSize,
          formatter: i.format
        });
      },
      decrypt: function (t, e, r, i) {
        return i = this.cfg.extend(i), e = this._parse(e, i.format), t.createDecryptor(r, i).finalize(e.ciphertext);
      },
      _parse: function (t, e) {
        return "string" == typeof t ? e.parse(t, this) : t;
      }
    })),
    l = (l.kdf = {}).OpenSSL = {
      execute: function (t, e, r, i) {
        return i || (i = n.random(8)), t = c.create({
          keySize: e + r
        }).compute(t, i), r = n.create(t.words.slice(e), 4 * r), t.sigBytes = 4 * e, d.create({
          key: t,
          iv: r,
          salt: i
        });
      }
    },
    _ = e.PasswordBasedCipher = p.extend({
      cfg: p.cfg.extend({
        kdf: l
      }),
      encrypt: function (t, e, r, i) {
        return r = (i = this.cfg.extend(i)).kdf.execute(r, t.keySize, t.ivSize), i.iv = r.iv, (t = p.encrypt.call(this, t, e, r.key, i)).mixIn(r), t;
      },
      decrypt: function (t, e, r, i) {
        return i = this.cfg.extend(i), e = this._parse(e, i.format), r = i.kdf.execute(r, t.keySize, t.ivSize, e.salt), i.iv = r.iv, p.decrypt.call(this, t, e, r.key, i);
      }
    });
}(), function () {
  for (var t = r, e = t.lib.BlockCipher, i = t.algo, n = [], s = [], o = [], c = [], a = [], h = [], f = [], u = [], d = [], p = [], l = [], _ = 0; 256 > _; _++) l[_] = 128 > _ ? _ << 1 : _ << 1 ^ 283;
  var y = 0,
    v = 0;
  for (_ = 0; 256 > _; _++) {
    var g = (g = v ^ v << 1 ^ v << 2 ^ v << 3 ^ v << 4) >>> 8 ^ 255 & g ^ 99;
    n[y] = g, s[g] = y;
    var B = l[y],
      x = l[B],
      k = l[x],
      m = 257 * l[g] ^ 16843008 * g;
    o[y] = m << 24 | m >>> 8, c[y] = m << 16 | m >>> 16, a[y] = m << 8 | m >>> 24, h[y] = m, m = 16843009 * k ^ 65537 * x ^ 257 * B ^ 16843008 * y, f[g] = m << 24 | m >>> 8, u[g] = m << 16 | m >>> 16, d[g] = m << 8 | m >>> 24, p[g] = m, y ? (y = B ^ l[l[l[k ^ B]]], v ^= l[l[v]]) : y = v = 1;
  }
  var S = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
  i = i.AES = e.extend({
    _doReset: function () {
      for (var t = (r = this._key).words, e = r.sigBytes / 4, r = 4 * ((this._nRounds = e + 6) + 1), i = this._keySchedule = [], s = 0; s < r; s++) if (s < e) i[s] = t[s];else {
        var o = i[s - 1];
        s % e ? 6 < e && 4 == s % e && (o = n[o >>> 24] << 24 | n[o >>> 16 & 255] << 16 | n[o >>> 8 & 255] << 8 | n[255 & o]) : (o = n[(o = o << 8 | o >>> 24) >>> 24] << 24 | n[o >>> 16 & 255] << 16 | n[o >>> 8 & 255] << 8 | n[255 & o], o ^= S[s / e | 0] << 24), i[s] = i[s - e] ^ o;
      }
      for (t = this._invKeySchedule = [], e = 0; e < r; e++) s = r - e, o = e % 4 ? i[s] : i[s - 4], t[e] = 4 > e || 4 >= s ? o : f[n[o >>> 24]] ^ u[n[o >>> 16 & 255]] ^ d[n[o >>> 8 & 255]] ^ p[n[255 & o]];
    },
    encryptBlock: function (t, e) {
      this._doCryptBlock(t, e, this._keySchedule, o, c, a, h, n);
    },
    decryptBlock: function (t, e) {
      var r = t[e + 1];
      t[e + 1] = t[e + 3], t[e + 3] = r, this._doCryptBlock(t, e, this._invKeySchedule, f, u, d, p, s), r = t[e + 1], t[e + 1] = t[e + 3], t[e + 3] = r;
    },
    _doCryptBlock: function (t, e, r, i, n, s, o, c) {
      for (var a = this._nRounds, h = t[e] ^ r[0], f = t[e + 1] ^ r[1], u = t[e + 2] ^ r[2], d = t[e + 3] ^ r[3], p = 4, l = 1; l < a; l++) {
        var _ = i[h >>> 24] ^ n[f >>> 16 & 255] ^ s[u >>> 8 & 255] ^ o[255 & d] ^ r[p++],
          y = i[f >>> 24] ^ n[u >>> 16 & 255] ^ s[d >>> 8 & 255] ^ o[255 & h] ^ r[p++],
          v = i[u >>> 24] ^ n[d >>> 16 & 255] ^ s[h >>> 8 & 255] ^ o[255 & f] ^ r[p++];
        d = i[d >>> 24] ^ n[h >>> 16 & 255] ^ s[f >>> 8 & 255] ^ o[255 & u] ^ r[p++], h = _, f = y, u = v;
      }
      _ = (c[h >>> 24] << 24 | c[f >>> 16 & 255] << 16 | c[u >>> 8 & 255] << 8 | c[255 & d]) ^ r[p++], y = (c[f >>> 24] << 24 | c[u >>> 16 & 255] << 16 | c[d >>> 8 & 255] << 8 | c[255 & h]) ^ r[p++], v = (c[u >>> 24] << 24 | c[d >>> 16 & 255] << 16 | c[h >>> 8 & 255] << 8 | c[255 & f]) ^ r[p++], d = (c[d >>> 24] << 24 | c[h >>> 16 & 255] << 16 | c[f >>> 8 & 255] << 8 | c[255 & u]) ^ r[p++], t[e] = _, t[e + 1] = y, t[e + 2] = v, t[e + 3] = d;
    },
    keySize: 8
  });
  t.AES = e._createHelper(i);
}(), function (t) {
  for (var e = r, i = (s = e.lib).WordArray, n = s.Hasher, s = e.algo, o = [], c = [], a = function (t) {
      return 4294967296 * (t - (0 | t)) | 0;
    }, h = 2, f = 0; 64 > f;) {
    var u;
    t: {
      u = h;
      for (var d = t.sqrt(u), p = 2; p <= d; p++) if (!(u % p)) {
        u = !1;
        break t;
      }
      u = !0;
    }
    u && (8 > f && (o[f] = a(t.pow(h, .5))), c[f] = a(t.pow(h, 1 / 3)), f++), h++;
  }
  var l = [];
  s = s.SHA256 = n.extend({
    _doReset: function () {
      this._hash = new i.init(o.slice(0));
    },
    _doProcessBlock: function (t, e) {
      for (var r = this._hash.words, i = r[0], n = r[1], s = r[2], o = r[3], a = r[4], h = r[5], f = r[6], u = r[7], d = 0; 64 > d; d++) {
        if (16 > d) l[d] = 0 | t[e + d];else {
          var p = l[d - 15],
            _ = l[d - 2];
          l[d] = ((p << 25 | p >>> 7) ^ (p << 14 | p >>> 18) ^ p >>> 3) + l[d - 7] + ((_ << 15 | _ >>> 17) ^ (_ << 13 | _ >>> 19) ^ _ >>> 10) + l[d - 16];
        }
        p = u + ((a << 26 | a >>> 6) ^ (a << 21 | a >>> 11) ^ (a << 7 | a >>> 25)) + (a & h ^ ~a & f) + c[d] + l[d], _ = ((i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22)) + (i & n ^ i & s ^ n & s), u = f, f = h, h = a, a = o + p | 0, o = s, s = n, n = i, i = p + _ | 0;
      }
      r[0] = r[0] + i | 0, r[1] = r[1] + n | 0, r[2] = r[2] + s | 0, r[3] = r[3] + o | 0, r[4] = r[4] + a | 0, r[5] = r[5] + h | 0, r[6] = r[6] + f | 0, r[7] = r[7] + u | 0;
    },
    _doFinalize: function () {
      var e = this._data,
        r = e.words,
        i = 8 * this._nDataBytes,
        n = 8 * e.sigBytes;
      return r[n >>> 5] |= 128 << 24 - n % 32, r[14 + (n + 64 >>> 9 << 4)] = t.floor(i / 4294967296), r[15 + (n + 64 >>> 9 << 4)] = i, e.sigBytes = 4 * r.length, this._process(), this._hash;
    },
    clone: function () {
      var t = n.clone.call(this);
      return t._hash = this._hash.clone(), t;
    }
  });
  e.SHA256 = n._createHelper(s), e.HmacSHA256 = n._createHmacHelper(s);
}(Math);
exports.default = r;
