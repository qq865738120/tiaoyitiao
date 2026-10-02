'use strict';

var typescript = require('./typescript-C8A1Xhnh.js');
var css = require('./css-BwKah-YO.js');
var javascript = require('./javascript-dAaenLyO.js');
var glsl = require('./glsl-CIMlymHL.js');
var html = require('./html-RiHlBwBZ.js');
var sql = require('./sql-IGLNi1QH.js');
var xml = require('./xml-BnkW-Lsj.js');
require('./c-C4lOR8Bb.js');
require('./java-ip2yRgA8.js');

const lang$5 = Object.freeze(JSON.parse('{"fileTypes":["js","jsx","ts","tsx","html","vue","svelte","php","res"],"injectTo":["source.ts","source.js"],"injectionSelector":"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string, L:source.vue -comment -string, L:source.svelte -comment -string, L:source.php -comment -string, L:source.rescript -comment -string","injections":{"L:source":{"patterns":[{"match":"<","name":"invalid.illegal.bad-angle-bracket.html"}]}},"name":"es-tag-css","patterns":[{"begin":"(?i)(\\\\s?/\\\\*\\\\s?((?:|inline-)css)\\\\s?\\\\*/\\\\s?)(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.css"},{"include":"inline.es6-htmlx#template"}]},{"begin":"(?i)(\\\\s*((?:|inline-)css))(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.css"},{"include":"inline.es6-htmlx#template"},{"include":"string.quoted.other.template.js"}]},{"begin":"(?i)(?<=[(,:=\\\\s]|\\\\$\\\\()\\\\s*(((/\\\\*)|(//))\\\\s?((?:|inline-)css) {0,1000}\\\\*?/?) {0,1000}$","beginCaptures":{"1":{"name":"comment.line"}},"end":"(`).*","patterns":[{"begin":"\\\\G()","end":"(`)"},{"include":"source.ts#template-substitution-element"},{"include":"source.css"}]},{"begin":"(\\\\$\\\\{)","beginCaptures":{"1":{"name":"entity.name.tag"}},"end":"(})","endCaptures":{"1":{"name":"entity.name.tag"}},"patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.js"}]}],"scopeName":"inline.es6-css","embeddedLangs":["typescript","css","javascript"]}'));
var es_tag_css = [
  ...typescript.default,
  ...css.default,
  ...javascript.default,
  lang$5
];

const lang$4 = Object.freeze(JSON.parse('{"fileTypes":["js","jsx","ts","tsx","html","vue","svelte","php","res"],"injectTo":["source.ts","source.js"],"injectionSelector":"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string","injections":{"L:source":{"patterns":[{"match":"<","name":"invalid.illegal.bad-angle-bracket.html"}]}},"name":"es-tag-glsl","patterns":[{"begin":"(?i)(\\\\s?/\\\\*\\\\s?((?:|inline-)glsl)\\\\s?\\\\*/\\\\s?)(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.glsl"},{"include":"inline.es6-htmlx#template"}]},{"begin":"(?i)(\\\\s*((?:|inline-)glsl))(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.glsl"},{"include":"inline.es6-htmlx#template"},{"include":"string.quoted.other.template.js"}]},{"begin":"(?i)(?<=[(,:=\\\\s]|\\\\$\\\\()\\\\s*(((/\\\\*)|(//))\\\\s?((?:|inline-)glsl) {0,1000}\\\\*?/?) {0,1000}$","beginCaptures":{"1":{"name":"comment.line"}},"end":"(`).*","patterns":[{"begin":"\\\\G()","end":"(`)"},{"include":"source.ts#template-substitution-element"},{"include":"source.glsl"}]},{"begin":"(\\\\$\\\\{)","beginCaptures":{"1":{"name":"entity.name.tag"}},"end":"(})","endCaptures":{"1":{"name":"entity.name.tag"}},"patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.js"}]}],"scopeName":"inline.es6-glsl","embeddedLangs":["typescript","glsl","javascript"]}'));
var es_tag_glsl = [
  ...typescript.default,
  ...glsl.default,
  ...javascript.default,
  lang$4
];

