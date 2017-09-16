import Property from './property';
import { identity } from './utilities';
import { assert, isUndefined, isObject, isFunction } from 'kwak';

const _nullOrType = type => val => !val ? null : type(val);
const _zeroOrNumber = val => !val ? 0 : Number(val);

const Attribute = module.exports = (attribute) => {

  assert(isObject(attribute), `'attribute' must be an object`);

  let {
    stringify = JSON.stringify,
    parse = JSON.parse,
    coerce,
    isDataAttribute = true,
    defaultValue,
    } = attribute;

  assert(isFunction(stringify), `'stringify' must be a function`);
  assert(isFunction(parse), `'parse' must be a function`);

  return Object.assign(attribute, {
    isAttribute: true,
    isDataAttribute,
    stringify,
    parse,
    coerce,
    defaultValue
  });
};

Attribute.array = (options = {}) => Attribute(Property.array(options));
Attribute.plain = (options = {}) => Attribute(Property.plain(options));
Attribute.boolean = (options = {}) => Attribute(
  Object.assign(Property.boolean(options), {
    parse: val => {
      console.log('parse', val)
      return val === '';
    },
    stringify: val => val ? '' : null
  })
);

Attribute.number = (options = {}) => Attribute(
  Object.assign({
    defaultValue: 0,
    coerce: _zeroOrNumber,
    parse: _zeroOrNumber,
    stringify: _nullOrType(Number)
  }, options)
);

Attribute.integer = (options = {}) => Attribute.number(
  Object.assign(options, {
    coerce: parseInt,
    parse: parseInt
  })
);

Attribute.float = (options = {}) => Attribute.number(
  Object.assign(options, {
    coerce: parseFloat,
    parse: parseFloat
  })
);

Attribute.object = (options = {}) => Attribute(Property.object(options));

Attribute.string = (options = {}) => Attribute(
  Object.assign({
    defaultValue: '',
    coerce: String,
    parse: _nullOrType(String),
    stringify: _nullOrType(String)
  }, options)
);

export default Attribute;