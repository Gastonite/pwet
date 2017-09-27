'use strict';

import { assert, isPlainObject, isFunction } from "kwak";
import { decorate, clone } from '../utilities';

const StatefulDefinition = (next, definition = {}) => {

  definition = next(definition);

  assert(isPlainObject(definition), `'definition' must be a plain object`);

  const { hooks, initialState = {}, observeState, updaters = {} } = definition;

  assert(isPlainObject(updaters), `'updaters' must be a plain object`);

  const updatersKeys = Object.keys(updaters);

  updatersKeys.forEach(key => {
    assert(isFunction(updaters[key]), `'${key}' must be a function`)
  });

  assert(isPlainObject(hooks), `'hooks' must be a plain object`);
  assert(isFunction(hooks.create), `'create' hook must be a function`);
  assert(isPlainObject(initialState), `'initialState' hook must be a function`);

  hooks.create = decorate(hooks.create, (next, component) => {

    let _state = {
      ...initialState
    };

    const _updateState = (newState) => {

      _state = newState;

      component.render();
    };

    Object.defineProperty(component, 'state', {
      get: () => clone(_state),
      set: _updateState
    });

    component.updaters = updatersKeys.reduce((before, key) => {
      return Object.assign(before, { [key]: updaters[key].bind(null, component) });
    }, {});

    if (isFunction(observeState))
      observeState(component, _updateState);

    return next(component);
  });

  return definition;
};

export default StatefulDefinition;