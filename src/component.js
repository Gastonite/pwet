'use strict';

import LodashCloneDeep from 'lodash.clonedeep';
import { assert, isFunction, isUndefined, isObject, isNull, isEmpty, isEqualTo, isPlainObject } from 'kwak';
import { decorate, clone } from './utilities';

const Component = (component = {}) => {

  const { element, hooks, root } = component;
  let { tagName, properties = {}, attributes = {}, verbose } = component.definition;
  let _isAttached = false;
  let _isRendered = false;
  let _isUpdating = false;
  let _properties;

  if (verbose)
    console.log(`<${tagName}>`, 'detach', { _isAttached, _isRendered });

  if (!root)
    component.root = element;

  const _attributesNames = Object.keys(attributes);

  Object.defineProperties(component, {
    isRendered: { get: () => _isRendered  },
    isUpdating: { get: () => _isUpdating },
    isAttached: { get: () => _isAttached  }
  });

  const _getProperties = () => {

    assert(!isUndefined(_properties), `Cannot get properties during creation`);
    assert(!component.isUpdating, `Cannot get properties during update`);

    return clone(_properties)
  };


  Object.defineProperties(element, {
    properties: {
      get: _getProperties,
      set: (newValue) => component.update(newValue)
      //set: component.update
    }
  });

  component.attach = () => {

    if (_isAttached)
      return;

    const _attachComponent = () => {

      _isAttached = true;

      if (verbose)
        console.log(`<${tagName}>`, 'attach()', _properties, { _isAttached, _isRendered });

      if (!_isRendered)
        component.render();

      hooks.attach(component);

      if (!isNull(_attributeObserver))
        _attributeObserver.observe(element, { attributes: true, attributeOldValue: true });
    };

    if (!component.isUpdating)
      return _attachComponent();

    setTimeout(_attachComponent, 0);
  };

  component.detach = () => {

    if (!_isAttached)
      return;

    if (!isNull(_attributeObserver))
      _attributeObserver.disconnect();

    _isRendered = _isAttached = false;

    if (verbose)
      console.log(`<${tagName}>`, 'detach', { _isAttached, _isRendered });

    hooks.detach(component);
  };

  component.render = () => {

    if (verbose)
      console.log(`<${tagName}>`, 'render()', { _isAttached, _isRendered, properties: JSON.stringify(_properties), state: JSON.stringify(component.state) });

    if (!_isAttached)
      return;

    component.hooks.render(component);

    _isRendered = true;
  };

  component.update = (properties, options = {}) => {

    assert(isObject(properties), `'properties' must be an object`);
    assert(isObject(options), `'options' must be an object`);

    const { partial = false } = options;

    if (verbose)
      console.log(`<${tagName}>`, 'update()', { properties, partial });

    assert(!component.isUpdating,  `Cannot update during update`);

    const oldProperties = element.properties;

    _isUpdating = true;

    let newProperties = !partial
      ? clone(properties)
      : Object.assign({}, _properties, properties);

    newProperties = Object.keys(newProperties)
      .filter(key => _propertiesKeys.includes(key))
      .reduce((before, key) => Object.assign(before, { [key]: newProperties[key]}), {});

    const mustRender = hooks.update(component, newProperties, oldProperties);

    Object.assign(_properties, newProperties);

    _isUpdating = false;

    if (mustRender)
      return component.render();

    if (verbose)
      console.warn(`<${tagName}>`, 'update has not rendered component');
  };

  component.isPwet = true;

  Object.freeze(component.hooks);
  Object.freeze(component);

  properties = Object.keys(properties).reduce((before, key) => {

    let property = properties[key](component);

    if (isUndefined(property.configurable))
      property.configurable = true;

    Object.defineProperty(element, key, {
      get: () => _properties[key],
      set: (newValue) => component.update({ [key]: newValue }, { partial: true })
    });

    property.enumerable = true;

    before[key] = property;

    return before;
  }, {});

  let _propertiesKeys = Object.keys(properties);
  _properties = Object.defineProperties({}, properties);


  // Initialize properties
  component.update(_properties, _properties);


  // Use of MutationObserver instead of observedAttributes because MutationObserver callback is debounced.
  const _attributeObserver = isEmpty(attributes) ? null : new MutationObserver(mutations => {

    if (component.isUpdating)
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
      console.log(`<${tagName}>`, 'attributesChanged', mutations.map(({ name, value }) => `${name}=${value}`));

    Promise.all(mutations.map(({ name, value, oldValue }) =>

      value === oldValue
        ? value
        : attributes[name](component, value, oldValue)

    )).then(attributesValues => {

      let mustUpdate = false;

      const properties = attributesValues.reduce((before, result) => {

        if (isPlainObject(result)) {
          mustUpdate = true;
          Object.assign(before, result);
        }

        return before;
      }, {});

      if (verbose)
        console.log(`<${tagName}>`, 'attributesChanged => properties', properties);

      if (mustUpdate)
        component.update(properties, { partial: true });
    });
  });

  return component;
};


export default Component;