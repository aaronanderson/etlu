const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',

  devtool: "source-map",

  devServer: {
    open: true,
    compress: true,
    contentBase: './dist',
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/graphql': 'http://localhost:5000'
    }
  },

  resolve: {
    modules: ['node_modules', './src'],
    extensions: [".ts", ".tsx", ".js", ".jsx"],

  },

  //watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },

  output: {
    publicPath: '/',
    filename: 'etlu.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      title: "ETL Universe",
      filename: "index.html",
      appMountId: "etlu-container",
      //favicon: "./src/fav.png"
    })],

  module: {
    rules: [

      {
        test: /\.ts(x?)$/,
        include: [path.resolve(__dirname, 'src')],
        loaders: ['ts-loader']
      },


      {
        test: /\.(jpg|png)$/,
        use: {
          loader: "file-loader",

          options: {
            name: "assets/[name].[ext]",
          },
        }
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'raw-loader',
        }, {
          loader: "sass-loader",
          options: {
            sassOptions: {
              includePaths: ['./node_modules']
            }
          }
        }]
      },

      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  },

  //package.json -> "sideEffects": false,
  optimization: {
    //usedExports: true
  },


};
