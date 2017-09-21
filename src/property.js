'use strict';

import { assert, isObject, isFunction } from 'kwak';

const Property = (property = {}) => {

  assert(isObject(property), `'property' must be an object`);

  //let { get, set, value } = property;

  return Object.assign({
    configurable: true
  }, property);
};


Property.boolean = (property = {}) => {

  assert(isObject(property), `'property' must be an object`);

  let { get, set, value } = property;

  return Object.assign({
    get: () => value,
    set: (newValue) => {
      value = !!newValue
    },
    value
  }, property);
};


export default Property;