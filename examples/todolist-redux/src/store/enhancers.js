import { applyMiddleware } from 'redux';
import ReduxLogger from 'redux-logger';

export default applyMiddleware(
  ReduxLogger
);