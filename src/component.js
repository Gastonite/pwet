import { noop, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isArray, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import Property from './property';
import Attribute from './attribute';


const internal = {
  factories: []
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

internal.defaultUpdater = (element, newState, update) => {

  update(newState);
};

internal.Component = (factory, element, override = {}) => {

  assert(internal.Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element._component !== void 0)
    return;

  assert(isObject(override), `'override' must be an object`);

  let _syncingAttributeToProperty = false;
  let _syncingPropertyToAttribute = false;
  let _connected = false;
  let _updating = false;
  let _shadowRoot = false;
  let _rendered = false;
  let _previousState;
  let _updateArgs = [];

  const {
    update:_update = factory.update,
    render:_render = factory.render,
    attach:_attach = factory.attach,
    detach:_detach = factory.detach,
  } = override;

  const _properties = factory.properties.map((property) => {

    let defaultValue = property.defaultValue;

    if (isFunction(defaultValue))
      defaultValue = defaultValue.bind(null, element);

    return Object.assign({}, property, { defaultValue });
  });

  const _attributes = _properties.filter(property => property.attribute !== false);

  const attach = () => {

    if (_connected)
      return;

    _connected = true;

    if (factory.shadowRoot)
      _shadowRoot = element.attachShadow(factory.shadowRoot);

    _attach(element);

    component.update();
  };

  const update = (state = {}) => {

    assert(isObject(state), `'state' must be an object`);
    const newState = Object.assign(element.state, state);

    _update(element, newState, (state, render = true) => {

      Object.assign(_state, newState);

      if (!render)
        return;

      component.render(state);
    });
  };

  const detach = () => {

    if (!_connected)
      return;

    _connected = false;

    _detach(element);
  };

  const render = (...args) => {

    let root = element;

    if (factory.shadowRoot)
      root = _shadowRoot;

    _render(element, ...args);

    _rendered = true;
  };

  const attributeChanged = (name, oldValue, newValue) => {

    if (_syncingPropertyToAttribute)
      return;

    _properties.forEach(property => {

      const { name, attribute: { parse } } = property;

      _syncingAttributeToProperty = name;
      element[name] = newValue == null ? newValue : parse(newValue);
      _syncingAttributeToProperty = null;
    })

  };

  const component = Object.freeze({
    isPwetComponent: true,
    attach,
    detach,
    update,
    render,
    attributeChanged
  });

  Object.defineProperty(element, 'state', {
    get() {
      return Object.assign({}, _state);
    },
    set(newState) {

      assert(isObject(newState), `'state' must be an object`);

      component.update(newState);
    }
  });

  const _state = _properties.reduce((state, property) => {

    const { name, coerce, defaultValue, attribute } = property;

    Object.defineProperty(element, name, {
      get() {
        return element.state[name];
      },
      set(newValue) {

        element.state = Object.assign(element.state, {
          [name]: newValue
        });
      }
    });

    return Object.assign(state, {
      [name]: /*element.getAttribute(name) || */defaultValue
    });
  }, {});


  element.update = component.update;
  element.render = component.render;

  return element._component = component;
};

internal.Component.get = input => internal.factories.find(EqualFilter(input));

internal.Component.define = (factory, options) => {

  assert(isFunction(factory), `'factory' must be a function`);

  if (!isUndefined(options))
    assert(isObject(options), `'options' must be an object`);

  const { tagName, attributes = {} } = factory;

  assert(isString(tagName) && /[a-z0-9-]+/i, `'tagName' must be a string ${tagName}`);
  assert(!internal.Component.get(factory), `That component factory is already defined`);
  assert(!internal.factories.find(ByFilter('tagName', tagName)), `'${tagName}' component is already defined`);

  const properties = factory.properties = internal.parseProperties(factory.properties);

  if (!isFunction(factory.attach))
    factory.attach = noop;
  if (!isFunction(factory.detach))
    factory.detach = noop;
  if (!isFunction(factory.update))
    factory.update = internal.defaultUpdater;
  if (!isFunction(factory.render))
    factory.render = noop;

  internal.factories.push(factory);

  customElements.define(tagName, class extends HTMLElement {
    constructor() {

      super();
      this._component = factory(this);
    }
    static get observedAttributes() {

      return factory.properties.filter(property => property.attribute).map(property => property.name);
    }
    get state() {

      return properties.reduce((state, property) => Object.assign(state, {
        [property.name]: this[property.name]
      }), {});
    }
    set state(newState) {

      Object.keys(newState).forEach(key => {

        if (properties.find(property => property.name === key))
          this[key] = newState[key]

      });
    }
    connectedCallback() {

      this._component.attach(...arguments);
    }
    disconnectedCallback() {

      this._component.detach(...arguments);
    }
    attributeChangedCallback(name, oldValue, newValue) {

      this._component.attributeChanged(...arguments);
    }
  });

};

export default internal.Component