const path = require('path');
const fs = require('fs');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

function configureWebpack(mode) {
  mode = mode || 'development';
  if (mode === 'testing') {
    mode = 'production';
  }
  const buildDir = process.env.BUILD_DIR || 'build';

  const base =  {
    entry: {
      app: './src/index.js'
    },
    mode,
    optimization: {
      minimizer: [
        new UglifyJSPlugin(),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /fonts\/.*\.(woff2?|ttf|eot|svg)$/,
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        },
        {
          test: /\.html$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        },
        {
          test: /images\/.*\.(jpg|png|gif|svg|ico)$/,
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]'
          }
        },
        {
          test: /src\/app\.scss$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.(css|scss)$/,
          include: /src\/presentation/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: mode === 'production' ?
                  '[hash:base64]' : '[path][name]-[local]-[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].bundle.css',
        chunkFilename: '[id].css'
      })
    ],
    output: {
      path: path.join(__dirname, buildDir),
      filename: '[name].bundle.js'
    }
  };
  if (mode === 'production') {
    fs.mkdirSync(path.join(__dirname, buildDir));
    return Object.assign({}, base, {

    });
  } else {
    return Object.assign({}, base, {
      devServer: {
        contentBase: './src',
        inline: true,
        host: '0.0.0.0',
        port: 8080,
        disableHostCheck: true,
        historyApiFallback: true,
        proxy: {
          '/api': {
            target: 'http://localhost:8081'
          }
        },
        stats: {
          version: false,
          hash: false,
          chunkModules: false
        }
      },
      devtool: 'source-map'
    });
  }
}
module.exports = configureWebpack(process.env.NODE_ENV);
