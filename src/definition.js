import LodashKebabCase from 'lodash.kebabcase';
import { clone } from './utilities';
import Component from './component';
import pipe from 'ramda/src/pipe';

import { assert, isString, isPlainObject, isArray, isEmpty, isHTMLElement, isObject, isUndefined, isFunction } from 'kwak';

const _parseMethods = (input, label = 'input', defaults = input) => {

  assert(isObject(input), `'${label}' must be an object`);

  Object.keys(input).forEach(key => {

    const value = input[key] || defaults[key];

    assert(isFunction(value), `'${key}' must be a function`);

    input[key] = value;
  });

  return input;
};

const _definitions = [];
const $pwet = Symbol('__pwet');

const Definition = (definition = {}) => {

  if (Definition.isDefinition(definition))
    return definition;

  definition = isArray(definition)
    ? Definition.composeDefinition(definition)
    : Definition.parseDefinition(definition);

  definition.type = class extends definition.type {
    constructor() {

      super();

      this[$pwet] = definition.hooks.create({
        element: this,
        definition,
        hooks: clone(definition.hooks)
      });
    }
    connectedCallback() {

      this[$pwet].attach(this.pwet);
    }
    disconnectedCallback() {

      this[$pwet].detach(this.pwet);
    }
  };

  definition = definition.hooks.define(definition);

  Object.freeze(definition);

  _definitions.push(definition);

  return definition;
};

Definition.composeDefinition = definition => {

  assert(isArray(definition), `'definition' must be an array`);

  if (!definition.includes(Component))
    definition.push(Component);

  return Definition.parseDefinition(
    Object.assign(
      pipe(...definition.filter(isFunction)),
      definition.reverse().reduce((before, after) => {

        const hooks = {...before.hooks};

        if (isObject(after.hooks)) {

          Object.assign(hooks, after.hooks);

          if (isFunction(before.hooks.define) && isFunction(after.hooks.define))
            hooks.define = pipe(before.hooks.define, after.hooks.define);
        }

        return Object.assign(before, after, { hooks });
      }, { hooks: {} })
    )
  )
};

Definition.parseDefinition = (definition = {}) => {

  console.log('Definition.parseDefinition()');

  if (isFunction(definition)) {

    if (isUndefined(definition.tagName) && isString(definition.name))
      definition.tagName = LodashKebabCase(definition.name);

    definition = {
      ...definition,
      hooks: {
        ...definition.hooks,
        create: definition
      }
    };
  }

  assert(isObject(definition), `'definition' must be an object`);

  const { properties = {}, hooks = {}, updaters = {}, attributes = {}, verbose } = definition;
  let { tagName, type = HTMLElement, style = '' } = definition;


  // Tag
  assert(isString(tagName) && !isEmpty(tagName), `'tagName' must be a non empty string`);
  tagName = LodashKebabCase(tagName.toLowerCase());
  if (!tagName.includes('-'))
    tagName = `x-${tagName}`;
  assert(!Definition.getDefinition(tagName), `'${tagName}' definition already exists`);


  // Type
  assert(isFunction(type) && (type === HTMLElement || isHTMLElement(type.prototype)),
    `'type' must be a subclass of HTMLElement`);


  // Properties
  assert(isObject(properties), `'properties' must be an object`);
  Object.keys(properties).forEach(key => {
    let property = properties[key];

    if (!isFunction(property)) {

      if (!isPlainObject(property))
        property = { value: property, writable: true };

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
  _parseMethods(hooks, 'hooks');
  console.log('define hooks=', hooks);


  // Updaters
  _parseMethods(updaters, 'updaters');
  Object.keys(updaters).forEach(key => {
    const updater = updaters[key];


  });

  return {
    ...definition,
    tagName,
    type,
    properties,
    attributes,
    style,
    hooks,
    updaters,
    verbose
  };
};

Definition.getDefinition = input => _definitions.find(definition => definition.tagName === input);
Definition.isDefinition = input => _definitions.includes(input);

export {
  Definition as default,
  $pwet
};