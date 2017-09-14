import { isObject, isArray, isNull } from 'kwak';

export const clone = input =>
  !isArray(input)
    ? (isObject(input) && !isNull(input)
      ? Object.assign({}, input)
      : input)
    : input.map(clone);

export const noop = () => {};
export const identity = arg => arg;
export const toggle = input => !input;
export const not = toggle;
export const isAttached = element => {

  if (element === document)
    return true;

  element = element.parentNode;
  if (element)
    return isAttached(element);

  return false;
};
export const decorate = (func, decorator, ...args) => decorator.bind(null, func, ...args);
