'use strict';

import Component from '../../../../../src/component';
import { decorate } from '../../../../../src/utilities';


const exampleDefinition = {
  properties: {
    isVisible: ({ element }) => ({
      configurable: true,
      get() {
        console.log('get isVisible()');
        return element.hasAttribute('visible');
      },
      set(newValue) {
        console.log('set isVisible()', newValue);

        if (!newValue)
          element.removeAttribute('visible');
        else
          element.setAttribute('visible', newValue);
      }
    }),
    color: ({ element }) => ({
      configurable: true,
      get() {
        console.log('get color()');
        return element.getAttribute('color');
      },
      set(newValue) {
        console.log('set color()', newValue);

        if (!newValue)
          element.removeAttribute('color');
        else
          element.setAttribute('color', newValue);
      }
    })
  },
  attributes: {
    visible: ({ element, render }, value, oldValue) => {

      console.error('[visible] changed', oldValue, '=>', value);

      //element.isVisible = value === '';
      render()

    },
    color: ({ element, render }, value, oldValue) => {

      console.error('[color] changed', value);
      //element.color = value
      render()
    }
  },
  hooks: {
    create: decorate(Component, (next, component) => {

      component = next(component);

      const { element } = component;

      //console.log('create', Object.getOwnPropertyDescriptor(element, 'isVisible'))

      element.attachShadow({ mode: 'open' });

      console.log('shadowRoot', element.children.length, element.shadowRoot);

      return component
    }),
    render: ({ element, properties }) => {

      let variables = ':host {';

      if (element.color)
        variables += `--color: ${element.color};`;

      variables += '}';

      let content = `
        <style>${variables}\n${exampleDefinition.style}</style>
        <div>${properties.isVisible ? 'visible' : ''}</div>
      `;

      element.shadowRoot.innerHTML = content;

    }
  }
};

export default exampleDefinition;