// gulp serve
// 
// npm install gulp --save-dev
// npm install browser-sync --save-dev

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// Static Server + watching scss/html files
gulp.task('serve', [], function() {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        },
        files: [
            // Patterns for static files to watch.
            // We're watching js and php files within mysite
            // and SilverStripe template files within themes
            "js/**.*",
            "index.html"
        ],
        notify: false,
        browser: "google chrome",
        reloadOnRestart: false
    });

    gulp.watch("./bower_components/knockout-apollo/knockout-apollo.js").on('change', browserSync.reload);
    gulp.watch("./js/**.*").on('change', browserSync.reload);
    gulp.watch("index.html").on('change', browserSync.reload);
});