'use strict';

var view_panels_default_index = require('../view/panels/default/index.js');
require('fs');
require('path');
require('./types-BnMUUABw.js');

var R = ({ code: s, language: e, raw: t, className: h, startLine: d, lineNumbers: m, ...p }) => {
  let { shikiTheme: l } = view_panels_default_index.reactExports.useContext(view_panels_default_index.R), o = view_panels_default_index.Li(), [a, i] = view_panels_default_index.reactExports.useState(t);
  return view_panels_default_index.reactExports.useEffect(() => {
    if (!o) {
      i(t);
      return;
    }
    let r = o.highlight({ code: s, language: e, themes: l }, (c2) => {
      i(c2);
    });
    r && i(r);
  }, [s, e, l, o, t]), view_panels_default_index.jsxRuntimeExports.jsx(view_panels_default_index.At, { className: h, language: e, lineNumbers: m, result: a, startLine: d, ...p });
};

exports.HighlightedCodeBlockBody = R;
