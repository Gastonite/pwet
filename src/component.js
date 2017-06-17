import { noop, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isNull, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import Property from './property';
import Attribute from './attribute';


const internal = {
  factories: [],
  allowedHooks: ['attach', 'detach', 'reload', 'update', 'render']
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
    attach();
  },
  update(component, newState, update) {
    update();
  },
  reload(component, newProperties, reload) {
    reload();
  }
};

internal.Component = (factory, element) => {

  assert(internal.Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element._component !== void 0)
    return;

  let _shadowRoot = false;
  let _isAttached = false;
  let _isRendered = false;
  let _isUpdating = false;
  let _state = {};
  let _properties = {};


  const attach = (...args) => {

    if (_isAttached)
      return;

    if (factory.shadowRoot)
      _shadowRoot = element.attachShadow(factory.shadowRoot);

    _hooks.attach(() => {

      _isAttached = true;

      _render();
    });
  };

  const _update = (newState = {}) => {

    assert(isObject(newState) && !isNull(newState), `'newState' must be an object`);

    assert(_state !== newState, `'newState' must not be equal to previous state`);

    _isUpdating = true;

    _hooks.update(newState, (render = true) => {

      _state = newState;

      if (render !== true)
        return;

      _render();

      _isUpdating = false;
    });
  };

  const detach = (...args) => {

    if (!_isAttached)
      return;

    _isAttached = false;

    _hooks.detach();
  };

  const _render = () => {

    if (!_isAttached) {
      assert(!_isRendered, 'WTF!!!!');
      return;
    }

    let root = element;

    if (factory.shadowRoot)
      root = _shadowRoot;

    _hooks.render();


    _isRendered = true;
  };

  const attributeChanged = (name, oldValue, newValue) => {


    const properties = component.properties;

    _attributes.forEach(property => {

      if (name === property.name)
        properties[name] = property.attribute.parse(newValue);

    });

    component.properties = properties
  };

  const component = element._component = {
    isPwetComponent: true,
    element,
    attach,
    detach,
    attributeChanged
  };

  const _hooks = {
    reload: factory.reload.bind(null, component),
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
        _update(newState);
    }
  });

  Object.defineProperty(component, 'properties', {
    get() {
      return Object.assign({}, _properties);
    },
    set(newProperties) {

      assert(isObject(newProperties) && !isNull(newProperties), `'newProperties' must be an object`);


      _hooks.reload(newProperties, () => {

        const state = component.state;

        newProperties = factory.properties.reduce((properties, { name, coerce, defaultValue, isPartOfState }) => {

          let value = newProperties[name];

          value = isUndefined(value) ? defaultValue : coerce(value);

          if (isFunction(value))
            value = value.bind(null, component);

          if (isPartOfState)
            state[name] = value;

          _properties[name] = value;

          return Object.assign(properties, { [name]: value });
        }, {});

        component.state = state;
      });
    }
  });


  component.properties = _attributes.reduce((properties, { name }) => {

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

    return Object.assign(properties, { [name]: element.dataset[name] });
  }, {});

  const overriden = factory(Object.freeze(component));

  if (!isObject(overriden) || isNull(overriden))
    return component;

  Object.keys(overriden).filter(internal.isAllowedHook).forEach(key => {

    const method = overriden[key];

    assert(isFunction(method), `'${key}' must be a function`);

    _hooks[key] = method;
  });

  assert(_hooks.render !== noop, `'render' method is required`);

  return component;
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

  factory.properties = internal.parseProperties(factory.properties);

  if (!isFunction(factory.attach))
    factory.attach = internal.defaultsHooks.attach;
  if (!isFunction(factory.reload))
    factory.reload = internal.defaultsHooks.reload;
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

      this._component.attach();
    }
    disconnectedCallback() {

      this._component.detach();
    }
    attributeChangedCallback(name, oldValue, newValue) {

      this._component.attributeChanged(...arguments);
    }
  });

};

export default internal.Component