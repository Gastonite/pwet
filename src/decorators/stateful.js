import { isFunction, isNull, isArray, isString, isObject, isDeeplyEqual, assert } from '../assertions';
import { identity, decorate } from '../utilities';

const internal = {
  allowedHooks: ['update'],
  defaultsHooks: {}
};

internal.defaultsHooks.update = (component, newState) => {
  return newState;
};

internal.StatefulComponent =  (factory, { actions = {} }) => {

  if (factory.logLevel > 0)
    console.log(`StatefulComponent(${factory.tagName})`, actions);

  assert(!factory.isStateful, `'${factory.tagName}' component is already stateful`);
  assert(isObject(actions), `'actions' must be an object`);

  Object.keys(actions).forEach((key, i) => {
    const action = actions[key];

    assert(isFunction(action), `'action' (${i}) must be a function`);

  });

  let { initialState = {}, allowedHooks } = factory;

  assert(isArray(allowedHooks) && allowedHooks.every(isString), `'allowedHooks' must be an array of string`);

  // factory.allowedHooks.push('update');
  factory.initialState = isObject(initialState) && !isNull(initialState)
    ? () => Object.assign({}, initialState)
    : assert(isFunction(initialState), `'initialState' must be an object or a function`);

  if (!isFunction(factory.update))
    factory.update = internal.defaultsHooks.update;

  factory.create = decorate(factory.create, (next, component, dependencies) => {

    const { actions = {} } = dependencies;

    assert(isObject(actions), `'actions' dependency must be an object`);

    Object.keys(actions).forEach((key, i) => {
      const action = actions[key];

      assert(isFunction(action), `Invalid 'actions' dependency: action n°${i} must be a function`);

      actions[key] = action.bind(null, component);
    });

    const hooks = next(component, dependencies);

    if (!isFunction(hooks.update))
      hooks.update = factory.update.bind(null, component);

    let _state = factory.initialState();
    let _isUpdating = false;

    const _update = newState => {

      if (factory.logLevel > 0)
        console.log(`[${factory.tagName}]`, 'update()', { newState, _isUpdating });

      if (_isUpdating)
        return;

      _isUpdating = true;

      assert(isObject(newState) && !isNull(newState),
        `'newState' must be an object`);

      if (isDeeplyEqual(_state, newState))
        return;

      newState = hooks.update(newState);

      if (newState) {

        assert(isObject(newState) && !isNull(newState),
          `'update' must return an object or nothing`);

        _state = newState;

        component.render();

      } else {


      }

      _isUpdating = false;

    };

    Object.assign(component, {
      get isUpdating() {
        return _isUpdating
      }
    });

    Object.defineProperty(component, 'state', {
      configurable: false,
      get() {
        return Object.assign({}, _state);
      },
      set: _update
    });

    return hooks;
  });

  Object.defineProperty(factory, 'isStateful', {
    configurable: false,
    writable: false,
    value: true,
  });

  return factory;
};

export default internal.StatefulComponent;
