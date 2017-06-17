import Attribute from '../../src/attribute';


const Counter = component => {

  const { element } = component;
  let _interval;

  const attach = (done) => {

    _interval = setInterval(() => {
      const state = component.state;

      log('Counter.attach() before', state.count);
      state.count++;
      log('Counter.attach() after', state.count);

      component.state = state;
    }, 1000);


    setTimeout(detach, 2000)
    done();
  };

  const detach = (state) => {

    log('Counter.detach()', state);

    clearInterval(_interval);
  };

  return {
    attach,
    detach
  };
};

Counter.render = (component) => {

  // log('Counter.render() properties:', JSON.stringify(component.properties), 'state:', JSON.stringify(component.state));

  component.element.innerHTML = JSON.stringify(component.state, null, 2)
};

Counter.properties = {
  yo: {},
  count: {
    attribute: Attribute.number,
    isPartOfState: true
  }
};

Counter.tagName = 'x-counter';

export default Counter;