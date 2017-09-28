import LodashKebabCase from 'lodash.kebabcase';
import { noop, identity, decorate, clone } from './utilities';
import Component from './component';

import { assert, isString, isPlainObject, isArray, isEmpty, isElement, isObject, isUndefined, isFunction, isDeeplyEqual } from 'kwak';

const _definitions = [];

const _parseHooks = (hooks = {}, defaultHooks = {}) => {

  assert(isObject(hooks), `'hooks' must be an object`);
  assert(isObject(defaultHooks), `'defaultHooks' must be an object`);

  return Object.keys(defaultHooks).reduce((before, key) => {

    const hook = hooks[key] || defaultHooks[key];

    assert(isFunction(hook), `'${key}' must be a function`);

    before[key] = hook;

    return before;
  }, {});
};

const Definition = (options = {}) => {

  options = Definition.parseDefinition(options);

  if (Definition.isDefinition(options))
    return options;

  const { properties = {}, attributes = {}, dependencies = {}, verbose } = options;
  let { tagName, type = HTMLElement, style = '' } = options;

  assert(isString(tagName) && !isEmpty(tagName), `'tagName' must be a non empty string`);

  // Tag
  tagName = LodashKebabCase(tagName.toLowerCase());
  if (!tagName.includes('-'))
    tagName = `x-${tagName}`;
  assert(!Definition.getDefinition(tagName), `'${tagName}' definition already exists`);

  // Type
  assert(isFunction(type) && (type === HTMLElement || isElement(type.prototype)),
    `'type' must be a subclass of HTMLElement`);

  // Properties
  assert(isObject(properties), `'properties' must be an object`);
  Object.keys(properties).forEach(key => {
    let property = properties[key];

    if (!isFunction(property)) {

      if (!isPlainObject(property))
        property = { value: property };

      properties[key] = () => property;
    }
  });

  // Attributes
  assert(isObject(attributes), `'attributes' must be an object`);
  Object.keys(attributes).forEach(key => {
    const attribute = attributes[key];

    assert(isFunction(attribute), `Invalid 'attributes': ${key}' must be a function`);
  });

  // Style
  assert(isUndefined(style) || isString(style), `'style' must be a string`);

  // Hooks
  const hooks = _parseHooks(options.hooks, Definition.defaultHooks);

  type = class extends type {
    constructor() {

      super();

      this.pwet = hooks.create({
        element: this,
        definition,
        style: definition.style,
        hooks: clone(hooks),
        attributes
      });
    }
    connectedCallback() {

      this.pwet.attach(this.pwet);
    }
    disconnectedCallback() {

      this.pwet.detach(this.pwet);
    }
  };

  const definition = {
    tagName,
    style,
    type,
    hooks,
    attributes,
    properties,
    verbose
  };

  Object.freeze(definition);

  _definitions.push(definition);

  return definition;
};

Definition.parseDefinition = (definition = {}) => {

  if (isFunction(definition)) {
    definition = {
      ...definition,
      hooks: {
        ...definition.hooks,
        create: definition
      }
    };
  }
  assert(isObject(definition), `'definition' must be an object`);

  return definition;
};

Definition.getDefinition = input => _definitions.find(definition => definition.tagName === input);
Definition.isDefinition = input => _definitions.includes(input);
Definition.defaultHooks = {
  create: Component,
  define: identity,
  attach: (component, attach) => attach(),
  detach: noop,
  render: noop,
  initialize: (component, properties, oldProperties, initialize) => {

    const arePropertiesEqual = isDeeplyEqual(properties, oldProperties);

    if (!arePropertiesEqual)
      console.warn('initialize aborted because properties are unchanged');

    initialize(!component.isRendered || !arePropertiesEqual);
  }
};

export default Definition;