import { assert, isFunction, isPlainObject, isObject, isUndefined } from 'kwak';
import { patch, skip, currentElement } from 'idom-util';
import { default as Definition, $pwet } from 'pwet/src/definition';
import { decorate } from 'pwet/src/utilities';

const _reduxMethods = ['getState', 'dispatch', 'subscribe'];

const ReduxDefinition = (definition = {}) => {

  const { updateState, actions = {}, store } = definition;

  assert(isObject(store) && _reduxMethods.every(key => isFunction(store[key])),
    `'store' must be a Redux store`);

  const _subscribers = new Map();

  assert(isPlainObject(actions), `'actions' must be a plain object`);
  assert(isFunction(updateState), `'update' must be a function`);

  const actionsKeys = Object.keys(actions);

  actionsKeys.forEach(key => {
    assert(isFunction(actions[key]), `'${key}' must be a function`)
  });


  const ReduxComponent = component => {

    const { hooks } = component;

    hooks.attach = decorate(hooks.attach, (next, component) => {

      next(component);

      const { element, update } = component;

      const unsubscribe = store.subscribe(() => {

        const state = store.getState();

        update(updateState(state), { partial: true });

        element.dispatchEvent(new CustomEvent('state-changed', {
          detail: state
        }));
      });

      _subscribers.set(element, unsubscribe);
    });

    hooks.detach = decorate(hooks.detach, (next, component) => {

      next(component);

      const unsubscribe = _subscribers.get(component.element);

      unsubscribe();
    });

    return component;
  };

  definition = Object.assign(ReduxComponent, definition);

  return definition;
};

export default ReduxDefinition;