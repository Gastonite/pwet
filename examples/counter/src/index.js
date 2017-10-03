'use strict';
import '@webcomponents/shadydom/src/shadydom';
import '@webcomponents/custom-elements/src/custom-elements';
import './components/counter';

document.addEventListener('DOMContentLoaded', () => {

  console.log('Creating...');
  const counter5 = document.createElement('x-counter');
  counter5.id = 'counter5';
  const counter6 = document.createElement('x-counter');
  counter6.id = 'counter6';
  const counter7 = document.createElement('x-counter');
  counter7.id = 'counter7';
  const counter8 = document.createElement('x-counter');
  counter8.id = 'counter8';

  console.log('Attaching...');

  // Attach
  document.getElementById('no-state').appendChild(counter5);
  document.getElementById('property').appendChild(counter6);
  document.getElementById('attribute').appendChild(counter7);
  document.getElementById('setter').appendChild(counter8);

  console.log('Updating...');

  counter6.start = 1000;
  counter7.setAttribute('data-start', '1000');
  counter7.setAttribute('data-by', '2');
  counter8.properties = { by: 4, start: 42 };
});
