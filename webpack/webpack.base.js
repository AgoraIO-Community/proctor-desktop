const path = require('path');
const webpack = require('webpack');
const webpackbar = require('webpackbar');
const eduCoreVersion = require('agora-edu-core/package.json').version;
const rteVersion = require('agora-rte-sdk/package.json').version;
const { ROOT_PATH, ALIAS } = require('./utils/index');
const { base } = require('./utils/loaders');

const classroomSdkVersion = require('../package.json').version;

module.exports = {
  externals: {
    'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
    'agora-rdc-core': 'commonjs2 agora-rdc-core',
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@proctor': path.resolve(ROOT_PATH, 'src/'),
      'agora-plugin-gallery': path.resolve(ROOT_PATH, '../agora-plugin-gallery/src'),
      'agora-classroom-sdk': path.resolve(ROOT_PATH, '../agora-plugin-gallery/src'),
      ...ALIAS,
    },
  },
  module: {
    unknownContextCritical: false,
    rules: [...base],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpackbar(),
    new webpack.DefinePlugin({
      RTE_SDK_VERSION: JSON.stringify(rteVersion),
      EDU_SDK_VERSION: JSON.stringify(eduCoreVersion),
      CLASSROOM_SDK_VERSION: JSON.stringify(classroomSdkVersion),
      RTE_RUNTIME_PLATFORM: JSON.stringify(process.env.RTE_RUNTIME_PLATFORM),
      BUILD_TIME: JSON.stringify(Date.now()),
      BUILD_COMMIT_ID: JSON.stringify(process.env.FCR_BUILD_COMMIT_ID),
      EDU_CATEGORY: JSON.stringify(process.env.EDU_CATEGORY),
    }),
  ],
  stats: {
    children: true,
  },
};
