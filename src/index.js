'use strict';

import { default as Definition, $pwet } from './definition';
import Component from './component';
import { assert, isString, isObject } from 'kwak';

/**
 * Defines a component from a definition
 * @param definition
 * @param options
 * @returns {*}
 */
const defineComponent = (definition, options = {}) => {

  definition = Definition(definition);

  let { tagName } = definition;

  if (isString(options)) {
    tagName = options;
    options = arguments.length > 2 ? arguments[2] : null;
  }

  assert(isObject(options), `'options' must be an object`);

  customElements.define(definition.tagName, definition.type, options);

  return definition;
};

export {
  defineComponent,
  Component,
  Definition,
  $pwet
};