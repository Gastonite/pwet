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

const _parseAttributes = (attributes = {}) => {

  assert(isObject(attributes), `'attributes' must be an object`);

  attributes = Object.keys(attributes).reduce((before, key) => {

    const property = attributes[key];

    assert(isObject(property), `'${key}' property must be an object`);

    const { isAttribute = false, defaultValue, parse } = property;

    assert(isFunction(parse), `'parse' property must be a function`);

    before.properties[key] = { key, isAttribute, defaultValue, parse };

    if (isAttribute) {
      const attributeName = LodashKebabCase(key);

      before.attributes[attributeName] = before.properties[key];
      before.attributes[attributeName].attributeName = attributeName;
    }

    return before;
  }, {});

  return attributes;
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

  let { attributes = {} } = options;

  assert(isObject(attributes), `'attributes' must be an object`);

  //attributes = _parseAttributes(attributes);

  Object.keys(attributes).forEach(key => {
    const attribute = attributes[key];

    assert(isFunction(attribute), `Invalid 'attributes': ${key}' must be a function`);
  });

  const log = (...args) => {

    if (options.verbose)
      console.info(`[${id}]`, ...args);
  };

  const hooks = _parseHooks(options.hooks);

  const _clonePropertiesDescriptors = () =>
    Object.keys(properties).reduce((before, key) => {

      return Object.assign(before, { [key]: clone(properties[key]) });
    }, {});

  const definition = class extends type {
    constructor() {

      super();

      this.pwet = hooks.create({
        element: this,
        hooks: clone(hooks),
        properties: _clonePropertiesDescriptors(),
        log
      });



      //this.pwet.hooks.create(this);
    }
    static get observedAttributes() {

      const attributesNames = Object.keys(attributes);
      console.log('observedAttributes()', { attributesNames });

      return attributesNames;
    }
    connectedCallback() {

      this.pwet.hooks.attach(this.pwet);
    }
    disconnectedCallback() {

      this.pwet.hooks.detach(this.pwet);
    }
    attributeChangedCallback(attributeName, oldValue, newValue) {

      this.pwet.log('attributeChangedCallback()', { attributeName, oldValue, newValue });

      if (newValue !== oldValue)
        attributes[attributeName](this.pwet, newValue, oldValue);

      //this[key] = parse(newValue);
    }
  };

  //console.error(`${id}Definition`);

  return _definitions[id] = definition;
};

Definition.defaultHooks = {
  create: Component,
  attach: noop,
  detach: noop,
  render: noop,
  initialize: (component, newValue) => !isDeeplyEqual(newValue, component.properties)
};

export default Definition;