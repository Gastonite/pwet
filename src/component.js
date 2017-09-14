import kebabCase from 'lodash.kebabcase';
import camelCase from 'lodash.camelcase';
import cloneDeep from 'lodash.clonedeep';
import Property from './property';
import { noop, decorate, clone, identity } from './utilities';
import { ByFilter, EqualFilter } from './filters';
import {
  isFunction,
  isNull,
  isEqualTo,
  isDeeplyEqual,
  isArray,
  isUndefined,
  isElement,
  isString,
  isEmpty,
  isObject,
  isPlainObject,
  assert
} from 'kwak';

const internal = {
  factories: [],
  allowedHooks: ['attach', 'detach', 'initialize', 'render']
};

const $pwet = Symbol('pwet');

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

internal.defaultsHooks = {
  attach(component, attach) {

    attach(true);
  },
  initialize: (component, newProperties, initialize) => initialize(true)
};


const Component = (factory, element, dependencies) => {

  assert(Component.get(factory), `'factory' must be a defined component factory`);
  assert(isElement(element), `'element' must be a HTMLElement`);

  if (element[$pwet] !== void 0)
    return;

  let _isCreated = false;
  let _isAttached = false;
  let _isRendered = false;
  let _isInitializing = false;
  let _isInitialized = false;
  let _properties = {};

  if (factory.shadow)
    element.attachShadow(factory.shadow);

  const attach = () => {

    if (factory.logLevel > 0)
      console.log(`[${factory.tagName}]`, 'attach()');

    if (_isAttached)
      return;

    component.hooks.attach((shouldRender) => {
      _isAttached = true;

      if (!_isRendered && shouldRender)
        component.render();
    });

  };

  attach.after = (shouldUpdate = true) => {

    // console.log('Component.attach.after()', { shouldUpdate, _isAttached });

    if (shouldUpdate)
      component.render();

  };

  const detach = () => {

    if (factory.logLevel > 0)
      console.log(`[${factory.tagName}]`, 'detach()');

    if (!_isAttached)
      return;

    _isAttached = false;

    component.hooks.detach();
  };

  const initialize = (properties = {}) => {
    console.log('Component.initialize()', { properties, _isInitializing });

    if (_isInitializing)
      return;

    if (factory.logLevel > 0)
      console.log(`[${factory.tagName}]`, 'initialize()', properties, _properties);

    assert(isObject(properties) && !isNull(properties), `'properties' must be an object`);

    properties = factory.properties.reduce((newProperties, { name, coerce, defaultValue, isDataAttribute }) => {

      let oldValue = _properties[name];
      let newValue = properties[name];

      if (isUndefined(newValue) && isDataAttribute)
        newValue = properties[`data-${name}`];

      // console.log('HEY', name, oldValue, newValue);

      // newValue = isUndefined(newValue)
      //   ? (_properties.hasOwnProperty(name) ? oldValue : defaultValue)
      //   : newValue;

      // if (isUndefined(newValue) && _properties.hasOwnProperty(name))
      //   newValue = _properties[name];


        newValue = !isUndefined(newValue)
          ? coerce(newValue)
          : defaultValue;

      return Object.assign(newProperties, { [name]: newValue })
    }, {});

    if (isDeeplyEqual(properties, _properties)) {
      if (factory.logLevel > 0)
        console.warn(`[${factory.tagName}]`, 'aborted initialization (properties are unchanged)', properties, _properties);
      return;
    }

    // console.log(`[${factory.tagName}]`, 'initializing...', newProperties);

    _isInitializing = true;

     console.log(`[${factory.tagName}]`, 'aaaaa', component.hooks.initialize);

    component.hooks.initialize(properties, (shouldRender) => {
      _properties = properties;
      // Object.assign(_properties, properties);

      _isInitializing = false;
      _isInitialized = true;

      if (shouldRender)
        component.render();

      // console.log(`[${factory.tagName}]`, 'initialized', properties);

    });
  };

  const render = () => {

    if (factory.logLevel > 0)
      console.log(`[${factory.tagName}]`, 'render()', { _isAttached, ..._properties });

    if (!_isAttached)
      return;

    component.hooks.render();

    _isRendered = true;
  };

  const component = element[$pwet] = {
    isPwetComponent: true,
    element,
    factory,
    attach,
    render,
    detach,
    get isRendered() {
      return _isRendered
    },
    get isAttached() {
      return _isAttached
    },
    get isInitializing() {
      return _isInitializing
    },
    get isInitialized() {
      return _isInitialized
    },
    get hooks() {
      return _hooks
    }
    // get state() {
    //   return _hooks
    // },
    // set properties(newValue) {
    //   return _hooks
    // }
  };

  Object.assign(element, {
    initialize
  });

  const _hooks = factory.allowedHooks.reduce((hooks, key) => {
    return Object.assign(hooks, { [key]: factory[key].bind(null, component) });
  }, {});

  Object.defineProperty(element, 'properties', {
    get() {
      return cloneDeep(_properties);
    },
    set: initialize
  });


  const returned = factory.create(component, factory.dependencies);

  if (!isObject(returned) || isNull(returned))
    return component;

  Object.keys(returned)
    .forEach(key => {

      if (!factory.allowedHooks.includes(key))
        return;

      const hook = returned[key];

      assert(isFunction(hook), `'${key}' hook must be a function`);

      _hooks[key] = hook;
    });

  assert(_hooks.render !== noop, `'render' method is required`);

  initialize(factory.properties.reduce((properties, { name, isDataAttribute, parse, defaultValue }) => {

    Object.defineProperty(element, name, {
      get() {
        return _properties[name];
      },
      set(newValue) {

        initialize(Object.assign(element.properties, {
          [name]: newValue
        }));
      }
    });

    let value = defaultValue;

    if (isDataAttribute) {

      const attributeValue = element.dataset[name];


      if (!isUndefined(attributeValue))
        value = parse(attributeValue);
    }

    return Object.assign(properties, { [name]: value });
  }, {}));

  const _attributes = factory.properties
    .filter(property => property.isAttribute === true)
    .reduce((attributes, attribute) => {

      let name = kebabCase(attribute.name);

      if (attribute.isDataAttribute)
        name = `data-${name}`;

      return Object.assign(attributes, { [name]: attribute });
    }, {});

  const _attributesName = Object.keys(_attributes);

  const _observer = new MutationObserver(mutations => {

    mutations = mutations
      .filter(({ attributeName }) => _attributesName.includes(attributeName))
      .map(({ attributeName:name, oldValue }) => ({
        name,
        oldValue,
        value: element.getAttribute(name)
      }))
      .filter(({ value, oldValue }) => !isEqualTo(value, oldValue));

    if (isEmpty(mutations))
      return;

    console.error(`[${factory.tagName}]`, 'ATTRIBUTES MUTATIONS', mutations.map(({ name, value }) => `${name}=${value}`));
    const { properties } = element;

    initialize(Object.assign(properties, mutations.reduce((attributes, { name, value }) => {

      const { parse, isDataAttribute } = _attributes[name];

      name = camelCase(isDataAttribute ? name.slice(5) : name);

      return Object.assign(attributes, { [name]: parse(value) });
    }, {})));

    // const { name, parse, isDataAttribute } = _attributes[attributeName];
    //
    // // console.error(`[${factory.tagName}]`, 'attributeChangedCallback', name, typeof newValue, this.pages);
    //
    // properties[name] = parse(newValue);
    //
    // this.initialize(properties);

  });

  _observer.observe(element, { attributes: true, attributeOldValue: true });

  return component;
};

