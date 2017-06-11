import Component from '../../src/component';
import { number } from '../../src/attribute';


const Counter = element => {

  let _interval;

  const attach = element => {

    log('Counter.attach()', element.count);

    _interval = setInterval(() => ++element.count, 1000);
  };

  const detach = element => {

    log('Counter.detach()', element);

    clearInterval(_interval);
  };

  const render = (element, state) => {

    log('Counter.render()', element);

    element.innerHTML = JSON.stringify(state, null, 2)
  };

  return Component(Counter, element, {
    attach,
    detach,
    render
  });
};

Counter.properties = {
  count: number
};

Counter.tagName = 'x-counter';

export default Counter;