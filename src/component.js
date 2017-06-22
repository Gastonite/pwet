import { noop, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isNull, isArray, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import Property from './property';
import StatefulComponent from './decorators/stateful';


const internal = {
  factories: [],
  allowedHooks: ['attach', 'detach', 'initialize', 'update', 'render']
};

internal.parseProperties = input => {

  const properties = [];

  if (!isObject(input))
    return properties;

  const keys = Object.keys(input);

  if (isEmpty(keys))
    return properties;

  return keys.reduce((properties, key) => {

    let property = input[key];

    if (!isObject(property))
      property = { defaultValue: property };

    property.name = key;

    property = Property(property);

    properties.push(property);

    return properties;
  }, properties);
};

internal.isAllowedHook = key => internal.allowedHooks.includes(key);

internal.defaultsHooks = {
  attach(component, attach) {
    attach(!component.isRendered);
  },
  update(component, newState, update) {
    update(true);
  },
  initialize(component, newProperties, initialize) {
    initialize(true);
  }
};


const Component = (factory, element) => {

  assert(Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element.pwet !== void 0)
    return;

  let _isAttached = false;
  let _isRendered = false;
  let _isInitializing = false;
  let _properties = {};

  const attach = () => {
    // console.log('Component.attach()');

    if (_isAttached)
      return;

    if (factory.shadowRoot)
      element.shadowRoot = element.attachShadow(factory.shadowRoot);

    _hooks.attach((shouldRender = false) => {

      _isAttached = true;

      if (shouldRender)
        component.render();
    });
  };

  const detach = () => {
    // console.log('Component.detach()');

    if (!_isAttached)
      return;

    _isAttached = false;

    _hooks.detach();
  };

  const initialize = newProperties => {
    // console.log('Component.initialize()', 'before', _isInitializing);

    if (_isInitializing)
      return;

    assert(isObject(newProperties) && !isNull(newProperties), `'newProperties' must be an object`);

    _isInitializing = true;

    newProperties = factory.properties.reduce((properties, { name, coerce, defaultValue }) => {

      return Object.assign(properties, {
        [name]:
          !isUndefined(newProperties[name])
            ? coerce(newProperties[name])
            : (!isUndefined(_properties[name])
              ?_properties[name]
              : defaultValue)
      });
    }, {});

    _hooks.initialize(newProperties, (shouldRender = false) => {

      _properties = newProperties;

      if (shouldRender)
        component.render();

      _isInitializing = false;
    });
  };

  const render = () => {
    // console.log('Component.render()', _isAttached);

    if (!_isAttached)
      return;

    _hooks.render();

    _isRendered = true;
  };


  const component = element.pwet = {
    isPwetComponent: true,
    element,
    attach,
    detach,
    initialize,
    render,
    get isRendered() {
      return _isRendered
    },
    get isInitializing() {
      return _isInitializing
    }
  };

  const _hooks = {
    initialize: factory.initialize.bind(null, component),
    render: factory.render.bind(null, component),
    attach: factory.attach.bind(null, component),
    detach: factory.detach.bind(null, component),
  };


  Object.defineProperty(component, 'state', {
    configurable: true,
    get() {
      throw new Error('Component is Stateless');
    },
    set(newState) {
      throw new Error('Component is Stateless');
    }
  });

  Object.defineProperty(component, 'properties', {
    get() {
      return Object.assign({}, _properties);
    },
    set: initialize
  });

  const overridenHooks = factory(Object.freeze(factory.create(component, factory)));

  if (!isObject(overridenHooks) || isNull(overridenHooks))
    return component;

  Object.keys(overridenHooks)
    .forEach(key => {

      const hook = overridenHooks[key];

      assert(factory.allowedHooks.includes(key), `'${key}' hook is not allowed`);

      assert(isFunction(hook), `'${key}' hook must be a function`);

      _hooks[key] = hook;
    });

  assert(_hooks.render !== noop, `'render' method is required`);

  // first initialization
  component.properties = factory.properties.reduce((properties, { name, attribute, defaultValue }) => {

    Object.defineProperty(element, name, {
      get() {
        return component.properties[name];
      },
      set(newValue) {

        component.properties = Object.assign(component.properties, {
          [name]: newValue
        });
      }
    });

    let value = defaultValue;

    if (attribute !== false) {

      const attributeValue = element.dataset[name];

      if (!isUndefined(attributeValue))
        value = attributeValue;
    }

    return Object.assign(properties, { [name]: value });
  }, {});

  return component;
};

Component.get = input => internal.factories.find(EqualFilter(input));

Component.define = (factory, options) => {

  assert(isFunction(factory), `'factory' must be a function`);

  if (!isUndefined(options))
    assert(isObject(options), `'options' must be an object`);

  const { tagName, attributes = {} } = factory;

  assert(isString(tagName) && /[a-z0-9-]+/i, `'tagName' must be a string`);
  assert(!Component.get(factory), `That component factory is already defined`);
  assert(!internal.factories.find(ByFilter('tagName', tagName)), `'${tagName}' component is already defined`);

  factory.properties = internal.parseProperties(factory.properties);

  const _attributes = factory.properties.filter(property => property.isAttribute === true);

  const _attributesNames = _attributes.map(property => property.name);

  if (!isFunction(factory.attach))
    factory.attach = internal.defaultsHooks.attach;
  if (!isFunction(factory.initialize))
    factory.initialize = internal.defaultsHooks.initialize;
  if (!isFunction(factory.detach))
    factory.detach = noop;
  if (!isFunction(factory.render))
    factory.render = noop;
  if (!isFunction(factory.create))
    factory.create = identity;

  factory.allowedHooks = internal.allowedHooks; //.concat(allowedHooks);

  if (isFunction(factory.create.define))
    factory.create.define(factory);




  internal.factories.push(factory);

  customElements.define(tagName, class extends HTMLElement {
    constructor() {

      super();

      Component(factory, this);
    }
    static get observedAttributes() {

      return _attributesNames;
    }
    connectedCallback() {

      this.pwet.attach();
    }
    disconnectedCallback() {

      this.pwet.detach();
    }
    attributeChangedCallback(name, oldValue, newValue) {

      const { properties } = this.pwet;

      _attributes.forEach(property => {

        if (name === property.name)
          properties[name] = property.parse(newValue);

      });

      this.pwet.properties = properties;
    }
  });

};

export {
  StatefulComponent,
  Component as default
}