Component.get = input => internal.factories.find(EqualFilter(input));

const ThinComponent = (factory) => {
  // console.log(`ThinComponent(${factory.tagName})`);

  // const factory = (component, factory, dependencies) => {
  //
  //   console.log('ThinComponent()', component);
  //
  //   return {
  //     render: render.bind(null, component, dependencies)
  //   }
  // };

  factory.create = decorate(factory.create, (next, component, ...args) => {
    // let hooks = next(component, ...args);


    // if (!isObject(hooks))
    //   hooks = {};

    return {
      // ...hooks,
      render: () => next(component, ...args)
    }
  });

  return factory;
};

Component.define = (tagName, factory) => {

  if (isFunction(tagName)) {
    factory = tagName;
    tagName = factory.tagName || factory.name;
  }

  assert(isFunction(factory), `'factory' must be a function`);

  const { dependencies = {} } = factory;

  assert(isString(tagName) && tagName.length > 0, `'tagName' must be a string`);

  tagName = kebabCase(tagName);

  if (!tagName.includes('-'))
    tagName = `x-${tagName}`;

  assert(!Component.get(factory), `That component factory is already defined`);
  assert(!internal.factories.find(ByFilter('tagName', tagName)), `'${tagName}' component is already defined`);
  assert(isObject(dependencies) && !isNull(dependencies), `'dependencies' must be an object`);

  factory.tagName = tagName;
  factory.allowedHooks = [];

  if (!isFunction(factory.create))
    factory.create = factory;
  if (!isFunction(factory.attach))
    factory.attach = internal.defaultsHooks.attach;
  if (!isFunction(factory.initialize))
    factory.initialize = internal.defaultsHooks.initialize;
  if (!isFunction(factory.detach))
    factory.detach = noop;
  if (!isFunction(factory.render))
    factory.render = noop;


  if (!isUndefined(factory.decorators)) {

    if (!isArray(factory.decorators))
      factory.decorators = [factory.decorators];

    factory.decorators.forEach(decorator => {
      assert((isFunction(decorator)), `'decorator' must be a function`);
      decorator(factory, dependencies);
    });

    // if (isFunction(factory.define)) {
    //   // factory.define = ThinComponent;
    //   factory = factory.define(factory);
    //
    //   // if (isObject(factory.properties) && !isNull(factory.properties)) {
    //   //   factory.define = ThickComponent;
    //   // }
    // }
  }
  if (!isUndefined(factory.shadow))
    assert((isPlainObject(factory.shadow)), `'shadow' must be a plain object`);

  assert(isFunction(factory.create), `'create' must be a function`);
  assert(isFunction(factory.attach), `'attach' must be a function`);
  assert(isFunction(factory.initialize), `'initialize' must be a function`);
  assert(isFunction(factory.detach), `'detach' must be a function`);
  assert(isFunction(factory.render), `'render' must be a function`);

  factory.tagName = tagName;
  factory.dependencies = dependencies;

  factory.properties = internal.parseProperties(factory.properties);

  factory.allowedHooks = factory.allowedHooks.reduce((hooks, hook) => {

    assert(isString(hook), `'hook' must be a string`);

    if (isString(hook) && !internal.allowedHooks.includes(hook))
      hooks.push(hook);

    return hooks;
  }, []).concat(internal.allowedHooks);

  internal.factories.push(factory);

   console.log(`Component.define(${factory.tagName})`, factory.allowedHooks);

  customElements.define(tagName, class extends HTMLElement {
    constructor() {

      super();

      Component(factory, this, dependencies);
    }
    // static get observedAttributes() {
    //
    //   return _attributesNames;
    // }
    connectedCallback() {

      this[$pwet].attach();
    }
    disconnectedCallback() {

      this[$pwet].detach();
    }
    // attributeChangedCallback(attributeName, oldValue, newValue) {
    //
    //   const { properties } = this.pwet;
    //
    //   const { name, parse, isDataAttribute } = _attributes[attributeName];
    //
    //   console.error(`[${factory.tagName}]`, 'attributeChangedCallback', name, typeof newValue, this.pages);
    //
    //   properties[name] = parse(newValue);
    //
    //   this.initialize(properties);
    //
    // }
  });
};

export {
  $pwet,
  ThinComponent,
  Component as default
}