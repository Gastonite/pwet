import { noop } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import { clone } from './utilities';


const internal = {
  factories: []
};

internal.Component = (factory, element, properties = {}) => {

  assert(internal.Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element._component !== void 0)
    return;

  assert(isObject(properties), `'properties' must be an object`);

  let _syncingAttributeToProperty = false;
  let _syncingPropertyToAttribute = false;
  let _connected = false;
  let _updating = false;
  let _shadowRoot = false;
  let _scheduled = false;
  let _previousState;
  let _i = 0;
  let _updateArgs = [];

  const {
    attributes = factory.attributes,
    render:_render = factory.render,
    attach:_attach = factory.attach,
    detach:_detach = factory.detach,

  } = properties;

  const _updateDebounced = (...args) => {
    _updateArgs = args;
    if (!_scheduled) {
      _scheduled = true;
      spanElement.textContent = `textContent_${_i}`;
      _i += 1;
    }
  };

  Object.defineProperties(element, Object.keys(attributes).reduce((properties, key) => {

    const { attribute: { target }, coerce, default: def, serialize } = attributes[key];
    const $value = Symbol(key);

    return Object.assign(properties, {
      [key]: {
        configurable: true,
        get() {
          const val = element[$value];
          return val == null ? def : val;
        },
        set(newValue) {

          element[$value] = coerce(newValue);

          if (target && _syncingAttributeToProperty !== target) {

            const serialized = serialize(newValue);

            _syncingPropertyToAttribute = true;

            if (serialized == null)
              element.removeAttribute(target);
            else
              element.setAttribute(target, serialized);

            _syncingPropertyToAttribute = false;
          }

          _updateDebounced();
        }
      }
    });
  }, {}));

  const spanElement = document.createElement('span');

  const observer = new MutationObserver(() => {

    if (_updating || !_connected)
      return;

    _updating = true;

    const prev = _previousState;
    const next = _previousState = element.state;

    // log('element.stateUpdatedCallback()', next);

    if (!prev || Object.keys(prev).some(key => prev[key] !== next[key])) {

      // log('element.stateChangedCallback()');

      let root = element;

      if (factory.shadowRoot)
        root = _shadowRoot;

      _render(root, next);
    }

    _updating = _scheduled = false;
    _updateArgs = null;
  });

  observer.observe(spanElement, { childList: true });

  const attach = () => {

    log('Component.attach()', element);

    if (_connected)
      return;

    _connected = true;

    _updateDebounced();

    if (factory.shadowRoot)
      _shadowRoot = element.attachShadow(factory.shadowRoot);

    _attach(element);
  };

  const detach = () => {

    log('Component.detach()', element);

    if (!_connected)
      return;

    _connected = false;

    _detach(element);
  };


  const render = (...args) => {

    log('Component.render()', element);

    _render(element, ...args);
  };


  const attributeChanged = (name, oldValue, newValue) => {

    // log('Component.attributeChanged()', name, oldValue, newValue);

    if (_syncingPropertyToAttribute)
      return;

    for (let propName in attributes) {
      const { attribute: { source }, deserialize } = attributes[propName];
      if (source === name) {
        _syncingAttributeToProperty = propName;
        element[propName] = newValue == null ? newValue : deserialize(newValue);
        _syncingAttributeToProperty = null;
      }
    }


  };

  log('Component()', element);

  const component = Object.freeze({
    isPwetComponent: true,
    attach,
    detach,
    render,
    attributeChanged
  });

  return element._component = component;
};
internal.Component.get = input => internal.factories.find(EqualFilter(input));

internal.parseAttributes = input => {

  const attributes = {};

  if (!isObject(input))
    return attributes;

  const keys = Object.keys(input);

  if (isEmpty(keys))
    return attributes;

  return keys.reduce((attributes, name) => {

    const prop = input[name] || {};
    const { coerce, default: def, deserialize, serialize } = prop;

    log('parseAttribute', name, prop);

    const attribute = typeof prop.attribute === 'object'
      ? Object.assign({}, prop.attribute)
      : { source: prop.attribute, target: prop.attribute };

    if (attribute.source === true)
      attribute.source = name;
    if (attribute.target === true)
      attribute.target = name;

    attributes[name] = {
      attribute,
      coerce: coerce || (v => v),
      default: def,
      deserialize: deserialize || (v => v),
      serialize: serialize || (v => v)
    };

    return attributes;
  }, input);
};

internal.Component.define = (factory, options) => {

  log('Component.define()');

  assert(isFunction(factory), `'factory' must be a function`);

  if (!isUndefined(options))
    assert(isObject(options), `'options' must be an object`);

  const { tagName, attributes = {} } = factory;

  assert(isString(tagName) && /[a-z0-9-]+/i, `'tagName' must be a string ${tagName}`);
  assert(!internal.Component.get(factory), `That component factory is already defined`);
  assert(!internal.factories.find(ByFilter('tagName', tagName)), `'${tagName}' component is already defined`);

  factory.attributes = internal.parseAttributes(factory.attributes);

  if (!isFunction(factory.attach))
    factory.attach = noop;
  if (!isFunction(factory.detach))
    factory.detach = noop;
  if (!isFunction(factory.render))
    factory.render = noop;

  assert(isFunction(factory.render), `'render' must be a function`);

  internal.factories.push(factory);

  customElements.define(tagName, class extends HTMLElement {
    constructor() {

      super();


      this._component = factory(this, options && clone(options))
    }
    static get observedAttributes() {

      // log('get observedAttributes', attributes);

      return Object.keys(attributes)
        .map(k => attributes[k].attribute)
        .filter(Boolean)
        .map(a => a.source);
    }
    get state() {
      // log('get state')

      return Object.keys(attributes).reduce((state, key) => Object.assign(state, { [key]: this[key] }), {});
    }
    set state(newState) {

      // log('set state', newState)
      Object.keys(newState).forEach(key => key in attributes && (this[key] = newState[key]));
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