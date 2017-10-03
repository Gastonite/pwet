'use strict';

import pipe from 'ramda/src/pipe';

import { defineComponent } from 'pwet';

import Definition from 'pwet/src/definition';
import IDOMComponent from 'pwet-idom';
import ShadowComponent from 'pwet/src/definitions/shadow';
import Example from './example';

export default defineComponent([
  Example,
  ShadowComponent
]);


//export default ExampleDefinition(
//  Object.assign(Example, {
//    verbose: true
//  })
//);