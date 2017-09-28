'use strict';

import '@webcomponents/webcomponentsjs/webcomponents-sd-ce';

import './components/example';


const createElement = document.createElement.bind(document);
const appendChild = document.body.appendChild.bind(document.body);

const createButton = (text) => {
  const button = document.createElement('button');
  button.innerText = text;
  return button;
};

document.addEventListener('DOMContentLoaded', () => {

  const examples = document.getElementById('examples');
  const example = document.querySelector('x-example');

  const colorButton = examples.insertBefore(createButton('color'), examples.firstChild);
  const visibleButton = examples.insertBefore(createButton('visible'), examples.firstChild);

  const refreshColorButtonText = () => colorButton.innerText = `color:${example.color}`;
  const refreshVisibleButtonText = () => visibleButton.innerText = `visible:${example.isVisible.toString()}`;

  refreshVisibleButtonText();
  refreshColorButtonText();

  colorButton.onclick = () => {
    example.color = 'blue';
    refreshColorButtonText();
  };

  visibleButton.onclick = () => {
    const isVisible = example.isVisible = !example.isVisible;
    refreshVisibleButtonText();
  };


  const anotherExample = createElement('x-example');
  anotherExample.setAttribute('visible', '');
  anotherExample.setAttribute('color', '#bada55');

  //<x-example id="d" visible color="#bada55"></x-example>
  appendChild(anotherExample);

  document.getElementById('toggle').addEventListener('click', () => {
    example.isVisible = !example.isVisible;
  });
  document.getElementById('attach').addEventListener('click', () => {
    examples.insertBefore(example, examples.firstChild);
  });
  document.getElementById('detach').addEventListener('click', () => {
    examples.removeChild(example);
  });
});

