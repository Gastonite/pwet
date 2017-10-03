'use strict';

import { renderUl, renderStyle, transformObjectToArray } from 'idom-util';
import { renderComponent } from 'pwet-idom';
import { noop } from 'pwet/src/utilities';
import { isObject, isArray, isString, isFunction, isEmpty } from 'kwak';


const TodoList = {};

TodoList.hooks = {};

TodoList.hooks.render = ({ element: { todos, whenTodoClicked }, definition: { style }}) => {

  renderStyle(style);

  renderUl(() => {

    todos.forEach(todo => {

      renderComponent('x-todo', todo.id, [], ...transformObjectToArray({
        ...todo,
        whenClicked: () => whenTodoClicked(todo.id)
      }));
    });
  });
};

TodoList.tagName = 'x-todo-list';

TodoList.attributes = {
  'data-todos': ({ element }, value) => {

    try {
      return { todos: JSON.parse(value) };
    } catch(err) {}
  }
};

TodoList.properties = {
  todos: ({ element }, value = []) => {

    const _setValue = input => {
      console.log('set todos', input);

      if (isString(input))
        try {
          input = JSON.parse(input);
        } catch (err) {
          console.error(err.stack);
          return;
        }

      if (!isArray(input)) return;

      for (let todo of input) {

        if (!isObject(todo)) return;
        if (!isString(todo.id) || isEmpty(todo.id)) return;

        todo.completed = !!todo.completed;

        if (!isString(todo.text))
          todo.text = '';
      }

      value = input;
    };

    _setValue(element.getAttribute('data-todos'));

    return {
      get: () => value,
      set: _setValue
    };
  },
  whenTodoClicked: (component, value = noop) => ({
    get: () => value,
    set: (newValue) => {
      if (isFunction(newValue))
        value = newValue;
    }
  })
};

export default TodoList;