module.exports = function (grunt) {
  'use strict';

  var testFiles = ['test/**/*.js'],
      srcFiles = ['api/**/*.js'],
      jsFiles = srcFiles.concat(testFiles);

  // Set test environment here for cross-platform
  process.env.NODE_ENV='test';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      target: jsFiles
    },

    mochaTest: {
      // options: {
      //   require: ['sails-hook-babel/node_modules/babel/register']
      // },
      test: {
        src: testFiles
      }
    },

    watch: {
      js: {
        options: { spawn: false, },
        files: jsFiles,
        tasks: ['default']
      }
    },
  });

  // Load plugins
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['lint', 'test']);
  grunt.registerTask('lint', 'eslint');
  grunt.registerTask('test', 'mochaTest');
};
