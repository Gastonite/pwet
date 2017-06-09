import Component from '../../src/component';
import { number } from '../../src/props';


const Counter = element => {

  let _interval;

  const attach = element => {

    log('Counter.attach()', element);

    _interval = setInterval(() => ++element.count, 1000);
  };

  const detach = element => {

    log('Counter.detach()', element);

    clearInterval(_interval);
  };


  const render = (element, state) => {

    log('Counter.render()', element, state);

    element.innerHTML = JSON.stringify(state, null, 2)
  };

  return Component(Counter, element, {
    attach,
    detach,
    render
  });
};

Counter.attributes = {
  count: number
};

Counter.tagName = 'x-counter';

export default Counter;