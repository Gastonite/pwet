'use strict';

import '../../../src/polyfills';
import '../../../src/polyfills/shadow-dom';

import Definition from '../../../src/definition';

import exampleDefinition from './components/example';

customElements.define('x-example', exampleDefinition);

const examples = document.getElementById('examples');
const example = document.querySelector('x-example');

document.getElementById('toggle').addEventListener('click', () => {
  example.isVisible = !example.isVisible;
});
document.getElementById('attach').addEventListener('click', () => {
  examples.insertBefore(example, examples.firstChild);
});
document.getElementById('detach').addEventListener('click', () => {
  examples.removeChild(example);
});

