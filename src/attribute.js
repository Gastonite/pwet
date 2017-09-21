'use strict';

import { assert, isObject, isFunction } from 'kwak';


const Attribute = (attribute = {}) => {

  assert(isObject(attribute), `'attribute' must be an object`);

  const { defaultValue, parse = identity, stringify = identity } = attribute;


  assert(isFunction(parse), `'parse' must be a function`);
  assert(isFunction(stringify), `'stringify' must be a function`);

  console.error('Attribute()', { defaultValue });

  return Object.assign(attribute, {
    isAttribute: true,
    defaultValue,
    parse,
    stringify
  });
};

Attribute.boolean = (attribute = {}) => {

  assert(isObject(attribute), `'attribute' must be an object`);

  const { defaultValue = false } = attribute;

  return Attribute(Object.assign(attribute, {
    defaultValue,
    parse: input => input === '',
    stringify: input => input ? '' : null
  }));
};

export default Attribute;
