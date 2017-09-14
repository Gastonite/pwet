import { assert } from 'kwak';
import { decorate } from '../utilities';
import Throttle from 'lodash.throttle';


const ThrottlingComponentDecorator = ({ maxWait = 250 } = {}) => {

  assert(Number.isInteger(maxWait) && maxWait >= 0, `'maxWait' must be a positive integer`);

  return (factory, dependencies) => {

    factory.create = decorate(factory.create, (next, component, dependencies) => {

      component.render = Throttle(component.render, maxWait);

      return next(component, dependencies);
    });
  };
};


export default ThrottlingComponentDecorator