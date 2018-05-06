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
            // Patterns for static files to watch
            "./demo/src/**.*",
            "index.html",
            "./dist/demo.js",
            "./src/knockout-apollo.js"
        ],
        notify: false,
        browser: "google chrome",
        reloadOnRestart: false,
        open: "local",
        online: false
    });

    gulp.watch("./dist/demo.js").on('change', browserSync.reload);
    gulp.watch("./demo/src/**.*").on('change', browserSync.reload);
    gulp.watch("index.html").on('change', browserSync.reload);
});
