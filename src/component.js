import { noop, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isNull, isArray, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import Property from './property';
import StatefulComponent from './decorators/stateful';


const internal = {
  factories: [],
  allowedHooks: ['attach', 'detach', 'initialize', 'render']
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

internal.StatelessError = () => {
  throw new Error('Component is Stateless');
};

internal.isAllowedHook = (factory, key) => factory.allowedHooks.includes(key);

internal.defaultsHooks = {
  attach(component, attach) {
    attach(!component.isRendered);
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

    component.hooks.attach((shouldRender = false) => {

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

    component.hooks.detach();
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

    component.hooks.initialize(newProperties, (shouldRender = false) => {

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

    component.hooks.render();

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
    },
    get hooks() {
      return _hooks
    },
    get state() {
      return _hooks
    },
    set properties(newValue) {
      return _hooks
    }
  };

  const _hooks = factory.allowedHooks.reduce((hooks, key) => {
    return Object.assign(hooks, { [key]: factory[key].bind(null, component) });
  }, {});

  assert(_hooks.render !== noop, `'render' method is required`);


  Object.defineProperty(component, 'state', {
    configurable: true,
    get: internal.StatelessError,
    set: internal.StatelessError
  });

  Object.defineProperty(component, 'properties', {
    get: () => Object.assign({}, _properties),
    set: initialize
  });

  factory.create(component, factory);

  const hooks = factory(component);

  // factory.create(factory(component), factory);

  if (!isObject(hooks) || isNull(hooks))
    return component;

  Object.keys(hooks)
    .filter(internal.isAllowedHook.bind(null, factory))
    .forEach(key => {

      const hook = hooks[key];

      assert(isFunction(hook), `'${key}' hook must be a function`);

      _hooks[key] = hook;
    });

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