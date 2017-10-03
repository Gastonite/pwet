'use strict';

import '@webcomponents/shadydom/src/shadydom';
import '@webcomponents/custom-elements/src/custom-elements';
import  './components/example';

const createButton = (text) => {
  const button = document.createElement('button');
  button.innerText = text;
  return button;
};

document.addEventListener('DOMContentLoaded', () => {

  const examples = document.getElementById('examples');
  const example = document.querySelector('x-example');

  const toggleButton = document.body.insertBefore(createButton('toggle'), examples);
  const attachButton = document.body.insertBefore(createButton('attach'), examples);
  const detachButton = document.body.insertBefore(createButton('detach'), examples);
  const colorButton = document.body.insertBefore(createButton('color'), examples);
  const visibleButton = document.body.insertBefore(createButton('visible'), examples);

  const refreshColorButtonText = () => colorButton.innerText = `color:${example.color}`;
  const refreshVisibleButtonText = () => visibleButton.innerText = `visible:${example.isVisible.toString()}`;

  refreshVisibleButtonText();
  refreshColorButtonText();

  colorButton.onclick = () => {
    example.color = example.color === 'blue' ? '' : 'blue';
    refreshColorButtonText();
  };

  visibleButton.onclick = () => {
    const isVisible = example.isVisible = !example.isVisible;
    refreshVisibleButtonText();
  };

  toggleButton.onclick = () => {
    example.isVisible = !example.isVisible;
    refreshVisibleButtonText();

  };

  attachButton.onclick = () => {
    examples.insertBefore(example, examples.firstChild);
  };

  detachButton.onclick = () => {
    example.remove();
  };


  const anotherExample = document.createElement('x-example');
  anotherExample.setAttribute('visible', 'df');
  anotherExample.setAttribute('color', '#bada55');
  document.body.appendChild(anotherExample);
});

