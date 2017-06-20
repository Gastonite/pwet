import '../../src/polyfills';
import Component from '../../src/component';
import Counter from './counter';

document.addEventListener('DOMContentLoaded', () => {

  Component.define(Counter);

  const noState = document.getElementById('no-state');
  const property = document.getElementById('property');
  const attribute = document.getElementById('attribute');

  const counter1 = document.createElement('x-counter');
  const counter2 = document.createElement('x-counter');
  const counter3 = document.createElement('x-counter');

  counter2.start = 1000;
  counter3.setAttribute('start', '1000');

  noState.appendChild(counter1);
  property.appendChild(counter2);
  attribute.appendChild(counter3);

});
