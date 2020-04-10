const path = require("path");
const slsWebpack = require("serverless-webpack");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: slsWebpack.lib.entries,
  mode: slsWebpack.lib.webpack.isLocal ? "development" : "production",
  target: "node",
  devtool: "source-map",
  externals: [nodeExternals()],
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/cdkBuilder', to: 'src/cdkBuilder' }
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: __dirname,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};
