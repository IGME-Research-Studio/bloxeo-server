require('babel-core/register');

module.exports = function (grunt) {
  'use strict';

  var testFiles = ['test/unit/**/*.js'];
  var srcFiles = ['api/**/*.js'];
  var jsFiles = srcFiles.concat(testFiles);

  // Set test environment here for cross-platform
  process.env.NODE_ENV='test';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      target: jsFiles.concat(['!**/*.tmp.js']),
    },

    mochaTest: {
      test: {
        src: testFiles,
      },
    },

    watch: {
      js: {
        options: { spawn: false, },
        files: jsFiles,
        tasks: ['default'],
      },
    },
  });

  // Load plugins
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', 'test');
  grunt.registerTask('lint', 'eslint');
  grunt.registerTask('unit-test', 'mochaTest');
  grunt.registerTask('test', ['lint', 'unit-test']);
};
