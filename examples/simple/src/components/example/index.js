'use strict';

import { Definition } from '../../../../../src';
import Example from './example';
import style from './example.styl';

export default Definition(Object.assign(Example, {
  id: 'example',
  style,
  verbose: true
}));