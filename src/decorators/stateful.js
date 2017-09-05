import { isFunction, isNull, isArray, isString, isObject, isDeeplyEqual, assert } from '../assertions';
import { identity, decorate } from '../utilities';
// import { $pwet } from "pwet";

const internal = {
  allowedHooks: ['update'],
  defaultsHooks: {}
};

internal.defaultsHooks.update = (component, newState, update) => {
  update(true);
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


  // factory.allowedHooks = allowedHooks.push('update');

  factory.initialState = isObject(initialState) && !isNull(initialState)
    ? identity.bind(null, initialState)
    : assert(isFunction(initialState), `'initialState' must be an object or a function`);

  if (!isFunction(factory.update))
    factory.update = internal.defaultsHooks.update;


  factory.create = decorate(factory.create, (next, component, dependencies) => {

    const { actions } = dependencies;

    assert(isObject(actions), `'actions' dependency must be an object`);

    Object.keys(actions).forEach((key, i) => {
      const action = actions[key];

      assert(isFunction(action), `Invalid 'actions' dependency: action n°${i} must be a function`);

      actions[key] = action.bind(null, component);
    });
    const hooks = next(component, dependencies);


    let _state = factory.initialState();
    let _isUpdating = false;

    // const editState = (partialState) => {
    //
    //   assert(isObject(partialState) && !isNull(partialState), `'partialState' must be an object`);
    //
    //   const state = component.state;
    //
    //   Object.assign(state, partialState);
    //
    //   _update(state);
    // };

    const _update = newState => {


      if (factory.logLevel > 0)
        console.log(`[${factory.tagName}]`, 'update()', { newState, _isUpdating });

      if (_isUpdating)
        return;

      assert(isObject(newState) && !isNull(newState),
        `'newState' must be an object`);

      if (isDeeplyEqual(_state, newState))
        return;

      // assert(!isDeeplyEqual(_state, newState), `'newState' must not be equal to previous state`);

      _isUpdating = true;

      // console.log('BEFORE hook.update');

      newState = hooks.update(newState);


      if (newState) {

        assert(isObject(newState) && !isNull(newState),
          `'update' must return an object or nothing`);

        _state = newState;

        component.render();

      } else {


      }


      // console.log('AFTER hook.update');

      _isUpdating = false;

      // , (shouldRender = true) => {
      //   console.log('AFTER hook.update');
      //
      //   _state = newState;
      //
      //   if (shouldRender)
      //     component.render();
      //
      //   _isUpdating = false;
      //
      //   // console.log('Component.update()', 'AFTER', shouldRender);
      //
      // });
    };

    Object.assign(component, {
      // editState,
      // update,
      get isUpdating() {
        return _isUpdating
      }
    });

    // component.element.initialize.after = (newProperties, shouldUpdate = false) => {
    //
    //   console.error('Component.initialize.after() OVERRIDE', { shouldUpdate });
    //
    //   if (shouldUpdate) {
    //
    //     if(!isObject(shouldUpdate) || isNull(shouldUpdate))
    //       return void component.render();
    //
    //     component.editState(shouldUpdate);
    //   }
    // };

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
