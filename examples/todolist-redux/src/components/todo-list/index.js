'use strict';

import ReduxDefinition from '../../utilities';
import IDOMComponent from 'pwet-idom';

import { defineComponent } from 'pwet';
import ShadowComponent from 'pwet/src/definitions/shadow';
import { decorate, noop } from 'pwet/src/utilities';
import store from '../../store';
import { toggleTodo } from '../../actions'
import style from './todo-list.styl';

import TodoList from './todo-list';

export default defineComponent([
  TodoList,
  IDOMComponent,
  ShadowComponent, // <- uncomment to add shadow root
  ReduxDefinition({
    store,
    updateState: (state) => ({
      todos: state.todos,
      whenTodoClicked: toggleTodo
    })
  })
]);

//export default TodoListDefinition(
//  Object.assign(TodoList, {
//    verbose: true,
//    style,
//    store,
//    updateState: (state) => ({
//      todos: state.todos,
//      whenTodoClicked: toggleTodo
//    })
//  })
//);
