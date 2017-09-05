import { identity } from './utilities';
import { assert, isBoolean, isString, isObject, isFunction, isUndefined } from './assertions';
import isPlainObject from 'lodash.isplainobject';
const internal = {};

internal.Property = module.exports = (property) => {

  assert(isObject(property), `'property' must be an object`);

  let {
    name,
    coerce = identity,
    defaultValue
  } = property;

  // console.log(property)
  assert(isString(name), `Invalid property: 'name' must be a string`);
  assert(isFunction(coerce), `Invalid '${name}' property: 'coerce' must be a function`);

  // if (attribute) {
  //
  //   assert(Attribute.isAttribute(attribute), `'attribute' is not an Attribute object`);
  //
  //   if (isUndefined(defaultValue) && !isUndefined(attribute.defaultValue))
  //     defaultValue = attribute.defaultValue;
  //
  //   if (attribute.coerce !== coerce)
  //     coerce = attribute.coerce;
  // }

  if (!isUndefined(defaultValue) && coerce !== identity) {

    if (isUndefined(coerce(defaultValue))) {
      defaultValue = null;
      console.warn(`Invalid '${name}' property: 'coerce' called with 'defaultValue' has returned undefined`);
    }
  }

  return Object.freeze(Object.assign(property, {
    name,
    coerce,
    defaultValue
  }));
};

internal.Property.array = (options = {}) => Object.assign({
  coerce: value => Array.isArray(value) ? value : (!value ? null : [value]),
  defaultValue: [],
}, options);

internal.Property.object = (options = {}) => Object.assign({
  defaultValue: {},
  coerce: value => isUndefined(value) || !isObject(value) ? void 0 : value
}, options);


internal.Property.plain = (options = {}) => internal.Property.object(
  Object.assign({
    coerce: value => isUndefined(value) || !isPlainObject(value) ? void 0 : value
  }, options)
);

internal.Property.boolean = (options = {}) => Object.assign({
  coerce: Boolean,
  defaultValue: false
}, options);

