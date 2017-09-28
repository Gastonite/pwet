'use strict';

import { Component, Definition } from 'pwet';

const Counter = (component) => {

  component = Component(component);

  let _interval;

  const initialize = (component, newProperties, oldProperties, initialize) => {

    console.log('Counter.initialize() before', newProperties);

    const { state } = component;

    if (newProperties.start !== state.count)
      component.state = { ...state, count: newProperties.start };

    initialize(!component.isRendered);

    console.log('Counter.initialize() after', component.state);
  };


  const _incrementBy = value => () => {
    const { element, state } = component;

    component.state = { ...state, count: state.count + element.by };
  };

  const attach = ({ element, state }, attach) => {
    console.log('Counter.attach()', state);

    _interval = setInterval(_incrementBy(element.by), 1000);

    attach(true);

    setTimeout(detach, 6000)
  };

  const detach = () => {
    console.log('Counter.detach()');

    clearInterval(_interval);
  };

  Object.assign(component.hooks, {
    attach,
    detach,
    initialize
  });

  return component;
};


//component => {
//
//  const { element } = component;
//  console.log('Counter() ', component.state);
//
//
//
//  return {
//    initialize,
//    attach,
//    detach
//  };
//};
//
//Counter.decorators = [StatefulComponent];
//
Counter.hooks = {};

Counter.hooks.render = ({ element, state }) => {

  element.innerHTML = JSON.stringify(state, null, 2)
};

Counter.properties = {
  start: ({ element }) => ({
    get: () => {
      const value = parseInt(element.getAttribute('start'));

      return isNaN(value) ? 0 : value;
    },
    set: (newValue) => {
      element.getAttribute('start', newValue);
    }
  }),
  by: ({ element }) => ({
    get: () => {
      const value = parseInt(element.getAttribute('by'));

      return isNaN(value) ? 1 : value;
    },
    set: (newValue) => {
      element.getAttribute('by', newValue);
    }
  })
};

Counter.attributes = {
  start: (component, value, oldValue) => {

  },
  by: (component, value, oldValue) => {

  }
};

Counter.initialState = {
  count: 0
};

Counter.tagName = 'counter';

export default Counter;