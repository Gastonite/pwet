// Force the polyfill in Safari 10.0.0 and 10.0.1.
var _window = window,
  navigator = _window.navigator;
var userAgent = navigator.userAgent;

var safari = userAgent.indexOf('Safari/60') !== -1;
var safariVersion = safari && userAgent.match(/Version\/([^\s]+)/)[1];
var safariVersions = [0, 1].map(function (v) {
  return '10.0.' + v;
}).concat(['10.0']);

if (safari && safariVersions.indexOf(safariVersion) > -1) {
  window.ShadyDOM = { force: true };
}

require('@webcomponents/shadydom');
require('@webcomponents/shadycss/scoping-shim.min');
require('@webcomponents/shadycss/apply-shim.min');
require('@webcomponents/shadycss/custom-style-interface.min');

const { applyStyle } = require('@webcomponents/shadycss/src/style-util');

module.exports = {
  applyStyle
};