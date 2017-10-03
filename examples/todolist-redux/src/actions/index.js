import store from '../store';

let nextTodoId = 0;

export const addTodo = text => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
};

export const setVisibilityFilter = filter => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
};

export const toggleTodo = id => {
  return store.dispatch({
    type: 'TOGGLE_TODO',
    id
  })
};