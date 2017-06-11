import { identity } from './utilities';
import { assert, isString, isObject, isFunction, isUndefined } from './assertions';
import Attribute from './attribute';

const internal = {};

internal.Property = module.exports = (property) => {

  console.error('Property()', property);

  assert(isObject(property), `'property' must be an object`);

  let {
    name,
    attribute = false,
    coerce = identity,
    defaultValue
  } = property;

  assert(isString(name), `'name' must be a string`);
  assert(isFunction(coerce), `'coerce' must be a function`);

  if (attribute) {

    assert(Attribute.isAttribute(attribute), `'attribute' is not an Attribute object`);

    if (!isUndefined(attribute.defaultValue))
      defaultValue = attribute.defaultValue;

  }

  return Object.freeze(Object.assign(property, {
    name,
    attribute,
    coerce,
    defaultValue
  }));
};