const lang$3 = Object.freeze(JSON.parse('{"fileTypes":["js","jsx","ts","tsx","html","vue","svelte","php","res"],"injectTo":["source.ts","source.js"],"injectionSelector":"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string","injections":{"L:source":{"patterns":[{"match":"<","name":"invalid.illegal.bad-angle-bracket.html"}]}},"name":"es-tag-html","patterns":[{"begin":"(?i)(\\\\s?/\\\\*\\\\s?(html|template|inline-html|inline-template)\\\\s?\\\\*/\\\\s?)(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"text.html.basic"},{"include":"inline.es6-htmlx#template"}]},{"begin":"(?i)(\\\\s*(html|template|inline-html|inline-template))(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"text.html.basic"},{"include":"inline.es6-htmlx#template"},{"include":"string.quoted.other.template.js"}]},{"begin":"(?i)(?<=[(,:=\\\\s]|\\\\$\\\\()\\\\s*(((/\\\\*)|(//))\\\\s?(html|template|inline-html|inline-template) {0,1000}\\\\*?/?) {0,1000}$","beginCaptures":{"1":{"name":"comment.line"}},"end":"(`).*","patterns":[{"begin":"\\\\G()","end":"(`)"},{"include":"source.ts#template-substitution-element"},{"include":"text.html.basic"}]},{"begin":"(\\\\$\\\\{)","beginCaptures":{"1":{"name":"entity.name.tag"}},"end":"(})","endCaptures":{"1":{"name":"entity.name.tag"}},"patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.js"}]},{"begin":"(\\\\$\\\\(`)","beginCaptures":{"1":{"name":"entity.name.tag"}},"end":"(`\\\\))","endCaptures":{"1":{"name":"entity.name.tag"}},"patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.js"}]}],"scopeName":"inline.es6-html","embeddedLangs":["typescript","html","javascript"]}'));
var es_tag_html = [
  ...typescript.default,
  ...html.default,
  ...javascript.default,
  lang$3
];

const lang$2 = Object.freeze(JSON.parse('{"fileTypes":["js","jsx","ts","tsx","html","vue","svelte","php","res"],"injectTo":["source.ts","source.js"],"injectionSelector":"L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string","injections":{"L:source":{"patterns":[{"match":"<","name":"invalid.illegal.bad-angle-bracket.html"}]}},"name":"es-tag-sql","patterns":[{"begin":"(?i)\\\\b(\\\\w+\\\\.sql)\\\\s*(`)","beginCaptures":{"1":{"name":"variable.parameter"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.ts#string-character-escape"},{"include":"source.sql"},{"include":"source.plpgsql.postgres"},{"match":"."}]},{"begin":"(?i)(\\\\s?/?\\\\*?\\\\s?((?:|inline-)sql)\\\\s?\\\\*?/?\\\\s?)(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"source.ts#template-substitution-element"},{"include":"source.ts#string-character-escape"},{"include":"source.sql"},{"include":"source.plpgsql.postgres"},{"match":"."}]},{"begin":"(?i)(?<=[(,:=\\\\s]|\\\\$\\\\()\\\\s*(((/\\\\*)|(//))\\\\s?((?:|inline-)sql) {0,1000}\\\\*?/?) {0,1000}$","beginCaptures":{"1":{"name":"comment.line"}},"end":"(`)","patterns":[{"begin":"\\\\G()","end":"(`)"},{"include":"source.ts#template-substitution-element"},{"include":"source.ts#string-character-escape"},{"include":"source.sql"},{"include":"source.plpgsql.postgres"},{"match":"."}]}],"scopeName":"inline.es6-sql","embeddedLangs":["typescript","sql"]}'));
var es_tag_sql = [
  ...typescript.default,
  ...sql.default,
  lang$2
];

const lang$1 = Object.freeze(JSON.parse('{"fileTypes":["js","jsx","ts","tsx","html","vue","svelte","php","res"],"injectTo":["source.ts","source.js"],"injectionSelector":"L:source.js -comment -string, L:source.js -comment -string, L:source.jsx -comment -string,  L:source.js.jsx -comment -string, L:source.ts -comment -string, L:source.tsx -comment -string, L:source.rescript -comment -string","injections":{"L:source":{"patterns":[{"match":"<","name":"invalid.illegal.bad-angle-bracket.html"}]}},"name":"es-tag-xml","patterns":[{"begin":"(?i)(\\\\s?/\\\\*\\\\s?(xml|svg|inline-svg|inline-xml)\\\\s?\\\\*/\\\\s?)(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"text.xml"}]},{"begin":"(?i)(\\\\s*((?:|inline-)xml))(`)","beginCaptures":{"1":{"name":"comment.block"}},"end":"(`)","patterns":[{"include":"text.xml"}]},{"begin":"(?i)(?<=[(,:=\\\\s]|\\\\$\\\\()\\\\s*(((/\\\\*)|(//))\\\\s?(xml|svg|inline-svg|inline-xml) {0,1000}\\\\*?/?) {0,1000}$","beginCaptures":{"1":{"name":"comment.line"}},"end":"(`).*","patterns":[{"begin":"\\\\G()","end":"(`)"},{"include":"text.xml"}]}],"scopeName":"inline.es6-xml","embeddedLangs":["xml"]}'));
var es_tag_xml = [
  ...xml.default,
  lang$1
];

const lang = Object.freeze(JSON.parse('{"displayName":"TypeScript with Tags","name":"ts-tags","patterns":[{"include":"source.ts"}],"scopeName":"source.ts.tags","embeddedLangs":["typescript","es-tag-css","es-tag-glsl","es-tag-html","es-tag-sql","es-tag-xml"],"aliases":["lit"]}'));
var tsTags = [
  ...typescript.default,
  ...es_tag_css,
  ...es_tag_glsl,
  ...es_tag_html,
  ...es_tag_sql,
  ...es_tag_xml,
  lang
];

exports.default = tsTags;
