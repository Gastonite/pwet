'use strict';

import { renderLi, renderStyle, text as renderText } from 'idom-util';
import { noop } from 'pwet/src/utilities';
import { isString, isFunction } from 'kwak';

import style from './todo.styl';

const Todo = {
  tagName: 'x-todo',
  style,
  hooks: {
    render({ element, definition: { style } }) {

      const { text, whenClicked } = element;

      renderStyle(style);

      renderLi(null, null, 'onclick', whenClicked, () => {

        renderText(text);
      });
    }
  },
  properties: {
    whenClicked: (component, value = noop) => ({
      get: () => value,
      set: (newValue) => {
        if (isFunction(newValue))
          value = newValue;
      }
    }),
    completed: ({ element }, value = false) => ({
      get: () => value,
      set: (newValue) => {
        value = !!newValue;

        if (value)
          element.setAttribute('completed', '');
        else
          element.removeAttribute('completed');
      }
    }),
    text: (component, value = '') => ({
      get: () => value,
      set: (newValue) => {
        if (isString(newValue))
          value = newValue;
      }
    })
  }
};

export default Todo;