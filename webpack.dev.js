const path = require('path')
const { merge } = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    compress: true,
    port: 9000,
    overlay: true,
    stats: {
      assets: true,
      cached: false,
      chunkModules: false,
      chunkOrigins: false,
      chunks: false,
      colors: true,
      hash: false,
      modules: false,
      reasons: false,
      source: false,
      version: false,
      warnings: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        /*
          ref url: https://awdr74100.github.io/2020-03-02-webpack-minicssextractplugin/
          'style-loader': Inject the CSS processed by the css-loader into the HTML, which will exist in the form of style tags
        */
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
})
