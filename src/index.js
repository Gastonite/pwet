'use strict';

import Definition from './definition';
import Component from './component';
import { assert, isString, isObject } from 'kwak';


const defineComponent = (definition, options = {}) => {

  definition = Definition(definition);

  let { tagName } = definition;

  if (isString(options)) {
    tagName = options;
    options = arguments.length > 2 ? arguments[2] : null;
  }

  assert(isObject(options), `'options' must be an object`);

  definition = definition.hooks.define(definition);


  customElements.define(definition.tagName, definition.type, options);

  return definition;
};

export {
  defineComponent,
  Component,
  Definition
};