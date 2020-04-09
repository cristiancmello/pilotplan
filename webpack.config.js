const path = require("path");
const slsWebpack = require("serverless-webpack");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

// const ASSET_PATH = process.env.ASSET_PATH || "/";

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
    // publicPath: ASSET_PATH,
  },
  // plugins: [
  //   // This makes it possible for us to safely use env vars on our code
  //   new webpack.DefinePlugin({
  //     "process.env.ASSET_PATH": JSON.stringify(ASSET_PATH),
  //   }),
  // ],
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
