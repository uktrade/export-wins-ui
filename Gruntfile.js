var loadGruntTasks = require( 'load-grunt-tasks' );

module.exports = function( grunt ){

	loadGruntTasks(grunt);

	grunt.initConfig({

		src: {
			bootstrap: 'bootstrap-sass-3.3.7/assets'
		},

		dest: {
			vendor: 'ui/static/vendor'
		},

		concat: {
		  bootstrap: {
			src: [
				//'<%= src.bootstrap %>/javascripts/bootstrap/transition.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/alert.js',
				'<%= src.bootstrap %>/javascripts/bootstrap/button.js'
				//'<%= src.bootstrap %>/javascripts/bootstrap/carousel.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/collapse.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/dropdown.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/modal.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/tooltip.js'
				//'<%= src.bootstrap %>/javascripts/bootstrap/popover.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/scrollspy.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/tab.js',
				//'<%= src.bootstrap %>/javascripts/bootstrap/affix.js'
			],
			dest: '<%= dest.vendor %>/bootstrap/js/bootstrap.js'
		  }
		},

		uglify: {
			options: {
				compress: {
					warnings: false
				},
				mangle: true,
				preserveComments: /^!|@preserve|@license|@cc_on/i
			},
			bootstrap: {
				src: '<%= concat.bootstrap.dest %>',
				dest: '<%= dest.vendor %>/bootstrap/js/bootstrap.min.js'
			}
		},

		sass: {
			options: {
				sourceMap: true,
				outputStyle: 'compact'
			},
			dist: {
				files: {
					'<%= dest.vendor %>/bootstrap/css/bootstrap.css': '<%= src.bootstrap %>/stylesheets/main.scss'
				}
			}
		}
	});

	grunt.registerTask( 'build', [ 'sass', 'concat', 'uglify' ] );
};