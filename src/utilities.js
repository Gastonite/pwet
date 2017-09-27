import { isObject, isArray, isNull, isEmpty, isFunction, assert } from 'kwak';

export const clone = input =>
  !isArray(input)
    ? (isObject(input) && !isNull(input)
    ? Object.assign({}, input)
    : input)
    : input.map(clone);

export const noop = () => {};
export const identity = arg => arg;
export const toggle = input => !input;
export const not = fn => (...args) => !fn(...args);
export const isAttached = (element, container = document) => {

  return container.contains(element);
};

export const decorate = (before, ...decorators) => {

  assert(isFunction(before), `'before' must be a function`);

  assert(!isEmpty(decorators) && decorators.every(isFunction), `decorate only accepts functions as parameters`);

  return decorators.reduce((before, fn) => fn.bind(null, before), before);
};
