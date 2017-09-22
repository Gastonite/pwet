import LodashKebabCase from 'lodash.kebabcase';
import { noop, identity, decorate, clone } from './utilities';
import Component from './component';

import { assert, isString, isEmpty, isElement, isObject, isUndefined, isFunction, isDeeplyEqual } from 'kwak';

const _definitions = {};

const _parseHooks = (hooks = {}) => {

  assert(isObject(hooks), `'hooks' must be an object`);

  const { create, initialize, attach, detach, render } = Object.assign({}, Definition.defaultHooks, hooks);

  assert(isFunction(create), `'create' must be a function`);
  assert(isFunction(initialize), `'initialize' must be a function`);
  assert(isFunction(attach), `'attach' must be a function`);
  assert(isFunction(detach), `'detach' must be a function`);
  assert(isFunction(render), `'render' must be a function`);

  return { create, initialize, attach, detach, render };
};

const Definition = (options = {}) => {

  assert(isObject(options), `'options' must be an object`);

  const { id, type = HTMLElement, properties = {} } = options;

  assert(isString(id), `'id' must be a string`);
  assert(!isEmpty(id), `'id' must not be empty`);
  assert(isUndefined(_definitions[id]), `'${id}' definition already exists`);
  assert(isFunction(type) && (type === HTMLElement || isElement(type.prototype)),
    `'type' must be a subclass of HTMLElement`);
  assert(isObject(properties), `'properties' must be an object`);


  Object.keys(properties).forEach(key => {
    let property = properties[key];

    if (!isFunction(property)) {

      if (!isPlainObject(property))
        property = { value: property };

      properties[key] = () => property;
    }
  });

  let { attributes = {} } = options;

  assert(isObject(attributes), `'attributes' must be an object`);

  Object.keys(attributes).forEach(key => {
    const attribute = attributes[key];

    assert(isFunction(attribute), `Invalid 'attributes': ${key}' must be a function`);
  });

  const log = (...args) => {

    if (options.verbose)
      console.info(`[${id}]`, ...args);
  };

  const hooks = _parseHooks(options.hooks);


  const definition = class extends type {
    constructor() {

      super();

      this.pwet = hooks.create({
        element: this,
        hooks: clone(hooks),
        attributes,
        properties,
        log
      });
    }
    connectedCallback() {

      this.pwet.attach(this.pwet);
    }
    disconnectedCallback() {

      this.pwet.detach(this.pwet);
    }
  };

  return _definitions[id] = definition;
};

Definition.defaultHooks = {
  create: Component,
  attach: noop,
  detach: noop,
  render: noop,
  initialize: (component, properties, oldProperties) => {
    component.log('default initialize');
    return !isDeeplyEqual(properties, oldProperties)
  }
};

export default Definition;