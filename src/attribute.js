import { identity } from './utilities';
import { assert, isUndefined, isObject, isFunction } from './assertions';

const internal = {};

internal.empty = val => val == null;
internal.nullOrType = type => val => internal.empty(val) ? null : type(val);
internal.zeroOrNumber = val => internal.empty(val) ? 0 : Number(val);
internal.attribute = Object.freeze({ source: true });



internal.Attribute = module.exports = (attribute) => {

  assert(isObject(attribute), `'attribute' must be an object`);

  let {
    stringify = identity,
    parse = identity,
    coerce = identity,
    defaultValue,
  } = attribute;

  assert(isFunction(stringify), `'stringify' must be a function`);
  assert(isFunction(parse), `'parse' must be a function`);
  assert(isFunction(coerce), `'coerce' must be a function`);

  return Object.freeze({
    isPwetAttribute: true,
    stringify,
    parse,
    coerce,
    defaultValue
  });
};

internal.Attribute.isAttribute = input => isObject(input) && input.isPwetAttribute === true;

internal.Attribute.array = internal.Attribute({
  coerce: val => Array.isArray(val) ? val : internal.empty(val) ? null : [val],
  defaultValue: Object.freeze([]),
  parse: JSON.parse,
  stringify: JSON.stringify
});

internal.Attribute.boolean = internal.Attribute({
  coerce: Boolean,
  defaultValue: false,
  parse: val => !internal.empty(val),
  stringify: val => val ? '' : null
});

internal.Attribute.number = internal.Attribute({
  defaultValue: 0,
  coerce: internal.zeroOrNumber,
  parse: internal.zeroOrNumber,
  stringify: internal.nullOrType(Number)
});

internal.Attribute.object = internal.Attribute({
  defaultValue: Object.freeze({}),
  parse: JSON.parse,
  stringify: JSON.stringify
});

internal.Attribute.string = internal.Attribute({
  defaultValue: '',
  coerce: String,
  stringify: internal.nullOrType(String)
});