const empty = val => val == null;
const attribute = Object.freeze({ source: true });
const createProp = obj => Object.freeze(Object.assign({ attribute }, obj));
const nullOrType = type => val => empty(val) ? null : type(val);
const zeroOrNumber = val => empty(val) ? 0 : Number(val);

export const array = createProp({
  coerce: val => Array.isArray(val) ? val : empty(val) ? null : [val],
  default: Object.freeze([]),
  deserialize: JSON.parse,
  serialize: JSON.stringify
});

export const boolean = createProp({
  coerce: Boolean,
  default: false,
  deserialize: val => !empty(val),
  serialize: val => val ? '' : null
});

export const number = createProp({
  default: 0,
  coerce: zeroOrNumber,
  deserialize: zeroOrNumber,
  serialize: nullOrType(Number)
});

export const object = createProp({
  default: Object.freeze({}),
  deserialize: JSON.parse,
  serialize: JSON.stringify
});

export const string = createProp({
  default: '',
  coerce: String,
  serialize: nullOrType(String)
});