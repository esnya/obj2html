const defaultsDeep = require('lodash/defaultsDeep');
const rootConfig = require('../.eslintrc');

module.exports = defaultsDeep({
  env: {
    mocha: true,
  },
  rules: {
    'no-unused-expressions': 'off',
  }
}, rootConfig);
