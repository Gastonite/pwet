'use strict';

import LodashCloneDeep from 'lodash.clonedeep';
import { assert, isFunction, isUndefined, isObject, isNull, isEmpty, isEqualTo, isPlainObject } from 'kwak';
import { decorate, clone } from './utilities';

const Component = (component = {}) => {

  const { element, hooks, attributes = {} } = component;
  let { properties = {} } = component;
  let _isAttached = false;
  let _isRendered = false;
  let _isInitializing = false;

  const _attributesNames = Object.freeze(Object.keys(attributes));


  Object.defineProperties(component, {
    properties: { get: () => {

      assert(!_isInitializing, `Cannot get properties during initialization`);

      return clone(_properties)
    } },
    isRendered: { get: () => _isRendered  },
    isInitializing: { get: () => _isInitializing  },
    isAttached: { get: () => _isAttached  }
  });

  component.detach = () => {

    if (!isNull(_observer))
      _observer.disconnect();

    _isRendered = _isAttached = false;

    component.log('detach', { _isAttached, _isRendered });

    hooks.detach(component);
  };

  component.attach = () => {


    hooks.attach(component, (shouldRender = true) => {

      component.log('after attach', _properties, { _isAttached, _isRendered, shouldRender });

      _isAttached = true;

      if (!_isRendered && shouldRender)
        component.render();

      if (!isNull(_observer))
        _observer.observe(element, { attributes: true, attributeOldValue: true });

    });
  };

  component.render = () => {

    component.log('render()', { _isAttached, _isRendered }, _properties);

    if (!_isAttached)
      return;


    hooks.render(component);

    _isRendered = true;
  };

  component.initialize = (properties, options = {}) => {

    component.log('initialize()');

    assert(isObject(properties), `'properties' must be an object`);
    assert(isObject(options), `'options' must be an object`);

    assert(!_isInitializing, `Cannot call initialize during initialization`);

    const oldProperties = component.properties;

    _isInitializing = true;

    const { partial = false } = options;

    let newProperties = !partial
      ? clone(properties)
      : Object.assign({}, _properties, properties);

    newProperties = Object.keys(newProperties)
      .filter(key => _propertiesKeys.includes(key))
      .reduce((before, key) => Object.assign(before, { [key]: newProperties[key]}), {});

    const shouldRender = hooks.initialize(component, newProperties, oldProperties);

    Object.assign(_properties, newProperties);

    _isInitializing = false;

    if (shouldRender)
      component.render();

  };

  component.isPwet = true;

  Object.freeze(component);

  properties = Object.keys(properties).reduce((before, key) => {

    const property = properties[key](component);

    let { get, set, configurable } = property;

    if (isUndefined(configurable))
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
  let _properties = Object.defineProperties({}, properties);

  //component.initialize(_properties, _properties);

  /**
   * Observe attributes with MutationObserver instead of using attributeChangedCallback and its observedAttributes.
   * It fires only one time when multiple attributes are changed
   * @type {MutationObserver}
   * @private
   */
  const _observer = isEmpty(attributes) ? null : new MutationObserver(mutations => {

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

    component.log('attributesChanged', mutations.map(({ name, value }) => `${name}=${value}`));

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

      component.log('attributesChanged => properties', properties)
      if (mustInitialize)
        component.initialize(properties);
    });
  });

  return component;
};


export default Component;