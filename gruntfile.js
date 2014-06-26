module.exports = function (grunt) {

	// See: http://stackoverflow.com/questions/22386905/how-to-access-pkg-version-within-the-process-option-of-grunt-contrib-copy
	var pkg = grunt.file.readJSON('package.json');

	// Project configuration.
	grunt.initConfig({

		pkg: pkg,

		// See options: https://github.com/gruntjs/grunt-contrib-uglify
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) - <%= pkg.email %> */\n',
				compress: {
					//drop_console: true,
					global_defs: {
						"DEBUG": false
					},
					dead_code: true
				},
				sourceMap: true,
				sourceMapName: 'build/<%= pkg.name %>-v<%= pkg.version %>-source.js'
			},
			build: {
				src: [
				'src/moment.min.js',
				'src/mootools-yui-compressed.js',
				'src/mootools-Request.Queue.js',
				// http://pajhome.org.uk/crypt/md5/
				'src/md5-min.js',
				'src/dz.js',
				'src/deezer.js',
				'src/lastFm.js'],
				dest: 'build/<%= pkg.name %>-v<%= pkg.version %>.min.js'
			}
		},

		// See options: https://github.com/gruntjs/grunt-contrib-jshint
		jshint: {
			// define the files to lint
			files: ['gruntfile.js', 'src/deezer.js', 'src/lastFm.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				globals: {
					'DEBUG': true,
					'console': true,
					// Mootools
					'Class': true,
					'Options': true,
					'$': true,
					'$$': true,
					'Events': true,
					'Request': true,
					'Element': true,
					// Third-party globals
					'moment': true,
					'deezer': true,
					'DZ': true,
					'module': true
				},
				undef: true,
				unused: true,
				browser: true
			}
		},

		// See options: https://github.com/gruntjs/grunt-contrib-less
		less: {
			development: {
				files: {
					'build/StyleSheet.css': 'src/StyleSheet.less'
				}
			},
			production: {
				options: {
					cleancss: true
				},
				files: {
					'build/StyleSheet.css': 'src/StyleSheet.less'
				}
			}
		},

		// See options: https://github.com/gruntjs/grunt-contrib-watch
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint'],
			css: {
				files: ['src/*.less'],
				tasks: ['less:development']
			}
		},

		// See options: https://github.com/gruntjs/grunt-contrib-copy
		copy: {
			main: {
				src: 'src/index.html',
				dest: 'build/index.html',
				options: {
					// content, srcpath
					process: function (content) {
						return content.replace(/<%version%>/g, pkg.version);
					}
				}
			}
		},
		
		// See options: https://github.com/gruntjs/grunt-contrib-qunit
		// See: https://github.com/gruntjs/grunt-contrib-qunit/issues/15
		qunit: {
			all: {
			  options: {
				urls: [
				  'http://localhost:8000/test/test.html',
				]
			  }
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-qunit');


	// this would be run by typing "grunt test" on the command line
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['qunit']);
	grunt.registerTask('css', ['less']);

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'uglify', 'less:production', 'copy']);

};