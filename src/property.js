import { identity } from './utilities';
import { assert, isBoolean, isString, isObject, isFunction, isUndefined } from './assertions';

const internal = {};

internal.Property = module.exports = (property) => {

  assert(isObject(property), `'property' must be an object`);

  let {
    name,
    coerce = identity,
    defaultValue
  } = property;

  // console.log(property)
  assert(isString(name), `'name' must be a string`);
  assert(isFunction(coerce), `'coerce' must be a function`);

  // if (attribute) {
  //
  //   assert(Attribute.isAttribute(attribute), `'attribute' is not an Attribute object`);
  //
  //   if (isUndefined(defaultValue) && !isUndefined(attribute.defaultValue))
  //     defaultValue = attribute.defaultValue;
  //
  //   if (attribute.coerce !== coerce)
  //     coerce = attribute.coerce;
  //
  // }

  return Object.freeze(Object.assign(property, {
    name,
    coerce,
    defaultValue
  }));
};