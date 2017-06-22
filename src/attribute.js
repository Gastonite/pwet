import { identity } from './utilities';
import { assert, isUndefined, isObject, isFunction } from './assertions';

const internal = {};

internal.empty = val => val == null;
internal.nullOrType = type => val => !val ? null : type(val);
internal.zeroOrNumber = val => !val ? 0 : Number(val);


internal.Attribute = module.exports = (attribute) => {

  assert(isObject(attribute), `'attribute' must be an object`);

  let {
    stringify = JSON.stringify,
    parse = JSON.parse,
    coerce = identity,
    defaultValue,
  } = attribute;

  assert(isFunction(stringify), `'stringify' must be a function`);
  assert(isFunction(parse), `'parse' must be a function`);

  return Object.assign(attribute, {
    isAttribute: true,
    stringify,
    parse,
    coerce,
    defaultValue
  });
};

internal.Attribute.array = (options = {}) => internal.Attribute(
  Object.assign({
    coerce: val => Array.isArray(val) ? val : (!val ? null : [val]),
    defaultValue: [],
  }, options)
);

internal.Attribute.boolean = (options = {}) => internal.Attribute(
  Object.assign({
    coerce: Boolean,
    defaultValue: false,
    parse: val => !!val,
    stringify: val => val ? '' : null
  }, options)
);

internal.Attribute.number = (options = {}) => internal.Attribute(
  Object.assign({
    defaultValue: 0,
    coerce: internal.zeroOrNumber,
    parse: internal.zeroOrNumber,
    stringify: internal.nullOrType(Number)
  }, options)
);

internal.Attribute.integer = (options = {}) => internal.Attribute.number(
  Object.assign(options, {
    coerce: parseInt,
    parse: parseInt
  })
);

internal.Attribute.float = (options = {}) => internal.Attribute.number(
  Object.assign(options, {
    coerce: parseFloat,
    parse: parseFloat
  })
);

internal.Attribute.object = (options = {}) => internal.Attribute(
  Object.assign({
    defaultValue: {}
  }, options)
);

internal.Attribute.string = (options = {}) => internal.Attribute(
  Object.assign({
    defaultValue: '',
    coerce: String,
    stringify: internal.nullOrType(String)
  }, options)
);
