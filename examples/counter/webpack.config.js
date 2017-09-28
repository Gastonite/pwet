'use strict';

const Path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = (env) => {

  const isBuild = env === 'production' || env === 'prod';

  const port = 3000;

  const entry = Path.resolve(__dirname, 'src/index.js');

  const output = {
    path: Path.resolve(__dirname, './build'),
    filename: '[name].js'
  };

  const template = Path.resolve(__dirname, 'src/index.html');

  const devtool = !isBuild && 'source-map';

  const devServer = {
    port,
    historyApiFallback: true,
    inline: !isBuild,
    hot: !isBuild,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: true,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      }
    }
  };

  const module = {
    loaders: [
      {test: /\.js$/, use: 'babel-loader'},
      {test: /\.css/, use: [
        'to-string-loader',
        'css-loader'
      ]}
    ]
  };

  const plugins = [new Webpack.NamedModulesPlugin()];

  if (!isBuild)
    plugins.push(new Webpack.HotModuleReplacementPlugin());

  plugins.push(
    new HTMLWebpackPlugin({
      filename: `index.html`,
      template,
      cache: true,
      inject: 'body',
      minify: isBuild && {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    //new ExtractTextPlugin("style.css")
  );


  const resolve = {
    alias: {
      pwet: Path.resolve(__dirname, '../..')
    }
  };

  return {
    entry,
    output,
    devtool,
    devServer,
    module,
    resolve,
    plugins
  };

};