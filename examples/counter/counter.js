import { number } from '../../src/attribute';


const Counter = component => {

  const { element } = component;
  let _interval;

  const attach = (state) => {

    log('Counter.attach()', state);

    _interval = setInterval(() => ++element.count, 1000);
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

Counter.render = (element, state) => {

  log('Counter.render()', state);

  element.innerHTML = JSON.stringify(state, null, 2)
};

Counter.properties = {
  count: number
};

Counter.tagName = 'x-counter';

export default Counter;