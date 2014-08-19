module.exports = function(grunt) {

    // Configuration 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['js/*.js'],
                dest: 'public/js/production.js'
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            build: {
                src: 'public/js/production.js',
                dest: 'public/js/production.min.js'
            }
        },
        jshint: {
            files: ['gruntfile.js', 'js/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // jshintrc: '.jshintrc',
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    app: true
                }
            }
        },
        watch: {
            js: {
                files: [ 'app.js', 'Gruntfile.js', 'index.html', 'package.json'],
                tasks: ['build'],
                options: {
                    livereload: true,
                }
            }
        },
        nodemon: {
          dev: {
            options: {
              file: 'app.js',
              watchedExtensions: ['js', 'html', 'json'],
              ignoreFiles: ['node_modules/**', 'public/**']
            },
            script: 'app.js'
          }
        },
        concurrent: {
          target: {
            tasks: ['build', 'watch', 'nodemon']
          },
          options: {
            logConcurrentOutput: true
          }
        }

    });

    // Plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');


    // this would be run by typing "grunt test" on the command line
    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('start', ['concurrent']);


};