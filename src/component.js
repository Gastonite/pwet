import { noop, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isNull, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import Property from './property';
import Attribute from './attribute';


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

    if (Attribute.isAttribute(property))
      property = {
        attribute: property
      };

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

internal.Component = (factory, element) => {

  assert(internal.Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element.pwet !== void 0)
    return;

  let _isAttached = false;
  let _isRendered = false;
  let _isUpdating = false;
  let _isInitializing = false;
  let _state = factory.initialState();
  let _properties = {};
  const _callbacks = [];

  const attributeChanged = (name, oldValue, newValue) => {

    const { properties } = component;

    _attributes.forEach(property => {

      if (name === property.name)
        properties[name] = property.attribute.parse(newValue);

    });

    component.properties = properties
  };


  const editState = (partialState/*, callback*/) => {
    // console.log('Component.editState()');

    assert(isObject(partialState) && !isNull(partialState), `'partialState' must be an object`);

    // if (!isUndefined(callback))
    //   _callbacks.push(callback);

    const state = component.state;

    Object.assign(state, partialState);

    update(state);
  };

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

      let value = newProperties[name];

      value = isUndefined(value) ? defaultValue : coerce(value);

      return Object.assign(properties, { [name]: value });
    }, newProperties);

    _hooks.initialize(newProperties, (shouldRender = false) => {

      _properties = newProperties;

      if (shouldRender)
        component.render();

      _isInitializing = false;
    });
  };

  const update = newState => {
    // console.log('Component.update()', newState);

    if (_isUpdating)
      return;

    assert(isObject(newState) && !isNull(newState), `'newState' must be an object`);

    assert(_state !== newState, `'newState' must not be equal to previous state`);

    if (_isInitializing)
      return void (_state = newState);

    _isUpdating = true;

    _hooks.update(newState, (shouldRender = false) => {

      _state = newState;

      // const shift = _callbacks.shift.bind(_callbacks);
      // const stateCopy = Object.assign({}, newState);
      //
      // while (_callbacks.length > 0)
      //   shift()(stateCopy);

      if (shouldRender)
        component.render();

      _isUpdating = false;
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
    editState,
    attach,
    detach,
    initialize,
    update,
    render,
    attributeChanged,
    get isRendered() {
      return _isRendered
    }
  };

  const _hooks = {
    initialize: factory.initialize.bind(null, component),
    update: factory.update.bind(null, component),
    render: factory.render.bind(null, component),
    attach: factory.attach.bind(null, component),
    detach: factory.detach.bind(null, component),
  };

  const _attributes = factory.properties.filter(property => property.attribute !== false);

  Object.defineProperty(component, 'state', {
    get() {
      return Object.assign({}, _state);
    },
    set(newState) {

      if (!_isUpdating)
        component.update(newState);
    }
  });

  Object.defineProperty(component, 'properties', {
    get() {
      return Object.assign({}, _properties);
    },
    set: initialize
  });

  const overridenHooks = factory(Object.freeze(component));

  if (!isObject(overridenHooks) || isNull(overridenHooks))
    return component;

  Object.keys(overridenHooks).filter(internal.isAllowedHook).forEach(key => {

    const method = overridenHooks[key];

    assert(isFunction(method), `'${key}' must be a function`);

    _hooks[key] = method;
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

internal.Component.get = input => internal.factories.find(EqualFilter(input));

internal.Component.define = (factory, options) => {

  assert(isFunction(factory), `'factory' must be a function`);

  if (!isUndefined(options))
    assert(isObject(options), `'options' must be an object`);

  const { tagName, attributes = {} } = factory;
  let { initialState = {} } = factory;

  assert(isString(tagName) && /[a-z0-9-]+/i, `'tagName' must be a string`);
  assert(!internal.Component.get(factory), `That component factory is already defined`);
  assert(!internal.factories.find(ByFilter('tagName', tagName)), `'${tagName}' component is already defined`);

  if (isObject(initialState) && !isNull(initialState))
    initialState = identity.bind(null, initialState);

  assert(isFunction(initialState), `'initialState' must be an object or a function`);

  factory.initialState = initialState;
  factory.properties = internal.parseProperties(factory.properties);

  if (!isFunction(factory.attach))
    factory.attach = internal.defaultsHooks.attach;
  if (!isFunction(factory.initialize))
    factory.initialize = internal.defaultsHooks.initialize;
  if (!isFunction(factory.detach))
    factory.detach = noop;
  if (!isFunction(factory.update))
    factory.update = internal.defaultsHooks.update;
  if (!isFunction(factory.render))
    factory.render = noop;

  internal.factories.push(factory);

  const attributesNames = factory.properties.filter(property => property.attribute).map(property => property.name);

  customElements.define(tagName, class extends HTMLElement {
    constructor() {

      super();

      internal.Component(factory, this);
    }
    static get observedAttributes() {

      return attributesNames;
    }
    connectedCallback() {

      this.pwet.attach();
    }
    disconnectedCallback() {

      this.pwet.detach();
    }
    attributeChangedCallback(name, oldValue, newValue) {

      this.pwet.attributeChanged(name, oldValue, newValue);
    }
  });

};

export default internal.Component