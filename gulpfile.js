// gulp serve
//
// npm install gulp --save-dev
// npm install browser-sync --save-dev

const { gulp, watch, series, parallel, src, dest } = require('gulp');
const browserSync = require('browser-sync').create();

/**
 * [serve description]
 */
function serve() {
	// Serve files from the root of this project
	// https://www.browsersync.io/docs/options
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
		browser: "firefox",
        notify: false,
		port: 3003,
        open: "local",
        reloadOnRestart: false
    });
    watch("./dist/demo.js").on('change', browserSync.reload);
    watch("./demo/src/**.*").on('change', browserSync.reload);
    watch("index.html").on('change', browserSync.reload);
};

exports.serve = series(serve);
