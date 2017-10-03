'use strict';

import { decorate } from 'pwet/src/utilities';
import { isInteger, isUndefined } from 'kwak';
import style from './counter.css';

const Counter = (component) => {

  const { element, hooks } = component;

  let _addButton;
  let _removeButton;
  let _counterSpan;

  const _add = () => element.start += element.by;
  const _remove = () => element.start -= element.by;

  hooks.attach = () => {

    _addButton.addEventListener('click', _add);
    _removeButton.addEventListener('click', _remove);
  };

  hooks.detach = () => {

    _addButton.removeEventListener('click', _add);
    _removeButton.removeEventListener('click', _remove);
  };

  hooks.render = component => {

    console.warn('Counter.render()', component);

    if (isUndefined(_removeButton)) {
      _removeButton = document.createElement('button');
      _removeButton.textContent = '-';
      component.root.appendChild(_removeButton);
    }

    if (isUndefined(_counterSpan)) {
      _counterSpan = document.createElement('span');
      _counterSpan.style.padding = '0 10px';
      component.root.appendChild(_counterSpan);
    }

    _counterSpan.textContent = element.start;

    if (isUndefined(_addButton)) {
      _addButton = document.createElement('button');
      _addButton.textContent = '+';
      component.root.appendChild(_addButton);
    }
  };

  return component;
};


Counter.properties = {
  start: ({ element }, value = element.getAttribute('data-start') || 0) => ({
    get: () => value,
    set: (newValue) => {

      newValue = parseInt(newValue);

      if (isInteger(newValue))
        value = newValue
    }
  }),
  by: ({ element }, value = element.getAttribute('data-by') || 1) => ({
    get: () => value,
    set: (newValue) => {

      newValue = parseInt(newValue);

      if (isInteger(newValue))
        value = newValue
    }
  })
};

Counter.attributes = {
  'data-start': ({ element }, value, oldValue) => {
    return { start: value }
  },
  'data-by': ({ element }, value, oldValue) => {
    return { by: value }
  }
};

//Counter.verbose = true;
Counter.tagName = 'x-counter';

Counter.style = style;


export default Counter;