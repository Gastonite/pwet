import { identity } from '../utilities';
import { isFunction, isNull, isArray, isString, isObject, assert } from '../assertions';


const internal = {
  allowedHooks: ['update']
};

internal.defaultsHooks = {
  update(component, newState, update) {
    update(true);
  }
};

const StatefulComponent = (component, factory, hooks) => {

  let _state = factory.initialState();
  let _isUpdating = false;

  const _hooks = {
    update: isFunction(hooks.update) || factory.update.bind(null, component)
  };

  const editState = (partialState) => {

    assert(isObject(partialState) && !isNull(partialState), `'partialState' must be an object`);

    const state = component.state;

    Object.assign(state, partialState);

    update(state);
  };

  const update = newState => {

    if (_isUpdating)
      return;

    assert(isObject(newState) && !isNull(newState), `'newState' must be an object`);

    assert(_state !== newState, `'newState' must not be equal to previous state`);

    if (component.isInitializing)
      return void (_state = newState);

    _isUpdating = true;

    _hooks.update(newState, (shouldRender = false) => {

      _state = newState;

      if (shouldRender)
        component.render();

      _isUpdating = false;
    });
  };

  Object.assign(component, {
    editState,
    get isUpdating() {
      return _isUpdating
    }
  });



  Object.defineProperty(component, 'state', {
    configurable: true,
    get() {
      return Object.assign({}, _state);
    },
    set(newState) {

      if (!_isUpdating)
        component.update(newState);
    }
  });

  return {
    update
  };
};

StatefulComponent.define = factory => {

  let { initialState, allowedHooks } = factory;

  assert(isArray(allowedHooks) && allowedHooks.every(isString), `'allowedHooks' must be an array of string`);


  factory.allowedHooks = allowedHooks.concat(internal.allowedHooks);

  factory.initialState = isObject(initialState) && !isNull(initialState)
    ? identity.bind(null, initialState)
    : assert(isFunction(initialState), `'initialState' must be an object or a function`);

  if (!isFunction(factory.update))
    factory.update = internal.defaultsHooks.update;

};

export default StatefulComponent;