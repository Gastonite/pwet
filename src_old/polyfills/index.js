// NOTE!!!
//
// We have to load polyfills directly from source as non-minified files are not
// published by the polyfills. An issue was raised to discuss this problem and
// to see if it can be resolved.
//
// See https://github.com/webcomponents/custom-elements/issues/45

// ES2015 polyfills required for the polyfills to work in older browsers.
require('array.from').shim();
require('object.assign').shim();
require('es6-promise').polyfill();

// We have to include this first so that it can patch native. This must be done
// before any polyfills are loaded.
require('./native-shim');
//
// // // Template polyfill is necessary to use shadycss in IE11
// // // this comes before custom elements because of
// // // https://github.com/webcomponents/template/blob/master/template.js#L39
require('@webcomponents/template');
//
// // This comes after the native shim because it requries it to be patched first.
require('@webcomponents/custom-elements/src/custom-elements');
