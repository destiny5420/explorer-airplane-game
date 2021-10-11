const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: '/js/main/entry.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './js/[name].js?[hash:5]',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    modules: [
      path.resolve('src'),
      path.resolve('src/js'),
      path.resolve('src/scss'),
      path.resolve('src/assets'),
      path.resolve('src/image'),
      path.resolve('node_modules'),
    ],
    extensions: ['.js'],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.(js)$/,
        use: 'babel-loader',
        include: path.resolve('.'),
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10,
              name: '[path][name].[ext]?[hash:5]',
              publicPath: '/',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
            },
          },
        ],
        include: path.resolve('src/image'),
        exclude: path.resolve('./node_modules'),
      },
      {
        test: /\.(mp3|wav)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash:8]',
              publicPath: '/',
            },
          },
        ],
      },
      // Shaders
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      chunks: ['vendor', 'index'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '../static',
          to: './static',
        },
      ],
    }),
    new OptimizeCssAssetsPlugin(),
    new CleanWebpackPlugin(),
  ],
}
