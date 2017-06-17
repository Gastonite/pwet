import { identity } from './utilities';
import { assert, isBoolean, isString, isObject, isFunction, isUndefined } from './assertions';
import Attribute from './attribute';

const internal = {};

internal.Property = module.exports = (property) => {

  assert(isObject(property), `'property' must be an object`);

  let {
    name,
    attribute = false,
    isPartOfState = false,
    coerce = identity,
    defaultValue
  } = property;

  assert(isString(name), `'name' must be a string`);
  assert(isFunction(coerce), `'coerce' must be a function`);
  assert(isBoolean(isPartOfState), `'isPartOfState' must be a boolean`);

  if (attribute) {

    assert(Attribute.isAttribute(attribute), `'attribute' is not an Attribute object`);

    if (isUndefined(defaultValue) && !isUndefined(attribute.defaultValue))
      defaultValue = attribute.defaultValue;

    if (attribute.coerce !== coerce)
      coerce = attribute.coerce;

  }

  return Object.freeze(Object.assign(property, {
    name,
    attribute,
    coerce,
    defaultValue,
    isPartOfState
  }));
};