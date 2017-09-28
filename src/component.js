'use strict';

import LodashCloneDeep from 'lodash.clonedeep';
import { assert, isFunction, isUndefined, isObject, isNull, isEmpty, isEqualTo, isPlainObject } from 'kwak';
import { decorate, clone } from './utilities';

const Component = (component = {}) => {

  const { element, definition, hooks, attributes = {} } = component;
  let { properties = {} } = definition;
  let { verbose } = definition;
  let _isAttached = false;
  let _isRendered = false;
  let _isInitializing = false;
  let _whenInitialized;
  let _properties;

  const _attributesNames = Object.freeze(Object.keys(attributes));

  const _getProperties = () => {

    assert(!isUndefined(_properties), `Cannot get properties during creation`);
    assert(!_isInitializing, `Cannot get properties during initialization`);

    return clone(_properties)
  };


  Object.defineProperties(component, {
    properties: { get: _getProperties },
    isRendered: { get: () => _isRendered  },
    isInitializing: { get: () => _isInitializing  },
    isAttached: { get: () => _isAttached  }
  });

  component.detach = () => {

    if (!isNull(_attributeObserver))
      _attributeObserver.disconnect();

    _isRendered = _isAttached = false;

    if (verbose)
      console.log('detach', { _isAttached, _isRendered });

    hooks.detach(component);
  };

  component.attach = () => {

    const _attach = () => {

      hooks.attach(component, (shouldRender = true) => {

        if (verbose)
          console.log('attach', _properties, { _isAttached, _isRendered, shouldRender });

        _isAttached = true;

        if (!_isRendered && shouldRender)
          component.render();

        if (!isNull(_attributeObserver))
          _attributeObserver.observe(element, { attributes: true, attributeOldValue: true });

      });
    };


    if (!_isInitializing)
      return _attach();

    _whenInitialized.then(_attach);

  };

  component.render = () => {

    if (verbose)
      console.log('render()', { _isAttached, _isRendered, properties: JSON.stringify(_properties), state: JSON.stringify(component.state) });

    if (!_isAttached)
      return;

    hooks.render(component);

    _isRendered = true;
  };

  component.initialize = (properties, options = {}) => {

    assert(isObject(properties), `'properties' must be an object`);
    assert(isObject(options), `'options' must be an object`);

    const { partial = false } = options;

    if (verbose)
      console.log('initialize()', { _isInitializing, properties, partial });

    assert(!_isInitializing, `Cannot call initialize during initialization`);

    if (_isInitializing)
      return void Object.assign(_properties, properties);

    const oldProperties = component.properties;

    _whenInitialized = new Promise((resolve, reject) => {

      _isInitializing = true;
      //console.log('IS INITIALIZING !!!');

      const { partial = false } = options;

      let newProperties = !partial
        ? clone(properties)
        : Object.assign({}, _properties, properties);

      newProperties = Object.keys(newProperties)
        .filter(key => _propertiesKeys.includes(key))
        .reduce((before, key) => Object.assign(before, { [key]: newProperties[key]}), {});

      hooks.initialize(component, newProperties, oldProperties, (shouldRender = true) => {

        Object.assign(_properties, newProperties);

        _isInitializing = false;
        //console.log('IS NO MORE INITIALIZING');

        resolve();

        if (shouldRender)
          component.render();
        else {

          if (verbose)
            console.warn('initialize has not rendered component');

        }

      });
    });
  };

  component.isPwet = true;

  Object.freeze(component);

  properties = Object.keys(properties).reduce((before, key) => {

    let property = properties[key](component);

    if (!isPlainObject(property))
      property = { value: property };

    if (isUndefined(property.configurable))
      property.configurable = true;

    Object.defineProperty(element, key, {
      get: () => _properties[key],
      set: (newValue) => component.initialize({ [key]: newValue }, { partial: true })
    });

    property.enumerable = true;

    before[key] = property;

    return before;
  }, {});

  let _propertiesKeys = Object.keys(properties);
  _properties = Object.defineProperties({}, properties);

  //component.initialize(_properties, _properties);

  // Use of MutationObserver instead of observedAttributes because
  // the call to initialize is debounced when multiple changes occurs at the same time.
  const _attributeObserver = isEmpty(attributes) ? null : new MutationObserver(mutations => {

    if (_isInitializing)
      return;

    mutations = mutations
      .filter(({ attributeName }) => _attributesNames.includes(attributeName))
      .map(({ attributeName:name, oldValue }) => ({
        name,
        oldValue,
        value: element.getAttribute(name)
      }))
      .filter(({ value, oldValue }) => !isEqualTo(value, oldValue));

    if (isEmpty(mutations))
      return;

    if (verbose)
      console.log('attributesChanged', mutations.map(({ name, value }) => `${name}=${value}`));

    //attributes[attributeName](this.pwet, newValue, oldValue);

    Promise.all(mutations.map(({ name, value, oldValue }) => {
      return attributes[name](component, value, oldValue);
    })).then(all => {

      let mustInitialize = false;

      const properties = all.reduce((before, result) => {

        if (isPlainObject(result)) {
          mustInitialize = true;
          Object.assign(before, result);
        }

        return before;
      }, {});

      if (verbose)
        console.log('attributesChanged => properties', properties);

      if (mustInitialize)
        component.initialize(properties, { partial: true });
    });

  });

  return component;
};


export default Component;