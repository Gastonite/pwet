'use strict';

import '@webcomponents/shadydom/src/shadydom';
import '@webcomponents/custom-elements/src/custom-elements';
import './components/todo';
import './components/todo-list';
import store from './store';

document.addEventListener('DOMContentLoaded', () => {

  document.body.appendChild(document.createElement('x-todo-list'));

  store.dispatch({type: '@@INIT'});
});