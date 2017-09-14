import { identity } from './utilities';
import { assert, isBoolean, isString, isObject, isFunction, isUndefined, isPlainObject } from 'kwak';

const Property = (property) => {

  assert(isObject(property), `'property' must be an object`);

  let {
    name,
    coerce = identity,
    defaultValue
  } = property;

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

Property.array = (options = {}) => Object.assign({
  coerce: value => Array.isArray(value) ? value : (!value ? null : [value]),
  defaultValue: []
}, options);

Property.object = (options = {}) => Object.assign({
  defaultValue: {},
  coerce: value => isUndefined(value) || !isObject(value) ? void 0 : value
}, options);


Property.plain = (options = {}) => Property.object(
  Object.assign({
    coerce: value => isUndefined(value) || !isPlainObject(value) ? void 0 : value
  }, options)
);

Property.boolean = (options = {}) => Object.assign({
  coerce: Boolean,
  defaultValue: false
}, options);

export default Property;