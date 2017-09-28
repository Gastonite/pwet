'use strict';

import { defineComponent } from '../../../../../src';
import Example from './example';
import style from './example.styl';

export default defineComponent(Object.assign(Example, {
  tagName: 'example',
  style,
  verbose: true
}));