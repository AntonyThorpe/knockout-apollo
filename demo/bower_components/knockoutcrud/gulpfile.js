// npm install browser-sync gulp --save-dev 
var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('serve', function() {
	browserSync.init({
		server: {
			baseDir: "./",
			browser: "google chrome"
		}
	});
	gulp.watch("index.html").on('change', browserSync.reload);
	gulp.watch("js/*.js").on('change', browserSync.reload);
});