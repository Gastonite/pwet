const _initialState = [
  {id: '1', text: 'Count to infinity twice', completed: true},
  {id: '2', text: 'Save the world', completed: false}
];

const todos = (state = _initialState, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        (todo.id === action.id)
          ? {...todo, completed: !todo.completed}
          : todo
      );
    default:
      return state
  }
};

export default todos