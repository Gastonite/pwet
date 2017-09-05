import Attribute from '../../src/attribute';
import StatefulComponent from '../../src/decorators/stateful';


const Counter = component => {

  const { element } = component;
  console.log('Counter() ', component.state);


  let _interval;

  const _editState = (partialState) => {

    component.state = Object.assign(component.state, partialState);
  };

  const initialize = (newProperties, initialize) => {


    console.log('Counter.initialize() before', newProperties);

    const { state } = component;

    if (newProperties.start !== state.count)
      _editState({ count: newProperties.start });

    initialize(!component.isRendered);

    console.log('Counter.initialize() after', component.state);
  };


  const _incrementBy = value => () => {
    const { state } = component;

    _editState({
      count: state.count + element.by
    });
  };

  const attach = (attach) => {
    console.log('Counter.attach()', component.state);

    _interval = setInterval(_incrementBy(element.by), 1000);

    attach(true);

    setTimeout(detach, 6000)
  };

  const detach = (state) => {
    console.log('Counter.detach()', state);

    clearInterval(_interval);
  };

  return {
    initialize,
    attach,
    detach
  };
};

Counter.decorators = [StatefulComponent];

Counter.render = (component) => {

  console.log('Counter.render()', component);

  component.element.innerHTML = JSON.stringify(component.state, null, 2)
};

Counter.properties = {
  start: Attribute.number(),
  by: Attribute.integer({
    defaultValue: 1
  })
};

Counter.initialState = {
  count: 0
};

Counter.tagName = 'x-counter';

export default Counter;