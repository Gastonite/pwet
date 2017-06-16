'use strict';

export const assert = (condition, message) => {

  if (condition)
    return condition;

  throw new Error(message);
};

export const isEqualTo = (value, input) => input === value;
export const isTrue = input => isEqualTo(true, input);
export const isUndefined = input => isEqualTo(void 0, input);
export const isNull = input => isEqualTo(null, input);
export const isInstanceOf = (type, input) => input instanceof type;
export const isArray =  input => isInstanceOf(Array, input);
export const ofType =  (type, input) => isEqualTo(type, typeof input);
export const isObject = input => ofType('object', input);
export const isEmpty = input => !input || input.length < 1;
export const isBoolean = input => ofType('boolean', input);
export const isString = input => {

  return ofType('string', input);
};
export const isFunction = input => ofType('function', input);
export const isNumber = input => ofType('number', input);
export const isInteger = input => Number.isInteger(input);
export const isComponent = input => isObject(input) && input.isPwetComponent === true;
export const isElement = input => isInstanceOf(HTMLElement, input);
export const isUnknownElement = input => Object.prototype.toString.call(input) === '[object HTMLUnknownElement]';