import { noop, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import { isFunction, isArray, isUndefined, isElement, isString, isEmpty, isObject, assert } from './assertions';
import Property from './property';
import Attribute from './attribute';


const internal = {
  factories: []
};

internal.Component = (factory, element, override = {}) => {

  assert(internal.Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element._component !== void 0)
    return;

  assert(isObject(override), `'override' must be an object`);


  const _spanElement = document.createElement('span');
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
    properties = factory.properties,
    render:_render = factory.render,
    attach:_attach = factory.attach,
    detach:_detach = factory.detach,

  } = override;

  const _attributes = properties.filter(property => property.attribute !== false);

  const _updateDebounced = (...args) => {
    _updateArgs = args;
    if (!_scheduled) {
      _scheduled = true;
      _spanElement.textContent = `textContent_${_i}`;
      _i += 1;
    }
  };


  Object.defineProperties(element, factory.properties.reduce((properties, property) => {

    console.log('property', property);
    const { name, coerce, defaultValue, attribute } = property;

    let _value;

    return Object.assign(properties, {
      [name]: {
        configurable: true,
        get() {
          return _value == null ? property.value : _value;
        },
        set(newValue) {

          if (attribute) {

            _value = property.coerce(newValue);

            if (property.name && _syncingAttributeToProperty !== property.name) {
              // console.log('set', attribute ? 'attribute' : 'property', newValue, attribute)

              const stringValue = attribute.stringify(newValue);

              _syncingPropertyToAttribute = true;

              if (stringValue == null)
                element.removeAttribute(attribute.name);
              else
                element.setAttribute(attribute.name, stringValue);

              _syncingPropertyToAttribute = false;
            }
          }

          _updateDebounced();
        }
      }
    });
  }, {}));

  const observer = new MutationObserver(() => {

    if (_updating || !_connected)
      return;

    _updating = true;

    const prev = _previousState;
    const next = _previousState = element.state;

    if (!prev || Object.keys(prev).some(key => prev[key] !== next[key])) {

      let root = element;

      if (factory.shadowRoot)
        root = _shadowRoot;

      _render(root, next);
    }

    _updating = _scheduled = false;
    _updateArgs = null;
  });

  observer.observe(_spanElement, { childList: true });


  const attach = () => {

    if (_connected)
      return;

    _connected = true;

    _updateDebounced();

    if (factory.shadowRoot)
      _shadowRoot = element.attachShadow(factory.shadowRoot);

    _attach(element);
  };

  const detach = () => {

    if (!_connected)
      return;

    _connected = false;

    _detach(element);
  };

  const render = (...args) => {

    _render(element, ...args);
  };

  const attributeChanged = (name, oldValue, newValue) => {

    if (_syncingPropertyToAttribute)
      return;

    console.log('attributeChanged', properties)
    properties.forEach(property => {

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
    render,
    attributeChanged
  });

  return element._component = component;
};

internal.Component.get = input => internal.factories.find(EqualFilter(input));

internal.parseProperties = input => {

  const properties = [];

  if (!isObject(input))
    return properties;

  const keys = Object.keys(input);

  if (isEmpty(keys))
    return properties;

  return keys.reduce((properties, key) => {

    let property = input[key];

    assert(isObject(property), `'property' must be an object`);


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
  if (!isFunction(factory.render))
    factory.render = noop;

  assert(isFunction(factory.render), `'render' must be a function`);

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
      console.log('attributeChangedCallback')

      this._component.attributeChanged(...arguments);

    }
  });

};

export default internal.Component