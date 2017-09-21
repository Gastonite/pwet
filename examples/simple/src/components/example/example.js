'use strict';

import Component from '../../../../../src/component';
import { decorate } from '../../../../../src/utilities';


const exampleDefinition = {
  properties: {
    isVisible: {
      configurable: true,
      get(component) {

        console.log('get isVisible()');
        return component.properties.isVisible;
      },
      set(component, newValue) {
        console.log('set isVisible()', newValue);
        component.properties = Object.assign(component.properties, {
          isVisible: newValue
        });
      }
    }
  },
  attributes: {
    visible: ({ element, log }, value, oldValue) => {

      log('[visible] changed', oldValue, '=>', value);

      element.isVisible = value === '';
    },
    color: ({ element, log }, value, oldValue) => {

      log('[color] changed', value);
      element.color = value
    }
  },
  hooks: {
    create: decorate(Component, (next, component) => {

      component = next(component);

      const { element, log } = component;

      //console.log('create', Object.getOwnPropertyDescriptor(element, 'isVisible'))

      element.attachShadow({ mode: 'open' })

      log('shadowRoot', element.children.length, element.shadowRoot);

      return component
    }),

    attach: (component) => {


    },
    detach: () => {

    },
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