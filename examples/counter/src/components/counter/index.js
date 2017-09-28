'use strict';

import { defineComponent } from 'pwet';
import Counter from './counter';
import style from './counter.css';
import StatefulDefinition from 'pwet/src/decorators/stateful';

export default defineComponent(
  Object.assign(
    StatefulDefinition(Counter),
    {
      style,
      verbose: true
    }
  )
);