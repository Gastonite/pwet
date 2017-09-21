'use strict';

import LodashCloneDeep from 'lodash.clonedeep';
import { isFunction } from 'kwak';
import { decorate } from './utilities';

const Component = (component = {}) => {

  let { element, hooks, log, properties = {} } = component;


  let _isAttached = false;
  let _isRendered = false;
  console.log('Component()', JSON.stringify(properties, null, 2));

  let _properties = Object.keys(properties).reduce((before, key) => {

    const description = properties[key];

    if (isFunction(description.get))
      description.get = description.get.bind(null, component);
    if (isFunction(description.set))
      description.set = description.set.bind(null, component);

    before[key] = description.value;

    return before;
  }, {});

  Object.defineProperties(element, properties);

  console.log('Component()', _properties);

  hooks.attach = decorate(hooks.attach, (next, component) => {

    _isAttached = true;

    if (!_isRendered)
      component.hooks.render(component);

    component.log('attach', { _isAttached, _isRendered }, _properties);

    next(component);

    _isRendered = true;
  });

  hooks.detach = decorate(hooks.detach, (next, component) => {

    _isRendered = _isAttached = false;

    component.log('detach', { _isAttached, _isRendered });

    next(component);
  });

  hooks.initialize = decorate(hooks.initialize, (next, component, properties) => {

    component.log('initialize', { id: element.id, _isAttached, _isRendered, old: properties, new: properties });

    if (!next(component, properties))
      return;

    _properties = properties;

    hooks.render(component);
  });

  hooks.render = decorate(hooks.render, (next, component) => {

    if (!_isAttached)
      return;

    component.log('render', { _isAttached, _isRendered }, _properties);

    next(component);

    _isRendered = true;
  });

  Object.defineProperty(component, 'properties', {
    get() {
      return LodashCloneDeep(_properties)
    },
    set: hooks.initialize.bind(null, component)
  });

  return component;
};


export default Component;