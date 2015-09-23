module.exports = function (grunt) {
  'use strict';

  var testFiles = ['test/**/*.js'],
      srcFiles = ['api/**/*.js'],
      jsFiles = srcFiles.concat(testFiles);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      target: jsFiles
    },

    mochaTest: {
      test: {
        src: testFiles
      }
    },
      
    jsdoc : {
        basic : {
            src: [srcFiles, './*.js'],
            options: {
                destination: 'doc'
            }
        }
    }
  });

  // Load plugins
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['eslint', 'mochaTest']);
  grunt.registerTask('doc', ['jsdoc:basic']);
};
