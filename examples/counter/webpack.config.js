'use strict';

const Path = require('path');
const Webpack = require('webpack');
const WebpackConfig = require('../webpack-config');
const HTMLWebpackPlugin = require('html-webpack-plugin');


module.exports = (env) => {

  const isBuild = env === 'production' || env === 'prod';

  const entry = Path.resolve(__dirname, './index.js');

  const output = {
    path: Path.resolve(__dirname, './build'),
    filename: '[name].js'
  };

  const template = Path.resolve(__dirname, 'index.html');

  return WebpackConfig({
    dependencies: {
      Webpack,
      HTMLWebpackPlugin
    },
    options: {
      isBuild,
      entry,
      output,
      template
    }
  });

};