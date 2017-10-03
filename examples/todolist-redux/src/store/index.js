import { createStore } from 'redux';
import reducer from './reducers';
import enhancer from './enhancers';

export default createStore(reducer, enhancer);