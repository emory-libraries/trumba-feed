module.exports = function( grunt ) {
  
  var path = require('path');
  
  var pkg = grunt.file.readJSON('package.json');
  
  grunt.initConfig({
    pkg: pkg,
    sass: {
      dev: {
        options: {
          noCache: true,
          sourcemap: 'none',
          update: true,
          style: 'expanded'
        },
        files: [
          {
            expand: true,
            cwd: 'src/scss',
            src: ['*.scss'],
            dest: 'dist/css',
            ext: '.css'
          }
        ]
      },
      dist: {
        options: {
          noCache: true,
          sourcemap: 'none',
          style: 'compressed'
        },
        files: [
          {
            expand: true,
            cwd: 'src/scss',
            src: ['*.scss'],
            dest: 'dist/css',
            ext: '.css'
          }
        ]
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')({ browsers: 'last 2 versions' })
        ]
      },
      files: {
        src: 'dist/css/**/*.css'
      }
    },
    cssmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'dist/css',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css',
            ext: '.min.css'
          }
        ]
      }
    },
    jshint: {
      files: ['src/**/*.js']
    },
    uglify: {
      dist: {
        files: [
          {
            expand: true, 
            cwd: 'dist/js',
            src: ['**/*.js', '!**/*.min.js'],
            dest: 'dist/js',
            ext: '.min.js'
          }
        ]
      }
    },
    copy: {
      html: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: '*.html',
            dest: 'dist/'
          }
        ]
      },
      js: {
        files: [
          {
            expand: true,
            cwd: 'src/js',
            src: '**/*.js',
            dest: 'dist/js'
          }
        ]
      },
      php: {
        files: [
          {
            expand: true,
            cwd: 'src/php',
            src: '**/*.php',
            dest: 'dist/php'
          }
        ]
      }
    },
    clean: {
      css: ['dist/css/**/*.css', '!dist/css/**/*.min.css'],
      js: ['dist/js/**/*.js', '!dist/js/**/*.min.js']
    },
    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: 'livereload',
              replacement: '<script src="//localhost:35729/livereload.js"></script>'
            },
            {
              match: 'css',
              replacement: '<link rel="stylesheet" href="css/style.css">'
            },
            {
              match: 'dependencies',
              replacement: function(){
                return [
                  '<script src="js/dependencies/jquery.min.js"></script>',
                  '<script src="js/dependencies/vue.min.js"></script>',
                  '<script src="js/dependencies/moment.min.js"></script>'
                ].join("\n  ");
              }
            },
            {
              match: 'js',
              replacement: function(){
                return [
                  '<script src="js/index.js"></script>'
                ].join("\n  ");
              }
            }
          ]
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['*.html'],
            dest: 'dist'
          }
        ]
      },
      dist: {
        options: {
          patterns: [
            {
              match: 'livereload',
              replacement: ''
            },
            {
              match: 'css',
              replacement: '<link rel="stylesheet" href="css/style.min.css">'
            },
            {
              match: 'dependencies',
              replacement: function(){
                return [
                  '<script src="js/dependencies/jquery.min.js"></script>',
                  '<script src="js/dependencies/vue.min.js"></script>',
                  '<script src="js/dependencies/moment.min.js"></script>'
                ].join("\n  ");
              }
            },
            {
              match: 'js',
              replacement: function(){
                return [
                  '<script src="js/index.min.js"></script>'
                ].join("\n  ");
              }
            }
          ]
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['*.html'],
            dest: 'dist'
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      startup: {
        options: {
          atBegin: true
        },
        files: [],
        tasks: ['startup']
      },
      scss: {
        files: ['src/scss/**/*.scss'],
        tasks: ['sass', 'postcss']
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['jshint', 'copy:js']
      },
      html: {
        files: ['src/*.html'],
        tasks: ['copy:html', 'replace:dev']
      },
      php: {
        files: ['src/php/**/*.php'],
        tasks: ['copy:php']
      },
      config: {
        files: ['Gruntfile.js', 'package.json'],
        tasks: ['startup'],
        options: {
          reload: true
        }
      }
    },
    copydeps: {
      dependencies: {
        pkg: 'package.json',
        dest: 'dist/js/dependencies/'
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-copy-deps');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-replace');
  
  grunt.registerTask('default', ['dev']);
  grunt.registerTask('dev',[
    'startup',
    'watch'
  ]);
  grunt.registerTask('dist', [
    'sass:dist',
    'postcss',
    'copy',
    'copydeps',
    'cssmin',
    'uglify',
    'clean',
    'replace:dist'
  ]);
  grunt.registerTask('startup', [
    'sass:dev',
    'postcss',
    'copy',
    'copydeps',
    'replace:dev'
  ]);
  
};