'use strict';

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  // Set debugging source maps to be "inline" for
  // simplicity and ease of use
  devtool: 'inline-source-map',

  // The application entry point
  entry: './src/index.ts',

  // Where to compile the bundle
  // By default the output directory is `dist`
  output: {
    path: path.resolve(__dirname, '_bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'MyLib',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devtool: 'source-map',
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        minimize: true,
        sourceMap: true,
        include: /\.min\.js$/,
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        use: 'url-loader',
      },
    ],
  },
};
