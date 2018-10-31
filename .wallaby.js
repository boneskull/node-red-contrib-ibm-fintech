'use strict';

module.exports = wallaby => {
  require('dotenv').config();

  return {
    files: ['src/**/*.js', 'test/setup.js'],

    tests: ['test/**/*.spec.js'],

    compilers: {'**/*.js': wallaby.compilers.babel()},

    env: {type: 'node', runner: 'node'},

    setup() {
      require('./test/setup');
    }
  };
};
