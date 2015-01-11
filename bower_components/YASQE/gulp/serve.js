var gulp = require('gulp'),
	connect = require('gulp-connect'),
	paths = require('./paths.js'),
	livereload = require('gulp-livereload');

gulp.task('watch', function() {
	gulp.watch(["./src/**/*.js", './lib/*.js'], [ 'browserifyForDebug' ]);
	gulp.watch(paths.style, [ 'makeCss' ]);
	  gulp.watch(
		'./*.html'
	, function(files) {
		gulp.src(files.path).pipe(connect.reload());
	});
});

gulp.task('connect', function() {
	connect.server({
		root: "./",
		port : 4000,
		livereload: true
	});
});