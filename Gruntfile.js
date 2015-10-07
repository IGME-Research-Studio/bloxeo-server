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
      // options: {
      //   require: ['sails-hook-babel/node_modules/babel/register']
      // },
      test: {
        src: testFiles
      }
    },
      
    esdoc : {
      dist : {
        options: {
          source: './api',
          destination: './doc'
        }
      }
    },
      
    'gh-pages': {
      options: {
        base: 'doc'
      },
      src: ['**']
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
  grunt.registerTask('doc', 'esdoc');
  grunt.registerTask('doc-deploy', ['doc', 'gh-pages']);
};
