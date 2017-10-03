'use strict';

import { isString, isEmpty } from 'kwak';
import style from './example.styl';

const Example = {};

Example.hooks = {};
Example.hooks.render = ({ root, element, definition: { style } }) => {

  const { isVisible, color } = element;

  root.innerHTML = `<style>${style}</style><div>${isVisible ? 'visible' : ''}</div>`;

  if (color)
    element.style.setProperty('--color', color);
  else
    element.style.removeProperty('--color')
};

Example.verbose = true;

Example.style = style;

Example.tagName = 'example';

Example.properties = {
  isVisible: ({ element }, value = true) => ({
    configurable: true,
    get: () => value,
    set: (newValue) => value = !!newValue
  }),
  color: ({ element }, value) => ({
    configurable: true,
    get: () => value || element.getAttribute('color'),
    set: (newValue) => {

      console.log('set color()', newValue);
      if (isString(newValue))
        value = newValue;
    }
  })
};

Example.attributes = {
  visible: ({ element, render }, value, oldValue) => {

    console.error('"visible" attribute changed', value);

    return {
      isVisible: value === ''
    }
  },
  color: ({ element, render }, value, oldValue) => {

    console.error('"color" attribute changed', value);
    return {
      color: value
    }
  }
};

export default Example;