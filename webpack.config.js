const webpackMerge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const baseConfig = require("agora-common-libs/presets/webpack.config.base.js");
const productionConfig = require("agora-common-libs/presets/webpack.config.pack.js");

const ROOT_PATH = path.resolve(__dirname, "./");

const config = {
  entry: {
    proctor_sdk: "./src/infra/api/index.tsx",
  },
  output: {
    publicPath: "",
    filename: "[name].bundle.js",
    libraryTarget: "umd",
    path: path.resolve(ROOT_PATH, "lib"),
    clean: true,
  },
  resolve: {
    alias: {
      "@proctor": path.resolve(ROOT_PATH, "./src"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify("production"),
    }),
    // new BundleAnalyzerPlugin(),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, productionConfig, config);
module.exports = mergedConfig;
