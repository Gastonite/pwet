'use strict';

import { defineComponent } from 'pwet';
import IDOMComponent from 'pwet-idom';
import ShadowComponent from 'pwet/src/definitions/shadow';

import Todo from './todo';

export default defineComponent([
  Todo,
  ShadowComponent,
  IDOMComponent
]);