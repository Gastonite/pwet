'use strict';

import StyleTransformer from '@webcomponents/shadycss/src/style-transformer';
import Definition from '../definition';
import { decorate } from '../utilities';
import { isEmpty } from 'kwak';

const isShadowNative = !(window['ShadyDOM'] && window['ShadyDOM']['inUse']);

const ShadowComponent =  (component) => {

  const { element, definition: { verbose, tagName }, hooks } = component;

  component.root = element.attachShadow({ mode: 'open' });

  if (verbose)
    console.log('ShadowComponent()', hooks.render);

  hooks.render = decorate(hooks.render, (next, component) => {

    if (verbose)
      console.log('ShadowComponent.render()');

    next(component);

    if (!isShadowNative)
      StyleTransformer.dom(component.root, tagName);
  });

  return component;
};

ShadowComponent.hooks = {
  define: definition => {

    const { tagName, style, verbose } = definition;

    if (!isEmpty(style) && !isShadowNative)
      definition.style = StyleTransformer.css(style, tagName);


    if (verbose)
      console.log(`<${tagName}>`, 'ShadowComponent.define()');

    return definition;
  }
};

export default ShadowComponent;